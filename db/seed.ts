import { getDb } from "../api/queries/connection";
import * as schema from "./schema";
import { hash } from "bcryptjs";

async function seedCategories() {
  const cats = [
    { name: "Informatique & Tech", slug: "informatique-tech", icon: "Monitor", color: "#3b82f6", displayOrder: 1 },
    { name: "Finance & Comptabilité", slug: "finance-comptabilite", icon: "Calculator", color: "#10b981", displayOrder: 2 },
    { name: "Marketing & Communication", slug: "marketing-communication", icon: "Megaphone", color: "#f59e0b", displayOrder: 3 },
    { name: "Ressources Humaines", slug: "ressources-humaines", icon: "Users", color: "#8b5cf6", displayOrder: 4 },
    { name: "Ingénierie", slug: "ingenierie", icon: "Wrench", color: "#ef4444", displayOrder: 5 },
    { name: "Santé & Médical", slug: "sante-medical", icon: "HeartPulse", color: "#ec4899", displayOrder: 6 },
    { name: "Commercial & Vente", slug: "commercial-vente", icon: "TrendingUp", color: "#06b6d4", displayOrder: 7 },
    { name: "Administration", slug: "administration", icon: "Building2", color: "#6366f1", displayOrder: 8 },
    { name: "Éducation & Formation", slug: "education-formation", icon: "GraduationCap", color: "#84cc16", displayOrder: 9 },
    { name: "Juridique & Droit", slug: "juridique-droit", icon: "Scale", color: "#14b8a6", displayOrder: 10 },
    { name: "Logistique & Transport", slug: "logistique-transport", icon: "Truck", color: "#f97316", displayOrder: 11 },
    { name: "Tourisme & Hôtellerie", slug: "tourisme-hotellerie", icon: "Plane", color: "#0ea5e9", displayOrder: 12 },
  ];

  const db = getDb();
  for (const cat of cats) {
    await db.insert(schema.categories).values(cat).onConflictDoUpdate({
      target: schema.categories.slug,
      set: cat,
    });
  }
  console.log("✅ Categories seeded");
}

async function seedAdmin() {
  const db = getDb();
  const passwordHash = await hash("password123", 10);

  const adminUser = {
    email: "admin@rekrute.ma",
    passwordHash,
    firstName: "Admin",
    lastName: "ReKrute",
    name: "Admin ReKrute",
    role: "admin" as const,
    city: "Casablanca",
    skills: ["Management", "Recrutement", "Analytics"],
  };

  await db.insert(schema.users).values(adminUser).onConflictDoUpdate({
    target: schema.users.email,
    set: adminUser,
  });
  console.log("✅ Admin user seeded");
}

async function seedFeeds() {
  const feedsData = [
    { name: "LinkedIn Jobs Morocco", url: "https://www.linkedin.com/jobs/rss", sourceType: "rss" as const, syncFrequency: "6h" as const, isActive: true },
    { name: "Rekrute.com Feed", url: "https://www.rekrute.com/rss", sourceType: "rss" as const, syncFrequency: "12h" as const, isActive: true },
    { name: "Emploi.ma Feed", url: "https://www.emploi.ma/rss", sourceType: "rss" as const, syncFrequency: "12h" as const, isActive: true },
    { name: "Indeed Morocco", url: "https://ma.indeed.com/rss", sourceType: "rss" as const, syncFrequency: "daily" as const, isActive: true },
    { name: "Emploi-Public.ma", url: "https://www.emploi-public.ma/rss", sourceType: "rss" as const, syncFrequency: "6h" as const, isActive: true },
  ];

  const db = getDb();
  for (const feed of feedsData) {
    await db.insert(schema.feeds).values(feed).onConflictDoUpdate({
      target: schema.feeds.url,
      set: feed,
    });
  }
  console.log("✅ Feeds seeded");
}

async function main() {
  console.log("🌱 Seeding database (categories, admin, feeds only)...\n");
  await seedCategories();
  await seedAdmin();
  await seedFeeds();
  console.log("\n✅ Seed complete! No dummy data was inserted.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
