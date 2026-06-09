import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Mail, Lock, User, Building2,
  Eye, EyeOff,
} from "lucide-react";

function getOAuthUrl() {
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);
  const authUrl = new URL(`${import.meta.env.VITE_KIMI_AUTH_URL}/api/oauth/authorize`);
  authUrl.searchParams.set("client_id", import.meta.env.VITE_APP_ID);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "profile");
  authUrl.searchParams.set("state", state);
  return authUrl.toString();
}

export default function Login() {
  const utils = trpc.useUtils();
  const [searchParams] = useSearchParams();
  const defaultType = searchParams.get("type") === "company" ? "company" : "login";
  const [mode, setMode] = useState<"login" | "register" | "company">(defaultType === "company" ? "company" : "login");
  const [showPassword, setShowPassword] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regCity, setRegCity] = useState("");

  // Company form
  const [compName, setCompName] = useState("");
  const [compEmail, setCompEmail] = useState("");
  const [compPassword, setCompPassword] = useState("");
  const [compIndustry, setCompIndustry] = useState("");
  const [compCity, setCompCity] = useState("");
  const [compContactName, setCompContactName] = useState("");
  const [compDescription, setCompDescription] = useState("");

  const loginMutation = trpc.localAuth.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("local_auth_token", data.token);
      toast.success("Connexion réussie !");
      utils.localAuth.me.invalidate();
      utils.auth.me.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Erreur de connexion");
    },
  });

  const registerMutation = trpc.localAuth.register.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("local_auth_token", data.token);
      toast.success("Inscription réussie !");
      utils.localAuth.me.invalidate();
      utils.auth.me.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Erreur d'inscription");
    },
  });

  const companyUserRegisterMutation = trpc.localAuth.register.useMutation();
  const companyProfileRegisterMutation = trpc.company.register.useMutation();
  const isCompanyRegisterPending = companyUserRegisterMutation.isPending || companyProfileRegisterMutation.isPending;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email: loginEmail, password: loginPassword });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({
      email: regEmail,
      password: regPassword,
      firstName: regFirstName,
      lastName: regLastName,
      phone: regPhone || undefined,
      city: regCity || undefined,
      role: "seeker",
    });
  };

  const handleCompanyRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!compName.trim() || !compEmail.trim() || !compPassword.trim()) {
      toast.error("Nom, email et mot de passe sont requis");
      return;
    }

    // Split contact name or use company name as fallback
    const names = (compContactName || compName).trim().split(/\s+/);
    const firstName = names[0] || compName;
    const lastName = names.slice(1).join(" ") || compName;

    try {
      const auth = await companyUserRegisterMutation.mutateAsync({
        email: compEmail,
        password: compPassword,
        firstName,
        lastName,
        role: "company",
      });

      localStorage.setItem("local_auth_token", auth.token);

      await companyProfileRegisterMutation.mutateAsync({
        name: compName,
        description: compDescription || undefined,
        industry: compIndustry || undefined,
        city: compCity || undefined,
        contactName: compContactName || undefined,
        contactEmail: compEmail,
      });

      toast.success("Compte créé ! En attente de vérification.");
      utils.localAuth.me.invalidate();
      utils.auth.me.invalidate();
    } catch (err: any) {
      toast.error(err?.message || "Erreur d'inscription");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-slate-900 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-orange-950/50" />
        <div className="relative z-10 max-w-md px-8 text-center">
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="bg-white p-1.5 rounded-lg border border-slate-100 shadow-sm flex items-center justify-center">
                <img src="/logo-icon.png" alt="Logo" className="h-6 w-6 object-contain" />
              </div>
              <span className="text-3xl font-bold tracking-tight text-white">
                Maroc<span className="text-orange-500"> Offres</span>
              </span>
            </Link>
          </div>
          <img src="/hero-illustration.png" alt="" className="w-full max-w-sm mx-auto mb-6 opacity-80" />
          <h2 className="text-2xl font-bold text-white mb-3">Votre carrière commence ici</h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Rejoignez des milliers de professionnels qui ont trouvé leur emploi idéal grâce à Maroc Offres.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-white p-6">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="bg-white p-1.5 rounded-lg border border-slate-100 shadow-sm flex items-center justify-center">
                <img src="/logo-icon.png" alt="Logo" className="h-6 w-6 object-contain" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                Maroc<span className="text-orange-500"> Offres</span>
              </span>
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex rounded-lg bg-slate-100 p-1 mb-6">
            {[
              { key: "login" as const, label: "Connexion" },
              { key: "register" as const, label: "Candidat" },
              { key: "company" as const, label: "Entreprise" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setMode(tab.key)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  mode === tab.key
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Connexion</h2>
              <p className="text-sm text-slate-500 mb-4">Accédez à votre compte Maroc Offres</p>

              <div>
                <Label htmlFor="login-email" className="text-sm text-slate-700">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="login-password" className="text-sm text-slate-700">Mot de passe</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                {loginMutation.isPending ? "Connexion..." : "Se connecter"}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-slate-400">Ou</span>
                </div>
              </div>

              <a
                href={getOAuthUrl()}
                className="flex items-center justify-center gap-2 w-full border border-slate-200 rounded-lg py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Continuer avec Kimi OAuth
              </a>
            </form>
          )}

          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Créer un compte</h2>
              <p className="text-sm text-slate-500 mb-4">Recherchez et postulez à des offres d&apos;emploi</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm text-slate-700">Prénom</Label>
                  <Input value={regFirstName} onChange={(e) => setRegFirstName(e.target.value)} placeholder="Prénom" required />
                </div>
                <div>
                  <Label className="text-sm text-slate-700">Nom</Label>
                  <Input value={regLastName} onChange={(e) => setRegLastName(e.target.value)} placeholder="Nom" required />
                </div>
              </div>

              <div>
                <Label className="text-sm text-slate-700">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="votre@email.com" className="pl-10" required />
                </div>
              </div>

              <div>
                <Label className="text-sm text-slate-700">Mot de passe</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Min. 6 caractères" className="pl-10" required minLength={6} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm text-slate-700">Téléphone</Label>
                  <Input value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="+212..." />
                </div>
                <div>
                  <Label className="text-sm text-slate-700">Ville</Label>
                  <Input value={regCity} onChange={(e) => setRegCity(e.target.value)} placeholder="Casablanca" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                {registerMutation.isPending ? "Création..." : "S'inscrire"}
              </Button>
            </form>
          )}

          {mode === "company" && (
            <form onSubmit={handleCompanyRegister} className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Inscription Entreprise</h2>
              <p className="text-sm text-slate-500 mb-4">Publiez vos offres et recrutez des talents</p>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700 mb-2">
                Votre compte sera examiné par notre équipe avant validation.
              </div>

              <div>
                <Label className="text-sm text-slate-700">Nom de l&apos;entreprise</Label>
                <div className="relative mt-1">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input value={compName} onChange={(e) => setCompName(e.target.value)} placeholder="Votre entreprise" className="pl-10" required />
                </div>
              </div>

              <div>
                <Label className="text-sm text-slate-700">Email professionnel</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input type="email" value={compEmail} onChange={(e) => setCompEmail(e.target.value)} placeholder="contact@entreprise.ma" className="pl-10" required />
                </div>
              </div>

              <div>
                <Label className="text-sm text-slate-700">Mot de passe</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input type="password" value={compPassword} onChange={(e) => setCompPassword(e.target.value)} placeholder="Min. 6 caractères" className="pl-10" required minLength={6} />
                </div>
              </div>

              <div>
                <Label className="text-sm text-slate-700">Nom du contact</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input value={compContactName} onChange={(e) => setCompContactName(e.target.value)} placeholder="Responsable RH" className="pl-10" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm text-slate-700">Secteur</Label>
                  <Input value={compIndustry} onChange={(e) => setCompIndustry(e.target.value)} placeholder="Tech, Finance..." />
                </div>
                <div>
                  <Label className="text-sm text-slate-700">Ville</Label>
                  <Input value={compCity} onChange={(e) => setCompCity(e.target.value)} placeholder="Casablanca" />
                </div>
              </div>

              <div>
                <Label className="text-sm text-slate-700">Description</Label>
                <textarea
                  value={compDescription}
                  onChange={(e) => setCompDescription(e.target.value)}
                  placeholder="Décrivez votre entreprise..."
                  rows={3}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-300 resize-none mt-1"
                />
              </div>

              <Button
                type="submit"
                disabled={isCompanyRegisterPending}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isCompanyRegisterPending ? "Envoi..." : "Demander la vérification"}
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
