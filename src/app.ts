import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { pinoHttp } from "pino-http";
import swaggerUi from "swagger-ui-express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "js-yaml";
import { env } from "./config/env.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { contentRouter } from "./modules/content/content.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(
    pinoHttp({
      autoLogging: env.NODE_ENV !== "test",
      redact: ["req.headers.authorization"],
    }),
  );
  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      limit: env.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
  });

  const openapiPath = path.join(__dirname, "..", "docs", "openapi.yaml");
  if (fs.existsSync(openapiPath)) {
    const openapiDocument = YAML.load(fs.readFileSync(openapiPath, "utf8")) as Record<string, unknown>;
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDocument));
  }

  app.use("/api/auth", authRouter);
  app.use("/api/content", contentRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
