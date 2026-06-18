/**
 * Réclamations & Recours — Portail complet
 * Dépôt · Traitement · Suivi · Historique
 */
'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Plus, Search, Filter, CheckCircle2,
  X, User, Calendar, Send,
  ChevronRight, Download, Inbox, Printer,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────
type Complaint = typeof complaints[0];

// ── Mock data ─────────────────────────────────────────────────
const complaints = [
  {
    id: 1, reference: 'REC-2026-001', type: 'reclamation',
    objet: 'Retard dans la remise des notes S3',
    description: 'Les notes du module Ingénierie Pédagogique S3 ne sont pas encore disponibles sur Apogée à J+15 après les examens.',
    declarant: 'Étudiant IFDL', statut: 'en_cours', priorite: 'haute',
    date_depot: '2026-05-20', date_traitement: null as string | null, date_cloture: null as string | null,
    traitement: 'M. Karim Tahiri', delai: null as number | null, process: 'PR-02',
    historique: [
      { date: '2026-05-20', action: 'Réclamation déposée', auteur: 'Étudiant IFDL' },
      { date: '2026-05-21', action: 'Accusé de réception envoyé', auteur: 'Personnel Admin' },
      { date: '2026-05-22', action: 'Transmis au coordinateur', auteur: 'Resp. Qualité' },
    ],
  },
  {
    id: 2, reference: 'REC-2026-002', type: 'reclamation',
    objet: 'Inaccessibilité des ressources Moodle',
    description: "Impossibilité d'accéder aux cours en ligne depuis 3 jours. Les supports pédagogiques du module Digital Learning sont indisponibles.",
    declarant: 'Plusieurs étudiants', statut: 'resolue', priorite: 'haute',
    date_depot: '2026-05-15', date_traitement: '2026-05-16' as string | null, date_cloture: '2026-05-17' as string | null,
    traitement: 'Service Informatique', delai: 2 as number | null, process: 'PR-03',
    historique: [
      { date: '2026-05-15', action: 'Réclamation déposée', auteur: 'Étudiants' },
      { date: '2026-05-16', action: 'Incident technique identifié', auteur: 'SI' },
      { date: '2026-05-17', action: 'Plateforme restaurée + notification', auteur: 'SI' },
    ],
  },
  {
    id: 3, reference: 'REC-2026-003', type: 'recours',
    objet: 'Contestation note examen Formation des Adultes',
    description: "Je conteste la note obtenue à l'examen du module Formation des Adultes. Ma copie n'a pas été correctement évaluée sur la question 3.",
    declarant: 'M. Rachid Alaoui', statut: 'deposee', priorite: 'normale',
    date_depot: '2026-06-01', date_traitement: null as string | null, date_cloture: null as string | null,
    traitement: null as string | null, delai: null as number | null, process: 'PR-02',
    historique: [
      { date: '2026-06-01', action: 'Recours déposé', auteur: 'M. Rachid Alaoui' },
    ],
  },
  {
    id: 4, reference: 'REC-2026-004', type: 'suggestion',
    objet: 'Proposition : Ajout module IA Générative',
    description: "Suggère l'intégration d'un module sur l'IA générative dans les outils digitaux de formation pour le prochain semestre.",
    declarant: 'Pr. Samir Bensaid', statut: 'en_cours', priorite: 'basse',
    date_depot: '2026-05-10', date_traitement: '2026-05-12' as string | null, date_cloture: null as string | null,
    traitement: 'Commission pédagogique' as string | null, delai: null as number | null, process: 'PR-01',
    historique: [
      { date: '2026-05-10', action: 'Suggestion soumise', auteur: 'Pr. Samir Bensaid' },
      { date: '2026-05-12', action: 'Transmis à la commission pédagogique', auteur: 'Coordonnateur' },
    ],
  },
  {
    id: 5, reference: 'REC-2026-005', type: 'reclamation',
    objet: "Conditions de passation des examens insuffisantes",
    description: "La salle d'examen B12 était surchauffée et les conditions ne permettaient pas une concentration optimale.",
    declarant: 'Étudiants S2', statut: 'cloturee', priorite: 'normale',
    date_depot: '2026-04-25', date_traitement: '2026-04-26' as string | null, date_cloture: '2026-05-05' as string | null,
    traitement: 'Direction ESEF' as string | null, delai: 10 as number | null, process: 'PR-03',
    historique: [
      { date: '2026-04-25', action: 'Réclamation collective déposée', auteur: 'Étudiants S2' },
      { date: '2026-04-26', action: 'Constat effectué', auteur: 'Direction' },
      { date: '2026-05-05', action: 'Climatisation réparée + mesures correctives', auteur: 'Direction' },
    ],
  },
];

// ── Normalize API response ────────────────────────────────────
function normalize(c: any): Complaint {
  return {
    id:               c.id,
    reference:        c.reference       ?? c.ref ?? '',
    type:             c.type            ?? 'reclamation',
    objet:            c.objet           ?? c.object ?? c.title ?? '(sans objet)',
    description:      c.description     ?? '',
    declarant:        c.declarant       ?? c.source ?? '-',
    statut:           c.statut          ?? 'deposee',
    priorite:         c.priorite        ?? 'normale',
    date_depot:       c.date_depot      ? String(c.date_depot).slice(0, 10) : c.created_at?.slice(0, 10) ?? '',
    date_traitement:  c.date_traitement ? String(c.date_traitement).slice(0, 10) : null,
    date_cloture:     c.date_cloture    ? String(c.date_cloture).slice(0, 10) : null,
    traitement:       c.traitement      ?? null,
    delai:            c.delai           ?? null,
    process:          c.process         ?? '',
    historique:       Array.isArray(c.historique) ? c.historique : [],
  };
}

// ── Print helpers ─────────────────────────────────────────────
function printComplaint(c: Complaint) {
  const w = window.open('', '_blank');
  if (!w) return;
  const typeLabel = { reclamation: 'Réclamation', recours: 'Recours', suggestion: 'Suggestion', appel: 'Appel' }[c.type] ?? c.type;
  const statutLabel = { deposee: 'Déposée', en_cours: 'En cours', resolue: 'Résolue', cloturee: 'Clôturée', rejetee: 'Rejetée' }[c.statut] ?? c.statut;
  const histRows = (c.historique ?? []).map((h: any) => `
    <tr>
      <td style="padding:4px 8px;border:1px solid #ddd">${h.date ?? ''}</td>
      <td style="padding:4px 8px;border:1px solid #ddd">${h.action ?? ''}</td>
      <td style="padding:4px 8px;border:1px solid #ddd">${h.auteur ?? ''}</td>
    </tr>`).join('');
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
  <title>Fiche ${c.reference}</title>
  <style>body{font-family:Arial,sans-serif;font-size:12px;padding:24px;color:#222;}
  h2{color:#1a56db;}table{border-collapse:collapse;width:100%;}
  th{background:#f3f4f6;padding:4px 8px;border:1px solid #ddd;text-align:left;}
  td{padding:4px 8px;border:1px solid #ddd;}</style>
  </head><body>
  <h2>Fiche Réclamation / Recours</h2>
  <p style="color:#6b7280;margin-top:0">SMART SMOE IFDL · ESEF Berrechid · Master IFDL</p>
  <table style="margin-top:12px"><tbody>
    <tr><th>Référence</th><td>${c.reference}</td><th>Type</th><td>${typeLabel}</td></tr>
    <tr><th>Statut</th><td>${statutLabel}</td><th>Priorité</th><td>${c.priorite}</td></tr>
    <tr><th>Déclarant</th><td>${c.declarant}</td><th>Processus</th><td>${c.process}</td></tr>
    <tr><th>Date dépôt</th><td>${c.date_depot}</td><th>Délai traitement</th><td>${c.delai ? c.delai + 'j' : '—'}</td></tr>
    ${c.traitement ? `<tr><th>Pris en charge par</th><td colspan="3">${c.traitement}</td></tr>` : ''}
  </tbody></table>
  <h3 style="margin-top:12px">Objet</h3><p>${c.objet}</p>
  <h3>Description</h3><p>${c.description}</p>
  ${histRows ? `<h3>Historique</h3><table><thead><tr><th>Date</th><th>Action</th><th>Auteur</th></tr></thead><tbody>${histRows}</tbody></table>` : ''}
  </body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 400);
}

function printComplaints(list: Complaint[]) {
  const w = window.open('', '_blank');
  if (!w) return;
  const rows = list.map(c => {
    const typeLabel   = { reclamation: 'Réclamation', recours: 'Recours', suggestion: 'Suggestion', appel: 'Appel' }[c.type] ?? c.type;
    const statutLabel = { deposee: 'Déposée', en_cours: 'En cours', resolue: 'Résolue', cloturee: 'Clôturée', rejetee: 'Rejetée' }[c.statut] ?? c.statut;
    return `<tr>
      <td style="padding:4px 8px;border:1px solid #ddd">${c.reference}</td>
      <td style="padding:4px 8px;border:1px solid #ddd">${typeLabel}</td>
      <td style="padding:4px 8px;border:1px solid #ddd">${c.objet}</td>
      <td style="padding:4px 8px;border:1px solid #ddd">${statutLabel}</td>
      <td style="padding:4px 8px;border:1px solid #ddd">${c.priorite}</td>
      <td style="padding:4px 8px;border:1px solid #ddd">${c.declarant}</td>
      <td style="padding:4px 8px;border:1px solid #ddd">${c.date_depot}</td>
    </tr>`;
  }).join('');
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
  <title>Export Réclamations</title>
  <style>body{font-family:Arial,sans-serif;font-size:11px;padding:20px;}
  table{border-collapse:collapse;width:100%;}th{background:#1a56db;color:#fff;padding:5px 8px;border:1px solid #1a56db;}
  tr:nth-child(even) td{background:#f9fafb;}</style>
  </head><body>
  <h2 style="color:#1a56db">Réclamations &amp; Recours</h2>
  <p style="color:#6b7280">SMART SMOE IFDL · ESEF Berrechid · Exporté le ${new Date().toLocaleDateString('fr-MA')}</p>
  <table><thead><tr>
    <th>Référence</th><th>Type</th><th>Objet</th><th>Statut</th><th>Priorité</th><th>Déclarant</th><th>Date dépôt</th>
  </tr></thead><tbody>${rows}</tbody></table>
  </body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 400);
}

// ── Config ────────────────────────────────────────────────────
const typeConfig = {
  reclamation: { label: 'Réclamation', bg: 'bg-red-100 text-red-700',       border: 'border-red-200' },
  recours:     { label: 'Recours',     bg: 'bg-orange-100 text-orange-700', border: 'border-orange-200' },
  suggestion:  { label: 'Suggestion',  bg: 'bg-blue-100 text-blue-700',     border: 'border-blue-200' },
  appel:       { label: 'Appel',       bg: 'bg-purple-100 text-purple-700', border: 'border-purple-200' },
};

const statutConfig: Record<string, { label: string; badge: string; dot: string }> = {
  deposee:  { label: 'Déposée',  badge: 'bg-gray-100 text-gray-600',    dot: 'bg-gray-400' },
  recu:     { label: 'Reçue',    badge: 'bg-gray-100 text-gray-600',    dot: 'bg-gray-400' },
  en_cours: { label: 'En cours', badge: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500' },
  resolue:  { label: 'Résolue',  badge: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  cloturee: { label: 'Clôturée', badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  rejetee:  { label: 'Rejetée',  badge: 'bg-red-100 text-red-700',      dot: 'bg-red-500' },
};

const prioriteConfig: Record<string, string> = {
  urgente: 'bg-red-100 text-red-700',
  haute:   'bg-orange-100 text-orange-700',
  normale: 'bg-gray-100 text-gray-600',
  basse:   'bg-green-100 text-green-700',
};

// ── Depot Form ─────────────────────────────────────────────────
function DepotForm({ onClose, onAdd }: { onClose: () => void; onAdd: (c: any) => void }) {
  const [type,        setType]        = useState('reclamation');
  const [objet,       setObjet]       = useState('');
  const [description, setDescription] = useState('');
  const [source,      setSource]      = useState('etudiant');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  const handleSubmit = async () => {
    if (!objet.trim() || !description.trim()) {
      setError("L'objet et la description sont requis.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/complaints', {
        type, objet, description, source,
        statut: 'deposee',
        reference: 'REC-' + Date.now().toString().slice(-6),
      });
      onAdd(normalize(data));
      onClose();
    } catch {
      setError('Erreur lors de la soumission. Vérifiez la connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card border border-border rounded-xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold">Déposer une réclamation / recours</h3>
            <p className="text-xs text-muted-foreground">Master IFDL · ESEF Berrechid</p>
          </div>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>

        {error && (
          <div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Type</Label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full h-9 rounded-lg border border-input bg-background text-xs px-3">
                <option value="reclamation">Réclamation</option>
                <option value="recours">Recours</option>
                <option value="suggestion">Suggestion</option>
                <option value="appel">Appel</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Source</Label>
              <select value={source} onChange={e => setSource(e.target.value)} className="w-full h-9 rounded-lg border border-input bg-background text-xs px-3">
                <option value="etudiant">Étudiant</option>
                <option value="parent">Parent</option>
                <option value="personnel">Personnel</option>
                <option value="partenaire">Partenaire</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Objet *</Label>
            <Input value={objet} onChange={e => setObjet(e.target.value)} placeholder="Résumé bref de la réclamation..." className="h-9 text-sm" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Description détaillée *</Label>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)}
              className="w-full h-24 rounded-lg border border-input bg-background text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Décrivez précisément votre réclamation, le contexte, les faits observés..."
            />
          </div>

          <div className="flex items-center gap-2 p-2.5 bg-muted/30 rounded-lg">
            <input type="checkbox" id="anon" className="rounded" />
            <label htmlFor="anon" className="text-xs cursor-pointer">Soumettre de manière anonyme</label>
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={onClose} disabled={loading}>Annuler</Button>
            <Button size="sm" className="flex-1 h-8 text-xs gap-1" onClick={handleSubmit} disabled={loading}>
              <Send className="h-3 w-3" /> {loading ? 'Envoi...' : 'Soumettre'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function ComplaintsPage() {
  const [complaintList, setComplaintList] = useState<Complaint[]>(complaints);
  const [search,        setSearch]        = useState('');
  const [showForm,      setShowForm]      = useState(false);
  const [selected,      setSelected]      = useState<Complaint | null>(null);
  const [activeTab,     setActiveTab]     = useState('toutes');

  useEffect(() => {
    api.get('/complaints').then(r => {
      if (Array.isArray(r.data) && r.data.length) {
        const normalized = r.data.map(normalize);
        setComplaintList(prev => {
          const existingRefs = new Set(prev.map(c => c.reference));
          const newOnes = normalized.filter((c: Complaint) => !existingRefs.has(c.reference));
          return newOnes.length > 0 ? [...prev, ...newOnes] : prev;
        });
      }
    }).catch(() => {});
  }, []);

  const handleAdd = (c: any) => setComplaintList(prev => [normalize(c), ...prev]);

  const updateStatut = async (c: Complaint, statut: string) => {
    try {
      await api.patch(`/complaints/${c.id}`, { statut });
    } catch {}
    const updated = { ...c, statut };
    setComplaintList(prev => prev.map(x => x.id === c.id ? updated : x));
    setSelected(updated);
  };

  const filterList = (tab: string) => {
    let list = complaintList.filter(c =>
      (c.objet     ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (c.reference ?? '').toLowerCase().includes(search.toLowerCase())
    );
    if (tab === 'deposees')  list = list.filter(c => c.statut === 'deposee' || c.statut === 'recu');
    if (tab === 'en_cours')  list = list.filter(c => c.statut === 'en_cours');
    if (tab === 'resolues')  list = list.filter(c => c.statut === 'resolue' || c.statut === 'cloturee');
    return list;
  };

  const stats = {
    total:     complaintList.length,
    deposee:   complaintList.filter(c => c.statut === 'deposee' || c.statut === 'recu').length,
    en_cours:  complaintList.filter(c => c.statut === 'en_cours').length,
    resolue:   complaintList.filter(c => ['resolue', 'cloturee'].includes(c.statut)).length,
    delai_moy: (() => {
      const withDelai = complaintList.filter(c => c.delai);
      return withDelai.length ? Math.round(withDelai.reduce((s, c) => s + (c.delai ?? 0), 0) / withDelai.length) : 0;
    })(),
  };

  const filtered = filterList(activeTab);

  return (
    <div className="page-container animate-fade-up">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Réclamations &amp; Recours
          </h1>
          <p className="page-subtitle">
            Portail de dépôt · Workflow de traitement · Suivi · Master IFDL
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1"
            onClick={() => printComplaints(filtered)}
          >
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button size="sm" className="text-xs gap-1" onClick={() => setShowForm(true)}>
            <MessageSquare className="h-3.5 w-3.5" /> Nouvelle réclamation
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total',      value: stats.total,    color: 'text-foreground' },
          { label: 'En attente', value: stats.deposee,  color: 'text-gray-600' },
          { label: 'En cours',   value: stats.en_cours, color: 'text-blue-600' },
          { label: 'Résolues',   value: stats.resolue,  color: 'text-green-600' },
          { label: 'Délai moy.', value: `${stats.delai_moy}j`, color: stats.delai_moy <= 10 ? 'text-green-600' : 'text-amber-600' },
        ].map(s => (
          <Card key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Rechercher..." className="pl-9 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
          <Filter className="h-3.5 w-3.5" /> Filtrer
        </Button>
      </div>

      {/* List + Detail */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* List with tabs */}
        <div className="xl:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-9 mb-4">
              <TabsTrigger value="toutes"    className="text-xs">Toutes ({complaintList.length})</TabsTrigger>
              <TabsTrigger value="deposees"  className="text-xs">En attente ({stats.deposee})</TabsTrigger>
              <TabsTrigger value="en_cours"  className="text-xs">En cours ({stats.en_cours})</TabsTrigger>
              <TabsTrigger value="resolues"  className="text-xs">Résolues ({stats.resolue})</TabsTrigger>
            </TabsList>

            {(['toutes', 'deposees', 'en_cours', 'resolues'] as const).map(tab => (
              <TabsContent key={tab} value={tab} className="mt-0 space-y-2">
                {filterList(tab).length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                      <Inbox className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">Aucune réclamation dans cette catégorie</p>
                    </CardContent>
                  </Card>
                ) : (
                  filterList(tab).map(c => {
                    const typeCfg   = typeConfig[c.type as keyof typeof typeConfig] ?? typeConfig.reclamation;
                    const statutCfg = statutConfig[c.statut] ?? statutConfig.deposee;
                    return (
                      <motion.div key={c.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Card
                          className={cn('cursor-pointer hover:shadow-md transition-all overflow-hidden', selected?.id === c.id && 'ring-2 ring-primary/30')}
                          onClick={() => setSelected(selected?.id === c.id ? null : c)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={cn('w-2 h-2 rounded-full flex-shrink-0 mt-2', statutCfg.dot)} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="text-[10px] font-mono text-muted-foreground">{c.reference}</span>
                                  <span className={cn('text-[9px] font-semibold px-2 py-0.5 rounded border', typeCfg.bg, typeCfg.border)}>
                                    {typeCfg.label}
                                  </span>
                                  <span className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded', prioriteConfig[c.priorite] ?? 'bg-gray-100 text-gray-600')}>
                                    {c.priorite}
                                  </span>
                                  {c.process && (
                                    <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">{c.process}</span>
                                  )}
                                </div>
                                <p className="text-sm font-semibold">{c.objet}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{c.description}</p>
                                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                                  <span className="flex items-center gap-1"><User className="h-2.5 w-2.5" /> {c.declarant}</span>
                                  <span className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5" /> {c.date_depot && new Date(c.date_depot).toLocaleDateString('fr-MA')}</span>
                                  {c.traitement && <span className="flex items-center gap-1">→ {c.traitement}</span>}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', statutCfg.badge)}>
                                  {statutCfg.label}
                                </span>
                                {c.delai && (
                                  <span className={cn('text-[10px] font-semibold', c.delai <= 10 ? 'text-green-600' : 'text-amber-600')}>
                                    {c.delai}j traitement
                                  </span>
                                )}
                                <ChevronRight className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', selected?.id === c.id && 'rotate-90')} />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Detail Panel */}
        <div>
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key={selected.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <Card className="sticky top-6">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">Détail de la réclamation</CardTitle>
                      <button onClick={() => setSelected(null)}><X className="h-4 w-4 text-muted-foreground" /></button>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground">{selected.reference}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold">{selected.objet}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{selected.description}</p>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { label: 'Type',      value: typeConfig[selected.type as keyof typeof typeConfig]?.label },
                        { label: 'Statut',    value: statutConfig[selected.statut]?.label },
                        { label: 'Priorité',  value: selected.priorite },
                        { label: 'Processus', value: selected.process },
                        { label: 'Déclarant', value: selected.declarant },
                        { label: 'Dépôt',     value: selected.date_depot && new Date(selected.date_depot).toLocaleDateString('fr-MA') },
                      ].map(item => (
                        <div key={item.label} className="bg-muted/40 rounded px-2 py-1.5">
                          <p className="text-muted-foreground text-[10px]">{item.label}</p>
                          <p className="font-semibold capitalize">{item.value ?? '—'}</p>
                        </div>
                      ))}
                    </div>

                    {selected.historique.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-xs font-semibold mb-2">Historique du traitement</p>
                          <div className="space-y-2">
                            {selected.historique.map((h, i) => (
                              <div key={i} className="flex gap-2 text-xs">
                                <div className="flex flex-col items-center">
                                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-0.5" />
                                  {i < selected.historique.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                                </div>
                                <div className="pb-2">
                                  <p className="font-medium">{h.action}</p>
                                  <p className="text-muted-foreground text-[10px]">{h.auteur} · {h.date && new Date(h.date).toLocaleDateString('fr-MA')}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      {(selected.statut === 'deposee' || selected.statut === 'recu') && (
                        <Button
                          size="sm"
                          className="flex-1 text-xs gap-1 h-7"
                          onClick={() => updateStatut(selected, 'en_cours')}
                        >
                          <Send className="h-3 w-3" /> Prendre en charge
                        </Button>
                      )}
                      {selected.statut === 'en_cours' && (
                        <Button
                          size="sm"
                          className="flex-1 text-xs gap-1 h-7"
                          onClick={() => updateStatut(selected, 'resolue')}
                        >
                          <CheckCircle2 className="h-3 w-3" /> Résoudre
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1 px-2"
                        onClick={() => printComplaint(selected)}
                      >
                        <Printer className="h-3 w-3" /> Imprimer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <Inbox className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">Sélectionnez une réclamation pour voir les détails</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showForm && <DepotForm onClose={() => setShowForm(false)} onAdd={handleAdd} />}
      </AnimatePresence>
    </div>
  );
}
