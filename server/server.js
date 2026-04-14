import app from "./app.js";
import { config } from "./config.js";
import { connectDatabase } from "./db/connect.js";

async function start() {
  app.listen(config.port, () => {
    console.log(`Server listening on port ${config.port}`);
  });

  try {
    await connectDatabase();
  } catch (error) {
    console.error("Database connection failed during startup:", error);
  }
}

start();
