const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'Admin.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

const replacements = {
  "crï¿½ï¿½e": "créée",
  "crï¿½ï¿½": "créé",
  "mise ï¿½ jour": "mise à jour",
  "mis ï¿½ jour": "mis à jour",
  "supprimï¿½e": "supprimée",
  "supprimï¿½": "supprimé",
  "Paramï¿½tres": "Paramètres",
  "Dï¿½connexion": "Déconnexion",
  "catï¿½gorie": "catégorie",
  "Rï¿½le": "Rôle",
  "Crï¿½er": "Créer",
  "dï¿½tails": "détails",
  "Modï¿½rateur": "Modérateur",
  "Derniï¿½re": "Dernière",
  "Durï¿½e": "Durée",
  "importï¿½es": "importées",
  "rï¿½cents": "récents",
  "CrÃ©er": "Créer",
  "dÃ©tails": "détails",
  "FrÃ©quence": "Fréquence",
  "Ãªtre annulÃ©e": "être annulée",
  "ÃŠtes-vous sÃ»r": "Êtes-vous sûr",
  "Ã©lÃ©ment": "élément",
  "ï¿½": "à"
};

for (const [bad, good] of Object.entries(replacements)) {
  const regex = new RegExp(bad.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
  content = content.replace(regex, good);
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Safe encoding fix applied to Admin.tsx");
