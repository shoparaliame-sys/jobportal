import { z } from "zod";
import { eq, desc, and, sql, gte, inArray } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

export const applicationRouter = createRouter({
  submitApplication: authedQuery
    .input(
      z.object({
        jobId: z.number(),
        coverLetter: z.string().optional(),
        resumeUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const [existing] = await db
        .select()
        .from(schema.applications)
        .where(
          and(
            eq(schema.applications.jobId, input.jobId),
            eq(schema.applications.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (existing) {
        throw new Error("You have already applied for this job");
      }

      const [application] = await db.insert(schema.applications).values({
        jobId: input.jobId,
        userId: ctx.user.id,
        coverLetter: input.coverLetter,
        resumeUrl: input.resumeUrl ?? ctx.user.resumeUrl,
        status: "applied",
      }).returning();

      await db
        .update(schema.jobs)
        .set({ applicationsCount: sql`${schema.jobs.applicationsCount} + 1` })
        .where(eq(schema.jobs.id, input.jobId));

      return application;
    }),

  list: authedQuery
    .input(
      z.object({
        jobId: z.number().optional(),
        status: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const { page, limit, jobId, status } = input;
      const offset = (page - 1) * limit;

      const conditions: any[] = [];

      if (ctx.user.role === "seeker") {
        conditions.push(eq(schema.applications.userId, ctx.user.id));
      } else if (ctx.user.role === "company") {
        const [company] = await db
          .select()
          .from(schema.companies)
          .where(eq(schema.companies.userId, ctx.user.id))
          .limit(1);

        if (company) {
          const companyJobs = await db
            .select({ id: schema.jobs.id })
            .from(schema.jobs)
            .where(eq(schema.jobs.companyId, company.id));

          const jobIds = companyJobs.map((j) => j.id);
          if (jobIds.length > 0) {
            conditions.push(inArray(schema.applications.jobId, jobIds));
          } else {
            // Force 0 results if the company has no jobs
            conditions.push(eq(schema.applications.id, -1));
          }
        }
      }

      if (jobId) {
        conditions.push(eq(schema.applications.jobId, jobId));
      }
      if (status) {
        conditions.push(eq(schema.applications.status, status as any));
      }

      const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

      const [applications, countResult] = await Promise.all([
        db.select()
          .from(schema.applications)
          .leftJoin(schema.jobs, eq(schema.applications.jobId, schema.jobs.id))
          .leftJoin(schema.users, eq(schema.applications.userId, schema.users.id))
          .where(whereClause)
          .orderBy(desc(schema.applications.createdAt))
          .limit(limit)
          .offset(offset),
        db.select({ count: sql<number>`count(*)` })
          .from(schema.applications)
          .where(whereClause),
      ]);

      return {
        applications: applications.map((row) => ({
          ...row.applications,
          job: row.jobs,
          user: row.users
            ? {
                id: row.users.id,
                firstName: row.users.firstName,
                lastName: row.users.lastName,
                name: row.users.name,
                email: row.users.email,
                avatar: row.users.avatar,
                avatarUrl: row.users.avatarUrl,
                city: row.users.city,
                skills: row.users.skills,
                resumeUrl: row.users.resumeUrl,
              }
            : null,
        })),
        total: countResult[0]?.count ?? 0,
        totalPages: Math.ceil((countResult[0]?.count ?? 0) / limit),
        currentPage: page,
      };
    }),

  myApplications: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const apps = await db
      .select()
      .from(schema.applications)
      .leftJoin(schema.jobs, eq(schema.applications.jobId, schema.jobs.id))
      .leftJoin(schema.companies, eq(schema.jobs.companyId, schema.companies.id))
      .where(eq(schema.applications.userId, ctx.user.id))
      .orderBy(desc(schema.applications.createdAt));

    return apps.map((row) => ({
      ...row.applications,
      job: row.jobs ? { ...row.jobs, company: row.companies } : null,
    }));
  }),

  updateStatus: authedQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["applied", "contacted", "shortlisted", "fit", "not_fit", "rejected"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      if (ctx.user.role === "company") {
        const [app] = await db
          .select()
          .from(schema.applications)
          .leftJoin(schema.jobs, eq(schema.applications.jobId, schema.jobs.id))
          .leftJoin(schema.companies, eq(schema.jobs.companyId, schema.companies.id))
          .where(eq(schema.applications.id, input.id))
          .limit(1);

        if (!app?.companies || app.companies.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }
      } else if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      await db
        .update(schema.applications)
        .set({ status: input.status })
        .where(eq(schema.applications.id, input.id));

      return { success: true };
    }),

  addNote: authedQuery
    .input(z.object({ id: z.number(), note: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      if (ctx.user.role === "company") {
        const [app] = await db
          .select()
          .from(schema.applications)
          .leftJoin(schema.jobs, eq(schema.applications.jobId, schema.jobs.id))
          .leftJoin(schema.companies, eq(schema.jobs.companyId, schema.companies.id))
          .where(eq(schema.applications.id, input.id))
          .limit(1);

        if (!app?.companies || app.companies.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }
      }

      await db
        .update(schema.applications)
        .set({ notes: input.note })
        .where(eq(schema.applications.id, input.id));

      return { success: true };
    }),

  companyStats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();

    const [company] = await db
      .select()
      .from(schema.companies)
      .where(eq(schema.companies.userId, ctx.user.id))
      .limit(1);

    if (!company) return null;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

    const [activeJobs, totalApplications, recentApplications, statusBreakdown] = await Promise.all([
      db.select({ count: sql<number>`count(*)` })
        .from(schema.jobs)
        .where(and(eq(schema.jobs.companyId, company.id), eq(schema.jobs.status, "active"))),
      db.select({ count: sql<number>`count(*)` })
        .from(schema.applications)
        .leftJoin(schema.jobs, eq(schema.applications.jobId, schema.jobs.id))
        .where(eq(schema.jobs.companyId, company.id)),
      db.select({ count: sql<number>`count(*)` })
        .from(schema.applications)
        .leftJoin(schema.jobs, eq(schema.applications.jobId, schema.jobs.id))
        .where(and(eq(schema.jobs.companyId, company.id), gte(schema.applications.createdAt, thirtyDaysAgo))),
      db.select({ status: schema.applications.status, count: sql<number>`count(*)` })
        .from(schema.applications)
        .leftJoin(schema.jobs, eq(schema.applications.jobId, schema.jobs.id))
        .where(eq(schema.jobs.companyId, company.id))
        .groupBy(schema.applications.status),
    ]);

    const dailyApplications = await db
      .select({
        date: sql<string>`DATE(${schema.applications.createdAt})`,
        count: sql<number>`count(*)`,
      })
      .from(schema.applications)
      .leftJoin(schema.jobs, eq(schema.applications.jobId, schema.jobs.id))
      .where(and(eq(schema.jobs.companyId, company.id), gte(schema.applications.createdAt, thirtyDaysAgo)))
      .groupBy(sql`DATE(${schema.applications.createdAt})`)
      .orderBy(sql`DATE(${schema.applications.createdAt})`);

    return {
      activeJobs: activeJobs[0]?.count ?? 0,
      totalApplications: totalApplications[0]?.count ?? 0,
      recentApplications: recentApplications[0]?.count ?? 0,
      statusBreakdown,
      dailyApplications,
    };
  }),

  checkApplied: authedQuery
    .input(z.object({ jobId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const [existing] = await db
        .select()
        .from(schema.applications)
        .where(
          and(
            eq(schema.applications.jobId, input.jobId),
            eq(schema.applications.userId, ctx.user.id)
          )
        )
        .limit(1);
      return !!existing;
    }),
});
