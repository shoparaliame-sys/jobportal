const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'Admin.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Import RefreshCw
content = content.replace(
  'Plus, Edit2, Trash2,',
  'Plus, Edit2, Trash2, RefreshCw,'
);

// 2. Add syncFeedMutation
const syncFeedMutationCode = `
  const syncFeedMutation = trpc.admin.syncFeed.useMutation({
    onSuccess: () => {
      toast.success("Synchronisation démarrée en arrière-plan. Veuillez rafraîchir dans quelques instants.");
      setTimeout(() => utils.admin.feeds.invalidate(), 5000);
    },
    onError: () => toast.error("Erreur lors de la synchronisation"),
  });
`;

content = content.replace(
  '  const deleteFeedMutation = trpc.admin.deleteFeed.useMutation({',
  syncFeedMutationCode + '\n  const deleteFeedMutation = trpc.admin.deleteFeed.useMutation({'
);

// 3. Update the Feed table header and "Sync Tous" button
content = content.replace(
  /<h1 className="text-2xl font-bold text-slate-900">Flux RSS<\/h1>\s+<Button onClick=\{\(\) => \{ setEditingFeed\(null\); setFeedForm\(\{ name: "", url: "", frequency: "daily", status: "active" \}\); setFeedDialogOpen\(true\); \}\} className="bg-orange-500 hover:bg-orange-600 gap-2">\s+<Plus className="w-4 h-4" \/> Nouveau Flux\s+<\/Button>/g,
  `<h1 className="text-2xl font-bold text-slate-900">Flux RSS</h1>
                <div className="flex gap-2">
                  <Button onClick={() => syncFeedMutation.mutate({})} disabled={syncFeedMutation.isPending} variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50 gap-2">
                    <RefreshCw className={\`w-4 h-4 \${syncFeedMutation.isPending ? 'animate-spin' : ''}\`} /> Sync Tous
                  </Button>
                  <Button onClick={() => { setEditingFeed(null); setFeedForm({ name: "", url: "", frequency: "daily", status: "active" }); setFeedDialogOpen(true); }} className="bg-orange-500 hover:bg-orange-600 gap-2">
                    <Plus className="w-4 h-4" /> Nouveau Flux
                  </Button>
                </div>`
);

// 4. Update Feed Table Columns and Data
const tableColsOld = `<th className="text-left px-4 py-3 font-medium text-slate-700">Nom</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-700">URL</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-700">Fréquence</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-700">Statut</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-700">Actions</th>`;

const tableColsNew = `<th className="text-left px-4 py-3 font-medium text-slate-700">Nom</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-700">URL</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-700">Dernière Sync</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-700">Offres</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-700">Statut</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-700">Actions</th>`;

content = content.replace(tableColsOld, tableColsNew);

// 5. Update the row data
const rowOld = `<td className="px-4 py-3 text-slate-600 text-xs truncate">{f.url}</td>
                          <td className="px-4 py-3 text-slate-600">{f.frequency || f.syncFrequency || "6h"}</td>
                          <td className="px-4 py-3">`;

const rowNew = `<td className="px-4 py-3 text-slate-600 text-xs max-w-[200px] truncate" title={f.url}>{f.url}</td>
                          <td className="px-4 py-3 text-slate-600 text-xs">
                            <div className="flex items-center gap-1">
                              {f.lastSyncStatus === 'success' && <CheckCircle className="w-3 h-3 text-green-500" />}
                              {f.lastSyncStatus === 'error' && <XCircle className="w-3 h-3 text-red-500" />}
                              {f.lastSyncStatus === 'pending' && <RefreshCw className="w-3 h-3 text-amber-500 animate-spin" />}
                              {f.lastSyncAt ? new Date(f.lastSyncAt).toLocaleString("fr-FR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Jamais"}
                            </div>
                            {f.lastError && <p className="text-[10px] text-red-500 truncate max-w-[150px]" title={f.lastError}>{f.lastError}</p>}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900">{f.jobsImported || 0}</td>
                          <td className="px-4 py-3">`;

content = content.replace(rowOld, rowNew);

// 6. Add individual sync button to actions
const actionsOld = `<div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="text-slate-600 h-7 px-2" onClick={() => openFeedDialog(f)}>`;

const actionsNew = `<div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="text-blue-600 h-7 px-2" title="Synchroniser maintenant" onClick={() => syncFeedMutation.mutate({ id: f.id })}>
                                <RefreshCw className="w-3.5 h-3.5" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-slate-600 h-7 px-2" onClick={() => openFeedDialog(f)}>`;

content = content.replace(actionsOld, actionsNew);

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Successfully updated Admin.tsx with Sync functionality.");
