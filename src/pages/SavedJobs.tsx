import { useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Bookmark, MapPin, Clock, Building2,
  Trash2, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

export default function SavedJobs() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  const { data: savedJobs, isLoading, refetch } = trpc.job.savedJobs.useQuery(
    { page, limit: 10 },
    { enabled: user?.role === "seeker" }
  );

  const unsaveMutation = trpc.job.unsaveJob.useMutation({
    onSuccess: () => {
      toast.success("Offre supprimée des favoris");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (user?.role !== "seeker") {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Accès refusé</h1>
          <p className="text-slate-600 mt-2">
            Cette page est réservée aux demandeurs d'emploi
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 mb-2">
              <Bookmark className="w-8 h-8 text-orange-500" />
              Offres sauvegardées
            </h1>
            <p className="text-slate-600">
              {savedJobs?.total || 0} offre{(savedJobs?.total || 0) !== 1 ? "s" : ""} en attente
            </p>
          </motion.div>

          {/* Jobs List */}
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 animate-pulse"
                >
                  <div className="h-4 bg-slate-200 rounded w-1/2 mb-3" />
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                </div>
              ))
            ) : savedJobs?.jobs && savedJobs.jobs.length > 0 ? (
              savedJobs.jobs.map((job) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-all overflow-hidden group"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      {/* Left Side */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/jobs/${job.id}`}
                          className="text-lg font-semibold text-slate-900 hover:text-orange-500 transition-colors block truncate"
                        >
                          {job.title}
                        </Link>

                        <div className="flex flex-col gap-2 mt-3 text-sm text-slate-600">
                          {job.company && (
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 flex-shrink-0" />
                              <Link
                                to={`/companies/${job.company.id}`}
                                className="hover:text-orange-500 truncate"
                              >
                                {job.company.name}
                              </Link>
                            </div>
                          )}

                          {job.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 flex-shrink-0" />
                              {job.location}
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            {job.jobType && (
                              <span className="capitalize">{job.jobType}</span>
                            )}
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          {job.experienceLevel && (
                            <span className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                              {job.experienceLevel}
                            </span>
                          )}
                          {job.sourceType === "internal" ? (
                            <span className="inline-block bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium">
                              Offre interne
                            </span>
                          ) : (
                            <span className="inline-block bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-medium">
                              Offre importée
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Side - Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <Link to={`/jobs/${job.id}`}>
                          <Button
                            variant="outline"
                            className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300"
                          >
                            Voir
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                        <Button
                          onClick={() => unsaveMutation.mutate({ jobId: job.id })}
                          disabled={unsaveMutation.isPending}
                          variant="outline"
                          className="text-red-600 hover:bg-red-50 hover:border-red-300"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-white rounded-lg border border-slate-200"
              >
                <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 mb-4">Vous n'avez aucune offre sauvegardée</p>
                <Link to="/jobs">
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    Parcourir les offres
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>

          {/* Pagination */}
          {savedJobs && savedJobs.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                variant="outline"
              >
                Précédent
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: savedJobs.totalPages }).map((_, i) => (
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
                onClick={() => setPage(Math.min(savedJobs.totalPages, page + 1))}
                disabled={page === savedJobs.totalPages}
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
