/**
 * Rapports & Revue de Direction — ISO 21001 clause 9.3
 * SMART SMOE IFDL · ESEF Berrechid · Master IFDL
 */
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Plus, Search, Filter, FileText, Download,
  Eye, Share2, X, Calendar, User, CheckCircle2, Clock,
  ChevronRight, Send, Users, Star, TrendingUp, Award,
  BookOpen, ClipboardList, Layers,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// ── Mock data ─────────────────────────────────────────────────
const reports = [
  { id: 1, titre: 'Revue de Direction S1 2025-2026', type: 'revue_direction', statut: 'approuve', auteur: 'Direction + Resp. Qualité', periode_debut: '2025-09-01', periode_fin: '2026-02-28', date_creation: '2026-03-01', nb_pages: 24, participants: ['Directeur', 'Resp. Qualité', 'Coord. Pédago', 'Resp. Admin'], decisions_cles: ['Validation plan amélioration 2026', 'Allocation budget formation +20%', 'Objectif certification ISO 21001 Q1 2027'] },
  { id: 2, titre: 'Revue de Direction S2 2024-2025', type: 'revue_direction', statut: 'approuve', auteur: 'Direction', periode_debut: '2025-03-01', periode_fin: '2025-08-31', date_creation: '2025-09-10', nb_pages: 20, participants: ['Directeur', 'Resp. Qualité', 'Coord. Pédago'], decisions_cles: ['Lancement SMOE', 'Budget outil numérique'] },
  { id: 3, titre: 'Bilan Qualité Annuel 2025', type: 'bilan_qualite', statut: 'approuve', auteur: 'Resp. Qualité', periode_debut: '2025-01-01', periode_fin: '2025-12-31', date_creation: '2026-01-15', nb_pages: 35, participants: [], decisions_cles: [] },
  { id: 4, titre: 'Rapport Audit Interne Programme 2026 — Q1', type: 'audit', statut: 'approuve', auteur: 'Pr. Benali', periode_debut: '2026-03-01', periode_fin: '2026-03-31', date_creation: '2026-04-01', nb_pages: 18, participants: [], decisions_cles: [] },
  { id: 5, titre: 'Rapport KPIs & Indicateurs S1 2026', type: 'bilan_qualite', statut: 'finalise', auteur: 'Resp. Qualité', periode_debut: '2026-01-01', periode_fin: '2026-06-30', date_creation: '2026-06-05', nb_pages: 12, participants: [], decisions_cles: [] },
  { id: 6, titre: 'Revue de Direction S1 2026-2027 — Brouillon', type: 'revue_direction', statut: 'brouillon', auteur: 'Resp. Qualité', periode_debut: '2026-09-01', periode_fin: '2027-02-28', date_creation: '2026-06-01', nb_pages: 0, participants: [], decisions_cles: [] },
];

// The most recent approved management review
const lastReview = reports.find(r => r.type === 'revue_direction' && r.statut === 'approuve' && r.id === 1)!;

const keyMetrics = [
  { label: 'Score ISO 21001',       value: '84%',  color: 'text-green-600',  icon: <Award className="h-4 w-4" /> },
  { label: 'NC clôturées',          value: '12/14', color: 'text-blue-600',   icon: <CheckCircle2 className="h-4 w-4" /> },
  { label: 'Satisfaction moy.',     value: '4.1/5', color: 'text-amber-600',  icon: <Star className="h-4 w-4" /> },
  { label: 'Formations réalisées',  value: '2/6',   color: 'text-primary',    icon: <TrendingUp className="h-4 w-4" /> },
];

// ── Helpers ────────────────────────────────────────────────────
const typeConfig: Record<string, { label: string; style: string; icon: React.ReactNode }> = {
  revue_direction: { label: 'Revue de direction', style: 'bg-purple-50 text-purple-700 border-purple-200', icon: <Users className="h-3 w-3" /> },
  bilan_qualite:   { label: 'Bilan qualité',       style: 'bg-blue-50 text-blue-700 border-blue-200',     icon: <BarChart3 className="h-3 w-3" /> },
  audit:           { label: 'Rapport audit',        style: 'bg-teal-50 text-teal-700 border-teal-200',     icon: <ClipboardList className="h-3 w-3" /> },
};

const statutConfig: Record<string, { label: string; badge: string; dot: string }> = {
  brouillon: { label: 'Brouillon',  badge: 'bg-gray-100 text-gray-600',    dot: 'bg-gray-400'    },
  finalise:  { label: 'Finalisé',   badge: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-500'   },
  approuve:  { label: 'Approuvé',   badge: 'bg-green-100 text-green-700',  dot: 'bg-green-500'   },
};

function typeFilter(tab: string, type: string): boolean {
  if (tab === 'tous') return true;
  return type === tab;
}

// ── Generate Report Modal ──────────────────────────────────────
function GenerateReportForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold">Générer un nouveau rapport</h3>
            <p className="text-xs text-muted-foreground">ISO 21001 §9.3 · SMART SMOE IFDL</p>
          </div>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs font-medium">Type de rapport</Label>
            <select className="w-full h-9 rounded-lg border border-input bg-background text-xs px-3">
              <option value="revue_direction">Revue de direction</option>
              <option value="bilan_qualite">Bilan qualité</option>
              <option value="audit">Rapport d'audit</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">Titre du rapport *</Label>
            <Input placeholder="Ex. Revue de Direction S1 2026-2027..." className="h-9 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Période — début</Label>
              <Input type="date" className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Période — fin</Label>
              <Input type="date" className="h-9 text-sm" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">Auteur / Responsable</Label>
            <Input placeholder="Resp. Qualité..." className="h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">Sections à inclure</Label>
            <div className="space-y-1.5">
              {['Contexte et parties intéressées', 'Résultats audits internes', 'État des NC et actions correctives', 'KPIs et indicateurs qualité', 'Satisfaction parties prenantes', 'Plan d\'amélioration'].map(s => (
                <label key={s} className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded" />
                  {s}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={onClose}>Annuler</Button>
            <Button size="sm" className="flex-1 h-8 text-xs gap-1" onClick={onClose}>
              <Send className="h-3 w-3" /> Générer
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Report Card ────────────────────────────────────────────────
function ReportCard({ report }: { report: typeof reports[0] }) {
  const tc = typeConfig[report.type] ?? typeConfig.bilan_qualite;
  const sc = statutConfig[report.statut] ?? statutConfig.brouillon;

  return (
    <motion.div layout initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="hover:shadow-md transition-all overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn('w-2 h-2 rounded-full flex-shrink-0 mt-2', sc.dot)} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={cn('text-[9px] font-semibold px-2 py-0.5 rounded border flex items-center gap-1', tc.style)}>
                  {tc.icon}{tc.label}
                </span>
                <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', sc.badge)}>
                  {sc.label}
                </span>
              </div>
              <p className="text-sm font-semibold leading-snug">{report.titre}</p>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><User className="h-2.5 w-2.5" />{report.auteur}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-2.5 w-2.5" />
                  Période : {new Date(report.periode_debut).toLocaleDateString('fr-MA', { month: 'short', year: 'numeric' })} →{' '}
                  {new Date(report.periode_fin).toLocaleDateString('fr-MA', { month: 'short', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1"><FileText className="h-2.5 w-2.5" />Créé le {new Date(report.date_creation).toLocaleDateString('fr-MA')}</span>
                {report.nb_pages > 0 && (
                  <span className="text-[10px] text-muted-foreground">{report.nb_pages} pages</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
              {report.nb_pages > 0 && (
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <Download className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function ReportsPage() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const stats = {
    total:        reports.length,
    revues:       reports.filter(r => r.type === 'revue_direction').length,
    en_attente:   reports.filter(r => r.statut === 'brouillon' || r.statut === 'finalise').length,
    derniere_revue: new Date(lastReview.date_creation).toLocaleDateString('fr-MA', { day: '2-digit', month: 'short', year: 'numeric' }),
  };

  const filtered = (tab: string) => reports.filter(r => {
    const matchSearch = r.titre.toLowerCase().includes(search.toLowerCase()) ||
      r.auteur.toLowerCase().includes(search.toLowerCase());
    const matchTab = typeFilter(tab, r.type);
    return matchSearch && matchTab;
  });

  return (
    <div className="page-container animate-fade-up">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Rapports & Revue de Direction
          </h1>
          <p className="page-subtitle">
            ISO 21001 §9.3 · Pilotage par les données · Master IFDL · ESEF Berrechid
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs gap-1">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button size="sm" className="text-xs gap-1" onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5" /> Générer un rapport
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Rapports générés',       value: stats.total,         color: 'text-foreground' },
          { label: 'Revues de direction',    value: stats.revues,        color: 'text-purple-600' },
          { label: 'En attente approbation', value: stats.en_attente,    color: 'text-amber-600' },
          { label: 'Dernière revue',         value: stats.derniere_revue, color: 'text-green-600' },
        ].map(s => (
          <Card key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className={cn('text-lg font-bold', s.color)}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Key Metrics Summary */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          Indicateurs clés — Période en cours (S1 2026)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {keyMetrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card className="hover:shadow-md transition-all">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={cn('flex-shrink-0', m.color)}>{m.icon}</div>
                  <div>
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className={cn('text-xl font-bold', m.color)}>{m.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Last Management Review Card */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                Dernière Revue de Direction
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {lastReview.titre} · Approuvée le {new Date(lastReview.date_creation).toLocaleDateString('fr-MA', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <Button size="sm" className="text-xs gap-1">
              <Plus className="h-3.5 w-3.5" /> Préparer nouvelle revue
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Participants */}
            <div>
              <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-muted-foreground" /> Participants
              </p>
              <div className="flex flex-wrap gap-1.5">
                {lastReview.participants.map(p => (
                  <span key={p} className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-medium">{p}</span>
                ))}
              </div>
            </div>

            {/* Période */}
            <div>
              <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Période couverte
              </p>
              <p className="text-sm font-medium">
                {new Date(lastReview.periode_debut).toLocaleDateString('fr-MA', { month: 'long', year: 'numeric' })}
                {' → '}
                {new Date(lastReview.periode_fin).toLocaleDateString('fr-MA', { month: 'long', year: 'numeric' })}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{lastReview.nb_pages} pages</p>
            </div>
          </div>

          <Separator />

          {/* Key decisions */}
          <div>
            <p className="text-xs font-semibold mb-2 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> Décisions clés
            </p>
            <div className="space-y-1.5">
              {lastReview.decisions_cles.map((d, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-2 text-xs"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <span>{d}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="text-xs gap-1 h-7">
              <Eye className="h-3 w-3" /> Voir le rapport
            </Button>
            <Button size="sm" variant="outline" className="text-xs gap-1 h-7">
              <Download className="h-3 w-3" /> Télécharger PDF
            </Button>
            <Button size="sm" variant="outline" className="text-xs gap-1 h-7">
              <Share2 className="h-3 w-3" /> Partager
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports list */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Rechercher un rapport..."
              className="pl-9 h-8 text-xs"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
            <Filter className="h-3.5 w-3.5" /> Filtrer
          </Button>
        </div>

        <Tabs defaultValue="tous">
          <TabsList className="h-9">
            <TabsTrigger value="tous"            className="text-xs">Tous ({reports.length})</TabsTrigger>
            <TabsTrigger value="revue_direction" className="text-xs">Revues direction ({reports.filter(r => r.type === 'revue_direction').length})</TabsTrigger>
            <TabsTrigger value="bilan_qualite"   className="text-xs">Bilans qualité ({reports.filter(r => r.type === 'bilan_qualite').length})</TabsTrigger>
            <TabsTrigger value="audit"           className="text-xs">Rapports audit ({reports.filter(r => r.type === 'audit').length})</TabsTrigger>
          </TabsList>

          {(['tous', 'revue_direction', 'bilan_qualite', 'audit'] as const).map(tab => (
            <TabsContent key={tab} value={tab} className="mt-4">
              <div className="space-y-2">
                {filtered(tab).length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-10 text-center">
                      <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">Aucun rapport dans cette catégorie</p>
                    </CardContent>
                  </Card>
                ) : (
                  filtered(tab).map(report => (
                    <ReportCard key={report.id} report={report} />
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <AnimatePresence>
        {showForm && <GenerateReportForm onClose={() => setShowForm(false)} />}
      </AnimatePresence>
    </div>
  );
}
