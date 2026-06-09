import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  date,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ── Users ──────────────────────────────────────────────
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    unionId: varchar("unionId", { length: 255 }).unique(),
    passwordHash: varchar("password_hash", { length: 255 }),
    email: varchar("email", { length: 320 }).notNull(),
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    name: varchar("name", { length: 255 }),
    phone: varchar("phone", { length: 20 }),
    avatar: text("avatar"),
    avatarUrl: varchar("avatar_url", { length: 500 }),
    city: varchar("city", { length: 100 }),
    role: pgEnum("role", ["seeker", "company", "admin"])("role").default("seeker").notNull(),
    resumeUrl: varchar("resume_url", { length: 500 }),
    skills: jsonb("skills").$type<string[]>(),
    experience: jsonb("experience").$type<Record<string, unknown>[]>(),
    education: jsonb("education").$type<Record<string, unknown>[]>(),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
    lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
  },
  (table) => ({
    emailUnique: uniqueIndex("users_email_unique").on(table.email),
  }),
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ── Companies ──────────────────────────────────────────
export const companies = pgTable(
  "companies",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id),
    name: varchar("name", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 220 }).notNull().unique(),
    description: text("description"),
    website: varchar("website", { length: 255 }),
    logoUrl: varchar("logo_url", { length: 500 }),
    coverUrl: varchar("cover_url", { length: 500 }),
    industry: varchar("industry", { length: 100 }),
    city: varchar("city", { length: 100 }),
    size: pgEnum("size", ["1-10", "11-50", "51-200", "201-1000", "1000+"])("size"),
    contactName: varchar("contact_name", { length: 100 }),
    contactEmail: varchar("contact_email", { length: 255 }),
    contactPhone: varchar("contact_phone", { length: 20 }),
    status: pgEnum("company_status", ["pending", "approved", "rejected"])("company_status").default("pending").notNull(),
    isFeatured: boolean("is_featured").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
  },
);

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

// ── Categories ─────────────────────────────────────────
export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    icon: varchar("icon", { length: 50 }),
    color: varchar("color", { length: 7 }),
    jobCount: integer("job_count").default(0),
    displayOrder: integer("display_order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
);

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// ── Jobs ───────────────────────────────────────────────
export const jobs = pgTable(
  "jobs",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 300 }).notNull(),
    description: text("description").notNull(),
    requirements: text("requirements"),
    companyId: integer("company_id").references(() => companies.id),
    sourceType: pgEnum("source_type", ["internal", "rss", "api"])("source_type").notNull(),
    sourceName: varchar("source_name", { length: 100 }),
    sourceUrl: varchar("source_url", { length: 500 }),
    location: varchar("location", { length: 150 }).notNull(),
    jobType: pgEnum("job_type", ["cdi", "cdd", "stage", "freelance", "interim"])("job_type").notNull(),
    experienceLevel: pgEnum("experience_level", ["junior", "confirme", "senior", "expert"])("experience_level"),
    salaryMin: integer("salary_min"),
    salaryMax: integer("salary_max"),
    salaryCurrency: varchar("salary_currency", { length: 3 }).default("MAD"),
    categoryId: integer("category_id").references(() => categories.id),
    tags: jsonb("tags").$type<string[]>(),
    status: pgEnum("job_status", ["active", "paused", "closed", "draft"])("job_status").default("active"),
    isFeatured: boolean("is_featured").default(false),
    viewsCount: integer("views_count").default(0),
    applicationsCount: integer("applications_count").default(0),
    publishedAt: timestamp("published_at"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
  },
  (table) => ({
    slugUnique: uniqueIndex("jobs_slug_unique").on(table.slug),
  }),
);

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;

// ── Applications ───────────────────────────────────────
export const applications = pgTable(
  "applications",
  {
    id: serial("id").primaryKey(),
    jobId: integer("job_id").notNull().references(() => jobs.id),
    userId: integer("user_id").notNull().references(() => users.id),
    status: pgEnum("application_status", ["applied", "contacted", "shortlisted", "fit", "not_fit", "rejected"])("application_status").default("applied"),
    coverLetter: text("cover_letter"),
    resumeUrl: varchar("resume_url", { length: 500 }),
    notes: text("notes"),
    companyRating: integer("company_rating"),
    companyReview: text("company_review"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
  },
  (table) => ({
    jobUserUnique: uniqueIndex("applications_job_user_unique").on(
      table.jobId,
      table.userId,
    ),
  }),
);

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

// ── Saved Jobs ─────────────────────────────────────────
export const savedJobs = pgTable(
  "saved_jobs",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    jobId: integer("job_id").notNull().references(() => jobs.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userJobUnique: uniqueIndex("saved_jobs_user_job_unique").on(
      table.userId,
      table.jobId,
    ),
  }),
);

export type SavedJob = typeof savedJobs.$inferSelect;
export type InsertSavedJob = typeof savedJobs.$inferInsert;

// ── Feeds ──────────────────────────────────────────────
export const feeds = pgTable(
  "feeds",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 150 }).notNull(),
    url: varchar("url", { length: 500 }).notNull(),
    sourceType: pgEnum("source_type", ["rss", "api", "scraping"])("source_type").default("rss"),
    categoryId: integer("category_id").references(() => categories.id),
    lastSyncAt: timestamp("last_sync_at"),
    lastSyncStatus: pgEnum("last_sync_status", ["success", "error", "pending"])("last_sync_status").default("pending"),
    status: pgEnum("feed_status", ["healthy", "warning", "failed", "blocked", "timeout", "disabled"])("feed_status").default("healthy"),
    lastError: text("last_error"),
    syncFrequency: pgEnum("sync_frequency", ["hourly", "6h", "12h", "daily"])("sync_frequency").default("6h"),
    jobsImported: integer("jobs_imported").default(0),
    lastSuccessAt: timestamp("last_success_at"),
    lastFailureAt: timestamp("last_failure_at"),
    consecutiveFailures: integer("consecutive_failures").default(0),
    averageResponseTime: integer("average_response_time").default(0),
    lastResponseTime: integer("last_response_time").default(0),
    etag: varchar("etag", { length: 255 }),
    lastModified: varchar("last_modified", { length: 255 }),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
  },
);

export type Feed = typeof feeds.$inferSelect;
export type InsertFeed = typeof feeds.$inferInsert;

// ── Feed Logs ──────────────────────────────────────────
export const feedLogs = pgTable("feed_logs", {
  id: serial("id").primaryKey(),
  feedId: integer("feed_id").references(() => feeds.id).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  startedAt: timestamp("started_at").notNull(),
  finishedAt: timestamp("finished_at").notNull(),
  duration: integer("duration").notNull(),
  responseCode: integer("response_code"),
  jobsImported: integer("jobs_imported").default(0),
  jobsSkipped: integer("jobs_skipped").default(0),
  jobsUpdated: integer("jobs_updated").default(0),
  errorMessage: text("error_message"),
  status: pgEnum("feed_log_status", ["success", "error", "timeout", "skipped"])("feed_log_status").notNull(),
});

export type FeedLog = typeof feedLogs.$inferSelect;
export type InsertFeedLog = typeof feedLogs.$inferInsert;

// ── Advertisements ─────────────────────────────────────
export const advertisements = pgTable("advertisements", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  placement: pgEnum("placement", ["header", "sidebar", "footer", "between_listings", "popup"])("placement").notNull(),
  imageUrl: varchar("image_url", { length: 500 }),
  linkUrl: varchar("link_url", { length: 500 }),
  scriptCode: text("script_code"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  clicks: integer("clicks").default(0),
  impressions: integer("impressions").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Advertisement = typeof advertisements.$inferSelect;
export type InsertAdvertisement = typeof advertisements.$inferInsert;

// ── Activity Logs ──────────────────────────────────────
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: pgEnum("entity_type", ["job", "company", "application", "user", "feed"])("entity_type").notNull(),
  entityId: integer("entity_id"),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;
