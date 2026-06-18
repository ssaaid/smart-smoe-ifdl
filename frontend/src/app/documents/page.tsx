/**
 * Gestion Documentaire GED — ISO 21001 clause 7.5
 * SMART SMOE IFDL · ESEF Berrechid · Master IFDL
 */
'use client';

import { useState, useMemo, useEffect } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen, Plus, Search, Filter, Eye, Download, Edit2,
  X, FileText, AlertTriangle, CheckCircle2, Clock, Upload,
  BookOpen, Settings, ClipboardList, FileCheck, BarChart2, GitBranch,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// ── Mock data ──────────────────────────────────────────────────────────────
const documents = [
  { id: 1,  reference: 'FP-PR01-INDEX', titre: 'Fiche Processus Pilotage — Index et Cartographie',             type: 'fiche_processus', version: '1.0', statut: 'approuve',   process: 'PR-01', auteur: 'Pr. ARAICHI Rachid',  date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 2,  reference: 'FP-PR01-1',     titre: 'Définition de la politique qualité',                           type: 'fiche_processus', version: '1.0', statut: 'approuve',   process: 'PR-01', auteur: 'Resp. Qualité SMOE', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 3,  reference: 'FP-PR01-2',     titre: 'Planification stratégique',                                    type: 'fiche_processus', version: '1.0', statut: 'approuve',   process: 'PR-01', auteur: 'Resp. Qualité SMOE', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 4,  reference: 'FP-PR01-3',     titre: 'Pilotage par les indicateurs de performance (KPI)',            type: 'fiche_processus', version: '1.0', statut: 'approuve',   process: 'PR-01', auteur: 'Resp. Qualité SMOE', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 5,  reference: 'FP-PR01-4',     titre: 'Gestion des risques et opportunités',                          type: 'fiche_processus', version: '1.0', statut: 'approuve',   process: 'PR-01', auteur: 'Resp. Qualité SMOE', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 6,  reference: 'FP-PR01-5',     titre: 'Revue de direction du SMOE',                                   type: 'fiche_processus', version: '1.0', statut: 'approuve',   process: 'PR-01', auteur: 'Pr. ARAICHI Rachid',  date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 7,  reference: 'FP-PR01-6',     titre: 'Amélioration continue du SMOE',                                type: 'fiche_processus', version: '1.0', statut: 'approuve',   process: 'PR-01', auteur: 'Resp. Qualité SMOE', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 8,  reference: 'FP-PR02-INDEX', titre: 'Fiche Processus Réalisation Pédagogique — Index',              type: 'fiche_processus', version: '1.0', statut: 'approuve',   process: 'PR-02', auteur: 'Pr. Soumiya TAMANI', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 9,  reference: 'FP-PR02-1',     titre: 'Admission et sélection des étudiants',                         type: 'fiche_processus', version: '1.0', statut: 'approuve',   process: 'PR-02', auteur: 'Pr. Soumiya TAMANI', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 10, reference: 'FP-PR02-2',     titre: 'Conception pédagogique',                                       type: 'fiche_processus', version: '1.0', statut: 'approuve',   process: 'PR-02', auteur: 'Pr. Soumiya TAMANI', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 11, reference: 'FP-PR02-3',     titre: "Mise en oeuvre des activites d'enseignement",                  type: 'fiche_processus', version: '1.0', statut: 'approuve',   process: 'PR-02', auteur: 'Pr. Soumiya TAMANI', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 12, reference: 'FP-PR02-4',     titre: 'Evaluation des apprentissages',                                 type: 'fiche_processus', version: '1.0', statut: 'approuve',   process: 'PR-02', auteur: 'Pr. Soumiya TAMANI', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 13, reference: 'FP-PR02-5',     titre: 'Soutenance, deliberation et diplomation',                      type: 'fiche_processus', version: '1.0', statut: 'approuve',   process: 'PR-02', auteur: 'Pr. Soumiya TAMANI', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 14, reference: 'FP-PR02-6',     titre: 'Suivi pedagogique des etudiants',                              type: 'fiche_processus', version: '1.0', statut: 'approuve',   process: 'PR-02', auteur: 'Pr. Soumiya TAMANI', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 15, reference: 'FP-PR02-7',     titre: "Gestion des stages et projets de fin d'etudes",                type: 'fiche_processus', version: '1.0', statut: 'approuve',   process: 'PR-02', auteur: 'Pr. Soumiya TAMANI', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 16, reference: 'FP-PR02-8',     titre: 'Suivi des laureats du Master IFDL',                            type: 'fiche_processus', version: '1.0', statut: 'approuve',   process: 'PR-02', auteur: 'Pr. Soumiya TAMANI', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 17, reference: 'FP-PR03-INDEX', titre: 'Fiche Processus Support et Ressources — Index',                type: 'fiche_processus', version: '1.0', statut: 'approuve',   process: 'PR-03', auteur: 'Secr. General ESEF', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 18, reference: 'FP-PR03-1',     titre: 'Gestion administrative et scolarite',                          type: 'fiche_processus', version: '1.0', statut: 'approuve',   process: 'PR-03', auteur: 'Secr. General ESEF', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 19, reference: 'FP-PR03-2',     titre: "Systemes d'information et digital learning",                   type: 'fiche_processus', version: '1.0', statut: 'approuve',   process: 'PR-03', auteur: 'Secr. General ESEF', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 20, reference: 'FP-PR03-3',     titre: 'Gestion des ressources humaines',                              type: 'fiche_processus', version: '1.0', statut: 'approuve',   process: 'PR-03', auteur: 'Secr. General ESEF', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 21, reference: 'FP-PR03-4',     titre: 'Gestion logistique et infrastructures',                        type: 'fiche_processus', version: '1.0', statut: 'approuve',   process: 'PR-03', auteur: 'Secr. General ESEF', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 22, reference: 'FP-PR03-5',     titre: 'Gestion financiere',                                           type: 'fiche_processus', version: '1.0', statut: 'approuve',   process: 'PR-03', auteur: 'Secr. General ESEF', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 23, reference: 'FP-PR04-INDEX', titre: 'Fiche Processus Evaluation et Amelioration — Index',           type: 'fiche_processus', version: '1.0', statut: 'approuve',   process: 'PR-04', auteur: 'Resp. Qualite SMOE', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 24, reference: 'FP-PR04-1',     titre: 'Audit interne du SMOE',                                        type: 'fiche_processus', version: '1.0', statut: 'approuve',   process: 'PR-04', auteur: 'Resp. Qualite SMOE', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 25, reference: 'FP-PR04-2',     titre: 'Gestion des non-conformites',                                  type: 'fiche_processus', version: '1.0', statut: 'approuve',   process: 'PR-04', auteur: 'Resp. Qualite SMOE', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 26, reference: 'FP-PR04-3',     titre: 'Actions correctives et amelioration',                          type: 'fiche_processus', version: '1.0', statut: 'approuve',   process: 'PR-04', auteur: 'Resp. Qualite SMOE', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 27, reference: 'FP-PR04-4',     titre: 'Revue de direction SMOE',                                      type: 'fiche_processus', version: '1.0', statut: 'approuve',   process: 'PR-04', auteur: 'Resp. Qualite SMOE', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 28, reference: 'PRO-SMOE-01',   titre: 'Procedure Qualite — Gestion documentaire',                     type: 'procedure',       version: '1.0', statut: 'approuve',   process: 'PR-03', auteur: 'Resp. Qualite SMOE', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 29, reference: 'PRO-SMOE-02',   titre: 'Procedure Qualite — Gestion des enregistrements',              type: 'procedure',       version: '1.0', statut: 'approuve',   process: 'PR-03', auteur: 'Resp. Qualite SMOE', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 30, reference: 'PRO-SMOE-03',   titre: 'Procedure Qualite — Audit interne',                            type: 'procedure',       version: '1.0', statut: 'approuve',   process: 'PR-04', auteur: 'Resp. Qualite SMOE', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 31, reference: 'PRO-SMOE-04',   titre: 'Procedure Qualite — Gestion des non-conformites',              type: 'procedure',       version: '1.0', statut: 'approuve',   process: 'PR-04', auteur: 'Resp. Qualite SMOE', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 32, reference: 'PRO-SMOE-05',   titre: 'Procedure Qualite — Actions correctives',                      type: 'procedure',       version: '1.0', statut: 'approuve',   process: 'PR-04', auteur: 'Resp. Qualite SMOE', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 33, reference: 'PRO-SMOE-06',   titre: 'Procedure Qualite — Revue de direction',                       type: 'procedure',       version: '1.0', statut: 'approuve',   process: 'PR-01', auteur: 'Resp. Qualite SMOE', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 34, reference: 'PS-SMOE-01',    titre: 'Procedure Systeme — Gestion des reclamations et appels',       type: 'instruction',     version: '1.0', statut: 'approuve',   process: 'PR-04', auteur: 'Resp. Qualite SMOE', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 35, reference: 'PS-SMOE-02',    titre: "Procedure Systeme — Maitrise de l'information documentee",     type: 'instruction',     version: '1.0', statut: 'approuve',   process: 'PR-03', auteur: 'Resp. Qualite SMOE', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 36, reference: 'PS-SMOE-03',    titre: 'Procedure Systeme — Satisfaction des parties interessees',     type: 'instruction',     version: '1.0', statut: 'approuve',   process: 'PR-04', auteur: 'Resp. Qualite SMOE', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 37, reference: 'PS-SMOE-04',    titre: 'Procedure Systeme — Communication interne et externe',         type: 'instruction',     version: '1.0', statut: 'approuve',   process: 'PR-01', auteur: 'Resp. Qualite SMOE', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 38, reference: 'PS-SMOE-05',    titre: 'Procedure Systeme — Gestion des competences SMOE',             type: 'instruction',     version: '1.0', statut: 'approuve',   process: 'PR-03', auteur: 'Resp. Qualite SMOE', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
  { id: 39, reference: 'GR-SMOE-01',    titre: 'Guide de referencement SMOE IFDL',                             type: 'charte',          version: '1.0', statut: 'approuve',   process: 'PR-01', auteur: 'Resp. Qualite SMOE', date_approbation: '2024-09-01', date_revision: '2026-09-01', file_url: '#' },
];

type Doc = typeof documents[0];

// ── Type configuration ────────────────────────────────────────────────────
const typeConfig: Record<string, { label: string; icon: React.ReactNode; badge: string; pill: string }> = {
  fiche_processus: { label: 'Fiche Processus', icon: <GitBranch className="h-3 w-3" />, badge: 'bg-teal-100 text-teal-700 border-teal-200', pill: 'bg-teal-100 text-teal-700' },
  procedure:   { label: 'Procédure',   icon: <BookOpen className="h-3 w-3" />,      badge: 'bg-blue-100 text-blue-700 border-blue-200',       pill: 'bg-blue-100 text-blue-700' },
  instruction: { label: 'Instruction', icon: <Settings className="h-3 w-3" />,      badge: 'bg-purple-100 text-purple-700 border-purple-200', pill: 'bg-purple-100 text-purple-700' },
  formulaire:  { label: 'Formulaire',  icon: <ClipboardList className="h-3 w-3" />, badge: 'bg-green-100 text-green-700 border-green-200',    pill: 'bg-green-100 text-green-700' },
  charte:      { label: 'Charte',      icon: <FileCheck className="h-3 w-3" />,     badge: 'bg-amber-100 text-amber-700 border-amber-200',    pill: 'bg-amber-100 text-amber-700' },
  rapport:     { label: 'Rapport',     icon: <BarChart2 className="h-3 w-3" />,     badge: 'bg-gray-100 text-gray-700 border-gray-200',       pill: 'bg-gray-100 text-gray-600' },
};

// ── Statut configuration ──────────────────────────────────────────────────
const statutConfig: Record<string, { label: string; badge: string; dot: string }> = {
  brouillon:   { label: 'Brouillon',   badge: 'bg-gray-100 text-gray-600',     dot: 'bg-gray-400' },
  en_revision: { label: 'En révision', badge: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-500' },
  approuve:    { label: 'Approuvé',    badge: 'bg-green-100 text-green-700',   dot: 'bg-green-500' },
  archive:     { label: 'Archivé',     badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
};

// ── Helpers ───────────────────────────────────────────────────────────────
const TODAY = new Date('2026-06-13');

function daysUntilRevision(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24));
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

// ── Print helpers ─────────────────────────────────────────────────────────
function printDoc(doc: Doc) {
  const tc = typeConfig[doc.type] ?? typeConfig.procedure;
  const sc = statutConfig[doc.statut] ?? statutConfig.brouillon;
  const date = new Date().toLocaleDateString('fr-MA', { day: '2-digit', month: 'long', year: 'numeric' });
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>Fiche Document — ${doc.reference}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #111; margin: 40px; }
    h1 { font-size: 18px; color: #1d4ed8; margin-bottom: 2px; }
    h2 { font-size: 12px; color: #6b7280; font-weight: normal; margin-top: 2px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; }
    .field { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 14px; }
    .field-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #6b7280; letter-spacing: .05em; }
    .field-value { font-size: 13px; font-weight: 600; margin-top: 2px; }
    .badge { display: inline-block; font-size: 11px; font-weight: 700; padding: 2px 10px; border-radius: 20px; background: #dbeafe; color: #1d4ed8; }
    .footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9ca3af; text-align: center; }
    @media print { @page { margin: 20mm; } }
  </style></head><body>
  <h1>${doc.reference} — ${doc.titre}</h1>
  <h2>SMART SMOE IFDL · ESEF Berrechid · Fiche document générée le ${date}</h2>
  <div class="grid">
    <div class="field"><div class="field-label">Type</div><div class="field-value">${tc.label}</div></div>
    <div class="field"><div class="field-label">Version</div><div class="field-value">v${doc.version}</div></div>
    <div class="field"><div class="field-label">Statut</div><div class="field-value">${sc.label}</div></div>
    <div class="field"><div class="field-label">Processus lié</div><div class="field-value">${doc.process}</div></div>
    <div class="field"><div class="field-label">Auteur / Rédacteur</div><div class="field-value">${doc.auteur}</div></div>
    <div class="field"><div class="field-label">Date d'approbation</div><div class="field-value">${formatDate(doc.date_approbation)}</div></div>
    <div class="field"><div class="field-label">Date de révision</div><div class="field-value">${formatDate(doc.date_revision)}</div></div>
    <div class="field"><div class="field-label">Référence</div><div class="field-value">${doc.reference}</div></div>
  </div>
  <div class="footer">SMART SMOE IFDL · ISO 21001:2018 §7.5 · ESEF Berrechid · Université Hassan 1er</div>
  </body></html>`;
  const w = window.open('', '_blank', 'width=800,height=650');
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); }, 400);
}

function printAllDocs(docs: Doc[]) {
  const date = new Date().toLocaleDateString('fr-MA', { day: '2-digit', month: 'long', year: 'numeric' });
  const rows = docs.map(d => {
    const tc = typeConfig[d.type] ?? typeConfig.procedure;
    const sc = statutConfig[d.statut] ?? statutConfig.brouillon;
    return `<tr>
      <td style="padding:7px 10px;font-size:11px;font-weight:700;color:#1d4ed8">${d.reference}</td>
      <td style="padding:7px 10px;font-size:12px">${d.titre}</td>
      <td style="padding:7px 10px;font-size:11px">${tc.label}</td>
      <td style="padding:7px 10px;font-size:11px;text-align:center">v${d.version}</td>
      <td style="padding:7px 10px;font-size:11px;color:${d.statut === 'approuve' ? '#16a34a' : d.statut === 'en_revision' ? '#d97706' : '#6b7280'}">${sc.label}</td>
      <td style="padding:7px 10px;font-size:11px">${d.process}</td>
      <td style="padding:7px 10px;font-size:11px;color:#6b7280">${formatDate(d.date_approbation)}</td>
      <td style="padding:7px 10px;font-size:11px;color:${isExpired(d.date_revision) ? '#dc2626' : isExpiringSoon(d.date_revision) ? '#d97706' : '#6b7280'}">${formatDate(d.date_revision)}</td>
    </tr>`;
  }).join('');
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>GED SMOE — Liste des documents</title>
  <style>
    body { font-family: Arial, sans-serif; color: #111; margin: 30px; }
    h1 { font-size: 18px; color: #1d4ed8; margin-bottom: 2px; }
    h2 { font-size: 12px; color: #6b7280; font-weight: normal; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
    th { background: #1d4ed8; color: white; padding: 7px 10px; font-size: 10px; text-align: left; }
    tr:nth-child(even) td { background: #f9fafb; }
    @media print { @page { margin: 15mm; size: landscape; } }
  </style></head><body>
  <h1>Gestion Documentaire GED — SMOE IFDL</h1>
  <h2>ISO 21001 §7.5 · ESEF Berrechid · Généré le ${date} · ${docs.length} document(s)</h2>
  <table><thead><tr>
    <th>Référence</th><th>Titre</th><th>Type</th><th style="text-align:center">Version</th>
    <th>Statut</th><th>Processus</th><th>Approbation</th><th>Proch. révision</th>
  </tr></thead><tbody>${rows}</tbody></table>
  </body></html>`;
  const w = window.open('', '_blank', 'width=1100,height=700');
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); }, 400);
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
      toast.success('Document ajouté avec succès');
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
                <option value="fiche_processus">Fiche Processus</option>
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
            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={onClose}>Annuler</Button>
            <Button size="sm" className="flex-1 h-8 text-xs gap-1" onClick={handleSubmit} disabled={loading}>
              <Upload className="h-3 w-3" /> {loading ? 'Enregistrement...' : 'Ajouter le document'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── View Modal ────────────────────────────────────────────────────────────
function DocViewModal({ doc, onClose, onPrint }: { doc: Doc; onClose: () => void; onPrint: () => void }) {
  const tc = typeConfig[doc.type] ?? typeConfig.procedure;
  const sc = statutConfig[doc.statut] ?? statutConfig.brouillon;
  const expired = isExpired(doc.date_revision);
  const expiringSoon = isExpiringSoon(doc.date_revision);
  const daysLeft = daysUntilRevision(doc.date_revision);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card border border-border rounded-xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded border inline-flex items-center gap-1', tc.badge)}>
                {tc.icon} {tc.label}
              </span>
              <span className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1', sc.badge)}>
                <div className={cn('w-1.5 h-1.5 rounded-full', sc.dot)} />
                {sc.label}
              </span>
            </div>
            <h3 className="text-sm font-bold leading-snug">{doc.titre}</h3>
            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{doc.reference} · v{doc.version}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground flex-shrink-0 ml-2">
            <X className="h-4 w-4" />
          </button>
        </div>

        <Separator className="mb-4" />

        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: 'Processus lié',      value: doc.process },
            { label: 'Auteur / Rédacteur', value: doc.auteur || '—' },
            { label: 'Date d\'approbation', value: formatDate(doc.date_approbation) },
            { label: 'Prochaine révision',  value: formatDate(doc.date_revision) },
          ].map(f => (
            <div key={f.label} className="bg-muted/30 rounded-lg p-3">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">{f.label}</p>
              <p className="text-xs font-semibold">{f.value}</p>
            </div>
          ))}
        </div>

        {(expired || expiringSoon) && (
          <div className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-2 mb-4 text-xs',
            expired ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-amber-50 border border-amber-200 text-amber-700'
          )}>
            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
            {expired
              ? 'Ce document a dépassé sa date de révision — mise à jour requise.'
              : `Ce document arrive à échéance dans ${daysLeft} jour(s).`}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={onClose}>Fermer</Button>
          <Button size="sm" className="flex-1 h-8 text-xs gap-1" onClick={onPrint}>
            <Download className="h-3 w-3" /> Télécharger fiche PDF
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────
function EditDocModal({ doc, onClose, onSave }: { doc: Doc; onClose: () => void; onSave: (updated: Doc) => void }) {
  const [form, setForm] = useState({ titre: doc.titre, version: doc.version, statut: doc.statut, auteur: doc.auteur });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.titre || !form.version) { setError('Titre et version sont requis'); return; }
    setLoading(true);
    setError('');
    try {
      await api.patch(`/documents/${doc.id}`, form);
      onSave({ ...doc, ...form });
      toast.success('Document mis à jour');
      onClose();
    } catch {
      setError('Erreur lors de la mise à jour.');
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
        className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold">Modifier le document</h3>
            <p className="text-[10px] text-muted-foreground font-mono">{doc.reference}</p>
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
          <div className="space-y-1">
            <Label className="text-xs font-medium">Titre *</Label>
            <Input value={form.titre} onChange={e => set('titre', e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Version *</Label>
              <Input value={form.version} onChange={e => set('version', e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Statut</Label>
              <select value={form.statut} onChange={e => set('statut', e.target.value)} className="w-full h-9 rounded-lg border border-input bg-background text-xs px-3">
                <option value="brouillon">Brouillon</option>
                <option value="en_revision">En révision</option>
                <option value="approuve">Approuvé</option>
                <option value="archive">Archivé</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">Auteur / Rédacteur</Label>
            <Input value={form.auteur} onChange={e => set('auteur', e.target.value)} className="h-9 text-sm" />
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={onClose}>Annuler</Button>
            <Button size="sm" className="flex-1 h-8 text-xs gap-1" onClick={handleSave} disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Document Row ──────────────────────────────────────────────────────────
function DocumentRow({
  doc, index, onView, onDownload, onEdit,
}: {
  doc: Doc; index: number;
  onView: () => void; onDownload: () => void; onEdit: () => void;
}) {
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
      <td className="py-3 px-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          {(expiringSoon || expired) && (
            <AlertTriangle className={cn('h-3.5 w-3.5 flex-shrink-0', expired ? 'text-red-500' : 'text-amber-500')} />
          )}
          <span className="text-[10px] font-mono font-semibold text-muted-foreground">{doc.reference}</span>
        </div>
      </td>

      <td className="py-3 px-3 border-b border-border/50">
        <p className="text-xs font-semibold leading-snug">{doc.titre}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{doc.auteur}</p>
      </td>

      <td className="py-3 px-3 border-b border-border/50">
        <span className={cn('text-[9px] font-semibold px-2 py-0.5 rounded border inline-flex items-center gap-1', typeCfg.badge)}>
          {typeCfg.icon} {typeCfg.label}
        </span>
      </td>

      <td className="py-3 px-3 border-b border-border/50 text-center">
        <span className="text-xs font-mono bg-muted/60 px-1.5 py-0.5 rounded">v{doc.version}</span>
      </td>

      <td className="py-3 px-3 border-b border-border/50">
        <div className="flex items-center gap-1.5">
          <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', statutCfg.dot)} />
          <span className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded', statutCfg.badge)}>{statutCfg.label}</span>
        </div>
      </td>

      <td className="py-3 px-3 border-b border-border/50">
        <span className="text-[9px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded">{doc.process}</span>
      </td>

      <td className="py-3 px-3 border-b border-border/50">
        <span className="text-[10px] text-muted-foreground">{formatDate(doc.date_approbation)}</span>
      </td>

      <td className="py-3 px-3 border-b border-border/50">
        <div>
          <span className={cn(
            'text-[10px] font-medium',
            expired ? 'text-red-600 font-semibold' : expiringSoon ? 'text-amber-600 font-semibold' : 'text-muted-foreground'
          )}>
            {formatDate(doc.date_revision)}
          </span>
          {expiringSoon && daysLeft !== null && <p className="text-[9px] text-amber-600 font-semibold">J-{daysLeft}</p>}
          {expired && <p className="text-[9px] text-red-600 font-semibold">Expirée</p>}
        </div>
      </td>

      <td className="py-3 px-3 border-b border-border/50">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" title="Voir" onClick={onView}>
            <Eye className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" title="Télécharger" onClick={onDownload}>
            <Download className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" title="Modifier" onClick={onEdit}>
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
  useEffect(() => {
    api.get('/documents').then(r => { if (Array.isArray(r.data) && r.data.length) setDocs(r.data); }).catch(() => {});
  }, []);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('tous');
  const [filterStatut, setFilterStatut] = useState('tous');
  const [showUpload, setShowUpload] = useState(false);
  const [viewDoc, setViewDoc] = useState<Doc | null>(null);
  const [editDoc, setEditDoc] = useState<Doc | null>(null);

  const handleAdd = (newDoc: NewDoc) => {
    setDocs(prev => [...prev, { id: prev.length + 1, ...newDoc, statut: 'brouillon', date_approbation: '', date_revision: '', file_url: '#' }]);
  };

  const handleSave = (updated: Doc) => {
    setDocs(prev => prev.map(d => d.id === updated.id ? updated : d));
  };

  const stats = useMemo(() => ({
    total: docs.length,
    approuves: docs.filter(d => d.statut === 'approuve').length,
    enRevision: docs.filter(d => d.statut === 'en_revision').length,
    expiringSoonCount: docs.filter(d => isExpiringSoon(d.date_revision)).length,
  }), [docs]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    docs.forEach(d => { counts[d.type] = (counts[d.type] ?? 0) + 1; });
    return counts;
  }, [docs]);

  const filtered = useMemo(() => docs.filter(d => {
    const matchSearch = d.titre.toLowerCase().includes(search.toLowerCase()) || d.reference.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'tous' || d.type === filterType;
    const matchStatut = filterStatut === 'tous' || d.statut === filterStatut;
    return matchSearch && matchType && matchStatut;
  }), [docs, search, filterType, filterStatut]);

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
          <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => printAllDocs(filtered)}>
            <Download className="h-3.5 w-3.5" /> Exporter PDF
          </Button>
          <Button size="sm" className="text-xs gap-1" onClick={() => setShowUpload(true)}>
            <Plus className="h-3.5 w-3.5" /> Nouveau document
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total documents', value: stats.total,             color: 'text-foreground',  icon: <FileText className="h-4 w-4 text-muted-foreground" /> },
          { label: 'Approuvés',       value: stats.approuves,         color: 'text-green-600',   icon: <CheckCircle2 className="h-4 w-4 text-green-500" /> },
          { label: 'En révision',     value: stats.enRevision,        color: 'text-amber-600',   icon: <Clock className="h-4 w-4 text-amber-500" /> },
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
            filterType === 'tous' ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
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
              filterType === key ? `${cfg.badge} border-current` : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
            )}
          >
            {cfg.icon} {cfg.label} ({typeCounts[key] ?? 0})
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
          <Input placeholder="Rechercher par titre, référence..." className="pl-9 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="h-8 rounded-lg border border-input bg-background text-xs px-3 min-w-[140px]" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="tous">Tous les types</option>
          <option value="fiche_processus">Fiche Processus</option>
          <option value="procedure">Procédure</option>
          <option value="instruction">Instruction</option>
          <option value="formulaire">Formulaire</option>
          <option value="charte">Charte</option>
          <option value="rapport">Rapport</option>
        </select>
        <select className="h-8 rounded-lg border border-input bg-background text-xs px-3 min-w-[140px]" value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
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
                {['Référence', 'Titre / Auteur', 'Type', 'Version', 'Statut', 'Processus', 'Approbation', 'Proch. révision', 'Actions'].map(h => (
                  <th key={h} className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide py-3 px-3 border-b border-border">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((doc, i) => (
                  <DocumentRow
                    key={doc.id}
                    doc={doc}
                    index={i}
                    onView={() => setViewDoc(doc)}
                    onDownload={() => printDoc(doc)}
                    onEdit={() => setEditDoc(doc)}
                  />
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

        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/20">
          <p className="text-[10px] text-muted-foreground">
            {filtered.length} document{filtered.length !== 1 ? 's' : ''} affiché{filtered.length !== 1 ? 's' : ''} sur {docs.length}
          </p>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> En révision / Expiration proche</span>
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Expirée</span>
          </div>
        </div>
      </Card>

      {/* Modals */}
      <AnimatePresence>
        {showUpload && <UploadModal onClose={() => setShowUpload(false)} onAdd={handleAdd} />}
        {viewDoc && (
          <DocViewModal
            doc={viewDoc}
            onClose={() => setViewDoc(null)}
            onPrint={() => { printDoc(viewDoc); setViewDoc(null); }}
          />
        )}
        {editDoc && (
          <EditDocModal
            doc={editDoc}
            onClose={() => setEditDoc(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
