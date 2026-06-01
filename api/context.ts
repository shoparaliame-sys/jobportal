import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { authenticateRequest } from "./kimi/auth";
import { verifyToken } from "./local-auth-router";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { eq } from "drizzle-orm";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };
  try {
    // Try Kimi OAuth first
    ctx.user = await authenticateRequest(opts.req.headers);
  } catch {
    // Try local auth token
    try {
      const localAuthToken = opts.req.headers.get("x-local-auth-token");
      if (localAuthToken) {
        const payload = await verifyToken(localAuthToken);
        if (payload) {
          const db = getDb();
          const [user] = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.id, payload.userId))
            .limit(1);
          if (user) {
            ctx.user = user;
          }
        }
      }
    } catch {
      // Authentication is optional here
    }
  }
  return ctx;
}
