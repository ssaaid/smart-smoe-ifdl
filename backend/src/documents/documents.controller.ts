import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, Res,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { DocumentsService } from './documents.service';
import { Document } from './entities/document.entity';
import { ExportService } from '../common/export/export.service';

@ApiTags('Documents')
@ApiBearerAuth('access-token')
@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly exportService: ExportService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Liste tous les documents' })
  findAll(): Promise<Document[]> {
    return this.documentsService.findAll();
  }

  @Get('export')
  @ApiOperation({ summary: 'Export liste des documents (xlsx ou pdf)' })
  async export(@Query('format') format = 'xlsx', @Res() res: Response) {
    const data = await this.documentsService.findAll();
    const cols = [
      { key: 'reference', header: 'Référence', width: 18 },
      { key: 'titre', header: 'Titre', width: 35 },
      { key: 'type', header: 'Type', width: 16 },
      { key: 'version', header: 'Version', width: 10 },
      { key: 'statut', header: 'Statut', width: 14 },
      { key: 'date_approbation', header: 'Approbation', width: 16 },
      { key: 'date_revision', header: 'Révision', width: 14 },
    ];
    const rows = data.map((d) => ({
      ...d,
      date_approbation: d.date_approbation
        ? new Date(d.date_approbation).toLocaleDateString('fr-FR')
        : '',
      date_revision: d.date_revision
        ? new Date(d.date_revision).toLocaleDateString('fr-FR')
        : '',
    }));
    if (format === 'pdf') {
      this.exportService.toPdf(res, 'documents', 'Gestion Documentaire', cols, rows);
    } else {
      await this.exportService.toExcel(res, 'documents', 'Documents', cols, rows);
    }
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
