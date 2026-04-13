import app from "./app.js";
import { config } from "./config.js";
import { connectDatabase } from "./db/connect.js";

async function start() {
  try {
    await connectDatabase();
    app.listen(config.port, () => {
      console.log(`Server listening on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
    process.exit(1);
  }
}

start();
