import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Briefcase,
  Building2,
  LayoutGrid,
  PlusCircle,
  LogOut,
  User,
  ChevronDown,
  Shield,
  BarChart3,
} from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, isCompany, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileOpen(false);
    if (window.location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navLinks = [
    { label: "Offres d'emploi", href: "/jobs", icon: Briefcase },
    { label: "Entreprises", href: "/companies", icon: Building2 },
    { label: "Catégories", action: () => scrollToSection("categories"), icon: LayoutGrid },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white shadow-md text-slate-900"
            : "bg-transparent text-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <span className={`text-xl font-bold tracking-tight ${scrolled ? "text-slate-900" : "text-white"}`}>
                ReKrute<span className="text-orange-500">.</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) =>
                link.action ? (
                  <button
                    key={link.label}
                    onClick={link.action}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/10 ${
                      scrolled ? "text-slate-700 hover:text-slate-900 hover:bg-slate-100" : "text-white/90 hover:text-white"
                    }`}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href!}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      scrolled ? "text-slate-700 hover:text-slate-900 hover:bg-slate-100" : "text-white/90 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                )
              )}
              {isCompany && (
                <Link
                  to="/company-dashboard"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    scrolled ? "text-slate-700 hover:text-slate-900 hover:bg-slate-100" : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    scrolled ? "text-slate-700 hover:text-slate-900 hover:bg-slate-100" : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </div>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Link to="/dashboard">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`gap-2 ${scrolled ? "text-slate-700 hover:text-slate-900" : "text-white hover:text-white hover:bg-white/10"}`}
                    >
                      <User className="w-4 h-4" />
                      {user?.firstName || user?.name || "Profil"}
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className={`gap-2 ${scrolled ? "text-slate-700 hover:text-slate-900" : "text-white hover:text-white hover:bg-white/10"}`}
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Link to="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`${scrolled ? "text-slate-700 hover:text-slate-900 hover:bg-slate-100" : "text-white hover:text-white hover:bg-white/10"}`}
                    >
                      Connexion
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      S&apos;inscrire
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden p-2 rounded-lg ${scrolled ? "text-slate-700" : "text-white"}`}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[300px] bg-white shadow-xl p-6 flex flex-col gap-2 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-bold text-slate-900">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-700" />
              </button>
            </div>
            {navLinks.map((link) =>
              link.action ? (
                <button
                  key={link.label}
                  onClick={() => { link.action!(); setMobileOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100 text-left"
                >
                  <link.icon className="w-5 h-5 text-orange-500" />
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.label}
                  to={link.href!}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  <link.icon className="w-5 h-5 text-orange-500" />
                  {link.label}
                </Link>
              )
            )}
            {isCompany && (
              <Link to="/company-dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100">
                <BarChart3 className="w-5 h-5 text-orange-500" />
                Dashboard Entreprise
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100">
                <Shield className="w-5 h-5 text-orange-500" />
                Panel Admin
              </Link>
            )}
            <div className="border-t pt-4 mt-2">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100">
                    <User className="w-5 h-5 text-orange-500" />
                    Mon Profil
                  </Link>
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full text-left">
                    <LogOut className="w-5 h-5" />
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100">
                    Connexion
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-orange-500 text-white hover:bg-orange-600 mt-2">
                    S&apos;inscrire
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
