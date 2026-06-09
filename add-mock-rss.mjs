import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as dotenv from "dotenv";
import * as schema from "./db/schema.js";

dotenv.config();
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const db = drizzle(pool);

async function main() {
  console.log("Adding mock RSS jobs...");
  try {
    await db.insert(schema.jobs).values([
      {
        title: "Développeur Full Stack React/Node.js",
        slug: "dev-full-stack-react-nodejs-" + Date.now(),
        description: "Rejoignez notre équipe en tant que développeur full stack pour créer des applications web innovantes. **Missions :** Développement de nouvelles fonctionnalités, maintenance, etc.",
        sourceType: "rss",
        sourceName: "TechCorp (via RSS)",
        sourceUrl: "https://example.com/job/1",
        location: "Casablanca (Télétravail)",
        jobType: "cdi",
        experienceLevel: "confirme",
        salaryMin: 12000,
        salaryMax: 18000,
        status: "active",
        publishedAt: new Date(),
        isFeatured: true,
      },
      {
        title: "Ingénieur DevOps Kubernetes",
        slug: "ingenieur-devops-k8s-" + Date.now(),
        description: "Nous recherchons un ingénieur DevOps expérimenté pour gérer notre infrastructure cloud. **Profil :** Maîtrise de Docker, Kubernetes, CI/CD, AWS.",
        sourceType: "rss",
        sourceName: "CloudNet (via RSS)",
        sourceUrl: "https://example.com/job/2",
        location: "Rabat",
        jobType: "cdi",
        experienceLevel: "senior",
        salaryMin: 18000,
        salaryMax: 25000,
        status: "active",
        publishedAt: new Date(Date.now() - 86400000), // 1 day ago
        isFeatured: false,
      },
      {
        title: "Designer UI/UX",
        slug: "designer-ui-ux-" + Date.now(),
        description: "Création d'interfaces utilisateur modernes et ergonomiques. Maîtrise de Figma exigée.",
        sourceType: "rss",
        sourceName: "CreativeAgency (via RSS)",
        sourceUrl: "https://example.com/job/3",
        location: "Tanger",
        jobType: "freelance",
        experienceLevel: "junior",
        salaryMin: 6000,
        salaryMax: 10000,
        status: "active",
        publishedAt: new Date(Date.now() - 86400000 * 2),
        isFeatured: false,
      }
    ]);
    console.log("Mock RSS jobs added successfully.");
  } catch (err) {
    console.error("Error adding mock jobs:", err);
  } finally {
    pool.end();
  }
}

main();
