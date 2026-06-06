import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsoClause, MaturityAssessment } from './entities/iso.entity';

@Injectable()
export class IsoCenterService {
  constructor(
    @InjectRepository(IsoClause)
    private readonly clauseRepo: Repository<IsoClause>,
    @InjectRepository(MaturityAssessment)
    private readonly assessmentRepo: Repository<MaturityAssessment>,
  ) {}

  findAllClauses(): Promise<IsoClause[]> {
    return this.clauseRepo.find({ where: { is_active: true }, order: { code: 'ASC' } });
  }

  async findOneClause(id: string): Promise<IsoClause> {
    const clause = await this.clauseRepo.findOne({ where: { id } });
    if (!clause) throw new NotFoundException(`Clause ISO ${id} non trouvée`);
    return clause;
  }

  createClause(dto: Partial<IsoClause>): Promise<IsoClause> {
    const clause = this.clauseRepo.create(dto);
    return this.clauseRepo.save(clause);
  }

  async updateClause(id: string, dto: Partial<IsoClause>): Promise<IsoClause> {
    const clause = await this.findOneClause(id);
    Object.assign(clause, dto);
    return this.clauseRepo.save(clause);
  }

  async removeClause(id: string): Promise<void> {
    await this.findOneClause(id);
    await this.clauseRepo.update(id, { is_active: false });
  }

  findAllAssessments(): Promise<MaturityAssessment[]> {
    return this.assessmentRepo.find({ order: { created_at: 'DESC' } });
  }

  createAssessment(dto: Partial<MaturityAssessment>): Promise<MaturityAssessment> {
    const assessment = this.assessmentRepo.create(dto);
    return this.assessmentRepo.save(assessment);
  }

  async getLatestMaturityScore() {
    return this.assessmentRepo.findOne({ order: { created_at: 'DESC' } });
  }
}
