const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'Admin.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

const replacements = {
  "crï¿½e": "créée",
  "crï¿½ï¿½e": "créée",
  "mise ï¿½ jour": "mise à jour",
  "mise  jour": "mise à jour",
  "supprimï¿½e": "supprimée",
  "supprime": "supprimée",
  "supprimï¿½": "supprimé",
  "supprim": "supprimé",
  "crï¿½ï¿½": "créé",
  "cr": "créé",
  "dï¿½marrï¿½e": "démarrée",
  "dmarre": "démarrée",
  "arriï¿½re-plan": "arrière-plan",
  "arrire-plan": "arrière-plan",
  "rafraï¿½chir": "rafraîchir",
  "rafrachir": "rafraîchir",
  "Paramï¿½tres": "Paramètres",
  "Paramtres": "Paramètres",
  "Dï¿½connexion": "Déconnexion",
  "Dconnexion": "Déconnexion",
  "catï¿½gorie": "catégorie",
  "catgorie": "catégorie",
  "ï¿½": "—",
  "": "—",
  "Rï¿½le": "Rôle",
  "Rle": "Rôle",
  "Derniï¿½re Sync": "Dernière Sync",
  "Dernire Sync": "Dernière Sync",
  "Crï¿½er": "Créer",
  "Crer": "Créer",
  "dï¿½tails": "détails",
  "dtails": "détails",
  "Dï¿½veloppeur": "Développeur",
  "Dveloppeur": "Développeur",
  "Modï¿½rateur": "Modérateur",
  "Modrateur": "Modérateur",
  "Ã©": "é",
  "Ã": "à", // Be careful with this, 'Ã ' is 'à' but usually with trailing space
  "Ãª": "ê",
  "Ã»": "û",
};

for (const [bad, good] of Object.entries(replacements)) {
  // Use regex with global flag to replace all occurrences
  // Need to escape strings for regex if they contain special chars, but these don't have regex special chars except maybe hyphens
  const regex = new RegExp(bad.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
  content = content.replace(regex, good);
}

// Few manual fixes for the Ã characters
content = content.replace(/Crà©er/g, "Créer");
content = content.replace(/dà©tails/g, "détails");
content = content.replace(/Ãªtres/g, "êtres"); // for 'êtes-vous' if present

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Fixed encoding issues in Admin.tsx");
