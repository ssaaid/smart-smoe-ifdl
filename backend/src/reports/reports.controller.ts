import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, Res,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { Report } from './entities/report.entity';
import { ExportService } from '../common/export/export.service';

@ApiTags('Reports')
@ApiBearerAuth('access-token')
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly exportService: ExportService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Liste tous les rapports' })
  findAll(): Promise<Report[]> {
    return this.reportsService.findAll();
  }

  @Get('export')
  @ApiOperation({ summary: 'Export liste des rapports (xlsx ou pdf)' })
  async export(@Query('format') format = 'xlsx', @Res() res: Response) {
    const data = await this.reportsService.findAll();
    const cols = [
      { key: 'titre', header: 'Titre', width: 35 },
      { key: 'type', header: 'Type', width: 20 },
      { key: 'statut', header: 'Statut', width: 14 },
      { key: 'periode_debut', header: 'Période début', width: 16 },
      { key: 'periode_fin', header: 'Période fin', width: 16 },
      { key: 'created_at', header: 'Créé le', width: 14 },
    ];
    const rows = data.map((d) => ({
      ...d,
      periode_debut: d.periode_debut ? new Date(d.periode_debut).toLocaleDateString('fr-FR') : '',
      periode_fin: d.periode_fin ? new Date(d.periode_fin).toLocaleDateString('fr-FR') : '',
      created_at: d.created_at ? new Date(d.created_at).toLocaleDateString('fr-FR') : '',
    }));
    if (format === 'pdf') {
      this.exportService.toPdf(res, 'rapports', 'Liste des Rapports', cols, rows);
    } else {
      await this.exportService.toExcel(res, 'rapports', 'Rapports', cols, rows);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupère un rapport par ID' })
  findOne(@Param('id') id: string): Promise<Report> {
    return this.reportsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crée un rapport' })
  create(@Body() dto: Partial<Report>): Promise<Report> {
    return this.reportsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Met à jour un rapport' })
  update(@Param('id') id: string, @Body() dto: Partial<Report>): Promise<Report> {
    return this.reportsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Désactive un rapport' })
  remove(@Param('id') id: string): Promise<void> {
    return this.reportsService.remove(id);
  }
}
