import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, Res,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { AuditsService } from './audits.service';
import { Audit } from './entities/audit.entity';
import { ExportService } from '../common/export/export.service';

@ApiTags('Audits')
@ApiBearerAuth('access-token')
@Controller('audits')
export class AuditsController {
  constructor(
    private readonly auditsService: AuditsService,
    private readonly exportService: ExportService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Liste tous les audits' })
  findAll(): Promise<Audit[]> {
    return this.auditsService.findAll();
  }

  @Get('export')
  @ApiOperation({ summary: 'Export audits (xlsx ou pdf)' })
  async export(@Query('format') format = 'xlsx', @Res() res: Response) {
    const data = await this.auditsService.findAll();
    const cols = [
      { key: 'code', header: 'Code', width: 14 },
      { key: 'titre', header: 'Titre', width: 30 },
      { key: 'type', header: 'Type', width: 16 },
      { key: 'statut', header: 'Statut', width: 14 },
      { key: 'date_debut', header: 'Début', width: 16 },
      { key: 'date_fin', header: 'Fin', width: 16 },
      { key: 'observations', header: 'Observations', width: 35 },
    ];
    const rows = data.map((d) => ({
      ...d,
      date_debut: d.date_debut ? new Date(d.date_debut).toLocaleDateString('fr-FR') : '',
      date_fin: d.date_fin ? new Date(d.date_fin).toLocaleDateString('fr-FR') : '',
    }));
    if (format === 'pdf') {
      this.exportService.toPdf(res, 'audits', 'Rapport des Audits', cols, rows);
    } else {
      await this.exportService.toExcel(res, 'audits', 'Audits', cols, rows);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupère un audit par ID' })
  findOne(@Param('id') id: string): Promise<Audit> {
    return this.auditsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crée un audit' })
  create(@Body() dto: Partial<Audit>): Promise<Audit> {
    return this.auditsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Met à jour un audit' })
  update(@Param('id') id: string, @Body() dto: Partial<Audit>): Promise<Audit> {
    return this.auditsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Désactive un audit' })
  remove(@Param('id') id: string): Promise<void> {
    return this.auditsService.remove(id);
  }
}
