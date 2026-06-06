import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Audit } from './entities/audit.entity';

@Injectable()
export class AuditsService {
  constructor(
    @InjectRepository(Audit)
    private readonly auditRepo: Repository<Audit>,
  ) {}

  findAll(): Promise<Audit[]> {
    return this.auditRepo.find({ where: { is_active: true } });
  }

  async findOne(id: string): Promise<Audit> {
    const audit = await this.auditRepo.findOne({ where: { id } });
    if (!audit) throw new NotFoundException(`Audit ${id} non trouvé`);
    return audit;
  }

  create(dto: Partial<Audit>): Promise<Audit> {
    const audit = this.auditRepo.create(dto);
    return this.auditRepo.save(audit);
  }

  async update(id: string, dto: Partial<Audit>): Promise<Audit> {
    const audit = await this.findOne(id);
    Object.assign(audit, dto);
    return this.auditRepo.save(audit);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.auditRepo.update(id, { is_active: false });
  }
}
