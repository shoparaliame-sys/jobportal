import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Search, MapPin, Briefcase, Building2, Clock, Banknote,
  ArrowRight, Star, TrendingUp, Users, Bookmark, CheckCircle,
  Monitor, Calculator, Megaphone, Wrench, HeartPulse,
  GraduationCap, Scale, Truck, Plane, Send, ChevronRight,
} from "lucide-react";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const categoryIcons: Record<string, React.ElementType> = {
  Monitor, Calculator, Megaphone, Users, Wrench, HeartPulse,
  TrendingUp, Building2, GraduationCap, Scale, Truck, Plane,
};

export default function Home() {
  const { data: stats } = trpc.job.stats.useQuery();
  const { data: featuredJobs } = trpc.job.featured.useQuery();
  const { data: recentJobs } = trpc.job.recent.useQuery({ limit: 6 });
  const { data: categories } = trpc.category.list.useQuery();
  const { data: featuredCompanies } = trpc.company.featured.useQuery();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <HeroSection stats={stats} />
      <TrustedCompanies companies={featuredCompanies ?? []} />
      <HowItWorks />
      <FeaturedJobs jobs={featuredJobs ?? []} />
      <CategoriesSection categories={categories ?? []} />
      <CTABanner />
      <LatestJobs jobs={recentJobs ?? []} />
      <Testimonials />
      <Footer />
    </div>
  );
}

// ── Particle Network Canvas ──
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const isMobile = window.innerWidth < 768;
    const nodeCount = isMobile ? 30 : 60;
    const connectionDist = isMobile ? 100 : 150;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      r: 2 + Math.random(),
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0) node.x = canvas.offsetWidth;
        if (node.x > canvas.offsetWidth) node.x = 0;
        if (node.y < 0) node.y = canvas.offsetHeight;
        if (node.y > canvas.offsetHeight) node.y = 0;
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDist) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(249, 115, 22, ${0.08 * (1 - dist / connectionDist)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      for (const node of nodes) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(249, 115, 22, 0.6)";
        ctx.fill();
      }

      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-0 animate-[fadeIn_1s_ease_forwards]"
    />
  );
}

// ── Hero Section ──
function HeroSection({ stats }: { stats?: { jobs: number; companies: number; applications: number; sources: number } }) {
  return (
    <section className="relative min-h-[85vh] bg-slate-900 flex items-center overflow-hidden">
      <ParticleCanvas />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-white leading-[1.1] mb-6"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Trouvez Votre{" "}
              <span className="text-orange-500">Emploi Idéal</span>{" "}
              au Maroc
            </motion.h1>
            <motion.p
              className="text-lg text-white/70 max-w-xl mb-8 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              ReKrute agrège des milliers d&apos;offres d&apos;emploi de sources multiples — postulez en un clic et suivez vos candidatures.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <SearchBar />
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-10"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {[
                { value: stats?.jobs ?? 12400, suffix: "+", label: "Offres d'emploi" },
                { value: stats?.companies ?? 2800, suffix: "+", label: "Entreprises" },
                { value: stats?.applications ?? 850000, suffix: "+", label: "Candidats" },
                { value: stats?.sources ?? 15, suffix: "+", label: "Sources d'offres" },
              ].map((stat, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <div className="text-2xl font-bold text-orange-500 font-mono">
                    {stat.value.toLocaleString("fr-FR")}{stat.suffix}
                  </div>
                  <div className="text-xs text-white/60 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right - Illustration */}
          <motion.div
            className="hidden lg:flex justify-center"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            <img
              src="/hero-illustration.png"
              alt="Job search illustration"
              className="w-full max-w-lg drop-shadow-2xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ── Search Bar ──
function SearchBar() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (location) params.set("location", location);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-full shadow-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-2xl">
      <div className="flex-1 flex items-center gap-3 px-4 py-2 min-h-[44px]">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Poste, mots-clés..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 text-sm outline-none"
        />
      </div>
      <div className="w-px bg-slate-200 hidden sm:block" />
      <div className="flex items-center gap-3 px-4 py-2 min-h-[44px] sm:w-48">
        <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Ville"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 text-sm outline-none"
        />
      </div>
      <Button
        onClick={handleSearch}
        className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 py-5 gap-2 shrink-0"
      >
        <Search className="w-4 h-4" />
        Rechercher
      </Button>
    </div>
  );
}

import { useNavigate } from "react-router";
import { useState } from "react";

// ── Trusted Companies ──
function TrustedCompanies({ companies }: { companies: Array<{ name: string; logoUrl: string | null; slug: string }> }) {
  if (companies.length === 0) return null;
  const doubled = [...companies, ...companies];

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-lg font-semibold text-slate-700 mb-8">
          Ils Recrutent Sur <span className="text-orange-500">ReKrute</span>
        </h2>
        <div className="overflow-hidden relative group">
          <div className="flex gap-6 animate-marquee group-hover:[animation-play-state:paused]">
            {doubled.map((company, i) => (
              <div
                key={`${company.slug}-${i}`}
                className="flex-shrink-0 bg-white border border-slate-200 rounded-lg px-6 py-4 w-36 h-16 flex items-center justify-center grayscale hover:grayscale-0 transition-all hover:shadow-md"
              >
                <span className="text-sm font-semibold text-slate-700 truncate">{company.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── How It Works ──
function HowItWorks() {
  const steps = [
    { icon: Search, title: "Recherchez", desc: "Explorez des milliers d'offres filtrées par ville, secteur, et type de contrat. Notre moteur de recherche avancé trouve les postes qui vous correspondent." },
    { icon: Send, title: "Postulez", desc: "Créez votre profil, téléchargez votre CV, et postulez en quelques clics. Suivez l'évolution de chaque candidature en temps réel." },
    { icon: Users, title: "Recrutez", desc: "Pour les entreprises — publiez vos offres, gérez les candidats avec notre ATS intégré, et trouvez les meilleurs talents au Maroc." },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-3xl font-bold text-center text-slate-900 mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Comment Ça Marche
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8 relative">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="text-center relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500 text-white mb-5 shadow-lg">
                <step.icon className="w-7 h-7" />
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-slate-200" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Featured Jobs ──
function FeaturedJobs({ jobs }: { jobs: Array<any> }) {
  if (!jobs.length) return null;

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <motion.h2
            className="text-3xl font-bold text-slate-900"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Offres en Vedette
          </motion.h2>
          <Link to="/jobs" className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1">
            Voir tout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── Job Card ──
function JobCard({ job }: { job: any }) {
  return (
    <motion.div variants={fadeUp}>
      <Link to={`/jobs/${job.id}`}>
        <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 h-full">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
                {job.company?.name?.charAt(0) || "R"}
              </div>
              <span className="text-sm font-medium text-slate-700">{job.company?.name || "ReKrute"}</span>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              job.sourceType === "internal"
                ? "bg-orange-50 text-orange-600"
                : "bg-blue-50 text-blue-600"
            }`}>
              {job.sourceType === "internal" ? "Direct" : "Importé"}
            </span>
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-2 line-clamp-2">{job.title}</h3>
          <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-3">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
            <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{job.jobType?.toUpperCase()}</span>
            {job.salaryMin && (
              <span className="flex items-center gap-1"><Banknote className="w-3.5 h-3.5" />{job.salaryMin.toLocaleString()} MAD</span>
            )}
          </div>
          <p className="text-sm text-slate-500 line-clamp-2 mb-3">{job.description?.replace(/\*\*/g, "").substring(0, 120)}...</p>
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              {job.publishedAt ? new Date(job.publishedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "Récent"}
            </span>
            <span className="text-xs font-medium text-orange-500 flex items-center gap-1">
              Postuler <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Categories ──
function CategoriesSection({ categories }: { categories: Array<any> }) {
  return (
    <section id="categories" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-3xl font-bold text-center text-slate-900 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Explorer par Catégorie
        </motion.h2>
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.icon || "Monitor"] || Monitor;
            return (
              <motion.div key={cat.id} variants={fadeUp}>
                <Link to={`/jobs?categoryId=${cat.id}`}>
                  <div className="bg-white border border-slate-200 rounded-xl p-5 text-center hover:border-orange-300 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group">
                    <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: `${cat.color || "#f97316"}15` }}>
                      <Icon className="w-5 h-5" style={{ color: cat.color || "#f97316" }} />
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800 mb-1">{cat.name}</h4>
                    <span className="text-xs text-slate-400">{cat.jobCount ?? 0} offres</span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// ── CTA Banner ──
function CTABanner() {
  return (
    <section className="py-20 bg-orange-500 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: 4 + Math.random() * 12,
              height: 4 + Math.random() * 12,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Vous êtes Recruteur ?
        </motion.h2>
        <motion.p
          className="text-white/85 text-lg max-w-xl mx-auto mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Publiez vos offres, accédez à notre CVthèque, et gérez vos candidats avec notre ATS puissant.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Link to="/register?type=company">
            <Button className="bg-white text-orange-500 hover:bg-white/90 rounded-full px-8 py-6 text-base font-semibold shadow-lg">
              Créer un Compte Entreprise
            </Button>
          </Link>
          <a href="#" className="text-white underline underline-offset-4 hover:text-white/80 text-sm">
            En savoir plus →
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// ── Latest Jobs ──
function LatestJobs({ jobs }: { jobs: Array<any> }) {
  if (!jobs.length) return null;

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <motion.h2
            className="text-3xl font-bold text-slate-900"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Dernières Offres
          </motion.h2>
          <Link to="/jobs" className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1">
            Voir tout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── Testimonials ──
function Testimonials() {
  const testimonials = [
    { name: "Amine Benali", role: "Développeur Full Stack", company: "Capgemini Maroc", text: "Grâce à ReKrute, j'ai trouvé mon emploi de rêve en moins de 2 semaines. La plateforme est intuitive et les alertes sont très utiles." },
    { name: "Sara El Amrani", role: "Chef de Projet Marketing", company: "Attijariwafa Bank", text: "J'apprécie la qualité des offres proposées. Chaque poste est détaillé et le processus de candidature est rapide et efficace." },
    { name: "Youssef Tahiri", role: "Ingénieur DevOps", company: "OCP Group", text: "Le suivi des candidatures est excellent. Je peux voir exactement où en est chaque candidature. Une vraie plateforme moderne !" },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-3xl font-bold text-center text-slate-900 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Ils Ont Trouvé Leur Job Grâce à <span className="text-orange-500">ReKrute</span>
        </motion.h2>
        <motion.div
          className="grid md:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((t, i) => (
            <motion.div key={i} variants={fadeUp} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-orange-500 text-4xl font-serif mb-4">&ldquo;</div>
              <p className="text-slate-600 text-sm leading-relaxed mb-5 italic">{t.text}</p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.role} — {t.company}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
