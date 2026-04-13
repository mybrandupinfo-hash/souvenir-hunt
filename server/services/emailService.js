import nodemailer from "nodemailer";
import { config, hasSmtpConfig } from "../config.js";

function createTransporter() {
  if (hasSmtpConfig) {
    return nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });
  }

  return nodemailer.createTransport({
    jsonTransport: true,
  });
}

const transporter = createTransporter();

export async function sendAccessEmail({ email, accessLink, expiresAt, huntName }) {
  const expiresText = new Date(expiresAt).toLocaleString();

  const info = await transporter.sendMail({
    from: config.emailFrom,
    to: email,
    subject: `${huntName} | Your access link`,
    text: [
      `Thanks for your payment for ${huntName}.`,
      "",
      `Your access link: ${accessLink}`,
      `This link expires on: ${expiresText}`,
      "",
      "If you pause the game, you can use the same link to resume later.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h2 style="margin-bottom: 8px;">Your Souvenir Hunt access link</h2>
        <p>Thanks for your payment for <strong>${huntName}</strong>.</p>
        <p>
          <a href="${accessLink}" style="display: inline-block; padding: 12px 20px; border-radius: 9999px; background: #0a6cff; color: white; text-decoration: none; font-weight: 600;">
            Start your hunt
          </a>
        </p>
        <p>This link expires on <strong>${expiresText}</strong>.</p>
        <p>If you pause the game, you can use the same link to resume later.</p>
      </div>
    `,
  });

  if (!hasSmtpConfig) {
    console.log("Email preview:", info.message);
  }

  return info;
}
