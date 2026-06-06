import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Finding } from './entities/finding.entity';

@Injectable()
export class FindingsService {
  constructor(
    @InjectRepository(Finding)
    private readonly findingRepo: Repository<Finding>,
  ) {}

  findAll(): Promise<Finding[]> {
    return this.findingRepo.find({ where: { is_active: true } });
  }

  async findOne(id: string): Promise<Finding> {
    const finding = await this.findingRepo.findOne({ where: { id } });
    if (!finding) throw new NotFoundException(`Constat ${id} non trouvé`);
    return finding;
  }

  create(dto: Partial<Finding>): Promise<Finding> {
    const finding = this.findingRepo.create(dto);
    return this.findingRepo.save(finding);
  }

  async update(id: string, dto: Partial<Finding>): Promise<Finding> {
    const finding = await this.findOne(id);
    Object.assign(finding, dto);
    return this.findingRepo.save(finding);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.findingRepo.update(id, { is_active: false });
  }
}
