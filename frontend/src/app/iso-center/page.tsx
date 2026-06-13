/**
 * ISO 21001 Center — Smart Maturity & GAP Analysis
 * Évaluation de maturité ISO 21001 complète
 */
'use client';

import { useState } from 'react';
import { downloadExport } from '@/lib/export';
import { motion } from 'framer-motion';
import {
  Shield, Award, TrendingUp, CheckCircle2, AlertCircle,
  XCircle, ChevronRight, BarChart3, Target, Download, RefreshCw,
  BookOpen, Lightbulb, AlertTriangle,
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// ── ISO 21001 Clauses Data ─────────────────────────────────────
const clausesData = [
  {
    code: '4', titre: 'Contexte de l\'organisme', score: 82, cible: 90,
    sousClauses: [
      { code: '4.1', titre: 'Compréhension de l\'organisme',         score: 85, statut: 'conforme' },
      { code: '4.2', titre: 'Parties intéressées',                    score: 80, statut: 'conforme' },
      { code: '4.3', titre: 'Domaine d\'application',                 score: 88, statut: 'conforme' },
      { code: '4.4', titre: 'Système de management',                  score: 75, statut: 'partiel'  },
    ],
  },
  {
    code: '5', titre: 'Leadership', score: 88, cible: 90,
    sousClauses: [
      { code: '5.1', titre: 'Leadership et engagement',               score: 90, statut: 'conforme' },
      { code: '5.2', titre: 'Politique qualité',                      score: 92, statut: 'conforme' },
      { code: '5.3', titre: 'Rôles et responsabilités',               score: 82, statut: 'conforme' },
    ],
  },
  {
    code: '6', titre: 'Planification', score: 74, cible: 85,
    sousClauses: [
      { code: '6.1', titre: 'Risques et opportunités',                score: 72, statut: 'partiel'  },
      { code: '6.2', titre: 'Objectifs qualité',                      score: 78, statut: 'conforme' },
      { code: '6.3', titre: 'Planification des modifications',        score: 72, statut: 'partiel'  },
    ],
  },
  {
    code: '7', titre: 'Support', score: 79, cible: 85,
    sousClauses: [
      { code: '7.1', titre: 'Ressources',                             score: 76, statut: 'partiel'  },
      { code: '7.2', titre: 'Compétences',                            score: 80, statut: 'conforme' },
      { code: '7.3', titre: 'Sensibilisation',                        score: 74, statut: 'partiel'  },
      { code: '7.4', titre: 'Communication',                          score: 82, statut: 'conforme' },
      { code: '7.5', titre: 'Informations documentées',               score: 83, statut: 'conforme' },
    ],
  },
  {
    code: '8', titre: 'Réalisation opérationnelle', score: 76, cible: 85,
    sousClauses: [
      { code: '8.1', titre: 'Planification opérationnelle',           score: 78, statut: 'conforme' },
      { code: '8.2', titre: 'Conception et développement',            score: 72, statut: 'partiel'  },
      { code: '8.3', titre: 'Prestataires externes',                  score: 78, statut: 'conforme' },
    ],
  },
  {
    code: '9', titre: 'Évaluation des performances', score: 84, cible: 90,
    sousClauses: [
      { code: '9.1', titre: 'Surveillance et mesure',                 score: 86, statut: 'conforme' },
      { code: '9.2', titre: 'Audit interne',                          score: 88, statut: 'conforme' },
      { code: '9.3', titre: 'Revue de direction',                     score: 78, statut: 'partiel'  },
    ],
  },
  {
    code: '10', titre: 'Amélioration', score: 70, cible: 80,
    sousClauses: [
      { code: '10.1', titre: 'Non-conformités et actions correctives', score: 72, statut: 'partiel'  },
      { code: '10.2', titre: 'Amélioration continue',                  score: 68, statut: 'partiel'  },
    ],
  },
];

const radarData = clausesData.map(c => ({
  clause: `§${c.code}`,
  score: c.score,
  cible: c.cible,
}));

const maturiteNiveaux = [
  { niveau: 1, label: 'Initial',     description: 'Processus ad-hoc, non documentés', color: 'bg-red-500' },
  { niveau: 2, label: 'Défini',      description: 'Processus documentés et déployés', color: 'bg-orange-500' },
  { niveau: 3, label: 'Maîtrisé',    description: 'KPI mesurés, résultats analysés',  color: 'bg-yellow-500' },
  { niveau: 4, label: 'Optimisé',    description: 'Amélioration continue systémique', color: 'bg-green-500' },
];

const gapItems = clausesData
  .flatMap(c => c.sousClauses.filter(s => s.statut !== 'conforme'))
  .map(s => ({ ...s, gap: s.score < 70 ? 'majeur' : 'mineur' }));

// ── Score global ────────────────────────────────────────────
const scoreGlobal = Math.round(
  clausesData.reduce((sum, c) => sum + c.score, 0) / clausesData.length
);
const niveauMaturite = scoreGlobal >= 85 ? 4 : scoreGlobal >= 75 ? 3 : scoreGlobal >= 60 ? 2 : 1;

// ── Helpers ────────────────────────────────────────────────
function StatutIcon({ statut }: { statut: string }) {
  if (statut === 'conforme')   return <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />;
  if (statut === 'partiel')    return <AlertCircle   className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />;
  return                              <XCircle       className="h-3.5 w-3.5 text-red-500   flex-shrink-0" />;
}

function ScoreColor(score: number, cible: number) {
  if (score >= cible)       return 'text-green-600';
  if (score >= cible - 10)  return 'text-amber-600';
  return 'text-red-600';
}

function ProgressColor(score: number, cible: number) {
  if (score >= cible)       return 'bg-green-500';
  if (score >= cible - 10)  return 'bg-amber-500';
  return 'bg-red-500';
}

// ── ISO Score Gauge ─────────────────────────────────────────
function IsoGauge({ score, niveau }: { score: number; niveau: number }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#22c55e' : score >= 65 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--border))" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-foreground">{score}%</span>
          <span className="text-[10px] text-muted-foreground font-medium">SCORE ISO</span>
        </div>
      </div>
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
          style={{ background: color + '20', color }}>
          <Award className="h-3 w-3" />
          Niveau {niveau} — {maturiteNiveaux[niveau - 1]?.label}
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          {maturiteNiveaux[niveau - 1]?.description}
        </p>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────
export default function IsoCenterPage() {
  const [expandedClause, setExpandedClause] = useState<string | null>(null);

  return (
    <div className="page-container animate-fade-up">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Smart ISO 21001 Center
          </h1>
          <p className="page-subtitle">
            Évaluation de maturité · GAP analysis · Radar conformité · Master IFDL
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-xs gap-1">
            <RefreshCw className="h-3.5 w-3.5" /> Réévaluer
          </Button>
          <Button
            size="sm"
            className="text-xs gap-1"
            onClick={() => downloadExport('iso-center', 'pdf', 'rapport-gap-iso21001.pdf')}
          >
            <Download className="h-3.5 w-3.5" /> Rapport GAP
          </Button>
        </div>
      </div>

      {/* Top summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Score Global', value: `${scoreGlobal}%`, icon: Award,      color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Clauses Conformes', value: `${clausesData.filter(c => c.score >= c.cible).length}/${clausesData.length}`, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
          { label: 'Niveau Maturité', value: `N${niveauMaturite} — ${maturiteNiveaux[niveauMaturite - 1]?.label}`, icon: Target, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' },
          { label: 'GAP à combler', value: `${gapItems.length} points`, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
        ].map(card => (
          <Card key={card.label} className="stat-card">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2', card.bg)}>
              <card.icon className={cn('h-4 w-4', card.color)} />
            </div>
            <p className="stat-label">{card.label}</p>
            <p className="font-bold text-foreground text-sm">{card.value}</p>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="maturite">
        <TabsList className="h-9">
          <TabsTrigger value="maturite"   className="text-xs">Maturité Globale</TabsTrigger>
          <TabsTrigger value="clauses"    className="text-xs">Par Clause</TabsTrigger>
          <TabsTrigger value="gap"        className="text-xs">GAP Analysis</TabsTrigger>
          <TabsTrigger value="roadmap"    className="text-xs">Plan d'action</TabsTrigger>
        </TabsList>

        {/* ── Maturité Tab ──────────────────────────────── */}
        <TabsContent value="maturite" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Gauge + Niveau */}
            <Card className="flex flex-col items-center justify-center py-6">
              <CardHeader className="pb-2 text-center">
                <CardTitle className="text-sm font-semibold">Score de Maturité ISO 21001</CardTitle>
                <CardDescription className="text-xs">Année universitaire 2025–2026</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4 w-full">
                <IsoGauge score={scoreGlobal} niveau={niveauMaturite} />
                <Separator />
                <div className="w-full space-y-2">
                  {maturiteNiveaux.map(n => (
                    <div key={n.niveau} className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all',
                      n.niveau === niveauMaturite ? 'bg-primary/10 border border-primary/30' : 'opacity-50'
                    )}>
                      <div className={cn('w-2 h-2 rounded-full flex-shrink-0', n.color)} />
                      <span className="font-semibold">N{n.niveau} — {n.label}</span>
                      {n.niveau === niveauMaturite && (
                        <Badge className="ml-auto text-[9px] bg-primary text-white h-4">Actuel</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Radar Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Radar de Conformité
                </CardTitle>
                <CardDescription className="text-xs">Score vs Cible par clause</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="clause" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Radar name="Score Actuel" dataKey="score" stroke="#0d3b7a" fill="#0d3b7a" fillOpacity={0.25} strokeWidth={2} dot={{ r: 3 }} />
                    <Radar name="Cible"        dataKey="cible" stroke="#22c55e" fill="#22c55e" fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="5 3" />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: any) => [`${v}%`]} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Score par Clause</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={clausesData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
                    <YAxis type="category" dataKey="code" tick={{ fontSize: 10 }} width={20} tickFormatter={v => `§${v}`} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: any) => [`${v}%`]} />
                    <Bar dataKey="score" name="Score" radius={[0, 4, 4, 0]}>
                      {clausesData.map((c) => (
                        <Cell key={c.code} fill={c.score >= c.cible ? '#22c55e' : c.score >= c.cible - 10 ? '#f59e0b' : '#ef4444'} />
                      ))}
                    </Bar>
                    <Bar dataKey="cible" name="Cible" fill="hsl(var(--border))" radius={[0, 4, 4, 0]} opacity={0.4} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Clauses Tab ───────────────────────────────── */}
        <TabsContent value="clauses" className="mt-4 space-y-3">
          {clausesData.map(clause => (
            <motion.div key={clause.code} layout>
              <Card className="overflow-hidden">
                <button
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedClause(expandedClause === clause.code ? null : clause.code)}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0',
                    clause.score >= clause.cible ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                      : clause.score >= clause.cible - 10 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30'
                  )}>
                    §{clause.code}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold">{clause.titre}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex-1 max-w-48 progress-track">
                        <div
                          className={cn('progress-fill', ProgressColor(clause.score, clause.cible))}
                          style={{ width: `${clause.score}%` }}
                        />
                      </div>
                      <span className={cn('text-xs font-bold', ScoreColor(clause.score, clause.cible))}>
                        {clause.score}%
                      </span>
                      <span className="text-xs text-muted-foreground">cible : {clause.cible}%</span>
                    </div>
                  </div>
                  <ChevronRight className={cn(
                    'h-4 w-4 text-muted-foreground transition-transform flex-shrink-0',
                    expandedClause === clause.code && 'rotate-90'
                  )} />
                </button>

                {expandedClause === clause.code && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border"
                  >
                    <div className="px-4 py-3 space-y-2 bg-muted/20">
                      {clause.sousClauses.map(sc => (
                        <div key={sc.code} className="flex items-center gap-3 py-1.5 px-3 rounded-lg bg-card border border-border/50">
                          <StatutIcon statut={sc.statut} />
                          <span className="text-xs font-medium text-muted-foreground w-10 flex-shrink-0">{sc.code}</span>
                          <span className="text-xs flex-1">{sc.titre}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 progress-track">
                              <div className={cn('progress-fill', ProgressColor(sc.score, 80))} style={{ width: `${sc.score}%` }} />
                            </div>
                            <span className={cn('text-xs font-bold w-8 text-right', ScoreColor(sc.score, 80))}>
                              {sc.score}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* ── GAP Analysis Tab ──────────────────────────── */}
        <TabsContent value="gap" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Écarts identifiés ({gapItems.length})
                </CardTitle>
                <CardDescription className="text-xs">Sous-clauses nécessitant une amélioration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {gapItems.map(item => (
                  <div key={item.code} className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card">
                    <Badge className={cn('text-[9px] px-1.5 h-4 flex-shrink-0',
                      item.gap === 'majeur' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    )}>
                      {item.gap === 'majeur' ? 'Majeur' : 'Mineur'}
                    </Badge>
                    <span className="text-xs font-medium text-muted-foreground w-10 flex-shrink-0">{item.code}</span>
                    <span className="text-xs flex-1 truncate">{item.titre}</span>
                    <span className={cn('text-xs font-bold', ScoreColor(item.score, 80))}>
                      {item.score}%
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  Recommandations prioritaires
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { priorite: 'P1', action: 'Formaliser le processus de gestion des risques §6.1', impact: '+8%', echeance: 'S1 2027' },
                  { priorite: 'P2', action: 'Mettre en place le système de revue de direction §9.3', impact: '+6%', echeance: 'S1 2027' },
                  { priorite: 'P3', action: 'Documenter le plan d\'amélioration continue §10.2', impact: '+5%', echeance: 'S2 2027' },
                  { priorite: 'P4', action: 'Renforcer la planification opérationnelle §8.2', impact: '+4%', echeance: 'S2 2027' },
                  { priorite: 'P5', action: 'Améliorer la sensibilisation du personnel §7.3', impact: '+3%', echeance: 'S1 2027' },
                ].map(rec => (
                  <div key={rec.priorite} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/30 border border-border/50">
                    <span className="w-7 h-7 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {rec.priorite}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium leading-snug">{rec.action}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-green-600 font-semibold">Impact estimé : {rec.impact}</span>
                        <span className="text-[10px] text-muted-foreground">Éch. : {rec.echeance}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Roadmap Tab ───────────────────────────────── */}
        <TabsContent value="roadmap" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Plan de progrès vers la certification ISO 21001
              </CardTitle>
              <CardDescription className="text-xs">Trajectory 2025–2027 · ESEF Berrechid</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
                {[
                  { date: 'S2 2025', titre: 'Déploiement SMOE initial',   done: true,  score: 68, actions: 'Rédaction politique qualité · Cartographie processus · Formation équipe' },
                  { date: 'S1 2026', titre: 'Consolidation & audit interne', done: true, score: 76, actions: 'Audit interne PR-01 à PR-04 · Traitement NC · Mise à jour documentation' },
                  { date: 'S2 2026', titre: 'Audit à blanc ISO 21001',     done: false, score: 82, actions: 'Pré-audit par organisme externe · GAP analysis final · Plan d\'actions correctives' },
                  { date: 'S1 2027', titre: 'Certification ISO 21001',     done: false, score: 90, actions: 'Audit de certification · Revue de direction · Délivrance certificat' },
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative pl-12 pb-6"
                  >
                    <div className={cn(
                      'absolute left-2.5 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center',
                      step.done ? 'bg-green-500' : i === 2 ? 'bg-blue-500' : 'bg-muted-foreground/30'
                    )}>
                      {step.done && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>
                    <div className={cn('p-3 rounded-xl border', step.done ? 'bg-green-50/50 dark:bg-green-950/20 border-green-200/50' : i === 2 ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 border-dashed' : 'bg-muted/30 border-dashed')}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] h-4">{step.date}</Badge>
                          <span className="text-sm font-semibold">{step.titre}</span>
                        </div>
                        <span className={cn('text-sm font-bold', step.done ? 'text-green-600' : 'text-muted-foreground')}>
                          {step.score}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{step.actions}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
