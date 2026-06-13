/**
 * Rapports & Revue de Direction — ISO 21001 clause 9.3
 * SMART SMOE IFDL · ESEF Berrechid · Master IFDL
 */
'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { downloadExport } from '@/lib/export';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Plus, Search, Filter, FileText, Download,
  Eye, Share2, X, Calendar, User, CheckCircle2, Clock,
  ChevronRight, Send, Users, Star, TrendingUp, Award,
  BookOpen, ClipboardList, Layers, Copy, Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// ── Mock data ─────────────────────────────────────────────────
const reports = [
  { id: 1, titre: 'Revue de Direction S1 2025-2026', type: 'revue_direction', statut: 'approuve', auteur: 'Direction + Resp. Qualité', periode_debut: '2025-09-01', periode_fin: '2026-02-28', date_creation: '2026-03-01', nb_pages: 24, participants: ['Directeur', 'Resp. Qualité', 'Coord. Pédago', 'Resp. Admin'], decisions_cles: ['Validation plan amélioration 2026', 'Allocation budget formation +20%', 'Objectif certification ISO 21001 Q1 2027'] },
  { id: 2, titre: 'Revue de Direction S2 2024-2025', type: 'revue_direction', statut: 'approuve', auteur: 'Direction', periode_debut: '2025-03-01', periode_fin: '2025-08-31', date_creation: '2025-09-10', nb_pages: 20, participants: ['Directeur', 'Resp. Qualité', 'Coord. Pédago'], decisions_cles: ['Lancement SMOE', 'Budget outil numérique'] },
  { id: 3, titre: 'Bilan Qualité Annuel 2025', type: 'bilan_qualite', statut: 'approuve', auteur: 'Resp. Qualité', periode_debut: '2025-01-01', periode_fin: '2025-12-31', date_creation: '2026-01-15', nb_pages: 35, participants: [], decisions_cles: [] },
  { id: 4, titre: 'Rapport Audit Interne Programme 2026 — Q1', type: 'audit', statut: 'approuve', auteur: 'Pr. Benali', periode_debut: '2026-03-01', periode_fin: '2026-03-31', date_creation: '2026-04-01', nb_pages: 18, participants: [], decisions_cles: [] },
  { id: 5, titre: 'Rapport KPIs & Indicateurs S1 2026', type: 'bilan_qualite', statut: 'finalise', auteur: 'Resp. Qualité', periode_debut: '2026-01-01', periode_fin: '2026-06-30', date_creation: '2026-06-05', nb_pages: 12, participants: [], decisions_cles: [] },
  { id: 6, titre: 'Revue de Direction S1 2026-2027 — Brouillon', type: 'revue_direction', statut: 'brouillon', auteur: 'Resp. Qualité', periode_debut: '2026-09-01', periode_fin: '2027-02-28', date_creation: '2026-06-01', nb_pages: 0, participants: [], decisions_cles: [] },
];

const lastReview = reports.find(r => r.type === 'revue_direction' && r.statut === 'approuve' && r.id === 1)!;

const keyMetrics = [
  { label: 'Score ISO 21001',      value: '84%',   color: 'text-green-600', icon: <Award className="h-4 w-4" /> },
  { label: 'NC clôturées',         value: '12/14', color: 'text-blue-600',  icon: <CheckCircle2 className="h-4 w-4" /> },
  { label: 'Satisfaction moy.',    value: '4.1/5', color: 'text-amber-600', icon: <Star className="h-4 w-4" /> },
  { label: 'Formations réalisées', value: '2/6',   color: 'text-primary',   icon: <TrendingUp className="h-4 w-4" /> },
];

// ── Helpers ────────────────────────────────────────────────────
const typeConfig: Record<string, { label: string; style: string; icon: React.ReactNode }> = {
  revue_direction: { label: 'Revue de direction', style: 'bg-purple-50 text-purple-700 border-purple-200', icon: <Users className="h-3 w-3" /> },
  bilan_qualite:   { label: 'Bilan qualité',      style: 'bg-blue-50 text-blue-700 border-blue-200',      icon: <BarChart3 className="h-3 w-3" /> },
  audit:           { label: 'Rapport audit',       style: 'bg-teal-50 text-teal-700 border-teal-200',      icon: <ClipboardList className="h-3 w-3" /> },
};

const statutConfig: Record<string, { label: string; badge: string; dot: string }> = {
  brouillon: { label: 'Brouillon', badge: 'bg-gray-100 text-gray-600',   dot: 'bg-gray-400'  },
  finalise:  { label: 'Finalisé',  badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  approuve:  { label: 'Approuvé',  badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
};

function typeFilter(tab: string, type: string): boolean {
  if (tab === 'tous') return true;
  return type === tab;
}

// ── Print Report ───────────────────────────────────────────────
function printReport(report: typeof reports[0]) {
  const tc = typeConfig[report.type] ?? typeConfig.bilan_qualite;
  const sc = statutConfig[report.statut] ?? statutConfig.brouillon;
  const date = new Date().toLocaleDateString('fr-MA', { day: '2-digit', month: 'long', year: 'numeric' });
  const periodeDebut = new Date(report.periode_debut).toLocaleDateString('fr-MA', { month: 'long', year: 'numeric' });
  const periodeFin   = new Date(report.periode_fin).toLocaleDateString('fr-MA', { month: 'long', year: 'numeric' });

  const participantsHtml = report.participants.length > 0
    ? `<p style="margin:4px 0 0">${report.participants.map(p => `<span style="background:#f3f4f6;padding:2px 8px;border-radius:12px;font-size:11px;margin:2px">${p}</span>`).join(' ')}</p>`
    : '<p style="color:#9ca3af;font-size:12px">—</p>';

  const decisionsHtml = report.decisions_cles.length > 0
    ? report.decisions_cles.map((d, i) => `
        <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:8px">
          <span style="color:#7c3aed;font-weight:700;min-width:20px">${i + 1}.</span>
          <span style="font-size:13px">${d}</span>
        </div>`).join('')
    : '<p style="color:#9ca3af;font-size:12px">Aucune décision enregistrée</p>';

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8"/>
<title>${report.titre} — SMART SMOE IFDL</title>
<style>
  * { margin:0;padding:0;box-sizing:border-box; }
  body { font-family:'Segoe UI',Arial,sans-serif;color:#111827;background:#fff;padding:32px; }
  .header { border-bottom:3px solid #0d3b7a;padding-bottom:16px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:flex-start; }
  h1 { font-size:18px;font-weight:700;color:#0d3b7a;margin-bottom:4px; }
  .sub { font-size:11px;color:#6b7280; }
  .badge { display:inline-block;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:600; }
  .section { margin-bottom:20px; }
  .section-title { font-size:13px;font-weight:700;color:#0d3b7a;margin-bottom:10px;padding-bottom:4px;border-bottom:1px solid #e5e7eb; }
  .meta-grid { display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px; }
  .meta-item label { font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;font-weight:600; }
  .meta-item p { font-size:13px;font-weight:500;margin-top:2px; }
  .footer { margin-top:32px;padding-top:12px;border-top:1px solid #e5e7eb;font-size:10px;color:#9ca3af;text-align:center; }
  @media print { body { padding:16px; } }
</style>
</head>
<body>
<div class="header">
  <div>
    <h1>${report.titre}</h1>
    <p class="sub">ESEF Berrechid · Université Hassan 1er · Master IFDL · SMART SMOE IFDL</p>
    <p class="sub" style="margin-top:4px">Généré le ${date}</p>
  </div>
  <div style="text-align:right">
    <span class="badge" style="background:#dcfce7;color:#166534">${sc.label}</span><br/>
    <span class="badge" style="background:#ede9fe;color:#5b21b6;margin-top:4px">${tc.label}</span>
  </div>
</div>

<div class="meta-grid">
  <div class="meta-item"><label>Auteur / Responsable</label><p>${report.auteur}</p></div>
  <div class="meta-item"><label>Période couverte</label><p>${periodeDebut} → ${periodeFin}</p></div>
  <div class="meta-item"><label>Date de création</label><p>${new Date(report.date_creation).toLocaleDateString('fr-MA')}</p></div>
  ${report.nb_pages > 0 ? `<div class="meta-item"><label>Nombre de pages</label><p>${report.nb_pages} pages</p></div>` : ''}
</div>

${report.participants.length > 0 ? `
<div class="section">
  <div class="section-title">Participants</div>
  ${participantsHtml}
</div>` : ''}

${report.decisions_cles.length > 0 ? `
<div class="section">
  <div class="section-title">Décisions clés</div>
  ${decisionsHtml}
</div>` : ''}

<div class="section">
  <div class="section-title">Indicateurs de la période</div>
  <table style="width:100%;border-collapse:collapse">
    <thead><tr style="background:#f3f4f6">
      <th style="padding:8px;text-align:left;font-size:11px;color:#6b7280">Indicateur</th>
      <th style="padding:8px;text-align:center;font-size:11px;color:#6b7280">Valeur</th>
    </tr></thead>
    <tbody>
      <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;font-size:12px">Score ISO 21001</td><td style="padding:8px;border-bottom:1px solid #f3f4f6;text-align:center;font-weight:700;color:#16a34a">84%</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;font-size:12px">NC clôturées</td><td style="padding:8px;border-bottom:1px solid #f3f4f6;text-align:center;font-weight:700;color:#2563eb">12/14</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;font-size:12px">Satisfaction parties prenantes</td><td style="padding:8px;border-bottom:1px solid #f3f4f6;text-align:center;font-weight:700;color:#d97706">4.1/5</td></tr>
      <tr><td style="padding:8px;font-size:12px">Formations réalisées</td><td style="padding:8px;text-align:center;font-weight:700;color:#0d3b7a">2/6</td></tr>
    </tbody>
  </table>
</div>

<div class="footer">SMART SMOE IFDL v1.0.0 · ISO 21001:2018 §9.3 · ESEF Berrechid</div>
</body></html>`;

  const w = window.open('', '_blank', 'width=850,height=650');
  if (!w) { toast.error('Autoriser les popups pour télécharger le PDF'); return; }
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
}

// ── Share Report ───────────────────────────────────────────────
function shareReport(report: typeof reports[0]) {
  const msg = `📄 ${report.titre}\nType : ${typeConfig[report.type]?.label}\nPériode : ${new Date(report.periode_debut).toLocaleDateString('fr-MA')} → ${new Date(report.periode_fin).toLocaleDateString('fr-MA')}\nStatut : ${statutConfig[report.statut]?.label}\nAuteur : ${report.auteur}\n— SMART SMOE IFDL · ESEF Berrechid`;
  navigator.clipboard.writeText(msg)
    .then(() => toast.success('Résumé copié dans le presse-papiers'))
    .catch(() => toast.error('Impossible de copier'));
}

// ── Generate Report Modal ──────────────────────────────────────
function GenerateReportForm({ onClose, onAdd }: { onClose: () => void; onAdd: (r: any) => void }) {
  const [type, setType]           = useState('revue_direction');
  const [titre, setTitre]         = useState('');
  const [periodeDebut, setDebut]  = useState('');
  const [periodeFin, setFin]      = useState('');
  const [auteur, setAuteur]       = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async () => {
    if (!titre.trim() || !periodeDebut || !periodeFin) { setError('Le titre et les dates sont requis.'); return; }
    setLoading(true); setError('');
    try {
      const res: any = await api.post('/reports', {
        type, titre,
        periode_debut: new Date(periodeDebut).toISOString(),
        periode_fin:   new Date(periodeFin).toISOString(),
        statut: 'brouillon',
        contenu: { auteur: auteur || 'Resp. Qualité', nb_pages: 0 },
      });
      const saved = res.data ?? res;
      onAdd({
        id:             saved.id,
        titre:          saved.titre,
        type:           saved.type,
        statut:         saved.statut,
        auteur:         saved.contenu?.auteur ?? auteur || 'Resp. Qualité',
        periode_debut:  saved.periode_debut,
        periode_fin:    saved.periode_fin,
        date_creation:  saved.created_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
        nb_pages:       0,
        participants:   [],
        decisions_cles: [],
      });
      toast.success('Rapport créé !');
      onClose();
    } catch {
      setError('Erreur lors de la création. Vérifiez votre connexion.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold">Générer un nouveau rapport</h3>
            <p className="text-xs text-muted-foreground">ISO 21001 §9.3 · SMART SMOE IFDL</p>
          </div>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs font-medium">Type de rapport</Label>
            <select className="w-full h-9 rounded-lg border border-input bg-background text-xs px-3" value={type} onChange={e => setType(e.target.value)}>
              <option value="revue_direction">Revue de direction</option>
              <option value="bilan_qualite">Bilan qualité</option>
              <option value="audit">Rapport d'audit</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">Titre du rapport *</Label>
            <Input placeholder="Ex. Revue de Direction S1 2026-2027..." className="h-9 text-sm" value={titre} onChange={e => setTitre(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Période — début *</Label>
              <Input type="date" className="h-9 text-sm" value={periodeDebut} onChange={e => setDebut(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Période — fin *</Label>
              <Input type="date" className="h-9 text-sm" value={periodeFin} onChange={e => setFin(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">Auteur / Responsable</Label>
            <Input placeholder="Resp. Qualité..." className="h-9 text-sm" value={auteur} onChange={e => setAuteur(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">Sections à inclure</Label>
            <div className="space-y-1.5">
              {['Contexte et parties intéressées', 'Résultats audits internes', 'État des NC et actions correctives', 'KPIs et indicateurs qualité', 'Satisfaction parties prenantes', "Plan d'amélioration"].map(s => (
                <label key={s} className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded" />
                  {s}
                </label>
              ))}
            </div>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={onClose}>Annuler</Button>
            <Button size="sm" className="flex-1 h-8 text-xs gap-1" onClick={handleSubmit} disabled={loading}>
              <Send className="h-3 w-3" /> {loading ? 'Génération...' : 'Générer'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── View Report Modal ──────────────────────────────────────────
function ReportViewModal({ report, onClose }: { report: typeof reports[0]; onClose: () => void }) {
  const tc = typeConfig[report.type] ?? typeConfig.bilan_qualite;
  const sc = statutConfig[report.statut] ?? statutConfig.brouillon;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card border border-border rounded-xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Aperçu du rapport</h3>
          </div>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        <div className="p-6 space-y-4">
          {/* Title + badges */}
          <div>
            <div className="flex gap-2 mb-2 flex-wrap">
              <span className={cn('text-[9px] font-semibold px-2 py-0.5 rounded border flex items-center gap-1', tc.style)}>
                {tc.icon}{tc.label}
              </span>
              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', sc.badge)}>
                {sc.label}
              </span>
            </div>
            <h4 className="text-sm font-semibold">{report.titre}</h4>
          </div>
          <Separator />
          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><p className="text-muted-foreground mb-0.5">Auteur</p><p className="font-medium">{report.auteur}</p></div>
            <div>
              <p className="text-muted-foreground mb-0.5">Période</p>
              <p className="font-medium">
                {new Date(report.periode_debut).toLocaleDateString('fr-MA', { month: 'short', year: 'numeric' })} →{' '}
                {new Date(report.periode_fin).toLocaleDateString('fr-MA', { month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div><p className="text-muted-foreground mb-0.5">Créé le</p><p className="font-medium">{new Date(report.date_creation).toLocaleDateString('fr-MA')}</p></div>
            {report.nb_pages > 0 && <div><p className="text-muted-foreground mb-0.5">Pages</p><p className="font-medium">{report.nb_pages}</p></div>}
          </div>
          {/* Participants */}
          {report.participants.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" /> Participants
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {report.participants.map(p => (
                    <span key={p} className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-medium">{p}</span>
                  ))}
                </div>
              </div>
            </>
          )}
          {/* Decisions */}
          {report.decisions_cles.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> Décisions clés
                </p>
                <div className="space-y-1.5">
                  {report.decisions_cles.map((d, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <ChevronRight className="h-3.5 w-3.5 text-purple-500 flex-shrink-0 mt-0.5" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={onClose}>Fermer</Button>
            <Button size="sm" className="flex-1 text-xs gap-1" onClick={() => printReport(report)}>
              <Download className="h-3.5 w-3.5" /> Télécharger PDF
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Report Card ────────────────────────────────────────────────
function ReportCard({ report, onView }: { report: typeof reports[0]; onView: (r: typeof reports[0]) => void }) {
  const tc = typeConfig[report.type] ?? typeConfig.bilan_qualite;
  const sc = statutConfig[report.statut] ?? statutConfig.brouillon;

  return (
    <motion.div layout initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="hover:shadow-md transition-all overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn('w-2 h-2 rounded-full flex-shrink-0 mt-2', sc.dot)} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={cn('text-[9px] font-semibold px-2 py-0.5 rounded border flex items-center gap-1', tc.style)}>
                  {tc.icon}{tc.label}
                </span>
                <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', sc.badge)}>
                  {sc.label}
                </span>
              </div>
              <p className="text-sm font-semibold leading-snug">{report.titre}</p>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><User className="h-2.5 w-2.5" />{report.auteur}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-2.5 w-2.5" />
                  Période : {new Date(report.periode_debut).toLocaleDateString('fr-MA', { month: 'short', year: 'numeric' })} →{' '}
                  {new Date(report.periode_fin).toLocaleDateString('fr-MA', { month: 'short', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1"><FileText className="h-2.5 w-2.5" />Créé le {new Date(report.date_creation).toLocaleDateString('fr-MA')}</span>
                {report.nb_pages > 0 && <span className="text-[10px] text-muted-foreground">{report.nb_pages} pages</span>}
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Button
                variant="ghost" size="sm" className="h-7 w-7 p-0" title="Voir"
                onClick={() => onView(report)}
              >
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
              {report.nb_pages > 0 && (
                <Button
                  variant="ghost" size="sm" className="h-7 w-7 p-0" title="Télécharger PDF"
                  onClick={() => printReport(report)}
                >
                  <Download className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              )}
              <Button
                variant="ghost" size="sm" className="h-7 w-7 p-0" title="Copier résumé"
                onClick={() => shareReport(report)}
              >
                <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function ReportsPage() {
  const [search,      setSearch]      = useState('');
  const [showForm,    setShowForm]    = useState(false);
  const [viewReport,  setViewReport]  = useState<typeof reports[0] | null>(null);
  const [reportList,  setReportList]  = useState(reports);

  const stats = {
    total:          reportList.length,
    revues:         reportList.filter(r => r.type === 'revue_direction').length,
    en_attente:     reportList.filter(r => r.statut === 'brouillon' || r.statut === 'finalise').length,
    derniere_revue: new Date(lastReview.date_creation).toLocaleDateString('fr-MA', { day: '2-digit', month: 'short', year: 'numeric' }),
  };

  const filtered = (tab: string) => reportList.filter(r => {
    const matchSearch = r.titre.toLowerCase().includes(search.toLowerCase()) ||
      r.auteur.toLowerCase().includes(search.toLowerCase());
    return matchSearch && typeFilter(tab, r.type);
  });

  return (
    <div className="page-container animate-fade-up">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Rapports & Revue de Direction
          </h1>
          <p className="page-subtitle">
            ISO 21001 §9.3 · Pilotage par les données · Master IFDL · ESEF Berrechid
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline" size="sm" className="text-xs gap-1"
            onClick={() => downloadExport('reports', 'xlsx', 'rapports.xlsx')}
          >
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button size="sm" className="text-xs gap-1" onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5" /> Générer un rapport
          </Button>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showForm && (
          <GenerateReportForm
            onClose={() => setShowForm(false)}
            onAdd={r => setReportList(prev => [r, ...prev])}
          />
        )}
        {viewReport && (
          <ReportViewModal report={viewReport} onClose={() => setViewReport(null)} />
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Rapports générés',       value: stats.total,          color: 'text-foreground'  },
          { label: 'Revues de direction',    value: stats.revues,         color: 'text-purple-600'  },
          { label: 'En attente approbation', value: stats.en_attente,     color: 'text-amber-600'   },
          { label: 'Dernière revue',         value: stats.derniere_revue, color: 'text-green-600'   },
        ].map(s => (
          <Card key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className={cn('text-lg font-bold', s.color)}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Key Metrics Summary */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          Indicateurs clés — Période en cours (S1 2026)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {keyMetrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card className="hover:shadow-md transition-all">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={cn('flex-shrink-0', m.color)}>{m.icon}</div>
                  <div>
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className={cn('text-xl font-bold', m.color)}>{m.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Last Management Review Card */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                Dernière Revue de Direction
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {lastReview.titre} · Approuvée le {new Date(lastReview.date_creation).toLocaleDateString('fr-MA', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <Button size="sm" className="text-xs gap-1" onClick={() => setShowForm(true)}>
              <Plus className="h-3.5 w-3.5" /> Préparer nouvelle revue
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-muted-foreground" /> Participants
              </p>
              <div className="flex flex-wrap gap-1.5">
                {lastReview.participants.map(p => (
                  <span key={p} className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-medium">{p}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Période couverte
              </p>
              <p className="text-sm font-medium">
                {new Date(lastReview.periode_debut).toLocaleDateString('fr-MA', { month: 'long', year: 'numeric' })}
                {' → '}
                {new Date(lastReview.periode_fin).toLocaleDateString('fr-MA', { month: 'long', year: 'numeric' })}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{lastReview.nb_pages} pages</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-xs font-semibold mb-2 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> Décisions clés
            </p>
            <div className="space-y-1.5">
              {lastReview.decisions_cles.map((d, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-2 text-xs"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <span>{d}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="text-xs gap-1 h-7"
              onClick={() => setViewReport(lastReview)}>
              <Eye className="h-3 w-3" /> Voir le rapport
            </Button>
            <Button size="sm" variant="outline" className="text-xs gap-1 h-7"
              onClick={() => printReport(lastReview)}>
              <Download className="h-3 w-3" /> Télécharger PDF
            </Button>
            <Button size="sm" variant="outline" className="text-xs gap-1 h-7"
              onClick={() => shareReport(lastReview)}>
              <Share2 className="h-3 w-3" /> Partager
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports list */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Rechercher un rapport..."
              className="pl-9 h-8 text-xs"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
            <Filter className="h-3.5 w-3.5" /> Filtrer
          </Button>
        </div>

        <Tabs defaultValue="tous">
          <TabsList className="h-9">
            <TabsTrigger value="tous"            className="text-xs">Tous ({reportList.length})</TabsTrigger>
            <TabsTrigger value="revue_direction" className="text-xs">Revues direction ({reportList.filter(r => r.type === 'revue_direction').length})</TabsTrigger>
            <TabsTrigger value="bilan_qualite"   className="text-xs">Bilans qualité ({reportList.filter(r => r.type === 'bilan_qualite').length})</TabsTrigger>
            <TabsTrigger value="audit"           className="text-xs">Rapports audit ({reportList.filter(r => r.type === 'audit').length})</TabsTrigger>
          </TabsList>

          {(['tous', 'revue_direction', 'bilan_qualite', 'audit'] as const).map(tab => (
            <TabsContent key={tab} value={tab} className="mt-4">
              <div className="space-y-2">
                {filtered(tab).length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-10 text-center">
                      <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">Aucun rapport dans cette catégorie</p>
                    </CardContent>
                  </Card>
                ) : (
                  filtered(tab).map(report => (
                    <ReportCard key={report.id} report={report} onView={setViewReport} />
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
