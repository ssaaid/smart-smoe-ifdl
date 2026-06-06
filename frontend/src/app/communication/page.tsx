/**
 * Communication Institutionnelle
 * Annonces · Circulaires · Messagerie interne
 */
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, Megaphone, Mail, FileText, Eye, Send,
  Users, Calendar, CheckCircle2, Circle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// ── Mock Data ──────────────────────────────────────────────────

const annonces = [
  {
    id: 1,
    titre: "Calendrier des soutenances de mémoires — Session Juin 2026",
    date: "2026-06-02",
    categorie: "Pédagogique",
    priorite: "haute",
    description:
      "Les soutenances de mémoires de fin d'études du Master IFDL se dérouleront du 23 au 27 juin 2026. Les étudiants sont invités à déposer leur version finale avant le 15 juin.",
  },
  {
    id: 2,
    titre: "Journée Qualité ISO 21001 — Atelier de sensibilisation",
    date: "2026-05-28",
    categorie: "Qualité",
    priorite: "haute",
    description:
      "Un atelier de sensibilisation au référentiel ISO 21001 est organisé le 10 juin 2026 à 10h00 en salle de conférences. La participation est obligatoire pour l'ensemble du personnel enseignant.",
  },
  {
    id: 3,
    titre: "Mise à jour du règlement intérieur pédagogique 2026",
    date: "2026-05-20",
    categorie: "Administrative",
    priorite: "normale",
    description:
      "Le règlement intérieur pédagogique a été révisé conformément aux recommandations du Conseil Scientifique. Le document mis à jour est disponible sur la plateforme Moodle.",
  },
  {
    id: 4,
    titre: "Appel à candidatures — Formateurs vacataires S5",
    date: "2026-05-15",
    categorie: "Administrative",
    priorite: "normale",
    description:
      "L'ESEF Berrechid lance un appel à candidatures pour des postes de formateurs vacataires pour le semestre S5. Dossiers à déposer avant le 30 juin 2026.",
  },
  {
    id: 5,
    titre: "Résultats de l'audit interne ISO 21001 — Rapport préliminaire",
    date: "2026-05-10",
    categorie: "Qualité",
    priorite: "basse",
    description:
      "Le rapport préliminaire de l'audit interne ISO 21001 conduit en avril 2026 est disponible. Deux non-conformités mineures ont été identifiées et font l'objet de plans d'action.",
  },
];

const circulaires = [
  {
    id: 1,
    reference: "CIR-2026-014",
    titre: "Organisation des examens de fin de semestre S4",
    date: "2026-06-01",
    destinataires: "Corps enseignant & étudiants",
    statut: "active",
  },
  {
    id: 2,
    reference: "CIR-2026-013",
    titre: "Procédures de gestion des absences — Rappel réglementaire",
    date: "2026-05-22",
    destinataires: "Corps enseignant",
    statut: "active",
  },
  {
    id: 3,
    reference: "CIR-2026-012",
    titre: "Modalités de dépôt des rapports de stage en entreprise",
    date: "2026-05-14",
    destinataires: "Étudiants Master IFDL",
    statut: "active",
  },
  {
    id: 4,
    reference: "CIR-2026-011",
    titre: "Budget prévisionnel formations continues 2026-2027",
    date: "2026-04-30",
    destinataires: "Direction & Responsables",
    statut: "archivee",
  },
  {
    id: 5,
    reference: "CIR-2026-010",
    titre: "Révision des fiches pédagogiques — Modules S3",
    date: "2026-04-18",
    destinataires: "Coordinateurs pédagogiques",
    statut: "archivee",
  },
];

const messages = [
  {
    id: 1,
    expediteur: "Dr. Fatima Zahrae Benali",
    sujet: "Demande de validation — Plan de cours M2 Ingénierie Pédagogique",
    date: "2026-06-05",
    lu: false,
    avatar: "FZ",
  },
  {
    id: 2,
    expediteur: "M. Hassan Ouchaoua (Admin)",
    sujet: "Rappel : Mise à jour des fiches de présence semaine 23",
    date: "2026-06-04",
    lu: false,
    avatar: "HO",
  },
  {
    id: 3,
    expediteur: "Resp. Qualité ESEF",
    sujet: "Action corrective AC-2026-07 — Suivi requis",
    date: "2026-06-03",
    lu: false,
    avatar: "RQ",
  },
  {
    id: 4,
    expediteur: "Pr. Samir Bensaid",
    sujet: "Proposition calendrier réunion commission pédagogique",
    date: "2026-06-01",
    lu: true,
    avatar: "SB",
  },
  {
    id: 5,
    expediteur: "Service Informatique ESEF",
    sujet: "Maintenance Moodle — Samedi 7 juin 2026 de 22h à 02h",
    date: "2026-05-30",
    lu: true,
    avatar: "SI",
  },
];

// ── Config helpers ─────────────────────────────────────────────

const categorieConfig: Record<string, string> = {
  Pédagogique:   "bg-blue-100 text-blue-700 border-blue-200",
  Administrative: "bg-gray-100 text-gray-700 border-gray-200",
  Qualité:        "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const prioriteConfig: Record<string, string> = {
  haute:  "bg-orange-100 text-orange-700",
  normale: "bg-gray-100 text-gray-600",
  basse:  "bg-green-100 text-green-700",
};

const statutConfig: Record<string, { label: string; cls: string }> = {
  active:   { label: "Active",    cls: "bg-green-100 text-green-700" },
  archivee: { label: "Archivée",  cls: "bg-gray-100 text-gray-500" },
};

// ── Main Page ──────────────────────────────────────────────────

export default function CommunicationPage() {
  const [activeTab, setActiveTab] = useState("annonces");

  const stats = [
    { label: "Annonces actives", value: 8,  color: "text-blue-600",    icon: Megaphone },
    { label: "Non lus",          value: 3,  color: "text-orange-600",  icon: Bell },
    { label: "Circulaires",      value: 12, color: "text-emerald-600", icon: FileText },
    { label: "Messages",         value: 24, color: "text-purple-600",  icon: Mail },
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
        <Button size="sm" className="text-xs gap-1">
          <Send className="h-3.5 w-3.5" /> Nouveau message
        </Button>
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
          <TabsTrigger value="annonces"   className="text-xs gap-1.5"><Megaphone className="h-3.5 w-3.5" /> Annonces</TabsTrigger>
          <TabsTrigger value="circulaires" className="text-xs gap-1.5"><FileText className="h-3.5 w-3.5" /> Circulaires</TabsTrigger>
          <TabsTrigger value="messagerie" className="text-xs gap-1.5"><Mail className="h-3.5 w-3.5" /> Messagerie</TabsTrigger>
        </TabsList>

        {/* ── Annonces ── */}
        <TabsContent value="annonces" className="mt-4 space-y-3">
          {annonces.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className="hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span
                          className={cn(
                            "text-[9px] font-semibold px-2 py-0.5 rounded border",
                            categorieConfig[a.categorie]
                          )}
                        >
                          {a.categorie}
                        </span>
                        <span
                          className={cn(
                            "text-[9px] font-semibold px-1.5 py-0.5 rounded",
                            prioriteConfig[a.priorite]
                          )}
                        >
                          {a.priorite}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Calendar className="h-2.5 w-2.5" />
                          {new Date(a.date).toLocaleDateString("fr-MA")}
                        </span>
                      </div>
                      <p className="text-sm font-semibold">{a.titre}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                        {a.description}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="h-7 px-2 flex-shrink-0">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* ── Circulaires ── */}
        <TabsContent value="circulaires" className="mt-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Registre des circulaires — ESEF Berrechid
                </CardTitle>
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
                      {circulaires.map((c, i) => (
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
                            <span
                              className={cn(
                                "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                                statutConfig[c.statut].cls
                              )}
                            >
                              {statutConfig[c.statut].label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Button variant="ghost" size="sm" className="h-6 px-2">
                              <Eye className="h-3 w-3" />
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
                  <Badge className="ml-1 text-[10px] h-4 bg-orange-100 text-orange-700 border-orange-200 font-semibold">
                    3 non lus
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {messages.map((m, i) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors cursor-pointer",
                        !m.lu && "bg-blue-50/40 dark:bg-blue-950/10"
                      )}
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
                <div className="p-3 text-center">
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1">
                    <Mail className="h-3.5 w-3.5" /> Voir tous les messages
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
