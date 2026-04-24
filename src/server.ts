import "dotenv/config";
import http from "http";
import { loadEnv } from "@config/env";
import { LoggerService } from "@common/logger.service";
import { createMongoConnection } from "@db/mongo";
import { buildApp } from "./app";

async function main() {
  const env = loadEnv();
  const logger = new LoggerService("server", env.LOG_LEVEL);

  const mongo = await createMongoConnection(env.MONGO_URI, env.DB_NAME);
  logger.info(`Connected to MongoDB: ${env.DB_NAME}`);

  const router = buildApp({ db: mongo.db, env, logger });

  const server = http.createServer((req, res) => {
    router.handleRequest(req, res).catch((err) => {
      logger.error(err);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: { message: "Internal Server Error" } }));
      }
    });
  });

  server.listen(env.PORT, () => {
    logger.info(`Server listening on http://localhost:${env.PORT}`);
  });

  async function shutdown(signal: string) {
    logger.info(`${signal} received — shutting down`);
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve()))
    );
    await mongo.close();
    logger.info("Shutdown complete");
    process.exit(0);
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
