import { z } from "zod";
import { eq, and, desc, like, sql, or } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

export const jobRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        categoryId: z.number().optional(),
        location: z.string().optional(),
        jobType: z.string().optional(),
        experienceLevel: z.string().optional(),
        keyword: z.string().optional(),
        sourceType: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(10),
        sort: z.enum(["recent", "popular", "salary"]).default("recent"),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { page, limit, categoryId, location, jobType, experienceLevel, sourceType, keyword, sort } = input;
      const offset = (page - 1) * limit;

      const conditions = [eq(schema.jobs.status, "active")];

      if (categoryId) {
        conditions.push(eq(schema.jobs.categoryId, categoryId));
      }
      if (location) {
        conditions.push(like(schema.jobs.location, `%${location}%`));
      }
      if (jobType) {
        conditions.push(eq(schema.jobs.jobType, jobType as "cdi" | "cdd" | "stage" | "freelance" | "interim"));
      }
      if (experienceLevel) {
        conditions.push(eq(schema.jobs.experienceLevel, experienceLevel as "junior" | "confirme" | "senior" | "expert"));
      }
      if (sourceType) {
        conditions.push(eq(schema.jobs.sourceType, sourceType as "internal" | "rss" | "api"));
      }
      if (keyword) {
        const kw = `%${keyword}%`;
        conditions.push(
          or(
            like(schema.jobs.title, kw),
            like(schema.jobs.description, kw),
            like(schema.jobs.location, kw)
          )!
        );
      }

      const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

      let orderBy = desc(schema.jobs.createdAt);
      if (sort === "popular") {
        orderBy = desc(schema.jobs.viewsCount);
      }

      const [jobs, countResult] = await Promise.all([
        db.select()
          .from(schema.jobs)
          .leftJoin(schema.companies, eq(schema.jobs.companyId, schema.companies.id))
          .leftJoin(schema.categories, eq(schema.jobs.categoryId, schema.categories.id))
          .where(whereClause)
          .orderBy(orderBy)
          .limit(limit)
          .offset(offset),
        db.select({ count: sql<number>`count(*)` })
          .from(schema.jobs)
          .where(whereClause),
      ]);

      const total = countResult[0]?.count ?? 0;

      return {
        jobs: jobs.map((row) => ({
          ...row.jobs,
          company: row.companies,
          category: row.categories,
        })),
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [job] = await db
        .select()
        .from(schema.jobs)
        .leftJoin(schema.companies, eq(schema.jobs.companyId, schema.companies.id))
        .leftJoin(schema.categories, eq(schema.jobs.categoryId, schema.categories.id))
        .where(eq(schema.jobs.id, input.id))
        .limit(1);

      if (!job) return null;

      await db.update(schema.jobs)
        .set({ viewsCount: sql`${schema.jobs.viewsCount} + 1` })
        .where(eq(schema.jobs.id, input.id));

      return {
        ...job.jobs,
        company: job.companies,
        category: job.categories,
      };
    }),

  featured: publicQuery.query(async () => {
    const db = getDb();
    const jobs = await db
      .select()
      .from(schema.jobs)
      .leftJoin(schema.companies, eq(schema.jobs.companyId, schema.companies.id))
      .where(and(eq(schema.jobs.isFeatured, true), eq(schema.jobs.status, "active")))
      .orderBy(desc(schema.jobs.createdAt))
      .limit(6);

    return jobs.map((row) => ({
      ...row.jobs,
      company: row.companies,
    }));
  }),

  recent: publicQuery
    .input(z.object({ limit: z.number().default(6) }))
    .query(async ({ input }) => {
      const db = getDb();
      const jobs = await db
        .select()
        .from(schema.jobs)
        .leftJoin(schema.companies, eq(schema.jobs.companyId, schema.companies.id))
        .where(eq(schema.jobs.status, "active"))
        .orderBy(desc(schema.jobs.createdAt))
        .limit(input.limit);

      return jobs.map((row) => ({
        ...row.jobs,
        company: row.companies,
      }));
    }),

  search: publicQuery
    .input(z.object({ q: z.string(), limit: z.number().default(10) }))
    .query(async ({ input }) => {
      const db = getDb();
      const kw = `%${input.q}%`;
      const jobs = await db
        .select()
        .from(schema.jobs)
        .leftJoin(schema.companies, eq(schema.jobs.companyId, schema.companies.id))
        .where(
          and(
            eq(schema.jobs.status, "active"),
            or(
              like(schema.jobs.title, kw),
              like(schema.jobs.description, kw),
              like(schema.jobs.location, kw)
            )
          )
        )
        .orderBy(desc(schema.jobs.createdAt))
        .limit(input.limit);

      return jobs.map((row) => ({
        ...row.jobs,
        company: row.companies,
      }));
    }),

  similar: publicQuery
    .input(z.object({ jobId: z.number(), limit: z.number().default(3) }))
    .query(async ({ input }) => {
      const db = getDb();
      const [targetJob] = await db
        .select()
        .from(schema.jobs)
        .where(eq(schema.jobs.id, input.jobId))
        .limit(1);

      if (!targetJob || !targetJob.categoryId) return [];

      const jobs = await db
        .select()
        .from(schema.jobs)
        .leftJoin(schema.companies, eq(schema.jobs.companyId, schema.companies.id))
        .where(
          and(
            eq(schema.jobs.status, "active"),
            eq(schema.jobs.categoryId, targetJob.categoryId),
            sql`${schema.jobs.id} != ${input.jobId}`
          )
        )
        .orderBy(desc(schema.jobs.createdAt))
        .limit(input.limit);

      return jobs.map((row) => ({
        ...row.jobs,
        company: row.companies,
      }));
    }),

  myJobs: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    
    const [company] = await db
      .select()
      .from(schema.companies)
      .where(eq(schema.companies.userId, ctx.user.id))
      .limit(1);

    if (!company) return { jobs: [] };

    const jobs = await db
      .select()
      .from(schema.jobs)
      .where(eq(schema.jobs.companyId, company.id))
      .orderBy(desc(schema.jobs.createdAt));

    return { jobs };
  }),

  create: authedQuery
    .input(
      z.object({
        title: z.string().min(3),
        description: z.string().min(10),
        requirements: z.string().optional(),
        location: z.string(),
        jobType: z.enum(["cdi", "cdd", "stage", "freelance", "interim"]),
        experienceLevel: z.enum(["junior", "confirme", "senior", "expert"]).optional(),
        salaryMin: z.number().optional(),
        salaryMax: z.number().optional(),
        categoryId: z.number().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [company] = await db
        .select()
        .from(schema.companies)
        .where(eq(schema.companies.userId, ctx.user.id))
        .limit(1);

      if (!company) {
        throw new Error("Company profile not found");
      }

      const slug = `${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 80)}-${Date.now()}`;

      const [job] = await db.insert(schema.jobs).values({
        ...input,
        slug,
        companyId: company.id,
        sourceType: "internal",
        status: "active",
        publishedAt: new Date(),
      }).returning();

      return job;
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        requirements: z.string().optional(),
        location: z.string().optional(),
        jobType: z.enum(["cdi", "cdd", "stage", "freelance", "interim"]).optional(),
        experienceLevel: z.enum(["junior", "confirme", "senior", "expert"]).optional(),
        salaryMin: z.number().optional(),
        salaryMax: z.number().optional(),
        status: z.enum(["active", "paused", "closed", "draft"]).optional(),
        tags: z.array(z.string()).optional(),
        isFeatured: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;

      const [job] = await db.select().from(schema.jobs).where(eq(schema.jobs.id, id)).limit(1);
      if (!job) throw new Error("Job not found");

      if (ctx.user.role !== "admin") {
        const [company] = await db
          .select()
          .from(schema.companies)
          .where(eq(schema.companies.userId, ctx.user.id))
          .limit(1);
        if (!company || company.id !== job.companyId) {
          throw new Error("Unauthorized");
        }
      }

      await db.update(schema.jobs).set(data).where(eq(schema.jobs.id, id));
      return { success: true };
    }),

  toggleStatus: authedQuery
    .input(z.object({ id: z.number(), status: z.enum(["active", "paused", "closed", "draft"]) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, status } = input;

      if (ctx.user.role !== "admin") {
        const [company] = await db
          .select()
          .from(schema.companies)
          .where(eq(schema.companies.userId, ctx.user.id))
          .limit(1);
        const [job] = await db.select().from(schema.jobs).where(eq(schema.jobs.id, id)).limit(1);
        if (!company || !job || company.id !== job.companyId) {
          throw new Error("Unauthorized");
        }
      }

      await db.update(schema.jobs).set({ status }).where(eq(schema.jobs.id, id));
      return { success: true };
    }),

  stats: publicQuery.query(async () => {
    const db = getDb();
    const [jobsCount, companiesCount, applicationsCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(schema.jobs).where(eq(schema.jobs.status, "active")),
      db.select({ count: sql<number>`count(*)` }).from(schema.companies).where(eq(schema.companies.status, "approved")),
      db.select({ count: sql<number>`count(*)` }).from(schema.applications),
    ]);

    return {
      jobs: jobsCount[0]?.count ?? 0,
      companies: companiesCount[0]?.count ?? 0,
      applications: applicationsCount[0]?.count ?? 0,
      sources: 15,
    };
  }),

  saveJob: authedQuery
    .input(z.object({ jobId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      // Check if already saved
      const [existing] = await db
        .select()
        .from(schema.savedJobs)
        .where(
          and(
            eq(schema.savedJobs.userId, ctx.user.id),
            eq(schema.savedJobs.jobId, input.jobId)
          )
        )
        .limit(1);

      if (existing) {
        throw new Error("Job already saved");
      }

      const [saved] = await db
        .insert(schema.savedJobs)
        .values({
          userId: ctx.user.id,
          jobId: input.jobId,
        })
        .returning();

      return saved;
    }),

  unsaveJob: authedQuery
    .input(z.object({ jobId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .delete(schema.savedJobs)
        .where(
          and(
            eq(schema.savedJobs.userId, ctx.user.id),
            eq(schema.savedJobs.jobId, input.jobId)
          )
        );

      return { success: true };
    }),

  isSaved: authedQuery
    .input(z.object({ jobId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const [savedJob] = await db
        .select({ id: schema.savedJobs.id })
        .from(schema.savedJobs)
        .where(
          and(
            eq(schema.savedJobs.userId, ctx.user.id),
            eq(schema.savedJobs.jobId, input.jobId)
          )
        )
        .limit(1);

      return { isSaved: !!savedJob };
    }),

  savedJobs: authedQuery
    .input(z.object({ page: z.number().default(1), limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const offset = (input.page - 1) * input.limit;

      const [savedJobs, countResult] = await Promise.all([
        db
          .select({
            id: schema.jobs.id,
            title: schema.jobs.title,
            description: schema.jobs.description,
            location: schema.jobs.location,
            jobType: schema.jobs.jobType,
            experienceLevel: schema.jobs.experienceLevel,
            sourceType: schema.jobs.sourceType,
            sourceUrl: schema.jobs.sourceUrl,
            salaryMin: schema.jobs.salaryMin,
            salaryMax: schema.jobs.salaryMax,
            salaryCurrency: schema.jobs.salaryCurrency,
            company: {
              id: schema.companies.id,
              name: schema.companies.name,
            },
          })
          .from(schema.savedJobs)
          .innerJoin(schema.jobs, eq(schema.savedJobs.jobId, schema.jobs.id))
          .leftJoin(schema.companies, eq(schema.jobs.companyId, schema.companies.id))
          .where(eq(schema.savedJobs.userId, ctx.user.id))
          .limit(input.limit)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(schema.savedJobs)
          .where(eq(schema.savedJobs.userId, ctx.user.id)),
      ]);

      const total = countResult[0]?.count ?? 0;
      return {
        jobs: savedJobs,
        total,
        totalPages: Math.ceil(total / input.limit),
        currentPage: input.page,
      };
    }),
});
