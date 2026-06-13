/**
 * Non-conformités & Constats d'audit — ISO 21001 clause 10.2
 * SMART SMOE IFDL · Master IFDL · ESEF Berrechid
 */
'use client';

import { useState } from 'react';
import { downloadExport } from '@/lib/export';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileX, Plus, Search, Filter, Calendar, User,
  ChevronDown, ChevronRight, Download, X, Eye,
  CheckCircle2, AlertCircle, Star, FileText,
  Inbox, Edit2, Send,
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
const findings = [
  {
    id: 1, code: 'NC-2026-001', type: 'nc_majeure',
    description: "Absence de procédure documentée pour la maîtrise des informations documentées (ISO 21001 §7.5.3)",
    clause: '7.5.3', audit: 'AUD-2026-001', process: 'PR-03',
    responsable: 'Resp. Qualité', statut: 'en_traitement', echeance: '2026-07-15',
    avancement: 60, date_constat: '2026-03-12',
    historique: [
      { date: '2026-03-12', action: 'Constat lors audit PR-01',           auteur: 'Pr. Benali' },
      { date: '2026-03-20', action: 'Action corrective planifiée',        auteur: 'Resp. Qualité' },
      { date: '2026-04-10', action: 'Procédure rédigée v1.0',             auteur: 'Resp. Qualité' },
    ],
  },
  {
    id: 2, code: 'NC-2026-002', type: 'nc_mineure',
    description: "Le programme d'audit interne ne couvre pas tous les processus du SMOE sur l'année",
    clause: '9.2.2', audit: 'AUD-2026-001', process: 'PR-04',
    responsable: 'Coord. Qualité', statut: 'en_traitement', echeance: '2026-08-01',
    avancement: 30, date_constat: '2026-03-12',
    historique: [
      { date: '2026-03-12', action: 'Constat audit',                      auteur: 'Pr. Benali' },
      { date: '2026-03-25', action: "Révision programme audit",           auteur: 'Coord. Qualité' },
    ],
  },
  {
    id: 3, code: 'NC-2026-003', type: 'nc_majeure',
    description: "La revue de direction 2025 n'a pas été réalisée dans les délais planifiés (retard de 3 mois)",
    clause: '9.3', audit: 'AUD-2026-002', process: 'PR-01',
    responsable: 'Direction', statut: 'cloturee', echeance: '2026-04-30',
    avancement: 100, date_constat: '2026-03-20',
    historique: [
      { date: '2026-03-20', action: 'Constat audit PR-02',                auteur: 'Dr. Ouhbi' },
      { date: '2026-04-15', action: 'Revue de direction réalisée',        auteur: 'Direction' },
      { date: '2026-04-30', action: 'NC clôturée — vérifiée',             auteur: 'Coord. Qualité' },
    ],
  },
  {
    id: 4, code: 'NC-2026-004', type: 'observation',
    description: "L'indicateur de taux de satisfaction étudiant n'est pas mesuré à chaque semestre comme prévu",
    clause: '9.1.2', audit: 'AUD-2026-002', process: 'PR-04',
    responsable: 'Coord. Pédago', statut: 'ouverte', echeance: '2026-09-01',
    avancement: 0, date_constat: '2026-03-20',
    historique: [
      { date: '2026-03-20', action: 'Observation constatée',              auteur: 'Dr. Ouhbi' },
    ],
  },
  {
    id: 5, code: 'NC-2026-005', type: 'nc_mineure',
    description: "Les fiches de compétences de 30% du personnel n'ont pas été mises à jour cette année",
    clause: '7.2', audit: 'AUD-2026-002', process: 'PR-03',
    responsable: 'RH', statut: 'en_traitement', echeance: '2026-07-01',
    avancement: 70, date_constat: '2026-03-20',
    historique: [
      { date: '2026-03-20', action: 'Constat audit',                      auteur: 'Dr. Ouhbi' },
      { date: '2026-04-05', action: 'Campagne mise à jour lancée',        auteur: 'RH' },
      { date: '2026-05-20', action: '70% des fiches mises à jour',        auteur: 'RH' },
    ],
  },
  {
    id: 6, code: 'NC-2026-006', type: 'point_fort',
    description: "Excellent niveau d'implication de la direction dans le SMOE — leadership exemplaire selon §5.1",
    clause: '5.1', audit: 'AUD-2026-001', process: 'PR-01',
    responsable: '-', statut: 'cloturee', echeance: '-',
    avancement: 100, date_constat: '2026-03-12',
    historique: [
      { date: '2026-03-12', action: "Point fort identifié lors de l'audit", auteur: 'Pr. Benali' },
    ],
  },
  {
    id: 7, code: 'NC-2026-007', type: 'observation',
    description: "La communication interne sur les résultats du SMOE pourrait être améliorée (affichage, réunions)",
    clause: '7.4', audit: 'AUD-2026-003', process: 'PR-01',
    responsable: 'Coord. Comm.', statut: 'ouverte', echeance: '2026-10-01',
    avancement: 0, date_constat: '2026-06-03',
    historique: [
      { date: '2026-06-03', action: "Observation relevée en cours d'audit", auteur: 'Pr. Benali' },
    ],
  },
];

// ── Config maps ───────────────────────────────────────────────
const typeConfig: Record<string, { label: string; bg: string; border: string; icon: React.ReactNode }> = {
  nc_majeure:  { label: 'NC Majeure',   bg: 'bg-red-100 text-red-700',      border: 'border-red-200',    icon: <AlertCircle className="h-3 w-3" /> },
  nc_mineure:  { label: 'NC Mineure',   bg: 'bg-amber-100 text-amber-700',  border: 'border-amber-200',  icon: <AlertCircle className="h-3 w-3" /> },
  observation: { label: 'Observation',  bg: 'bg-blue-100 text-blue-700',    border: 'border-blue-200',   icon: <Eye className="h-3 w-3" /> },
  point_fort:  { label: 'Point fort',   bg: 'bg-green-100 text-green-700',  border: 'border-green-200',  icon: <Star className="h-3 w-3" /> },
};

const statutConfig: Record<string, { label: string; badge: string; dot: string }> = {
  ouverte:      { label: 'Ouverte',      badge: 'bg-red-100 text-red-700',       dot: 'bg-red-500' },
  en_traitement:{ label: 'En traitement', badge: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-500' },
  cloturee:     { label: 'Clôturée',     badge: 'bg-green-100 text-green-700',   dot: 'bg-green-500' },
  verifiee:     { label: 'Vérifiée',     badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
};

const tabFilters: Record<string, string[]> = {
  tous:          [],
  ouvertes:      ['ouverte'],
  en_traitement: ['en_traitement'],
  cloturees:     ['cloturee', 'verifiee'],
};

// ── Add Finding Form (Modal) ───────────────────────────────────
function AddFindingForm({ onClose, onAdd }: { onClose: () => void; onAdd: (f: any) => void }) {
  const [type, setType] = useState('nc_majeure');
  const [clause, setClause] = useState('');
  const [description, setDescription] = useState('');
  const [audit, setAudit] = useState('AUD-2026-001');
  const [process, setProcess] = useState('PR-01');
  const [responsable, setResponsable] = useState('');
  const [echeance, setEcheance] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!description.trim() || !clause.trim()) { setError('La description et la clause sont requises.'); return; }
    setLoading(true); setError('');
    try {
      const nextId = Date.now();
      const code = `NC-${new Date().getFullYear()}-${String(nextId).slice(-3)}`;
      const { data } = await api.post('/findings', {
        code, type, clause, description, audit, process,
        responsable: responsable || null, statut: 'ouverte',
        echeance: echeance || null, avancement: 0,
        date_constat: new Date().toISOString().slice(0, 10),
        historique: [],
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
        className="bg-card border border-border rounded-xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold">Nouveau constat d&apos;audit</h3>
            <p className="text-xs text-muted-foreground">ISO 21001 §10.2 · Master IFDL · ESEF Berrechid</p>
          </div>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Type de constat *</Label>
              <select className="w-full h-9 rounded-lg border border-input bg-background text-xs px-3" value={type} onChange={e => setType(e.target.value)}>
                <option value="nc_majeure">NC Majeure</option>
                <option value="nc_mineure">NC Mineure</option>
                <option value="observation">Observation</option>
                <option value="point_fort">Point fort</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Clause ISO concernée *</Label>
              <Input placeholder="ex. 7.5.3" className="h-9 text-sm" value={clause} onChange={e => setClause(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Description du constat *</Label>
            <textarea
              className="w-full h-24 rounded-lg border border-input bg-background text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Décrivez précisément le constat, les éléments de preuve, l'écart par rapport à la norme..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Audit source</Label>
              <select className="w-full h-9 rounded-lg border border-input bg-background text-xs px-3" value={audit} onChange={e => setAudit(e.target.value)}>
                <option>AUD-2026-001</option>
                <option>AUD-2026-002</option>
                <option>AUD-2026-003</option>
                <option>AUD-2026-004</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Processus concerné</Label>
              <select className="w-full h-9 rounded-lg border border-input bg-background text-xs px-3" value={process} onChange={e => setProcess(e.target.value)}>
                <option value="PR-01">PR-01 — Pilotage</option>
                <option value="PR-02">PR-02 — Réalisation pédagogique</option>
                <option value="PR-03">PR-03 — Support</option>
                <option value="PR-04">PR-04 — Évaluation</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Responsable</Label>
              <Input placeholder="Nom / fonction..." className="h-9 text-sm" value={responsable} onChange={e => setResponsable(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Échéance</Label>
              <Input type="date" className="h-9 text-sm" value={echeance} onChange={e => setEcheance(e.target.value)} />
            </div>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={onClose}>Annuler</Button>
            <Button size="sm" className="flex-1 h-8 text-xs gap-1" onClick={handleSubmit} disabled={loading}>
              <Send className="h-3 w-3" /> {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function FindingsPage() {
  const [search, setSearch]       = useState('');
  const [activeTab, setActiveTab] = useState('tous');
  const [showForm, setShowForm]   = useState(false);
  const [selected, setSelected]   = useState<typeof findings[0] | null>(null);
  const [expanded, setExpanded]   = useState<number | null>(null);
  const [findingList, setFindingList] = useState(findings);
  const handleAdd = (f: any) => setFindingList(prev => [f, ...prev]);

  const clotureCount = findingList.filter(f => ['cloturee', 'verifiee'].includes(f.statut)).length;
  const tauxCloture  = Math.round((clotureCount / findingList.length) * 100);

  const stats = {
    total:       findingList.length,
    nc_majeures: findingList.filter(f => f.type === 'nc_majeure').length,
    nc_mineures: findingList.filter(f => f.type === 'nc_mineure').length,
    observations:findingList.filter(f => f.type === 'observation').length,
    tauxCloture,
  };

  const filtered = findingList.filter(f => {
    const statutFilter = tabFilters[activeTab];
    const matchStatut  = !statutFilter?.length || statutFilter.includes(f.statut);
    const matchSearch  =
      f.description.toLowerCase().includes(search.toLowerCase()) ||
      f.code.toLowerCase().includes(search.toLowerCase()) ||
      f.clause.toLowerCase().includes(search.toLowerCase());
    return matchStatut && matchSearch;
  });

  return (
    <div className="page-container animate-fade-up">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <FileX className="h-6 w-6 text-primary" />
            Non-conformités &amp; Constats
          </h1>
          <p className="page-subtitle">
            Constats d&apos;audit · Actions correctives · Suivi · ISO 21001 §10.2 · Master IFDL
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1"
            onClick={() => downloadExport('findings', 'xlsx', 'constats.xlsx')}
          >
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button size="sm" className="text-xs gap-1" onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5" /> Nouveau constat
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total',          value: stats.total,        color: 'text-foreground' },
          { label: 'NC Majeures',    value: stats.nc_majeures,  color: 'text-red-600' },
          { label: 'NC Mineures',    value: stats.nc_mineures,  color: 'text-amber-600' },
          { label: 'Observations',   value: stats.observations, color: 'text-blue-600' },
          { label: 'Taux clôture',   value: `${stats.tauxCloture}%`, color: tauxCloture >= 60 ? 'text-green-600' : 'text-amber-600' },
        ].map(s => (
          <Card key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Tabs + content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center gap-3 flex-wrap">
          <TabsList className="h-9">
            <TabsTrigger value="tous"          className="text-xs">Tous</TabsTrigger>
            <TabsTrigger value="ouvertes"      className="text-xs">Ouvertes</TabsTrigger>
            <TabsTrigger value="en_traitement" className="text-xs">En traitement</TabsTrigger>
            <TabsTrigger value="cloturees"     className="text-xs">Clôturées</TabsTrigger>
          </TabsList>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="pl-9 h-8 text-xs"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
            <Filter className="h-3.5 w-3.5" /> Filtrer
          </Button>
        </div>

        {/* All tabs share the same list+detail layout */}
        {['tous', 'ouvertes', 'en_traitement', 'cloturees'].map(tab => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

              {/* List */}
              <div className="xl:col-span-2 space-y-2">
                {filtered.length === 0 && (
                  <Card className="border-dashed">
                    <CardContent className="py-10 text-center">
                      <CheckCircle2 className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">Aucun constat dans cette catégorie</p>
                    </CardContent>
                  </Card>
                )}

                {filtered.map(f => {
                  const typeCfg  = typeConfig[f.type]  ?? typeConfig.observation;
                  const statCfg  = statutConfig[f.statut] ?? statutConfig.ouverte;
                  const isOpen   = expanded === f.id;
                  const isSelected = selected?.id === f.id;

                  return (
                    <motion.div key={f.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Card
                        className={cn(
                          'overflow-hidden hover:shadow-md transition-all',
                          isSelected && 'ring-2 ring-primary/30'
                        )}
                      >
                        <CardContent className="p-0">
                          {/* Main row — click to select detail panel */}
                          <button
                            className="w-full text-left p-4"
                            onClick={() => setSelected(isSelected ? null : f)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn('w-2 h-2 rounded-full flex-shrink-0 mt-2', statCfg.dot)} />

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="text-[10px] font-mono text-muted-foreground">{f.code}</span>
                                  <span className={cn('text-[9px] font-semibold px-2 py-0.5 rounded border flex items-center gap-1', typeCfg.bg, typeCfg.border)}>
                                    {typeCfg.icon}{typeCfg.label}
                                  </span>
                                  <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">§{f.clause}</span>
                                  <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-medium">{f.process}</span>
                                </div>

                                <p className="text-sm font-medium leading-snug">{f.description}</p>

                                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground flex-wrap">
                                  <span className="flex items-center gap-1"><FileText className="h-2.5 w-2.5" />{f.audit}</span>
                                  {f.responsable !== '-' && (
                                    <span className="flex items-center gap-1"><User className="h-2.5 w-2.5" />{f.responsable}</span>
                                  )}
                                  {f.echeance !== '-' && (
                                    <span className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5" />{new Date(f.echeance).toLocaleDateString('fr-MA')}</span>
                                  )}
                                </div>

                                {/* Progress bar (if in treatment) */}
                                {f.statut === 'en_traitement' && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[120px]">
                                      <div
                                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                        style={{ width: `${f.avancement}%` }}
                                      />
                                    </div>
                                    <span className="text-[10px] text-amber-600 font-semibold">{f.avancement}%</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', statCfg.badge)}>
                                  {statCfg.label}
                                </span>
                                <button
                                  className="p-0.5 hover:bg-muted rounded"
                                  onClick={e => { e.stopPropagation(); setExpanded(isOpen ? null : f.id); }}
                                >
                                  {isOpen
                                    ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                    : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                                  }
                                </button>
                              </div>
                            </div>
                          </button>

                          {/* Expandable historique */}
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-border overflow-hidden"
                              >
                                <div className="p-4 bg-muted/20 space-y-3">
                                  <p className="text-xs font-semibold">Historique</p>
                                  <div className="space-y-2">
                                    {f.historique.map((h, i) => (
                                      <div key={i} className="flex gap-2 text-xs">
                                        <div className="flex flex-col items-center">
                                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-0.5" />
                                          {i < f.historique.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                                        </div>
                                        <div className="pb-1.5">
                                          <p className="font-medium">{h.action}</p>
                                          <p className="text-muted-foreground text-[10px]">{h.auteur} · {new Date(h.date).toLocaleDateString('fr-MA')}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="flex gap-2 pt-1">
                                    <Button size="sm" variant="outline" className="text-xs gap-1 h-7">
                                      <Edit2 className="h-3 w-3" /> Modifier
                                    </Button>
                                    {f.statut === 'ouverte' && (
                                      <Button size="sm" className="text-xs gap-1 h-7">
                                        <Send className="h-3 w-3" /> Traiter
                                      </Button>
                                    )}
                                    {f.statut === 'en_traitement' && (
                                      <Button size="sm" className="text-xs gap-1 h-7">
                                        <CheckCircle2 className="h-3 w-3" /> Clôturer
                                      </Button>
                                    )}
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

              {/* Detail Panel */}
              <div>
                <AnimatePresence mode="wait">
                  {selected ? (
                    <motion.div key={selected.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                      <Card className="sticky top-6">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold">Détail du constat</CardTitle>
                            <button onClick={() => setSelected(null)}><X className="h-4 w-4 text-muted-foreground" /></button>
                          </div>
                          <p className="text-xs font-mono text-muted-foreground">{selected.code}</p>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Type badge */}
                          <div className="flex items-center gap-2">
                            {(() => {
                              const t = typeConfig[selected.type] ?? typeConfig.observation;
                              return (
                                <span className={cn('text-[10px] font-semibold px-2 py-1 rounded border flex items-center gap-1', t.bg, t.border)}>
                                  {t.icon}{t.label}
                                </span>
                              );
                            })()}
                            <span className={cn('text-[10px] font-semibold px-2 py-1 rounded-full', statutConfig[selected.statut]?.badge)}>
                              {statutConfig[selected.statut]?.label}
                            </span>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{selected.description}</p>
                          </div>

                          {/* Progress */}
                          {selected.avancement > 0 && selected.avancement < 100 && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-muted-foreground">Avancement</span>
                                <span className="font-semibold text-amber-600">{selected.avancement}%</span>
                              </div>
                              <Progress value={selected.avancement} className="h-1.5" />
                            </div>
                          )}

                          <Separator />

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {[
                              { label: 'Clause ISO', value: `§${selected.clause}` },
                              { label: 'Audit',      value: selected.audit },
                              { label: 'Processus',  value: selected.process },
                              { label: 'Responsable', value: selected.responsable },
                              { label: 'Constat le', value: new Date(selected.date_constat).toLocaleDateString('fr-MA') },
                              { label: 'Échéance',   value: selected.echeance === '-' ? '-' : new Date(selected.echeance).toLocaleDateString('fr-MA') },
                            ].map(item => (
                              <div key={item.label} className="bg-muted/40 rounded px-2 py-1.5">
                                <p className="text-muted-foreground text-[10px]">{item.label}</p>
                                <p className="font-semibold">{item.value}</p>
                              </div>
                            ))}
                          </div>

                          <Separator />

                          <div>
                            <p className="text-xs font-semibold mb-2">Historique du traitement</p>
                            <div className="space-y-2">
                              {selected.historique.map((h, i) => (
                                <div key={i} className="flex gap-2 text-xs">
                                  <div className="flex flex-col items-center">
                                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-0.5" />
                                    {i < selected.historique.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                                  </div>
                                  <div className="pb-2">
                                    <p className="font-medium">{h.action}</p>
                                    <p className="text-muted-foreground text-[10px]">{h.auteur} · {new Date(h.date).toLocaleDateString('fr-MA')}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {selected.statut === 'ouverte' && (
                              <Button size="sm" className="flex-1 text-xs gap-1 h-7">
                                <Send className="h-3 w-3" /> Traiter
                              </Button>
                            )}
                            {selected.statut === 'en_traitement' && (
                              <Button size="sm" className="flex-1 text-xs gap-1 h-7">
                                <CheckCircle2 className="h-3 w-3" /> Clôturer
                              </Button>
                            )}
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 px-2">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Card className="border-dashed">
                        <CardContent className="py-12 text-center">
                          <Inbox className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                          <p className="text-sm text-muted-foreground">Sélectionnez un constat pour voir les détails</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </TabsContent>
        ))}
      </Tabs>

      <AnimatePresence>
        {showForm && <AddFindingForm onClose={() => setShowForm(false)} onAdd={handleAdd} />}
      </AnimatePresence>
    </div>
  );
}
