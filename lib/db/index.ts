import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

// Lazy initialization keeps `next build` from crashing when DATABASE_URL is not
// yet set (e.g. first deploy before Marketplace provisioning). Do NOT wrap the
// client in a Proxy — Auth.js/adapters inspect the object and a Proxy breaks it.
function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set.");
  }

  return drizzle(neon(url), { schema });
}

let db: ReturnType<typeof createDb> | null = null;

export function getDb() {
  if (!db) {
    db = createDb();
  }

  return db;
}
