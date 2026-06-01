import { relations } from "drizzle-orm";
import { users, companies, jobs, applications, savedJobs, categories, feeds, activityLogs } from "./schema";

export const usersRelations = relations(users, ({ many, one }) => ({
  company: one(companies, { fields: [users.id], references: [companies.userId] }),
  applications: many(applications),
  savedJobs: many(savedJobs),
  activityLogs: many(activityLogs),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  user: one(users, { fields: [companies.userId], references: [users.id] }),
  jobs: many(jobs),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  jobs: many(jobs),
  feeds: many(feeds),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  company: one(companies, { fields: [jobs.companyId], references: [companies.id] }),
  category: one(categories, { fields: [jobs.categoryId], references: [categories.id] }),
  applications: many(applications),
  savedJobs: many(savedJobs),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  job: one(jobs, { fields: [applications.jobId], references: [jobs.id] }),
  user: one(users, { fields: [applications.userId], references: [users.id] }),
}));

export const savedJobsRelations = relations(savedJobs, ({ one }) => ({
  job: one(jobs, { fields: [savedJobs.jobId], references: [jobs.id] }),
  user: one(users, { fields: [savedJobs.userId], references: [users.id] }),
}));

export const feedsRelations = relations(feeds, ({ one }) => ({
  category: one(categories, { fields: [feeds.categoryId], references: [categories.id] }),
}));
