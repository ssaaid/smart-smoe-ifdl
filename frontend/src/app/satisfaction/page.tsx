/**
 * Enquêtes de Satisfaction — ISO 21001 §9.1.2
 * Mesure satisfaction parties prenantes · SMART SMOE IFDL
 * ESEF Berrechid · Master IFDL
 */
'use client';

import { useState, useEffect } from 'react';
import { downloadExport } from '@/lib/export';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smile, Plus, Download, TrendingUp, TrendingDown, Minus,
  Users, BarChart2, Send, X, Calendar,
  Star, Inbox, ChevronRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// ── Mock data ─────────────────────────────────────────────────
const surveys = [
  {
    id: 1, titre: 'Satisfaction Étudiants S2 2025-2026',
    type: 'etudiant', statut: 'actif',
    date_debut: '2026-05-15', date_fin: '2026-06-30',
    nb_reponses: 47, nb_cible: 65, score_moyen: 78.4,
  },
  {
    id: 2, titre: 'Satisfaction Personnel Enseignant 2026',
    type: 'personnel', statut: 'termine',
    date_debut: '2026-03-01', date_fin: '2026-04-30',
    nb_reponses: 18, nb_cible: 20, score_moyen: 82.1,
  },
  {
    id: 3, titre: 'Enquête Employeurs — Insertion Pro 2025',
    type: 'employeur', statut: 'termine',
    date_debut: '2026-01-15', date_fin: '2026-02-28',
    nb_reponses: 12, nb_cible: 15, score_moyen: 85.3,
  },
  {
    id: 4, titre: 'Satisfaction Étudiants S1 2025-2026',
    type: 'etudiant', statut: 'termine',
    date_debut: '2026-01-05', date_fin: '2026-01-31',
    nb_reponses: 58, nb_cible: 60, score_moyen: 74.8,
  },
  {
    id: 5, titre: 'Enquête Partenaires Institutionnels 2026',
    type: 'partenaire', statut: 'preparation',
    date_debut: '2026-07-01', date_fin: '2026-08-31',
    nb_reponses: 0, nb_cible: 8, score_moyen: null,
  },
];

const dimensionScores = [
  { dimension: 'Contenu pédagogique',   score: 81.2 },
  { dimension: 'Organisation des cours', score: 72.5 },
  { dimension: 'Environnement de travail', score: 68.4 },
  { dimension: 'Support administratif',  score: 75.1 },
  { dimension: 'Encadrement pédagogique', score: 84.7 },
  { dimension: 'Ressources numériques',  score: 69.3 },
];

const partyScores = [
  { type: 'Étudiants',  score: 78.4, trend: +3.6, icon: '🎓', nb: 105 },
  { type: 'Personnel',  score: 82.1, trend: +1.2, icon: '👨‍🏫', nb: 18 },
  { type: 'Employeurs', score: 85.3, trend: +5.8, icon: '🏢',  nb: 12 },
  { type: 'Partenaires', score: 79.0, trend: -1.0, icon: '🤝', nb: 8 },
];

// Simulated recent responses
const recentResponses = [
  { id: 1, type: 'etudiant',   respondent: 'Étudiant IFDL', score: 82, date: '2026-06-05', comment: 'Bonne organisation mais manque de ressources numériques.' },
  { id: 2, type: 'etudiant',   respondent: 'Étudiant IFDL', score: 91, date: '2026-06-04', comment: 'Très satisfait du contenu pédagogique et de l\'encadrement.' },
  { id: 3, type: 'etudiant',   respondent: 'Étudiant IFDL', score: 68, date: '2026-06-04', comment: 'L\'environnement de travail devrait être amélioré.' },
  { id: 4, type: 'etudiant',   respondent: 'Étudiant IFDL', score: 78, date: '2026-06-03', comment: 'Bonne qualité globale, continuez ainsi.' },
  { id: 5, type: 'etudiant',   respondent: 'Étudiant IFDL', score: 85, date: '2026-06-03', comment: 'Support administratif très réactif.' },
];

// ── Config ────────────────────────────────────────────────────
const typeConfig: Record<string, { label: string; bg: string; color: string }> = {
  etudiant:   { label: 'Étudiant',   bg: 'bg-blue-100',   color: 'text-blue-700' },
  personnel:  { label: 'Personnel',  bg: 'bg-purple-100', color: 'text-purple-700' },
  employeur:  { label: 'Employeur',  bg: 'bg-amber-100',  color: 'text-amber-700' },
  partenaire: { label: 'Partenaire', bg: 'bg-green-100',  color: 'text-green-700' },
};

const statutConfig: Record<string, { label: string; badge: string; dot: string }> = {
  actif:       { label: 'Active',       badge: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  termine:     { label: 'Terminée',     badge: 'bg-gray-100 text-gray-600',    dot: 'bg-gray-400' },
  preparation: { label: 'Préparation',  badge: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-400' },
};

function scoreColor(score: number) {
  if (score >= 80) return '#22c55e';   // green-500
  if (score >= 65) return '#f59e0b';   // amber-500
  return '#ef4444';                    // red-500
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-muted-foreground">—</span>;
  const cls =
    score >= 80 ? 'bg-green-100 text-green-700' :
    score >= 65 ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700';
  return (
    <span className={cn('text-xs font-bold px-2 py-0.5 rounded', cls)}>
      {score.toFixed(1)}%
    </span>
  );
}

function TrendIcon({ trend }: { trend: number }) {
  if (trend > 0) return <TrendingUp className="h-3.5 w-3.5 text-green-600" />;
  if (trend < 0) return <TrendingDown className="h-3.5 w-3.5 text-red-500" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
}

// ── New Survey Form Modal ─────────────────────────────────────
function NewSurveyForm({ onClose, onAdd }: { onClose: () => void; onAdd: (s: any) => void }) {
  const [titre, setTitre] = useState('');
  const [type, setType] = useState('etudiant');
  const [nbCible, setNbCible] = useState('60');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [description, setDescription] = useState('');
  const [diffusion, setDiffusion] = useState('online');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!titre.trim() || !dateDebut || !dateFin) { setError('Le titre et les dates sont requis.'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/satisfaction', {
        titre, type, statut: 'preparation',
        date_debut: dateDebut, date_fin: dateFin,
        nb_reponses: 0, nb_cible: parseInt(nbCible) || 0,
        score_moyen: null,
        description: description || null,
        mode_diffusion: diffusion,
      });
      onAdd(data);
      onClose();
    } catch {
      setError("Erreur lors de l'enregistrement. Veuillez réessayer.");
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
            <h3 className="text-sm font-semibold">Nouvelle enquête de satisfaction</h3>
            <p className="text-xs text-muted-foreground">ISO 21001 §9.1.2 · ESEF Berrechid</p>
          </div>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs font-medium">Titre de l'enquête *</Label>
            <Input placeholder="ex: Satisfaction Étudiants S1 2026-2027" className="h-9 text-sm" value={titre} onChange={e => setTitre(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Type de partie prenante *</Label>
              <select className="w-full h-9 rounded-lg border border-input bg-background text-xs px-3" value={type} onChange={e => setType(e.target.value)}>
                <option value="etudiant">Étudiant</option>
                <option value="personnel">Personnel enseignant</option>
                <option value="employeur">Employeur</option>
                <option value="partenaire">Partenaire</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Nombre cible de réponses</Label>
              <Input type="number" placeholder="ex: 60" className="h-9 text-xs" value={nbCible} onChange={e => setNbCible(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Date de début *</Label>
              <Input type="date" className="h-9 text-xs" value={dateDebut} onChange={e => setDateDebut(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Date de fin *</Label>
              <Input type="date" className="h-9 text-xs" value={dateFin} onChange={e => setDateFin(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Description / Objectifs</Label>
            <textarea
              className="w-full h-20 rounded-lg border border-input bg-background text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Objectifs de l'enquête, contexte, instructions pour les répondants..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Mode de diffusion</Label>
            <select className="w-full h-9 rounded-lg border border-input bg-background text-xs px-3" value={diffusion} onChange={e => setDiffusion(e.target.value)}>
              <option value="online">En ligne (lien URL)</option>
              <option value="qrcode">QR Code</option>
              <option value="papier">Formulaire papier</option>
              <option value="mixte">Mixte</option>
            </select>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={onClose}>Annuler</Button>
            <Button size="sm" className="flex-1 h-8 text-xs gap-1" onClick={handleSubmit} disabled={loading}>
              <Send className="h-3 w-3" /> {loading ? 'Enregistrement...' : "Créer l'enquête"}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Custom Tooltip for chart ──────────────────────────────────
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { dimension: string } }> }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-md text-xs">
      <p className="font-semibold mb-0.5">{payload[0].payload.dimension}</p>
      <p className="font-bold" style={{ color: scoreColor(payload[0].value) }}>
        {payload[0].value.toFixed(1)}%
      </p>
    </div>
  );
}

// ── Survey Row ────────────────────────────────────────────────
function SurveyRow({ survey }: { survey: typeof surveys[0] }) {
  const typeCfg   = typeConfig[survey.type]   ?? typeConfig.etudiant;
  const statutCfg = statutConfig[survey.statut] ?? statutConfig.termine;
  const tauxParticipation = survey.nb_cible > 0
    ? Math.round((survey.nb_reponses / survey.nb_cible) * 100)
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="hover:shadow-md transition-all cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={cn('w-2 h-2 rounded-full flex-shrink-0', statutCfg.dot)} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={cn('text-[9px] font-semibold px-2 py-0.5 rounded', typeCfg.bg, typeCfg.color)}>
                  {typeCfg.label}
                </span>
                <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', statutCfg.badge)}>
                  {statutCfg.label}
                </span>
              </div>

              <p className="text-sm font-semibold">{survey.titre}</p>

              <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="h-2.5 w-2.5" />
                  {new Date(survey.date_debut).toLocaleDateString('fr-MA')} →{' '}
                  {new Date(survey.date_fin).toLocaleDateString('fr-MA')}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-2.5 w-2.5" />
                  {survey.nb_reponses} / {survey.nb_cible} réponses
                </span>
              </div>

              {survey.nb_cible > 0 && survey.nb_reponses > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[120px]">
                    <div
                      className="h-full rounded-full bg-primary/60 transition-all"
                      style={{ width: `${Math.min(tauxParticipation, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{tauxParticipation}% participation</span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <ScoreBadge score={survey.score_moyen} />
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function SatisfactionPage() {
  const [showForm, setShowForm] = useState(false);
  const [surveyList, setSurveyList] = useState(surveys);
  useEffect(() => {
    api.get('/satisfaction').then(r => { if (Array.isArray(r.data) && r.data.length) setSurveyList(r.data); }).catch(() => {});
  }, []);
  const handleAdd = (s: any) => setSurveyList(prev => [...prev, s]);

  const totalReponses = surveyList.reduce((s, q) => s + q.nb_reponses, 0);
  const scoredSurveys = surveyList.filter(s => s.score_moyen !== null);
  const scoreGlobal = scoredSurveys.length > 0
    ? scoredSurveys.reduce((s, q) => s + (q.score_moyen ?? 0), 0) / scoredSurveys.length
    : 0;
  const activeCount = surveyList.filter(s => s.statut === 'actif').length;

  // Overall trend vs N-1 (derived from partyScores)
  const avgTrend = partyScores.reduce((s, p) => s + p.trend, 0) / partyScores.length;

  const filterSurveys = (tab: string) => {
    if (tab === 'actives')      return surveyList.filter(s => s.statut === 'actif');
    if (tab === 'terminees')    return surveyList.filter(s => s.statut === 'termine');
    if (tab === 'preparation')  return surveyList.filter(s => s.statut === 'preparation');
    return surveyList;
  };

  return (
    <div className="page-container animate-fade-up">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Smile className="h-6 w-6 text-primary" />
            Enquêtes de Satisfaction
          </h1>
          <p className="page-subtitle">
            ISO 21001 §9.1.2 · Mesure satisfaction parties prenantes · Master IFDL
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1"
            onClick={() => downloadExport('satisfaction', 'xlsx', 'satisfaction.xlsx')}
          >
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button size="sm" className="text-xs gap-1" onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5" /> Nouvelle enquête
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Score global moyen',
            value: `${scoreGlobal.toFixed(1)}%`,
            color: scoreGlobal >= 80 ? 'text-green-600' : scoreGlobal >= 65 ? 'text-amber-600' : 'text-red-600',
          },
          { label: 'Enquêtes actives', value: activeCount,       color: 'text-blue-600' },
          { label: 'Réponses totales', value: totalReponses,     color: 'text-foreground' },
          {
            label: 'Tendance vs N-1',
            value: `${avgTrend > 0 ? '+' : ''}${avgTrend.toFixed(1)}%`,
            color: avgTrend > 0 ? 'text-green-600' : avgTrend < 0 ? 'text-red-600' : 'text-muted-foreground',
          },
        ].map(s => (
          <Card key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Party score cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {partyScores.map((party, i) => {
          const scoreClass =
            party.score >= 80 ? 'text-green-600' :
            party.score >= 65 ? 'text-amber-600' :
                                'text-red-600';
          const badgeClass =
            party.score >= 80 ? 'bg-green-100 text-green-700' :
            party.score >= 65 ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700';
          return (
            <motion.div
              key={party.type}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{party.icon}</span>
                    <div>
                      <p className="text-sm font-semibold">{party.type}</p>
                      <p className="text-[10px] text-muted-foreground">{party.nb} répondants</p>
                    </div>
                  </div>
                  <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded', badgeClass)}>
                    {party.score.toFixed(1)}%
                  </span>
                </div>

                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${party.score}%`,
                      backgroundColor: scoreColor(party.score),
                    }}
                  />
                </div>

                <div className="flex items-center gap-1 text-[10px]">
                  <TrendIcon trend={party.trend} />
                  <span className={cn(
                    'font-semibold',
                    party.trend > 0 ? 'text-green-600' :
                    party.trend < 0 ? 'text-red-500' :
                    'text-muted-foreground'
                  )}>
                    {party.trend > 0 ? '+' : ''}{party.trend.toFixed(1)}% vs N-1
                  </span>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Chart + Recent responses */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Bar chart by dimension */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-primary" />
              Satisfaction par dimension pédagogique
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Consolidé toutes enquêtes terminées · 2025-2026
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={dimensionScores}
                layout="vertical"
                margin={{ top: 0, right: 48, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={v => `${v}%`}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="dimension"
                  width={155}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.4)' }} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={18} label={{ position: 'right', formatter: (v: number) => `${v.toFixed(1)}%`, fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}>
                  {dimensionScores.map((entry, i) => (
                    <Cell key={i} fill={scoreColor(entry.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex gap-4 mt-3 justify-end text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block" /> ≥ 80% Satisfaisant</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" /> 65–80% À améliorer</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" /> &lt; 65% Insuffisant</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent responses feed */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              Dernières réponses
            </CardTitle>
            <p className="text-xs text-muted-foreground">Enquête Étudiants S2 en cours</p>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {recentResponses.map((r, i) => {
              const typeCfg = typeConfig[r.type] ?? typeConfig.etudiant;
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-2.5"
                >
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs">
                      {r.type === 'etudiant' ? '🎓' : r.type === 'personnel' ? '👨‍🏫' : '🏢'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded', typeCfg.bg, typeCfg.color)}>
                        {typeCfg.label}
                      </span>
                      <span className={cn(
                        'text-xs font-bold',
                        r.score >= 80 ? 'text-green-600' :
                        r.score >= 65 ? 'text-amber-600' :
                        'text-red-600'
                      )}>
                        {r.score}%
                      </span>
                    </div>
                    {r.comment && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2 italic">
                        "{r.comment}"
                      </p>
                    )}
                    <p className="text-[9px] text-muted-foreground mt-0.5">
                      {new Date(r.date).toLocaleDateString('fr-MA')}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Surveys list with tabs */}
      <Tabs defaultValue="actives">
        <div className="flex items-center justify-between gap-4">
          <TabsList className="h-9">
            <TabsTrigger value="actives"     className="text-xs">
              Actives ({surveyList.filter(s => s.statut === 'actif').length})
            </TabsTrigger>
            <TabsTrigger value="terminees"   className="text-xs">
              Terminées ({surveyList.filter(s => s.statut === 'termine').length})
            </TabsTrigger>
            <TabsTrigger value="preparation" className="text-xs">
              En préparation ({surveyList.filter(s => s.statut === 'preparation').length})
            </TabsTrigger>
          </TabsList>
        </div>

        {(['actives', 'terminees', 'preparation'] as const).map(tab => (
          <TabsContent key={tab} value={tab} className="mt-4 space-y-2">
            {filterSurveys(tab).length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Inbox className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">Aucune enquête dans cette catégorie</p>
                </CardContent>
              </Card>
            ) : (
              filterSurveys(tab).map(survey => (
                <SurveyRow key={survey.id} survey={survey} />
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* New survey modal */}
      <AnimatePresence>
        {showForm && <NewSurveyForm onClose={() => setShowForm(false)} onAdd={handleAdd} />}
      </AnimatePresence>
    </div>
  );
}

