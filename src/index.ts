import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./db/prisma.js";

const app = createApp();

const publicUrl = process.env.RENDER_EXTERNAL_URL ?? `http://localhost:${env.PORT}`;

const server = app.listen(env.PORT, () => {
  console.log(`🚀 API listening on port ${env.PORT} (${env.NODE_ENV})`);
  console.log(`📚 API docs available at ${publicUrl}/docs`);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`\nReceived ${signal}, shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
