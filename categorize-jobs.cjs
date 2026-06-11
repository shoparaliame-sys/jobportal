require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const categoryKeywords = {
  'Informatique & Tech': ['it', 'dev', 'react', 'node', 'linux', 'tech', 'software', 'cloud', 'data', 'reseau', 'réseau', 'si', 'informatique'],
  'Finance & Comptabilité': ['finance', 'comptab', 'credit', 'audit', 'trésorerie'],
  'Marketing & Communication': ['marketing', 'communication', 'seo', 'community'],
  'Ressources Humaines': ['rh', 'recrut', 'sirh'],
  'Ingénierie': ['ingenieur', 'ingénieur', 'production', 'civil', 'mecanique', 'maintenance'],
  'Santé & Médical': ['sante', 'medical', 'medecin', 'pharmaci'],
  'Commercial & Vente': ['commercial', 'vente', 'business develop', 'avant-vente', 'relation client'],
  'Administration': ['administratif', 'moyens generaux', 'moyens généraux', 'reception', 'réception'],
  'Logistique & Transport': ['logistique', 'transport', 'supply chain'],
  'Tourisme & Hôtellerie': ['tourisme', 'hotel', 'spa', 'palace'],
  'Juridique & Droit': ['avocat', 'juridique', 'droit', 'sinistre'],
};

async function run() {
  const client = await pool.connect();
  try {
    const catsRes = await client.query('SELECT id, name FROM categories');
    const categories = catsRes.rows;
    
    const catMap = {};
    for (const cat of categories) {
      catMap[cat.name] = cat.id;
    }

    const jobsRes = await client.query('SELECT id, title FROM jobs WHERE category_id IS NULL');
    const jobs = jobsRes.rows;

    let updated = 0;
    for (const job of jobs) {
      const title = job.title.toLowerCase();
      let assignedId = null;

      for (const [catName, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(k => title.includes(k.toLowerCase()))) {
          assignedId = catMap[catName];
          if (assignedId) break;
        }
      }

      // Default fallback if no match
      if (!assignedId && categories.length > 0) {
         assignedId = catMap['Informatique & Tech'] || categories[0].id; 
      }

      if (assignedId) {
        await client.query('UPDATE jobs SET category_id = $1 WHERE id = $2', [assignedId, job.id]);
        updated++;
      }
    }
    console.log(`Categorized ${updated} jobs.`);

  } finally {
    client.release();
    pool.end();
  }
}
run();
