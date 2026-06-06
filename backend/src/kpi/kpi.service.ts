/**
 * KPI Service — Gestion complète des indicateurs de performance
 * ISO 21001 · Master IFDL · ESEF Berrechid
 */
import {
  Injectable, NotFoundException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Kpi, KpiMesure } from './entities/kpi.entity';
import { CreateKpiDto } from './dto/create-kpi.dto';
import { UpdateKpiDto } from './dto/update-kpi.dto';
import { AddMesureDto } from './dto/add-mesure.dto';

@Injectable()
export class KpiService {
  private readonly logger = new Logger(KpiService.name);

  constructor(
    @InjectRepository(Kpi)
    private readonly kpiRepo: Repository<Kpi>,
    @InjectRepository(KpiMesure)
    private readonly mesureRepo: Repository<KpiMesure>,
  ) {}

  /** Get all KPIs with current values and status */
  async findAll(processId?: string): Promise<Kpi[]> {
    const qb = this.kpiRepo
      .createQueryBuilder('k')
      .leftJoinAndSelect('k.process', 'p')
      .leftJoinAndSelect('k.responsable', 'u')
      .where('k.is_active = :active', { active: true });

    if (processId) {
      qb.andWhere('k.process_id = :processId', { processId });
    }
    return qb.orderBy('k.code', 'ASC').getMany();
  }

  async findOne(id: string): Promise<Kpi> {
    const kpi = await this.kpiRepo.findOne({
      where: { id },
      relations: ['process', 'responsable'],
    });
    if (!kpi) throw new NotFoundException(`KPI ${id} non trouvé`);
    return kpi;
  }

  async create(dto: CreateKpiDto): Promise<Kpi> {
    const kpi = this.kpiRepo.create(dto);
    return this.kpiRepo.save(kpi);
  }

  async update(id: string, dto: UpdateKpiDto): Promise<Kpi> {
    const kpi = await this.findOne(id);
    Object.assign(kpi, dto);
    return this.kpiRepo.save(kpi);
  }

  async remove(id: string): Promise<void> {
    await this.kpiRepo.update(id, { is_active: false });
  }

  /** Add a measurement for a KPI */
  async addMesure(kpiId: string, dto: AddMesureDto, userId: string): Promise<KpiMesure> {
    const kpi = await this.findOne(kpiId);

    // Determine status based on thresholds
    let statut: 'vert' | 'orange' | 'rouge' = 'vert';
    if (kpi.valeur_cible) {
      if (dto.valeur >= kpi.valeur_cible) statut = 'vert';
      else if (kpi.seuil_alerte && dto.valeur >= kpi.seuil_alerte) statut = 'orange';
      else statut = 'rouge';
    }

    const mesure = this.mesureRepo.create({
      kpi_id: kpiId,
      valeur: dto.valeur,
      periode: dto.periode,
      commentaire: dto.commentaire,
      statut,
      saisie_par: userId as any,
    });

    const saved = await this.mesureRepo.save(mesure);

    // Update KPI current value
    await this.kpiRepo.update(kpiId, {
      valeur_actuelle: dto.valeur,
      statut,
    });

    return saved;
  }

  /** Get historical measurements for a KPI */
  async getMesures(kpiId: string, from?: Date, to?: Date): Promise<KpiMesure[]> {
    const where: any = { kpi_id: kpiId };
    if (from && to) where.periode = Between(from, to);
    else if (from) where.periode = MoreThanOrEqual(from);

    return this.mesureRepo.find({
      where,
      order: { periode: 'ASC' },
    });
  }

  /** Dashboard KPI summary */
  async getDashboardSummary() {
    const [total, vert, orange, rouge] = await Promise.all([
      this.kpiRepo.count({ where: { is_active: true } }),
      this.kpiRepo.count({ where: { statut: 'vert', is_active: true } }),
      this.kpiRepo.count({ where: { statut: 'orange', is_active: true } }),
      this.kpiRepo.count({ where: { statut: 'rouge', is_active: true } }),
    ]);

    const kpis = await this.findAll();
    const scoreGlobal = kpis.length > 0
      ? Math.round(
          kpis.reduce((sum, k) => {
            if (!k.valeur_cible || !k.valeur_actuelle) return sum;
            return sum + Math.min((k.valeur_actuelle / k.valeur_cible) * 100, 100);
          }, 0) / kpis.length
        )
      : 0;

    return {
      total, vert, orange, rouge, scoreGlobal,
      tauxRealisation: total > 0 ? Math.round((vert / total) * 100) : 0,
    };
  }

  /** Evolution chart data for KPIs */
  async getEvolutionData(kpiIds: string[], periodes: number = 6) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - periodes);

    const mesures = await this.mesureRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.kpi', 'k')
      .where('m.kpi_id IN (:...ids)', { ids: kpiIds })
      .andWhere('m.periode >= :from', { from: sixMonthsAgo })
      .orderBy('m.periode', 'ASC')
      .getMany();

    // Group by KPI
    const grouped: Record<string, any> = {};
    for (const m of mesures) {
      if (!grouped[m.kpi_id]) {
        grouped[m.kpi_id] = {
          id: m.kpi_id,
          libelle: m.kpi?.libelle,
          code: m.kpi?.code,
          data: [],
        };
      }
      grouped[m.kpi_id].data.push({
        periode: m.periode,
        valeur: m.valeur,
        statut: m.statut,
      });
    }

    return Object.values(grouped);
  }

  /** GAP analysis — KPIs not meeting targets */
  async getGapAnalysis() {
    return this.kpiRepo.find({
      where: [{ statut: 'rouge' }, { statut: 'orange' }],
      relations: ['process', 'responsable'],
      order: { statut: 'ASC' },
    });
  }
}
