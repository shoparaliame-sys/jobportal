import 'dotenv/config';
import { Pool } from 'pg';

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({
  connectionString: url,
  ssl: { rejectUnauthorized: false }
});

// Known seed slugs for companies
const SEED_COMPANY_SLUGS = [
  'ocp-group', 'attijariwafa-bank', 'maroc-telecom', 'royal-air-maroc',
  'capgemini-maroc', 'societe-generale-maroc', 'hps', 'managem',
  'webhelp-maroc', 'bmce-bank', 'inwi', 'centrale-danone',
];

// Known seed demo user emails (NOT admin)
const SEED_DEMO_EMAILS = [
  'candidate@demo.ma', 'sara@demo.ma', 'youssef@demo.ma',
];

// Known seed job slug prefixes
const SEED_JOB_SLUG_PREFIXES = [
  'developpeur-full-stack-javascript-',
  'ingenieur-devops-',
  'data-scientist-',
  'responsable-financier-',
  'analyste-credit-',
  'charge-de-communication-digitale-',
  'chef-de-projet-marketing-',
  'responsable-rh-',
  'ingenieur-civil-',
  'medecin-generaliste-',
  'commercial-b2b-',
  'assistant-administratif-',
  'professeur-de-mathematiques-',
  'avocat-droit-des-affaires-',
  'responsable-logistique-',
  'directeur-d-hotel-',
  'consultant-sap-',
  'comptable-general-',
  'community-manager-',
  'recruteur-it-',
  'architecte-logiciel-',
  'controleur-de-gestion-',
  'ux-ui-designer-',
  'responsable-securite-si-',
  'charge-de-recrutement-',
  'business-developer-',
  'pharmacien-',
  'ingenieur-reseau-',
  'auditeur-interne-',
  'responsable-supply-chain-',
];

async function cleanDummyData() {
  const client = await pool.connect();
  try {
    console.log('🧹 Cleaning dummy data from database...\n');

    // 1. Get IDs of seed companies
    const companyResult = await client.query(
      `SELECT id FROM companies WHERE slug = ANY($1)`,
      [SEED_COMPANY_SLUGS]
    );
    const seedCompanyIds = companyResult.rows.map(r => r.id);
    console.log(`Found ${seedCompanyIds.length} seed companies`);

    // 2. Get IDs of seed demo users
    const userResult = await client.query(
      `SELECT id FROM users WHERE email = ANY($1)`,
      [SEED_DEMO_EMAILS]
    );
    const seedUserIds = userResult.rows.map(r => r.id);
    console.log(`Found ${seedUserIds.length} seed demo users`);

    // 3. Find seed jobs (by slug pattern ending in -N where N is 1-30)
    const jobConditions = SEED_JOB_SLUG_PREFIXES.map((prefix, i) =>
      `slug LIKE '${prefix}%'`
    ).join(' OR ');
    const jobResult = await client.query(
      `SELECT id FROM jobs WHERE ${jobConditions}`
    );
    const seedJobIds = jobResult.rows.map(r => r.id);
    console.log(`Found ${seedJobIds.length} seed jobs`);

    // 4. Delete in FK-safe order
    if (seedJobIds.length > 0) {
      // Delete applications for seed jobs
      const appDel = await client.query(
        `DELETE FROM applications WHERE job_id = ANY($1)`,
        [seedJobIds]
      );
      console.log(`  Deleted ${appDel.rowCount} applications for seed jobs`);

      // Delete saved_jobs for seed jobs
      const savedDel = await client.query(
        `DELETE FROM saved_jobs WHERE job_id = ANY($1)`,
        [seedJobIds]
      );
      console.log(`  Deleted ${savedDel.rowCount} saved_jobs for seed jobs`);

      // Delete seed jobs
      const jobDel = await client.query(
        `DELETE FROM jobs WHERE id = ANY($1)`,
        [seedJobIds]
      );
      console.log(`  Deleted ${jobDel.rowCount} seed jobs`);
    }

    // Also delete any applications by seed demo users (in case they applied to real jobs)
    if (seedUserIds.length > 0) {
      const appByUser = await client.query(
        `DELETE FROM applications WHERE user_id = ANY($1)`,
        [seedUserIds]
      );
      console.log(`  Deleted ${appByUser.rowCount} applications by seed demo users`);

      const savedByUser = await client.query(
        `DELETE FROM saved_jobs WHERE user_id = ANY($1)`,
        [seedUserIds]
      );
      console.log(`  Deleted ${savedByUser.rowCount} saved_jobs by seed demo users`);
    }

    // 5. Delete seed companies and their remaining jobs
    if (seedCompanyIds.length > 0) {
      // Find ALL remaining jobs linked to these seed companies
      const remainingJobsResult = await client.query(
        `SELECT id FROM jobs WHERE company_id = ANY($1)`,
        [seedCompanyIds]
      );
      const remainingJobIds = remainingJobsResult.rows.map(r => r.id);

      if (remainingJobIds.length > 0) {
        // Delete applications for these remaining jobs
        const appForJobs = await client.query(
          `DELETE FROM applications WHERE job_id = ANY($1)`,
          [remainingJobIds]
        );
        console.log(`  Deleted ${appForJobs.rowCount} applications for remaining company jobs`);

        // Delete saved_jobs for these remaining jobs
        const savedForJobs = await client.query(
          `DELETE FROM saved_jobs WHERE job_id = ANY($1)`,
          [remainingJobIds]
        );
        console.log(`  Deleted ${savedForJobs.rowCount} saved_jobs for remaining company jobs`);

        // Delete remaining jobs
        const jobDel = await client.query(
          `DELETE FROM jobs WHERE id = ANY($1)`,
          [remainingJobIds]
        );
        console.log(`  Deleted ${jobDel.rowCount} remaining jobs for seed companies`);
      }

      const compDel = await client.query(
        `DELETE FROM companies WHERE id = ANY($1)`,
        [seedCompanyIds]
      );
      console.log(`  Deleted ${compDel.rowCount} seed companies`);
    }

    // 6. Delete seed demo users
    if (seedUserIds.length > 0) {
      const userDel = await client.query(
        `DELETE FROM users WHERE id = ANY($1)`,
        [seedUserIds]
      );
      console.log(`  Deleted ${userDel.rowCount} seed demo users`);
    }

    console.log('\n✅ Dummy data cleaned successfully!');
    console.log('ℹ️  Preserved: categories, feeds, admin user, and any real user-created data.');

  } catch (err) {
    console.error('❌ Cleanup failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

cleanDummyData();
