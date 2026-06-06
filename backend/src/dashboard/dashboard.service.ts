/**
 * DashboardService — Agrégation des données exécutives SMOE
 * Tableau de bord temps réel ISO 21001
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Kpi } from '../kpi/entities/kpi.entity';
import { Risk } from '../risks/entities/risk.entity';
import { Audit } from '../audits/entities/audit.entity';
import { Finding } from '../findings/entities/finding.entity';
import { CorrectiveAction } from '../corrective-actions/entities/corrective-action.entity';
import { Complaint } from '../complaints/entities/complaint.entity';
import { SatisfactionSurvey } from '../satisfaction/entities/survey.entity';
import { MaturityAssessment } from '../iso-center/entities/iso.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Kpi)           private kpiRepo: Repository<Kpi>,
    @InjectRepository(Risk)          private riskRepo: Repository<Risk>,
    @InjectRepository(Audit)         private auditRepo: Repository<Audit>,
    @InjectRepository(Finding)       private findingRepo: Repository<Finding>,
    @InjectRepository(CorrectiveAction) private actionRepo: Repository<CorrectiveAction>,
    @InjectRepository(Complaint)     private complaintRepo: Repository<Complaint>,
    @InjectRepository(SatisfactionSurvey) private surveyRepo: Repository<SatisfactionSurvey>,
    @InjectRepository(MaturityAssessment) private maturityRepo: Repository<MaturityAssessment>,
    @InjectRepository(User)          private userRepo: Repository<User>,
  ) {}

  /** Main executive dashboard data */
  async getExecutiveSummary() {
    const [
      kpiStats,
      riskStats,
      auditStats,
      actionStats,
      complaintStats,
      satisfactionStats,
      userStats,
      maturityScore,
    ] = await Promise.all([
      this.getKpiStats(),
      this.getRiskStats(),
      this.getAuditStats(),
      this.getActionStats(),
      this.getComplaintStats(),
      this.getSatisfactionStats(),
      this.getUserStats(),
      this.getLatestMaturityScore(),
    ]);

    const scoreQualite = this.calculateQualityScore({
      kpiStats, riskStats, auditStats, actionStats,
    });

    return {
      scoreQualite,
      scoreISO: maturityScore?.score_global ?? 0,
      kpi:         kpiStats,
      risks:       riskStats,
      audits:      auditStats,
      actions:     actionStats,
      complaints:  complaintStats,
      satisfaction: satisfactionStats,
      users:       userStats,
      lastUpdated: new Date(),
    };
  }

  private async getKpiStats() {
    const [total, vert, orange, rouge] = await Promise.all([
      this.kpiRepo.count({ where: { is_active: true } }),
      this.kpiRepo.count({ where: { statut: 'vert',   is_active: true } }),
      this.kpiRepo.count({ where: { statut: 'orange', is_active: true } }),
      this.kpiRepo.count({ where: { statut: 'rouge',  is_active: true } }),
    ]);
    return { total, vert, orange, rouge,
      tauxRealisation: total > 0 ? Math.round((vert / total) * 100) : 0 };
  }

  private async getRiskStats() {
    const [total, critique, eleve, modere, faible] = await Promise.all([
      this.riskRepo.count({ where: { statut: In(['identifie','analyse','traite','surveille']) } }),
      this.riskRepo.count({ where: { niveau: 'critique', statut: In(['identifie','analyse','traite','surveille']) } }),
      this.riskRepo.count({ where: { niveau: 'eleve',    statut: In(['identifie','analyse','traite','surveille']) } }),
      this.riskRepo.count({ where: { niveau: 'modere',   statut: In(['identifie','analyse','traite','surveille']) } }),
      this.riskRepo.count({ where: { niveau: 'faible',   statut: In(['identifie','analyse','traite','surveille']) } }),
    ]);
    return { total, critique, eleve, modere, faible };
  }

  private async getAuditStats() {
    const [total, planifie, enCours, termine, annule] = await Promise.all([
      this.auditRepo.count(),
      this.auditRepo.count({ where: { statut: 'planifie' } }),
      this.auditRepo.count({ where: { statut: 'en_cours' } }),
      this.auditRepo.count({ where: { statut: 'termine' } }),
      this.auditRepo.count({ where: { statut: 'annule'  } }),
    ]);
    const [ncOuvertes, ncMajeures] = await Promise.all([
      this.findingRepo.count({ where: { type: 'non_conformite', statut: In(['ouverte','en_cours']) } }),
      this.findingRepo.count({ where: { type: 'non_conformite', severite: 'majeure', statut: In(['ouverte','en_cours']) } }),
    ]);
    return { total, planifie, enCours, termine, annule, ncOuvertes, ncMajeures };
  }

  private async getActionStats() {
    const [total, ouverte, enCours, cloturee, enRetard] = await Promise.all([
      this.actionRepo.count(),
      this.actionRepo.count({ where: { statut: 'ouverte' } }),
      this.actionRepo.count({ where: { statut: 'en_cours' } }),
      this.actionRepo.count({ where: { statut: 'cloturee' } }),
      this.actionRepo
        .createQueryBuilder('a')
        .where('a.statut IN (:...statuts)', { statuts: ['ouverte','en_cours'] })
        .andWhere('a.date_echeance < :now', { now: new Date() })
        .getCount(),
    ]);
    const avancementMoyen = await this.actionRepo
      .createQueryBuilder('a')
      .select('ROUND(AVG(a.avancement), 0)', 'avg')
      .where('a.statut IN (:...statuts)', { statuts: ['ouverte','en_cours'] })
      .getRawOne();

    return {
      total, ouverte, enCours, cloturee, enRetard,
      avancementMoyen: parseFloat(avancementMoyen?.avg ?? '0'),
    };
  }

  private async getComplaintStats() {
    const [total, deposee, enCours, resolue] = await Promise.all([
      this.complaintRepo.count(),
      this.complaintRepo.count({ where: { statut: 'deposee' } }),
      this.complaintRepo.count({ where: { statut: 'en_cours' } }),
      this.complaintRepo.count({ where: { statut: 'resolue'  } }),
    ]);
    const delaiMoyen = await this.complaintRepo
      .createQueryBuilder('c')
      .select('ROUND(AVG(c.delai_traitement), 1)', 'avg')
      .where('c.delai_traitement IS NOT NULL')
      .getRawOne();

    return { total, deposee, enCours, resolue,
      delaiMoyen: parseFloat(delaiMoyen?.avg ?? '0') };
  }

  private async getSatisfactionStats() {
    const result = await this.surveyRepo
      .createQueryBuilder('s')
      .select('ROUND(AVG(s.score_moyen), 1)', 'moyenne')
      .addSelect('SUM(s.nb_reponses)', 'totalReponses')
      .where('s.statut = :statut', { statut: 'clos' })
      .getRawOne();

    return {
      scoreMoyen: parseFloat(result?.moyenne ?? '0'),
      totalReponses: parseInt(result?.totalReponses ?? '0'),
    };
  }

  private async getUserStats() {
    const [total, actifs] = await Promise.all([
      this.userRepo.count(),
      this.userRepo.count({ where: { is_active: true } }),
    ]);
    const parRole = await this.userRepo
      .createQueryBuilder('u')
      .select('u.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .where('u.is_active = true')
      .groupBy('u.role')
      .getRawMany();

    return { total, actifs, parRole };
  }

  private async getLatestMaturityScore() {
    return this.maturityRepo.findOne({
      order: { created_at: 'DESC' },
    });
  }

  /** Composite quality score 0-100 */
  private calculateQualityScore(data: any): number {
    const { kpiStats, riskStats, auditStats, actionStats } = data;
    const weights = { kpi: 0.35, risk: 0.25, audit: 0.25, action: 0.15 };

    const kpiScore   = kpiStats.total   > 0 ? (kpiStats.vert   / kpiStats.total)   * 100 : 0;
    const riskScore  = riskStats.total  > 0 ? ((riskStats.total - riskStats.critique - riskStats.eleve) / riskStats.total) * 100 : 100;
    const auditScore = auditStats.total > 0 ? (auditStats.termine / auditStats.total) * 100 : 0;
    const actionScore = actionStats.total > 0 ? (actionStats.cloturee / actionStats.total) * 100 : 0;

    return Math.round(
      kpiScore   * weights.kpi   +
      riskScore  * weights.risk  +
      auditScore * weights.audit +
      actionScore * weights.action
    );
  }

  /** Recent activity feed */
  async getRecentActivity(limit = 10) {
    // Combine recent items from different entities
    const [recentAudits, recentActions, recentComplaints] = await Promise.all([
      this.auditRepo.find({ order: { created_at: 'DESC' }, take: 3, relations: ['responsable'] }),
      this.actionRepo.find({ order: { created_at: 'DESC' }, take: 3, relations: ['responsable'] }),
      this.complaintRepo.find({ order: { created_at: 'DESC' }, take: 3 }),
    ]);

    const activity = [
      ...recentAudits.map(a => ({ type: 'audit', entity: a, date: a.created_at })),
      ...recentActions.map(a => ({ type: 'action', entity: a, date: a.created_at })),
      ...recentComplaints.map(c => ({ type: 'complaint', entity: c, date: c.created_at })),
    ]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);

    return activity;
  }
}
