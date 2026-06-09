import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertUser } from "@db/schema";
import { getDb } from "./connection";
import { env } from "../lib/env";

export async function findUserByUnionId(unionId: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.unionId, unionId))
    .limit(1);
  return rows.at(0);
}

export async function upsertUser(data: { unionId: string; name?: string | null; email?: string | null; avatar?: string | null; lastSignInAt?: Date }) {
  const db = getDb();
  
  const values: InsertUser = {
    unionId: data.unionId,
    name: data.name,
    email: data.email ?? `${data.unionId}@oauth.local`,
    avatar: data.avatar,
    lastSignInAt: data.lastSignInAt ?? new Date(),
    role: env.ownerUnionId && data.unionId === env.ownerUnionId ? "admin" : "seeker",
  };

  const updateSet: Partial<InsertUser> = {
    lastSignInAt: new Date(),
    name: data.name,
    avatar: data.avatar,
  };

  await db
    .insert(schema.users)
    .values(values)
    .onConflictDoUpdate({ target: schema.users.unionId, set: updateSet });
}
