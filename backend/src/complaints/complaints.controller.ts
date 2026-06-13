import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, Res,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { ComplaintsService } from './complaints.service';
import { Complaint } from './entities/complaint.entity';
import { ExportService } from '../common/export/export.service';

@ApiTags('Complaints')
@ApiBearerAuth('access-token')
@Controller('complaints')
export class ComplaintsController {
  constructor(
    private readonly complaintsService: ComplaintsService,
    private readonly exportService: ExportService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Liste toutes les réclamations' })
  findAll(): Promise<Complaint[]> {
    return this.complaintsService.findAll();
  }

  @Get('export')
  @ApiOperation({ summary: 'Export réclamations (xlsx ou pdf)' })
  async export(@Query('format') format = 'xlsx', @Res() res: Response) {
    const data = await this.complaintsService.findAll();
    const cols = [
      { key: 'reference', header: 'Référence', width: 18 },
      { key: 'objet', header: 'Objet', width: 30 },
      { key: 'type', header: 'Type', width: 15 },
      { key: 'source', header: 'Source', width: 15 },
      { key: 'statut', header: 'Statut', width: 15 },
      { key: 'plaignant_nom', header: 'Plaignant', width: 22 },
      { key: 'delai_traitement', header: 'Délai (j)', width: 12 },
      { key: 'created_at', header: 'Date', width: 18 },
    ];
    const rows = data.map((d) => ({
      ...d,
      created_at: d.created_at ? new Date(d.created_at).toLocaleDateString('fr-FR') : '',
    }));
    if (format === 'pdf') {
      this.exportService.toPdf(res, 'reclamations', 'Réclamations & Recours', cols, rows);
    } else {
      await this.exportService.toExcel(res, 'reclamations', 'Réclamations', cols, rows);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupère une réclamation par ID' })
  findOne(@Param('id') id: string): Promise<Complaint> {
    return this.complaintsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crée une réclamation' })
  create(@Body() dto: Partial<Complaint>): Promise<Complaint> {
    return this.complaintsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Met à jour une réclamation' })
  update(@Param('id') id: string, @Body() dto: Partial<Complaint>): Promise<Complaint> {
    return this.complaintsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Désactive une réclamation' })
  remove(@Param('id') id: string): Promise<void> {
    return this.complaintsService.remove(id);
  }
}
