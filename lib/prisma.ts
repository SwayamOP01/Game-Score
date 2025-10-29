import { PrismaClient, Prisma } from "@prisma/client";

// Define a custom type for PrismaClient that includes the event listener
type PrismaClientWithEvents = PrismaClient<
  Prisma.PrismaClientOptions,
  "query" | "info" | "warn" | "error"
>;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClientWithEvents | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: [
    { level: "query", emit: "event" },
    { level: "info", emit: "event" },
    { level: "warn", emit: "event" },
    { level: "error", emit: "event" },
  ],
}) as PrismaClientWithEvents;

// Optional detailed query timing in development
if (process.env.NODE_ENV !== "production") {
  type QueryEvent = { query: string; params: string; duration: number };
  prisma.$on("query", (e: QueryEvent) => {
    console.log(`[prisma] ${e.query} params=${e.params} duration=${e.duration}ms`);
  });
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;