import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import { config, hasStripeConfig } from "./config.js";
import { isDatabaseReady } from "./db/connect.js";
import { slides, getSlideByIndex } from "./data/slides.js";
import { GameSession } from "./models/GameSession.js";
import {
  generateUniqueAccessKey,
  generateUniquePickupCode,
  isSessionExpired,
  normalizeAnswer,
} from "./utils/security.js";
import { sendAccessEmail } from "./services/emailService.js";
import { createQrCodeDataUrl } from "./services/qrService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stripe = hasStripeConfig ? new Stripe(config.stripeSecretKey) : null;
const app = express();

const answerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many answers submitted. Please wait a moment and try again.",
  },
});

app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  }),
);

app.get("/health", (_request, response) => {
  response.json({
    ok: true,
    database: isDatabaseReady() ? "connected" : "disconnected",
    stripe: hasStripeConfig ? "configured" : "missing-config",
  });
});

app.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    if (!stripe || !config.stripeWebhookSecret) {
      return response.status(500).json({ message: "Stripe webhook is not configured." });
    }

    try {
      const signature = request.headers["stripe-signature"];
      const event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        config.stripeWebhookSecret,
      );

      if (event.type === "checkout.session.completed") {
        const checkoutSession = event.data.object;
        const existingSession = await GameSession.findOne({
          stripe_checkout_session_id: checkoutSession.id,
        });

        if (!existingSession) {
          const accessKey = await generateUniqueAccessKey();
          const createdAt = new Date();
          const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
          const email =
            checkoutSession.customer_details?.email ||
            checkoutSession.customer_email ||
            checkoutSession.metadata?.email;

          if (!email) {
            throw new Error("Checkout session completed without an email address.");
          }

          const session = await GameSession.create({
            email,
            access_key: accessKey,
            current_slide: 0,
            completed_slides: [],
            is_completed: false,
            pickup_code: null,
            pickup_used: false,
            stripe_checkout_session_id: checkoutSession.id,
            hunt_name: checkoutSession.metadata?.huntName || config.huntName,
            expires_at: expiresAt,
          });

          const accessLink = `${config.frontendPlayUrl}?key=${session.access_key}`;
          await sendAccessEmail({
            email,
            accessLink,
            expiresAt,
            huntName: session.hunt_name,
          });
        }
      }

      return response.json({ received: true });
    } catch (error) {
      console.error("Stripe webhook error:", error);
      return response.status(400).send(`Webhook Error: ${error.message}`);
    }
  },
);

app.use(express.json());
app.use("/staff", express.static(path.join(__dirname, "public")));

app.get("/redeem", (_request, response) => {
  response.sendFile(path.join(__dirname, "public", "redeem.html"));
});

app.post("/create-checkout-session", async (request, response) => {
  if (!stripe) {
    return response.status(500).json({ message: "Stripe is not configured yet." });
  }

  const email = String(request.body.email || "").trim().toLowerCase();
  if (!email) {
    return response.status(400).json({ message: "Email is required." });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      success_url: `${config.frontendBaseUrl}?checkout=success`,
      cancel_url: `${config.frontendBaseUrl}?checkout=cancelled`,
      line_items: [
        {
          price_data: {
            currency: config.stripeCurrency,
            product_data: {
              name: config.huntName,
              description: "Self-guided city puzzle hunt with a real souvenir reward.",
            },
            unit_amount: config.huntPriceCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        email,
        huntName: config.huntName,
      },
    });

    return response.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe checkout session error:", error);
    return response.status(500).json({ message: "Unable to create checkout session." });
  }
});

app.post("/resume", async (request, response) => {
  const accessKey = String(request.body.accessKey || "").trim();
  if (!accessKey) {
    return response.status(400).json({ message: "Access key is required." });
  }

  const session = await GameSession.findOne({ access_key: accessKey });
  if (!session) {
    return response.status(404).json({ message: "Game session not found." });
  }

  if (isSessionExpired(session)) {
    return response.status(410).json({ message: "This session has expired." });
  }

  return response.json(await buildSessionPayload(session));
});

app.post("/answer", answerLimiter, async (request, response) => {
  const accessKey = String(request.body.accessKey || "").trim();
  const answer = normalizeAnswer(request.body.answer);

  if (!accessKey || !answer) {
    return response.status(400).json({ message: "Access key and answer are required." });
  }

  const session = await GameSession.findOne({ access_key: accessKey });
  if (!session) {
    return response.status(404).json({ message: "Game session not found." });
  }

  if (isSessionExpired(session)) {
    return response.status(410).json({ message: "This session has expired." });
  }

  if (session.is_completed) {
    return response.status(400).json({ message: "This game session is already completed." });
  }

  const slide = getSlideByIndex(session.current_slide);
  if (!slide) {
    return response.status(500).json({ message: "Current slide is missing." });
  }

  const isCorrect = slide.answers.some(
    (acceptedAnswer) => normalizeAnswer(acceptedAnswer) === answer,
  );

  if (!isCorrect) {
    return response.status(400).json({ message: "Incorrect answer. Try again." });
  }

  const completedSlides = Array.from(new Set([...session.completed_slides, slide.index])).sort(
    (a, b) => a - b,
  );

  if (slide.index === slides.length - 1) {
    const pickupCode = await generateUniquePickupCode();
    const redeemUrl = `${config.publicBaseUrl}/redeem?code=${pickupCode}`;
    const qrCodeDataUrl = await createQrCodeDataUrl(redeemUrl);

    session.completed_slides = completedSlides;
    session.current_slide = slide.index;
    session.is_completed = true;
    session.pickup_code = pickupCode;
    session.pickup_qr_data_url = qrCodeDataUrl;
    await session.save();

    return response.json({
      message: "Correct answer. Hunt completed.",
      ...await buildSessionPayload(session),
    });
  }

  session.completed_slides = completedSlides;
  session.current_slide = slide.index + 1;
  await session.save();

  return response.json({
    message: "Correct answer. Next slide unlocked.",
    ...await buildSessionPayload(session),
  });
});

app.get("/slide/:index", (request, response) => {
  const index = Number.parseInt(request.params.index, 10);
  const slide = getSlideByIndex(index);

  if (!Number.isFinite(index) || !slide) {
    return response.status(404).json({ message: "Slide not found." });
  }

  return response.json({
    slide: serializeSlide(slide),
  });
});

app.get("/redeem-status", async (request, response) => {
  const code = String(request.query.code || "").trim();
  if (!code) {
    return response.status(400).json({ status: "invalid", message: "Pickup code is required." });
  }

  const session = await GameSession.findOne({ pickup_code: code });
  if (!session) {
    return response.status(404).json({ status: "invalid", message: "Pickup code not found." });
  }

  if (isSessionExpired(session)) {
    return response.json({ status: "expired", message: "This pickup code has expired." });
  }

  if (!session.is_completed) {
    return response.json({
      status: "not-completed",
      message: "The game has not been completed yet.",
    });
  }

  if (session.pickup_used) {
    return response.json({ status: "used", message: "This pickup has already been redeemed." });
  }

  return response.json({ status: "valid", message: "This pickup is ready to confirm." });
});

app.post("/redeem", async (request, response) => {
  const code = String(request.body.code || "").trim();
  const staffPin = String(request.body.staff_pin || "").trim();

  if (!code || !staffPin) {
    return response.status(400).json({ message: "Code and staff PIN are required." });
  }

  if (staffPin !== config.staffPin) {
    return response.status(401).json({ message: "Invalid staff PIN." });
  }

  const session = await GameSession.findOne({ pickup_code: code });
  if (!session) {
    return response.status(404).json({ message: "Pickup code not found." });
  }

  if (isSessionExpired(session)) {
    return response.status(410).json({ message: "This session has expired." });
  }

  if (!session.is_completed) {
    return response.status(400).json({ message: "The game is not completed yet." });
  }

  if (session.pickup_used) {
    return response.status(409).json({ message: "This pickup has already been redeemed." });
  }

  const redeemedSession = await GameSession.findOneAndUpdate(
    {
      _id: session._id,
      pickup_used: false,
    },
    {
      pickup_used: true,
      redeemed_at: new Date(),
    },
    {
      new: true,
    },
  );

  if (!redeemedSession) {
    return response.status(409).json({ message: "This pickup has already been redeemed." });
  }

  console.log(
    `[redeem] pickup confirmed for ${redeemedSession.email} at ${redeemedSession.redeemed_at?.toISOString()}`,
  );

  return response.json({
    success: true,
    message: "Pickup confirmed successfully.",
  });
});

setInterval(async () => {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const result = await GameSession.deleteMany({
    expires_at: { $lt: cutoff },
  });

  if (result.deletedCount > 0) {
    console.log(`Cleaned up ${result.deletedCount} expired game sessions.`);
  }
}, 60 * 60 * 1000);

function serializeSlide(slide) {
  return {
    index: slide.index,
    title: slide.title,
    story: slide.story,
    riddle: slide.riddle,
    hint: slide.hint,
  };
}

async function buildSessionPayload(session) {
  let qrCodeDataUrl = session.pickup_qr_data_url;

  if (session.is_completed && session.pickup_code && !qrCodeDataUrl) {
    const redeemUrl = `${config.publicBaseUrl}/redeem?code=${session.pickup_code}`;
    qrCodeDataUrl = await createQrCodeDataUrl(redeemUrl);
    session.pickup_qr_data_url = qrCodeDataUrl;
    await session.save();
  }

  return {
    session: {
      email: session.email,
      access_key: session.access_key,
      current_slide: session.current_slide,
      completed_slides: session.completed_slides,
      is_completed: session.is_completed,
      pickup_code: session.pickup_code,
      pickup_used: session.pickup_used,
      created_at: session.created_at,
      expires_at: session.expires_at,
      hunt_name: session.hunt_name,
      qr_code_data_url: qrCodeDataUrl,
    },
    slide: getSlideByIndex(session.current_slide)
      ? serializeSlide(getSlideByIndex(session.current_slide))
      : null,
    totalSlides: slides.length,
    previousSlides: session.completed_slides,
  };
}

export default app;
