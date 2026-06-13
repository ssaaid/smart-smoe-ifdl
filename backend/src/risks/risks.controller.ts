import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, Res,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { RisksService } from './risks.service';
import { CreateRiskDto } from './dto/create-risk.dto';
import { UpdateRiskDto } from './dto/update-risk.dto';
import { ExportService } from '../common/export/export.service';

@ApiTags('Risks')
@ApiBearerAuth('access-token')
@Controller('risks')
export class RisksController {
  constructor(
    private readonly risksService: RisksService,
    private readonly exportService: ExportService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Liste tous les risques' })
  findAll(
    @Query('statut') statut?: string,
    @Query('niveau') niveau?: string,
    @Query('processId') processId?: string,
    @Query('type') type?: string,
  ) {
    return this.risksService.findAll({ statut, niveau, processId, type });
  }

  @Get('heatmap')
  @ApiOperation({ summary: 'Matrice de risques heatmap' })
  getHeatmap() {
    return this.risksService.getHeatmapData();
  }

  @Get('treatment-stats')
  @ApiOperation({ summary: 'Statistiques de traitement des risques' })
  getTreatmentStats() {
    return this.risksService.getTreatmentStats();
  }

  @Get('by-process')
  @ApiOperation({ summary: 'Risques regroupés par processus' })
  getByProcess() {
    return this.risksService.getByProcess();
  }

  @Get('export')
  @ApiOperation({ summary: 'Export registre des risques (xlsx ou pdf)' })
  async export(@Query('format') format = 'xlsx', @Res() res: Response) {
    const data = await this.risksService.findAll({});
    const cols = [
      { key: 'code', header: 'Code', width: 12 },
      { key: 'libelle', header: 'Libellé', width: 30 },
      { key: 'categorie', header: 'Catégorie', width: 16 },
      { key: 'type', header: 'Type', width: 14 },
      { key: 'probabilite', header: 'Prob.', width: 8 },
      { key: 'gravite', header: 'Grav.', width: 8 },
      { key: 'criticite', header: 'Criticité', width: 10 },
      { key: 'niveau', header: 'Niveau', width: 12 },
      { key: 'statut', header: 'Statut', width: 14 },
    ];
    if (format === 'pdf') {
      this.exportService.toPdf(res, 'registre-risques', 'Registre des Risques', cols, data);
    } else {
      await this.exportService.toExcel(res, 'registre-risques', 'Risques', cols, data);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupère un risque par ID' })
  findOne(@Param('id') id: string) {
    return this.risksService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crée un risque' })
  create(@Body() dto: CreateRiskDto) {
    return this.risksService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Met à jour un risque' })
  update(@Param('id') id: string, @Body() dto: UpdateRiskDto) {
    return this.risksService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Clôture un risque' })
  remove(@Param('id') id: string) {
    return this.risksService.remove(id);
  }
}
