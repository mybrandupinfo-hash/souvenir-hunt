import dotenv from "dotenv";

dotenv.config();

const toBoolean = (value, fallback = false) => {
  if (value === undefined) return fallback;
  return String(value).toLowerCase() === "true";
};

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const config = {
  port: toNumber(process.env.PORT, 4000),
  mongodbUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/souvenir-hunt",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  stripeCurrency: process.env.STRIPE_CURRENCY || "eur",
  huntName: process.env.HUNT_NAME || "The Emperor's Secret",
  huntPriceCents: toNumber(process.env.HUNT_PRICE_CENTS, 3900),
  frontendBaseUrl: process.env.FRONTEND_BASE_URL || "http://localhost:5173",
  frontendPlayUrl: process.env.FRONTEND_PLAY_URL || "http://localhost:5173/play",
  publicBaseUrl: process.env.PUBLIC_BASE_URL || "http://localhost:4000",
  staffPin: process.env.STAFF_PIN || "1234",
  emailFrom: process.env.EMAIL_FROM || "Souvenir Hunt <no-reply@souvenirhunt.com>",
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: toNumber(process.env.SMTP_PORT, 587),
  smtpSecure: toBoolean(process.env.SMTP_SECURE, false),
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
};

export const hasStripeConfig = Boolean(config.stripeSecretKey && config.stripeWebhookSecret);
export const hasSmtpConfig = Boolean(config.smtpHost && config.smtpUser && config.smtpPass);
