import { z } from "zod";
import { eq, like, and, sql, or } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

export const userRouter = createRouter({
  updateProfile: authedQuery
    .input(
      z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phone: z.string().optional(),
        city: z.string().optional(),
        resumeUrl: z.string().url().optional(),
        skills: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [user] = await db
        .update(schema.users)
        .set({
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          city: input.city,
          resumeUrl: input.resumeUrl,
          skills: input.skills,
        })
        .where(eq(schema.users.id, ctx.user.id))
        .returning();
      return user;
    }),

  searchCandidates: authedQuery
    .input(
      z.object({
        search: z.string().optional(),
        city: z.string().optional(),
        skills: z.array(z.string()).optional(),
        page: z.number().default(1),
        limit: z.number().default(12),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const offset = (input.page - 1) * input.limit;
      const conditions = [eq(schema.users.role, "seeker")];

      if (input.search) {
        conditions.push(
          or(
            like(schema.users.firstName, `%${input.search}%`),
            like(schema.users.lastName, `%${input.search}%`),
            like(schema.users.email, `%${input.search}%`)
          ) as any
        );
      }

      if (input.city) {
        conditions.push(like(schema.users.city, `%${input.city}%`));
      }

      const where = conditions.length > 1 ? and(...(conditions as any)) : conditions[0];

      const [candidates, countResult] = await Promise.all([
        db
          .select({
            id: schema.users.id,
            firstName: schema.users.firstName,
            lastName: schema.users.lastName,
            email: schema.users.email,
            phone: schema.users.phone,
            city: schema.users.city,
            skills: schema.users.skills,
            resumeUrl: schema.users.resumeUrl,
            createdAt: schema.users.createdAt,
          })
          .from(schema.users)
          .where(where)
          .orderBy(schema.users.createdAt)
          .limit(input.limit)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(schema.users)
          .where(where),
      ]);

      // Filter by skills if provided
      let filtered = candidates;
      if (input.skills && input.skills.length > 0) {
        filtered = candidates.filter((c) => {
          const userSkills = (c.skills as string[]) || [];
          return input.skills?.some((skill) =>
            userSkills.some((s) => s.toLowerCase().includes(skill.toLowerCase()))
          );
        });
      }

      const total = countResult[0]?.count ?? 0;
      return {
        candidates: filtered,
        total,
        totalPages: Math.ceil(total / input.limit),
        currentPage: input.page,
      };
    }),

  downloadResume: authedQuery
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [user] = await db
        .select({ resumeUrl: schema.users.resumeUrl })
        .from(schema.users)
        .where(eq(schema.users.id, input.userId))
        .limit(1);

      if (!user || !user.resumeUrl) {
        throw new Error("Resume not found");
      }

      return user.resumeUrl;
    }),
});
