import { useState } from "react";
import { useSearchParams, Link } from "react-router";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Search, MapPin, Briefcase, Banknote, Clock,
  Grid3X3, List, X,
} from "lucide-react";

const JOB_TYPES = [
  { value: "cdi", label: "CDI" },
  { value: "cdd", label: "CDD" },
  { value: "stage", label: "Stage" },
  { value: "freelance", label: "Freelance" },
  { value: "interim", label: "Intérim" },
];

const EXP_LEVELS = [
  { value: "junior", label: "Junior" },
  { value: "confirme", label: "Confirmé" },
  { value: "senior", label: "Senior" },
  { value: "expert", label: "Expert" },
];

const CITIES = [
  "Casablanca", "Rabat", "Marrakech", "Tanger", "Fès",
  "Agadir", "Oujda", "Tétouan", "Salé", "Kenitra",
  "Mohammedia", "El Jadida", "Safi", "Béni Mellal", "Nador",
  "Meknès", "Khouribga", "Settat", "Taza", "Errachidia",
  "Laâyoune", "Dakhla", "Guelmim", "Essaouira", "Ifrane",
];

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [page, setPage] = useState(1);

  const keyword = searchParams.get("keyword") || undefined;
  const location = searchParams.get("location") || undefined;
  const categoryId = searchParams.get("categoryId") ? Number(searchParams.get("categoryId")) : undefined;
  const jobType = searchParams.get("jobType") || undefined;
  const experienceLevel = searchParams.get("experienceLevel") || undefined;

  const { data, isLoading } = trpc.job.list.useQuery({
    keyword,
    location,
    categoryId,
    jobType,
    experienceLevel,
    page,
    limit: 10,
  });

  const { data: categories } = trpc.category.list.useQuery();

  const updateFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
    setPage(1);
  };

  const activeFilters = [
    ...(keyword ? [{ key: "keyword", label: `Mot-clé: ${keyword}` }] : []),
    ...(location ? [{ key: "location", label: `Ville: ${location}` }] : []),
    ...(jobType ? [{ key: "jobType", label: `Type: ${jobType.toUpperCase()}` }] : []),
    ...(experienceLevel ? [{ key: "experienceLevel", label: `Exp: ${experienceLevel}` }] : []),
    ...(categoryId ? [{ key: "categoryId", label: `Cat: ${categories?.find(c => c.id === categoryId)?.name || ""}` }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Page Header */}
      <div className="bg-slate-900 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-white/50 mb-2">
            <Link to="/" className="hover:text-white">Accueil</Link>
            <span>&gt;</span>
            <span className="text-white/80">Offres d&apos;emploi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Offres d&apos;Emploi</h1>
          <p className="text-white/60">{data?.total ?? 0} offres disponibles au Maroc</p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-[72px] z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {/* Search */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un poste..."
                defaultValue={keyword || ""}
                onChange={(e) => {
                  const timeout = setTimeout(() => updateFilter("keyword", e.target.value || undefined), 300);
                  return () => clearTimeout(timeout);
                }}
                className="w-full bg-transparent text-sm outline-none text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${viewMode === "list" ? "bg-slate-100 text-slate-900" : "text-slate-400"}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-slate-100 text-slate-900" : "text-slate-400"}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter row */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <select
              value={location || ""}
              onChange={(e) => updateFilter("location", e.target.value || undefined)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-orange-300"
            >
              <option value="">Toutes les villes</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={jobType || ""}
              onChange={(e) => updateFilter("jobType", e.target.value || undefined)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-orange-300"
            >
              <option value="">Type de contrat</option>
              {JOB_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>

            <select
              value={experienceLevel || ""}
              onChange={(e) => updateFilter("experienceLevel", e.target.value || undefined)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-orange-300"
            >
              <option value="">Expérience</option>
              {EXP_LEVELS.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>

            <select
              value={categoryId || ""}
              onChange={(e) => updateFilter("categoryId", e.target.value || undefined)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-orange-300"
            >
              <option value="">Catégorie</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Active filters */}
          {activeFilters.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {activeFilters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => updateFilter(f.key, undefined)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-medium hover:bg-orange-100"
                >
                  {f.label}
                  <X className="w-3 h-3" />
                </button>
              ))}
              {activeFilters.length > 1 && (
                <button
                  onClick={() => {
                    setSearchParams(new URLSearchParams());
                    setPage(1);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-700 underline"
                >
                  Réinitialiser
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500">{data?.total ?? 0} résultat(s)</p>
          <select className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 outline-none">
            <option>Plus récent</option>
            <option>Plus populaire</option>
          </select>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/4 mb-3" />
                <div className="h-3 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : data?.jobs.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Aucune offre trouvée</h3>
            <p className="text-slate-500 text-sm">Essayez de modifier vos critères de recherche</p>
          </div>
        ) : viewMode === "list" ? (
          <div className="space-y-3">
            {data?.jobs.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Link to={`/jobs/${job.id}`}>
                  <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-600 shrink-0">
                        {job.company?.name?.charAt(0) || "R"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-base font-semibold text-slate-900 line-clamp-1">{job.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${
                            job.sourceType === "internal" ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"
                          }`}>
                            {job.sourceType === "internal" ? "Direct" : `Via ${job.sourceName || "RSS"}`}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mb-2">{job.company?.name || "Maroc Offres"}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                          <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{job.jobType?.toUpperCase()}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.experienceLevel}</span>
                          {job.salaryMin && (
                            <span className="flex items-center gap-1"><Banknote className="w-3 h-3" />{job.salaryMin.toLocaleString()} - {job.salaryMax?.toLocaleString()} MAD</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {data?.jobs.map((job) => (
              <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Link to={`/jobs/${job.id}`}>
                  <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all h-full">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm">
                          {job.company?.name?.charAt(0) || "R"}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{job.company?.name || "Maroc Offres"}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        job.sourceType === "internal" ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"
                      }`}>
                        {job.sourceType === "internal" ? "Direct" : `Via ${job.sourceName || "RSS"}`}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 mb-2 line-clamp-2">{job.title}</h3>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                      <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{job.jobType?.toUpperCase()}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Précédent
            </Button>
            {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
              const p = i + 1;
              return (
                <Button
                  key={p}
                  variant={page === p ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(p)}
                  className={page === p ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}
                >
                  {p}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
            >
              Suivant
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
