import { defineConfig } from "drizzle-kit";
import "./env";
import { must } from "./src/shared/util/must";

const pgURL = must(process.env.PG_URL, "PG_URL is required");

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: pgURL,
  },
});
