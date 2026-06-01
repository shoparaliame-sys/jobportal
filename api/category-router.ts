import { z } from "zod";
import { eq, asc } from "drizzle-orm";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

export const categoryRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(schema.categories)
      .orderBy(asc(schema.categories.displayOrder));
  }),

  create: adminQuery
    .input(
      z.object({
        name: z.string().min(2),
        slug: z.string(),
        icon: z.string().optional(),
        color: z.string().optional(),
        displayOrder: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [category] = await db.insert(schema.categories).values(input).returning();
      return category;
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        icon: z.string().optional(),
        color: z.string().optional(),
        displayOrder: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(schema.categories).set(data).where(eq(schema.categories.id, id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(schema.categories).where(eq(schema.categories.id, input.id));
      return { success: true };
    }),
});
