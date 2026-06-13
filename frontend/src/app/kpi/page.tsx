/**
 * KPI Page — Gestion des indicateurs de performance
 * Dashboard KPI · Saisie · Graphiques · Alertes
 */
'use client';

import { useState } from 'react';
import { downloadExport } from '@/lib/export';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, Plus, Search, Filter, TrendingUp, TrendingDown,
  Minus, AlertTriangle, CheckCircle2, Edit2, BarChart3,
  Download, RefreshCw, ChevronDown, X, Save, Calendar,
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// ── Mock KPI data ──────────────────────────────────────────────
const kpiList = [
  {
    id: 1, code: 'KPI-01', libelle: 'Taux de satisfaction des étudiants',
    valeur_actuelle: 80, valeur_cible: 80, seuil_alerte: 70,
    unite: '%', statut: 'vert', frequence: 'semestriel',
    process: 'PR-04', axe: 'Satisfaction', responsable: 'Dr. Fatima Ouhbi',
    historique: [
      { periode: 'S1 24', valeur: 72 }, { periode: 'S2 24', valeur: 74 },
      { periode: 'S1 25', valeur: 71 }, { periode: 'S2 25', valeur: 76 },
      { periode: 'S1 26', valeur: 80 },
    ],
  },
  {
    id: 2, code: 'KPI-02', libelle: 'Taux de réussite aux examens',
    valeur_actuelle: 86, valeur_cible: 85, seuil_alerte: 75,
    unite: '%', statut: 'vert', frequence: 'semestriel',
    process: 'PR-02', axe: 'Pédagogie', responsable: 'Pr. Amine Benali',
    historique: [
      { periode: 'S1 24', valeur: 74 }, { periode: 'S2 24', valeur: 78 },
      { periode: 'S1 25', valeur: 80 }, { periode: 'S2 25', valeur: 83 },
      { periode: 'S1 26', valeur: 86 },
    ],
  },
  {
    id: 3, code: 'KPI-03', libelle: 'Taux de diplomation',
    valeur_actuelle: 88, valeur_cible: 90, seuil_alerte: 80,
    unite: '%', statut: 'orange', frequence: 'annuel',
    process: 'PR-02', axe: 'Pédagogie', responsable: 'Pr. Amine Benali',
    historique: [
      { periode: '2023', valeur: 80 }, { periode: '2024', valeur: 84 },
      { periode: '2025', valeur: 88 },
    ],
  },
  {
    id: 4, code: 'KPI-04', libelle: "Taux d'insertion professionnelle",
    valeur_actuelle: 68, valeur_cible: 75, seuil_alerte: 65,
    unite: '%', statut: 'rouge', frequence: 'annuel',
    process: 'PR-02', axe: 'Employabilité', responsable: 'Pr. Amine Benali',
    historique: [
      { periode: '2023', valeur: 60 }, { periode: '2024', valeur: 65 },
      { periode: '2025', valeur: 68 },
    ],
  },
  {
    id: 5, code: 'KPI-05', libelle: 'Disponibilité plateforme Moodle',
    valeur_actuelle: 99.1, valeur_cible: 99, seuil_alerte: 95,
    unite: '%', statut: 'vert', frequence: 'mensuel',
    process: 'PR-03', axe: 'Infrastructure', responsable: 'M. Karim Tahiri',
    historique: [
      { periode: 'Jan', valeur: 98.5 }, { periode: 'Fév', valeur: 99.1 },
      { periode: 'Mar', valeur: 97.8 }, { periode: 'Avr', valeur: 99.0 },
      { periode: 'Mai', valeur: 99.4 }, { periode: 'Jun', valeur: 99.1 },
    ],
  },
  {
    id: 6, code: 'KPI-06', libelle: 'Délai moyen traitement réclamations',
    valeur_actuelle: 12, valeur_cible: 10, seuil_alerte: 15,
    unite: 'jours', statut: 'orange', frequence: 'mensuel',
    process: 'PR-04', axe: 'Réclamations', responsable: 'Dr. Fatima Ouhbi',
    historique: [
      { periode: 'Jan', valeur: 18 }, { periode: 'Fév', valeur: 16 },
      { periode: 'Mar', valeur: 14 }, { periode: 'Avr', valeur: 13 },
      { periode: 'Mai', valeur: 12 }, { periode: 'Jun', valeur: 12 },
    ],
  },
  {
    id: 7, code: 'KPI-07', libelle: 'Taux traitement non-conformités',
    valeur_actuelle: 78, valeur_cible: 95, seuil_alerte: 85,
    unite: '%', statut: 'rouge', frequence: 'trimestriel',
    process: 'PR-04', axe: 'Qualité', responsable: 'Dr. Fatima Ouhbi',
    historique: [
      { periode: 'T1 25', valeur: 65 }, { periode: 'T2 25', valeur: 70 },
      { periode: 'T3 25', valeur: 74 }, { periode: 'T4 25', valeur: 78 },
    ],
  },
  {
    id: 8, code: 'KPI-08', libelle: 'Satisfaction des enseignants',
    valeur_actuelle: 75, valeur_cible: 78, seuil_alerte: 68,
    unite: '%', statut: 'orange', frequence: 'annuel',
    process: 'PR-03', axe: 'Satisfaction', responsable: 'Dr. Fatima Ouhbi',
    historique: [
      { periode: '2023', valeur: 68 }, { periode: '2024', valeur: 72 },
      { periode: '2025', valeur: 75 },
    ],
  },
  {
    id: 9, code: 'KPI-09', libelle: 'Nombre de publications scientifiques',
    valeur_actuelle: 8, valeur_cible: 10, seuil_alerte: 5,
    unite: 'pub.', statut: 'orange', frequence: 'annuel',
    process: 'PR-02', axe: 'Recherche', responsable: 'Pr. Amine Benali',
    historique: [
      { periode: '2023', valeur: 5 }, { periode: '2024', valeur: 7 },
      { periode: '2025', valeur: 8 },
    ],
  },
  {
    id: 10, code: 'KPI-10', libelle: 'Score conformité ISO 21001',
    valeur_actuelle: 76, valeur_cible: 85, seuil_alerte: 70,
    unite: '%', statut: 'orange', frequence: 'semestriel',
    process: 'PR-01', axe: 'ISO', responsable: 'Dr. Fatima Ouhbi',
    historique: [
      { periode: 'S1 25', valeur: 68 }, { periode: 'S2 25', valeur: 72 },
      { periode: 'S1 26', valeur: 76 },
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────
const statutConfig = {
  vert:   { color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', icon: CheckCircle2,  label: 'Atteint',  barColor: '#22c55e' },
  orange: { color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', icon: AlertTriangle, label: 'Alerte',   barColor: '#f59e0b' },
  rouge:  { color: 'text-red-600',   bg: 'bg-red-100 dark:bg-red-900/30',     icon: X,             label: 'Critique', barColor: '#ef4444' },
};

function TauxRealisation({ valeur, cible }: { valeur: number; cible: number }) {
  const taux = Math.min(Math.round((valeur / cible) * 100), 150);
  return (
    <div className="flex items-center gap-1 text-xs">
      {taux >= 100
        ? <TrendingUp className="h-3 w-3 text-green-500" />
        : taux >= 85
        ? <Minus className="h-3 w-3 text-amber-500" />
        : <TrendingDown className="h-3 w-3 text-red-500" />}
      <span className={cn(
        'font-semibold',
        taux >= 100 ? 'text-green-600' : taux >= 85 ? 'text-amber-600' : 'text-red-600'
      )}>
        {taux}%
      </span>
    </div>
  );
}

// ── Nouveau KPI Modal ──────────────────────────────────────────
const AXES    = ['Pédagogie', 'Satisfaction', 'Employabilité', 'Infrastructure', 'Réclamations', 'Qualité', 'Recherche', 'ISO', 'Autre'];
const FREQS   = ['mensuel', 'trimestriel', 'semestriel', 'annuel'];
const PROCESS = ['PR-01', 'PR-02', 'PR-03', 'PR-04', 'PR-05'];

interface NouveauKpiForm {
  libelle: string; code: string; unite: string;
  valeur_cible: string; seuil_alerte: string;
  frequence: string; process: string; axe: string; responsable: string;
}
const FORM_INIT: NouveauKpiForm = {
  libelle: '', code: '', unite: '%',
  valeur_cible: '', seuil_alerte: '',
  frequence: 'semestriel', process: 'PR-01', axe: 'Qualité', responsable: '',
};

function NouveauKpiModal({ onClose, onAdd }: { onClose: () => void; onAdd: (kpi: typeof kpiList[0]) => void }) {
  const [form, setForm] = useState<NouveauKpiForm>(FORM_INIT);
  const [errors, setErrors] = useState<Partial<NouveauKpiForm>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const set = (field: keyof NouveauKpiForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e: Partial<NouveauKpiForm> = {};
    if (!form.libelle.trim()) e.libelle = 'Requis';
    if (!form.code.trim())    e.code    = 'Requis';
    if (!form.unite.trim())   e.unite   = 'Requis';
    if (!form.valeur_cible || isNaN(Number(form.valeur_cible))) e.valeur_cible = 'Nombre requis';
    if (!form.seuil_alerte || isNaN(Number(form.seuil_alerte))) e.seuil_alerte = 'Nombre requis';
    if (!form.responsable.trim()) e.responsable = 'Requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      const { data } = await api.post('/kpis', {
        libelle: form.libelle,
        code: form.code.toUpperCase(),
        unite: form.unite,
        valeur_cible: Number(form.valeur_cible),
        seuil_alerte: Number(form.seuil_alerte),
        frequence: form.frequence,
        statut: 'orange',
      });
      onAdd({ ...data, process: form.process, axe: form.axe, responsable: form.responsable, historique: [] });
      onClose();
    } catch {
      setApiError('Erreur lors de la création. Vérifiez la connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card border border-border rounded-xl p-5 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" /> Nouveau KPI
            </h3>
            <p className="text-xs text-muted-foreground">Créer un nouvel indicateur de performance</p>
          </div>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground hover:text-foreground" /></button>
        </div>

        <div className="space-y-3">
          {/* Libellé */}
          <div className="space-y-1">
            <Label className="text-xs font-medium">Libellé <span className="text-red-500">*</span></Label>
            <Input value={form.libelle} onChange={set('libelle')} placeholder="Ex: Taux de satisfaction des étudiants" className="h-9 text-sm" />
            {errors.libelle && <p className="text-[10px] text-red-500">{errors.libelle}</p>}
          </div>

          {/* Code + Unité */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Code <span className="text-red-500">*</span></Label>
              <Input value={form.code} onChange={set('code')} placeholder="Ex: KPI-11" className="h-9 text-sm font-mono" />
              {errors.code && <p className="text-[10px] text-red-500">{errors.code}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Unité <span className="text-red-500">*</span></Label>
              <Input value={form.unite} onChange={set('unite')} placeholder="%, jours, pub., …" className="h-9 text-sm" />
              {errors.unite && <p className="text-[10px] text-red-500">{errors.unite}</p>}
            </div>
          </div>

          {/* Cible + Seuil */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Valeur cible <span className="text-red-500">*</span></Label>
              <Input type="number" step="0.1" value={form.valeur_cible} onChange={set('valeur_cible')} placeholder="Ex: 85" className="h-9 text-sm" />
              {errors.valeur_cible && <p className="text-[10px] text-red-500">{errors.valeur_cible}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Seuil d'alerte <span className="text-red-500">*</span></Label>
              <Input type="number" step="0.1" value={form.seuil_alerte} onChange={set('seuil_alerte')} placeholder="Ex: 75" className="h-9 text-sm" />
              {errors.seuil_alerte && <p className="text-[10px] text-red-500">{errors.seuil_alerte}</p>}
            </div>
          </div>

          {/* Fréquence + Processus */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Fréquence</Label>
              <select value={form.frequence} onChange={set('frequence')} className="w-full h-9 text-sm rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-ring">
                {FREQS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Processus</Label>
              <select value={form.process} onChange={set('process')} className="w-full h-9 text-sm rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-ring">
                {PROCESS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Axe + Responsable */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Axe stratégique</Label>
              <select value={form.axe} onChange={set('axe')} className="w-full h-9 text-sm rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-ring">
                {AXES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Responsable <span className="text-red-500">*</span></Label>
              <Input value={form.responsable} onChange={set('responsable')} placeholder="Nom du responsable" className="h-9 text-sm" />
              {errors.responsable && <p className="text-[10px] text-red-500">{errors.responsable}</p>}
            </div>
          </div>

          {apiError && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {apiError}
            </div>
          )}

          <Separator />

          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={onClose} disabled={loading}>Annuler</Button>
            <Button size="sm" className="flex-1 h-8 text-xs gap-1" onClick={handleSubmit} disabled={loading}>
              <Save className="h-3 w-3" /> {loading ? 'Enregistrement...' : 'Créer le KPI'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Saisie Modal ───────────────────────────────────────────────
function SaisieModal({ kpi, onClose }: { kpi: typeof kpiList[0]; onClose: () => void }) {
  const [valeur, setValeur] = useState('');
  const [commentaire, setCommentaire] = useState('');

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card border border-border rounded-xl p-5 max-w-sm w-full shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold">Saisir une mesure</h3>
            <p className="text-xs text-muted-foreground">{kpi.code} — {kpi.libelle}</p>
          </div>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>

        <div className="space-y-3">
          <div className="flex gap-3 p-3 bg-muted/30 rounded-lg text-xs">
            <div><p className="text-muted-foreground">Cible</p><p className="font-bold text-primary">{kpi.valeur_cible} {kpi.unite}</p></div>
            <div><p className="text-muted-foreground">Alerte</p><p className="font-bold text-amber-600">{kpi.seuil_alerte} {kpi.unite}</p></div>
            <div><p className="text-muted-foreground">Actuelle</p><p className="font-bold">{kpi.valeur_actuelle} {kpi.unite}</p></div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Nouvelle valeur ({kpi.unite})</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.1"
                placeholder={`Ex: ${kpi.valeur_cible}`}
                value={valeur}
                onChange={e => setValeur(e.target.value)}
                className="h-9 text-sm"
              />
              <span className="flex items-center text-sm text-muted-foreground px-2 bg-muted rounded-lg">{kpi.unite}</span>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Période</Label>
            <Input type="month" className="h-9 text-sm" defaultValue={new Date().toISOString().slice(0, 7)} />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Commentaire (optionnel)</Label>
            <Input
              placeholder="Observations..."
              value={commentaire}
              onChange={e => setCommentaire(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={onClose}>Annuler</Button>
            <Button size="sm" className="flex-1 h-8 text-xs gap-1" onClick={onClose}>
              <Save className="h-3 w-3" /> Enregistrer
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function KpiPage() {
  const [list, setList]           = useState(kpiList);
  const [search, setSearch]       = useState('');
  const [filterStatut, setFilter] = useState<'all' | 'vert' | 'orange' | 'rouge'>('all');
  const [selectedKpi, setKpi]     = useState<typeof kpiList[0] | null>(null);
  const [saisieKpi, setSaisieKpi] = useState<typeof kpiList[0] | null>(null);
  const [showNewKpi, setShowNewKpi] = useState(false);

  const handleAddKpi = (kpi: typeof kpiList[0]) => setList(prev => [...prev, kpi]);

  const filtered = list.filter(k => {
    const matchSearch = k.libelle.toLowerCase().includes(search.toLowerCase()) ||
                        k.code.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === 'all' || k.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  const summary = {
    vert:   list.filter(k => k.statut === 'vert').length,
    orange: list.filter(k => k.statut === 'orange').length,
    rouge:  list.filter(k => k.statut === 'rouge').length,
  };

  return (
    <div className="page-container animate-fade-up">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            KPI & Indicateurs de Performance
          </h1>
          <p className="page-subtitle">
            {list.length} indicateurs · Année universitaire 2025–2026 · Master IFDL
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs gap-1">
            <RefreshCw className="h-3.5 w-3.5" /> Actualiser
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1"
            onClick={() => downloadExport('kpis', 'xlsx', 'kpis.xlsx')}
          >
            <Download className="h-3.5 w-3.5" /> Export Excel
          </Button>
          <Button size="sm" className="text-xs gap-1" onClick={() => setShowNewKpi(true)}>
            <Plus className="h-3.5 w-3.5" /> Nouveau KPI
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total KPI', value: list.length, color: 'text-foreground', bg: 'bg-muted/50' },
          { label: '✓ Atteints', value: summary.vert,   color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
          { label: '⚠ En alerte', value: summary.orange, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
          { label: '✗ Critiques', value: summary.rouge,  color: 'text-red-600',   bg: 'bg-red-50 dark:bg-red-950/30' },
        ].map(s => (
          <Card key={s.label} className={cn('stat-card border-0 shadow-none', s.bg)}>
            <p className="stat-label">{s.label}</p>
            <p className={cn('text-3xl font-bold', s.color)}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground">
              {Math.round((s.value as number / list.length) * 100)}% du total
            </p>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="liste">
        <TabsList className="h-9">
          <TabsTrigger value="liste"     className="text-xs">Liste des KPI</TabsTrigger>
          <TabsTrigger value="evolution" className="text-xs">Évolution</TabsTrigger>
          <TabsTrigger value="alertes"   className="text-xs flex items-center gap-1">
            Alertes <Badge className="h-4 min-w-4 px-1 text-[9px] bg-red-500 text-white">{summary.orange + summary.rouge}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* ── Liste Tab ──────────────────────────────────── */}
        <TabsContent value="liste" className="mt-4 space-y-3">

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Rechercher un KPI..."
                className="pl-9 h-8 text-xs w-64"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-1">
              {(['all', 'vert', 'orange', 'rouge'] as const).map(f => (
                <Button
                  key={f}
                  size="sm"
                  variant={filterStatut === f ? 'default' : 'outline'}
                  className={cn('h-8 text-xs capitalize', filterStatut === f && f === 'vert' && 'bg-green-600 hover:bg-green-700', filterStatut === f && f === 'orange' && 'bg-amber-500 hover:bg-amber-600', filterStatut === f && f === 'rouge' && 'bg-red-600 hover:bg-red-700')}
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' ? 'Tous' : f === 'vert' ? '✓ Atteints' : f === 'orange' ? '⚠ Alertes' : '✗ Critiques'}
                </Button>
              ))}
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filtered.map(kpi => {
              const cfg = statutConfig[kpi.statut as keyof typeof statutConfig];
              const taux = Math.min(Math.round((kpi.valeur_actuelle / kpi.valeur_cible) * 100), 150);
              const isSelected = selectedKpi?.id === kpi.id;

              return (
                <motion.div key={kpi.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card
                    className={cn(
                      'overflow-hidden cursor-pointer transition-all hover:shadow-md',
                      `border-l-4`,
                      kpi.statut === 'vert'   && 'border-l-green-500',
                      kpi.statut === 'orange' && 'border-l-amber-500',
                      kpi.statut === 'rouge'  && 'border-l-red-500',
                      isSelected && 'ring-2 ring-primary/30',
                    )}
                    onClick={() => setKpi(isSelected ? null : kpi)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-mono text-muted-foreground">{kpi.code}</span>
                            <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">{kpi.process}</span>
                            <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{kpi.frequence}</span>
                          </div>
                          <p className="text-sm font-semibold truncate">{kpi.libelle}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', cfg.bg, cfg.color)}>
                            {cfg.label}
                          </span>
                          <TauxRealisation valeur={kpi.valeur_actuelle} cible={kpi.valeur_cible} />
                        </div>
                      </div>

                      {/* Values */}
                      <div className="flex items-end gap-2 mb-2">
                        <span className={cn('text-2xl font-bold', cfg.color)}>
                          {kpi.valeur_actuelle}
                        </span>
                        <span className="text-sm text-muted-foreground mb-0.5">{kpi.unite}</span>
                        <span className="text-xs text-muted-foreground mb-0.5 ml-auto">
                          Cible : <span className="font-semibold text-foreground">{kpi.valeur_cible} {kpi.unite}</span>
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="progress-track mb-2">
                        <div
                          className="progress-fill transition-all duration-700"
                          style={{ width: `${Math.min(taux, 100)}%`, background: cfg.barColor }}
                        />
                      </div>

                      {/* Sparkline */}
                      <div className="h-14">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={kpi.historique}>
                            <defs>
                              <linearGradient id={`g-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor={cfg.barColor} stopOpacity={0.2} />
                                <stop offset="95%" stopColor={cfg.barColor} stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="valeur" stroke={cfg.barColor} strokeWidth={1.5} fill={`url(#g-${kpi.id})`} dot={false} />
                            <ReferenceLine y={kpi.valeur_cible} stroke="#64748b" strokeDasharray="3 3" strokeWidth={1} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Footer */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-2 border-t border-border mt-2"
                          >
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                              <span>Responsable : <span className="font-medium text-foreground">{kpi.responsable}</span></span>
                              <span>Axe : <span className="font-medium text-foreground">{kpi.axe}</span></span>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" className="flex-1 h-7 text-xs gap-1" onClick={e => { e.stopPropagation(); setSaisieKpi(kpi); }}>
                                <Plus className="h-3 w-3" /> Saisir mesure
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 px-2">
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 px-2">
                                <BarChart3 className="h-3 w-3" />
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* ── Évolution Tab ─────────────────────────────── */}
        <TabsContent value="evolution" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {list.filter(k => k.historique.length >= 4).slice(0, 4).map(kpi => {
              const cfg = statutConfig[kpi.statut as keyof typeof statutConfig];
              return (
                <Card key={kpi.id}>
                  <CardHeader className="pb-1">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs font-semibold">{kpi.code} — {kpi.libelle}</CardTitle>
                      <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full', cfg.bg, cfg.color)}>
                        {kpi.valeur_actuelle} {kpi.unite}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={140}>
                      <LineChart data={kpi.historique}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="periode" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}${kpi.unite === '%' ? '%' : ''}`} />
                        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: any) => [`${v} ${kpi.unite}`]} />
                        <ReferenceLine y={kpi.valeur_cible} stroke="#0d3b7a" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'Cible', position: 'right', fontSize: 9, fill: '#0d3b7a' }} />
                        <Line type="monotone" dataKey="valeur" stroke={cfg.barColor} strokeWidth={2} dot={{ r: 3, fill: cfg.barColor }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ── Alertes Tab ───────────────────────────────── */}
        <TabsContent value="alertes" className="mt-4">
          <div className="space-y-3">
            {list.filter(k => k.statut !== 'vert').map(kpi => {
              const cfg = statutConfig[kpi.statut as keyof typeof statutConfig];
              const gap = kpi.valeur_cible - kpi.valeur_actuelle;
              return (
                <Card key={kpi.id} className={cn('border-l-4', kpi.statut === 'rouge' ? 'border-l-red-500' : 'border-l-amber-500')}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', cfg.bg)}>
                      <cfg.icon className={cn('h-4 w-4', cfg.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono text-muted-foreground">{kpi.code}</span>
                        <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full', cfg.bg, cfg.color)}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-sm font-medium truncate">{kpi.libelle}</p>
                      <p className="text-xs text-muted-foreground">
                        Valeur actuelle : <strong>{kpi.valeur_actuelle} {kpi.unite}</strong> · Cible : <strong>{kpi.valeur_cible} {kpi.unite}</strong> · Écart : <strong className={cfg.color}>−{gap.toFixed(1)} {kpi.unite}</strong>
                      </p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Button size="sm" className="h-7 text-xs gap-1" onClick={() => setSaisieKpi(kpi)}>
                        <Plus className="h-3 w-3" /> Saisir
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        Action corrective
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Saisie Modal */}
      <AnimatePresence>
        {saisieKpi && (
          <SaisieModal kpi={saisieKpi} onClose={() => setSaisieKpi(null)} />
        )}
      </AnimatePresence>

      {/* Nouveau KPI Modal */}
      <AnimatePresence>
        {showNewKpi && (
          <NouveauKpiModal onClose={() => setShowNewKpi(false)} onAdd={handleAddKpi} />
        )}
      </AnimatePresence>
    </div>
  );
}
