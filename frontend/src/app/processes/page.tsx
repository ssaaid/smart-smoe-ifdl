/**
 * Cartographie des Processus SMOE — ISO 21001 clause 4.4
 * SMART SMOE IFDL · ESEF Berrechid · Master IFDL
 */
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitBranch, Target, FileText, BarChart2, ArrowRight,
  ChevronRight, X, Users, TrendingUp, TrendingDown,
  Minus, Activity, AlertTriangle, CheckCircle2, Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// ── Mock data ──────────────────────────────────────────────────────────────
const processes = [
  {
    id: 'PR-01', code: 'PR-01', libelle: 'Pilotage du SMOE', type: 'management',
    responsable: 'Directeur ESEF',
    description: 'Définition de la politique qualité, objectifs stratégiques, revue de direction et surveillance globale du système de management.',
    objectifs: 'Assurer la conformité ISO 21001, piloter la performance globale, garantir l\'engagement de la direction.',
    inputs: ['Exigences réglementaires', 'Attentes parties prenantes', 'Résultats audits'],
    outputs: ['Politique qualité', 'Objectifs SMOE', 'Ressources allouées'],
    kpis: [
      { code: 'KPI-01', libelle: 'Taux conformité global', valeur: 87, cible: 90, unite: '%' },
      { code: 'KPI-02', libelle: 'Nb NC majeures ouvertes', valeur: 2, cible: 0, unite: 'NC' },
    ],
    nb_documents: 8, nb_risques: 3, performance: 87, couleur: 'blue',
  },
  {
    id: 'PR-02', code: 'PR-02', libelle: 'Réalisation Pédagogique', type: 'realisation',
    responsable: 'Coordinateur Pédagogique',
    description: 'Conception, mise en œuvre et évaluation des formations du Master IFDL. Gestion des parcours, modules, enseignements et activités pédagogiques.',
    objectifs: 'Assurer la qualité des enseignements, le suivi des étudiants et l\'atteinte des objectifs pédagogiques.',
    inputs: ['Maquette pédagogique', 'Profil entrant étudiants', 'Besoins marché'],
    outputs: ['Diplômés compétents', 'Évaluations', 'Taux insertion pro'],
    kpis: [
      { code: 'KPI-03', libelle: 'Taux de réussite', valeur: 91, cible: 85, unite: '%' },
      { code: 'KPI-04', libelle: 'Satisfaction étudiants', valeur: 78, cible: 80, unite: '%' },
      { code: 'KPI-05', libelle: 'Taux insertion 6 mois', valeur: 88, cible: 85, unite: '%' },
    ],
    nb_documents: 12, nb_risques: 2, performance: 91, couleur: 'green',
  },
  {
    id: 'PR-03', code: 'PR-03', libelle: 'Support & Ressources', type: 'support',
    responsable: 'Responsable Administratif',
    description: 'Gestion des ressources humaines, matérielles, financières et informatiques nécessaires au bon fonctionnement du Master IFDL.',
    objectifs: 'Fournir les ressources adéquates, maintenir les infrastructures et assurer la gestion documentaire.',
    inputs: ['Besoins PR-01 et PR-02', 'Budget alloué', 'Profils compétences'],
    outputs: ['Personnel formé', 'Infrastructures', 'Documents maîtrisés'],
    kpis: [
      { code: 'KPI-06', libelle: 'Taux disponibilité ressources', valeur: 94, cible: 95, unite: '%' },
      { code: 'KPI-07', libelle: 'Documents à jour', valeur: 82, cible: 95, unite: '%' },
    ],
    nb_documents: 10, nb_risques: 2, performance: 82, couleur: 'purple',
  },
  {
    id: 'PR-04', code: 'PR-04', libelle: 'Évaluation & Amélioration', type: 'support',
    responsable: 'Responsable Qualité',
    description: 'Surveillance, mesure, analyse et évaluation des performances du SMOE. Audits internes, revues, gestion des NC et amélioration continue.',
    objectifs: 'Mesurer l\'efficacité du SMOE, identifier les axes d\'amélioration et assurer la conformité ISO 21001.',
    inputs: ['Données processus', 'Résultats KPIs', 'Réclamations'],
    outputs: ['Rapports audit', 'Plans d\'amélioration', 'Décisions direction'],
    kpis: [
      { code: 'KPI-08', libelle: 'Taux clôture NC', valeur: 71, cible: 80, unite: '%' },
      { code: 'KPI-09', libelle: 'Nb audits réalisés/an', valeur: 4, cible: 4, unite: 'audits' },
    ],
    nb_documents: 8, nb_risques: 1, performance: 71, couleur: 'orange',
  },
];

// ── Color palettes by process color ───────────────────────────────────────
const colorMap: Record<string, {
  bg: string; border: string; badge: string; badgeText: string;
  dot: string; ring: string; progress: string; text: string; lightBg: string;
}> = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    badge: 'bg-blue-100 dark:bg-blue-900/40',
    badgeText: 'text-blue-700 dark:text-blue-300',
    dot: 'bg-blue-500',
    ring: 'ring-blue-200',
    progress: 'bg-blue-500',
    text: 'text-blue-700 dark:text-blue-300',
    lightBg: 'bg-blue-500/10',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-800',
    badge: 'bg-green-100 dark:bg-green-900/40',
    badgeText: 'text-green-700 dark:text-green-300',
    dot: 'bg-green-500',
    ring: 'ring-green-200',
    progress: 'bg-green-500',
    text: 'text-green-700 dark:text-green-300',
    lightBg: 'bg-green-500/10',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-200 dark:border-purple-800',
    badge: 'bg-purple-100 dark:bg-purple-900/40',
    badgeText: 'text-purple-700 dark:text-purple-300',
    dot: 'bg-purple-500',
    ring: 'ring-purple-200',
    progress: 'bg-purple-500',
    text: 'text-purple-700 dark:text-purple-300',
    lightBg: 'bg-purple-500/10',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    border: 'border-orange-200 dark:border-orange-800',
    badge: 'bg-orange-100 dark:bg-orange-900/40',
    badgeText: 'text-orange-700 dark:text-orange-300',
    dot: 'bg-orange-500',
    ring: 'ring-orange-200',
    progress: 'bg-orange-500',
    text: 'text-orange-700 dark:text-orange-300',
    lightBg: 'bg-orange-500/10',
  },
};

const typeLabels: Record<string, string> = {
  management: 'Pilotage',
  realisation: 'Réalisation',
  support: 'Support',
};

// ── KPI Trend Icon ────────────────────────────────────────────────────────
function KpiTrend({ valeur, cible }: { valeur: number; cible: number }) {
  if (valeur >= cible) return <TrendingUp className="h-3 w-3 text-green-500" />;
  if (valeur >= cible * 0.9) return <Minus className="h-3 w-3 text-amber-500" />;
  return <TrendingDown className="h-3 w-3 text-red-500" />;
}

// ── Process Map Card ───────────────────────────────────────────────────────
function ProcessCard({
  process,
  selected,
  onClick,
}: {
  process: typeof processes[0];
  selected: boolean;
  onClick: () => void;
}) {
  const c = colorMap[process.couleur];
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      <Card
        className={cn(
          'cursor-pointer transition-all overflow-hidden border-2',
          c.border,
          c.bg,
          selected && `ring-2 ${c.ring} shadow-lg`,
        )}
        onClick={onClick}
      >
        <CardContent className="p-4">
          {/* Header row */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={cn('text-xs font-bold font-mono px-2 py-0.5 rounded', c.badge, c.badgeText)}>
                {process.code}
              </span>
              <span className={cn('text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded', c.lightBg, c.text)}>
                {typeLabels[process.type]}
              </span>
            </div>
            <div className={cn('w-2 h-2 rounded-full flex-shrink-0 mt-1', c.dot)} />
          </div>

          {/* Title */}
          <h3 className="text-sm font-bold leading-snug mb-1">{process.libelle}</h3>
          <p className={cn('text-[10px] font-medium flex items-center gap-1 mb-3', c.text)}>
            <Users className="h-3 w-3" /> {process.responsable}
          </p>

          {/* Mini stats row */}
          <div className="flex gap-2 mb-3">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <BarChart2 className="h-3 w-3" />
              <span>{process.kpis.length} KPI</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <FileText className="h-3 w-3" />
              <span>{process.nb_documents} docs</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <AlertTriangle className="h-3 w-3" />
              <span>{process.nb_risques} risques</span>
            </div>
          </div>

          {/* Performance bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Performance</span>
              <span className={cn('text-xs font-bold', c.text)}>{process.performance}%</span>
            </div>
            <div className="progress-track h-1.5">
              <div
                className={cn('progress-fill', c.progress)}
                style={{ width: `${process.performance}%` }}
              />
            </div>
          </div>

          {/* Arrow if selected */}
          <div className={cn(
            'flex items-center justify-end mt-2 transition-opacity',
            selected ? 'opacity-100' : 'opacity-0'
          )}>
            <ChevronRight className={cn('h-3.5 w-3.5', c.text)} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Interactions Flow Diagram ─────────────────────────────────────────────
function InteractionsMatrix() {
  const nodes = [
    { id: 'PR-01', label: 'Pilotage', x: 320, y: 40, color: '#3b82f6' },
    { id: 'PR-02', label: 'Réalisation', x: 560, y: 160, color: '#22c55e' },
    { id: 'PR-03', label: 'Support', x: 80, y: 160, color: '#a855f7' },
    { id: 'PR-04', label: 'Évaluation', x: 320, y: 280, color: '#f97316' },
  ];

  const edges = [
    { from: { x: 320, y: 40 }, to: { x: 560, y: 160 }, label: 'Directives', color: '#3b82f6' },
    { from: { x: 320, y: 40 }, to: { x: 80, y: 160 }, label: 'Ressources', color: '#3b82f6' },
    { from: { x: 560, y: 160 }, to: { x: 320, y: 280 }, label: 'Données', color: '#22c55e' },
    { from: { x: 80, y: 160 }, to: { x: 320, y: 280 }, label: 'Infos', color: '#a855f7' },
    { from: { x: 320, y: 280 }, to: { x: 320, y: 40 }, label: 'Résultats', color: '#f97316' },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Matrice des interactions entre processus
        </CardTitle>
        <p className="text-xs text-muted-foreground">Flux et interdépendances — ISO 21001 §4.4</p>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center overflow-x-auto">
          <svg viewBox="0 0 680 340" className="w-full max-w-2xl h-auto" style={{ minHeight: 200 }}>
            <defs>
              {['blue', 'green', 'purple', 'orange'].map((c, i) => {
                const colors = ['#3b82f6', '#22c55e', '#a855f7', '#f97316'];
                return (
                  <marker
                    key={c}
                    id={`arrow-${c}`}
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={colors[i]} />
                  </marker>
                );
              })}
            </defs>

            {/* Edges */}
            {edges.map((e, i) => {
              const midX = (e.from.x + e.to.x) / 2;
              const midY = (e.from.y + e.to.y) / 2;
              const arrowColor = e.color === '#3b82f6' ? 'blue'
                : e.color === '#22c55e' ? 'green'
                : e.color === '#a855f7' ? 'purple' : 'orange';
              // offset the return path to avoid overlap
              const offset = i === 4 ? -30 : 0;
              return (
                <g key={i}>
                  <line
                    x1={e.from.x + offset}
                    y1={e.from.y + 30}
                    x2={e.to.x + offset}
                    y2={e.to.y - 30}
                    stroke={e.color}
                    strokeWidth="1.5"
                    strokeDasharray={i === 4 ? '6 3' : 'none'}
                    markerEnd={`url(#arrow-${arrowColor})`}
                    opacity="0.7"
                  />
                  <text
                    x={midX + offset}
                    y={midY}
                    textAnchor="middle"
                    fontSize="8"
                    fill={e.color}
                    opacity="0.9"
                    className="font-medium"
                  >
                    {e.label}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map(n => (
              <g key={n.id}>
                <rect
                  x={n.x - 60}
                  y={n.y - 22}
                  width={120}
                  height={44}
                  rx={8}
                  fill={n.color}
                  fillOpacity={0.12}
                  stroke={n.color}
                  strokeWidth={1.5}
                />
                <text x={n.x} y={n.y - 4} textAnchor="middle" fontSize="10" fontWeight="700" fill={n.color}>
                  {n.id}
                </text>
                <text x={n.x} y={n.y + 10} textAnchor="middle" fontSize="8" fill={n.color} opacity="0.85">
                  {n.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-3 justify-center">
          {[
            { label: 'Flux direct', style: 'solid' },
            { label: 'Retour résultats', style: 'dashed' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <div className={cn(
                'h-px w-6',
                l.style === 'dashed' ? 'border-t border-dashed border-muted-foreground' : 'bg-muted-foreground'
              )} />
              {l.label}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Detail Panel ───────────────────────────────────────────────────────────
function ProcessDetail({ process, onClose }: { process: typeof processes[0]; onClose: () => void }) {
  const c = colorMap[process.couleur];

  return (
    <motion.div
      key={process.id}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Card className={cn('sticky top-6 border-2', c.border)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={cn('text-xs font-bold font-mono px-2 py-0.5 rounded', c.badge, c.badgeText)}>
                {process.code}
              </span>
              <span className={cn('text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded', c.lightBg, c.text)}>
                {typeLabels[process.type]}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <h3 className="text-base font-bold mt-2">{process.libelle}</h3>
          <p className={cn('text-xs flex items-center gap-1', c.text)}>
            <Users className="h-3 w-3" /> {process.responsable}
          </p>
        </CardHeader>

        <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Description</p>
            <p className="text-xs leading-relaxed">{process.description}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Objectifs</p>
            <p className="text-xs leading-relaxed text-muted-foreground">{process.objectifs}</p>
          </div>

          <Separator />

          {/* Input / Output */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold mb-1.5 flex items-center gap-1">
                <ArrowRight className="h-3 w-3 text-blue-500 rotate-180" />
                Données d'entrée
              </p>
              <ul className="space-y-1">
                {process.inputs.map((inp, i) => (
                  <li key={i} className="text-[10px] bg-muted/40 rounded px-2 py-1 flex items-start gap-1">
                    <span className="text-blue-500 mt-0.5">→</span> {inp}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold mb-1.5 flex items-center gap-1">
                <ArrowRight className="h-3 w-3 text-green-500" />
                Données de sortie
              </p>
              <ul className="space-y-1">
                {process.outputs.map((out, i) => (
                  <li key={i} className="text-[10px] bg-muted/40 rounded px-2 py-1 flex items-start gap-1">
                    <span className="text-green-500 mt-0.5">←</span> {out}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Separator />

          {/* KPIs */}
          <div>
            <p className="text-xs font-semibold mb-2 flex items-center gap-1">
              <BarChart2 className="h-3.5 w-3.5 text-primary" />
              Indicateurs de performance ({process.kpis.length})
            </p>
            <div className="space-y-2.5">
              {process.kpis.map(kpi => {
                const pct = Math.min((kpi.valeur / Math.max(kpi.cible, 1)) * 100, 100);
                const atTarget = kpi.valeur >= kpi.cible;
                return (
                  <div key={kpi.code} className="bg-muted/30 rounded-lg p-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono text-muted-foreground">{kpi.code}</span>
                        <KpiTrend valeur={kpi.valeur} cible={kpi.cible} />
                      </div>
                      <span className={cn(
                        'text-xs font-bold',
                        atTarget ? 'text-green-600' : kpi.valeur >= kpi.cible * 0.9 ? 'text-amber-600' : 'text-red-600'
                      )}>
                        {kpi.valeur}{kpi.unite}
                      </span>
                    </div>
                    <p className="text-[10px] mb-1.5">{kpi.libelle}</p>
                    <div className="progress-track h-1.5">
                      <div
                        className={cn(
                          'progress-fill',
                          atTarget ? 'bg-green-500' : kpi.valeur >= kpi.cible * 0.9 ? 'bg-amber-400' : 'bg-red-500'
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-0.5">
                      <span className="text-[9px] text-muted-foreground">0</span>
                      <span className="text-[9px] text-muted-foreground">Cible : {kpi.cible}{kpi.unite}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Meta */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Documents', value: process.nb_documents, icon: <FileText className="h-3.5 w-3.5 text-blue-500" /> },
              { label: 'Risques', value: process.nb_risques, icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> },
              { label: 'KPIs', value: process.kpis.length, icon: <Target className="h-3.5 w-3.5 text-primary" /> },
            ].map(m => (
              <div key={m.label} className="bg-muted/30 rounded-lg p-2 text-center">
                <div className="flex justify-center mb-1">{m.icon}</div>
                <p className="text-lg font-bold">{m.value}</p>
                <p className="text-[9px] text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Performance gauge */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-semibold">Performance globale</p>
              <span className={cn(
                'text-sm font-bold',
                process.performance >= 85 ? 'text-green-600' :
                process.performance >= 70 ? 'text-amber-600' : 'text-red-600'
              )}>
                {process.performance}%
              </span>
            </div>
            <div className="progress-track h-3">
              <div
                className={cn(
                  'progress-fill',
                  process.performance >= 85 ? 'bg-green-500' :
                  process.performance >= 70 ? 'bg-amber-400' : 'bg-red-500'
                )}
                style={{ width: `${process.performance}%` }}
              />
            </div>
            <div className="flex items-center justify-end mt-1">
              {process.performance >= 85
                ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mr-1" />
                : <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mr-1" />
              }
              <span className="text-[10px] text-muted-foreground">
                {process.performance >= 85 ? 'Objectif atteint' : 'Amélioration requise'}
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button size="sm" className={cn('flex-1 text-xs gap-1 h-7')}>
              <FileText className="h-3 w-3" /> Procédures
            </Button>
            <Button size="sm" variant="outline" className="text-xs gap-1 h-7 px-2">
              <Download className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function ProcessesPage() {
  const [selected, setSelected] = useState<typeof processes[0] | null>(null);

  const totalKpis = processes.reduce((s, p) => s + p.kpis.length, 0);
  const totalDocs = processes.reduce((s, p) => s + p.nb_documents, 0);
  const conformiteGlobale = Math.round(
    processes.reduce((s, p) => s + p.performance, 0) / processes.length
  );

  return (
    <div className="page-container animate-fade-up">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-primary" />
            Cartographie des Processus SMOE
          </h1>
          <p className="page-subtitle">
            ISO 21001 §4.4 · Approche processus · Master IFDL · ESEF Berrechid
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs gap-1">
            <Download className="h-3.5 w-3.5" /> Exporter
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Processus', value: processes.length, color: 'text-primary' },
          { label: 'KPIs suivis', value: totalKpis, color: 'text-blue-600' },
          { label: 'Documents liés', value: totalDocs, color: 'text-purple-600' },
          {
            label: 'Conformité globale', value: `${conformiteGlobale}%`,
            color: conformiteGlobale >= 85 ? 'text-green-600' : 'text-amber-600',
          },
        ].map(s => (
          <Card key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="cartographie">
        <TabsList className="h-9">
          <TabsTrigger value="cartographie" className="text-xs">Cartographie</TabsTrigger>
          <TabsTrigger value="interactions" className="text-xs">Interactions</TabsTrigger>
        </TabsList>

        {/* ── Cartographie ────────────────────────────────────── */}
        <TabsContent value="cartographie" className="mt-4">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

            {/* 2×2 Process Map */}
            <div className="xl:col-span-2 space-y-4">
              {/* Top label */}
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                  Carte des processus — Vue diagramme tortue
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* 2×2 grid */}
              <div className="grid grid-cols-2 gap-3">
                {processes.map((p, idx) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                  >
                    <ProcessCard
                      process={p}
                      selected={selected?.id === p.id}
                      onClick={() => setSelected(selected?.id === p.id ? null : p)}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3">
                {Object.entries(typeLabels).map(([key, label]) => {
                  const colors = { management: 'bg-blue-500', realisation: 'bg-green-500', support: 'bg-purple-500' };
                  return (
                    <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className={cn('w-2 h-2 rounded-full', colors[key as keyof typeof colors])} />
                      {label}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detail Panel */}
            <div>
              <AnimatePresence mode="wait">
                {selected ? (
                  <ProcessDetail
                    key={selected.id}
                    process={selected}
                    onClose={() => setSelected(null)}
                  />
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Card className="border-dashed">
                      <CardContent className="py-16 text-center">
                        <GitBranch className="h-10 w-10 mx-auto text-muted-foreground/25 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">
                          Sélectionnez un processus
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          Cliquez sur une carte pour voir les détails, KPIs et flux
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </TabsContent>

        {/* ── Interactions ─────────────────────────────────────── */}
        <TabsContent value="interactions" className="mt-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <InteractionsMatrix />

            {/* Process summary list */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Résumé performances
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {processes.map((p, i) => {
                  const c = colorMap[p.couleur];
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className={cn('p-3 rounded-lg border', c.bg, c.border)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={cn('text-[10px] font-bold font-mono px-1.5 py-0.5 rounded', c.badge, c.badgeText)}>
                            {p.code}
                          </span>
                          <span className="text-xs font-semibold">{p.libelle}</span>
                        </div>
                        <span className={cn('text-sm font-bold', c.text)}>{p.performance}%</span>
                      </div>
                      <div className="progress-track h-1.5">
                        <div className={cn('progress-fill', c.progress)} style={{ width: `${p.performance}%` }} />
                      </div>
                      <div className="flex items-center justify-between mt-1.5 text-[9px] text-muted-foreground">
                        <span>{p.responsable}</span>
                        <span>{p.kpis.length} KPIs · {p.nb_documents} docs</span>
                      </div>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
