/**
 * Audits Internes — Programme & Checklists ISO 21001
 * SMART SMOE IFDL
 */
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardCheck, Plus, Search, Filter, Calendar, User,
  CheckSquare, Square, AlertCircle, ChevronDown, ChevronRight,
  Download, Eye, Edit2, MoreHorizontal, Play, Check, X,
  FileText, Clock, Target,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// ── Mock data ─────────────────────────────────────────────────
const audits = [
  {
    id: 1, reference: 'AUD-2026-001', titre: 'Audit Processus Pilotage PR-01',
    type: 'interne', statut: 'termine', process: 'PR-01',
    auditeur: 'Pr. Amine Benali', date_debut: '2026-03-10', date_fin: '2026-03-12',
    score: 88, nc_majeures: 1, nc_mineures: 3, observations: 4,
  },
  {
    id: 2, reference: 'AUD-2026-002', titre: 'Audit Réalisation Pédagogique PR-02',
    type: 'interne', statut: 'termine', process: 'PR-02',
    auditeur: 'Dr. Fatima Ouhbi', date_debut: '2026-03-18', date_fin: '2026-03-20',
    score: 82, nc_majeures: 2, nc_mineures: 4, observations: 3,
  },
  {
    id: 3, reference: 'AUD-2026-003', titre: 'Audit Processus Support PR-03',
    type: 'interne', statut: 'en_cours', process: 'PR-03',
    auditeur: 'Pr. Amine Benali', date_debut: '2026-06-02', date_fin: '2026-06-05',
    score: null, nc_majeures: 0, nc_mineures: 1, observations: 2,
  },
  {
    id: 4, reference: 'AUD-2026-004', titre: 'Audit Évaluation & Amélioration PR-04',
    type: 'interne', statut: 'en_cours', process: 'PR-04',
    auditeur: 'Dr. Fatima Ouhbi', date_debut: '2026-06-04', date_fin: '2026-06-07',
    score: null, nc_majeures: 0, nc_mineures: 0, observations: 0,
  },
  {
    id: 5, reference: 'AUD-2026-005', titre: 'Audit à blanc ISO 21001',
    type: 'externe', statut: 'planifie', process: 'Tous',
    auditeur: 'Cabinet AFNOR Maroc', date_debut: '2026-09-15', date_fin: '2026-09-17',
    score: null, nc_majeures: 0, nc_mineures: 0, observations: 0,
  },
  {
    id: 6, reference: 'AUD-2027-001', titre: 'Audit de Certification ISO 21001',
    type: 'certification', statut: 'planifie', process: 'Tous',
    auditeur: 'IMANOR',  date_debut: '2027-02-10', date_fin: '2027-02-14',
    score: null, nc_majeures: 0, nc_mineures: 0, observations: 0,
  },
];

// ISO 21001 Checklist Template
const checklistItems = [
  { clause: '4.1', titre: 'L\'organisme détermine son contexte interne et externe',               checked: true,  finding: null },
  { clause: '4.2', titre: 'Les parties intéressées pertinentes sont identifiées',                 checked: true,  finding: null },
  { clause: '4.3', titre: 'Le domaine d\'application du SMOE est défini et documenté',            checked: true,  finding: null },
  { clause: '5.1', titre: 'La direction démontre son leadership et son engagement',               checked: true,  finding: null },
  { clause: '5.2', titre: 'La politique qualité est établie, documentée et communiquée',          checked: true,  finding: null },
  { clause: '6.1', titre: 'Les risques et opportunités sont identifiés et traités',               checked: false, finding: 'NC-Mineure' },
  { clause: '6.2', titre: 'Les objectifs qualité sont mesurables et suivis',                     checked: true,  finding: null },
  { clause: '7.1', titre: 'Les ressources nécessaires sont déterminées et fournies',              checked: false, finding: 'Observation' },
  { clause: '7.2', titre: 'Les compétences du personnel sont déterminées et évaluées',           checked: true,  finding: null },
  { clause: '7.5', titre: 'Les informations documentées sont maîtrisées',                        checked: true,  finding: null },
  { clause: '8.1', titre: 'Les activités opérationnelles sont planifiées et maîtrisées',         checked: true,  finding: null },
  { clause: '9.1', titre: 'La surveillance et la mesure des performances sont réalisées',        checked: true,  finding: null },
  { clause: '9.2', titre: 'Le programme d\'audit interne est établi et mis en œuvre',            checked: false, finding: 'NC-Majeure' },
  { clause: '9.3', titre: 'La revue de direction est réalisée à intervalles planifiés',          checked: false, finding: 'NC-Mineure' },
  { clause: '10.1', titre: 'Les non-conformités sont traitées et les actions correctives mises', checked: true,  finding: null },
  { clause: '10.2', titre: 'L\'amélioration continue est démontrée',                             checked: false, finding: 'Observation' },
];

// ── Helpers ────────────────────────────────────────────────────
const statutStyles: Record<string, { badge: string; dot: string; label: string }> = {
  planifie: { badge: 'bg-gray-100 text-gray-700',   dot: 'bg-gray-400',   label: 'Planifié'  },
  en_cours: { badge: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500',   label: 'En cours'  },
  termine:  { badge: 'bg-green-100 text-green-700', dot: 'bg-green-500',  label: 'Terminé'   },
  annule:   { badge: 'bg-red-100 text-red-700',     dot: 'bg-red-500',    label: 'Annulé'    },
};

const typeStyles: Record<string, string> = {
  interne:      'bg-blue-50 text-blue-700 border-blue-200',
  externe:      'bg-purple-50 text-purple-700 border-purple-200',
  certification: 'bg-amber-50 text-amber-700 border-amber-200',
};

function FindingBadge({ type }: { type: string | null }) {
  if (!type) return <Check className="h-3.5 w-3.5 text-green-500" />;
  if (type === 'NC-Majeure')  return <Badge className="text-[9px] h-4 bg-red-100 text-red-700 border-0">NC Maj.</Badge>;
  if (type === 'NC-Mineure')  return <Badge className="text-[9px] h-4 bg-amber-100 text-amber-700 border-0">NC Min.</Badge>;
  return <Badge className="text-[9px] h-4 bg-blue-100 text-blue-700 border-0">Obs.</Badge>;
}

export default function AuditsPage() {
  const [search, setSearch] = useState('');
  const [selectedAudit, setSelectedAudit] = useState<typeof audits[0] | null>(null);
  const [expandedChecklist, setExpandedChecklist] = useState(false);

  const filtered = audits.filter(a =>
    a.titre.toLowerCase().includes(search.toLowerCase()) ||
    a.reference.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total:    audits.length,
    termine:  audits.filter(a => a.statut === 'termine').length,
    en_cours: audits.filter(a => a.statut === 'en_cours').length,
    planifie: audits.filter(a => a.statut === 'planifie').length,
    nc_total: audits.reduce((s, a) => s + a.nc_majeures + a.nc_mineures, 0),
  };

  return (
    <div className="page-container animate-fade-up">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-primary" />
            Audits Internes ISO 21001
          </h1>
          <p className="page-subtitle">
            Programme d'audit · Checklists ISO 21001 · Constats · Rapports
          </p>
        </div>
        <Button size="sm" className="text-xs gap-1">
          <Plus className="h-3.5 w-3.5" /> Planifier un audit
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total,    color: 'text-foreground' },
          { label: 'Terminés', value: stats.termine,  color: 'text-green-600' },
          { label: 'En cours', value: stats.en_cours, color: 'text-blue-600' },
          { label: 'Planifiés', value: stats.planifie, color: 'text-gray-500' },
          { label: 'NC détectées', value: stats.nc_total, color: 'text-red-600' },
        ].map(s => (
          <Card key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="programme">
        <TabsList className="h-9">
          <TabsTrigger value="programme" className="text-xs">Programme d'audit</TabsTrigger>
          <TabsTrigger value="checklist" className="text-xs">Checklist ISO 21001</TabsTrigger>
        </TabsList>

        {/* ── Programme ──────────────────────────────────── */}
        <TabsContent value="programme" className="mt-4">
          {/* Search */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Rechercher un audit..."
                className="pl-9 h-8 text-xs"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
              <Filter className="h-3.5 w-3.5" /> Filtrer
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
          </div>

          {/* Audit list */}
          <div className="space-y-2">
            {filtered.map(audit => {
              const s = statutStyles[audit.statut];
              return (
                <motion.div
                  key={audit.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  layout
                >
                  <Card className={cn(
                    'overflow-hidden hover:shadow-md transition-all cursor-pointer',
                    selectedAudit?.id === audit.id && 'ring-2 ring-primary/30'
                  )}
                    onClick={() => setSelectedAudit(
                      selectedAudit?.id === audit.id ? null : audit
                    )}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Status dot */}
                        <div className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5', s.dot)} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[10px] font-mono text-muted-foreground">{audit.reference}</span>
                            <span className={cn('text-[9px] font-semibold px-2 py-0.5 rounded border', typeStyles[audit.type] ?? 'bg-gray-100 text-gray-700')}>
                              {audit.type.toUpperCase()}
                            </span>
                            <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded">
                              {audit.process}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold">{audit.titre}</h3>
                          <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" /> {audit.auditeur}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(audit.date_debut).toLocaleDateString('fr-MA')} →{' '}
                              {new Date(audit.date_fin).toLocaleDateString('fr-MA')}
                            </span>
                          </div>
                        </div>

                        {/* Right side */}
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', s.badge)}>
                            {s.label}
                          </span>
                          {audit.score !== null && (
                            <span className={cn(
                              'text-lg font-bold',
                              audit.score >= 85 ? 'text-green-600' :
                              audit.score >= 75 ? 'text-amber-600' : 'text-red-600'
                            )}>
                              {audit.score}%
                            </span>
                          )}
                          <div className="flex gap-3 text-xs">
                            {audit.nc_majeures > 0 && (
                              <span className="text-red-600 font-semibold">{audit.nc_majeures} NC Maj.</span>
                            )}
                            {audit.nc_mineures > 0 && (
                              <span className="text-amber-600 font-semibold">{audit.nc_mineures} NC Min.</span>
                            )}
                            {audit.observations > 0 && (
                              <span className="text-blue-600 font-semibold">{audit.observations} Obs.</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded detail */}
                    <AnimatePresence>
                      {selectedAudit?.id === audit.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-border overflow-hidden"
                        >
                          <div className="p-4 bg-muted/20 flex flex-wrap gap-2">
                            <Button size="sm" className="text-xs gap-1 h-7">
                              <Eye className="h-3 w-3" /> Voir rapport
                            </Button>
                            {audit.statut === 'planifie' && (
                              <Button size="sm" variant="outline" className="text-xs gap-1 h-7">
                                <Play className="h-3 w-3 text-green-600" /> Démarrer
                              </Button>
                            )}
                            <Button size="sm" variant="outline" className="text-xs gap-1 h-7">
                              <Edit2 className="h-3 w-3" /> Modifier
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs gap-1 h-7">
                              <FileText className="h-3 w-3" /> Constats ({audit.nc_majeures + audit.nc_mineures + audit.observations})
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs gap-1 h-7">
                              <Download className="h-3 w-3" /> Rapport PDF
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* ── Checklist ────────────────────────────────────── */}
        <TabsContent value="checklist" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-primary" />
                    Checklist ISO 21001 — AUD-2026-003
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Audit Processus Support PR-03 · En cours
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {checklistItems.filter(i => i.checked).length}/{checklistItems.length}
                  </span>
                  <div className="w-24 progress-track">
                    <div
                      className="progress-fill bg-primary"
                      style={{ width: `${(checklistItems.filter(i => i.checked).length / checklistItems.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {checklistItems.map((item, i) => (
                <motion.div
                  key={item.clause}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn(
                    'flex items-center gap-3 p-2.5 rounded-lg border transition-colors cursor-pointer hover:bg-muted/30',
                    item.checked ? 'bg-green-50/50 dark:bg-green-950/20 border-green-100 dark:border-green-900/30' : 'bg-card border-border',
                    item.finding === 'NC-Majeure' && 'bg-red-50/50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30'
                  )}
                >
                  {item.checked
                    ? <CheckSquare className="h-4 w-4 text-green-500 flex-shrink-0" />
                    : <Square className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  }
                  <span className="text-xs font-mono text-muted-foreground w-8 flex-shrink-0">§{item.clause}</span>
                  <span className="text-xs flex-1">{item.titre}</span>
                  <FindingBadge type={item.finding} />
                </motion.div>
              ))}

              <Separator className="my-3" />
              <div className="flex items-center justify-between">
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-green-500" /> {checklistItems.filter(i => i.checked).length} conformes</span>
                  <span className="flex items-center gap-1.5"><X className="h-3 w-3 text-red-500" /> {checklistItems.filter(i => !i.checked).length} à vérifier</span>
                  <span className="flex items-center gap-1.5"><AlertCircle className="h-3 w-3 text-amber-500" /> {checklistItems.filter(i => i.finding).length} constats</span>
                </div>
                <Button size="sm" className="text-xs gap-1">
                  <FileText className="h-3.5 w-3.5" /> Finaliser le rapport
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
