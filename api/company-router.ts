import { z } from "zod";
import { eq, desc, and, like, sql } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

export const companyRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        industry: z.string().optional(),
        location: z.string().optional(),
        search: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(12),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { page, limit, industry, location, search } = input;
      const offset = (page - 1) * limit;

      const conditions = [eq(schema.companies.status, "approved")];

      if (industry) {
        conditions.push(eq(schema.companies.industry, industry));
      }
      if (location) {
        conditions.push(like(schema.companies.city, `%${location}%`));
      }
      if (search) {
        conditions.push(like(schema.companies.name, `%${search}%`));
      }

      const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

      const [companies, countResult] = await Promise.all([
        db.select()
          .from(schema.companies)
          .where(whereClause)
          .orderBy(desc(schema.companies.createdAt))
          .limit(limit)
          .offset(offset),
        db.select({ count: sql<number>`count(*)` })
          .from(schema.companies)
          .where(whereClause),
      ]);

      const companiesWithJobs = await Promise.all(
        companies.map(async (comp) => {
          const [count] = await db
            .select({ count: sql<number>`count(*)` })
            .from(schema.jobs)
            .where(and(eq(schema.jobs.companyId, comp.id), eq(schema.jobs.status, "active")));
          return { ...comp, jobCount: count.count };
        })
      );

      const total = countResult[0]?.count ?? 0;

      return {
        companies: companiesWithJobs,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [company] = await db
        .select()
        .from(schema.companies)
        .where(eq(schema.companies.id, input.id))
        .limit(1);

      if (!company) return null;

      const [jobCount, activeJobs] = await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(schema.jobs).where(eq(schema.jobs.companyId, input.id)),
        db.select()
          .from(schema.jobs)
          .where(and(eq(schema.jobs.companyId, input.id), eq(schema.jobs.status, "active")))
          .orderBy(desc(schema.jobs.createdAt))
          .limit(10),
      ]);

      return {
        ...company,
        totalJobs: jobCount[0]?.count ?? 0,
        activeJobs,
      };
    }),

  featured: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(schema.companies)
      .where(and(eq(schema.companies.isFeatured, true), eq(schema.companies.status, "approved")))
      .orderBy(desc(schema.companies.createdAt))
      .limit(12);
  }),

  register: authedQuery
    .input(
      z.object({
        name: z.string().min(2),
        description: z.string().optional(),
        website: z.string().url().optional(),
        industry: z.string().optional(),
        city: z.string().optional(),
        size: z.enum(["1-10", "11-50", "51-200", "201-1000", "1000+"]).optional(),
        contactName: z.string().optional(),
        contactEmail: z.string().email().optional(),
        contactPhone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const slug = `${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 100)}-${Date.now()}`;

      const [company] = await db.insert(schema.companies).values({
        ...input,
        userId: ctx.user.id,
        slug,
        status: "pending",
      }).returning();

      await db.update(schema.users)
        .set({ role: "company" })
        .where(eq(schema.users.id, ctx.user.id));

      return company;
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        website: z.string().optional(),
        industry: z.string().optional(),
        city: z.string().optional(),
        size: z.enum(["1-10", "11-50", "51-200", "201-1000", "1000+"]).optional(),
        logoUrl: z.string().optional(),
        coverUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;

      if (ctx.user.role !== "admin") {
        const [company] = await db
          .select()
          .from(schema.companies)
          .where(eq(schema.companies.id, id))
          .limit(1);
        if (!company || company.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }
      }

      await db.update(schema.companies).set(data).where(eq(schema.companies.id, id));
      return { success: true };
    }),

  approve: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(schema.companies)
        .set({ status: "approved" })
        .where(eq(schema.companies.id, input.id));

      const [company] = await db
        .select()
        .from(schema.companies)
        .where(eq(schema.companies.id, input.id))
        .limit(1);

      if (company?.userId) {
        await db
          .update(schema.users)
          .set({ role: "company" })
          .where(eq(schema.users.id, company.userId));
      }

      return { success: true };
    }),

  reject: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(schema.companies)
        .set({ status: "rejected" })
        .where(eq(schema.companies.id, input.id));
      return { success: true };
    }),

  pending: adminQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(schema.companies)
      .where(eq(schema.companies.status, "pending"))
      .orderBy(desc(schema.companies.createdAt));
  }),

  myCompany: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const [company] = await db
      .select()
      .from(schema.companies)
      .where(eq(schema.companies.userId, ctx.user.id))
      .limit(1);
    return company ?? null;
  }),
});
