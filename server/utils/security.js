import crypto from "crypto";
import { GameSession } from "../models/GameSession.js";

export function generateRandomToken(bytes = 24) {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function normalizeAnswer(answer) {
  return String(answer || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function isSessionExpired(session) {
  return new Date(session.expires_at).getTime() <= Date.now();
}

export async function generateUniqueAccessKey() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const accessKey = generateRandomToken(24);
    const existing = await GameSession.exists({ access_key: accessKey });
    if (!existing) return accessKey;
  }

  throw new Error("Unable to generate a unique access key.");
}

export async function generateUniquePickupCode() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const pickupCode = `PK-${generateRandomToken(8).toUpperCase()}`;
    const existing = await GameSession.exists({ pickup_code: pickupCode });
    if (!existing) return pickupCode;
  }

  throw new Error("Unable to generate a unique pickup code.");
}
