import { useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  User, Briefcase, Bookmark, Settings, LogOut,
  MapPin, Clock, FileText, CheckCircle,
  XCircle, AlertCircle, Eye, Trash2, DollarSign, Building2,
} from "lucide-react";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  applied: { label: "Postulé", color: "bg-blue-50 text-blue-600", icon: FileText },
  contacted: { label: "Contacté", color: "bg-amber-50 text-amber-600", icon: AlertCircle },
  shortlisted: { label: "Présélectionné", color: "bg-orange-50 text-orange-600", icon: Eye },
  fit: { label: "Retenu", color: "bg-green-50 text-green-600", icon: CheckCircle },
  not_fit: { label: "Non retenu", color: "bg-red-50 text-red-600", icon: XCircle },
  rejected: { label: "Refusé", color: "bg-red-50 text-red-600", icon: XCircle },
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "applications" | "saved" | "profile">("overview");
  const [page] = useState(1);

  const { data: applications } = trpc.application.myApplications.useQuery();
  const { data: savedJobs, isLoading: savedJobsLoading, refetch: refetchSavedJobs } = trpc.job.savedJobs.useQuery(
    { page, limit: 10 },
    { enabled: activeTab === "saved" }
  );

  const unsaveMutation = trpc.job.unsaveJob.useMutation({
    onSuccess: () => {
      toast.success("Offre supprimée des favoris");
      refetchSavedJobs();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const stats = [
    { label: "Candidatures", value: applications?.length ?? 0, icon: Briefcase, color: "bg-blue-50 text-blue-600" },
    { label: "En cours", value: applications?.filter((a) => ["applied", "contacted", "shortlisted"].includes(a.status as string)).length ?? 0, icon: Clock, color: "bg-amber-50 text-amber-600" },
    { label: "Retenus", value: applications?.filter((a) => a.status === "fit").length ?? 0, icon: CheckCircle, color: "bg-green-50 text-green-600" },
  ];

  const navItems = [
    { key: "overview" as const, label: "Tableau de bord", icon: User },
    { key: "applications" as const, label: "Mes candidatures", icon: Briefcase },
    { key: "saved" as const, label: "Offres sauvegardées", icon: Bookmark },
    { key: "profile" as const, label: "Mon profil", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar alwaysSolid />

      <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white border border-slate-200 rounded-xl p-4 sticky top-24">
              <div className="flex items-center gap-3 p-2 mb-4 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                  {(user?.firstName || user?.name || "U").charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                      activeTab === item.key
                        ? "bg-slate-100 text-slate-900 border-l-3 border-orange-500"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </nav>

              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-4 pt-4 border-t border-slate-100"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <h1 className="text-2xl font-bold text-slate-900 mb-1">
                    Bonjour, {user?.firstName || "Candidat"}
                  </h1>
                  <p className="text-slate-500 text-sm">
                    {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {stats.map((s, i) => (
                    <motion.div
                      key={i}
                      className="bg-white border border-slate-200 rounded-xl p-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
                        <s.icon className="w-5 h-5" />
                      </div>
                      <div className="text-2xl font-bold text-slate-900">{s.value}</div>
                      <div className="text-xs text-slate-500">{s.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Recent applications */}
                <section className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">Candidatures récentes</h2>
                    <button onClick={() => setActiveTab("applications")} className="text-sm text-orange-500 hover:underline">
                      Voir tout
                    </button>
                  </div>
                  {applications && applications.length > 0 ? (
                    <div className="space-y-3">
                      {applications.slice(0, 5).map((app) => {
                        const status = statusConfig[app.status as string] || statusConfig.applied;
                        return (
                          <Link key={app.id} to={`/jobs/${app.jobId}`}>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{app.job?.title}</p>
                                <p className="text-xs text-slate-500">{app.job?.company?.name || "—"}</p>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${status.color}`}>
                                {status.label}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      Aucune candidature pour le moment
                    </div>
                  )}
                </section>
              </div>
            )}

            {activeTab === "applications" && (
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-6">Mes Candidatures</h1>
                {applications && applications.length > 0 ? (
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="text-left px-4 py-3 font-medium text-slate-700">Poste</th>
                            <th className="text-left px-4 py-3 font-medium text-slate-700">Entreprise</th>
                            <th className="text-left px-4 py-3 font-medium text-slate-700">Date</th>
                            <th className="text-left px-4 py-3 font-medium text-slate-700">Statut</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {applications.map((app) => {
                            const status = statusConfig[app.status as string] || statusConfig.applied;
                            return (
                              <tr key={app.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3">
                                  <Link to={`/jobs/${app.jobId}`} className="font-medium text-slate-900 hover:text-orange-500">
                                    {app.job?.title}
                                  </Link>
                                </td>
                                <td className="px-4 py-3 text-slate-500">{app.job?.company?.name || "—"}</td>
                                <td className="px-4 py-3 text-slate-500">
                                  {app.createdAt ? new Date(app.createdAt).toLocaleDateString("fr-FR") : "—"}
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>
                                    {status.label}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                    <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">Aucune candidature pour le moment</p>
                    <Link to="/jobs">
                      <Button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white">Parcourir les offres</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === "saved" && (
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-6">Offres Sauvegardées</h1>
                {savedJobsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 animate-pulse">
                        <div className="h-4 bg-slate-200 rounded w-1/2 mb-2" />
                        <div className="h-3 bg-slate-100 rounded w-1/3" />
                      </div>
                    ))}
                  </div>
                ) : savedJobs?.jobs && savedJobs.jobs.length > 0 ? (
                  <div className="space-y-4">
                    {savedJobs.jobs.map((job: any) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-all"
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <Link
                              to={`/jobs/${job.id}`}
                              className="text-lg font-semibold text-slate-900 hover:text-orange-500 transition-colors"
                            >
                              {job.title}
                            </Link>
                            <div className="flex flex-col gap-2 mt-2 text-sm text-slate-600">
                              {job.company && (
                                <div className="flex items-center gap-2">
                                  <Building2 className="w-4 h-4" />
                                  {job.company.name}
                                </div>
                              )}
                              {job.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  {job.location}
                                </div>
                              )}
                              {job.jobType && (
                                <div className="flex items-center gap-2">
                                  <Briefcase className="w-4 h-4" />
                                  {job.jobType}
                                </div>
                              )}
                              {job.salaryMin && (
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4" />
                                  {job.salaryMin} - {job.salaryMax} {job.salaryCurrency}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Link to={`/jobs/${job.id}`}>
                              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                                Voir détails
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => unsaveMutation.mutate({ jobId: job.id })}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                    <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">Aucune offre sauvegardée</p>
                    <Link to="/jobs">
                      <Button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white">Parcourir les offres</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === "profile" && (
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-6">Mon Profil</h1>
                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-slate-700">Prénom</Label>
                      <p className="text-sm text-slate-900 font-medium mt-1">{user?.firstName || "—"}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-slate-700">Nom</Label>
                      <p className="text-sm text-slate-900 font-medium mt-1">{user?.lastName || "—"}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-700">Email</Label>
                    <p className="text-sm text-slate-900 font-medium mt-1">{user?.email || "—"}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-700">Téléphone</Label>
                    <p className="text-sm text-slate-900 font-medium mt-1">{user?.phone || "—"}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-700">Ville</Label>
                    <p className="text-sm text-slate-900 font-medium mt-1">{user?.city || "—"}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-700">CV</Label>
                    <p className="text-sm text-slate-900 font-medium mt-1">
                      {user?.resumeUrl ? (
                        <a href={user.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Voir mon CV
                        </a>
                      ) : (
                        "—"
                      )}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-700">Compétences</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {user?.skills?.map((skill: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">{skill}</span>
                      )) || <span className="text-sm text-slate-400">Aucune compétence renseignée</span>}
                    </div>
                  </div>
                  <Link to="/profile">
                    <Button className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white">Modifier mon profil</Button>
                  </Link>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={`block text-sm font-medium ${className}`}>{children}</label>;
}
