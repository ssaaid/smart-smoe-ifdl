'use client';

import { Activity, CheckCircle2, AlertTriangle, FileText, Users, ClipboardCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: number;
  type: 'action' | 'audit' | 'risk' | 'complaint' | 'document' | 'user';
  message: string;
  time: string;
  user: string;
  severity?: 'info' | 'warning' | 'success' | 'error';
}

const mockActivity: ActivityItem[] = [
  { id: 1, type: 'action', message: 'Action corrective AC-2024-012 clôturée', time: 'Il y a 2h', user: 'M. Alaoui', severity: 'success' },
  { id: 2, type: 'audit', message: 'Audit interne PR-02 planifié pour le 15/07', time: 'Il y a 4h', user: 'Mme Benali', severity: 'info' },
  { id: 3, type: 'risk', message: 'Nouveau risque critique identifié — Indisponibilité LMS', time: 'Il y a 6h', user: 'M. Tazi', severity: 'error' },
  { id: 4, type: 'complaint', message: 'Réclamation REC-2024-007 traitée dans les délais', time: 'Hier', user: 'Mme Chraibi', severity: 'success' },
  { id: 5, type: 'document', message: 'Procédure PR-03-P01 mise à jour (v3.1)', time: 'Hier', user: 'M. Alaoui', severity: 'info' },
  { id: 6, type: 'action', message: 'Délai dépassé — AC-2024-008 en retard', time: 'Il y a 2j', user: 'Système', severity: 'warning' },
  { id: 7, type: 'user', message: 'Nouvel utilisateur ajouté — Dr. Mansouri', time: 'Il y a 3j', user: 'Admin', severity: 'info' },
];

const typeIcon: Record<ActivityItem['type'], React.ElementType> = {
  action: CheckCircle2,
  audit: ClipboardCheck,
  risk: AlertTriangle,
  complaint: FileText,
  document: FileText,
  user: Users,
};

const severityStyles: Record<NonNullable<ActivityItem['severity']>, string> = {
  success: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  error: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
};

const severityDot: Record<NonNullable<ActivityItem['severity']>, string> = {
  success: 'bg-green-500',
  info: 'bg-blue-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
};

export function RecentActivityFeed() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Journal d&apos;Activité Récente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockActivity.map((item) => {
            const Icon = typeIcon[item.type];
            const sev = item.severity ?? 'info';
            return (
              <div key={item.id} className="flex items-start gap-3">
                <div className={cn('w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5', severityStyles[sev])}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground leading-snug">{item.message}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground">{item.time}</span>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className="text-[10px] text-muted-foreground">{item.user}</span>
                  </div>
                </div>
                <div className={cn('w-2 h-2 rounded-full flex-shrink-0 mt-2', severityDot[sev])} />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
