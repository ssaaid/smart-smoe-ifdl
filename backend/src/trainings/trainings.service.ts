import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Training } from './entities/training.entity';

@Injectable()
export class TrainingsService {
  constructor(
    @InjectRepository(Training)
    private readonly trainingRepo: Repository<Training>,
  ) {}

  findAll(): Promise<Training[]> {
    return this.trainingRepo.find({ where: { is_active: true } });
  }

  async findOne(id: string): Promise<Training> {
    const training = await this.trainingRepo.findOne({ where: { id } });
    if (!training) throw new NotFoundException(`Formation ${id} non trouvée`);
    return training;
  }

  create(dto: Partial<Training>): Promise<Training> {
    const training = this.trainingRepo.create(dto);
    return this.trainingRepo.save(training);
  }

  async update(id: string, dto: Partial<Training>): Promise<Training> {
    const training = await this.findOne(id);
    Object.assign(training, dto);
    return this.trainingRepo.save(training);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.trainingRepo.update(id, { is_active: false });
  }
}
