/**
 * Gestion Documentaire GED — ISO 21001 clause 7.5
 * SMART SMOE IFDL · ESEF Berrechid · Master IFDL
 */
'use client';

import { useState, useMemo } from 'react';
import { downloadExport } from '@/lib/export';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen, Plus, Search, Filter, Eye, Download, Edit2,
  X, FileText, AlertTriangle, CheckCircle2, Clock, Upload,
  BookOpen, Settings, ClipboardList, FileCheck, BarChart2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// ── Mock data ──────────────────────────────────────────────────────────────
const documents = [
  { id: 1,  reference: 'PR-QUA-001', titre: 'Manuel Qualité SMOE IFDL',                type: 'procedure',    version: '3.2', statut: 'approuve',   process: 'PR-01', auteur: 'Resp. Qualité',  date_approbation: '2025-09-01',  date_revision: '2026-09-01',  file_url: '#' },
  { id: 2,  reference: 'PR-PED-001', titre: 'Procédure Conception Pédagogique',         type: 'procedure',    version: '2.1', statut: 'approuve',   process: 'PR-02', auteur: 'Coord. Pédago', date_approbation: '2025-11-15',  date_revision: '2026-11-15',  file_url: '#' },
  { id: 3,  reference: 'IN-EVA-001', titre: 'Instruction Évaluation des Étudiants',     type: 'instruction',  version: '1.3', statut: 'approuve',   process: 'PR-02', auteur: 'Coord. Pédago', date_approbation: '2026-01-10',  date_revision: '2027-01-10',  file_url: '#' },
  { id: 4,  reference: 'FM-SAT-001', titre: 'Formulaire Enquête Satisfaction Étudiant', type: 'formulaire',   version: '2.0', statut: 'approuve',   process: 'PR-04', auteur: 'Resp. Qualité',  date_approbation: '2025-12-01',  date_revision: '2026-12-01',  file_url: '#' },
  { id: 5,  reference: 'CH-QUA-001', titre: 'Charte Qualité ESEF Berrechid',             type: 'charte',       version: '1.0', statut: 'approuve',   process: 'PR-01', auteur: 'Direction',     date_approbation: '2024-09-01',  date_revision: '2026-09-01',  file_url: '#' },
  { id: 6,  reference: 'PR-DOC-001', titre: 'Procédure Maîtrise des Documents',         type: 'procedure',    version: '1.0', statut: 'en_revision', process: 'PR-03', auteur: 'Resp. Qualité',  date_approbation: null,           date_revision: null,           file_url: '#' },
  { id: 7,  reference: 'RP-AUD-2026', titre: 'Rapport Audit Interne PR-01 Mars 2026',   type: 'rapport',      version: '1.0', statut: 'approuve',   process: 'PR-04', auteur: 'Pr. Benali',    date_approbation: '2026-03-15',  date_revision: null,           file_url: '#' },
  { id: 8,  reference: 'IN-SUP-001', titre: 'Instruction Gestion Infrastructures',      type: 'instruction',  version: '2.0', statut: 'approuve',   process: 'PR-03', auteur: 'Resp. Admin',   date_approbation: '2025-06-01',  date_revision: '2026-06-01',  file_url: '#' },
  { id: 9,  reference: 'FM-NC-001',  titre: 'Formulaire Déclaration Non-Conformité',    type: 'formulaire',   version: '1.1', statut: 'approuve',   process: 'PR-04', auteur: 'Resp. Qualité',  date_approbation: '2025-10-01',  date_revision: '2026-10-01',  file_url: '#' },
  { id: 10, reference: 'PR-AUD-001', titre: 'Procédure Audit Interne ISO 21001',        type: 'procedure',    version: '1.0', statut: 'brouillon',  process: 'PR-04', auteur: 'Coord. Qualité', date_approbation: null,           date_revision: null,           file_url: '#' },
];

// ── Type configuration ────────────────────────────────────────────────────
const typeConfig: Record<string, { label: string; icon: React.ReactNode; badge: string; pill: string }> = {
  procedure:   { label: 'Procédure',   icon: <BookOpen className="h-3 w-3" />,      badge: 'bg-blue-100 text-blue-700 border-blue-200',   pill: 'bg-blue-100 text-blue-700' },
  instruction: { label: 'Instruction', icon: <Settings className="h-3 w-3" />,      badge: 'bg-purple-100 text-purple-700 border-purple-200', pill: 'bg-purple-100 text-purple-700' },
  formulaire:  { label: 'Formulaire',  icon: <ClipboardList className="h-3 w-3" />, badge: 'bg-green-100 text-green-700 border-green-200', pill: 'bg-green-100 text-green-700' },
  charte:      { label: 'Charte',      icon: <FileCheck className="h-3 w-3" />,     badge: 'bg-amber-100 text-amber-700 border-amber-200', pill: 'bg-amber-100 text-amber-700' },
  rapport:     { label: 'Rapport',     icon: <BarChart2 className="h-3 w-3" />,     badge: 'bg-gray-100 text-gray-700 border-gray-200',   pill: 'bg-gray-100 text-gray-600' },
};

// ── Statut configuration ──────────────────────────────────────────────────
const statutConfig: Record<string, { label: string; badge: string; dot: string }> = {
  brouillon:   { label: 'Brouillon',    badge: 'bg-gray-100 text-gray-600',     dot: 'bg-gray-400' },
  en_revision: { label: 'En révision',  badge: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-500' },
  approuve:    { label: 'Approuvé',     badge: 'bg-green-100 text-green-700',   dot: 'bg-green-500' },
  archive:     { label: 'Archivé',      badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
};

// ── Helpers ───────────────────────────────────────────────────────────────
const TODAY = new Date('2026-06-06');

function daysUntilRevision(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return Math.ceil((d.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24));
}

function isExpiringSoon(dateStr: string | null): boolean {
  const days = daysUntilRevision(dateStr);
  return days !== null && days >= 0 && days <= 60;
}

function isExpired(dateStr: string | null): boolean {
  const days = daysUntilRevision(dateStr);
  return days !== null && days < 0;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-MA', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ── Upload Modal ───────────────────────────────────────────────────────────
type NewDoc = { reference: string; titre: string; version: string; type: string; process: string; auteur: string };

function UploadModal({ onClose, onAdd }: { onClose: () => void; onAdd: (doc: NewDoc) => void }) {
  const [form, setForm] = useState<NewDoc>({ reference: '', titre: '', version: '1.0', type: '', process: '', auteur: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: keyof NewDoc, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.reference || !form.titre || !form.type || !form.process) {
      setError('Veuillez remplir tous les champs obligatoires (*)');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/documents', {
        reference: form.reference,
        titre: form.titre,
        version: form.version || '1.0',
        type: form.type,
        statut: 'brouillon',
      });
      onAdd({ ...form, ...data });
      onClose();
    } catch {
      setError('Erreur lors de l\'ajout. Vérifiez la connexion au serveur.');
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
            <h3 className="text-sm font-semibold">Ajouter un nouveau document</h3>
            <p className="text-xs text-muted-foreground">GED SMOE · ESEF Berrechid</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mb-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" /> {error}
          </div>
        )}

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Référence *</Label>
              <Input value={form.reference} onChange={e => set('reference', e.target.value)} placeholder="ex : PR-QUA-002" className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Version</Label>
              <Input value={form.version} onChange={e => set('version', e.target.value)} placeholder="1.0" className="h-9 text-sm" />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Titre du document *</Label>
            <Input value={form.titre} onChange={e => set('titre', e.target.value)} placeholder="Nom complet du document..." className="h-9 text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Type *</Label>
              <select value={form.type} onChange={e => set('type', e.target.value)} className="w-full h-9 rounded-lg border border-input bg-background text-xs px-3">
                <option value="">Sélectionner...</option>
                <option value="procedure">Procédure</option>
                <option value="instruction">Instruction</option>
                <option value="formulaire">Formulaire</option>
                <option value="charte">Charte</option>
                <option value="rapport">Rapport</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Processus lié *</Label>
              <select value={form.process} onChange={e => set('process', e.target.value)} className="w-full h-9 rounded-lg border border-input bg-background text-xs px-3">
                <option value="">Sélectionner...</option>
                <option value="PR-01">PR-01 — Pilotage</option>
                <option value="PR-02">PR-02 — Réalisation pédagogique</option>
                <option value="PR-03">PR-03 — Support</option>
                <option value="PR-04">PR-04 — Évaluation</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Auteur / Rédacteur</Label>
            <Input value={form.auteur} onChange={e => set('auteur', e.target.value)} placeholder="Nom du rédacteur..." className="h-9 text-sm" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Fichier</Label>
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:bg-muted/30 transition-colors">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-xs font-medium text-muted-foreground">Glisser-déposer ou cliquer pour importer</p>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">PDF, DOCX, XLSX · Max 20 Mo</p>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={onClose}>
              Annuler
            </Button>
            <Button size="sm" className="flex-1 h-8 text-xs gap-1" onClick={handleSubmit} disabled={loading}>
              <Upload className="h-3 w-3" /> {loading ? 'Enregistrement...' : 'Ajouter le document'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Document Row ──────────────────────────────────────────────────────────
function DocumentRow({ doc, index }: { doc: typeof documents[0]; index: number }) {
  const typeCfg = typeConfig[doc.type] ?? typeConfig.procedure;
  const statutCfg = statutConfig[doc.statut] ?? statutConfig.brouillon;
  const expiringSoon = isExpiringSoon(doc.date_revision);
  const expired = isExpired(doc.date_revision);
  const daysLeft = daysUntilRevision(doc.date_revision);

  return (
    <motion.tr
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={cn(
        'group hover:bg-muted/30 transition-colors',
        expiringSoon && 'bg-amber-50/40 dark:bg-amber-950/10',
        expired && 'bg-red-50/40 dark:bg-red-950/10',
      )}
    >
      {/* Reference */}
      <td className="py-3 px-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          {(expiringSoon || expired) && (
            <AlertTriangle className={cn(
              'h-3.5 w-3.5 flex-shrink-0',
              expired ? 'text-red-500' : 'text-amber-500'
            )} />
          )}
          <span className="text-[10px] font-mono font-semibold text-muted-foreground">{doc.reference}</span>
        </div>
      </td>

      {/* Title */}
      <td className="py-3 px-3 border-b border-border/50">
        <p className="text-xs font-semibold leading-snug">{doc.titre}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{doc.auteur}</p>
      </td>

      {/* Type */}
      <td className="py-3 px-3 border-b border-border/50">
        <span className={cn(
          'text-[9px] font-semibold px-2 py-0.5 rounded border inline-flex items-center gap-1',
          typeCfg.badge
        )}>
          {typeCfg.icon}
          {typeCfg.label}
        </span>
      </td>

      {/* Version */}
      <td className="py-3 px-3 border-b border-border/50 text-center">
        <span className="text-xs font-mono bg-muted/60 px-1.5 py-0.5 rounded">v{doc.version}</span>
      </td>

      {/* Statut */}
      <td className="py-3 px-3 border-b border-border/50">
        <div className="flex items-center gap-1.5">
          <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', statutCfg.dot)} />
          <span className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded', statutCfg.badge)}>
            {statutCfg.label}
          </span>
        </div>
      </td>

      {/* Process */}
      <td className="py-3 px-3 border-b border-border/50">
        <span className="text-[9px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded">
          {doc.process}
        </span>
      </td>

      {/* Date approbation */}
      <td className="py-3 px-3 border-b border-border/50">
        <span className="text-[10px] text-muted-foreground">{formatDate(doc.date_approbation)}</span>
      </td>

      {/* Date révision */}
      <td className="py-3 px-3 border-b border-border/50">
        <div>
          <span className={cn(
            'text-[10px] font-medium',
            expired ? 'text-red-600 font-semibold' :
            expiringSoon ? 'text-amber-600 font-semibold' :
            'text-muted-foreground'
          )}>
            {formatDate(doc.date_revision)}
          </span>
          {expiringSoon && daysLeft !== null && (
            <p className="text-[9px] text-amber-600 font-semibold">
              J-{daysLeft}
            </p>
          )}
          {expired && (
            <p className="text-[9px] text-red-600 font-semibold">Expirée</p>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="py-3 px-3 border-b border-border/50">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
            <Eye className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
            <Download className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
            <Edit2 className="h-3 w-3" />
          </Button>
        </div>
      </td>
    </motion.tr>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function DocumentsPage() {
  const [docs, setDocs] = useState(documents);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('tous');
  const [filterStatut, setFilterStatut] = useState('tous');
  const [showUpload, setShowUpload] = useState(false);

  const handleAdd = (newDoc: { reference: string; titre: string; version: string; type: string; process: string; auteur: string }) => {
    setDocs(prev => [...prev, {
      id: prev.length + 1,
      ...newDoc,
      statut: 'brouillon',
      date_approbation: null,
      date_revision: null,
      file_url: '#',
    }]);
  };

  // Computed stats
  const stats = useMemo(() => {
    const approuves = docs.filter(d => d.statut === 'approuve').length;
    const enRevision = docs.filter(d => d.statut === 'en_revision').length;
    const expires = docs.filter(d => isExpired(d.date_revision)).length;
    const expiringSoonCount = docs.filter(d => isExpiringSoon(d.date_revision)).length;
    return { total: docs.length, approuves, enRevision, expires, expiringSoonCount };
  }, [docs]);

  // Type pill counts
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    docs.forEach(d => { counts[d.type] = (counts[d.type] ?? 0) + 1; });
    return counts;
  }, [docs]);

  // Filtered list
  const filtered = useMemo(() => {
    return docs.filter(d => {
      const matchSearch =
        d.titre.toLowerCase().includes(search.toLowerCase()) ||
        d.reference.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === 'tous' || d.type === filterType;
      const matchStatut = filterStatut === 'tous' || d.statut === filterStatut;
      return matchSearch && matchType && matchStatut;
    });
  }, [docs, search, filterType, filterStatut]);

  return (
    <div className="page-container animate-fade-up">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-primary" />
            Gestion Documentaire GED
          </h1>
          <p className="page-subtitle">
            ISO 21001 §7.5 · Maîtrise des informations documentées · Master IFDL · ESEF Berrechid
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1"
            onClick={() => downloadExport('documents', 'xlsx', 'documents.xlsx')}
          >
            <Download className="h-3.5 w-3.5" /> Exporter
          </Button>
          <Button size="sm" className="text-xs gap-1" onClick={() => setShowUpload(true)}>
            <Plus className="h-3.5 w-3.5" /> Nouveau document
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total documents', value: stats.total,       color: 'text-foreground',   icon: <FileText className="h-4 w-4 text-muted-foreground" /> },
          { label: 'Approuvés',       value: stats.approuves,   color: 'text-green-600',    icon: <CheckCircle2 className="h-4 w-4 text-green-500" /> },
          { label: 'En révision',     value: stats.enRevision,  color: 'text-amber-600',    icon: <Clock className="h-4 w-4 text-amber-500" /> },
          { label: 'Expirant ≤ 60j',  value: stats.expiringSoonCount, color: stats.expiringSoonCount > 0 ? 'text-amber-600' : 'text-green-600', icon: <AlertTriangle className="h-4 w-4 text-amber-500" /> },
        ].map(s => (
          <Card key={s.label} className="stat-card">
            <div className="flex items-center justify-between">
              <p className="stat-label">{s.label}</p>
              {s.icon}
            </div>
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Type pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterType('tous')}
          className={cn(
            'text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all border',
            filterType === 'tous'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
          )}
        >
          Tous ({docs.length})
        </button>
        {Object.entries(typeConfig).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setFilterType(key)}
            className={cn(
              'text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all border inline-flex items-center gap-1',
              filterType === key
                ? `${cfg.badge} border-current`
                : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
            )}
          >
            {cfg.icon}
            {cfg.label} ({typeCounts[key] ?? 0})
          </button>
        ))}
      </div>

      {/* Expiry alert banner */}
      <AnimatePresence>
        {stats.expiringSoonCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3"
          >
            <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              <span className="font-semibold">{stats.expiringSoonCount} document(s)</span> arrivent à échéance dans les 60 prochains jours.
              Veuillez planifier leur révision.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Rechercher par titre, référence..."
            className="pl-9 h-8 text-xs"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-8 rounded-lg border border-input bg-background text-xs px-3 min-w-[140px]"
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          <option value="tous">Tous les types</option>
          <option value="procedure">Procédure</option>
          <option value="instruction">Instruction</option>
          <option value="formulaire">Formulaire</option>
          <option value="charte">Charte</option>
          <option value="rapport">Rapport</option>
        </select>
        <select
          className="h-8 rounded-lg border border-input bg-background text-xs px-3 min-w-[140px]"
          value={filterStatut}
          onChange={e => setFilterStatut(e.target.value)}
        >
          <option value="tous">Tous les statuts</option>
          <option value="brouillon">Brouillon</option>
          <option value="en_revision">En révision</option>
          <option value="approuve">Approuvé</option>
          <option value="archive">Archivé</option>
        </select>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
          <Filter className="h-3.5 w-3.5" /> {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
        </Button>
      </div>

      {/* Document Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr className="bg-muted/30">
                <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide py-3 px-3 border-b border-border">Référence</th>
                <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide py-3 px-3 border-b border-border">Titre / Auteur</th>
                <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide py-3 px-3 border-b border-border">Type</th>
                <th className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wide py-3 px-3 border-b border-border">Version</th>
                <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide py-3 px-3 border-b border-border">Statut</th>
                <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide py-3 px-3 border-b border-border">Processus</th>
                <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide py-3 px-3 border-b border-border">Approbation</th>
                <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide py-3 px-3 border-b border-border">Proch. révision</th>
                <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide py-3 px-3 border-b border-border">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((doc, i) => (
                  <DocumentRow key={doc.id} doc={doc} index={i} />
                ))}
              </AnimatePresence>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <FolderOpen className="h-10 w-10 mx-auto text-muted-foreground/25 mb-3" />
                    <p className="text-sm text-muted-foreground">Aucun document trouvé</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Modifiez vos critères de recherche</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/20">
          <p className="text-[10px] text-muted-foreground">
            {filtered.length} document{filtered.length !== 1 ? 's' : ''} affiché{filtered.length !== 1 ? 's' : ''} sur {docs.length}
          </p>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              En cours de révision / Expiration proche
            </span>
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Expirée
            </span>
          </div>
        </div>
      </Card>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && <UploadModal onClose={() => setShowUpload(false)} onAdd={handleAdd} />}
      </AnimatePresence>
    </div>
  );
}
