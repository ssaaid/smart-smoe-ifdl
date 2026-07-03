/**
 * Communication Institutionnelle
 * Annonces · Circulaires · Messagerie interne
 */
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Megaphone, Mail, FileText, Eye, Send,
  Users, Calendar, CheckCircle2, Circle, X,
  Download, Plus, ChevronDown, ChevronUp, Printer,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// ── Mock Data ──────────────────────────────────────────────────

const annoncesInit = [
  { id: 1, titre: "Calendrier des soutenances de mémoires — Session Juin 2026", date: "2026-06-02", categorie: "Pédagogique", priorite: "haute", description: "Les soutenances de mémoires de fin d'études du Master IFDL se dérouleront du 23 au 27 juin 2026. Les étudiants sont invités à déposer leur version finale avant le 15 juin." },
  { id: 2, titre: "Journée Qualité ISO 21001 — Atelier de sensibilisation", date: "2026-05-28", categorie: "Qualité", priorite: "haute", description: "Un atelier de sensibilisation au référentiel ISO 21001 est organisé le 10 juin 2026 à 10h00 en salle de conférences. La participation est obligatoire pour l'ensemble du personnel enseignant." },
  { id: 3, titre: "Mise à jour du règlement intérieur pédagogique 2026", date: "2026-05-20", categorie: "Administrative", priorite: "normale", description: "Le règlement intérieur pédagogique a été révisé conformément aux recommandations du Conseil Scientifique. Le document mis à jour est disponible sur la plateforme Moodle." },
  { id: 4, titre: "Appel à candidatures — Formateurs vacataires S5", date: "2026-05-15", categorie: "Administrative", priorite: "normale", description: "L'ESEF Berrechid lance un appel à candidatures pour des postes de formateurs vacataires pour le semestre S5. Dossiers à déposer avant le 30 juin 2026." },
  { id: 5, titre: "Résultats de l'audit interne ISO 21001 — Rapport préliminaire", date: "2026-05-10", categorie: "Qualité", priorite: "basse", description: "Le rapport préliminaire de l'audit interne ISO 21001 conduit en avril 2026 est disponible. Deux non-conformités mineures ont été identifiées et font l'objet de plans d'action." },
];

const circulairesInit = [
  { id: 1, reference: "CIR-2026-014", titre: "Organisation des examens de fin de semestre S4", date: "2026-06-01", destinataires: "Corps enseignant & étudiants", statut: "active" },
  { id: 2, reference: "CIR-2026-013", titre: "Procédures de gestion des absences — Rappel réglementaire", date: "2026-05-22", destinataires: "Corps enseignant", statut: "active" },
  { id: 3, reference: "CIR-2026-012", titre: "Modalités de dépôt des rapports de stage en entreprise", date: "2026-05-14", destinataires: "Étudiants Master IFDL", statut: "active" },
  { id: 4, reference: "CIR-2026-011", titre: "Budget prévisionnel formations continues 2026-2027", date: "2026-04-30", destinataires: "Direction & Responsables", statut: "archivee" },
  { id: 5, reference: "CIR-2026-010", titre: "Révision des fiches pédagogiques — Modules S3", date: "2026-04-18", destinataires: "Coordinateurs pédagogiques", statut: "archivee" },
];

const messagesInit = [
  { id: 1, expediteur: "Dr. Fatima Zahrae Benali", sujet: "Demande de validation — Plan de cours M2 Ingénierie Pédagogique", date: "2026-06-05", lu: false, avatar: "FZ" },
  { id: 2, expediteur: "M. Hassan Ouchaoua (Admin)", sujet: "Rappel : Mise à jour des fiches de présence semaine 23", date: "2026-06-04", lu: false, avatar: "HO" },
  { id: 3, expediteur: "Resp. Qualité ESEF", sujet: "Action corrective AC-2026-07 — Suivi requis", date: "2026-06-03", lu: false, avatar: "RQ" },
  { id: 4, expediteur: "Pr. Samir Bensaid", sujet: "Proposition calendrier réunion commission pédagogique", date: "2026-06-01", lu: true, avatar: "SB" },
  { id: 5, expediteur: "Service Informatique ESEF", sujet: "Maintenance Moodle — Samedi 7 juin 2026 de 22h à 02h", date: "2026-05-30", lu: true, avatar: "SI" },
];

// ── Config ────────────────────────────────────────────────────

const categorieConfig: Record<string, string> = {
  Pédagogique:    "bg-blue-100 text-blue-700 border-blue-200",
  Administrative: "bg-gray-100 text-gray-700 border-gray-200",
  Qualité:        "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const prioriteConfig: Record<string, string> = {
  haute:  "bg-orange-100 text-orange-700",
  normale: "bg-gray-100 text-gray-600",
  basse:  "bg-green-100 text-green-700",
};

const statutConfig: Record<string, { label: string; cls: string }> = {
  active:   { label: "Active",   cls: "bg-green-100 text-green-700" },
  archivee: { label: "Archivée", cls: "bg-gray-100 text-gray-500" },
};

// ── Print helpers ─────────────────────────────────────────────

function printCirculaire(c: typeof circulairesInit[0]) {
  const w = window.open('', '_blank');
  if (!w) return;
  const statut = statutConfig[c.statut]?.label ?? c.statut;
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
  <title>${c.reference} — ${c.titre}</title>
  <style>body{font-family:Arial,sans-serif;font-size:12px;padding:32px;color:#222;max-width:700px;margin:auto;}
  h2{color:#1a56db;}hr{border:none;border-top:1px solid #e5e7eb;margin:16px 0;}
  .meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;background:#f9fafb;padding:12px;border-radius:6px;}
  .meta-item{font-size:11px;}.meta-label{color:#6b7280;font-size:10px;margin-bottom:2px;}</style>
  </head><body>
  <p style="color:#6b7280;font-size:11px;margin-bottom:4px">SALHY Abdelilah SMART SMOE MASTER · ESEF Berrechid · Communication Institutionnelle</p>
  <h2>${c.reference}</h2>
  <h3 style="margin-top:4px;color:#111">${c.titre}</h3>
  <hr/>
  <div class="meta">
    <div class="meta-item"><div class="meta-label">Date</div>${new Date(c.date).toLocaleDateString('fr-MA')}</div>
    <div class="meta-item"><div class="meta-label">Statut</div>${statut}</div>
    <div class="meta-item" style="grid-column:span 2"><div class="meta-label">Destinataires</div>${c.destinataires}</div>
  </div>
  </body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 400);
}

function printAnnonces(list: typeof annoncesInit) {
  const w = window.open('', '_blank');
  if (!w) return;
  const rows = list.map(a => `
    <tr>
      <td style="padding:6px 10px;border:1px solid #ddd;font-size:11px">${a.titre}</td>
      <td style="padding:6px 10px;border:1px solid #ddd;font-size:11px;white-space:nowrap">${a.categorie}</td>
      <td style="padding:6px 10px;border:1px solid #ddd;font-size:11px">${a.priorite}</td>
      <td style="padding:6px 10px;border:1px solid #ddd;font-size:11px;white-space:nowrap">${new Date(a.date).toLocaleDateString('fr-MA')}</td>
    </tr>`).join('');
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
  <title>Annonces — Communication Institutionnelle</title>
  <style>body{font-family:Arial,sans-serif;font-size:11px;padding:20px;}
  table{border-collapse:collapse;width:100%;}th{background:#1a56db;color:#fff;padding:6px 10px;text-align:left;font-size:11px;}
  tr:nth-child(even) td{background:#f9fafb;}</style>
  </head><body>
  <h2 style="color:#1a56db;margin-bottom:4px">Annonces Institutionnelles</h2>
  <p style="color:#6b7280">SALHY Abdelilah SMART SMOE MASTER · ESEF Berrechid · ${new Date().toLocaleDateString('fr-MA')}</p>
  <table style="margin-top:12px"><thead><tr>
    <th>Titre</th><th>Catégorie</th><th>Priorité</th><th>Date</th>
  </tr></thead><tbody>${rows}</tbody></table>
  </body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 400);
}

// ── Compose Modal ─────────────────────────────────────────────

function ComposeModal({ onClose }: { onClose: () => void }) {
  const [destinataire, setDestinataire] = useState('');
  const [sujet,        setSujet]        = useState('');
  const [corps,        setCorps]        = useState('');
  const [sent,         setSent]         = useState(false);

  const handleSend = () => {
    if (!destinataire.trim() || !sujet.trim()) return;
    setSent(true);
    setTimeout(onClose, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card border border-border rounded-xl p-6 max-w-lg w-full shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold">Nouveau message</h3>
            <p className="text-xs text-muted-foreground">Communication Institutionnelle · ESEF Berrechid</p>
          </div>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>

        {sent ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="h-10 w-10 mx-auto text-green-500 mb-2" />
            <p className="text-sm font-semibold text-green-600">Message envoyé avec succès</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Destinataire *</Label>
              <Input value={destinataire} onChange={e => setDestinataire(e.target.value)} placeholder="Nom / fonction / groupe..." className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Sujet *</Label>
              <Input value={sujet} onChange={e => setSujet(e.target.value)} placeholder="Objet du message..." className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Message</Label>
              <textarea
                value={corps}
                onChange={e => setCorps(e.target.value)}
                className="w-full h-28 rounded-lg border border-input bg-background text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Rédigez votre message..."
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={onClose}>Annuler</Button>
              <Button size="sm" className="flex-1 h-8 text-xs gap-1" onClick={handleSend} disabled={!destinataire.trim() || !sujet.trim()}>
                <Send className="h-3 w-3" /> Envoyer
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────

export default function CommunicationPage() {
  const [activeTab,    setActiveTab]    = useState("annonces");
  const [showCompose,  setShowCompose]  = useState(false);
  const [expandedId,   setExpandedId]  = useState<number | null>(null);
  const [messageList,  setMessageList]  = useState(messagesInit);

  const nonLus = messageList.filter(m => !m.lu).length;

  const markRead = (id: number) => {
    setMessageList(prev => prev.map(m => m.id === id ? { ...m, lu: true } : m));
  };

  const stats = [
    { label: "Annonces actives", value: annoncesInit.length, color: "text-blue-600",    icon: Megaphone },
    { label: "Non lus",          value: nonLus,              color: "text-orange-600",  icon: Bell },
    { label: "Circulaires",      value: circulairesInit.length, color: "text-emerald-600", icon: FileText },
    { label: "Messages",         value: messageList.length,  color: "text-purple-600",  icon: Mail },
  ];

  return (
    <div className="page-container animate-fade-up">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Communication Institutionnelle
          </h1>
          <p className="page-subtitle">
            Annonces · Circulaires · Messagerie interne
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1"
            onClick={() => printAnnonces(annoncesInit)}
          >
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button size="sm" className="text-xs gap-1" onClick={() => setShowCompose(true)}>
            <Send className="h-3.5 w-3.5" /> Nouveau message
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <p className="stat-label">{s.label}</p>
                <s.icon className={cn("h-4 w-4", s.color)} />
              </div>
              <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-9">
          <TabsTrigger value="annonces"    className="text-xs gap-1.5"><Megaphone className="h-3.5 w-3.5" /> Annonces ({annoncesInit.length})</TabsTrigger>
          <TabsTrigger value="circulaires" className="text-xs gap-1.5"><FileText className="h-3.5 w-3.5" /> Circulaires ({circulairesInit.length})</TabsTrigger>
          <TabsTrigger value="messagerie"  className="text-xs gap-1.5">
            <Mail className="h-3.5 w-3.5" /> Messagerie
            {nonLus > 0 && (
              <span className="ml-0.5 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{nonLus}</span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Annonces ── */}
        <TabsContent value="annonces" className="mt-4 space-y-3">
          {annoncesInit.map((a, i) => {
            const isExpanded = expandedId === a.id;
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className={cn('hover:shadow-md transition-all', isExpanded && 'ring-2 ring-primary/20')}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={cn("text-[9px] font-semibold px-2 py-0.5 rounded border", categorieConfig[a.categorie])}>
                            {a.categorie}
                          </span>
                          <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded", prioriteConfig[a.priorite])}>
                            {a.priorite}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Calendar className="h-2.5 w-2.5" />
                            {new Date(a.date).toLocaleDateString("fr-MA")}
                          </span>
                        </div>
                        <p className="text-sm font-semibold">{a.titre}</p>
                        <AnimatePresence>
                          {isExpanded ? (
                            <motion.p
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="text-xs text-muted-foreground mt-1.5 leading-relaxed"
                            >
                              {a.description}
                            </motion.p>
                          ) : (
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                              {a.description}
                            </p>
                          )}
                        </AnimatePresence>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 flex-shrink-0"
                        onClick={() => setExpandedId(isExpanded ? null : a.id)}
                        title={isExpanded ? 'Réduire' : 'Lire plus'}
                      >
                        {isExpanded
                          ? <ChevronUp className="h-3.5 w-3.5" />
                          : <Eye className="h-3.5 w-3.5" />
                        }
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </TabsContent>

        {/* ── Circulaires ── */}
        <TabsContent value="circulaires" className="mt-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Registre des circulaires — ESEF Berrechid
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => {
                      const w = window.open('', '_blank');
                      if (!w) return;
                      const rows = circulairesInit.map(c => `
                        <tr>
                          <td style="padding:5px 8px;border:1px solid #ddd">${c.reference}</td>
                          <td style="padding:5px 8px;border:1px solid #ddd">${c.titre}</td>
                          <td style="padding:5px 8px;border:1px solid #ddd;white-space:nowrap">${new Date(c.date).toLocaleDateString('fr-MA')}</td>
                          <td style="padding:5px 8px;border:1px solid #ddd">${c.destinataires}</td>
                          <td style="padding:5px 8px;border:1px solid #ddd">${statutConfig[c.statut]?.label ?? c.statut}</td>
                        </tr>`).join('');
                      w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
                      <title>Registre Circulaires</title>
                      <style>body{font-family:Arial,sans-serif;font-size:11px;padding:20px;}
                      table{border-collapse:collapse;width:100%;}th{background:#1a56db;color:#fff;padding:5px 8px;}</style>
                      </head><body>
                      <h2 style="color:#1a56db">Registre des Circulaires — ESEF Berrechid</h2>
                      <p style="color:#6b7280">${new Date().toLocaleDateString('fr-MA')}</p>
                      <table><thead><tr><th>Référence</th><th>Titre</th><th>Date</th><th>Destinataires</th><th>Statut</th></tr></thead>
                      <tbody>${rows}</tbody></table></body></html>`);
                      w.document.close();
                      setTimeout(() => w.print(), 400);
                    }}
                  >
                    <Printer className="h-3 w-3" /> Imprimer
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <th className="text-left font-semibold px-4 py-2.5 text-muted-foreground uppercase tracking-wide text-[10px]">Référence</th>
                        <th className="text-left font-semibold px-4 py-2.5 text-muted-foreground uppercase tracking-wide text-[10px]">Titre</th>
                        <th className="text-left font-semibold px-4 py-2.5 text-muted-foreground uppercase tracking-wide text-[10px]">Date</th>
                        <th className="text-left font-semibold px-4 py-2.5 text-muted-foreground uppercase tracking-wide text-[10px]">Destinataires</th>
                        <th className="text-left font-semibold px-4 py-2.5 text-muted-foreground uppercase tracking-wide text-[10px]">Statut</th>
                        <th className="px-4 py-2.5" />
                      </tr>
                    </thead>
                    <tbody>
                      {circulairesInit.map((c, i) => (
                        <motion.tr
                          key={c.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                        >
                          <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">{c.reference}</td>
                          <td className="px-4 py-3 font-medium max-w-[280px]">
                            <p className="line-clamp-1">{c.titre}</p>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                            {new Date(c.date).toLocaleDateString("fr-MA")}
                          </td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Users className="h-3 w-3" /> {c.destinataires}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", statutConfig[c.statut].cls)}>
                              {statutConfig[c.statut].label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              title="Imprimer la circulaire"
                              onClick={() => printCirculaire(c)}
                            >
                              <Printer className="h-3 w-3" />
                            </Button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Messagerie ── */}
        <TabsContent value="messagerie" className="mt-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Boîte de réception
                  {nonLus > 0 && (
                    <Badge className="ml-1 text-[10px] h-4 bg-orange-100 text-orange-700 border-orange-200 font-semibold">
                      {nonLus} non lu{nonLus > 1 ? 's' : ''}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {messageList.map((m, i) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors cursor-pointer",
                        !m.lu && "bg-blue-50/40 dark:bg-blue-950/10"
                      )}
                      onClick={() => markRead(m.id)}
                      title={!m.lu ? 'Cliquer pour marquer comme lu' : ''}
                    >
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                        {m.avatar}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn("text-xs truncate", !m.lu ? "font-semibold" : "font-medium text-muted-foreground")}>
                            {m.expediteur}
                          </p>
                          {!m.lu && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className={cn("text-xs mt-0.5 truncate", !m.lu ? "text-foreground" : "text-muted-foreground")}>
                          {m.sujet}
                        </p>
                      </div>

                      {/* Date + status */}
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {new Date(m.date).toLocaleDateString("fr-MA")}
                        </span>
                        {m.lu
                          ? <CheckCircle2 className="h-3 w-3 text-muted-foreground/40" />
                          : <Circle className="h-3 w-3 text-blue-500" />
                        }
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Separator />
                <div className="p-3 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground gap-1"
                    onClick={() => setMessageList(prev => prev.map(m => ({ ...m, lu: true })))}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Tout marquer comme lu
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground gap-1"
                    onClick={() => setShowCompose(true)}
                  >
                    <Send className="h-3.5 w-3.5" /> Nouveau message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Compose modal */}
      <AnimatePresence>
        {showCompose && <ComposeModal onClose={() => setShowCompose(false)} />}
      </AnimatePresence>
    </div>
  );
}
