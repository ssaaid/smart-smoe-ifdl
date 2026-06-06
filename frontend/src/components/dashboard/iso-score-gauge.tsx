'use client';

import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

interface IsoScoreGaugeProps {
  score: number;
  niveau?: string;
}

function getColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#f97316';
  return '#ef4444';
}

export function IsoScoreGauge({ score, niveau }: IsoScoreGaugeProps) {
  const color = getColor(score);

  const data = [
    { name: 'Score', value: score, fill: color },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Score de Maturité ISO 21001
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height={240}>
            <RadialBarChart
              cx="50%"
              cy="55%"
              innerRadius="60%"
              outerRadius="80%"
              barSize={14}
              data={data}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar
                background={{ fill: 'hsl(var(--muted))' }}
                dataKey="value"
                cornerRadius={7}
                max={100}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ marginTop: '20px' }}>
            <span className="text-4xl font-bold" style={{ color }}>
              {score}
            </span>
            <span className="text-xs text-muted-foreground mt-1">/ 100</span>
            {niveau && (
              <span className="text-xs font-medium mt-1 px-2 py-0.5 rounded-full" style={{ background: `${color}20`, color }}>
                {niveau}
              </span>
            )}
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <div className="font-semibold text-red-500">&lt;60</div>
            <div className="text-muted-foreground">Initial</div>
          </div>
          <div>
            <div className="font-semibold text-orange-500">60–79</div>
            <div className="text-muted-foreground">Maîtrisé</div>
          </div>
          <div>
            <div className="font-semibold text-green-500">80+</div>
            <div className="text-muted-foreground">Optimisé</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
