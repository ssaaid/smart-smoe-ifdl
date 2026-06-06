import {
  Controller, Get, Post, Patch, Delete, Param, Body,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { Document } from './entities/document.entity';

@ApiTags('Documents')
@ApiBearerAuth('access-token')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste tous les documents' })
  findAll(): Promise<Document[]> {
    return this.documentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupère un document par ID' })
  findOne(@Param('id') id: string): Promise<Document> {
    return this.documentsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crée un document' })
  create(@Body() dto: Partial<Document>): Promise<Document> {
    return this.documentsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Met à jour un document' })
  update(@Param('id') id: string, @Body() dto: Partial<Document>): Promise<Document> {
    return this.documentsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive un document' })
  remove(@Param('id') id: string): Promise<void> {
    return this.documentsService.remove(id);
  }
}
