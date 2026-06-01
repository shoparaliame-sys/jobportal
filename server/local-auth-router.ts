import { z } from "zod";
import { eq } from "drizzle-orm";
import { hash, compare } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { env } from "./lib/env";

const JWT_SECRET = new TextEncoder().encode(env.appSecret || "rekrute-local-secret-key-2025");

async function createToken(userId: number, email: string, role: string) {
  return new SignJWT({ userId, email, role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
}

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });
    return payload as { userId: number; email: string; role: string };
  } catch {
    return null;
  }
}

export { verifyToken };

export const localAuthRouter = createRouter({
  register: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        phone: z.string().optional(),
        city: z.string().optional(),
        role: z.enum(["seeker", "company"]).default("seeker"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Check if email exists
      const [existing] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, input.email))
        .limit(1);

      if (existing) {
        throw new Error("Email already registered");
      }

      const passwordHash = await hash(input.password, 10);

      const [result] = await db.insert(schema.users).values({
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        name: `${input.firstName} ${input.lastName}`,
        phone: input.phone,
        city: input.city,
        role: input.role,
      }).returning();

      const userId = result.id;
      const token = await createToken(userId, input.email, input.role);

      return { token, user: { id: userId, email: input.email, name: `${input.firstName} ${input.lastName}`, role: input.role } };
    }),

  login: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, input.email))
        .limit(1);

      if (!user || !user.passwordHash) {
        throw new Error("Invalid email or password");
      }

      const valid = await compare(input.password, user.passwordHash);
      if (!valid) {
        throw new Error("Invalid email or password");
      }

      const token = await createToken(user.id, user.email, user.role);

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name || `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar,
          avatarUrl: user.avatarUrl,
        },
      };
    }),

  me: publicQuery.query(async ({ ctx }) => {
    const authHeader = ctx.req.headers.get("x-local-auth-token");
    if (!authHeader) return null;

    const payload = await verifyToken(authHeader);
    if (!payload) return null;

    const db = getDb();
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, payload.userId))
      .limit(1);

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name || `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      city: user.city,
      resumeUrl: user.resumeUrl,
      skills: user.skills,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }),
});
