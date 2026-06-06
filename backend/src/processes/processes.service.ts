import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Process } from './entities/process.entity';

@Injectable()
export class ProcessesService {
  constructor(
    @InjectRepository(Process)
    private readonly processRepo: Repository<Process>,
  ) {}

  findAll(): Promise<Process[]> {
    return this.processRepo.find({ where: { is_active: true } });
  }

  async findOne(id: string): Promise<Process> {
    const process = await this.processRepo.findOne({ where: { id } });
    if (!process) throw new NotFoundException(`Processus ${id} non trouvé`);
    return process;
  }

  create(dto: Partial<Process>): Promise<Process> {
    const process = this.processRepo.create(dto);
    return this.processRepo.save(process);
  }

  async update(id: string, dto: Partial<Process>): Promise<Process> {
    const process = await this.findOne(id);
    Object.assign(process, dto);
    return this.processRepo.save(process);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.processRepo.update(id, { is_active: false });
  }
}
