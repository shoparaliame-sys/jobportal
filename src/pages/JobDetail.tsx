import { useParams, Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  MapPin, Briefcase, Clock, Banknote, Building2, Calendar,
  ExternalLink, Bookmark, Share2, ArrowLeft, CheckCircle,
  Globe,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const jobId = Number(id);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  const { data: job, isLoading } = trpc.job.getById.useQuery({ id: jobId });
  const { data: similarJobs } = trpc.job.similar.useQuery({ jobId, limit: 3 });
  const { data: savedState } = trpc.job.isSaved.useQuery(
    { jobId },
    { enabled: isAuthenticated && !!job && user?.role === "seeker" }
  );
  const { data: hasApplied } = trpc.application.checkApplied.useQuery(
    { jobId },
    { enabled: isAuthenticated && job?.sourceType === "internal" }
  );
  const utils = trpc.useUtils();

  const applyMutation = trpc.application.submitApplication.useMutation({
    onSuccess: () => {
      toast.success("Candidature envoyée avec succès !");
      setShowApplyModal(false);
      utils.application.checkApplied.invalidate({ jobId });
    },
    onError: (err) => {
      toast.error(err.message || "Erreur lors de la candidature");
    },
  });

  const saveJobMutation = trpc.job.saveJob.useMutation({
    onSuccess: async () => {
      toast.success("Offre ajoutée aux favoris");
      await utils.job.isSaved.invalidate({ jobId });
      await utils.job.savedJobs.invalidate();
    },
    onError: (err) => {
      if (err.message === "Job already saved") {
        toast.info("Cette offre est déjà dans vos favoris");
        return;
      }
      toast.error(err.message || "Erreur lors de la sauvegarde");
    },
  });

  const unsaveJobMutation = trpc.job.unsaveJob.useMutation({
    onSuccess: async () => {
      toast.success("Offre retirée des favoris");
      await utils.job.isSaved.invalidate({ jobId });
      await utils.job.savedJobs.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Erreur lors de la suppression des favoris");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="pt-24 pb-16 max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-slate-200 rounded w-1/3" />
            <div className="h-4 bg-slate-200 rounded w-1/2" />
            <div className="h-32 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Offre introuvable</h2>
          <Link to="/jobs" className="text-orange-500 hover:underline">Retour aux offres</Link>
        </div>
      </div>
    );
  }

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (job.sourceType !== "internal") {
      window.open(job.sourceUrl || "#", "_blank");
      return;
    }
    setShowApplyModal(true);
  };

  const submitApplication = () => {
    applyMutation.mutate({ jobId, coverLetter: coverLetter || undefined });
  };

  const handleSaveJob = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (savedState?.isSaved) {
      unsaveJobMutation.mutate({ jobId });
      return;
    }

    saveJobMutation.mutate({ jobId });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="pt-20">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Link to="/jobs" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
              <ArrowLeft className="w-4 h-4" /> Retour aux offres
            </Link>

            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-600 shrink-0">
                {job.company?.name?.charAt(0) || "R"}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">{job.title}</h1>
                    <p className="text-slate-500 flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {job.company?.name || job.sourceName || "Maroc Offres"}
                      {job.sourceType !== "internal" && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full ml-2">
                          Importé depuis {job.sourceName}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>
                  <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{job.jobType?.toUpperCase()}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{job.experienceLevel || "Non spécifié"}</span>
                  {job.salaryMin && (
                    <span className="flex items-center gap-1"><Banknote className="w-4 h-4" />{job.salaryMin.toLocaleString()} - {job.salaryMax?.toLocaleString()} MAD</span>
                  )}
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />
                    {job.publishedAt ? new Date(job.publishedAt).toLocaleDateString("fr-FR") : "Récent"}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mt-6">
              {hasApplied ? (
                <Button disabled className="bg-green-500 hover:bg-green-500 text-white gap-2">
                  <CheckCircle className="w-4 h-4" /> Déjà postulé
                </Button>
              ) : (
                <Button onClick={handleApply} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                  {job.sourceType === "internal" ? "Postuler Maintenant" : "Postuler sur le site source"}
                  {job.sourceType !== "internal" && <ExternalLink className="w-4 h-4" />}
                </Button>
              )}
              <Button
                variant={savedState?.isSaved ? "default" : "outline"}
                onClick={handleSaveJob}
                className={`gap-2 ${savedState?.isSaved ? "bg-red-500 hover:bg-red-600 text-white border-red-500" : "hover:bg-red-50 hover:text-red-600 hover:border-red-300"}`}
                disabled={saveJobMutation.isPending || unsaveJobMutation.isPending}
              >
                <Bookmark
                  className={`w-4 h-4 ${savedState?.isSaved ? "fill-white text-white" : ""}`}
                  fill={savedState?.isSaved ? "currentColor" : "none"}
                />
                {savedState?.isSaved ? "Sauvegardée" : "Sauvegarder"}
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-xl font-bold text-slate-900 mb-4">Description du poste</h2>
                <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                  {job.description}
                </div>
              </motion.section>

              {job.requirements && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                >
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Profil recherché</h2>
                  <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                    {job.requirements}
                  </div>
                </motion.section>
              )}

              {job.tags && job.tags.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Compétences</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {job.company && (
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <h3 className="font-semibold text-slate-900 mb-3">À propos de l&apos;entreprise</h3>
                  <p className="text-sm text-slate-500 line-clamp-4 mb-3">{job.company.description || "Aucune description disponible."}</p>
                  <div className="space-y-2 text-sm">
                    {job.company.industry && (
                      <span className="flex items-center gap-2 text-slate-600"><Briefcase className="w-4 h-4 text-slate-400" />{job.company.industry}</span>
                    )}
                    {job.company.city && (
                      <span className="flex items-center gap-2 text-slate-600"><MapPin className="w-4 h-4 text-slate-400" />{job.company.city}</span>
                    )}
                    {job.company.website && (
                      <a href={job.company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-orange-500 hover:underline">
                        <Globe className="w-4 h-4" />Site web
                      </a>
                    )}
                  </div>
                  <Link to={`/companies/${job.company.id}`}>
                    <Button variant="outline" className="w-full mt-4 text-sm">Voir le profil</Button>
                  </Link>
                </div>
              )}

              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="font-semibold text-slate-900 mb-3">Détails</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Type</span>
                    <span className="font-medium text-slate-700">{job.jobType?.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Expérience</span>
                    <span className="font-medium text-slate-700">{job.experienceLevel || "Non spécifié"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Localisation</span>
                    <span className="font-medium text-slate-700">{job.location}</span>
                  </div>
                  {job.salaryMin && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Salaire</span>
                      <span className="font-medium text-slate-700">{job.salaryMin.toLocaleString()} - {job.salaryMax?.toLocaleString()} MAD</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vues</span>
                    <span className="font-medium text-slate-700">{job.viewsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Candidatures</span>
                    <span className="font-medium text-slate-700">{job.applicationsCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Similar jobs */}
          {similarJobs && similarJobs.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Offres similaires</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {similarJobs.map((j) => (
                  <Link key={j.id} to={`/jobs/${j.id}`}>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all">
                      <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 mb-1">{j.title}</h3>
                      <p className="text-xs text-slate-500 mb-2">{j.company?.name || "Maroc Offres"}</p>
                      <span className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{j.location}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <Footer />

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowApplyModal(false)} />
          <motion.div
            className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Postuler — {job.title}</h3>
              <button onClick={() => setShowApplyModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Votre CV</label>
                <p className="text-sm text-slate-500">{user?.resumeUrl ? "CV déjà uploadé" : "Aucun CV — vous pouvez toujours postuler"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lettre de motivation (optionnel)</label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Expliquez pourquoi vous êtes le candidat idéal..."
                  rows={5}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-300 resize-none"
                />
              </div>
              <Button
                onClick={submitApplication}
                disabled={applyMutation.isPending}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                {applyMutation.isPending ? "Envoi en cours..." : "Envoyer ma candidature"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
