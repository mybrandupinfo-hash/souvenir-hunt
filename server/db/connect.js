import mongoose from "mongoose";
import { config } from "../config.js";

export async function connectDatabase() {
  await mongoose.connect(config.mongodbUri);
  console.log(`Connected to MongoDB at ${config.mongodbUri}`);
}
