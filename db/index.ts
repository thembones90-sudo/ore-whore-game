import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

// `cloudflare:workers`'s ambient `Env` is empty by default; this project's
// binding shape lives on `worker/index.ts`'s local `Env` interface instead.
// This file is example/scaffolding (not wired into worker/index.ts) so we
// narrow locally rather than touch the shared ambient type.
const workerEnv = env as unknown as { DB?: D1Database };

export function getDb() {
  if (!workerEnv.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or let your control plane inject the real binding values before using the database."
    );
  }

  return drizzle(workerEnv.DB, { schema });
}
