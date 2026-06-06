/**
 * RiskHeatmap — Matrice de criticité 5×5
 * Visualisation interactive des risques SMOE
 */
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ── Mock risk data ────────────────────────────────────────────
const risks = [
  { id: 1, titre: 'Absentéisme des enseignants',        probabilite: 4, gravite: 4, statut: 'traite',    process: 'PR-02', categorie: 'RH' },
  { id: 2, titre: 'Panne de la plateforme Moodle',       probabilite: 3, gravite: 5, statut: 'surveille', process: 'PR-03', categorie: 'IT' },
  { id: 3, titre: 'Faible taux d\'insertion professionnelle', probabilite: 3, gravite: 4, statut: 'analyse', process: 'PR-02', categorie: 'Stratégique' },
  { id: 4, titre: 'Retard dans la délivrance des diplômes', probabilite: 3, gravite: 3, statut: 'identifie', process: 'PR-03', categorie: 'Administratif' },
  { id: 5, titre: 'Surcharge administrative',           probabilite: 4, gravite: 3, statut: 'traite',    process: 'PR-03', categorie: 'RH' },
  { id: 6, titre: 'Obsolescence des contenus pédagogiques', probabilite: 2, gravite: 4, statut: 'identifie', process: 'PR-02', categorie: 'Pédagogique' },
  { id: 7, titre: 'Manque de budget formation',          probabilite: 4, gravite: 2, statut: 'surveille', process: 'PR-01', categorie: 'Financier' },
  { id: 8, titre: 'Non-satisfaction des employeurs',    probabilite: 2, gravite: 3, statut: 'analyse',   process: 'PR-04', categorie: 'Partenaires' },
  { id: 9, titre: 'Fuite de données personnelles',      probabilite: 1, gravite: 5, statut: 'traite',    process: 'PR-03', categorie: 'IT' },
  { id: 10, titre: 'Perte d\'accréditation ANEAQ',       probabilite: 1, gravite: 5, statut: 'surveille', process: 'PR-01', categorie: 'Réglementaire' },
];

// ── Color mapping by criticité ─────────────────────────────
function getCellColor(criticite: number) {
  if (criticite >= 20) return { bg: 'bg-red-600',    text: 'text-white', border: 'border-red-700',    label: 'Critique' };
  if (criticite >= 15) return { bg: 'bg-red-400',    text: 'text-white', border: 'border-red-500',    label: 'Critique' };
  if (criticite >= 12) return { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-600', label: 'Élevé' };
  if (criticite >= 9)  return { bg: 'bg-orange-400', text: 'text-white', border: 'border-orange-500', label: 'Élevé' };
  if (criticite >= 6)  return { bg: 'bg-yellow-400', text: 'text-gray-900', border: 'border-yellow-500', label: 'Modéré' };
  if (criticite >= 4)  return { bg: 'bg-yellow-200', text: 'text-gray-800', border: 'border-yellow-300', label: 'Modéré' };
  if (criticite >= 2)  return { bg: 'bg-green-300',  text: 'text-gray-800', border: 'border-green-400', label: 'Faible' };
  return                      { bg: 'bg-green-200',  text: 'text-gray-700', border: 'border-green-300', label: 'Faible' };
}

function getNiveauBadge(criticite: number) {
  if (criticite >= 15) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  if (criticite >= 9)  return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
  if (criticite >= 4)  return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
  return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
}

function getStatutColor(statut: string) {
  const map: Record<string, string> = {
    identifie: 'bg-gray-100 text-gray-700',
    analyse:   'bg-blue-100 text-blue-700',
    traite:    'bg-purple-100 text-purple-700',
    surveille: 'bg-amber-100 text-amber-700',
    clos:      'bg-green-100 text-green-700',
  };
  return map[statut] ?? 'bg-gray-100 text-gray-600';
}

interface RiskDetail {
  id: number;
  titre: string;
  probabilite: number;
  gravite: number;
  statut: string;
  process: string;
  categorie: string;
}

export function RiskHeatmap() {
  const [selectedCell, setSelectedCell] = useState<{ p: number; g: number } | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<RiskDetail | null>(null);

  // Build matrix: [probabilite][gravite] → risks[]
  const matrix: Record<string, RiskDetail[]> = {};
  for (let p = 1; p <= 5; p++) {
    for (let g = 1; g <= 5; g++) {
      matrix[`${p}-${g}`] = risks.filter(r => r.probabilite === p && r.gravite === g);
    }
  }

  const cellRisks = selectedCell ? matrix[`${selectedCell.p}-${selectedCell.g}`] : [];

  const graviteLabels  = ['Négligeable', 'Mineure', 'Significative', 'Majeure', 'Catastrophique'];
  const probaLabels    = ['Très rare', 'Rare', 'Possible', 'Probable', 'Très probable'];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

      {/* ── Heatmap Matrix ─────────────────────────────── */}
      <Card className="xl:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Matrice de Criticité des Risques (5×5)
          </CardTitle>
          <CardDescription className="text-xs">
            Cliquez sur une cellule pour voir les risques associés · {risks.length} risques actifs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {/* Y-axis label */}
            <div className="flex items-center">
              <div className="text-[10px] text-muted-foreground -rotate-90 whitespace-nowrap font-medium">
                PROBABILITÉ →
              </div>
            </div>

            <div className="flex-1">
              {/* Grid */}
              <div className="grid gap-1" style={{ gridTemplateColumns: 'auto repeat(5, 1fr)' }}>

                {/* Probability rows (5 → 1) */}
                {[5, 4, 3, 2, 1].map((p) => (
                  <>
                    {/* Row label */}
                    <div key={`label-${p}`} className="flex items-center justify-end pr-2 text-[9px] text-muted-foreground w-16 text-right">
                      <span className="font-medium">{p}</span>
                      <span className="ml-1 hidden sm:inline">– {probaLabels[p - 1]}</span>
                    </div>

                    {/* Cells */}
                    {[1, 2, 3, 4, 5].map((g) => {
                      const criticite = p * g;
                      const cellColor = getCellColor(criticite);
                      const cellRisksCount = matrix[`${p}-${g}`].length;
                      const isSelected = selectedCell?.p === p && selectedCell?.g === g;

                      return (
                        <motion.button
                          key={`${p}-${g}`}
                          whileHover={{ scale: 1.05, zIndex: 10 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setSelectedCell(
                            isSelected ? null : { p, g }
                          )}
                          className={cn(
                            'relative aspect-square rounded-lg border-2 transition-all',
                            'flex flex-col items-center justify-center gap-0.5',
                            cellColor.bg, cellColor.border, cellColor.text,
                            isSelected && 'ring-2 ring-primary ring-offset-2 scale-105',
                            'cursor-pointer hover:brightness-110'
                          )}
                        >
                          <span className="text-xs font-bold">{criticite}</span>
                          {cellRisksCount > 0 && (
                            <span className={cn(
                              'text-[9px] font-semibold px-1 rounded-full',
                              'bg-white/30 backdrop-blur-sm',
                            )}>
                              {cellRisksCount}R
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </>
                ))}

                {/* X-axis labels */}
                <div /> {/* empty corner */}
                {[1, 2, 3, 4, 5].map((g) => (
                  <div key={`glabel-${g}`} className="text-center pt-1">
                    <div className="text-[10px] font-medium text-muted-foreground">{g}</div>
                    <div className="text-[8px] text-muted-foreground/70 hidden sm:block leading-tight">
                      {graviteLabels[g - 1].split(' ')[0]}
                    </div>
                  </div>
                ))}
              </div>

              {/* X-axis label */}
              <div className="text-center mt-2 text-[10px] font-medium text-muted-foreground">
                GRAVITÉ →
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-border">
            {[
              { label: 'Critique (≥15)', bg: 'bg-red-500',    text: 'text-white' },
              { label: 'Élevé (9–14)',   bg: 'bg-orange-400', text: 'text-white' },
              { label: 'Modéré (4–8)',   bg: 'bg-yellow-400', text: 'text-gray-900' },
              { label: 'Faible (1–3)',   bg: 'bg-green-300',  text: 'text-gray-800' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs">
                <span className={cn('w-3 h-3 rounded', l.bg)} />
                <span className="text-muted-foreground">{l.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Right Panel ──────────────────────────────────── */}
      <div className="space-y-4">

        {/* Cell detail */}
        <AnimatePresence mode="wait">
          {selectedCell ? (
            <motion.div
              key="cell-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    <span>
                      Cellule P{selectedCell.p} × G{selectedCell.g} = {selectedCell.p * selectedCell.g}
                    </span>
                    <button onClick={() => setSelectedCell(null)}>
                      <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  </CardTitle>
                  <div className={cn('text-xs font-semibold px-2 py-0.5 rounded-full w-fit', getNiveauBadge(selectedCell.p * selectedCell.g))}>
                    {getCellColor(selectedCell.p * selectedCell.g).label}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {cellRisks.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Aucun risque dans cette cellule
                    </p>
                  ) : (
                    cellRisks.map(r => (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-2.5 rounded-lg border border-border bg-card hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => setSelectedRisk(r)}
                      >
                        <p className="text-xs font-medium leading-snug">{r.titre}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">{r.process}</span>
                          <span className={cn('text-[10px] px-1.5 py-0.5 rounded', getStatutColor(r.statut))}>
                            {r.statut}
                          </span>
                          <span className="text-[10px] text-muted-foreground ml-auto">{r.categorie}</span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <AlertTriangle className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Cliquez sur une cellule pour voir les risques
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top risks */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Top 5 Risques Critiques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {risks
              .sort((a, b) => (b.probabilite * b.gravite) - (a.probabilite * a.gravite))
              .slice(0, 5)
              .map((r, i) => {
                const criticite = r.probabilite * r.gravite;
                return (
                  <div key={r.id} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                    <div className={cn('w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0', getCellColor(criticite).bg, getCellColor(criticite).text)}>
                      {criticite}
                    </div>
                    <p className="text-xs flex-1 leading-snug truncate">{r.titre}</p>
                  </div>
                );
              })}
          </CardContent>
        </Card>
      </div>

      {/* ── Risk Detail Modal ─────────────────────────────── */}
      <AnimatePresence>
        {selectedRisk && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedRisk(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-xl p-5 max-w-md w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2 w-fit', getNiveauBadge(selectedRisk.probabilite * selectedRisk.gravite))}>
                    {getCellColor(selectedRisk.probabilite * selectedRisk.gravite).label}
                    &nbsp;· Criticité {selectedRisk.probabilite * selectedRisk.gravite}
                  </div>
                  <h3 className="text-sm font-semibold">{selectedRisk.titre}</h3>
                </div>
                <button onClick={() => setSelectedRisk(null)}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                {[
                  { label: 'Probabilité', value: `${selectedRisk.probabilite}/5` },
                  { label: 'Gravité', value: `${selectedRisk.gravite}/5` },
                  { label: 'Processus', value: selectedRisk.process },
                  { label: 'Catégorie', value: selectedRisk.categorie },
                  { label: 'Statut', value: selectedRisk.statut },
                ].map(item => (
                  <div key={item.label} className="bg-muted/50 rounded-lg px-3 py-2">
                    <p className="text-muted-foreground mb-0.5">{item.label}</p>
                    <p className="font-semibold capitalize">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => setSelectedRisk(null)}>
                  Fermer
                </Button>
                <Button size="sm" className="flex-1 text-xs gap-1">
                  <ExternalLink className="h-3 w-3" /> Voir le détail
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
