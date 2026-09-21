import { PrismaClient } from "@prisma/client";
import { isProduction } from "../config/env.js";

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

export const prisma =
  globalThis.__prisma__ ??
  new PrismaClient({
    log: isProduction ? ["error", "warn"] : ["query", "error", "warn"],
  });

if (!isProduction) {
  globalThis.__prisma__ = prisma;
}
