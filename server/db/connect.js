import mongoose from "mongoose";
import { config } from "../config.js";

let databaseReady = false;

export async function connectDatabase() {
  console.log("Connecting to MongoDB...");

  await mongoose.connect(config.mongodbUri, {
    serverSelectionTimeoutMS: 10000,
  });

  databaseReady = true;
  console.log("Connected to MongoDB.");
}

export function isDatabaseReady() {
  return databaseReady && mongoose.connection.readyState === 1;
}
