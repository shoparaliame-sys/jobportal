import { useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Search, MapPin, Building2, Briefcase, ArrowRight,
} from "lucide-react";

const INDUSTRIES = ["Banque & Finance", "Télécommunications", "Informatique & Tech", "Industrie Chimique & Minière", "Transport Aérien", "Services", "Agroalimentaire", "Fintech"];

export default function Companies() {
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.company.list.useQuery({
    search: search || undefined,
    industry: industry || undefined,
    location: location || undefined,
    page,
    limit: 12,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Header */}
      <div className="bg-slate-900 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-white/50 mb-2">
            <Link to="/" className="hover:text-white">Accueil</Link>
            <span>&gt;</span>
            <span className="text-white/80">Entreprises</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Entreprises</h1>
          <p className="text-white/60">{data?.total ?? 0} entreprises recrutent au Maroc</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une entreprise..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full bg-transparent text-sm outline-none text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <select
              value={industry}
              onChange={(e) => { setIndustry(e.target.value); setPage(1); }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
            >
              <option value="">Tous les secteurs</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
            <select
              value={location}
              onChange={(e) => { setLocation(e.target.value); setPage(1); }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
            >
              <option value="">Toutes les villes</option>
              {["Casablanca", "Rabat", "Marrakech", "Tanger", "Fès"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl animate-pulse">
                <div className="h-24 bg-slate-200 rounded-t-xl" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="h-3 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.companies.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700">Aucune entreprise trouvée</h3>
          </div>
        ) : (
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {data?.companies.map((company) => (
              <Link key={company.id} to={`/companies/${company.id}`}>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group">
                  <div className="h-24 bg-gradient-to-r from-slate-800 to-slate-700 relative">
                    {company.coverUrl ? (
                      <img src={company.coverUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-orange-900/30" />
                    )}
                  </div>
                  <div className="p-5 relative">
                    <div className="w-14 h-14 rounded-lg bg-white border-2 border-slate-100 flex items-center justify-center text-xl font-bold text-slate-700 shadow-sm -mt-12 mb-3">
                      {company.name.charAt(0)}
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 mb-1 group-hover:text-orange-500 transition-colors">
                      {company.name}
                    </h3>
                    <p className="text-sm text-slate-500 mb-1">{company.industry || "—"}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mb-3">
                      <MapPin className="w-3 h-3" />{company.city || "Maroc"}
                    </p>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-3">{company.description || "Aucune description disponible."}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-xs text-orange-500 font-medium flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {company.jobCount ?? 0} offre(s)
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {Array.from({ length: data.totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`w-9 h-9 rounded-lg text-sm font-medium ${
                  page === i + 1
                    ? "bg-orange-500 text-white"
                    : "bg-white border border-slate-200 text-slate-700 hover:border-orange-300"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
