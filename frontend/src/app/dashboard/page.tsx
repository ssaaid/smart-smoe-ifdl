/**
 * Dashboard Page — SALHY Abdelilah SMART SMOE MASTER
 * Tableau de bord exécutif ISO 21001
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { downloadExport } from '@/lib/export';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  ClipboardCheck, FileText, Users, Target, Award,
  ArrowUpRight, ArrowDownRight, Activity, Zap,
  ShieldCheck, BarChart3, RefreshCw, Download,
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useDashboard } from '@/hooks/use-dashboard';
import { IsoScoreGauge } from '@/components/dashboard/iso-score-gauge';
import { RiskHeatmap } from '@/components/dashboard/risk-heatmap';
import { KpiSparkline } from '@/components/dashboard/kpi-sparkline';
import { RecentActivityFeed } from '@/components/dashboard/recent-activity';
import { cn } from '@/lib/utils';

// ── Static mock data (replace with API calls) ─────────────────
const kpiEvolution = [
  { mois: 'Jan', satisfaction: 72, reussite: 78, disponibilite: 98.5 },
  { mois: 'Fév', satisfaction: 74, reussite: 80, disponibilite: 99.1 },
  { mois: 'Mar', satisfaction: 71, reussite: 79, disponibilite: 97.8 },
  { mois: 'Avr', satisfaction: 76, reussite: 83, disponibilite: 99.0 },
  { mois: 'Mai', satisfaction: 78, reussite: 85, disponibilite: 99.4 },
  { mois: 'Jun', satisfaction: 80, reussite: 86, disponibilite: 99.1 },
];

const processConformite = [
  { process: 'PR-01 Pilotage',     conformite: 88 },
  { process: 'PR-02 Réalisation',  conformite: 82 },
  { process: 'PR-03 Support',      conformite: 79 },
  { process: 'PR-04 Évaluation',   conformite: 91 },
];

const radarData = [
  { clause: 'Leadership',    score: 85, cible: 90 },
  { clause: 'Planification', score: 78, cible: 85 },
  { clause: 'Support',       score: 82, cible: 85 },
  { clause: 'Réalisation',   score: 74, cible: 80 },
  { clause: 'Évaluation',    score: 88, cible: 90 },
  { clause: 'Amélioration',  score: 70, cible: 80 },
];

const riskDistribution = [
  { name: 'Critique', value: 3,  color: '#ef4444' },
  { name: 'Élevé',    value: 7,  color: '#f97316' },
  { name: 'Modéré',   value: 12, color: '#eab308' },
  { name: 'Faible',   value: 18, color: '#22c55e' },
];

const statsCards = [
  {
    label: 'Score Qualité Global',
    value: '82%',
    delta: '+4%',
    trend: 'up',
    icon: Award,
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    description: 'vs semestre précédent',
    href: '/kpi',
  },
  {
    label: 'Score Maturité ISO',
    value: '76%',
    delta: '+6%',
    trend: 'up',
    icon: ShieldCheck,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    description: 'Niveau : Maîtrisé',
    href: '/iso-center',
  },
  {
    label: 'Satisfaction Étudiants',
    value: '80%',
    delta: '+8%',
    trend: 'up',
    icon: Users,
    color: 'text-green-600',
    bg: 'bg-green-50 dark:bg-green-950/30',
    description: 'Cible : 80% ✓',
    href: '/satisfaction',
  },
  {
    label: 'KPI au Vert',
    value: '7 / 10',
    delta: '+2',
    trend: 'up',
    icon: Target,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    description: '2 orange · 1 rouge',
    href: '/kpi',
  },
  {
    label: 'Risques Critiques',
    value: '3',
    delta: '+1',
    trend: 'down',
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-950/30',
    description: '7 élevés · plan actif',
    href: '/risks',
  },
  {
    label: 'Audits Réalisés',
    value: '4 / 6',
    delta: '66%',
    trend: 'up',
    icon: ClipboardCheck,
    color: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    description: '2 en cours · 0 annulés',
    href: '/audits',
  },
  {
    label: 'Actions Correctives',
    value: '12',
    delta: '-3',
    trend: 'up',
    icon: Activity,
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    description: '3 clôturées ce mois',
    href: '/actions',
  },
  {
    label: 'Réclamations',
    value: '7',
    delta: '+2',
    trend: 'down',
    icon: FileText,
    color: 'text-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    description: 'Délai moy. : 12 jours',
    href: '/complaints',
  },
];

const recentActions = [
  { id: 1, titre: 'Plan tutorat renforcé S3', statut: 'en_cours', avancement: 75, echeance: '30/06/2026', process: 'PR-02', priorite: 'haute' },
  { id: 2, titre: 'Redondance serveur Moodle', statut: 'en_cours', avancement: 40, echeance: '15/07/2026', process: 'PR-03', priorite: 'haute' },
  { id: 3, titre: 'Révision maquette pédagogique', statut: 'verifiee', avancement: 90, echeance: '10/06/2026', process: 'PR-01', priorite: 'normale' },
  { id: 4, titre: 'Formation encadrants Moodle', statut: 'ouverte', avancement: 20, echeance: '31/07/2026', process: 'PR-03', priorite: 'normale' },
  { id: 5, titre: 'Mise à jour politique qualité', statut: 'cloturee', avancement: 100, echeance: '01/06/2026', process: 'PR-01', priorite: 'basse' },
];

// ── Helpers ───────────────────────────────────────────────────
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const StatutBadge = ({ statut }: { statut: string }) => {
  const map: Record<string, string> = {
    en_cours: 'bg-blue-100 text-blue-700',
    cloturee: 'bg-green-100 text-green-700',
    verifiee: 'bg-purple-100 text-purple-700',
    ouverte:  'bg-amber-100 text-amber-700',
  };
  const labels: Record<string, string> = {
    en_cours: 'En cours', cloturee: 'Clôturée',
    verifiee: 'Vérifiée', ouverte: 'Ouverte',
  };
  return (
    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', map[statut] ?? 'bg-gray-100 text-gray-600')}>
      {labels[statut] ?? statut}
    </span>
  );
};

// ── Dashboard Page ────────────────────────────────────────────
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('apercu');
  const currentDate = new Date().toLocaleDateString('fr-MA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="page-container animate-fade-up">

      {/* ── Page Header ────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Tableau de Bord SMOE
          </h1>
          <p className="page-subtitle">
            Master IFDL · ESEF Berrechid · Université Hassan 1er &nbsp;|&nbsp;
            <span className="capitalize">{currentDate}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 text-xs">
            <ShieldCheck className="h-3 w-3 text-green-600" />
            ISO 21001 Conforme
          </Badge>
          <Button size="sm" variant="outline" className="gap-1 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Actualiser
          </Button>
          <Button
            size="sm"
            className="gap-1 text-xs"
            onClick={() => downloadExport('kpis', 'xlsx', 'dashboard-kpis.xlsx')}
          >
            <Download className="h-3.5 w-3.5" /> Exporter
          </Button>
        </div>
      </div>

      {/* ── KPI Cards Grid ──────────────────────────────────── */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3"
      >
        {statsCards.map((card) => (
          <motion.div key={card.label} variants={fadeUp}>
            <Link href={card.href}>
              <Card className="stat-card hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2', card.bg)}>
                  <card.icon className={cn('h-4 w-4', card.color)} />
                </div>
                <div className="stat-label">{card.label}</div>
                <div className="stat-value text-2xl">{card.value}</div>
                <div className={cn('stat-delta', card.trend === 'up' ? 'up' : 'down')}>
                  {card.trend === 'up'
                    ? <TrendingUp className="h-3 w-3" />
                    : <TrendingDown className="h-3 w-3" />}
                  {card.delta}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{card.description}</p>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Main Tabs ───────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-9">
          <TabsTrigger value="apercu"    className="text-xs">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="kpi"       className="text-xs">KPI</TabsTrigger>
          <TabsTrigger value="risques"   className="text-xs">Risques</TabsTrigger>
          <TabsTrigger value="iso"       className="text-xs">Maturité ISO</TabsTrigger>
          <TabsTrigger value="activite"  className="text-xs">Activité</TabsTrigger>
        </TabsList>

        {/* ── Aperçu ──────────────────────────────────────── */}
        <TabsContent value="apercu" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* KPI Evolution Chart */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Évolution KPI — Satisfaction & Réussite
                </CardTitle>
                <CardDescription className="text-xs">2025–2026 · Semestres S1–S4</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={kpiEvolution}>
                    <defs>
                      <linearGradient id="colorSat" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#0d3b7a" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#0d3b7a" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorReus" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                    <YAxis domain={[60, 100]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))' }}
                      formatter={(v: any) => [`${v}%`]}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="satisfaction" name="Satisfaction %" stroke="#0d3b7a" strokeWidth={2} fill="url(#colorSat)" dot={{ r: 3 }} />
                    <Area type="monotone" dataKey="reussite"     name="Réussite %"    stroke="#22c55e" strokeWidth={2} fill="url(#colorReus)" dot={{ r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* ISO Score Radar */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Radar Conformité ISO 21001
                </CardTitle>
                <CardDescription className="text-xs">Clauses principales</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="clause" tick={{ fontSize: 9 }} />
                    <Radar name="Score" dataKey="score" stroke="#0d3b7a" fill="#0d3b7a" fillOpacity={0.2} strokeWidth={2} />
                    <Radar name="Cible" dataKey="cible" stroke="#22c55e" fill="#22c55e" fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="4 4" />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Conformité par Processus */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Conformité par Processus</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {processConformite.map((p) => (
                  <div key={p.process} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">{p.process}</span>
                      <span className={cn(
                        'font-semibold',
                        p.conformite >= 85 ? 'text-green-600' :
                        p.conformite >= 75 ? 'text-amber-600' : 'text-red-600'
                      )}>{p.conformite}%</span>
                    </div>
                    <div className="progress-track">
                      <div
                        className={cn('progress-fill', p.conformite >= 85 ? 'bg-green-500' : p.conformite >= 75 ? 'bg-amber-500' : 'bg-red-500')}
                        style={{ width: `${p.conformite}%` }}
                      />
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-xs font-semibold">
                  <span>Conformité globale</span>
                  <span className="text-blue-600">85%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill bg-primary" style={{ width: '85%' }} />
                </div>
              </CardContent>
            </Card>

            {/* Risk Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Distribution des Risques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {riskDistribution.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  {riskDistribution.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                      <span className="text-muted-foreground">{d.name}</span>
                      <span className="font-semibold ml-auto">{d.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions Correctives */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-500" />
                    Actions Correctives
                  </span>
                  <Badge variant="outline" className="text-[10px]">12 actives</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {recentActions.slice(0, 4).map((action) => (
                  <div key={action.id} className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium truncate flex-1">{action.titre}</span>
                      <StatutBadge statut={action.statut} />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="progress-track flex-1">
                        <div
                          className={cn('progress-fill',
                            action.avancement === 100 ? 'bg-green-500' :
                            action.avancement >= 60 ? 'bg-blue-500' : 'bg-amber-500'
                          )}
                          style={{ width: `${action.avancement}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground w-7 text-right">
                        {action.avancement}%
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium">
                        {action.process}
                      </span>
                      <span>Éch. {action.echeance}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── KPI Tab ─────────────────────────────────────── */}
        <TabsContent value="kpi" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Performance KPI — Vue détaillée</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={processConformite} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                    <YAxis type="category" dataKey="process" tick={{ fontSize: 10 }} width={120} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: any) => [`${v}%`]} />
                    <Bar dataKey="conformite" fill="#0d3b7a" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Évolution KPI Stratégiques</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={kpiEvolution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: any) => [`${v}%`]} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="satisfaction"  name="Satisfaction" stroke="#0d3b7a" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="reussite"      name="Réussite"     stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="disponibilite" name="Dispo Moodle" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Risques Tab ─────────────────────────────────── */}
        <TabsContent value="risques" className="mt-4">
          <RiskHeatmap />
        </TabsContent>

        {/* ── ISO Maturité Tab ────────────────────────────── */}
        <TabsContent value="iso" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <IsoScoreGauge score={76} niveau="Maîtrisé" />
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Scores par Clause ISO 21001</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {radarData.map((item) => (
                  <div key={item.clause} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">{item.clause}</span>
                      <span className={cn(
                        'font-semibold',
                        item.score >= item.cible ? 'text-green-600' :
                        item.score >= item.cible - 10 ? 'text-amber-600' : 'text-red-600'
                      )}>{item.score}% / {item.cible}%</span>
                    </div>
                    <div className="progress-track">
                      <div
                        className={cn('progress-fill',
                          item.score >= item.cible ? 'bg-green-500' :
                          item.score >= item.cible - 10 ? 'bg-amber-500' : 'bg-red-500'
                        )}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Activité Tab ────────────────────────────────── */}
        <TabsContent value="activite" className="mt-4">
          <RecentActivityFeed />
        </TabsContent>
      </Tabs>
    </div>
  );
}
