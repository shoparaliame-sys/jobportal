import { useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart3, Briefcase, Users, Settings, LogOut,
  TrendingUp, FileText,
  Plus, Edit2, Trash2, Mail, Phone, MapPin, ExternalLink, Calendar, Award,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  applied: { label: "Nouveau", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  contacted: { label: "Contacté", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  shortlisted: { label: "Présélectionné", color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
  fit: { label: "Retenu", color: "text-green-600", bg: "bg-green-50 border-green-200" },
  not_fit: { label: "Non retenu", color: "text-red-600", bg: "bg-red-50 border-red-200" },
  rejected: { label: "Refusé", color: "text-red-600", bg: "bg-red-50 border-red-200" },
};

const atsColumns = ["applied", "contacted", "shortlisted", "fit", "not_fit"] as const;

type Job = { id: number; title: string; description: string; location: string; jobType: string; status: string };

export default function CompanyDashboard() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "jobs" | "ats" | "candidates" | "settings">("overview");
  const [statusFilter] = useState("");

  const [companyForm, setCompanyForm] = useState({
    name: "",
    industry: "",
    city: "",
    contactName: "",
    contactEmail: "",
    description: "",
    website: "",
  });
  
  // Job dialog states
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobForm, setJobForm] = useState({ title: "", description: "", location: "", jobType: "cdi", categoryId: 0, tags: "", experienceLevel: "confirme", salaryMin: 0, salaryMax: 0 });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteJobId, setDeleteJobId] = useState<number | null>(null);

  // Candidate dialog states
  const [candidateDialogOpen, setCandidateDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);

  // Data queries
  const { data: stats } = trpc.application.companyStats.useQuery();
  const { data: applications } = trpc.application.list.useQuery(
    statusFilter ? { status: statusFilter, page: 1, limit: 50 } : { page: 1, limit: 50 }
  );
  const { data: myCompany } = trpc.company.myCompany.useQuery();
  const { data: myJobs } = trpc.job.myJobs.useQuery();
  const utils = trpc.useContext();

  // Mutations
  const statusMutation = trpc.application.updateStatus.useMutation({
    onSuccess: () => {
      utils.application.list.invalidate();
      utils.application.companyStats.invalidate();
      toast.success("Statut mis à jour");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const createJobMutation = trpc.job.create.useMutation({
    onSuccess: () => {
      utils.job.list.invalidate();
      setJobDialogOpen(false);
      setJobForm({ title: "", description: "", location: "", jobType: "cdi", categoryId: 0, tags: "", experienceLevel: "confirme", salaryMin: 0, salaryMax: 0 });
      toast.success("Offre créée");
    },
    onError: () => toast.error("Erreur lors de la création"),
  });

  const updateJobMutation = trpc.job.update.useMutation({
    onSuccess: () => {
      utils.job.list.invalidate();
      setJobDialogOpen(false);
      setEditingJob(null);
      setJobForm({ title: "", description: "", location: "", jobType: "cdi", categoryId: 0, tags: "", experienceLevel: "confirme", salaryMin: 0, salaryMax: 0 });
      toast.success("Offre mise à jour");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const deleteJobMutation = trpc.job.toggleStatus.useMutation({
    onSuccess: () => {
      utils.job.list.invalidate();
      setDeleteConfirmOpen(false);
      setDeleteJobId(null);
      toast.success("Offre supprimée");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const registerCompanyMutation = trpc.company.register.useMutation({
    onSuccess: () => {
      utils.company.myCompany.invalidate();
      toast.success("Profil entreprise créé. En attente de validation.");
    },
    onError: () => toast.error("Erreur lors de la création du profil"),
  });

  const handleCompanyRegister = () => {
    if (!companyForm.name.trim() || !companyForm.contactEmail.trim()) {
      toast.error("Nom et email de contact sont requis");
      return;
    }

    registerCompanyMutation.mutate({
      name: companyForm.name,
      industry: companyForm.industry || undefined,
      city: companyForm.city || undefined,
      contactName: companyForm.contactName || undefined,
      contactEmail: companyForm.contactEmail,
      description: companyForm.description || undefined,
      website: companyForm.website || undefined,
    });
  };

  const openJobDialog = (job?: Job) => {
    if (job) {
      setEditingJob(job);
      setJobForm({
        title: job.title,
        description: job.description,
        location: job.location,
        jobType: job.jobType,
        categoryId: (job as any).categoryId || 0,
        tags: (job as any).tags ? ((job as any).tags as string[]).join(", ") : "",
        experienceLevel: (job as any).experienceLevel || "confirme",
        salaryMin: (job as any).salaryMin || 0,
        salaryMax: (job as any).salaryMax || 0,
      });
    }
    setJobDialogOpen(true);
  };

  const handleJobSubmit = () => {
    if (!jobForm.title.trim() || !jobForm.description.trim()) {
      toast.error("Le titre et la description sont requis");
      return;
    }
    if (editingJob) {
      updateJobMutation.mutate({
        id: editingJob.id,
        title: jobForm.title,
        description: jobForm.description,
        location: jobForm.location,
        jobType: jobForm.jobType as any,
        tags: jobForm.tags ? jobForm.tags.split(",").map((t) => t.trim()) : undefined,
      } as any);
    } else {
      createJobMutation.mutate({
        title: jobForm.title,
        description: jobForm.description,
        location: jobForm.location,
        jobType: jobForm.jobType as any,
        categoryId: jobForm.categoryId || undefined,
        tags: jobForm.tags ? jobForm.tags.split(",").map((t) => t.trim()) : undefined,
      } as any);
    }
  };

  const navItems = [
    { key: "overview" as const, label: "Tableau de bord", icon: BarChart3 },
    { key: "jobs" as const, label: "Mes Offres", icon: Briefcase },
    { key: "ats" as const, label: "ATS Pipeline", icon: Users },
    { key: "candidates" as const, label: "Candidats", icon: FileText },
    { key: "settings" as const, label: "Paramètres", icon: Settings },
  ];

  // Chart data
  const chartData = stats?.dailyApplications?.map((d) => ({
    date: new Date(d.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
    candidatures: d.count,
  })) || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar alwaysSolid />

      <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white border border-slate-200 rounded-xl p-4 sticky top-24">
              <div className="flex items-center gap-3 p-2 mb-4 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-bold">
                  {myCompany?.name?.charAt(0) || "E"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{myCompany?.name || "Mon Entreprise"}</p>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${myCompany?.status === "approved" ? "bg-green-500" : myCompany?.status === "pending" ? "bg-amber-500" : "bg-red-500"}`} />
                    <span className="text-xs text-slate-500 capitalize">{myCompany?.status || "pending"}</span>
                  </div>
                </div>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                      activeTab === item.key
                        ? "bg-slate-100 text-slate-900"
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
            {!myCompany ? (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Finaliser l'inscription entreprise</h1>
                <p className="text-sm text-slate-500 mb-6">
                  Votre compte existe, mais le profil entreprise n'a pas encore été créé. Complétez ces informations pour apparaître dans la liste d'approbation admin.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Nom de l'entreprise</label>
                    <Input
                      value={companyForm.name}
                      onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                      placeholder="Ex: NexaCore"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Email de contact</label>
                    <Input
                      type="email"
                      value={companyForm.contactEmail}
                      onChange={(e) => setCompanyForm({ ...companyForm, contactEmail: e.target.value })}
                      placeholder="hr@exemple.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Contact</label>
                    <Input
                      value={companyForm.contactName}
                      onChange={(e) => setCompanyForm({ ...companyForm, contactName: e.target.value })}
                      placeholder="Nom du responsable"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Ville</label>
                    <Input
                      value={companyForm.city}
                      onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })}
                      placeholder="Casablanca"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Secteur</label>
                    <Input
                      value={companyForm.industry}
                      onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                      placeholder="Tech, Finance..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Site web</label>
                    <Input
                      value={companyForm.website}
                      onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                      placeholder="https://nexacore.ma"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-slate-700 block mb-2">Description</label>
                    <Textarea
                      value={companyForm.description}
                      onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                      rows={4}
                      placeholder="Décrivez votre entreprise"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <Button
                    className="bg-orange-500 hover:bg-orange-600"
                    onClick={handleCompanyRegister}
                    disabled={registerCompanyMutation.isPending}
                  >
                    {registerCompanyMutation.isPending ? "Envoi..." : "Soumettre"}
                  </Button>
                </div>
              </div>
            ) : activeTab === "overview" && (
              <div className="space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <h1 className="text-2xl font-bold text-slate-900 mb-1">
                    Bienvenue, {myCompany?.name || "Entreprise"}
                  </h1>
                  <p className="text-slate-500 text-sm">Voici un aperçu de votre activité de recrutement</p>
                </motion.div>

                {/* Stats cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Offres actives", value: stats?.activeJobs ?? 0, icon: Briefcase, color: "bg-blue-50 text-blue-600", trend: "+12%" },
                    { label: "Candidatures (30j)", value: stats?.recentApplications ?? 0, icon: Users, color: "bg-orange-50 text-orange-600", trend: "+8%" },
                    { label: "Total candidatures", value: stats?.totalApplications ?? 0, icon: FileText, color: "bg-green-50 text-green-600", trend: null },
                    { label: "Taux de conversion", value: stats?.totalApplications ? Math.round((stats.statusBreakdown?.find((s: any) => s.status === "fit")?.count ?? 0) / stats.totalApplications * 100) : 0, icon: TrendingUp, color: "bg-purple-50 text-purple-600", suffix: "%" },
                  ].map((s, i) => (
                    <motion.div
                      key={i}
                      className="bg-white border border-slate-200 rounded-xl p-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center`}>
                          <s.icon className="w-5 h-5" />
                        </div>
                        {s.trend && (
                          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{s.trend}</span>
                        )}
                      </div>
                      <div className="text-2xl font-bold text-slate-900">{s.value}{s.suffix || ""}</div>
                      <div className="text-xs text-slate-500">{s.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Chart */}
                {chartData.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Candidatures sur 30 jours</h2>
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="gradientAccent" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                        <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
                        <Tooltip
                          contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                        />
                        <Area type="monotone" dataKey="candidatures" stroke="#f97316" strokeWidth={2} fill="url(#gradientAccent)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Recent applicants */}
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Candidats récents</h2>
                  {applications?.applications && applications.applications.length > 0 ? (
                    <div className="space-y-3">
                      {applications.applications.slice(0, 5).map((app: any) => {
                        const st = statusConfig[app.status] || statusConfig.applied;
                        return (
                          <div
                            key={app.id}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                            onClick={() => { setSelectedApplication(app); setCandidateDialogOpen(true); }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-sm font-bold">
                                {(app.user?.firstName || "C").charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-900">{app.user?.firstName} {app.user?.lastName}</p>
                                <p className="text-xs text-slate-500">{app.job?.title}</p>
                              </div>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${st.color} ${st.bg}`}>
                              {st.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm text-center py-6">Aucun candidat pour le moment</p>
                  )}
                </div>
              </div>
            )}

            {myCompany && activeTab === "jobs" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-slate-900">Mes Offres</h1>
                  <Button onClick={() => { setEditingJob(null); setJobForm({ title: "", description: "", location: "", jobType: "cdi", categoryId: 0, tags: "", experienceLevel: "confirme", salaryMin: 0, salaryMax: 0 }); setJobDialogOpen(true); }} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                    <Plus className="w-4 h-4" /> Nouvelle Offre
                  </Button>
                </div>
                {myJobs && myJobs.jobs && myJobs.jobs.length > 0 ? (
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="text-left px-4 py-3 font-medium text-slate-700">Titre</th>
                            <th className="text-left px-4 py-3 font-medium text-slate-700">Lieu</th>
                            <th className="text-left px-4 py-3 font-medium text-slate-700">Type</th>
                            <th className="text-left px-4 py-3 font-medium text-slate-700">Statut</th>
                            <th className="text-left px-4 py-3 font-medium text-slate-700">Candidatures</th>
                            <th className="text-left px-4 py-3 font-medium text-slate-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {myJobs.jobs.map((job: any) => (
                            <tr key={job.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3">
                                <Link to={`/jobs/${job.id}`} className="font-medium text-slate-900 hover:text-orange-500">{job.title}</Link>
                              </td>
                              <td className="px-4 py-3 text-slate-600">{job.location}</td>
                              <td className="px-4 py-3 text-slate-600 uppercase text-xs">{job.jobType}</td>
                              <td className="px-4 py-3">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${job.status === "active" ? "bg-green-50 text-green-600" : job.status === "paused" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}>
                                  {job.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-600">
                                {applications?.applications?.filter((a: any) => a.jobId === job.id).length || 0}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-1">
                                  <Button size="sm" variant="ghost" className="text-slate-600 h-7 px-2" onClick={() => openJobDialog(job)}>
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="text-red-600 h-7 px-2" onClick={() => { setDeleteJobId(job.id); setDeleteConfirmOpen(true); }}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                    <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 mb-2">Vous n&apos;avez pas encore d&apos;offres</p>
                    <p className="text-slate-400 text-sm mb-4">Créez une première offre pour commencer votre recrutement</p>
                    <Button onClick={() => { setEditingJob(null); setJobForm({ title: "", description: "", location: "", jobType: "cdi", categoryId: 0, tags: "", experienceLevel: "confirme", salaryMin: 0, salaryMax: 0 }); setJobDialogOpen(true); }} className="bg-orange-500 hover:bg-orange-600 gap-2">
                      <Plus className="w-4 h-4" /> Créer une offre
                    </Button>
                  </div>
                )}
              </div>
            )}

            {myCompany && activeTab === "ats" && (
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-6">ATS Pipeline</h1>
                <div className="overflow-x-auto">
                  <div className="flex gap-4 min-w-[800px]">
                    {atsColumns.map((col) => {
                      const colApps = applications?.applications?.filter((a: any) => a.status === col) || [];
                      const st = statusConfig[col];
                      return (
                        <div key={col} className="flex-1 min-w-0">
                          <div className={`flex items-center gap-2 p-3 rounded-lg border mb-3 ${st.bg}`}>
                            <div className={`w-2 h-2 rounded-full ${st.color.replace("text-", "bg-")}`} />
                            <span className={`text-sm font-semibold ${st.color}`}>{st.label}</span>
                            <span className="ml-auto text-xs bg-white px-2 py-0.5 rounded-full">{colApps.length}</span>
                          </div>
                          <div className="space-y-2">
                            {colApps.map((app: any) => (
                              <div
                                key={app.id}
                                className="bg-white border border-slate-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                                draggable
                                onClick={() => { setSelectedApplication(app); setCandidateDialogOpen(true); }}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                                    {(app.user?.firstName || "C").charAt(0)}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-900 truncate">{app.user?.firstName} {app.user?.lastName}</p>
                                  </div>
                                </div>
                                <p className="text-xs text-slate-500 truncate">{app.job?.title}</p>
                                <p className="text-xs text-slate-400 mt-1">
                                  {app.createdAt ? new Date(app.createdAt).toLocaleDateString("fr-FR") : "—"}
                                </p>
                                <div onClick={(e) => e.stopPropagation()}>
                                  <select
                                    value={app.status}
                                    onChange={(e) => statusMutation.mutate({ id: app.id, status: e.target.value as any })}
                                    className="mt-2 w-full text-xs border border-slate-200 rounded px-2 py-1 outline-none"
                                  >
                                    {Object.entries(statusConfig).map(([key, val]) => (
                                      <option key={key} value={key}>{val.label}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            ))}
                            {colApps.length === 0 && (
                              <div className="text-center py-4 text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                                Vide
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {myCompany && activeTab === "candidates" && (
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-6">Tous les Candidats</h1>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="text-left px-4 py-3 font-medium text-slate-700">Candidat</th>
                          <th className="text-left px-4 py-3 font-medium text-slate-700">Poste</th>
                          <th className="text-left px-4 py-3 font-medium text-slate-700">Date</th>
                          <th className="text-left px-4 py-3 font-medium text-slate-700">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {applications?.applications?.map((app: any) => {
                          const st = statusConfig[app.status] || statusConfig.applied;
                          return (
                            <tr key={app.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => { setSelectedApplication(app); setCandidateDialogOpen(true); }}>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-bold">
                                    {(app.user?.firstName || "C").charAt(0)}
                                  </div>
                                  <span className="font-medium text-slate-900">{app.user?.firstName} {app.user?.lastName}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-slate-600">{app.job?.title}</td>
                              <td className="px-4 py-3 text-slate-500">
                                {app.createdAt ? new Date(app.createdAt).toLocaleDateString("fr-FR") : "—"}
                              </td>
                              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                <select
                                  value={app.status}
                                  onChange={(e) => statusMutation.mutate({ id: app.id, status: e.target.value as any })}
                                  className={`text-xs px-2 py-1 rounded-full border outline-none ${st.bg} ${st.color}`}
                                >
                                  {Object.entries(statusConfig).map(([key, val]) => (
                                    <option key={key} value={key}>{val.label}</option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {(!applications?.applications || applications.applications.length === 0) && (
                    <div className="text-center py-8 text-slate-400 text-sm">Aucun candidat</div>
                  )}
                </div>
              </div>
            )}

            {myCompany && activeTab === "settings" && (
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-6">Paramètres</h1>
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Informations de l&apos;entreprise</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Nom</span>
                      <span className="font-medium text-slate-900">{myCompany?.name || "—"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Statut</span>
                      <span className={`font-medium capitalize ${myCompany?.status === "approved" ? "text-green-600" : "text-amber-600"}`}>
                        {myCompany?.status || "pending"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Secteur</span>
                      <span className="font-medium text-slate-900">{myCompany?.industry || "—"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Ville</span>
                      <span className="font-medium text-slate-900">{myCompany?.city || "—"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Job Dialog */}
      <Dialog open={jobDialogOpen} onOpenChange={setJobDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingJob ? "Modifier l'offre" : "Créer une offre"}</DialogTitle>
            <DialogDescription>{editingJob ? "Mettez à jour les détails de l'offre" : "Créez une nouvelle offre d'emploi"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Titre</label>
              <Input
                placeholder="Ex: Développeur Full Stack"
                value={jobForm.title}
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Description</label>
              <Textarea
                placeholder="Décrivez le poste et ses responsabilités"
                value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Lieu</label>
                <Input
                  placeholder="Ex: Paris, France"
                  value={jobForm.location}
                  onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Type</label>
                <select
                  value={jobForm.jobType}
                  onChange={(e) => setJobForm({ ...jobForm, jobType: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none"
                >
                  <option value="cdi">CDI</option>
                  <option value="cdd">CDD</option>
                  <option value="stage">Stage</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Tags (séparés par virgules)</label>
              <Input
                placeholder="Ex: React, TypeScript, Node.js"
                value={jobForm.tags}
                onChange={(e) => setJobForm({ ...jobForm, tags: e.target.value })}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setJobDialogOpen(false)}>Annuler</Button>
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white flex-1"
                onClick={handleJobSubmit}
                disabled={createJobMutation.isPending || updateJobMutation.isPending}
              >
                {editingJob ? "Mettre à jour" : "Créer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'offre?</DialogTitle>
            <DialogDescription>
              Cette action est définitive. Êtes-vous sûr de vouloir supprimer cette offre?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Annuler</Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white flex-1"
              onClick={() => {
                if (deleteJobId) deleteJobMutation.mutate({ id: deleteJobId, status: "closed" } as any);
              }}
              disabled={deleteJobMutation.isPending}
            >
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Candidate Details Dialog */}
      <Dialog open={candidateDialogOpen} onOpenChange={setCandidateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          {selectedApplication && (
            <>
              <DialogHeader className="mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-2xl font-bold">
                      {(selectedApplication.user?.firstName || "C").charAt(0)}
                    </div>
                    <div>
                      <DialogTitle className="text-xl">
                        {selectedApplication.user?.firstName} {selectedApplication.user?.lastName}
                      </DialogTitle>
                      <DialogDescription className="text-slate-500 mt-1">
                        Candidature pour <span className="font-medium text-slate-900">{selectedApplication.job?.title}</span>
                      </DialogDescription>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Contact Info */}
                <div className="grid sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <a href={`mailto:${selectedApplication.user?.email}`} className="hover:text-orange-500">
                      {selectedApplication.user?.email}
                    </a>
                  </div>
                  {selectedApplication.user?.phone && (
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <a href={`tel:${selectedApplication.user.phone}`} className="hover:text-orange-500">
                        {selectedApplication.user.phone}
                      </a>
                    </div>
                  )}
                  {selectedApplication.user?.city && (
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {selectedApplication.user.city}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    A postulé le {new Date(selectedApplication.createdAt).toLocaleDateString("fr-FR")}
                  </div>
                </div>

                {/* Resume/CV */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-500" /> CV et Documents
                  </h3>
                  {selectedApplication.user?.resumeUrl ? (
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-orange-200 hover:bg-orange-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">Curriculum Vitae</p>
                          <p className="text-xs text-slate-500">Document attaché au profil</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="gap-2 border-orange-200 text-orange-600 hover:bg-orange-100 hover:text-orange-700"
                        onClick={() => window.open(selectedApplication.user.resumeUrl, "_blank")}
                      >
                        <ExternalLink className="w-4 h-4" /> Voir le CV
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center">
                      <p className="text-sm text-slate-500">Le candidat n'a pas fourni de CV sur son profil.</p>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {selectedApplication.user?.skills && Array.isArray(selectedApplication.user.skills) && selectedApplication.user.skills.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4 text-orange-500" /> Compétences
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplication.user.skills.map((skill: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Update Status */}
                <div className="pt-4 border-t border-slate-100">
                  <label className="text-sm font-semibold text-slate-900 mb-3 block">
                    Statut de la candidature
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedApplication.status}
                      onChange={(e) => {
                        statusMutation.mutate({ id: selectedApplication.id, status: e.target.value as any });
                        setSelectedApplication({ ...selectedApplication, status: e.target.value });
                      }}
                      className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    >
                      {Object.entries(statusConfig).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
