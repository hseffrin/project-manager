import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Same files Next.js reads; the first one that defines a variable wins.
config({ path: [".env.local", ".env"], quiet: true });

export default defineConfig({
  // Folder with schema.prisma + models/*.prisma (multi-file schema)
  schema: "src/db",
  migrations: {
    path: "src/db/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
