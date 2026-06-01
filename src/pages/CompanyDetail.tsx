import { useParams, Link } from "react-router";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  MapPin, Globe, Users, Briefcase, ArrowLeft,
  Building2, Calendar, Mail, Phone,
} from "lucide-react";

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const companyId = Number(id);

  const { data: company, isLoading } = trpc.company.getById.useQuery({ id: companyId });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="pt-24 animate-pulse max-w-5xl mx-auto px-4">
          <div className="h-40 bg-slate-200 rounded-xl mb-8" />
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4" />
          <div className="h-4 bg-slate-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="pt-24 max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Entreprise introuvable</h2>
          <Link to="/companies" className="text-orange-500 hover:underline">Retour aux entreprises</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="pt-20">
        {/* Cover */}
        <div className="h-48 bg-gradient-to-r from-slate-800 to-slate-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-orange-900/30" />
          {company.coverUrl && (
            <img src={company.coverUrl} alt="" className="w-full h-full object-cover opacity-50" />
          )}
        </div>

        <div className="max-w-5xl mx-auto px-4">
          {/* Company info header */}
          <div className="relative -mt-12 mb-8">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-24 h-24 rounded-xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-3xl font-bold text-slate-700">
                {company.name.charAt(0)}
              </div>
              <div className="pt-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{company.name}</h1>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-500">
                  {company.industry && <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{company.industry}</span>}
                  {company.city && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{company.city}</span>}
                  {company.size && <span className="flex items-center gap-1"><Users className="w-4 h-4" />{company.size} employés</span>}
                  {company.website && (
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-orange-500 hover:underline">
                      <Globe className="w-4 h-4" />Site web
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Offres actives", value: company.activeJobs?.length ?? 0, icon: Briefcase },
              { label: "Total offres", value: company.totalJobs ?? 0, icon: Building2 },
              { label: "Taille", value: company.size || "—", icon: Users },
              { label: "Membre depuis", value: company.createdAt ? new Date(company.createdAt).getFullYear() : "—", icon: Calendar },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="bg-white border border-slate-200 rounded-xl p-4 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <stat.icon className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                <div className="text-xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              <section className="bg-white border border-slate-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">À propos</h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {company.description || "Aucune description disponible pour cette entreprise."}
                </p>
              </section>

              {/* Active Jobs */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Offres d&apos;emploi actives</h2>
                {company.activeJobs && company.activeJobs.length > 0 ? (
                  <div className="space-y-3">
                    {company.activeJobs.map((job: any) => (
                      <Link key={job.id} to={`/jobs/${job.id}`}>
                        <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all">
                          <h3 className="font-semibold text-slate-900 mb-1">{job.title}</h3>
                          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                            <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{job.jobType?.toUpperCase()}</span>
                            {job.salaryMin && (
                              <span className="flex items-center gap-1">{job.salaryMin.toLocaleString()} MAD</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                    <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">Aucune offre active pour le moment</p>
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="font-semibold text-slate-900 mb-3">Informations</h3>
                <div className="space-y-3 text-sm">
                  {company.contactName && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Users className="w-4 h-4 text-slate-400" />
                      {company.contactName}
                    </div>
                  )}
                  {company.contactEmail && (
                    <a href={`mailto:${company.contactEmail}`} className="flex items-center gap-2 text-orange-500 hover:underline">
                      <Mail className="w-4 h-4" />
                      {company.contactEmail}
                    </a>
                  )}
                  {company.contactPhone && (
                    <a href={`tel:${company.contactPhone}`} className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" />
                      {company.contactPhone}
                    </a>
                  )}
                  {company.industry && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      {company.industry}
                    </div>
                  )}
                  {company.city && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {company.city}
                    </div>
                  )}
                </div>
              </div>

              <Link
                to="/jobs"
                className="flex items-center justify-center gap-2 w-full bg-orange-50 text-orange-600 border border-orange-200 rounded-xl py-3 text-sm font-medium hover:bg-orange-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voir toutes les offres
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
}
