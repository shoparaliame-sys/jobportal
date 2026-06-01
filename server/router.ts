import { authRouter } from "./auth-router";
import { localAuthRouter } from "./local-auth-router";
import { jobRouter } from "./job-router";
import { companyRouter } from "./company-router";
import { applicationRouter } from "./application-router";
import { categoryRouter } from "./category-router";
import { adminRouter } from "./admin-router";
import { userRouter } from "./user-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  localAuth: localAuthRouter,
  job: jobRouter,
  company: companyRouter,
  application: applicationRouter,
  category: categoryRouter,
  admin: adminRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
