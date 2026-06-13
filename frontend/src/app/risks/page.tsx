/**
 * Risques & Opportunités — ISO 21001 clause 6.1
 * SMART SMOE IFDL · Master IFDL · ESEF Berrechid
 */
'use client';

import { useState } from 'react';
import { downloadExport } from '@/lib/export';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Plus, Search, Filter, Calendar, User,
  TrendingUp, ChevronDown, ChevronRight, Download,
  X, Target, Shield, Zap, Eye, Edit2, FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// ── Mock Data ─────────────────────────────────────────────────
const risks = [
  { id: 1, code: 'R-001', type: 'risque', categorie: 'operationnel', libelle: "Faible taux d'encadrement pédagogique", description: "Le ratio enseignant/étudiant dépasse le seuil critique en période de pointe.", probabilite: 4, impact: 4, statut: 'traitement', process: 'PR-02', responsable: 'Pr. Benali', echeance: '2026-09-01', plan: "Recrutement de 2 ATER supplémentaires + mutualisation des TD.", is_active: true },
  { id: 2, code: 'R-002', type: 'risque', categorie: 'financier', libelle: 'Insuffisance du budget de formation continue', description: "Le budget formation ne couvre que 60% des besoins identifiés.", probabilite: 3, impact: 4, statut: 'analyse', process: 'PR-01', responsable: 'Direction', echeance: '2026-12-01', plan: 'Demande subvention MENFP + partenariats privés.', is_active: true },
  { id: 3, code: 'R-003', type: 'risque', categorie: 'conformite', libelle: 'Risque de non-conformité documentation', description: "Plusieurs procédures obsolètes non mises à jour depuis plus de 2 ans.", probabilite: 3, impact: 3, statut: 'surveille', process: 'PR-03', responsable: 'Resp. Qualité', echeance: '2026-07-15', plan: 'Audit documentaire mensuel automatisé.', is_active: true },
  { id: 4, code: 'R-004', type: 'risque', categorie: 'reputation', libelle: "Baisse de l'attractivité de la formation", description: "Diminution des candidatures observée -15% par rapport à N-1.", probabilite: 2, impact: 5, statut: 'traitement', process: 'PR-01', responsable: 'Direction', echeance: '2026-06-30', plan: 'Plan de communication renforcé + journée portes ouvertes.', is_active: true },
  { id: 5, code: 'O-001', type: 'opportunite', categorie: 'strategique', libelle: 'Partenariat Université Mohammed V', description: "Opportunité de co-accréditation et double diplôme avec UM5 Rabat.", probabilite: 3, impact: 5, statut: 'analyse', process: 'PR-01', responsable: 'Direction', echeance: '2026-10-01', plan: 'Convention cadre à négocier avant juin 2026.', is_active: true },
  { id: 6, code: 'O-002', type: 'opportunite', categorie: 'operationnel', libelle: 'Digitalisation complète des parcours IFDL', description: "Adoption complète du e-learning permettrait d'accueillir 2x plus d'étudiants.", probabilite: 4, impact: 4, statut: 'surveille', process: 'PR-02', responsable: 'Coord. Digital', echeance: '2027-01-01', plan: 'Phase pilote S1 2027 avec 1 module complet en ligne.', is_active: true },
  { id: 7, code: 'R-005', type: 'risque', categorie: 'operationnel', libelle: 'Départ de compétences clés', description: "Risque de démission de 2 enseignants-chercheurs principaux.", probabilite: 2, impact: 4, statut: 'surveille', process: 'PR-02', responsable: 'RH', echeance: '2026-12-31', plan: "Plan de fidélisation + amélioration conditions de travail.", is_active: true },
  { id: 8, code: 'O-003', type: 'opportunite', categorie: 'strategique', libelle: 'Certification ISO 21001 — avantage concurrentiel', description: "Être le premier master certifié ISO 21001 au Maroc.", probabilite: 5, impact: 5, statut: 'traitement', process: 'Tous', responsable: 'Resp. Qualité', echeance: '2027-03-01', plan: "Déploiement complet SMOE + audit blanc H2 2026.", is_active: true },
];

// ── Config maps ───────────────────────────────────────────────
const statutConfig: Record<string, { label: string; badge: string; dot: string; step: number }> = {
  identifie: { label: 'Identifié',  badge: 'bg-gray-100 text-gray-700',    dot: 'bg-gray-400',   step: 1 },
  analyse:   { label: 'Analysé',    badge: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500',   step: 2 },
  traitement:{ label: 'Traitement', badge: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-500',  step: 3 },
  surveille: { label: 'Surveillé',  badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500', step: 4 },
  clos:      { label: 'Clos',       badge: 'bg-green-100 text-green-700',  dot: 'bg-green-500',  step: 5 },
};

const categorieConfig: Record<string, string> = {
  operationnel: 'bg-blue-50 text-blue-700 border-blue-200',
  financier:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  conformite:   'bg-purple-50 text-purple-700 border-purple-200',
  reputation:   'bg-rose-50 text-rose-700 border-rose-200',
  strategique:  'bg-amber-50 text-amber-700 border-amber-200',
};

function getNiveauCriticite(p: number, i: number) {
  const n = p * i;
  if (n >= 16) return { label: 'Critique',  color: 'text-red-600',    bar: 'bg-red-500',    bg: 'bg-red-50' };
  if (n >= 9)  return { label: 'Élevé',     color: 'text-orange-600', bar: 'bg-orange-400', bg: 'bg-orange-50' };
  if (n >= 4)  return { label: 'Modéré',    color: 'text-yellow-600', bar: 'bg-yellow-400', bg: 'bg-yellow-50' };
  return             { label: 'Faible',    color: 'text-green-600',  bar: 'bg-green-500',  bg: 'bg-green-50' };
}

// ── Risk Heatmap ──────────────────────────────────────────────
function RiskHeatmap({ data }: { data: typeof risks }) {
  // heatmap-cell class level: product p*i mapped to 1-5
  function cellLevel(p: number, i: number) {
    const n = p * i;
    if (n >= 16) return 5;
    if (n >= 9)  return 4;
    if (n >= 6)  return 3;
    if (n >= 3)  return 2;
    return 1;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Matrice des risques — Probabilité × Impact
        </CardTitle>
        <p className="text-xs text-muted-foreground">ISO 21001 §6.1 · Positionnement des risques identifiés</p>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          {/* Y-axis label */}
          <div className="flex flex-col items-center justify-center gap-1">
            <span className="text-[10px] text-muted-foreground font-medium writing-mode-vertical"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: '0.1em' }}>
              PROBABILITÉ
            </span>
          </div>

          <div className="flex-1">
            {/* Grid rows: probability 5 (top) → 1 (bottom) */}
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map(prob => (
                <div key={prob} className="flex items-center gap-1">
                  <span className="text-[10px] text-muted-foreground w-4 text-right flex-shrink-0">{prob}</span>
                  {[1, 2, 3, 4, 5].map(imp => {
                    const level = cellLevel(prob, imp);
                    const cellRisks = data.filter(r => r.probabilite === prob && r.impact === imp);
                    return (
                      <div
                        key={imp}
                        className={cn('heatmap-cell flex-1 relative min-h-[48px] group', `heatmap-${level}`)}
                        title={cellRisks.map(r => r.code).join(', ')}
                      >
                        {cellRisks.length > 0 && (
                          <div className="flex flex-col items-center gap-0.5">
                            {cellRisks.map(r => (
                              <span key={r.code} className="text-[9px] font-bold leading-none bg-white/80 dark:bg-black/40 px-1 rounded">
                                {r.code}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            {/* X-axis */}
            <div className="flex items-center gap-1 mt-1">
              <span className="w-4 flex-shrink-0" />
              {[1, 2, 3, 4, 5].map(n => (
                <span key={n} className="flex-1 text-center text-[10px] text-muted-foreground">{n}</span>
              ))}
            </div>
            <p className="text-center text-[10px] text-muted-foreground mt-1 tracking-wider">IMPACT</p>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-1.5 justify-center text-[10px]">
            {[
              { cls: 'heatmap-1', label: 'Faible' },
              { cls: 'heatmap-2', label: 'Bas' },
              { cls: 'heatmap-3', label: 'Modéré' },
              { cls: 'heatmap-4', label: 'Élevé' },
              { cls: 'heatmap-5', label: 'Critique' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={cn('w-3 h-3 rounded', l.cls)} />
                <span className="text-muted-foreground">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Statut Workflow ────────────────────────────────────────────
function StatutWorkflow({ statut }: { statut: string }) {
  const steps = ['identifie', 'analyse', 'traitement', 'surveille', 'clos'];
  const labels = ['Identifié', 'Analysé', 'Traitement', 'Surveillé', 'Clos'];
  const currentStep = statutConfig[statut]?.step ?? 1;

  return (
    <div className="flex items-center gap-0.5 mt-2">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center flex-1">
          <div className={cn(
            'flex-1 h-1 rounded-full transition-colors',
            i < currentStep ? 'bg-primary' : 'bg-muted'
          )} />
          {i < steps.length - 1 && (
            <div className={cn('w-1 h-1 rounded-full mx-0.5', i < currentStep - 1 ? 'bg-primary' : 'bg-muted')} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Add Risk Form (Modal) ──────────────────────────────────────
function AddRiskForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card border border-border rounded-xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold">Nouveau risque / opportunité</h3>
            <p className="text-xs text-muted-foreground">ISO 21001 §6.1 · Master IFDL · ESEF Berrechid</p>
          </div>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Type *</Label>
              <select className="w-full h-9 rounded-lg border border-input bg-background text-xs px-3">
                <option value="risque">Risque</option>
                <option value="opportunite">Opportunité</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Catégorie *</Label>
              <select className="w-full h-9 rounded-lg border border-input bg-background text-xs px-3">
                <option value="operationnel">Opérationnel</option>
                <option value="financier">Financier</option>
                <option value="conformite">Conformité</option>
                <option value="reputation">Réputation</option>
                <option value="strategique">Stratégique</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Libellé *</Label>
            <Input placeholder="Intitulé court du risque ou de l'opportunité..." className="h-9 text-sm" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Description</Label>
            <textarea
              className="w-full h-20 rounded-lg border border-input bg-background text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Contexte, causes, conséquences potentielles..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Probabilité (1–5)</Label>
              <select className="w-full h-9 rounded-lg border border-input bg-background text-xs px-3">
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Impact (1–5)</Label>
              <select className="w-full h-9 rounded-lg border border-input bg-background text-xs px-3">
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Plan de traitement</Label>
            <textarea
              className="w-full h-16 rounded-lg border border-input bg-background text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Actions planifiées pour traiter ce risque / capitaliser sur cette opportunité..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Responsable</Label>
              <Input placeholder="Nom / fonction..." className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Échéance</Label>
              <Input type="date" className="h-9 text-sm" />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Processus concerné</Label>
            <select className="w-full h-9 rounded-lg border border-input bg-background text-xs px-3">
              <option value="">Sélectionner...</option>
              <option value="PR-01">PR-01 — Pilotage</option>
              <option value="PR-02">PR-02 — Réalisation pédagogique</option>
              <option value="PR-03">PR-03 — Support</option>
              <option value="PR-04">PR-04 — Évaluation</option>
              <option value="Tous">Tous les processus</option>
            </select>
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={onClose}>Annuler</Button>
            <Button size="sm" className="flex-1 h-8 text-xs gap-1" onClick={onClose}>
              <Plus className="h-3 w-3" /> Enregistrer
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function RisksPage() {
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState<'all' | 'risque' | 'opportunite'>('all');
  const [showForm, setShowForm]   = useState(false);
  const [expanded, setExpanded]   = useState<number | null>(null);

  const filtered = risks.filter(r => {
    const matchType   = filter === 'all' || r.type === filter;
    const matchSearch = r.libelle.toLowerCase().includes(search.toLowerCase()) ||
                        r.code.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const stats = {
    total:       risks.length,
    critiques:   risks.filter(r => r.type === 'risque' && r.probabilite * r.impact >= 16).length,
    opportunites:risks.filter(r => r.type === 'opportunite').length,
    traitement:  risks.filter(r => r.statut === 'traitement').length,
  };

  return (
    <div className="page-container animate-fade-up">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Risques &amp; Opportunités
          </h1>
          <p className="page-subtitle">
            Identification · Évaluation · Traitement · ISO 21001 §6.1 · Master IFDL
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1"
            onClick={() => downloadExport('risks', 'xlsx', 'registre-risques.xlsx')}
          >
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button size="sm" className="text-xs gap-1" onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5" /> Nouveau risque
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total risques',     value: stats.total,        color: 'text-foreground' },
          { label: 'Risques critiques', value: stats.critiques,    color: 'text-red-600' },
          { label: 'Opportunités',      value: stats.opportunites, color: 'text-emerald-600' },
          { label: 'En traitement',     value: stats.traitement,   color: 'text-amber-600' },
        ].map(s => (
          <Card key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Heatmap */}
      <RiskHeatmap data={risks} />

      {/* Filter + Search */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 bg-muted/40 rounded-lg p-1">
          {([['all', 'Tous'], ['risque', 'Risques'], ['opportunite', 'Opportunités']] as const).map(([val, lbl]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                filter === val ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {lbl}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Rechercher un risque..."
            className="pl-9 h-8 text-xs"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
          <Filter className="h-3.5 w-3.5" /> Filtrer
        </Button>
      </div>

      {/* Risk List */}
      <div className="space-y-2">
        {filtered.map(r => {
          const niveau  = getNiveauCriticite(r.probabilite, r.impact);
          const statCfg = statutConfig[r.statut] ?? statutConfig.identifie;
          const catCfg  = categorieConfig[r.categorie] ?? 'bg-gray-100 text-gray-700 border-gray-200';
          const score   = r.probabilite * r.impact;
          const isOpen  = expanded === r.id;

          return (
            <motion.div key={r.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className={cn('overflow-hidden hover:shadow-md transition-all', isOpen && 'ring-2 ring-primary/30')}>
                <CardContent className="p-0">
                  {/* Main row */}
                  <button
                    className="w-full text-left p-4"
                    onClick={() => setExpanded(isOpen ? null : r.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn('w-2 h-2 rounded-full flex-shrink-0 mt-2', statCfg.dot)} />

                      <div className="flex-1 min-w-0">
                        {/* Badges row */}
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-mono text-muted-foreground">{r.code}</span>
                          <span className={cn(
                            'text-[9px] font-semibold px-2 py-0.5 rounded border',
                            r.type === 'risque'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          )}>
                            {r.type === 'risque' ? 'Risque' : 'Opportunité'}
                          </span>
                          <span className={cn('text-[9px] font-semibold px-2 py-0.5 rounded border', catCfg)}>
                            {r.categorie}
                          </span>
                          <span className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded', niveau.bg, niveau.color)}>
                            {niveau.label}
                          </span>
                          <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">{r.process}</span>
                        </div>

                        <p className="text-sm font-semibold">{r.libelle}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{r.description}</p>

                        {/* Probabilité × Impact bar */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] text-muted-foreground">P{r.probabilite} × I{r.impact} = </span>
                          <span className={cn('text-[10px] font-bold', niveau.color)}>{score}/25</span>
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[80px]">
                            <div
                              className={cn('h-full rounded-full transition-all', niveau.bar)}
                              style={{ width: `${(score / 25) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Workflow */}
                        <div className="flex items-center gap-3 mt-1">
                          {(['identifie','analyse','traitement','surveille','clos'] as const).map((s, i) => {
                            const cfg = statutConfig[s];
                            const currentStep = statCfg.step;
                            return (
                              <div key={s} className="flex items-center gap-1">
                                {i > 0 && (
                                  <div className={cn('h-px w-4', i < currentStep ? 'bg-primary' : 'bg-muted')} />
                                )}
                                <span className={cn(
                                  'text-[9px] font-medium',
                                  i + 1 === currentStep ? 'text-primary font-bold' : i < currentStep ? 'text-muted-foreground' : 'text-muted-foreground/50'
                                )}>
                                  {cfg.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1"><User className="h-2.5 w-2.5" />{r.responsable}</span>
                          <span className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5" />{new Date(r.echeance).toLocaleDateString('fr-MA')}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', statCfg.badge)}>
                          {statCfg.label}
                        </span>
                        <span className={cn('text-lg font-bold', niveau.color)}>{score}</span>
                        {isOpen
                          ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                          : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        }
                      </div>
                    </div>
                  </button>

                  {/* Expandable plan */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border overflow-hidden"
                      >
                        <div className="p-4 bg-muted/20 space-y-3">
                          <div>
                            <p className="text-xs font-semibold mb-1 flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5 text-primary" />
                              Plan de traitement
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed">{r.plan}</p>
                          </div>
                          <Separator />
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            {[
                              { label: 'Processus', value: r.process },
                              { label: 'Responsable', value: r.responsable },
                              { label: 'Échéance', value: new Date(r.echeance).toLocaleDateString('fr-MA') },
                            ].map(item => (
                              <div key={item.label} className="bg-card rounded px-2 py-1.5 border">
                                <p className="text-muted-foreground text-[10px]">{item.label}</p>
                                <p className="font-semibold">{item.value}</p>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="text-xs gap-1 h-7">
                              <Edit2 className="h-3 w-3" /> Modifier
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs gap-1 h-7">
                              <Eye className="h-3 w-3" /> Historique
                            </Button>
                          </div>
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

      <AnimatePresence>
        {showForm && <AddRiskForm onClose={() => setShowForm(false)} />}
      </AnimatePresence>
    </div>
  );
}
