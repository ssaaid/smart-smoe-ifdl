/**
 * Actions Correctives et Préventives — ISO 21001 §10.2
 * SMART SMOE IFDL · ESEF Berrechid · Master IFDL
 */
'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench, Plus, Search, Filter, Download, X, User, Calendar,
  ChevronRight, CheckCircle2, AlertCircle, TrendingUp,
  FileText, Send, Inbox, History,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────
type Action = typeof actions[0];

// ── Mock data ─────────────────────────────────────────────────
const actions = [
  {
    id: 1, code: 'AC-2026-001', type: 'corrective',
    titre: 'Rédiger procédure maîtrise documents (ISO §7.5)',
    source: 'NC-2026-001', responsable: 'Resp. Qualité',
    echeance: '2026-07-15', statut: 'en_cours', avancement: 60,
    description: "Élaboration d'une procédure complète de gestion des informations documentées conforme à l'ISO 21001.",
    actions_realisees: 'Analyse des besoins réalisée. Structure procédure validée. Rédaction en cours (chapitre 1-3/5 complétés).',
    efficacite: null as string | null, date_creation: '2026-03-20',
    historique: [
      { date: '2026-03-20', action: 'Action créée suite NC-2026-001', auteur: 'Resp. Qualité' },
      { date: '2026-04-05', action: 'Analyse des pratiques existantes', auteur: 'Resp. Qualité' },
      { date: '2026-05-10', action: 'V1 procédure soumise pour relecture', auteur: 'Resp. Qualité' },
    ],
  },
  {
    id: 2, code: 'AC-2026-002', type: 'corrective',
    titre: "Réviser et compléter le programme d'audit annuel",
    source: 'NC-2026-002', responsable: 'Coord. Qualité',
    echeance: '2026-08-01', statut: 'en_cours', avancement: 30,
    description: "Le programme d'audit doit couvrir l'ensemble des processus SMOE sur un cycle de 3 ans.",
    actions_realisees: 'Cartographie des processus à auditer réalisée. Planning révisé pour H2 2026.',
    efficacite: null as string | null, date_creation: '2026-03-25',
    historique: [
      { date: '2026-03-25', action: "Planification de l'action", auteur: 'Coord. Qualité' },
      { date: '2026-04-20', action: 'Nouveau programme validé par la direction', auteur: 'Direction' },
    ],
  },
  {
    id: 3, code: 'AC-2026-003', type: 'corrective',
    titre: 'Organiser la revue de direction S1 2026',
    source: 'NC-2026-003', responsable: 'Direction',
    echeance: '2026-04-30', statut: 'cloturee', avancement: 100,
    description: "Mise en place d'un calendrier strict des revues de direction avec rappels automatiques.",
    actions_realisees: 'Revue de direction S1 organisée le 15/04. CR validé et diffusé. Calendrier 2026-2027 établi.',
    efficacite: 'efficace' as string | null, date_creation: '2026-03-22',
    historique: [
      { date: '2026-03-22', action: 'Action initiée', auteur: 'Direction' },
      { date: '2026-04-15', action: 'Revue de direction réalisée', auteur: 'Direction' },
      { date: '2026-04-30', action: 'Vérification efficacité — OK', auteur: 'Coord. Qualité' },
    ],
  },
  {
    id: 4, code: 'AC-2026-004', type: 'preventive',
    titre: 'Mettre en place alertes automatiques échéances SMOE',
    source: 'Identification proactive', responsable: 'SI + Resp. Qualité',
    echeance: '2026-09-01', statut: 'ouverte', avancement: 0,
    description: 'Système de notifications automatiques 30j, 15j et 7j avant échéances des actions et indicateurs.',
    actions_realisees: '', efficacite: null as string | null, date_creation: '2026-05-01',
    historique: [
      { date: '2026-05-01', action: 'Action préventive identifiée', auteur: 'Resp. Qualité' },
    ],
  },
  {
    id: 5, code: 'AC-2026-005', type: 'amelioration',
    titre: 'Digitaliser les enquêtes de satisfaction étudiants',
    source: 'Revue de direction 2025', responsable: 'Coord. Digital',
    echeance: '2026-10-01', statut: 'en_cours', avancement: 45,
    description: "Remplacer les formulaires papier par une plateforme digitale d'enquête satisfaction.",
    actions_realisees: 'Cahier des charges rédigé. 3 outils évalués (Typeform, SurveyMonkey, formulaire interne). Choix validé.',
    efficacite: null as string | null, date_creation: '2026-04-01',
    historique: [
      { date: '2026-04-01', action: 'Amélioration proposée', auteur: 'Coord. Digital' },
      { date: '2026-05-10', action: 'Benchmark outils terminé', auteur: 'Coord. Digital' },
    ],
  },
  {
    id: 6, code: 'AC-2026-006', type: 'corrective',
    titre: 'Campagne de mise à jour des fiches de compétences',
    source: 'NC-2026-005', responsable: 'RH',
    echeance: '2026-07-01', statut: 'en_cours', avancement: 70,
    description: 'Mise à jour de 100% des fiches de compétences personnel et enseignants.',
    actions_realisees: '30 fiches sur 43 mises à jour. Relances envoyées aux 13 restants.',
    efficacite: null as string | null, date_creation: '2026-04-05',
    historique: [
      { date: '2026-04-05', action: 'Campagne lancée', auteur: 'RH' },
      { date: '2026-05-20', action: '70% des fiches traitées', auteur: 'RH' },
    ],
  },
  {
    id: 7, code: 'AC-2026-007', type: 'amelioration',
    titre: 'Plan de communication résultats SMOE (affichage + réunions)',
    source: 'NC-2026-007', responsable: 'Coord. Comm.',
    echeance: '2026-10-01', statut: 'ouverte', avancement: 0,
    description: 'Améliorer la visibilité des résultats et indicateurs SMOE auprès de toutes les parties prenantes.',
    actions_realisees: '', efficacite: null as string | null, date_creation: '2026-06-05',
    historique: [
      { date: '2026-06-05', action: 'Action créée', auteur: 'Coord. Comm.' },
    ],
  },
  {
    id: 8, code: 'AC-2026-008', type: 'corrective',
    titre: 'Intégrer mesure satisfaction à chaque fin de semestre',
    source: 'NC-2026-004', responsable: 'Coord. Pédago',
    echeance: '2026-09-01', statut: 'ouverte', avancement: 0,
    description: 'Systématiser la mesure du taux de satisfaction étudiant après chaque semestre.',
    actions_realisees: '', efficacite: null as string | null, date_creation: '2026-04-15',
    historique: [
      { date: '2026-04-15', action: 'Action planifiée', auteur: 'Coord. Pédago' },
    ],
  },
];

// ── Normalize API response ────────────────────────────────────
function normalize(a: any): Action {
  return {
    id:               a.id,
    code:             a.code             ?? '',
    type:             a.type             ?? 'corrective',
    titre:            a.titre            ?? a.description?.slice(0, 60) ?? '(sans titre)',
    source:           a.source           ?? '',
    responsable:      a.responsable      ?? '-',
    echeance:         a.echeance         ? String(a.echeance).slice(0, 10) : '-',
    statut:           a.statut           ?? 'ouverte',
    avancement:       a.avancement       ?? 0,
    description:      a.description      ?? '',
    actions_realisees: a.actions_realisees ?? '',
    efficacite:       a.efficacite       ?? null,
    date_creation:    a.date_creation    ?? a.created_at?.slice(0, 10) ?? '',
    historique:       Array.isArray(a.historique) ? a.historique : [],
  };
}

// ── Print helpers ─────────────────────────────────────────────
function printAction(a: Action) {
  const w = window.open('', '_blank');
  if (!w) return;
  const typeLabel = { corrective: 'Corrective', preventive: 'Préventive', amelioration: 'Amélioration' }[a.type] ?? a.type;
  const statutLabel = { ouverte: 'Ouverte', en_cours: 'En cours', cloturee: 'Clôturée', annulee: 'Annulée' }[a.statut] ?? a.statut;
  const histRows = (a.historique ?? []).map((h: any) => `
    <tr>
      <td style="padding:4px 8px;border:1px solid #ddd;">${h.date ?? ''}</td>
      <td style="padding:4px 8px;border:1px solid #ddd;">${h.action ?? ''}</td>
      <td style="padding:4px 8px;border:1px solid #ddd;">${h.auteur ?? ''}</td>
    </tr>`).join('');
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
  <title>Fiche Action ${a.code}</title>
  <style>body{font-family:Arial,sans-serif;font-size:12px;padding:24px;color:#222;}
  h2{color:#1a56db;margin-bottom:4px;}h3{margin-top:16px;margin-bottom:4px;color:#374151;}
  table{border-collapse:collapse;width:100%;}th{background:#f3f4f6;padding:4px 8px;border:1px solid #ddd;text-align:left;}
  .badge{display:inline-block;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;}
  </style></head><body>
  <h2>Fiche Action Corrective / Préventive</h2>
  <p style="color:#6b7280;margin-top:0">SMART SMOE IFDL · ESEF Berrechid · ISO 21001 §10.2</p>
  <table style="margin-top:12px"><tbody>
    <tr><th>Code</th><td style="padding:4px 8px;border:1px solid #ddd">${a.code}</td>
        <th>Type</th><td style="padding:4px 8px;border:1px solid #ddd">${typeLabel}</td></tr>
    <tr><th>Statut</th><td style="padding:4px 8px;border:1px solid #ddd">${statutLabel}</td>
        <th>Avancement</th><td style="padding:4px 8px;border:1px solid #ddd">${a.avancement}%</td></tr>
    <tr><th>Source</th><td style="padding:4px 8px;border:1px solid #ddd">${a.source}</td>
        <th>Échéance</th><td style="padding:4px 8px;border:1px solid #ddd">${a.echeance}</td></tr>
    <tr><th>Responsable</th><td colspan="3" style="padding:4px 8px;border:1px solid #ddd">${a.responsable}</td></tr>
  </tbody></table>
  <h3>Titre</h3><p>${a.titre}</p>
  <h3>Description</h3><p>${a.description}</p>
  ${a.actions_realisees ? `<h3>Actions réalisées</h3><p>${a.actions_realisees}</p>` : ''}
  ${a.efficacite ? `<h3>Efficacité</h3><p>${a.efficacite === 'efficace' ? '✓ Efficace' : '✗ Inefficace'}</p>` : ''}
  ${histRows ? `<h3>Historique</h3><table><thead><tr><th>Date</th><th>Action</th><th>Auteur</th></tr></thead><tbody>${histRows}</tbody></table>` : ''}
  </body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 400);
}

function printActions(list: Action[]) {
  const w = window.open('', '_blank');
  if (!w) return;
  const rows = list.map(a => {
    const statutLabel = { ouverte: 'Ouverte', en_cours: 'En cours', cloturee: 'Clôturée', annulee: 'Annulée' }[a.statut] ?? a.statut;
    return `<tr>
      <td style="padding:4px 8px;border:1px solid #ddd">${a.code}</td>
      <td style="padding:4px 8px;border:1px solid #ddd">${a.type}</td>
      <td style="padding:4px 8px;border:1px solid #ddd">${a.titre}</td>
      <td style="padding:4px 8px;border:1px solid #ddd">${statutLabel}</td>
      <td style="padding:4px 8px;border:1px solid #ddd">${a.avancement}%</td>
      <td style="padding:4px 8px;border:1px solid #ddd">${a.responsable}</td>
      <td style="padding:4px 8px;border:1px solid #ddd">${a.echeance}</td>
    </tr>`;
  }).join('');
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
  <title>Export Actions Correctives</title>
  <style>body{font-family:Arial,sans-serif;font-size:11px;padding:20px;}
  table{border-collapse:collapse;width:100%;}th{background:#1a56db;color:#fff;padding:5px 8px;border:1px solid #1a56db;}
  tr:nth-child(even) td{background:#f9fafb;}</style>
  </head><body>
  <h2 style="color:#1a56db">Actions Correctives &amp; Préventives — ISO 21001 §10.2</h2>
  <p style="color:#6b7280">SMART SMOE IFDL · ESEF Berrechid · Exporté le ${new Date().toLocaleDateString('fr-MA')}</p>
  <table><thead><tr>
    <th>Code</th><th>Type</th><th>Titre</th><th>Statut</th><th>Avanc.</th><th>Responsable</th><th>Échéance</th>
  </tr></thead><tbody>${rows}</tbody></table>
  </body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 400);
}

// ── Config ────────────────────────────────────────────────────
const typeConfig: Record<string, { label: string; bg: string; border: string }> = {
  corrective:   { label: 'Corrective',   bg: 'bg-red-100 text-red-700',     border: 'border-red-200' },
  preventive:   { label: 'Préventive',   bg: 'bg-blue-100 text-blue-700',   border: 'border-blue-200' },
  amelioration: { label: 'Amélioration', bg: 'bg-green-100 text-green-700', border: 'border-green-200' },
};

const statutConfig: Record<string, { label: string; badge: string; dot: string }> = {
  ouverte:  { label: 'Ouverte',   badge: 'bg-gray-100 text-gray-600',    dot: 'bg-gray-400' },
  en_cours: { label: 'En cours',  badge: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500' },
  cloturee: { label: 'Clôturée',  badge: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  annulee:  { label: 'Annulée',   badge: 'bg-red-100 text-red-700',      dot: 'bg-red-500' },
};

// ── Edit Action Modal ─────────────────────────────────────────
function EditActionModal({
  action,
  onClose,
  onSave,
}: {
  action: Action;
  onClose: () => void;
  onSave: (updated: Action) => void;
}) {
  const [titre,            setTitre]            = useState(action.titre);
  const [description,      setDescription]      = useState(action.description);
  const [type,             setType]             = useState(action.type);
  const [statut,           setStatut]           = useState(action.statut);
  const [avancement,       setAvancement]       = useState(action.avancement);
  const [responsable,      setResponsable]      = useState(action.responsable);
  const [echeance,         setEcheance]         = useState(action.echeance === '-' ? '' : action.echeance);
  const [actions_realisees, setActionsRealisees] = useState(action.actions_realisees);
  const [loading,          setLoading]          = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const dto = { titre, description, type, statut, avancement, responsable, echeance, actions_realisees };
    try {
      await api.patch(`/corrective-actions/${action.id}`, dto);
    } catch {}
    onSave({ ...action, ...dto });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card border border-border rounded-xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold">Modifier l'action — {action.code}</h3>
            <p className="text-xs text-muted-foreground">ISO 21001 §10.2 · ESEF Berrechid</p>
          </div>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs font-medium">Titre</Label>
            <Input value={titre} onChange={e => setTitre(e.target.value)} className="h-9 text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Type</Label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full h-9 rounded-lg border border-input bg-background text-xs px-3">
                <option value="corrective">Corrective</option>
                <option value="preventive">Préventive</option>
                <option value="amelioration">Amélioration</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Statut</Label>
              <select value={statut} onChange={e => setStatut(e.target.value)} className="w-full h-9 rounded-lg border border-input bg-background text-xs px-3">
                <option value="ouverte">Ouverte</option>
                <option value="en_cours">En cours</option>
                <option value="cloturee">Clôturée</option>
                <option value="annulee">Annulée</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Avancement (%)</Label>
              <Input type="number" min={0} max={100} value={avancement} onChange={e => setAvancement(Number(e.target.value))} className="h-9 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Échéance</Label>
              <Input type="date" value={echeance} onChange={e => setEcheance(e.target.value)} className="h-9 text-xs" />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Responsable</Label>
            <Input value={responsable} onChange={e => setResponsable(e.target.value)} className="h-9 text-xs" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Description</Label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full h-20 rounded-lg border border-input bg-background text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Actions réalisées</Label>
            <textarea
              value={actions_realisees}
              onChange={e => setActionsRealisees(e.target.value)}
              className="w-full h-16 rounded-lg border border-input bg-background text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={onClose} disabled={loading}>Annuler</Button>
            <Button size="sm" className="flex-1 h-8 text-xs gap-1" onClick={handleSave} disabled={loading}>
              <Send className="h-3 w-3" /> {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Add Action Form Modal ─────────────────────────────────────
function AddActionForm({ onClose, onAdd }: { onClose: () => void; onAdd: (a: any) => void }) {
  const [type, setType]               = useState('corrective');
  const [source, setSource]           = useState('');
  const [titre, setTitre]             = useState('');
  const [description, setDescription] = useState('');
  const [responsable, setResponsable] = useState('');
  const [echeance, setEcheance]       = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  const handleSubmit = async () => {
    if (!titre.trim() || !description.trim()) {
      setError('Le titre et la description sont requis.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/corrective-actions', {
        type, titre, description,
        statut: 'ouverte',
        avancement: 0,
        code: 'AC-' + Date.now().toString().slice(-6),
        echeance: echeance || null,
      });
      onAdd(normalize(data));
      onClose();
    } catch {
      setError("Erreur lors de l'enregistrement. Vérifiez la connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card border border-border rounded-xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold">Nouvelle action corrective / préventive</h3>
            <p className="text-xs text-muted-foreground">ISO 21001 §10.2 · ESEF Berrechid</p>
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
              <Label className="text-xs font-medium">Type d'action *</Label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full h-9 rounded-lg border border-input bg-background text-xs px-3">
                <option value="corrective">Corrective</option>
                <option value="preventive">Préventive</option>
                <option value="amelioration">Amélioration</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Source / Origine</Label>
              <Input value={source} onChange={e => setSource(e.target.value)} placeholder="ex: NC-2026-xxx" className="h-9 text-xs" />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Titre de l'action *</Label>
            <Input value={titre} onChange={e => setTitre(e.target.value)} placeholder="Description courte de l'action..." className="h-9 text-sm" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Description détaillée *</Label>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)}
              className="w-full h-24 rounded-lg border border-input bg-background text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Décrivez l'action à réaliser, le contexte, les objectifs attendus..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Responsable</Label>
              <Input value={responsable} onChange={e => setResponsable(e.target.value)} placeholder="Nom / fonction" className="h-9 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Échéance</Label>
              <Input type="date" value={echeance} onChange={e => setEcheance(e.target.value)} className="h-9 text-xs" />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={onClose} disabled={loading}>Annuler</Button>
            <Button size="sm" className="flex-1 h-8 text-xs gap-1" onClick={handleSubmit} disabled={loading}>
              <Send className="h-3 w-3" /> {loading ? 'Enregistrement...' : "Créer l'action"}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Action Card ───────────────────────────────────────────────
function ActionCard({
  action,
  isSelected,
  onSelect,
  onUpdate,
  onEdit,
}: {
  action: Action;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updated: Action) => void;
  onEdit: (a: Action) => void;
}) {
  const typeCfg   = typeConfig[action.type] ?? typeConfig.corrective;
  const statutCfg = statutConfig[action.statut] ?? statutConfig.ouverte;

  const changeStatut = async (statut: string) => {
    const avancement = statut === 'cloturee' ? 100 : statut === 'en_cours' ? 10 : 0;
    try {
      const { data } = await api.patch(`/corrective-actions/${action.id}`, { statut, avancement });
      onUpdate({ ...action, ...data, statut, avancement });
    } catch {
      onUpdate({ ...action, statut, avancement });
    }
  };

  const avancementColor =
    action.avancement >= 80 ? 'bg-green-500' :
    action.avancement >= 40 ? 'bg-blue-500' :
    'bg-gray-400';

  const isOverdue = action.statut !== 'cloturee' && action.echeance !== '-' && new Date(action.echeance) < new Date();

  return (
    <motion.div layout initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
      <Card
        className={cn(
          'cursor-pointer hover:shadow-md transition-all overflow-hidden',
          isSelected && 'ring-2 ring-primary/30',
        )}
        onClick={onSelect}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn('w-2 h-2 rounded-full flex-shrink-0 mt-2', statutCfg.dot)} />
            <div className="flex-1 min-w-0">
              {/* Badges row */}
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[10px] font-mono text-muted-foreground">{action.code}</span>
                <span className={cn('text-[9px] font-semibold px-2 py-0.5 rounded border', typeCfg.bg, typeCfg.border)}>
                  {typeCfg.label}
                </span>
                {action.source && (
                  <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                    {action.source}
                  </span>
                )}
                {isOverdue && (
                  <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5">
                    <AlertCircle className="h-2.5 w-2.5" /> En retard
                  </span>
                )}
              </div>

              <p className="text-sm font-semibold leading-snug">{action.titre}</p>

              {/* Meta */}
              <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1"><User className="h-2.5 w-2.5" /> {action.responsable}</span>
                {action.echeance !== '-' && (
                  <span className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5" /> {new Date(action.echeance).toLocaleDateString('fr-MA')}</span>
                )}
              </div>

              {/* Progress */}
              <div className="mt-2.5 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', avancementColor)}
                    style={{ width: `${action.avancement}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground w-7 text-right">
                  {action.avancement}%
                </span>
              </div>

              {/* Actions réalisées summary */}
              {action.actions_realisees && (
                <p className="text-[10px] text-muted-foreground mt-1.5 line-clamp-1 italic">
                  {action.actions_realisees}
                </p>
              )}
            </div>

            {/* Right column */}
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', statutCfg.badge)}>
                {statutCfg.label}
              </span>
              {action.efficacite && (
                <span className={cn(
                  'text-[9px] font-semibold px-2 py-0.5 rounded',
                  action.efficacite === 'efficace'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                )}>
                  {action.efficacite === 'efficace' ? '✓ Efficace' : '✗ Inefficace'}
                </span>
              )}
              <ChevronRight className={cn(
                'h-3.5 w-3.5 text-muted-foreground transition-transform',
                isSelected && 'rotate-90'
              )} />
            </div>
          </div>
        </CardContent>

        {/* Expanded detail */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border overflow-hidden"
            >
              <div className="p-4 bg-muted/20 space-y-3">
                {/* Description */}
                <div>
                  <p className="text-xs font-semibold mb-1 text-muted-foreground uppercase tracking-wide">Description</p>
                  <p className="text-xs leading-relaxed">{action.description}</p>
                </div>

                {action.actions_realisees && (
                  <div>
                    <p className="text-xs font-semibold mb-1 text-muted-foreground uppercase tracking-wide">Actions réalisées</p>
                    <p className="text-xs leading-relaxed">{action.actions_realisees}</p>
                  </div>
                )}

                <Separator />

                {/* Historique */}
                {action.historique.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                      <History className="h-3 w-3" /> Historique
                    </p>
                    <div className="space-y-2">
                      {action.historique.map((h, i) => (
                        <div key={i} className="flex gap-2 text-xs">
                          <div className="flex flex-col items-center">
                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-0.5" />
                            {i < action.historique.length - 1 && (
                              <div className="w-px flex-1 bg-border mt-1" />
                            )}
                          </div>
                          <div className="pb-2">
                            <p className="font-medium">{h.action}</p>
                            <p className="text-muted-foreground text-[10px]">
                              {h.auteur} · {new Date(h.date).toLocaleDateString('fr-MA')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 pt-1">
                  {action.statut === 'ouverte' && (
                    <Button size="sm" className="text-xs gap-1 h-7" onClick={e => { e.stopPropagation(); changeStatut('en_cours'); }}>
                      <TrendingUp className="h-3 w-3" /> Démarrer
                    </Button>
                  )}
                  {action.statut === 'en_cours' && (
                    <Button size="sm" className="text-xs gap-1 h-7" onClick={e => { e.stopPropagation(); changeStatut('cloturee'); }}>
                      <CheckCircle2 className="h-3 w-3" /> Clôturer
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs gap-1 h-7"
                    onClick={e => { e.stopPropagation(); onEdit(action); }}
                  >
                    <FileText className="h-3 w-3" /> Modifier
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function ActionsPage() {
  const [actionList, setActionList] = useState<Action[]>(actions);
  const [editAction, setEditAction] = useState<Action | null>(null);

  useEffect(() => {
    api.get('/corrective-actions').then(r => {
      if (Array.isArray(r.data) && r.data.length) {
        const normalized = r.data.map(normalize);
        setActionList(prev => {
          const existingCodes = new Set(prev.map(a => a.code));
          const newOnes = normalized.filter((a: Action) => !existingCodes.has(a.code));
          return newOnes.length > 0 ? [...prev, ...newOnes] : prev;
        });
      }
    }).catch(() => {});
  }, []);

  const [search,   setSearch]   = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const handleAdd = (a: any) => setActionList(prev => [normalize(a), ...prev]);

  const handleSaveAction = (updated: Action) => {
    setActionList(prev => prev.map(a => a.id === updated.id ? updated : a));
  };

  const stats = {
    total:     actionList.length,
    ouvertes:  actionList.filter(a => a.statut === 'ouverte').length,
    en_cours:  actionList.filter(a => a.statut === 'en_cours').length,
    cloturees: actionList.filter(a => a.statut === 'cloturee').length,
    efficaces: actionList.filter(a => a.efficacite === 'efficace').length,
    taux:      actionList.filter(a => a.statut === 'cloturee').length > 0
      ? Math.round(
          (actionList.filter(a => a.efficacite === 'efficace').length /
           actionList.filter(a => a.statut === 'cloturee').length) * 100
        )
      : 0,
  };

  const filterActions = (tab: string) =>
    actionList.filter(a => {
      const matchSearch =
        (a.titre ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (a.code  ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (a.source ?? '').toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;
      if (tab === 'toutes')    return true;
      if (tab === 'ouvertes')  return a.statut === 'ouverte';
      if (tab === 'en_cours')  return a.statut === 'en_cours';
      if (tab === 'cloturees') return a.statut === 'cloturee';
      return true;
    });

  return (
    <div className="page-container animate-fade-up">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            Actions Correctives &amp; Préventives
          </h1>
          <p className="page-subtitle">
            ISO 21001 §10.2 · Suivi des actions correctives, préventives et d'amélioration · Master IFDL
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1"
            onClick={() => printActions(filterActions('toutes'))}
          >
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button size="sm" className="text-xs gap-1" onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5" /> Nouvelle action
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total',             value: stats.total,     color: 'text-foreground' },
          { label: 'Ouvertes',          value: stats.ouvertes,  color: 'text-gray-600' },
          { label: 'En cours',          value: stats.en_cours,  color: 'text-blue-600' },
          { label: 'Clôturées eff.',    value: stats.efficaces, color: 'text-green-600' },
          { label: "Taux d'efficacité", value: `${stats.taux}%`, color: stats.taux >= 80 ? 'text-green-600' : 'text-amber-600' },
        ].map(s => (
          <Card key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Search + Tabs */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Rechercher une action..."
            className="pl-9 h-8 text-xs"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
          <Filter className="h-3.5 w-3.5" /> Filtrer
        </Button>
      </div>

      <Tabs defaultValue="toutes">
        <TabsList className="h-9">
          <TabsTrigger value="toutes"    className="text-xs">Toutes ({actionList.length})</TabsTrigger>
          <TabsTrigger value="ouvertes"  className="text-xs">Ouvertes ({stats.ouvertes})</TabsTrigger>
          <TabsTrigger value="en_cours"  className="text-xs">En cours ({stats.en_cours})</TabsTrigger>
          <TabsTrigger value="cloturees" className="text-xs">Clôturées ({stats.cloturees})</TabsTrigger>
        </TabsList>

        {(['toutes', 'ouvertes', 'en_cours', 'cloturees'] as const).map(tab => (
          <TabsContent key={tab} value={tab} className="mt-4 space-y-2">
            {filterActions(tab).length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Inbox className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">Aucune action dans cette catégorie</p>
                </CardContent>
              </Card>
            ) : (
              filterActions(tab).map(action => (
                <ActionCard
                  key={action.id}
                  action={action}
                  isSelected={selected === action.id}
                  onSelect={() => setSelected(selected === action.id ? null : action.id)}
                  onUpdate={updated => setActionList(prev => prev.map(a => a.id === updated.id ? updated : a))}
                  onEdit={setEditAction}
                />
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Add form modal */}
      <AnimatePresence>
        {showForm && <AddActionForm onClose={() => setShowForm(false)} onAdd={handleAdd} />}
      </AnimatePresence>

      {/* Edit modal */}
      <AnimatePresence>
        {editAction && (
          <EditActionModal
            action={editAction}
            onClose={() => setEditAction(null)}
            onSave={updated => { handleSaveAction(updated); setEditAction(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
