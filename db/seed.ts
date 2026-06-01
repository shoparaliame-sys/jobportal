import { getDb } from "../server/queries/connection";
import * as schema from "./schema";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";

const CITIES = [
  "Casablanca", "Rabat", "Marrakech", "Tanger", "Fès",
  "Agadir", "Oujda", "Tétouan", "Salé", "Kenitra",
  "Mohammedia", "El Jadida", "Safi", "Béni Mellal", "Nador",
];

const JOB_TYPES = ["cdi", "cdd", "stage", "freelance", "interim"] as const;
const EXP_LEVELS = ["junior", "confirme", "senior", "expert"] as const;

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

async function seedCompanies() {
  const companiesData = [
    {
      name: "OCP Group", slug: "ocp-group", description: "Leader mondial du phosphate et des produits dérivés. OCP Group est un acteur majeur de l'industrie chimique au Maroc et à l'international.", website: "https://www.ocpgroup.ma", industry: "Industrie Chimique & Minière", city: "Casablanca", size: "1000+" as const, contactName: "Ahmed Benani", contactEmail: "recrutement@ocpgroup.ma", status: "approved" as const, isFeatured: true,
    },
    {
      name: "Attijariwafa Bank", slug: "attijariwafa-bank", description: "Premier groupe bancaire au Maroc et en Afrique de l'Ouest. Attijariwafa Bank offre des services financiers complets.", website: "https://www.attijariwafabank.com", industry: "Banque & Finance", city: "Casablanca", size: "1000+" as const, contactName: "Sara El Amrani", contactEmail: "rh@attijariwafa.ma", status: "approved" as const, isFeatured: true,
    },
    {
      name: "Maroc Telecom", slug: "maroc-telecom", description: "Premier opérateur de télécommunications au Maroc. Maroc Telecom propose des services fixes, mobiles et Internet.", website: "https://www.iam.ma", industry: "Télécommunications", city: "Rabat", size: "1000+" as const, contactName: "Karim Fassi", contactEmail: "carrieres@iam.ma", status: "approved" as const, isFeatured: true,
    },
    {
      name: "Royal Air Maroc", slug: "royal-air-maroc", description: "Compagnie aérienne nationale du Maroc. Royal Air Maroc relie le Maroc à plus de 80 destinations dans le monde.", website: "https://www.royalairmaroc.com", industry: "Transport Aérien", city: "Casablanca", size: "201-1000" as const, contactName: "Leila Moussaoui", contactEmail: "recrutement@royalairmaroc.com", status: "approved" as const, isFeatured: true,
    },
    {
      name: "Capgemini Maroc", slug: "capgemini-maroc", description: "Leader mondial du conseil, des services technologiques et de la transformation digitale. Capgemini accompagne les entreprises dans leur innovation.", website: "https://www.capgemini.com", industry: "Informatique & Tech", city: "Casablanca", size: "1000+" as const, contactName: "Youssef Tahiri", contactEmail: "maroc.recrutement@capgemini.com", status: "approved" as const, isFeatured: false,
    },
    {
      name: "Société Générale Maroc", slug: "societe-generale-maroc", description: "Filiale marocaine de la banque française Société Générale. Acteur majeur du secteur bancaire avec une large gamme de produits.", website: "https://www.sgcib.com", industry: "Banque & Finance", city: "Casablanca", size: "201-1000" as const, contactName: "Fatima Zahra El Idrissi", contactEmail: "recrutement@sgmaroc.ma", status: "approved" as const, isFeatured: false,
    },
    {
      name: "HPS", slug: "hps", description: "HPS est un leader mondial des solutions de paiement électronique. PowerCARD, leur solution phare, est utilisée par des banques dans plus de 90 pays.", website: "https://www.hps-worldwide.com", industry: "Fintech", city: "Rabat", size: "201-1000" as const, contactName: "Omar Bennani", contactEmail: "jobs@hps-worldwide.com", status: "approved" as const, isFeatured: false,
    },
    {
      name: "Managem", slug: "managem", description: "Groupe minier diversifié présent sur l'ensemble de la chaîne de valeur. Managem est un acteur majeur de l'industrie extractive en Afrique.", website: "https://www.managemgroup.com", industry: "Industrie Minière", city: "Casablanca", size: "1000+" as const, contactName: "Hassan Alaoui", contactEmail: "carrieres@managem.com", status: "approved" as const, isFeatured: true,
    },
    {
      name: "Webhelp Maroc", slug: "webhelp-maroc", description: "Leader européen de la relation client. Webhelp Maroc opère plusieurs centres d'appels et emploie plus de 3000 collaborateurs.", website: "https://www.webhelp.com", industry: "Services", city: "Rabat", size: "1000+" as const, contactName: "Nadia Chakir", contactEmail: "recrutement@webhelp.ma", status: "approved" as const, isFeatured: false,
    },
    {
      name: "BMCE Bank", slug: "bmce-bank", description: "Banque marocaine leader avec une forte présence internationale. BMCE Bank of Africa est présente dans plus de 30 pays africains.", website: "https://www.bmcebank.ma", industry: "Banque & Finance", city: "Casablanca", size: "1000+" as const, contactName: "Rachid Benomar", contactEmail: "rh@bmcebank.ma", status: "approved" as const, isFeatured: false,
    },
    {
      name: "Inwi", slug: "inwi", description: "Opérateur de télécommunications marocain. Inwi propose des services mobiles, Internet fixe et mobile, et solutions entreprises.", website: "https://www.inwi.ma", industry: "Télécommunications", city: "Casablanca", size: "1000+" as const, contactName: "Samira Fahim", contactEmail: "carrieres@inwi.ma", status: "approved" as const, isFeatured: false,
    },
    {
      name: "Centrale Danone", slug: "centrale-danone", description: "Filiale du groupe Danone au Maroc. Centrale Danone est leader sur le marché des produits laitiers frais.", website: "https://www.centraledanone.ma", industry: "Agroalimentaire", city: "Casablanca", size: "1000+" as const, contactName: "Mehdi Tazi", contactEmail: "rh@centraledanone.ma", status: "pending" as const, isFeatured: false,
    },
  ];

  const db = getDb();
  for (const comp of companiesData) {
    await db.insert(schema.companies).values(comp).onConflictDoUpdate({
      target: schema.companies.slug,
      set: comp,
    });
  }
  console.log("✅ Companies seeded");
}

function createSlug(title: string, id: number) {
  return title.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80) + `-${id}`;
}

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

async function seedJobs() {
  const jobTemplates = [
    { title: "Développeur Full Stack JavaScript", cat: 1, desc: "Nous recherchons un développeur Full Stack JavaScript expérimenté pour rejoindre notre équipe technique. Vous serez responsable du développement et de la maintenance de nos applications web." },
    { title: "Ingénieur DevOps", cat: 1, desc: "Nous cherchons un ingénieur DevOps pour automatiser nos pipelines CI/CD et gérer notre infrastructure cloud. Expérience avec Docker, Kubernetes et AWS requise." },
    { title: "Data Scientist", cat: 1, desc: "Rejoignez notre équipe data pour développer des modèles de machine learning et analyser des données complexes. Maîtrise de Python, TensorFlow et SQL exigée." },
    { title: "Responsable Financier", cat: 2, desc: "Nous recherchons un Responsable Financier pour superviser la comptabilité, la trésorerie et le reporting financier. Expérience en audit et normes IFRS souhaitée." },
    { title: "Analyste Crédit", cat: 2, desc: "Poste d'analyste crédit au sein de notre département risques. Vous évaluerez la solvabilité des clients et participerez à la politique de risque." },
    { title: "Chargé de Communication Digitale", cat: 3, desc: "Vous pilotez notre stratégie de communication digitale : réseaux sociaux, content marketing, SEO/SEM et campagnes publicitaires en ligne." },
    { title: "Chef de Projet Marketing", cat: 3, desc: "Nous recherchons un chef de projet marketing pour coordonner nos campagnes multicanales et superviser notre équipe créative." },
    { title: "Responsable RH", cat: 4, desc: "En tant que Responsable RH, vous définissez et mettez en œuvre la politique RH : recrutement, formation, GPEC et relations sociales." },
    { title: "Ingénieur Civil", cat: 5, desc: "Nous recrutons un ingénieur civil pour superviser nos chantiers de construction et infrastructure. Expérience en génie civil de 3 ans minimum." },
    { title: "Médecin Généraliste", cat: 6, desc: "Clinique privée recrute médecin généraliste pour consultation en ville. Horaires flexibles et rémunération attractive." },
    { title: "Commercial B2B", cat: 7, desc: "Nous recherchons un commercial B2B pour développer notre portefeuille clients entreprises. Excellentes capacités de négociation requises." },
    { title: "Assistant Administratif", cat: 8, desc: "Poste d'assistant administratif polyvalent : accueil, gestion des appels, organisation de réunions et suivi des dossiers." },
    { title: "Professeur de Mathématiques", cat: 9, desc: "Établissement privé recherche professeur de mathématiques pour classes de collège et lycée. Passion pour l'enseignement exigée." },
    { title: "Avocat Droit des Affaires", cat: 10, desc: "Cabinet d'avocats recherche un avocat spécialisé en droit des affaires pour conseiller nos clients corporate." },
    { title: "Responsable Logistique", cat: 11, desc: "Vous supervisez l'ensemble de la chaîne logistique : approvisionnement, transport, stockage et distribution." },
    { title: "Directeur d'Hôtel", cat: 12, desc: "Hôtel 5 étoiles recherche un directeur expérimenté pour piloter l'ensemble des opérations et garantir la satisfaction client." },
    { title: "Consultant SAP", cat: 1, desc: "Nous recrutons un consultant SAP FI/CO pour accompagner nos clients dans leurs projets de transformation digitale." },
    { title: "Comptable Général", cat: 2, desc: "Poste de comptable général : saisie, lettrage, déclarations fiscales et préparation des bilans. Maîtrise du logiciel SAGE requise." },
    { title: "Community Manager", cat: 3, desc: "Vous animez nos communautés sur les réseaux sociaux, créez du contenu engageant et analysez les performances." },
    { title: "Recruteur IT", cat: 4, desc: "Cabinet de recrutement spécialisé IT recherche un recruteur pour sourcer et sélectionner les meilleurs talents tech." },
    { title: "Architecte Logiciel", cat: 1, desc: "Nous cherchons un architecte logiciel pour concevoir nos systèmes d'information et guider les équipes de développement." },
    { title: "Contrôleur de Gestion", cat: 2, desc: "Poste de contrôleur de gestion : tableaux de bord, budgets, analyse des écarts et aide à la décision." },
    { title: "UX/UI Designer", cat: 1, desc: "Rejoignez notre studio de design pour créer des expériences utilisateur exceptionnelles. Maîtrise de Figma et des méthodologies UX." },
    { title: "Responsable Sécurité SI", cat: 1, desc: "Nous recrutons un RSSI pour définir et mettre en œuvre notre politique de sécurité informatique. Certifications CISA ou CISSP appréciées." },
    { title: "Chargé de Recrutement", cat: 4, desc: "Vous gérez le processus de recrutement de A à Z : sourcing, présélection, entretiens et intégration des nouveaux collaborateurs." },
    { title: "Business Developer", cat: 7, desc: "Nous recherchons un business developer pour identifier de nouvelles opportunités et développer nos marchés." },
    { title: "Pharmacien", cat: 6, desc: "Pharmacie de ville recherche un pharmacien pour exercer en collaboration avec une équipe médicale dynamique." },
    { title: "Ingénieur Réseau", cat: 1, desc: "Poste d'ingénieur réseau pour concevoir, déployer et maintenir notre infrastructure réseau et sécurité." },
    { title: "Auditeur Interne", cat: 2, desc: "Nous recrutons un auditeur interne pour évaluer nos processus et contrôles internes selon les normes professionnelles." },
    { title: "Responsable Supply Chain", cat: 11, desc: "Vous optimisez notre supply chain globale : planification, achats, transport et gestion des stocks." },
  ];

  const db = getDb();
  const allCompanies = await db.select().from(schema.companies);
  const allCategories = await db.select().from(schema.categories);

  const jobsData = jobTemplates.map((template, i) => {
    const company = allCompanies[i % allCompanies.length];
    const category = allCategories.find(c => c.id === template.cat) || allCategories[0];
    const city = rand(CITIES);
    const jobType = rand([...JOB_TYPES]);
    const expLevel = rand([...EXP_LEVELS]);
    const isFeatured = i < 6;
    const isInternal = i % 3 === 0;
    const salaryMin = randInt(8000, 35000);

    return {
      title: template.title,
      slug: createSlug(template.title, i + 1),
      description: template.desc + `\n\n**Missions principales :**\n- Concevoir et développer des solutions innovantes\n- Collaborer avec les équipes métiers et techniques\n- Participer aux revues de code et aux cérémonies agiles\n- Assurer la qualité et la maintenance des livrables\n\n**Profil recherché :**\n- Diplôme Bac+3/5 dans le domaine concerné\n- ${expLevel === "junior" ? "0-2 ans" : expLevel === "confirme" ? "2-5 ans" : expLevel === "senior" ? "5-10 ans" : "10+ ans"} d'expérience\n- Excellente maîtrise des outils et technologies du domaine\n- Esprit d'équipe et capacité d'adaptation\n- Français obligatoire, anglais apprécié`,
      requirements: `Bac+${randInt(3, 5)} en domaine pertinent\nExpérience professionnelle requise\nMaîtrise des outils métiers\nAutonomie et rigueur`,
      companyId: isInternal ? company.id : null,
      sourceType: isInternal ? "internal" as const : (i % 2 === 0 ? "rss" as const : "api" as const),
      sourceName: isInternal ? null : rand(["LinkedIn", "Rekrute.com", "Emploi.ma", "Indeed"]),
      sourceUrl: isInternal ? null : `https://www.${rand(["linkedin.com", "rekrute.com", "emploi.ma"])}/jobs/${i + 1000}`,
      location: city,
      jobType,
      experienceLevel: expLevel,
      salaryMin,
      salaryMax: salaryMin + randInt(5000, 20000),
      salaryCurrency: "MAD",
      categoryId: category.id,
      tags: [rand(["Agile", "Scrum", "Kanban"]), rand(["Français", "Anglais", "Bilingue"]), rand(["Team Player", "Leadership", "Autonomie"])],
      status: "active" as const,
      isFeatured,
      viewsCount: randInt(50, 2000),
      applicationsCount: randInt(0, 150),
      publishedAt: new Date(Date.now() - randInt(1, 30) * 86400000),
      createdAt: new Date(Date.now() - randInt(1, 30) * 86400000),
    };
  });

  for (const job of jobsData) {
    await db.insert(schema.jobs).values(job).onConflictDoUpdate({
      target: schema.jobs.slug,
      set: job,
    });
  }
  console.log("✅ Jobs seeded");
}

async function seedUsers() {
  const db = getDb();
  const passwordHash = await hash("password123", 10);

  const usersData = [
    {
      email: "admin@rekrute.ma",
      passwordHash,
      firstName: "Admin",
      lastName: "ReKrute",
      name: "Admin ReKrute",
      role: "admin" as const,
      city: "Casablanca",
      skills: ["Management", "Recrutement", "Analytics"],
    },
    {
      email: "candidate@demo.ma",
      passwordHash,
      firstName: "Amine",
      lastName: "Benali",
      name: "Amine Benali",
      role: "seeker" as const,
      city: "Casablanca",
      skills: ["JavaScript", "React", "Node.js", "TypeScript", "Python"],
      resumeUrl: "https://example.com/cv-amine.pdf",
    },
    {
      email: "sara@demo.ma",
      passwordHash,
      firstName: "Sara",
      lastName: "El Amrani",
      name: "Sara El Amrani",
      role: "seeker" as const,
      city: "Rabat",
      skills: ["Marketing Digital", "SEO", "Réseaux Sociaux", "Content Strategy"],
    },
    {
      email: "youssef@demo.ma",
      passwordHash,
      firstName: "Youssef",
      lastName: "Tahiri",
      name: "Youssef Tahiri",
      role: "seeker" as const,
      city: "Marrakech",
      skills: ["Java", "Spring Boot", "Microservices", "SQL", "Docker"],
    },
  ];

  for (const user of usersData) {
    await db.insert(schema.users).values(user).onConflictDoUpdate({
      target: schema.users.email,
      set: user,
    });
  }
  console.log("✅ Users seeded");
}

async function seedApplications() {
  const db = getDb();
  const allJobs = await db.select().from(schema.jobs);
  const allUsers = await db.select().from(schema.users).where(eq(schema.users.role, "seeker"));
  const statuses = ["applied", "contacted", "shortlisted", "fit", "not_fit", "rejected"] as const;

  const applicationsData = [];
  for (let i = 0; i < 25; i++) {
    const job = allJobs[i % allJobs.length];
    const user = allUsers[i % allUsers.length];
    applicationsData.push({
      jobId: job.id,
      userId: user.id,
      status: rand([...statuses]),
      coverLetter: `Madame, Monsieur,\n\nJe suis très intéressé(e) par le poste de ${job.title} au sein de votre organisation. Mon expérience et mes compétences correspondent parfaitement au profil recherché.\n\nDans l'attente d'un retour favorable, je vous prie d'agréer mes salutations distinguées.`,
      resumeUrl: "https://example.com/cv.pdf",
      createdAt: new Date(Date.now() - randInt(1, 20) * 86400000),
    });
  }

  for (const app of applicationsData) {
    await db.insert(schema.applications).values(app).onConflictDoNothing({
      target: [schema.applications.jobId, schema.applications.userId],
    });
  }
  console.log("✅ Applications seeded");
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
  console.log("🌱 Seeding database...\n");
  await seedCategories();
  await seedCompanies();
  await seedUsers();
  await seedJobs();
  await seedApplications();
  await seedFeeds();
  console.log("\n✅ All data seeded successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
