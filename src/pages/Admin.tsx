import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart3, Briefcase, Users, Settings, LogOut, Shield,
  TrendingUp, CheckCircle, XCircle, Clock, FileText,
  Plus, Edit2, Trash2,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-600 border-amber-200",
  approved: "bg-green-50 text-green-600 border-green-200",
  rejected: "bg-red-50 text-red-600 border-red-200",
};

type Company = { id: number; name: string; industry?: string; city?: string; contactEmail?: string; status: string };
type Job = { id: number; title: string; description: string; location: string; jobType: string; categoryId?: number };
type User = { id: number; name?: string; email: string; role: string };
type Feed = { id: number; name: string; url: string; frequency: string; status: string };

export default function Admin() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "companies" | "jobs" | "applications" | "users" | "feeds" | "settings">("overview");
  
  // Dialog states
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [feedDialogOpen, setFeedDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  // Form states
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [companyForm, setCompanyForm] = useState({ name: "", industry: "", city: "", contactEmail: "" });
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobForm, setJobForm] = useState({ title: "", description: "", location: "", jobType: "cdi", categoryId: 0 });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({ name: "", email: "", role: "user" });
  const [editingFeed, setEditingFeed] = useState<Feed | null>(null);
  const [feedForm, setFeedForm] = useState({ name: "", url: "", frequency: "daily", status: "active" });

  // Data queries
  const { data: stats } = trpc.admin.stats.useQuery();
  const { data: pendingCompanies } = trpc.admin.pendingCompanies.useQuery();
  const { data: allCompanies } = trpc.admin.allCompanies.useQuery({ page: 1, limit: 20 });
  const { data: allJobs } = trpc.admin.allJobs.useQuery({ page: 1, limit: 20 });
  const { data: allApplications } = trpc.admin.allApplications.useQuery({ page: 1, limit: 20 });
  const { data: allUsers } = trpc.admin.allUsers.useQuery({ page: 1, limit: 20 });
  const { data: feeds } = trpc.admin.feeds.useQuery();
  const utils = trpc.useContext();

  // Mutations
  const approveMutation = trpc.admin.updateCompany.useMutation({
    onSuccess: () => {
      utils.admin.pendingCompanies.invalidate();
      utils.admin.allCompanies.invalidate();
      utils.admin.stats.invalidate();
      toast.success("Entreprise approuvée");
    },
    onError: (err: any) => {
      console.error("Approve company error:", err);
      toast.error(err?.message || "Erreur lors de l'approbation");
    },
  });

  const rejectMutation = trpc.admin.updateCompany.useMutation({
    onSuccess: () => {
      utils.admin.pendingCompanies.invalidate();
      utils.admin.stats.invalidate();
      toast.success("Entreprise rejetée");
    },
    onError: (err: any) => {
      console.error("Reject company error:", err);
      toast.error(err?.message || "Erreur lors du rejet");
    },
  });

  const createCompanyMutation = trpc.admin.createCompany.useMutation({
    onSuccess: () => {
      utils.admin.allCompanies.invalidate();
      setCompanyDialogOpen(false);
      setCompanyForm({ name: "", industry: "", city: "", contactEmail: "" });
      toast.success("Entreprise crï¿½ï¿½e");
    },
    onError: () => toast.error("Erreur lors de la crï¿½ation"),
  });

  const updateCompanyMutation = trpc.admin.updateCompany.useMutation({
    onSuccess: () => {
      utils.admin.allCompanies.invalidate();
      setCompanyDialogOpen(false);
      setEditingCompany(null);
      setCompanyForm({ name: "", industry: "", city: "", contactEmail: "" });
      toast.success("Entreprise mise ï¿½ jour");
    },
    onError: () => toast.error("Erreur lors de la mise ï¿½ jour"),
  });

  const deleteCompanyMutation = trpc.admin.deleteCompany.useMutation({
    onSuccess: () => {
      utils.admin.allCompanies.invalidate();
      setDeleteConfirmOpen(false);
      setDeleteId(null);
      toast.success("Entreprise supprimï¿½e");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const createJobMutation = trpc.admin.createJob.useMutation({
    onSuccess: () => {
      utils.admin.allJobs.invalidate();
      setJobDialogOpen(false);
      setJobForm({ title: "", description: "", location: "", jobType: "cdi", categoryId: 0 });
      toast.success("Offre crï¿½ï¿½e");
    },
    onError: () => toast.error("Erreur lors de la crï¿½ation"),
  });

  const updateJobMutation = trpc.admin.updateJob.useMutation({
    onSuccess: () => {
      utils.admin.allJobs.invalidate();
      setJobDialogOpen(false);
      setEditingJob(null);
      setJobForm({ title: "", description: "", location: "", jobType: "cdi", categoryId: 0 });
      toast.success("Offre mise ï¿½ jour");
    },
    onError: () => toast.error("Erreur lors de la mise ï¿½ jour"),
  });

  const deleteJobMutation = trpc.admin.moderateJob.useMutation({
    onSuccess: () => {
      utils.admin.allJobs.invalidate();
      setDeleteConfirmOpen(false);
      setDeleteId(null);
      toast.success("Offre supprimï¿½e");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const createUserMutation = trpc.admin.createUser.useMutation({
    onSuccess: () => {
      utils.admin.allUsers.invalidate();
      setUserDialogOpen(false);
      setUserForm({ name: "", email: "", role: "user" });
      toast.success("Utilisateur crï¿½ï¿½");
    },
    onError: () => toast.error("Erreur lors de la crï¿½ation"),
  });

  const updateUserMutation = trpc.admin.updateUser.useMutation({
    onSuccess: () => {
      utils.admin.allUsers.invalidate();
      setUserDialogOpen(false);
      setEditingUser(null);
      setUserForm({ name: "", email: "", role: "user" });
      toast.success("Utilisateur mis ï¿½ jour");
    },
    onError: () => toast.error("Erreur lors de la mise ï¿½ jour"),
  });

  const deleteUserMutation = trpc.admin.deleteUser.useMutation({
    onSuccess: () => {
      utils.admin.allUsers.invalidate();
      setDeleteConfirmOpen(false);
      setDeleteId(null);
      toast.success("Utilisateur supprimï¿½");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const createFeedMutation = trpc.admin.createFeed.useMutation({
    onSuccess: () => {
      utils.admin.feeds.invalidate();
      setFeedDialogOpen(false);
      setFeedForm({ name: "", url: "", frequency: "daily", status: "active" });
      toast.success("Flux crï¿½ï¿½");
    },
    onError: () => toast.error("Erreur lors de la crï¿½ation"),
  });

  const updateFeedMutation = trpc.admin.updateFeed.useMutation({
    onSuccess: () => {
      utils.admin.feeds.invalidate();
      setFeedDialogOpen(false);
      setEditingFeed(null);
      setFeedForm({ name: "", url: "", frequency: "daily", status: "active" });
      toast.success("Flux mis ï¿½ jour");
    },
    onError: () => toast.error("Erreur lors de la mise ï¿½ jour"),
  });

  const deleteFeedMutation = trpc.admin.deleteFeed.useMutation({
    onSuccess: () => {
      utils.admin.feeds.invalidate();
      setDeleteConfirmOpen(false);
      setDeleteId(null);
      toast.success("Flux supprimï¿½");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const deleteApplicationMutation = trpc.admin.deleteApplication.useMutation({
    onSuccess: () => {
      utils.admin.allApplications.invalidate();
      setDeleteConfirmOpen(false);
      setDeleteId(null);
      toast.success("Candidature supprimï¿½e");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  // Dialog openers
  const openCompanyDialog = (company?: Company) => {
    if (company) {
      setEditingCompany(company);
      setCompanyForm({ name: company.name, industry: company.industry || "", city: company.city || "", contactEmail: company.contactEmail || "" });
    }
    setCompanyDialogOpen(true);
  };

  const openJobDialog = (job?: Job) => {
    if (job) {
      setEditingJob(job);
      setJobForm({ title: job.title, description: job.description, location: job.location, jobType: job.jobType, categoryId: job.categoryId || 0 });
    }
    setJobDialogOpen(true);
  };

  const openUserDialog = (user?: any) => {
    if (user) {
      setEditingUser(user);
      setUserForm({ name: user.name || (user.firstName ? `${user.firstName} ${user.lastName}` : ""), email: user.email, role: user.role });
    } else {
      setEditingUser(null);
      setUserForm({ name: "", email: "", role: "user" });
    }
    setUserDialogOpen(true);
  };

  const openFeedDialog = (feed?: any) => {
    if (feed) {
      setEditingFeed(feed);
      setFeedForm({ 
        name: feed.name, 
        url: feed.url, 
        frequency: feed.syncFrequency || feed.frequency || "daily", 
        status: feed.isActive || feed.status === "active" ? "active" : "inactive" 
      });
    } else {
      setEditingFeed(null);
      setFeedForm({ name: "", url: "", frequency: "daily", status: "active" });
    }
    setFeedDialogOpen(true);
  };

  // Submit handlers
  const handleCompanySubmit = () => {
    if (!companyForm.name.trim() || !companyForm.contactEmail.trim()) {
      toast.error("Le nom et l'email sont requis");
      return;
    }
    if (editingCompany) {
      updateCompanyMutation.mutate({ id: editingCompany.id, ...companyForm } as any);
    } else {
      createCompanyMutation.mutate(companyForm as any);
    }
  };

  const handleJobSubmit = () => {
    if (!jobForm.title.trim() || !jobForm.description.trim()) {
      toast.error("Le titre et la description sont requis");
      return;
    }
    const payload: any = { ...jobForm };
    if (payload.categoryId === 0) delete payload.categoryId;

    if (editingJob) {
      updateJobMutation.mutate({ id: editingJob.id, ...payload } as any);
    } else {
      createJobMutation.mutate(payload as any);
    }
  };

  const handleUserSubmit = () => {
    if (!userForm.name.trim() || !userForm.email.trim()) {
      toast.error("Le nom et l'email sont requis");
      return;
    }

    const nameParts = userForm.name.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : firstName;

    const payload = {
      email: userForm.email,
      role: userForm.role,
      firstName,
      lastName,
      password: "password123",
    };

    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, ...payload } as any);
    } else {
      createUserMutation.mutate(payload as any);
    }
  };

  const handleFeedSubmit = () => {
    if (!feedForm.name.trim() || !feedForm.url.trim()) {
      toast.error("Le nom et l'URL sont requis");
      return;
    }

    const payload = {
      name: feedForm.name,
      url: feedForm.url,
      syncFrequency: feedForm.frequency,
      isActive: feedForm.status === "active",
    };

    if (editingFeed) {
      updateFeedMutation.mutate({ id: editingFeed.id, ...payload } as any);
    } else {
      createFeedMutation.mutate(payload as any);
    }
  };

  const handleDelete = () => {
    if (!deleteId || !deleteType) return;
    if (deleteType === "company") deleteCompanyMutation.mutate({ id: deleteId } as any);
    else if (deleteType === "job") deleteJobMutation.mutate({ id: deleteId, action: "delete" } as any);
    else if (deleteType === "user") deleteUserMutation.mutate({ id: deleteId } as any);
    else if (deleteType === "feed") deleteFeedMutation.mutate({ id: deleteId } as any);
    else if (deleteType === "application") deleteApplicationMutation.mutate({ id: deleteId } as any);
  };

  const navItems = [
    { key: "overview" as const, label: "Tableau de bord", icon: BarChart3 },
    { key: "companies" as const, label: "Entreprises", icon: Briefcase },
    { key: "jobs" as const, label: "Offres", icon: FileText },
    { key: "applications" as const, label: "Candidatures", icon: Users },
    { key: "users" as const, label: "Utilisateurs", icon: Users },
    { key: "feeds" as const, label: "Flux RSS", icon: FileText },
    { key: "settings" as const, label: "Paramï¿½tres", icon: Settings },
  ];

  // Chart data
  const chartData = stats?.applicationsOverTime?.map((d: any) => ({
    date: new Date(d.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
    internes: d.internal || 0,
    externes: d.external || 0,
  })) || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="pt-24 pb-16 flex flex-col lg:flex-row">
        {/* Admin Sidebar */}
        <aside className="lg:w-60 shrink-0 bg-slate-900 min-h-screen lg:fixed lg:left-0 lg:top-0 lg:pt-24">
          <div className="p-4">
            <div className="flex items-center gap-2 px-3 py-3 mb-4 border-b border-slate-700 pb-4">
              <Shield className="w-5 h-5 text-orange-500" />
              <span className="text-white font-semibold text-sm">Panneau Admin</span>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                    activeTab === item.key
                      ? "bg-slate-800 text-white border-l-2 border-orange-500"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mt-6 pt-4 border-t border-slate-700"
            >
              <LogOut className="w-4 h-4" />
              Dï¿½connexion
            </button>
          </div>
        </aside>

        {/* Spacer for fixed sidebar */}
        <div className="hidden lg:block lg:w-60 shrink-0" />

        {/* Main content */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-slate-900">Tableau de Bord</h1>

              {/* Stats grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: "Utilisateurs", value: stats?.totalUsers ?? 0, icon: Users, color: "bg-blue-50 text-blue-600" },
                  { label: "En attente", value: stats?.pendingCompanies ?? 0, icon: Clock, color: "bg-amber-50 text-amber-600" },
                  { label: "Offres aujourd'hui", value: stats?.todayJobs ?? 0, icon: Briefcase, color: "bg-green-50 text-green-600" },
                  { label: "Candidatures (30j)", value: stats?.monthApplications ?? 0, icon: FileText, color: "bg-purple-50 text-purple-600" },
                  { label: "Flux actifs", value: stats?.activeFeeds ?? 0, icon: FileText, color: "bg-cyan-50 text-cyan-600" },
                  { label: "Sources", value: 15, icon: TrendingUp, color: "bg-orange-50 text-orange-600" },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    className="bg-white border border-slate-200 rounded-xl p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
                      <s.icon className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{s.value}</div>
                    <div className="text-xs text-slate-500">{s.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-6">
                {chartData.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">Candidatures (30 jours)</h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.15}/><stop offset="95%" stopColor="#f97316" stopOpacity={0}/></linearGradient>
                          <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
                        <Area type="monotone" dataKey="internes" stroke="#f97316" strokeWidth={2} fill="url(#g1)" name="Internes" />
                        <Area type="monotone" dataKey="externes" stroke="#3b82f6" strokeWidth={2} fill="url(#g2)" name="Externes" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {stats?.jobsByCategory && stats.jobsByCategory.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">Offres par catï¿½gorie</h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={stats.jobsByCategory} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                        <YAxis dataKey="category" type="category" tick={{ fontSize: 11, fill: "#64748b" }} width={100} />
                        <Tooltip contentStyle={{ borderRadius: 8 }} />
                        <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Pending companies */}
              {pendingCompanies && pendingCompanies.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    Entreprises en attente ({pendingCompanies.length})
                  </h3>
                  <div className="space-y-2">
                    {pendingCompanies.slice(0, 3).map((comp) => (
                      <div key={comp.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{comp.name}</p>
                          <p className="text-xs text-slate-500">{comp.contactEmail} ï¿½ {comp.industry || "ï¿½"}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50 gap-1" onClick={() => approveMutation.mutate({ id: comp.id, status: "approved" } as any)}>
                            <CheckCircle className="w-3.5 h-3.5" /> Approuver
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 gap-1" onClick={() => rejectMutation.mutate({ id: comp.id, status: "rejected" } as any)}>
                            <XCircle className="w-3.5 h-3.5" /> Rejeter
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "companies" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Entreprises</h1>
                <Button onClick={() => { setEditingCompany(null); setCompanyForm({ name: "", industry: "", city: "", contactEmail: "" }); setCompanyDialogOpen(true); }} className="bg-orange-500 hover:bg-orange-600 gap-2">
                  <Plus className="w-4 h-4" /> Nouvelle Entreprise
                </Button>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-slate-700">Entreprise</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-700">Contact</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-700">Statut</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allCompanies?.companies?.map((comp: any) => (
                        <tr key={comp.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-900">{comp.name}</p>
                            <p className="text-xs text-slate-500">{comp.industry || "ï¿½"}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{comp.contactEmail || "ï¿½"}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[comp.status] || ""}`}>
                              {comp.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {comp.status === "pending" && (
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" className="text-green-600 h-7 px-2" onClick={() => approveMutation.mutate({ id: comp.id, status: "approved" } as any)}>
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-red-600 h-7 px-2" onClick={() => rejectMutation.mutate({ id: comp.id, status: "rejected" } as any)}>
                                  <XCircle className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            )}
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="text-slate-600 h-7 px-2" onClick={() => openCompanyDialog(comp)}>
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-red-600 h-7 px-2" onClick={() => { setDeleteType("company"); setDeleteId(comp.id); setDeleteConfirmOpen(true); }}>
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
            </div>
          )}

          {activeTab === "jobs" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Offres</h1>
                <Button onClick={() => { setEditingJob(null); setJobForm({ title: "", description: "", location: "", jobType: "cdi", categoryId: 0 }); setJobDialogOpen(true); }} className="bg-orange-500 hover:bg-orange-600 gap-2">
                  <Plus className="w-4 h-4" /> Nouvelle Offre
                </Button>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-slate-700">Titre</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-700">Lieu</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-700">Type</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allJobs?.jobs?.map((job: any) => (
                        <tr key={job.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-900">{job.title}</td>
                          <td className="px-4 py-3 text-slate-600">{job.location}</td>
                          <td className="px-4 py-3 text-slate-600 uppercase text-xs">{job.jobType}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="text-slate-600 h-7 px-2" onClick={() => openJobDialog(job)}>
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-red-600 h-7 px-2" onClick={() => { setDeleteType("job"); setDeleteId(job.id); setDeleteConfirmOpen(true); }}>
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
            </div>
          )}

          {activeTab === "applications" && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-6">Candidatures</h1>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-slate-700">Candidat</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-700">Offre</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-700">Date</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allApplications?.applications?.map((app: any) => (
                        <tr key={app.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-900">{app.user?.firstName} {app.user?.lastName}</td>
                          <td className="px-4 py-3 text-slate-600">{app.job?.title}</td>
                          <td className="px-4 py-3 text-slate-600">{new Date(app.createdAt).toLocaleDateString("fr-FR")}</td>
                          <td className="px-4 py-3">
                            <Button size="sm" variant="ghost" className="text-red-600 h-7 px-2" onClick={() => { setDeleteType("application"); setDeleteId(app.id); setDeleteConfirmOpen(true); }}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Utilisateurs</h1>
                <Button onClick={() => { setEditingUser(null); setUserForm({ name: "", email: "", role: "user" }); setUserDialogOpen(true); }} className="bg-orange-500 hover:bg-orange-600 gap-2">
                  <Plus className="w-4 h-4" /> Nouvel Utilisateur
                </Button>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-slate-700">Nom</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-700">Email</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-700">Rï¿½le</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allUsers?.users?.map((u: any) => (
                        <tr key={u.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-900">{u.name || `${u.firstName} ${u.lastName}`}</td>
                          <td className="px-4 py-3 text-slate-600">{u.email}</td>
                          <td className="px-4 py-3 text-slate-600">{u.role}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="text-slate-600 h-7 px-2" onClick={() => openUserDialog(u)}>
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-red-600 h-7 px-2" onClick={() => { setDeleteType("user"); setDeleteId(u.id); setDeleteConfirmOpen(true); }}>
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
            </div>
          )}

          {activeTab === "feeds" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Flux RSS</h1>
                <Button onClick={() => { setEditingFeed(null); setFeedForm({ name: "", url: "", frequency: "daily", status: "active" }); setFeedDialogOpen(true); }} className="bg-orange-500 hover:bg-orange-600 gap-2">
                  <Plus className="w-4 h-4" /> Nouveau Flux
                </Button>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-slate-700">Nom</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-700">URL</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-700">Frï¿½quence</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-700">Statut</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {feeds?.map((f: any) => (
                        <tr key={f.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-900">{f.name}</td>
                          <td className="px-4 py-3 text-slate-600 text-xs truncate">{f.url}</td>
                          <td className="px-4 py-3 text-slate-600">{f.frequency || f.syncFrequency || "6h"}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${(f.isActive || f.status === "active") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                              {f.isActive || f.status === "active" ? "Actif" : "Inactif"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="text-slate-600 h-7 px-2" onClick={() => openFeedDialog(f)}>
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-red-600 h-7 px-2" onClick={() => { setDeleteType("feed"); setDeleteId(f.id); setDeleteConfirmOpen(true); }}>
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
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-6">Paramï¿½tres</h1>
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <p className="text-slate-500 text-sm">Paramï¿½tres de la plateforme ï¿½ venir.</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Company Dialog */}
      <Dialog open={companyDialogOpen} onOpenChange={setCompanyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCompany ? "Modifier l'entreprise" : "Crï¿½er une entreprise"}</DialogTitle>
            <DialogDescription>{editingCompany ? "Mettez ï¿½ jour les dï¿½tails" : "Ajoutez une nouvelle entreprise"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Nom</label>
              <Input placeholder="Nom de l'entreprise" value={companyForm.name} onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Email de contact</label>
              <Input type="email" placeholder="contact@entreprise.com" value={companyForm.contactEmail} onChange={(e) => setCompanyForm({ ...companyForm, contactEmail: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Secteur</label>
                <Input placeholder="Ex: Tech" value={companyForm.industry} onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Ville</label>
                <Input placeholder="Ex: Paris" value={companyForm.city} onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setCompanyDialogOpen(false)}>Annuler</Button>
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleCompanySubmit} disabled={createCompanyMutation.isPending || updateCompanyMutation.isPending}>
                {createCompanyMutation.isPending || updateCompanyMutation.isPending ? "Sauvegarde..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Job Dialog */}
      <Dialog open={jobDialogOpen} onOpenChange={setJobDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingJob ? "Modifier l'offre" : "Crï¿½er une offre"}</DialogTitle>
            <DialogDescription>{editingJob ? "Mettez ï¿½ jour les dï¿½tails" : "Ajoutez une nouvelle offre"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Titre</label>
              <Input placeholder="Ex: Dï¿½veloppeur React" value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Description</label>
              <Textarea placeholder="Description de l'offre" value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Lieu</label>
                <Input placeholder="Ex: Paris, France" value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Type</label>
                <select value={jobForm.jobType} onChange={(e) => setJobForm({ ...jobForm, jobType: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none">
                  <option value="cdi">CDI</option>
                  <option value="cdd">CDD</option>
                  <option value="stage">Stage</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setJobDialogOpen(false)}>Annuler</Button>
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleJobSubmit} disabled={createJobMutation.isPending || updateJobMutation.isPending}>
                {createJobMutation.isPending || updateJobMutation.isPending ? "Sauvegarde..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? "Modifier l'utilisateur" : "Crï¿½er un utilisateur"}</DialogTitle>
            <DialogDescription>{editingUser ? "Mettez ï¿½ jour les dï¿½tails" : "Ajoutez un nouvel utilisateur"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Nom</label>
              <Input placeholder="Nom complet" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Email</label>
              <Input type="email" placeholder="email@exemple.com" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Rï¿½le</label>
              <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none">
                <option value="user">Utilisateur</option>
                <option value="admin">Admin</option>
                <option value="moderator">Modï¿½rateur</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setUserDialogOpen(false)}>Annuler</Button>
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleUserSubmit} disabled={createUserMutation.isPending || updateUserMutation.isPending}>
                {createUserMutation.isPending || updateUserMutation.isPending ? "Sauvegarde..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Feed Dialog */}
      <Dialog open={feedDialogOpen} onOpenChange={setFeedDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFeed ? "Modifier le flux" : "CrÃ©er un flux"}</DialogTitle>
            <DialogDescription>{editingFeed ? "Mettez Ã  jour les dÃ©tails" : "Ajoutez un nouveau flux RSS"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Nom</label>
              <Input placeholder="Nom du flux" value={feedForm.name} onChange={(e) => setFeedForm({ ...feedForm, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">URL</label>
              <Input placeholder="https://..." value={feedForm.url} onChange={(e) => setFeedForm({ ...feedForm, url: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">FrÃ©quence</label>
                <select value={feedForm.frequency} onChange={(e) => setFeedForm({ ...feedForm, frequency: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none">
                  <option value="hourly">Horaire</option>
                  <option value="6h">Toutes les 6h</option>
                  <option value="12h">Toutes les 12h</option>
                  <option value="daily">Quotidienne</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Statut</label>
                <select value={feedForm.status} onChange={(e) => setFeedForm({ ...feedForm, status: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none">
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setFeedDialogOpen(false)}>Annuler</Button>
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleFeedSubmit} disabled={createFeedMutation.isPending || updateFeedMutation.isPending}>
                {createFeedMutation.isPending || updateFeedMutation.isPending ? "Sauvegarde..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Cette action ne peut pas Ãªtre annulÃ©e. ÃŠtes-vous sÃ»r de vouloir supprimer cet Ã©lÃ©ment ?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
