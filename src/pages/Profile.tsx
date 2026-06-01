import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  User, Mail, Phone, MapPin, FileText, Briefcase,
  GraduationCap, Award, Save, X, Plus, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const utils = trpc.useContext();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    city: user?.city || "",
    resumeUrl: user?.resumeUrl || "",
    skills: (user?.skills as string[]) || [],
    newSkill: "",
  });

  const updateMutation = trpc.user.updateProfile.useMutation({
    onSuccess: async (updatedUser) => {
      setFormData({
        firstName: updatedUser.firstName || "",
        lastName: updatedUser.lastName || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        city: updatedUser.city || "",
        resumeUrl: updatedUser.resumeUrl || "",
        skills: (updatedUser.skills as string[]) || [],
        newSkill: "",
      });
      toast.success("Profil mis à jour avec succès");
      setIsEditing(false);
      try {
        await utils.invalidate();
      } catch (err) {
        // ignore invalidate errors
      }

    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (formData.newSkill.trim()) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, prev.newSkill.trim()],
        newSkill: "",
      }));
    }
  };

  const handleRemoveSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      city: formData.city,
      resumeUrl: formData.resumeUrl || undefined,
      skills: formData.skills,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="pt-24 pb-16 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-8 sm:px-8">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <User className="w-6 h-6" />
              Mon Profil
            </h1>
            <p className="text-orange-100 mt-1">Gérez vos informations professionnelles</p>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Prénom
                    </label>
                    <Input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Prénom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nom
                    </label>
                    <Input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Nom"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <Input type="email" value={formData.email} disabled className="bg-slate-50" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Téléphone
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+212 6XX XXX XXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Ville
                    </label>
                    <Input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Casablanca"
                    />
                  </div>
                </div>

                {/* Resume URL */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Lien vers votre CV
                  </label>
                  <Input
                    type="url"
                    name="resumeUrl"
                    value={formData.resumeUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/your-resume.pdf"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Collez le lien de votre CV (Google Drive, Dropbox, ou votre site personnel)
                  </p>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Compétences
                  </label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      type="text"
                      value={formData.newSkill}
                      onChange={(e) => setFormData({ ...formData, newSkill: e.target.value })}
                      placeholder="Ajouter une compétence..."
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                    />
                    <Button
                      type="button"
                      onClick={handleAddSkill}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-orange-200"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(index)}
                          className="hover:text-orange-900"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateMutation.isPending ? "Sauvegarde..." : "Enregistrer"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <InfoField icon={User} label="Prénom" value={formData.firstName} />
                  <InfoField icon={User} label="Nom" value={formData.lastName} />
                  <InfoField icon={Mail} label="Email" value={formData.email} />
                  <InfoField icon={Phone} label="Téléphone" value={formData.phone} />
                  <InfoField icon={MapPin} label="Ville" value={formData.city} />
                </div>

                {formData.resumeUrl && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      CV
                    </h3>
                    <a
                      href={formData.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-500 hover:text-orange-600 hover:underline inline-flex items-center gap-1"
                    >
                      Voir mon CV
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {formData.skills.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Compétences
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm border border-orange-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Modifier le profil
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}

function InfoField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
}) {
  return (
    <div>
      <label className="text-sm text-slate-600 flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4" />
        {label}
      </label>
      <p className="text-lg font-medium text-slate-900">{value || "-"}</p>
    </div>
  );
}
