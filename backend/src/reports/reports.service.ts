import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepo: Repository<Report>,
  ) {}

  findAll(): Promise<Report[]> {
    return this.reportRepo.find({ where: { is_active: true } });
  }

  async findOne(id: string): Promise<Report> {
    const report = await this.reportRepo.findOne({ where: { id } });
    if (!report) throw new NotFoundException(`Rapport ${id} non trouvé`);
    return report;
  }

  create(dto: Partial<Report>): Promise<Report> {
    const report = this.reportRepo.create(dto);
    return this.reportRepo.save(report);
  }

  async update(id: string, dto: Partial<Report>): Promise<Report> {
    const report = await this.findOne(id);
    Object.assign(report, dto);
    return this.reportRepo.save(report);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.reportRepo.update(id, { is_active: false });
  }
}
