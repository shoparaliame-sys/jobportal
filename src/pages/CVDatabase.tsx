import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, Filter, MapPin, Briefcase, Award, Download,
  FileText, Mail, Phone, User, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

export default function CVDatabase() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    search: "",
    city: "",
    skills: "",
  });
  const [page, setPage] = useState(1);

  const { data: candidates, isLoading } = trpc.user.searchCandidates.useQuery(
    {
      search: filters.search,
      city: filters.city,
      skills: filters.skills ? [filters.skills] : undefined,
      page,
      limit: 12,
    },
    { enabled: user?.role === "company" || user?.role === "admin" }
  );

  const downloadMutation = trpc.user.downloadResume.useMutation({
    onSuccess: (url) => {
      window.open(url, "_blank");
      toast.success("Téléchargement en cours...");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors du téléchargement");
    },
  });

  if (user?.role !== "company" && user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Accès refusé</h1>
          <p className="text-slate-600 mt-2">Seules les entreprises et admins peuvent accéder à la CVthèque</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-slate-900 mb-2">CVthèque</h1>
            <p className="text-slate-600">
              Parcourez notre base de candidats et trouvez les meilleurs talents
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-slate-900">Filtres</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Rechercher par nom ou titre
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Développeur, Ahmed..."
                  value={filters.search}
                  onChange={(e) => {
                    setFilters({ ...filters, search: e.target.value });
                    setPage(1);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Ville
                </label>
                <Input
                  type="text"
                  placeholder="Casablanca, Rabat..."
                  value={filters.city}
                  onChange={(e) => {
                    setFilters({ ...filters, city: e.target.value });
                    setPage(1);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Compétences
                </label>
                <Input
                  type="text"
                  placeholder="React, Python, SQL..."
                  value={filters.skills}
                  onChange={(e) => {
                    setFilters({ ...filters, skills: e.target.value });
                    setPage(1);
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* Candidates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 animate-pulse"
                >
                  <div className="h-10 w-10 bg-slate-200 rounded-full mb-4" />
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              ))
            ) : candidates?.candidates && candidates.candidates.length > 0 ? (
              candidates.candidates.map((candidate) => (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="p-6 pb-4 border-b border-slate-100">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {candidate.firstName} {candidate.lastName}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {candidate.role === "seeker" ? "Demandeur d'emploi" : candidate.role}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 space-y-3">
                    {candidate.city && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        {candidate.city}
                      </div>
                    )}

                    {candidate.email && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <a href={`mailto:${candidate.email}`} className="hover:text-orange-500">
                          {candidate.email}
                        </a>
                      </div>
                    )}

                    {candidate.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <a href={`tel:${candidate.phone}`} className="hover:text-orange-500">
                          {candidate.phone}
                        </a>
                      </div>
                    )}

                    {candidate.skills && candidate.skills.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-slate-700 mb-2 flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          Compétences
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {(candidate.skills as string[]).slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="inline-block bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                          {(candidate.skills as string[]).length > 3 && (
                            <span className="inline-block bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs">
                              +{(candidate.skills as string[]).length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="p-6 pt-4 border-t border-slate-100 space-y-2">
                    {candidate.resumeUrl && (
                      <Button
                        onClick={() => downloadMutation.mutate({ userId: candidate.id })}
                        disabled={downloadMutation.isPending}
                        className="w-full bg-orange-500 hover:bg-orange-600"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {downloadMutation.isPending ? "Téléchargement..." : "Télécharger CV"}
                      </Button>
                    )}
                    <Button variant="outline" className="w-full" size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      Contacter
                    </Button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">Aucun candidat trouvé</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {candidates && candidates.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                variant="outline"
              >
                Précédent
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: candidates.totalPages }).map((_, i) => (
                  <Button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    variant={page === i + 1 ? "default" : "outline"}
                    size="sm"
                    className={page === i + 1 ? "bg-orange-500" : ""}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button
                onClick={() => setPage(Math.min(candidates.totalPages, page + 1))}
                disabled={page === candidates.totalPages}
                variant="outline"
              >
                Suivant
              </Button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
