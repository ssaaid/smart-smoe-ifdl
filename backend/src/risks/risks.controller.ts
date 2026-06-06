import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RisksService } from './risks.service';
import { CreateRiskDto } from './dto/create-risk.dto';
import { UpdateRiskDto } from './dto/update-risk.dto';

@ApiTags('Risks')
@ApiBearerAuth('access-token')
@Controller('risks')
export class RisksController {
  constructor(private readonly risksService: RisksService) {}

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
