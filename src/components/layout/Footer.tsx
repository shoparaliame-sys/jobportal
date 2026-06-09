import { Link } from "react-router";
import { Briefcase, Building2, Search, FileText, Bell, HelpCircle, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="bg-white p-1.5 rounded-lg border border-slate-700 shadow-sm flex items-center justify-center">
                <img src="/logo-icon.png" alt="Logo" className="h-6 w-6 object-contain" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Maroc<span className="text-orange-500"> Offres</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              La plateforme de recrutement moderne au Maroc. Trouvez votre emploi idéal ou recrutez les meilleurs talents.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-orange-500 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-orange-500 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-orange-500 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            </div>
          </div>

          {/* Candidates */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-300 mb-4">Candidats</h3>
            <ul className="space-y-3">
              <li><Link to="/jobs" className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2"><Search className="w-4 h-4" />Rechercher un emploi</Link></li>
              <li><Link to="/companies" className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2"><Building2 className="w-4 h-4" />Parcourir les entreprises</Link></li>
              <li><Link to="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2"><Briefcase className="w-4 h-4" />Mes candidatures</Link></li>
              <li><Link to="/register" className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2"><FileText className="w-4 h-4" />Déposer son CV</Link></li>
            </ul>
          </div>

          {/* Recruiters */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-300 mb-4">Recruteurs</h3>
            <ul className="space-y-3">
              <li><Link to="/register?type=company" className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2"><Briefcase className="w-4 h-4" />Publier une offre</Link></li>
              <li><Link to="/company-dashboard" className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2"><Building2 className="w-4 h-4" />Espace recruteur</Link></li>
              <li><a href="#" className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2"><FileText className="w-4 h-4" />Notre CVthèque</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2"><Bell className="w-4 h-4" />Alertes candidats</a></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-300 mb-4">Informations</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2"><HelpCircle className="w-4 h-4" />À propos de nous</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2"><Mail className="w-4 h-4" />Contact</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2"><Phone className="w-4 h-4" />+212 5XX-XXXXXX</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2"><MapPin className="w-4 h-4" />Casablanca, Maroc</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">&copy; 2025 Maroc Offres. Tous droits réservés.</p>
          <p className="text-slate-500 text-sm">Fait avec <span className="text-orange-500">passion</span> au Maroc</p>
        </div>
      </div>
    </footer>
  );
}
