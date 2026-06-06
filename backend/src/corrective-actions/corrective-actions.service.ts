import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CorrectiveAction } from './entities/corrective-action.entity';

@Injectable()
export class CorrectiveActionsService {
  constructor(
    @InjectRepository(CorrectiveAction)
    private readonly actionRepo: Repository<CorrectiveAction>,
  ) {}

  findAll(): Promise<CorrectiveAction[]> {
    return this.actionRepo.find({ where: { is_active: true } });
  }

  async findOne(id: string): Promise<CorrectiveAction> {
    const action = await this.actionRepo.findOne({ where: { id } });
    if (!action) throw new NotFoundException(`Action corrective ${id} non trouvée`);
    return action;
  }

  create(dto: Partial<CorrectiveAction>): Promise<CorrectiveAction> {
    const action = this.actionRepo.create(dto);
    return this.actionRepo.save(action);
  }

  async update(id: string, dto: Partial<CorrectiveAction>): Promise<CorrectiveAction> {
    const action = await this.findOne(id);
    Object.assign(action, dto);
    return this.actionRepo.save(action);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.actionRepo.update(id, { is_active: false });
  }
}
