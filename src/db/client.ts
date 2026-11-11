import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const createPrismaClient = (): PrismaClient => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set (see .env.example)");
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
};

// Next.js re-evaluates modules on every hot reload in development, which
// would open a new connection pool each time. Keep one client on globalThis.
const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export { prisma };
