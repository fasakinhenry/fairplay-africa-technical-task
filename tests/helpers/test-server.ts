import type { Server } from "node:http";
import { randomUUID } from "node:crypto";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/db/prisma.js";

export interface TestServer {
  baseUrl: string;
  close: () => Promise<void>;
}

/**
 * Boots the real Express app on an ephemeral port so tests exercise the
 * actual HTTP layer (middleware, validation, routing) via plain `fetch`.
 */
export function startTestServer(): Promise<TestServer> {
  return new Promise((resolve) => {
    const app = createApp();
    const server: Server = app.listen(0, () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      resolve({
        baseUrl: `http://127.0.0.1:${port}`,
        close: () => new Promise((res) => server.close(() => res())),
      });
    });
  });
}

export async function resetDatabase(): Promise<void> {
  await prisma.content.deleteMany();
  await prisma.user.deleteMany();
}

export function uniqueEmail(prefix = "user"): string {
  return `${prefix}-${randomUUID()}@example.com`;
}
