import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, Res,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { KpiService } from './kpi.service';
import { CreateKpiDto } from './dto/create-kpi.dto';
import { UpdateKpiDto } from './dto/update-kpi.dto';
import { AddMesureDto } from './dto/add-mesure.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ExportService } from '../common/export/export.service';

@ApiTags('KPIs')
@ApiBearerAuth('access-token')
@Controller('kpis')
export class KpiController {
  constructor(
    private readonly kpiService: KpiService,
    private readonly exportService: ExportService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Liste tous les KPIs' })
  findAll(@Query('processId') processId?: string) {
    return this.kpiService.findAll(processId);
  }

  @Get('dashboard/summary')
  @ApiOperation({ summary: 'Résumé KPI pour le dashboard' })
  getDashboardSummary() {
    return this.kpiService.getDashboardSummary();
  }

  @Get('evolution')
  @ApiOperation({ summary: 'Données évolution des KPIs' })
  getEvolution(@Query('ids') ids: string, @Query('periodes') periodes?: number) {
    const kpiIds = ids ? ids.split(',') : [];
    return this.kpiService.getEvolutionData(kpiIds, periodes);
  }

  @Get('gap-analysis')
  @ApiOperation({ summary: 'Analyse des écarts KPI' })
  getGapAnalysis() {
    return this.kpiService.getGapAnalysis();
  }

  @Get('export')
  @ApiOperation({ summary: 'Export KPIs (xlsx ou pdf)' })
  async export(@Query('format') format = 'xlsx', @Res() res: Response) {
    const data = await this.kpiService.findAll();
    const cols = [
      { key: 'code', header: 'Code', width: 12 },
      { key: 'libelle', header: 'Libellé', width: 30 },
      { key: 'unite', header: 'Unité', width: 12 },
      { key: 'frequence', header: 'Fréquence', width: 14 },
      { key: 'valeur_cible', header: 'Cible', width: 10 },
      { key: 'valeur_actuelle', header: 'Actuelle', width: 12 },
      { key: 'seuil_alerte', header: 'Seuil', width: 10 },
      { key: 'statut', header: 'Statut', width: 12 },
    ];
    if (format === 'pdf') {
      this.exportService.toPdf(res, 'kpis', 'Tableau de Bord KPIs', cols, data);
    } else {
      await this.exportService.toExcel(res, 'kpis', 'KPIs', cols, data);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupère un KPI par ID' })
  findOne(@Param('id') id: string) {
    return this.kpiService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crée un KPI' })
  create(@Body() dto: CreateKpiDto) {
    return this.kpiService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Met à jour un KPI' })
  update(@Param('id') id: string, @Body() dto: UpdateKpiDto) {
    return this.kpiService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Désactive un KPI' })
  remove(@Param('id') id: string) {
    return this.kpiService.remove(id);
  }

  @Post(':id/mesures')
  @ApiOperation({ summary: 'Ajoute une mesure à un KPI' })
  addMesure(
    @Param('id') id: string,
    @Body() dto: AddMesureDto,
    @CurrentUser() user: any,
  ) {
    return this.kpiService.addMesure(id, dto, user?.sub);
  }

  @Get(':id/mesures')
  @ApiOperation({ summary: 'Récupère les mesures d\'un KPI' })
  getMesures(@Param('id') id: string) {
    return this.kpiService.getMesures(id);
  }
}
