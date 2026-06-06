/**
 * Réclamations & Recours — Portail complet
 * Dépôt · Traitement · Suivi · Historique
 */
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Plus, Search, Filter, Clock, CheckCircle2,
  AlertCircle, X, User, Calendar, FileText, Eye, Send,
  ChevronRight, Download, Inbox,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const complaints = [
  {
    id: 1, reference: 'REC-2026-001', type: 'reclamation',
    objet: 'Retard dans la remise des notes S3',
    description: 'Les notes du module Ingénierie Pédagogique S3 ne sont pas encore disponibles sur Apogée à J+15 après les examens.',
    declarant: 'Étudiant IFDL', statut: 'en_cours', priorite: 'haute',
    date_depot: '2026-05-20', date_traitement: null, date_cloture: null,
    traitement: 'M. Karim Tahiri', delai: null, process: 'PR-02',
    historique: [
      { date: '2026-05-20', action: 'Réclamation déposée', auteur: 'Étudiant IFDL' },
      { date: '2026-05-21', action: 'Accusé de réception envoyé', auteur: 'Personnel Admin' },
      { date: '2026-05-22', action: 'Transmis au coordinateur', auteur: 'Resp. Qualité' },
    ],
  },
  {
    id: 2, reference: 'REC-2026-002', type: 'reclamation',
    objet: 'Inaccessibilité des ressources Moodle',
    description: 'Impossibilité d\'accéder aux cours en ligne depuis 3 jours. Les supports pédagogiques du module Digital Learning sont indisponibles.',
    declarant: 'Plusieurs étudiants', statut: 'resolue', priorite: 'haute',
    date_depot: '2026-05-15', date_traitement: '2026-05-16', date_cloture: '2026-05-17',
    traitement: 'Service Informatique', delai: 2, process: 'PR-03',
    historique: [
      { date: '2026-05-15', action: 'Réclamation déposée', auteur: 'Étudiants' },
      { date: '2026-05-16', action: 'Incident technique identifié', auteur: 'SI' },
      { date: '2026-05-17', action: 'Plateforme restaurée + notification', auteur: 'SI' },
    ],
  },
  {
    id: 3, reference: 'REC-2026-003', type: 'recours',
    objet: 'Contestation note examen Formation des Adultes',
    description: 'Je conteste la note obtenue à l\'examen du module Formation des Adultes. Ma copie n\'a pas été correctement évaluée sur la question 3.',
    declarant: 'M. Rachid Alaoui', statut: 'deposee', priorite: 'normale',
    date_depot: '2026-06-01', date_traitement: null, date_cloture: null,
    traitement: null, delai: null, process: 'PR-02',
    historique: [
      { date: '2026-06-01', action: 'Recours déposé', auteur: 'M. Rachid Alaoui' },
    ],
  },
  {
    id: 4, reference: 'REC-2026-004', type: 'suggestion',
    objet: 'Proposition : Ajout module IA Générative',
    description: 'Suggère l\'intégration d\'un module sur l\'IA générative dans les outils digitaux de formation pour le prochain semestre.',
    declarant: 'Pr. Samir Bensaid', statut: 'en_cours', priorite: 'basse',
    date_depot: '2026-05-10', date_traitement: '2026-05-12', date_cloture: null,
    traitement: 'Commission pédagogique', delai: null, process: 'PR-01',
    historique: [
      { date: '2026-05-10', action: 'Suggestion soumise', auteur: 'Pr. Samir Bensaid' },
      { date: '2026-05-12', action: 'Transmis à la commission pédagogique', auteur: 'Coordonnateur' },
    ],
  },
  {
    id: 5, reference: 'REC-2026-005', type: 'reclamation',
    objet: 'Conditions de passation des examens insuffisantes',
    description: 'La salle d\'examen B12 était surchauffée et les conditions ne permettaient pas une concentration optimale.',
    declarant: 'Étudiants S2', statut: 'cloturee', priorite: 'normale',
    date_depot: '2026-04-25', date_traitement: '2026-04-26', date_cloture: '2026-05-05',
    traitement: 'Direction ESEF', delai: 10, process: 'PR-03',
    historique: [
      { date: '2026-04-25', action: 'Réclamation collective déposée', auteur: 'Étudiants S2' },
      { date: '2026-04-26', action: 'Constat effectué', auteur: 'Direction' },
      { date: '2026-05-05', action: 'Climatisation réparée + mesures correctives', auteur: 'Direction' },
    ],
  },
];

const typeConfig = {
  reclamation: { label: 'Réclamation', bg: 'bg-red-100 text-red-700',    border: 'border-red-200' },
  recours:     { label: 'Recours',     bg: 'bg-orange-100 text-orange-700', border: 'border-orange-200' },
  suggestion:  { label: 'Suggestion',  bg: 'bg-blue-100 text-blue-700',   border: 'border-blue-200' },
  appel:       { label: 'Appel',       bg: 'bg-purple-100 text-purple-700', border: 'border-purple-200' },
};

const statutConfig: Record<string, { label: string; badge: string; dot: string }> = {
  deposee:  { label: 'Déposée',   badge: 'bg-gray-100 text-gray-600',    dot: 'bg-gray-400' },
  en_cours: { label: 'En cours',  badge: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500' },
  resolue:  { label: 'Résolue',   badge: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  cloturee: { label: 'Clôturée',  badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  rejetee:  { label: 'Rejetée',   badge: 'bg-red-100 text-red-700',      dot: 'bg-red-500' },
};

const prioriteConfig: Record<string, string> = {
  urgente: 'bg-red-100 text-red-700',
  haute:   'bg-orange-100 text-orange-700',
  normale: 'bg-gray-100 text-gray-600',
  basse:   'bg-green-100 text-green-700',
};

// ── Depot Form ─────────────────────────────────────────────────
function DepotForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card border border-border rounded-xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold">Déposer une réclamation / recours</h3>
            <p className="text-xs text-muted-foreground">Master IFDL · ESEF Berrechid</p>
          </div>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Type</Label>
              <select className="w-full h-9 rounded-lg border border-input bg-background text-xs px-3">
                <option value="reclamation">Réclamation</option>
                <option value="recours">Recours</option>
                <option value="suggestion">Suggestion</option>
                <option value="appel">Appel</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Priorité</Label>
              <select className="w-full h-9 rounded-lg border border-input bg-background text-xs px-3">
                <option value="normale">Normale</option>
                <option value="haute">Haute</option>
                <option value="urgente">Urgente</option>
                <option value="basse">Basse</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Objet *</Label>
            <Input placeholder="Résumé bref de la réclamation..." className="h-9 text-sm" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Description détaillée *</Label>
            <textarea
              className="w-full h-24 rounded-lg border border-input bg-background text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Décrivez précisément votre réclamation, le contexte, les faits observés..."
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Processus concerné</Label>
            <select className="w-full h-9 rounded-lg border border-input bg-background text-xs px-3">
              <option value="">Sélectionner...</option>
              <option value="PR-01">PR-01 — Pilotage</option>
              <option value="PR-02">PR-02 — Réalisation pédagogique</option>
              <option value="PR-03">PR-03 — Support</option>
              <option value="PR-04">PR-04 — Évaluation</option>
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Pièces jointes (optionnel)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-3 text-center cursor-pointer hover:bg-muted/30 transition-colors">
              <FileText className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">Glisser-déposer ou cliquer pour joindre des fichiers</p>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">PDF, JPG, PNG · Max 10 Mo</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 bg-muted/30 rounded-lg">
            <input type="checkbox" id="anon" className="rounded" />
            <label htmlFor="anon" className="text-xs cursor-pointer">Soumettre de manière anonyme</label>
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={onClose}>Annuler</Button>
            <Button size="sm" className="flex-1 h-8 text-xs gap-1" onClick={onClose}>
              <Send className="h-3 w-3" /> Soumettre
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function ComplaintsPage() {
  const [search, setSearch]     = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<typeof complaints[0] | null>(null);

  const filtered = complaints.filter(c =>
    c.objet.toLowerCase().includes(search.toLowerCase()) ||
    c.reference.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total:    complaints.length,
    deposee:  complaints.filter(c => c.statut === 'deposee').length,
    en_cours: complaints.filter(c => c.statut === 'en_cours').length,
    resolue:  complaints.filter(c => ['resolue', 'cloturee'].includes(c.statut)).length,
    delai_moy: Math.round(complaints.filter(c => c.delai).reduce((s, c) => s + (c.delai ?? 0), 0) / complaints.filter(c => c.delai).length),
  };

  return (
    <div className="page-container animate-fade-up">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Réclamations & Recours
          </h1>
          <p className="page-subtitle">
            Portail de dépôt · Workflow de traitement · Suivi · Master IFDL
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs gap-1">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button size="sm" className="text-xs gap-1" onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5" /> Nouvelle réclamation
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total',        value: stats.total,    color: 'text-foreground' },
          { label: 'En attente',   value: stats.deposee,  color: 'text-gray-600' },
          { label: 'En cours',     value: stats.en_cours, color: 'text-blue-600' },
          { label: 'Résolues',     value: stats.resolue,  color: 'text-green-600' },
          { label: 'Délai moy.',   value: `${stats.delai_moy}j`, color: stats.delai_moy <= 10 ? 'text-green-600' : 'text-amber-600' },
        ].map(s => (
          <Card key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Rechercher..." className="pl-9 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
          <Filter className="h-3.5 w-3.5" /> Filtrer
        </Button>
      </div>

      {/* List + Detail */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* List */}
        <div className="xl:col-span-2 space-y-2">
          {filtered.map(c => {
            const typeCfg   = typeConfig[c.type as keyof typeof typeConfig] ?? typeConfig.reclamation;
            const statutCfg = statutConfig[c.statut] ?? statutConfig.deposee;
            return (
              <motion.div key={c.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card
                  className={cn('cursor-pointer hover:shadow-md transition-all overflow-hidden', selected?.id === c.id && 'ring-2 ring-primary/30')}
                  onClick={() => setSelected(selected?.id === c.id ? null : c)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn('w-2 h-2 rounded-full flex-shrink-0 mt-2', statutCfg.dot)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-mono text-muted-foreground">{c.reference}</span>
                          <span className={cn('text-[9px] font-semibold px-2 py-0.5 rounded border', typeCfg.bg, typeCfg.border)}>
                            {typeCfg.label}
                          </span>
                          <span className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded', prioriteConfig[c.priorite])}>
                            {c.priorite}
                          </span>
                          <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">{c.process}</span>
                        </div>
                        <p className="text-sm font-semibold">{c.objet}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{c.description}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1"><User className="h-2.5 w-2.5" /> {c.declarant}</span>
                          <span className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5" /> {new Date(c.date_depot).toLocaleDateString('fr-MA')}</span>
                          {c.traitement && <span className="flex items-center gap-1">→ {c.traitement}</span>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', statutCfg.badge)}>
                          {statutCfg.label}
                        </span>
                        {c.delai && (
                          <span className={cn('text-[10px] font-semibold', c.delai <= 10 ? 'text-green-600' : 'text-amber-600')}>
                            {c.delai}j traitement
                          </span>
                        )}
                        <ChevronRight className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', selected?.id === c.id && 'rotate-90')} />
                      </div>
                    </div>
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
                      <CardTitle className="text-sm font-semibold">Détail de la réclamation</CardTitle>
                      <button onClick={() => setSelected(null)}><X className="h-4 w-4 text-muted-foreground" /></button>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground">{selected.reference}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold">{selected.objet}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{selected.description}</p>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { label: 'Type',      value: typeConfig[selected.type as keyof typeof typeConfig]?.label },
                        { label: 'Statut',    value: statutConfig[selected.statut]?.label },
                        { label: 'Priorité',  value: selected.priorite },
                        { label: 'Processus', value: selected.process },
                        { label: 'Déclarant', value: selected.declarant },
                        { label: 'Dépôt',     value: new Date(selected.date_depot).toLocaleDateString('fr-MA') },
                      ].map(item => (
                        <div key={item.label} className="bg-muted/40 rounded px-2 py-1.5">
                          <p className="text-muted-foreground text-[10px]">{item.label}</p>
                          <p className="font-semibold capitalize">{item.value}</p>
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
                      {selected.statut === 'deposee' && (
                        <Button size="sm" className="flex-1 text-xs gap-1 h-7">
                          <Send className="h-3 w-3" /> Prendre en charge
                        </Button>
                      )}
                      {selected.statut === 'en_cours' && (
                        <Button size="sm" className="flex-1 text-xs gap-1 h-7">
                          <CheckCircle2 className="h-3 w-3" /> Résoudre
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
                    <p className="text-sm text-muted-foreground">Sélectionnez une réclamation pour voir les détails</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showForm && <DepotForm onClose={() => setShowForm(false)} />}
      </AnimatePresence>
    </div>
  );
}
