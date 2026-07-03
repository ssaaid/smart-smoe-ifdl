/**
 * Audits Internes — Programme & Checklists ISO 21001
 * SALHY Abdelilah SMART SMOE MASTER
 */
'use client';

import { useState, useEffect } from 'react';
import { downloadExport } from '@/lib/export';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardCheck, Plus, Search, Filter, Calendar, User,
  CheckSquare, Square, AlertCircle, Download, Eye, Edit2,
  Play, Check, X, FileText, Save, Loader2, Shield,
  TrendingUp, TrendingDown, Minus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

// ISO 21001 Checklist
const checklistItems = [
  { clause: '4.1',  titre: "L'organisme détermine son contexte interne et externe",               checked: true,  finding: null },
  { clause: '4.2',  titre: 'Les parties intéressées pertinentes sont identifiées',                checked: true,  finding: null },
  { clause: '4.3',  titre: "Le domaine d'application du SMOE est défini et documenté",            checked: true,  finding: null },
  { clause: '5.1',  titre: 'La direction démontre son leadership et son engagement',              checked: true,  finding: null },
  { clause: '5.2',  titre: 'La politique qualité est établie, documentée et communiquée',         checked: true,  finding: null },
  { clause: '6.1',  titre: 'Les risques et opportunités sont identifiés et traités',              checked: false, finding: 'NC-Mineure' },
  { clause: '6.2',  titre: 'Les objectifs qualité sont mesurables et suivis',                    checked: true,  finding: null },
  { clause: '7.1',  titre: 'Les ressources nécessaires sont déterminées et fournies',             checked: false, finding: 'Observation' },
  { clause: '7.2',  titre: 'Les compétences du personnel sont déterminées et évaluées',          checked: true,  finding: null },
  { clause: '7.5',  titre: 'Les informations documentées sont maîtrisées',                       checked: true,  finding: null },
  { clause: '8.1',  titre: 'Les activités opérationnelles sont planifiées et maîtrisées',        checked: true,  finding: null },
  { clause: '9.1',  titre: 'La surveillance et la mesure des performances sont réalisées',       checked: true,  finding: null },
  { clause: '9.2',  titre: "Le programme d'audit interne est établi et mis en œuvre",            checked: false, finding: 'NC-Majeure' },
  { clause: '9.3',  titre: 'La revue de direction est réalisée à intervalles planifiés',         checked: false, finding: 'NC-Mineure' },
  { clause: '10.1', titre: 'Les non-conformités sont traitées et les actions correctives mises', checked: true,  finding: null },
  { clause: '10.2', titre: "L'amélioration continue est démontrée",                              checked: false, finding: 'Observation' },
];

// ── Helpers ────────────────────────────────────────────────────
const statutStyles: Record<string, { badge: string; dot: string; label: string }> = {
  planifie: { badge: 'bg-gray-100 text-gray-700',   dot: 'bg-gray-400',  label: 'Planifié' },
  en_cours: { badge: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500',  label: 'En cours' },
  termine:  { badge: 'bg-green-100 text-green-700', dot: 'bg-green-500', label: 'Terminé'  },
  annule:   { badge: 'bg-red-100 text-red-700',     dot: 'bg-red-500',   label: 'Annulé'   },
};

const typeStyles: Record<string, string> = {
  interne:       'bg-blue-50 text-blue-700 border-blue-200',
  externe:       'bg-purple-50 text-purple-700 border-purple-200',
  certification: 'bg-amber-50 text-amber-700 border-amber-200',
};

function normalize(a: any): AuditItem {
  return {
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
  };
}

function FindingBadge({ type }: { type: string | null }) {
  if (!type) return <Check className="h-3.5 w-3.5 text-green-500" />;
  if (type === 'NC-Majeure') return <Badge className="text-[9px] h-4 bg-red-100 text-red-700 border-0">NC Maj.</Badge>;
  if (type === 'NC-Mineure') return <Badge className="text-[9px] h-4 bg-amber-100 text-amber-700 border-0">NC Min.</Badge>;
  return <Badge className="text-[9px] h-4 bg-blue-100 text-blue-700 border-0">Obs.</Badge>;
}

// ── Shared Modal Shell ─────────────────────────────────────────
function ModalShell({ title, icon: Icon, onClose, children }: {
  title: string; icon: any; onClose: () => void; children: React.ReactNode;
}) {
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
            <Icon className="h-4 w-4 text-primary" />
            {title}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

// ── Audit Form (shared by Planifier + Modifier) ────────────────
function AuditForm({
  initial,
  submitLabel,
  onSubmit,
  onClose,
}: {
  initial?: Partial<AuditItem & { score_str: string; ncMaj: string; ncMin: string; nbObs: string }>;
  submitLabel: string;
  onSubmit: (payload: any) => Promise<void>;
  onClose: () => void;
}) {
  const [titre,        setTitre]        = useState(initial?.titre        ?? '');
  const [type,         setType]         = useState(initial?.type         ?? 'interne');
  const [processLabel, setProcessLabel] = useState(initial?.process      ?? '');
  const [auditeur,     setAuditeur]     = useState(initial?.auditeur     ?? '');
  const [dateDebut,    setDateDebut]    = useState(
    initial?.date_debut ? initial.date_debut.slice(0, 10) : ''
  );
  const [dateFin,      setDateFin]      = useState(
    initial?.date_fin ? initial.date_fin.slice(0, 10) : ''
  );
  const [statut,       setStatut]       = useState(initial?.statut       ?? 'planifie');
  const [score,        setScore]        = useState(initial?.score != null ? String(initial.score) : '');
  const [ncMaj,        setNcMaj]        = useState(String(initial?.nc_majeures  ?? 0));
  const [ncMin,        setNcMin]        = useState(String(initial?.nc_mineures  ?? 0));
  const [nbObs,        setNbObs]        = useState(String(initial?.observations ?? 0));
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
      await onSubmit({
        titre,
        type,
        statut,
        date_debut:      new Date(dateDebut).toISOString(),
        date_fin:        new Date(dateFin).toISOString(),
        process_label:   processLabel || null,
        auditeur_nom:    auditeur || null,
        nc_majeures:     Number(ncMaj),
        nc_mineures:     Number(ncMin),
        nb_observations: Number(nbObs),
        score:           (statut === 'termine' && score) ? Number(score) : null,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Erreur lors de l\'enregistrement';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 text-red-700 text-xs">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" /> {error}
        </div>
      )}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Titre de l'audit *</Label>
        <Input placeholder="ex: Audit Processus Pilotage PR-01" className="h-9 text-sm"
          value={titre} onChange={e => setTitre(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Type</Label>
          <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={type} onChange={e => setType(e.target.value)}>
            <option value="interne">Interne</option>
            <option value="externe">Externe</option>
            <option value="certification">Certification</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Processus</Label>
          <Input placeholder="ex: PR-01" className="h-9 text-sm"
            value={processLabel} onChange={e => setProcessLabel(e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Auditeur / Cabinet</Label>
        <Input placeholder="ex: Pr. Amine Benali" className="h-9 text-sm"
          value={auditeur} onChange={e => setAuditeur(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Date début *</Label>
          <Input type="date" className="h-9 text-sm"
            value={dateDebut} onChange={e => setDateDebut(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Date fin *</Label>
          <Input type="date" className="h-9 text-sm"
            value={dateFin} onChange={e => setDateFin(e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Statut</Label>
        <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={statut} onChange={e => setStatut(e.target.value)}>
          <option value="planifie">Planifié</option>
          <option value="en_cours">En cours</option>
          <option value="termine">Terminé</option>
          <option value="annule">Annulé</option>
        </select>
      </div>
      {statut === 'termine' && (
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Score de conformité (%)</Label>
          <Input type="number" min={0} max={100} placeholder="ex: 88" className="h-9 text-sm"
            value={score} onChange={e => setScore(e.target.value)} />
        </div>
      )}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">NC Majeures</Label>
          <Input type="number" min={0} className="h-9 text-sm"
            value={ncMaj} onChange={e => setNcMaj(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">NC Mineures</Label>
          <Input type="number" min={0} className="h-9 text-sm"
            value={ncMin} onChange={e => setNcMin(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Observations</Label>
          <Input type="number" min={0} className="h-9 text-sm"
            value={nbObs} onChange={e => setNbObs(e.target.value)} />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" className="flex-1 text-xs" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" size="sm" className="flex-1 text-xs gap-1" disabled={saving}>
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {saving ? 'Enregistrement...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}

// ── Voir Rapport Modal ─────────────────────────────────────────
function RapportModal({ audit, onClose }: { audit: AuditItem; onClose: () => void }) {
  const s = statutStyles[audit.statut] ?? statutStyles.planifie;
  const scoreColor = audit.score == null ? '' :
    audit.score >= 85 ? 'text-green-600' :
    audit.score >= 75 ? 'text-amber-600' : 'text-red-600';
  const total = audit.nc_majeures + audit.nc_mineures + audit.observations;

  return (
    <ModalShell title={`Rapport — ${audit.reference}`} icon={Eye} onClose={onClose}>
      <div className="p-6 space-y-5">
        {/* Header info */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">{audit.titre}</h3>
          <div className="flex flex-wrap gap-2 items-center">
            <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', s.badge)}>{s.label}</span>
            <span className={cn('text-[9px] font-semibold px-2 py-0.5 rounded border',
              typeStyles[audit.type] ?? 'bg-gray-100 text-gray-700')}>
              {audit.type.toUpperCase()}
            </span>
            {audit.process && (
              <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded">
                {audit.process}
              </span>
            )}
          </div>
        </div>

        <Separator />

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          {audit.auditeur && (
            <div>
              <p className="text-muted-foreground mb-0.5">Auditeur</p>
              <p className="font-medium flex items-center gap-1"><User className="h-3 w-3" />{audit.auditeur}</p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground mb-0.5">Période</p>
            <p className="font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(audit.date_debut).toLocaleDateString('fr-MA')} → {new Date(audit.date_fin).toLocaleDateString('fr-MA')}
            </p>
          </div>
        </div>

        {/* Score */}
        {audit.score !== null && (
          <>
            <Separator />
            <div className="text-center py-2">
              <p className="text-xs text-muted-foreground mb-1">Score de conformité</p>
              <p className={cn('text-4xl font-bold', scoreColor)}>{audit.score}%</p>
              <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', audit.score >= 85 ? 'bg-green-500' : audit.score >= 75 ? 'bg-amber-500' : 'bg-red-500')}
                  style={{ width: `${audit.score}%` }}
                />
              </div>
            </div>
          </>
        )}

        {/* Constats summary */}
        {total > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground mb-3">Récapitulatif des constats</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100">
                  <p className="text-2xl font-bold text-red-600">{audit.nc_majeures}</p>
                  <p className="text-[10px] text-red-600 font-medium mt-0.5">NC Majeures</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-100">
                  <p className="text-2xl font-bold text-amber-600">{audit.nc_mineures}</p>
                  <p className="text-[10px] text-amber-600 font-medium mt-0.5">NC Mineures</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-100">
                  <p className="text-2xl font-bold text-blue-600">{audit.observations}</p>
                  <p className="text-[10px] text-blue-600 font-medium mt-0.5">Observations</p>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={onClose}>Fermer</Button>
          <Button size="sm" className="flex-1 text-xs gap-1"
            onClick={() => downloadExport('audits', 'pdf', `rapport-${audit.reference}.pdf`)}>
            <Download className="h-3.5 w-3.5" /> Télécharger PDF
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}

// ── Constats Modal ─────────────────────────────────────────────
function ConstatsModal({ audit, onClose }: { audit: AuditItem; onClose: () => void }) {
  const constats: { type: string; clauseISO: string; description: string }[] = [];

  for (let i = 0; i < audit.nc_majeures; i++) {
    constats.push({ type: 'NC-Majeure', clauseISO: '9.2', description: `Non-conformité majeure #${i + 1} — Programme d'audit non entièrement mis en œuvre` });
  }
  for (let i = 0; i < audit.nc_mineures; i++) {
    constats.push({ type: 'NC-Mineure', clauseISO: i === 0 ? '6.1' : '9.3',
      description: i === 0
        ? `Non-conformité mineure #${i + 1} — Risques et opportunités non totalement traités`
        : `Non-conformité mineure #${i + 1} — Revue de direction non réalisée à l'intervalle planifié` });
  }
  for (let i = 0; i < audit.observations; i++) {
    constats.push({ type: 'Observation', clauseISO: i === 0 ? '7.1' : '10.2',
      description: i === 0
        ? `Observation #${i + 1} — Ressources documentaires à compléter`
        : `Observation #${i + 1} — Preuves d'amélioration continue à renforcer` });
  }

  return (
    <ModalShell title={`Constats — ${audit.reference}`} icon={FileText} onClose={onClose}>
      <div className="p-6 space-y-4">
        {constats.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
            Aucun constat — audit conforme
          </div>
        ) : (
          <div className="space-y-2">
            {constats.map((c, i) => (
              <div key={i} className={cn(
                'p-3 rounded-lg border text-xs',
                c.type === 'NC-Majeure' ? 'bg-red-50 dark:bg-red-950/20 border-red-200' :
                c.type === 'NC-Mineure' ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200' :
                'bg-blue-50 dark:bg-blue-950/20 border-blue-200'
              )}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn('font-bold text-[10px]',
                    c.type === 'NC-Majeure' ? 'text-red-600' :
                    c.type === 'NC-Mineure' ? 'text-amber-600' : 'text-blue-600')}>
                    {c.type}
                  </span>
                  <span className="text-muted-foreground font-mono">§{c.clauseISO}</span>
                </div>
                <p className="text-foreground">{c.description}</p>
              </div>
            ))}
          </div>
        )}
        <Button variant="outline" size="sm" className="w-full text-xs" onClick={onClose}>Fermer</Button>
      </div>
    </ModalShell>
  );
}

// ── Page ───────────────────────────────────────────────────────
export default function AuditsPage() {
  const [auditList,     setAuditList]     = useState<AuditItem[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [selectedAudit, setSelectedAudit] = useState<AuditItem | null>(null);
  const [showPlanifier, setShowPlanifier] = useState(false);
  const [editAudit,     setEditAudit]     = useState<AuditItem | null>(null);
  const [rapportAudit,  setRapportAudit]  = useState<AuditItem | null>(null);
  const [constatsAudit, setConstatsAudit] = useState<AuditItem | null>(null);

  useEffect(() => {
    api.get('/audits')
      .then((res: any) => {
        const data = res?.data ?? res;
        setAuditList(data.map(normalize));
      })
      .catch(() => toast.error('Impossible de charger les audits'))
      .finally(() => setLoading(false));
  }, []);

  const handleDemarrer = async (audit: AuditItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res: any = await api.patch(`/audits/${audit.id}`, { statut: 'en_cours' });
      const saved = res?.data ?? res;
      setAuditList(prev => prev.map(a => a.id === audit.id ? normalize(saved) : a));
      setSelectedAudit(prev => prev?.id === audit.id ? normalize(saved) : prev);
      toast.success('Audit démarré !');
    } catch {
      toast.error('Erreur lors du démarrage');
    }
  };

  const handleUpdate = async (audit: AuditItem, payload: any) => {
    const res: any = await api.patch(`/audits/${audit.id}`, payload);
    const saved = res?.data ?? res;
    const updated = normalize(saved);
    setAuditList(prev => prev.map(a => a.id === audit.id ? updated : a));
    setSelectedAudit(prev => prev?.id === audit.id ? updated : prev);
    toast.success('Audit modifié !');
    setEditAudit(null);
  };

  const handleCreate = async (payload: any) => {
    const year = new Date(payload.date_debut).getFullYear();
    const code = `AUD-${year}-${Date.now().toString().slice(-3)}`;
    const res: any = await api.post('/audits', { ...payload, code });
    const saved = res?.data ?? res;
    setAuditList(prev => [normalize(saved), ...prev]);
    toast.success('Audit planifié avec succès !');
    setShowPlanifier(false);
  };

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
          <p className="page-subtitle">Programme d'audit · Checklists ISO 21001 · Constats · Rapports</p>
        </div>
        <Button size="sm" className="text-xs gap-1" onClick={() => setShowPlanifier(true)}>
          <Plus className="h-3.5 w-3.5" /> Planifier un audit
        </Button>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showPlanifier && (
          <ModalShell title="Planifier un audit" icon={ClipboardCheck} onClose={() => setShowPlanifier(false)}>
            <AuditForm submitLabel="Planifier" onClose={() => setShowPlanifier(false)} onSubmit={handleCreate} />
          </ModalShell>
        )}
        {editAudit && (
          <ModalShell title={`Modifier — ${editAudit.reference}`} icon={Edit2} onClose={() => setEditAudit(null)}>
            <AuditForm
              initial={editAudit}
              submitLabel="Enregistrer"
              onClose={() => setEditAudit(null)}
              onSubmit={payload => handleUpdate(editAudit, payload)}
            />
          </ModalShell>
        )}
        {rapportAudit && (
          <RapportModal audit={rapportAudit} onClose={() => setRapportAudit(null)} />
        )}
        {constatsAudit && (
          <ConstatsModal audit={constatsAudit} onClose={() => setConstatsAudit(null)} />
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total',        value: stats.total,    color: 'text-foreground' },
          { label: 'Terminés',     value: stats.termine,  color: 'text-green-600'  },
          { label: 'En cours',     value: stats.en_cours, color: 'text-blue-600'   },
          { label: 'Planifiés',    value: stats.planifie, color: 'text-gray-500'   },
          { label: 'NC détectées', value: stats.nc_total, color: 'text-red-600'    },
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
              <Input placeholder="Rechercher un audit..." className="pl-9 h-8 text-xs"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
              <Filter className="h-3.5 w-3.5" /> Filtrer
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1"
              onClick={() => downloadExport('audits', 'xlsx', 'audits.xlsx')}>
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
              <Button size="sm" className="text-xs gap-1 mt-2" onClick={() => setShowPlanifier(true)}>
                <Plus className="h-3.5 w-3.5" /> Planifier le premier audit
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(audit => {
                const s = statutStyles[audit.statut] ?? statutStyles.planifie;
                const isOpen = selectedAudit?.id === audit.id;
                return (
                  <motion.div key={audit.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} layout>
                    <Card className={cn('overflow-hidden hover:shadow-md transition-all cursor-pointer', isOpen && 'ring-2 ring-primary/30')}
                      onClick={() => setSelectedAudit(isOpen ? null : audit)}>
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
                                <span className="flex items-center gap-1"><User className="h-3 w-3" />{audit.auditeur}</span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(audit.date_debut).toLocaleDateString('fr-MA')} → {new Date(audit.date_fin).toLocaleDateString('fr-MA')}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', s.badge)}>{s.label}</span>
                            {audit.score !== null && (
                              <span className={cn('text-lg font-bold',
                                audit.score >= 85 ? 'text-green-600' : audit.score >= 75 ? 'text-amber-600' : 'text-red-600')}>
                                {audit.score}%
                              </span>
                            )}
                            <div className="flex gap-3 text-xs">
                              {audit.nc_majeures > 0 && <span className="text-red-600 font-semibold">{audit.nc_majeures} NC Maj.</span>}
                              {audit.nc_mineures > 0 && <span className="text-amber-600 font-semibold">{audit.nc_mineures} NC Min.</span>}
                              {audit.observations > 0 && <span className="text-blue-600 font-semibold">{audit.observations} Obs.</span>}
                            </div>
                          </div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-border overflow-hidden"
                          >
                            <div className="p-4 bg-muted/20 flex flex-wrap gap-2" onClick={e => e.stopPropagation()}>
                              <Button size="sm" className="text-xs gap-1 h-7"
                                onClick={() => setRapportAudit(audit)}>
                                <Eye className="h-3 w-3" /> Voir rapport
                              </Button>
                              {audit.statut === 'planifie' && (
                                <Button size="sm" variant="outline" className="text-xs gap-1 h-7"
                                  onClick={e => handleDemarrer(audit, e)}>
                                  <Play className="h-3 w-3 text-green-600" /> Démarrer
                                </Button>
                              )}
                              <Button size="sm" variant="outline" className="text-xs gap-1 h-7"
                                onClick={() => setEditAudit(audit)}>
                                <Edit2 className="h-3 w-3" /> Modifier
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs gap-1 h-7"
                                onClick={() => setConstatsAudit(audit)}>
                                <FileText className="h-3 w-3" /> Constats ({audit.nc_majeures + audit.nc_mineures + audit.observations})
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs gap-1 h-7"
                                onClick={() => downloadExport('audits', 'pdf', `rapport-${audit.reference}.pdf`)}>
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
                  <p className="text-xs text-muted-foreground mt-0.5">Grille d'évaluation standard ISO 21001</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {checklistItems.filter(i => i.checked).length}/{checklistItems.length}
                  </span>
                  <div className="w-24 progress-track">
                    <div className="progress-fill bg-primary"
                      style={{ width: `${(checklistItems.filter(i => i.checked).length / checklistItems.length) * 100}%` }} />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {checklistItems.map((item, i) => (
                <motion.div key={item.clause}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className={cn(
                    'flex items-center gap-3 p-2.5 rounded-lg border transition-colors cursor-pointer hover:bg-muted/30',
                    item.checked ? 'bg-green-50/50 dark:bg-green-950/20 border-green-100 dark:border-green-900/30' : 'bg-card border-border',
                    item.finding === 'NC-Majeure' && 'bg-red-50/50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30'
                  )}>
                  {item.checked
                    ? <CheckSquare className="h-4 w-4 text-green-500 flex-shrink-0" />
                    : <Square className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                  <span className="text-xs font-mono text-muted-foreground w-8 flex-shrink-0">§{item.clause}</span>
                  <span className="text-xs flex-1">{item.titre}</span>
                  <FindingBadge type={item.finding} />
                </motion.div>
              ))}
              <Separator className="my-3" />
              <div className="flex items-center justify-between">
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-green-500" />{checklistItems.filter(i => i.checked).length} conformes</span>
                  <span className="flex items-center gap-1.5"><X className="h-3 w-3 text-red-500" />{checklistItems.filter(i => !i.checked).length} à vérifier</span>
                  <span className="flex items-center gap-1.5"><AlertCircle className="h-3 w-3 text-amber-500" />{checklistItems.filter(i => i.finding).length} constats</span>
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
