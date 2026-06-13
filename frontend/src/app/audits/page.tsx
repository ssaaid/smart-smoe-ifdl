/**
 * Audits Internes — Programme & Checklists ISO 21001
 * SMART SMOE IFDL
 */
'use client';

import { useState, useEffect } from 'react';
import { downloadExport } from '@/lib/export';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardCheck, Plus, Search, Filter, Calendar, User,
  CheckSquare, Square, AlertCircle, ChevronDown, ChevronRight,
  Download, Eye, Edit2, MoreHorizontal, Play, Check, X,
  FileText, Clock, Target, Save, Loader2,
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
import { api } from '@/store/auth-store';
import toast from 'react-hot-toast';

// ── Types ──────────────────────────────────────────────────────
interface AuditItem {
  id: string;
  reference: string;
  titre: string;
  type: string;
  statut: string;
  process: string;
  auditeur: string;
  date_debut: string;
  date_fin: string;
  score: number | null;
  nc_majeures: number;
  nc_mineures: number;
  observations: number;
}

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
  interne:       'bg-blue-50 text-blue-700 border-blue-200',
  externe:       'bg-purple-50 text-purple-700 border-purple-200',
  certification: 'bg-amber-50 text-amber-700 border-amber-200',
};

function FindingBadge({ type }: { type: string | null }) {
  if (!type) return <Check className="h-3.5 w-3.5 text-green-500" />;
  if (type === 'NC-Majeure') return <Badge className="text-[9px] h-4 bg-red-100 text-red-700 border-0">NC Maj.</Badge>;
  if (type === 'NC-Mineure') return <Badge className="text-[9px] h-4 bg-amber-100 text-amber-700 border-0">NC Min.</Badge>;
  return <Badge className="text-[9px] h-4 bg-blue-100 text-blue-700 border-0">Obs.</Badge>;
}

// ── Planifier Modal ────────────────────────────────────────────
function PlanifierModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (a: AuditItem) => void;
}) {
  const [titre,        setTitre]        = useState('');
  const [type,         setType]         = useState('interne');
  const [processLabel, setProcessLabel] = useState('');
  const [auditeur,     setAuditeur]     = useState('');
  const [dateDebut,    setDateDebut]    = useState('');
  const [dateFin,      setDateFin]      = useState('');
  const [statut,       setStatut]       = useState('planifie');
  const [score,        setScore]        = useState('');
  const [ncMaj,        setNcMaj]        = useState('0');
  const [ncMin,        setNcMin]        = useState('0');
  const [nbObs,        setNbObs]        = useState('0');
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre || !dateDebut || !dateFin) {
      setError('Titre, date début et date fin sont obligatoires.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      // Auto-generate code
      const year = new Date(dateDebut).getFullYear();
      const code = `AUD-${year}-${Date.now().toString().slice(-3)}`;

      const payload: any = {
        code,
        titre,
        type,
        statut,
        date_debut:    new Date(dateDebut).toISOString(),
        date_fin:      new Date(dateFin).toISOString(),
        process_label: processLabel || null,
        auditeur_nom:  auditeur || null,
        nc_majeures:   Number(ncMaj),
        nc_mineures:   Number(ncMin),
        nb_observations: Number(nbObs),
        score:         (statut === 'termine' && score) ? Number(score) : null,
      };

      const res: any = await api.post('/audits', payload);
      const saved = res?.data ?? res;

      const normalized: AuditItem = {
        id:           saved.id,
        reference:    saved.code,
        titre:        saved.titre,
        type:         saved.type,
        statut:       saved.statut,
        process:      saved.process_label ?? '',
        auditeur:     saved.auditeur_nom ?? '',
        date_debut:   saved.date_debut,
        date_fin:     saved.date_fin,
        score:        saved.score ?? null,
        nc_majeures:  Number(saved.nc_majeures ?? 0),
        nc_mineures:  Number(saved.nc_mineures ?? 0),
        observations: Number(saved.nb_observations ?? 0),
      };

      toast.success('Audit planifié avec succès !');
      onCreated(normalized);
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Erreur lors de la création';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background rounded-xl shadow-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-primary" />
            Planifier un audit
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" /> {error}
            </div>
          )}

          {/* Titre */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Titre de l'audit *</Label>
            <Input
              placeholder="ex: Audit Processus Pilotage PR-01"
              className="h-9 text-sm"
              value={titre}
              onChange={e => setTitre(e.target.value)}
            />
          </div>

          {/* Type + Process */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Type</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={type}
                onChange={e => setType(e.target.value)}
              >
                <option value="interne">Interne</option>
                <option value="externe">Externe</option>
                <option value="certification">Certification</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Processus</Label>
              <Input
                placeholder="ex: PR-01"
                className="h-9 text-sm"
                value={processLabel}
                onChange={e => setProcessLabel(e.target.value)}
              />
            </div>
          </div>

          {/* Auditeur */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Auditeur / Cabinet</Label>
            <Input
              placeholder="ex: Pr. Amine Benali"
              className="h-9 text-sm"
              value={auditeur}
              onChange={e => setAuditeur(e.target.value)}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Date début *</Label>
              <Input
                type="date"
                className="h-9 text-sm"
                value={dateDebut}
                onChange={e => setDateDebut(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Date fin *</Label>
              <Input
                type="date"
                className="h-9 text-sm"
                value={dateFin}
                onChange={e => setDateFin(e.target.value)}
              />
            </div>
          </div>

          {/* Statut */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Statut</Label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={statut}
              onChange={e => setStatut(e.target.value)}
            >
              <option value="planifie">Planifié</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminé</option>
              <option value="annule">Annulé</option>
            </select>
          </div>

          {/* Score (si terminé) */}
          {statut === 'termine' && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Score de conformité (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                placeholder="ex: 88"
                className="h-9 text-sm"
                value={score}
                onChange={e => setScore(e.target.value)}
              />
            </div>
          )}

          {/* NC / Observations */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">NC Majeures</Label>
              <Input
                type="number"
                min={0}
                className="h-9 text-sm"
                value={ncMaj}
                onChange={e => setNcMaj(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">NC Mineures</Label>
              <Input
                type="number"
                min={0}
                className="h-9 text-sm"
                value={ncMin}
                onChange={e => setNcMin(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Observations</Label>
              <Input
                type="number"
                min={0}
                className="h-9 text-sm"
                value={nbObs}
                onChange={e => setNbObs(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" className="flex-1 text-xs" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" size="sm" className="flex-1 text-xs gap-1" disabled={saving}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {saving ? 'Enregistrement...' : 'Planifier'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────
export default function AuditsPage() {
  const [auditList,      setAuditList]      = useState<AuditItem[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState('');
  const [selectedAudit,  setSelectedAudit]  = useState<AuditItem | null>(null);
  const [showModal,      setShowModal]      = useState(false);

  useEffect(() => {
    api.get('/audits')
      .then((res: any) => {
        const data = res?.data ?? res;
        setAuditList(data.map((a: any) => ({
          id:           a.id,
          reference:    a.code,
          titre:        a.titre,
          type:         a.type,
          statut:       a.statut ?? 'planifie',
          process:      a.process_label ?? '',
          auditeur:     a.auditeur_nom ?? '',
          date_debut:   a.date_debut,
          date_fin:     a.date_fin,
          score:        a.score ?? null,
          nc_majeures:  Number(a.nc_majeures ?? 0),
          nc_mineures:  Number(a.nc_mineures ?? 0),
          observations: Number(a.nb_observations ?? 0),
        })));
      })
      .catch(() => toast.error('Impossible de charger les audits'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = auditList.filter(a =>
    a.titre.toLowerCase().includes(search.toLowerCase()) ||
    a.reference.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total:    auditList.length,
    termine:  auditList.filter(a => a.statut === 'termine').length,
    en_cours: auditList.filter(a => a.statut === 'en_cours').length,
    planifie: auditList.filter(a => a.statut === 'planifie').length,
    nc_total: auditList.reduce((s, a) => s + a.nc_majeures + a.nc_mineures, 0),
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
        <Button size="sm" className="text-xs gap-1" onClick={() => setShowModal(true)}>
          <Plus className="h-3.5 w-3.5" /> Planifier un audit
        </Button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <PlanifierModal
            onClose={() => setShowModal(false)}
            onCreated={a => setAuditList(prev => [a, ...prev])}
          />
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total',       value: stats.total,    color: 'text-foreground' },
          { label: 'Terminés',    value: stats.termine,  color: 'text-green-600'  },
          { label: 'En cours',    value: stats.en_cours, color: 'text-blue-600'   },
          { label: 'Planifiés',   value: stats.planifie, color: 'text-gray-500'   },
          { label: 'NC détectées',value: stats.nc_total, color: 'text-red-600'    },
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
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1"
              onClick={() => downloadExport('audits', 'xlsx', 'audits.xlsx')}
            >
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground text-sm gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Chargement des audits…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm gap-2">
              <ClipboardCheck className="h-8 w-8 opacity-30" />
              <p>Aucun audit trouvé.</p>
              <Button size="sm" className="text-xs gap-1 mt-2" onClick={() => setShowModal(true)}>
                <Plus className="h-3.5 w-3.5" /> Planifier le premier audit
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(audit => {
                const s = statutStyles[audit.statut] ?? statutStyles.planifie;
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
                          <div className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5', s.dot)} />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-[10px] font-mono text-muted-foreground">{audit.reference}</span>
                              <span className={cn('text-[9px] font-semibold px-2 py-0.5 rounded border', typeStyles[audit.type] ?? 'bg-gray-100 text-gray-700')}>
                                {audit.type.toUpperCase()}
                              </span>
                              {audit.process && (
                                <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded">
                                  {audit.process}
                                </span>
                              )}
                            </div>
                            <h3 className="text-sm font-semibold">{audit.titre}</h3>
                            <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground flex-wrap">
                              {audit.auditeur && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" /> {audit.auditeur}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(audit.date_debut).toLocaleDateString('fr-MA')} →{' '}
                                {new Date(audit.date_fin).toLocaleDateString('fr-MA')}
                              </span>
                            </div>
                          </div>

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
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs gap-1 h-7"
                                onClick={() => downloadExport('audits', 'pdf', 'rapport-audits.pdf')}
                              >
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
          )}
        </TabsContent>

        {/* ── Checklist ────────────────────────────────────── */}
        <TabsContent value="checklist" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-primary" />
                    Checklist ISO 21001 — Modèle
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Grille d'évaluation standard ISO 21001
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
