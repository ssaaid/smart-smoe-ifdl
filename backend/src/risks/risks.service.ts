/**
 * RisksService — Gestion complète du registre des risques
 * Matrice criticité, heatmap, plans de traitement
 */
import {
  Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { Risk } from './entities/risk.entity';
import { CreateRiskDto } from './dto/create-risk.dto';
import { UpdateRiskDto } from './dto/update-risk.dto';

@Injectable()
export class RisksService {
  constructor(
    @InjectRepository(Risk)
    private readonly riskRepo: Repository<Risk>,
  ) {}

  async findAll(filters?: {
    statut?: string;
    niveau?: string;
    processId?: string;
    type?: string;
  }): Promise<Risk[]> {
    const qb = this.riskRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.process', 'p')
      .leftJoinAndSelect('r.owner', 'u');

    if (filters?.statut)    qb.andWhere('r.statut = :statut',   { statut: filters.statut });
    if (filters?.niveau)    qb.andWhere('r.niveau = :niveau',   { niveau: filters.niveau });
    if (filters?.processId) qb.andWhere('r.process_id = :pid',  { pid: filters.processId });
    if (filters?.type)      qb.andWhere('r.type = :type',       { type: filters.type });

    return qb.orderBy('r.criticite', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Risk> {
    const risk = await this.riskRepo.findOne({
      where: { id },
      relations: ['process', 'owner'],
    });
    if (!risk) throw new NotFoundException(`Risque ${id} non trouvé`);
    return risk;
  }

  async create(dto: CreateRiskDto): Promise<Risk> {
    const risk = this.riskRepo.create(dto);
    return this.riskRepo.save(risk);
  }

  async update(id: string, dto: UpdateRiskDto): Promise<Risk> {
    const risk = await this.findOne(id);
    Object.assign(risk, dto);
    return this.riskRepo.save(risk);
  }

  async remove(id: string): Promise<void> {
    await this.riskRepo.update(id, { statut: 'clos' as any });
  }

  /** Heatmap matrix data — 5×5 probability × gravity */
  async getHeatmapData() {
    const risks = await this.findAll({
      statut: undefined, // all active
    });

    const active = risks.filter(r => r.statut !== 'clos');
    const matrix: Record<string, Risk[]> = {};

    for (let p = 1; p <= 5; p++) {
      for (let g = 1; g <= 5; g++) {
        const key = `${p}-${g}`;
        matrix[key] = active.filter(r => r.probabilite === p && r.gravite === g);
      }
    }

    return {
      matrix,
      summary: {
        critique: active.filter(r => r.niveau === 'critique').length,
        eleve:    active.filter(r => r.niveau === 'eleve').length,
        modere:   active.filter(r => r.niveau === 'modere').length,
        faible:   active.filter(r => r.niveau === 'faible').length,
        total:    active.length,
      },
      topRisks: active
        .sort((a, b) => b.criticite - a.criticite)
        .slice(0, 5),
    };
  }

  /** Risk treatment progress */
  async getTreatmentStats() {
    const [traite, enCours, identifie] = await Promise.all([
      this.riskRepo.count({ where: { statut: 'traite' as any } }),
      this.riskRepo.count({ where: { statut: 'surveille' as any } }),
      this.riskRepo.count({ where: { statut: 'identifie' as any } }),
    ]);
    return { traite, enCours, identifie };
  }

  /** Get risks by process for process view */
  async getByProcess() {
    return this.riskRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.process', 'p')
      .select(['p.code', 'p.nom', 'r.niveau', 'COUNT(*) as count'])
      .where('r.statut != :s', { s: 'clos' })
      .groupBy('p.code, p.nom, r.niveau')
      .getRawMany();
  }
}
