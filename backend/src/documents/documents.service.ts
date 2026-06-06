import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepo: Repository<Document>,
  ) {}

  findAll(): Promise<Document[]> {
    return this.documentRepo.find({ where: { is_active: true } });
  }

  async findOne(id: string): Promise<Document> {
    const doc = await this.documentRepo.findOne({ where: { id } });
    if (!doc) throw new NotFoundException(`Document ${id} non trouvé`);
    return doc;
  }

  create(dto: Partial<Document>): Promise<Document> {
    const doc = this.documentRepo.create(dto);
    return this.documentRepo.save(doc);
  }

  async update(id: string, dto: Partial<Document>): Promise<Document> {
    const doc = await this.findOne(id);
    Object.assign(doc, dto);
    return this.documentRepo.save(doc);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.documentRepo.update(id, { is_active: false });
  }
}
