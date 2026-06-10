import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, desc, and, sql, gte } from "drizzle-orm";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { processFeeds } from "./sync-feeds";

export const adminRouter = createRouter({
  stats: adminQuery.query(async () => {
    const db = getDb();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      usersCount,
      pendingCompanies,
      todayJobs,
      monthApplications,
      activeFeeds,
      jobsByStatus,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(schema.users),
      db.select({ count: sql<number>`count(*)` }).from(schema.companies).where(eq(schema.companies.status, "pending")),
      db.select({ count: sql<number>`count(*)` }).from(schema.jobs).where(gte(schema.jobs.createdAt, todayStart)),
      db.select({ count: sql<number>`count(*)` }).from(schema.applications).where(gte(schema.applications.createdAt, thirtyDaysAgo)),
      db.select({ count: sql<number>`count(*)` }).from(schema.feeds).where(eq(schema.feeds.isActive, true)),
      db.select({ status: schema.jobs.status, count: sql<number>`count(*)` }).from(schema.jobs).groupBy(schema.jobs.status),
    ]);

    const applicationsOverTime = await db
      .select({
        date: sql<string>`DATE(${schema.applications.createdAt})`,
        internal: sql<number>`sum(case when ${schema.jobs.sourceType} = 'internal' then 1 else 0 end)`,
        external: sql<number>`sum(case when ${schema.jobs.sourceType} != 'internal' then 1 else 0 end)`,
      })
      .from(schema.applications)
      .leftJoin(schema.jobs, eq(schema.applications.jobId, schema.jobs.id))
      .where(gte(schema.applications.createdAt, thirtyDaysAgo))
      .groupBy(sql`DATE(${schema.applications.createdAt})`)
      .orderBy(sql`DATE(${schema.applications.createdAt})`);

    const jobsByCategory = await db
      .select({
        category: schema.categories.name,
        count: sql<number>`count(*)`,
      })
      .from(schema.jobs)
      .leftJoin(schema.categories, eq(schema.jobs.categoryId, schema.categories.id))
      .groupBy(schema.categories.id)
      .orderBy(sql`count(*) DESC`)
      .limit(8);

    return {
      totalUsers: usersCount[0]?.count ?? 0,
      pendingCompanies: pendingCompanies[0]?.count ?? 0,
      todayJobs: todayJobs[0]?.count ?? 0,
      monthApplications: monthApplications[0]?.count ?? 0,
      activeFeeds: activeFeeds[0]?.count ?? 0,
      jobsByStatus,
      applicationsOverTime,
      jobsByCategory,
    };
  }),

  recentActivity: adminQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(schema.activityLogs)
      .leftJoin(schema.users, eq(schema.activityLogs.userId, schema.users.id))
      .orderBy(desc(schema.activityLogs.createdAt))
      .limit(20);
  }),

  pendingCompanies: adminQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(schema.companies)
      .where(eq(schema.companies.status, "pending"))
      .orderBy(desc(schema.companies.createdAt));
  }),

  allCompanies: adminQuery
    .input(
      z.object({
        status: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { status, page, limit } = input;
      const conditions = [];

      if (status) {
        conditions.push(eq(schema.companies.status, status as "pending" | "approved" | "rejected"));
      }

      const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0] || undefined;

      const [companies, countResult] = await Promise.all([
        db.select().from(schema.companies).where(whereClause).orderBy(desc(schema.companies.createdAt)).limit(limit).offset((page - 1) * limit),
        db.select({ count: sql<number>`count(*)` }).from(schema.companies).where(whereClause),
      ]);

      return {
        companies,
        total: countResult[0]?.count ?? 0,
      };
    }),

  // Company CRUD operations
  createCompany: adminQuery
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
        status: z.enum(["pending", "approved", "rejected"]).default("pending"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const slug = `${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 80)}-${Date.now()}`;
      const [company] = await db.insert(schema.companies).values({ ...input, slug }).returning();
      return company;
    }),

  updateCompany: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        website: z.string().url().optional(),
        industry: z.string().optional(),
        city: z.string().optional(),
        size: z.enum(["1-10", "11-50", "51-200", "201-1000", "1000+"]).optional(),
        contactName: z.string().optional(),
        contactEmail: z.string().email().optional(),
        contactPhone: z.string().optional(),
        status: z.enum(["pending", "approved", "rejected"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(schema.companies).set(data).where(eq(schema.companies.id, id));
      return { success: true };
    }),

  deleteCompany: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(schema.companies).where(eq(schema.companies.id, input.id));
      return { success: true };
    }),

  allJobs: adminQuery
    .input(
      z.object({
        status: z.string().optional(),
        sourceType: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { status, sourceType, page, limit } = input;
      const conditions = [];

      if (status) {
        conditions.push(eq(schema.jobs.status, status as any));
      }
      if (sourceType) {
        conditions.push(eq(schema.jobs.sourceType, sourceType as any));
      }

      const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0] || undefined;

      const [jobs, countResult] = await Promise.all([
        db.select().from(schema.jobs).leftJoin(schema.companies, eq(schema.jobs.companyId, schema.companies.id)).where(whereClause).orderBy(desc(schema.jobs.createdAt)).limit(limit).offset((page - 1) * limit),
        db.select({ count: sql<number>`count(*)` }).from(schema.jobs).where(whereClause),
      ]);

      return {
        jobs: jobs.map((row) => ({ ...row.jobs, company: row.companies })),
        total: countResult[0]?.count ?? 0,
      };
    }),

  // Job CRUD operations
  createJob: adminQuery
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
        sourceType: z.enum(["internal", "rss", "api"]).default("internal"),
        status: z.enum(["active", "paused", "closed", "draft"]).default("active"),
        publishedAt: z.date().default(new Date()),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const slug = `${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 80)}-${Date.now()}`;
      const [job] = await db.insert(schema.jobs).values({ ...input, slug } as any).returning();
      return job;
    }),

  updateJob: adminQuery
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
        categoryId: z.number().optional(),
        tags: z.array(z.string()).optional(),
        sourceType: z.enum(["internal", "rss", "api"]).optional(),
        status: z.enum(["active", "paused", "closed", "draft"]).optional(),
        publishedAt: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(schema.jobs).set(data).where(eq(schema.jobs.id, id));
      return { success: true };
    }),

  allApplications: adminQuery
    .input(
      z.object({
        status: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { status, page, limit } = input;
      const conditions = [];

      if (status) {
        conditions.push(eq(schema.applications.status, status as any));
      }

      const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0] || undefined;

      const [applications, countResult] = await Promise.all([
        db.select()
          .from(schema.applications)
          .leftJoin(schema.jobs, eq(schema.applications.jobId, schema.jobs.id))
          .leftJoin(schema.users, eq(schema.applications.userId, schema.users.id))
          .where(whereClause)
          .orderBy(desc(schema.applications.createdAt))
          .limit(limit)
          .offset((page - 1) * limit),
        db.select({ count: sql<number>`count(*)` }).from(schema.applications).where(whereClause),
      ]);

      return {
        applications: applications.map((row) => ({
          ...row.applications,
          job: row.jobs,
          user: row.users,
        })),
        total: countResult[0]?.count ?? 0,
      };
    }),

  // Application CRUD operations
  deleteApplication: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(schema.applications).where(eq(schema.applications.id, input.id));
      return { success: true };
    }),

  allUsers: adminQuery
    .input(
      z.object({
        role: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { role, page, limit } = input;
      const conditions = [];

      if (role) {
        conditions.push(eq(schema.users.role, role as any));
      }

      const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0] || undefined;

      const [users, countResult] = await Promise.all([
        db.select().from(schema.users).where(whereClause).orderBy(desc(schema.users.createdAt)).limit(limit).offset((page - 1) * limit),
        db.select({ count: sql<number>`count(*)` }).from(schema.users).where(whereClause),
      ]);

      return {
        users,
        total: countResult[0]?.count ?? 0,
      };
    }),

  // User CRUD operations
  createUser: adminQuery
    .input(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        city: z.string().optional(),
        resumeUrl: z.string().url().optional(),
        skills: z.array(z.string()).optional(),
        role: z.enum(["admin", "company", "seeker"]).default("seeker"),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      // Hash password in real implementation - for now storing plain text (NOT SECURE)
      const [user] = await db.insert(schema.users).values(input).returning();
      return user;
    }),

  updateUser: adminQuery
    .input(
      z.object({
        id: z.number(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        city: z.string().optional(),
        resumeUrl: z.string().url().optional(),
        skills: z.array(z.string()).optional(),
        role: z.enum(["admin", "company", "seeker"]).optional(),
        password: z.string().min(6).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(schema.users).set(data).where(eq(schema.users.id, id));
      return { success: true };
    }),

  deleteUser: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(schema.applications).where(eq(schema.applications.userId, input.id));
      await db.delete(schema.savedJobs).where(eq(schema.savedJobs.userId, input.id));
      await db.delete(schema.activityLogs).where(eq(schema.activityLogs.userId, input.id));
      await db.update(schema.companies).set({ userId: null }).where(eq(schema.companies.userId, input.id));
      await db.delete(schema.users).where(eq(schema.users.id, input.id));
      return { success: true };
    }),

  moderateJob: adminQuery
    .input(z.object({ id: z.number(), action: z.enum(["approve", "pause", "close", "delete"]) }))
    .mutation(async ({ input }) => {
      const db = getDb();

      if (input.action === "delete") {
        await db.delete(schema.jobs).where(eq(schema.jobs.id, input.id));
      } else {
        const statusMap = { approve: "active", pause: "paused", close: "closed" };
        await db
          .update(schema.jobs)
          .set({ status: statusMap[input.action] as any })
          .where(eq(schema.jobs.id, input.id));
      }

      return { success: true };
    }),

  feeds: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(schema.feeds).orderBy(desc(schema.feeds.createdAt));
  }),

  createFeed: adminQuery
    .input(
      z.object({
        name: z.string(),
        url: z.string().url(),
        sourceType: z.enum(["rss", "api", "scraping"]).default("rss"),
        categoryId: z.number().optional(),
        syncFrequency: z.enum(["hourly", "6h", "12h", "daily"]).default("6h"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      try {
        const [feed] = await db.insert(schema.feeds).values(input).returning();
        return feed;
      } catch (err: any) {
        if (err.code === "23505" || err.message?.includes("feeds_url_unique") || err.message?.includes("duplicate key")) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Un flux avec cette URL existe déjà.",
          });
        }
        throw err;
      }
    }),

  updateFeed: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        url: z.string().url().optional(),
        categoryId: z.number().optional(),
        syncFrequency: z.enum(["hourly", "6h", "12h", "daily"]).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      try {
        await db.update(schema.feeds).set(data).where(eq(schema.feeds.id, id));
        return { success: true };
      } catch (err: any) {
        if (err.code === "23505" || err.message?.includes("feeds_url_unique") || err.message?.includes("duplicate key")) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Un flux avec cette URL existe déjà.",
          });
        }
        throw err;
      }
    }),

  deleteFeed: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(schema.feeds).where(eq(schema.feeds.id, input.id));
      return { success: true };
    }),

  feedStats: adminQuery.query(async () => {
    const db = getDb();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      feedStatusCounts,
      avgResponseTimeQuery,
      jobsToday,
      jobsWeek,
      jobsMonth
    ] = await Promise.all([
      db.select({ status: schema.feeds.status, count: sql<number>`count(*)` }).from(schema.feeds).groupBy(schema.feeds.status),
      db.select({ avg: sql<number>`avg(${schema.feeds.averageResponseTime})` }).from(schema.feeds).where(eq(schema.feeds.isActive, true)),
      db.select({ count: sql<number>`sum(${schema.feedLogs.jobsImported})` }).from(schema.feedLogs).where(gte(schema.feedLogs.startedAt, today)),
      db.select({ count: sql<number>`sum(${schema.feedLogs.jobsImported})` }).from(schema.feedLogs).where(gte(schema.feedLogs.startedAt, startOfWeek)),
      db.select({ count: sql<number>`sum(${schema.feedLogs.jobsImported})` }).from(schema.feedLogs).where(gte(schema.feedLogs.startedAt, startOfMonth)),
    ]);

    return {
      statusCounts: feedStatusCounts,
      averageResponseTime: avgResponseTimeQuery[0]?.avg ?? 0,
      importedToday: jobsToday[0]?.count ?? 0,
      importedWeek: jobsWeek[0]?.count ?? 0,
      importedMonth: jobsMonth[0]?.count ?? 0,
    };
  }),

  feedLogs: adminQuery
    .input(
      z.object({
        feedId: z.number().optional(),
        limit: z.number().default(50)
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      let query = db.select().from(schema.feedLogs);
      
      if (input.feedId) {
        query = query.where(eq(schema.feedLogs.feedId, input.feedId)) as any;
      }
      
      return query.orderBy(desc(schema.feedLogs.startedAt)).limit(input.limit);
    }),

  syncFeed: adminQuery
    .input(z.object({ id: z.number().optional() }))
    .mutation(async ({ input }) => {
      // Run in background without awaiting, so it doesn't block the request if it takes long
      // Passing `true` as the second argument to indicate it is a manual sync from the UI
      processFeeds(input.id, true).catch(console.error);
      return { success: true };
    }),

  // Settings operations
  getSettings: adminQuery.query(async () => {
    // In a real app, you'd have a settings table
    // For now, returning default values
    return {
      maintenanceMode: false,
      registrationEnabled: true,
      emailNotificationsEnabled: true,
      maxApplicationsPerUser: 10,
      jobAutoCloseDays: 30,
    };
  }),

  updateSettings: adminQuery
    .input(
      z.object({
        maintenanceMode: z.boolean().optional(),
        registrationEnabled: z.boolean().optional(),
        emailNotificationsEnabled: z.boolean().optional(),
        maxApplicationsPerUser: z.number().min(1).optional(),
        jobAutoCloseDays: z.number().min(1).optional(),
      })
    )
    .mutation(async () => {
      // In a real app, you'd update a settings table
      // For now, just returning success (settings would be stored elsewhere)
      return { success: true };
    }),
});