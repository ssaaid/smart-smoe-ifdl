/**
 * Plan de Formation & Compétences — ISO 21001 clause 7.2
 * SMART SMOE IFDL · ESEF Berrechid · Master IFDL
 */
'use client';

import { useState } from 'react';
import { downloadExport } from '@/lib/export';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Plus, Search, Filter, Star, StarHalf,
  Calendar, User, MapPin, Clock, Users, Euro, X,
  Download, ChevronRight, Monitor, BookOpen, Layers,
  CheckCircle2, AlertCircle, Circle, Send, TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// ── Mock data ─────────────────────────────────────────────────
const trainings = [
  { id: 1, titre: 'Formation Auditeur Interne ISO 21001', type: 'externe', statut: 'termine', date_debut: '2026-03-05', date_fin: '2026-03-06', formateur: 'Cabinet AFNOR Maroc', lieu: 'Casablanca', nb_heures: 14, participants: ['Pr. Benali', 'Dr. Ouhbi', 'M. Tahiri'], capacite: 15, cout: 12000, evaluation_score: 4.2 },
  { id: 2, titre: 'Outils Digitaux pour la Formation (Moodle/H5P)', type: 'interne', statut: 'termine', date_debut: '2026-02-15', date_fin: '2026-02-16', formateur: 'Coord. Digital', lieu: 'ESEF Berrechid', nb_heures: 8, participants: ['Pr. Benali', 'Pr. Alami', 'Dr. Ouhbi', 'Pr. Tahir', 'M. Radi'], capacite: 20, cout: 0, evaluation_score: 3.8 },
  { id: 3, titre: 'Ingénierie Pédagogique Universitaire', type: 'externe', statut: 'en_cours', date_debut: '2026-06-01', date_fin: '2026-06-30', formateur: 'Université Mohammed V', lieu: 'Rabat', nb_heures: 30, participants: ['Coord. Pédago', 'Pr. Saidi'], capacite: 10, cout: 8000, evaluation_score: null },
  { id: 4, titre: 'Gestion de Projet Agile en Éducation', type: 'elearning', statut: 'planifie', date_debut: '2026-07-15', date_fin: '2026-08-15', formateur: 'Coursera Professional', lieu: 'En ligne', nb_heures: 20, participants: [], capacite: 30, cout: 3500, evaluation_score: null },
  { id: 5, titre: 'Sensibilisation ISO 21001 — Tout le personnel', type: 'interne', statut: 'planifie', date_debut: '2026-09-01', date_fin: '2026-09-01', formateur: 'Resp. Qualité', lieu: 'ESEF Berrechid', nb_heures: 4, participants: [], capacite: 40, cout: 0, evaluation_score: null },
  { id: 6, titre: "Maîtrise des Outils IA pour l'Enseignement", type: 'externe', statut: 'planifie', date_debut: '2026-10-10', date_fin: '2026-10-11', formateur: 'Startup EdTech Maroc', lieu: 'Casablanca', nb_heures: 12, participants: [], capacite: 20, cout: 9000, evaluation_score: null },
];

const competencyMatrix = [
  { nom: 'Pr. A. Benali',  competences: { audit: 3, qualite: 4, pedagogie: 5, digital: 3, projet: 4 } },
  { nom: 'Dr. F. Ouhbi',   competences: { audit: 3, qualite: 3, pedagogie: 5, digital: 2, projet: 3 } },
  { nom: 'Coord. Pédago',  competences: { audit: 2, qualite: 3, pedagogie: 4, digital: 4, projet: 5 } },
  { nom: 'Resp. Qualité',  competences: { audit: 5, qualite: 5, pedagogie: 2, digital: 3, projet: 4 } },
  { nom: 'Resp. Admin',    competences: { audit: 1, qualite: 2, pedagogie: 1, digital: 3, projet: 3 } },
  { nom: 'Coord. Digital', competences: { audit: 1, qualite: 2, pedagogie: 3, digital: 5, projet: 4 } },
];

const competencyKeys = ['audit', 'qualite', 'pedagogie', 'digital', 'projet'] as const;
const competencyLabels: Record<string, string> = {
  audit: 'Audit interne',
  qualite: 'Système qualité',
  pedagogie: 'Ing. pédagogique',
  digital: 'Outils numériques',
  projet: 'Gestion de projet',
};

// ── Helpers ────────────────────────────────────────────────────
const typeConfig: Record<string, { label: string; style: string; icon: React.ReactNode }> = {
  interne:  { label: 'Interne',   style: 'bg-blue-50 text-blue-700 border-blue-200',   icon: <BookOpen className="h-3 w-3" /> },
  externe:  { label: 'Externe',   style: 'bg-purple-50 text-purple-700 border-purple-200', icon: <Users className="h-3 w-3" /> },
  elearning: { label: 'E-learning', style: 'bg-teal-50 text-teal-700 border-teal-200',   icon: <Monitor className="h-3 w-3" /> },
};

const statutConfig: Record<string, { label: string; badge: string; dot: string }> = {
  planifie: { label: 'Planifiée',  badge: 'bg-gray-100 text-gray-700',   dot: 'bg-gray-400'  },
  en_cours: { label: 'En cours',   badge: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500'  },
  termine:  { label: 'Terminée',   badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  annule:   { label: 'Annulée',    badge: 'bg-red-100 text-red-700',     dot: 'bg-red-500'   },
};

function levelStyle(level: number): string {
  if (level >= 5) return 'bg-emerald-100 text-emerald-800 font-bold';
  if (level === 4) return 'bg-green-100 text-green-800 font-semibold';
  if (level === 3) return 'bg-blue-100 text-blue-800';
  if (level === 2) return 'bg-amber-100 text-amber-800';
  if (level === 1) return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-400';
}

function levelLabel(level: number): string {
  if (level >= 5) return 'Expert';
  if (level === 4) return 'Maîtrisé';
  if (level === 3) return 'Opérationnel';
  if (level === 2) return 'En dev.';
  if (level === 1) return 'Débutant';
  return '—';
}

function StarRating({ score }: { score: number }) {
  const full = Math.floor(score);
  const half = score - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        i < full
          ? <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
          : i === full && half
            ? <StarHalf key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
            : <Star key={i} className="h-3 w-3 text-gray-200" />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{score.toFixed(1)}</span>
    </div>
  );
}

// ── Add Training Modal ─────────────────────────────────────────
function AddTrainingForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card border border-border rounded-xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold">Planifier une nouvelle formation</h3>
            <p className="text-xs text-muted-foreground">Plan de formation · ISO 21001 §7.2</p>
          </div>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs font-medium">Titre de la formation *</Label>
            <Input placeholder="Ex. Formation Auditeur Interne..." className="h-9 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Type</Label>
              <select className="w-full h-9 rounded-lg border border-input bg-background text-xs px-3">
                <option value="interne">Interne</option>
                <option value="externe">Externe</option>
                <option value="elearning">E-learning</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Capacité (personnes)</Label>
              <Input type="number" placeholder="20" className="h-9 text-sm" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">Formateur / Organisme</Label>
            <Input placeholder="Nom du formateur ou organisme..." className="h-9 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Date début</Label>
              <Input type="date" className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Date fin</Label>
              <Input type="date" className="h-9 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Lieu / Modalité</Label>
              <Input placeholder="ESEF Berrechid / En ligne..." className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Heures de formation</Label>
              <Input type="number" placeholder="8" className="h-9 text-sm" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">Budget (MAD)</Label>
            <Input type="number" placeholder="0" className="h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">Objectifs pédagogiques</Label>
            <textarea
              className="w-full h-20 rounded-lg border border-input bg-background text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Décrire les objectifs attendus de cette formation..."
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={onClose}>Annuler</Button>
            <Button size="sm" className="flex-1 h-8 text-xs gap-1" onClick={onClose}>
              <Send className="h-3 w-3" /> Planifier
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Training Card ──────────────────────────────────────────────
function TrainingCard({ training }: { training: typeof trainings[0] }) {
  const t = typeConfig[training.type] ?? typeConfig.interne;
  const s = statutConfig[training.statut] ?? statutConfig.planifie;
  const fillRate = training.participants.length > 0
    ? Math.round((training.participants.length / training.capacite) * 100)
    : 0;

  return (
    <motion.div layout initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="hover:shadow-md transition-all overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn('w-2 h-2 rounded-full flex-shrink-0 mt-2', s.dot)} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={cn('text-[9px] font-semibold px-2 py-0.5 rounded border flex items-center gap-1', t.style)}>
                  {t.icon}{t.label}
                </span>
                <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', s.badge)}>
                  {s.label}
                </span>
              </div>
              <p className="text-sm font-semibold leading-snug">{training.titre}</p>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><User className="h-2.5 w-2.5" />{training.formateur}</span>
                <span className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{training.lieu}</span>
                <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{training.nb_heures}h</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-2.5 w-2.5" />
                  {new Date(training.date_debut).toLocaleDateString('fr-MA')}
                  {training.date_fin !== training.date_debut && ` → ${new Date(training.date_fin).toLocaleDateString('fr-MA')}`}
                </span>
              </div>

              {/* Participants progress */}
              {training.participants.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                    <span className="flex items-center gap-1"><Users className="h-2.5 w-2.5" />{training.participants.length}/{training.capacite} participants</span>
                    <span>{fillRate}%</span>
                  </div>
                  <Progress value={fillRate} className="h-1.5" />
                </div>
              )}

              <div className="flex items-center justify-between mt-2">
                {training.evaluation_score !== null ? (
                  <StarRating score={training.evaluation_score} />
                ) : (
                  <span className="text-[10px] text-muted-foreground italic">Non évalué</span>
                )}
                <span className="text-[10px] font-semibold text-muted-foreground">
                  {training.cout > 0 ? `${training.cout.toLocaleString('fr-MA')} MAD` : 'Gratuit'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function TrainingsPage() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const filtered = (tab: string) => trainings.filter(t => {
    const matchSearch = t.titre.toLowerCase().includes(search.toLowerCase()) ||
      t.formateur.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === 'toutes' || t.statut === tab ||
      (tab === 'planifie' && t.statut === 'planifie') ||
      (tab === 'en_cours' && t.statut === 'en_cours') ||
      (tab === 'termine' && t.statut === 'termine');
    return matchSearch && matchTab;
  });

  const stats = {
    total:         trainings.length,
    en_cours:      trainings.filter(t => t.statut === 'en_cours').length,
    termine:       trainings.filter(t => t.statut === 'termine').length,
    heures_total:  trainings.reduce((s, t) => s + t.nb_heures, 0),
    budget_total:  trainings.reduce((s, t) => s + t.cout, 0),
  };

  const upcomingTrainings = trainings
    .filter(t => t.statut === 'planifie')
    .sort((a, b) => new Date(a.date_debut).getTime() - new Date(b.date_debut).getTime())
    .slice(0, 3);

  return (
    <div className="page-container animate-fade-up">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            Plan de Formation & Compétences
          </h1>
          <p className="page-subtitle">
            ISO 21001 §7.2 · Gestion des compétences · Master IFDL · ESEF Berrechid
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1"
            onClick={() => downloadExport('trainings', 'pdf', 'formations.pdf')}
          >
            <Download className="h-3.5 w-3.5" /> Export PDF
          </Button>
          <Button size="sm" className="text-xs gap-1" onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5" /> Nouvelle formation
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total',             value: stats.total,                                          color: 'text-foreground' },
          { label: 'En cours',          value: stats.en_cours,                                       color: 'text-blue-600' },
          { label: 'Terminées',         value: stats.termine,                                        color: 'text-green-600' },
          { label: 'Heures de formation', value: `${stats.heures_total}h`,                           color: 'text-primary' },
          { label: 'Budget consommé',   value: `${(stats.budget_total / 1000).toFixed(0)}k MAD`,     color: 'text-amber-600' },
        ].map(s => (
          <Card key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Upcoming Trainings */}
      {upcomingTrainings.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Prochaines formations planifiées
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {upcomingTrainings.map((t, i) => {
              const tc = typeConfig[t.type] ?? typeConfig.interne;
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card className="border-l-4 border-l-primary/60 hover:shadow-md transition-all">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <span className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded border flex-shrink-0 mt-0.5', tc.style)}>
                          {tc.label}
                        </span>
                      </div>
                      <p className="text-xs font-semibold mt-1.5 leading-snug line-clamp-2">{t.titre}</p>
                      <div className="mt-2 space-y-0.5 text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5" />{new Date(t.date_debut).toLocaleDateString('fr-MA', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                        <div className="flex items-center gap-1"><User className="h-2.5 w-2.5" />{t.formateur}</div>
                        <div className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{t.lieu} · {t.nb_heures}h</div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Competency Matrix */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Matrice des Compétences du Personnel
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Niveaux : 5 Expert · 4 Maîtrisé · 3 Opérationnel · 2 En développement · 1 Débutant
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left font-semibold text-muted-foreground py-2 px-3 border-b border-border min-w-[140px]">
                    Personnel
                  </th>
                  {competencyKeys.map(k => (
                    <th key={k} className="text-center font-semibold text-muted-foreground py-2 px-3 border-b border-border min-w-[110px]">
                      {competencyLabels[k]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {competencyMatrix.map((person, i) => (
                  <motion.tr
                    key={person.nom}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="py-2 px-3 border-b border-border/40 font-medium text-foreground">
                      {person.nom}
                    </td>
                    {competencyKeys.map(k => {
                      const level = person.competences[k];
                      return (
                        <td key={k} className="py-2 px-3 border-b border-border/40 text-center">
                          <span className={cn('inline-block px-2 py-0.5 rounded text-[10px]', levelStyle(level))}>
                            {levelLabel(level)}
                          </span>
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-border">
            {[
              { label: 'Expert (5)',         style: 'bg-emerald-100 text-emerald-800' },
              { label: 'Maîtrisé (4)',        style: 'bg-green-100 text-green-800' },
              { label: 'Opérationnel (3)',    style: 'bg-blue-100 text-blue-800' },
              { label: 'En développement (2)', style: 'bg-amber-100 text-amber-800' },
              { label: 'Débutant (1)',        style: 'bg-red-100 text-red-800' },
            ].map(l => (
              <span key={l.label} className={cn('text-[10px] px-2 py-0.5 rounded font-medium', l.style)}>
                {l.label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Training list with Tabs */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Rechercher une formation..."
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
            <TabsTrigger value="toutes"    className="text-xs">Toutes ({trainings.length})</TabsTrigger>
            <TabsTrigger value="planifie"  className="text-xs">Planifiées ({trainings.filter(t => t.statut === 'planifie').length})</TabsTrigger>
            <TabsTrigger value="en_cours"  className="text-xs">En cours ({trainings.filter(t => t.statut === 'en_cours').length})</TabsTrigger>
            <TabsTrigger value="termine"   className="text-xs">Terminées ({trainings.filter(t => t.statut === 'termine').length})</TabsTrigger>
          </TabsList>

          {(['toutes', 'planifie', 'en_cours', 'termine'] as const).map(tab => (
            <TabsContent key={tab} value={tab} className="mt-4">
              <div className="space-y-2">
                {filtered(tab).length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-10 text-center">
                      <GraduationCap className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">Aucune formation dans cette catégorie</p>
                    </CardContent>
                  </Card>
                ) : (
                  filtered(tab).map(training => (
                    <TrainingCard key={training.id} training={training} />
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <AnimatePresence>
        {showForm && <AddTrainingForm onClose={() => setShowForm(false)} />}
      </AnimatePresence>
    </div>
  );
}
