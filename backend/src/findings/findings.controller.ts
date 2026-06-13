import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, Res,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { FindingsService } from './findings.service';
import { Finding } from './entities/finding.entity';
import { ExportService } from '../common/export/export.service';

@ApiTags('Findings')
@ApiBearerAuth('access-token')
@Controller('findings')
export class FindingsController {
  constructor(
    private readonly findingsService: FindingsService,
    private readonly exportService: ExportService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Liste tous les constats' })
  findAll(): Promise<Finding[]> {
    return this.findingsService.findAll();
  }

  @Get('export')
  @ApiOperation({ summary: 'Export constats (xlsx ou pdf)' })
  async export(@Query('format') format = 'xlsx', @Res() res: Response) {
    const data = await this.findingsService.findAll();
    const cols = [
      { key: 'code', header: 'Code', width: 12 },
      { key: 'description', header: 'Description', width: 40 },
      { key: 'type', header: 'Type', width: 18 },
      { key: 'severite', header: 'Sévérité', width: 14 },
      { key: 'statut', header: 'Statut', width: 14 },
      { key: 'echeance', header: 'Échéance', width: 14 },
      { key: 'date_cloture', header: 'Clôture', width: 14 },
    ];
    const rows = data.map((d) => ({
      ...d,
      echeance: d.echeance ? new Date(d.echeance).toLocaleDateString('fr-FR') : '',
      date_cloture: d.date_cloture ? new Date(d.date_cloture).toLocaleDateString('fr-FR') : '',
    }));
    if (format === 'pdf') {
      this.exportService.toPdf(res, 'constats', 'Registre des Constats', cols, rows);
    } else {
      await this.exportService.toExcel(res, 'constats', 'Constats', cols, rows);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupère un constat par ID' })
  findOne(@Param('id') id: string): Promise<Finding> {
    return this.findingsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crée un constat' })
  create(@Body() dto: Partial<Finding>): Promise<Finding> {
    return this.findingsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Met à jour un constat' })
  update(@Param('id') id: string, @Body() dto: Partial<Finding>): Promise<Finding> {
    return this.findingsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Désactive un constat' })
  remove(@Param('id') id: string): Promise<void> {
    return this.findingsService.remove(id);
  }
}
