import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Competency, UserCompetency } from './entities/competency.entity';

@Injectable()
export class CompetenciesService {
  constructor(
    @InjectRepository(Competency)
    private readonly competencyRepo: Repository<Competency>,
    @InjectRepository(UserCompetency)
    private readonly userCompetencyRepo: Repository<UserCompetency>,
  ) {}

  findAll(): Promise<Competency[]> {
    return this.competencyRepo.find({ where: { is_active: true } });
  }

  async findOne(id: string): Promise<Competency> {
    const competency = await this.competencyRepo.findOne({ where: { id } });
    if (!competency) throw new NotFoundException(`Compétence ${id} non trouvée`);
    return competency;
  }

  create(dto: Partial<Competency>): Promise<Competency> {
    const competency = this.competencyRepo.create(dto);
    return this.competencyRepo.save(competency);
  }

  async update(id: string, dto: Partial<Competency>): Promise<Competency> {
    const competency = await this.findOne(id);
    Object.assign(competency, dto);
    return this.competencyRepo.save(competency);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.competencyRepo.update(id, { is_active: false });
  }

  async getUserCompetencies(userId: string): Promise<UserCompetency[]> {
    return this.userCompetencyRepo.find({ where: { user_id: userId } });
  }

  async assignCompetency(dto: Partial<UserCompetency>): Promise<UserCompetency> {
    const record = this.userCompetencyRepo.create(dto);
    return this.userCompetencyRepo.save(record);
  }
}
