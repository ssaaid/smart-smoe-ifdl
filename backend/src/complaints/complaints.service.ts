import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Complaint } from './entities/complaint.entity';

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectRepository(Complaint)
    private readonly complaintRepo: Repository<Complaint>,
  ) {}

  findAll(): Promise<Complaint[]> {
    return this.complaintRepo.find({ where: { is_active: true } });
  }

  async findOne(id: string): Promise<Complaint> {
    const complaint = await this.complaintRepo.findOne({ where: { id } });
    if (!complaint) throw new NotFoundException(`Réclamation ${id} non trouvée`);
    return complaint;
  }

  create(dto: Partial<Complaint>): Promise<Complaint> {
    const complaint = this.complaintRepo.create(dto);
    return this.complaintRepo.save(complaint);
  }

  async update(id: string, dto: Partial<Complaint>): Promise<Complaint> {
    const complaint = await this.findOne(id);
    Object.assign(complaint, dto);
    return this.complaintRepo.save(complaint);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.complaintRepo.update(id, { is_active: false });
  }
}
