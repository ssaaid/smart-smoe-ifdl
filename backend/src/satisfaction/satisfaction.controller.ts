import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, Res,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { SatisfactionService } from './satisfaction.service';
import { SatisfactionSurvey } from './entities/survey.entity';
import { ExportService } from '../common/export/export.service';

@ApiTags('Satisfaction')
@ApiBearerAuth('access-token')
@Controller('satisfaction')
export class SatisfactionController {
  constructor(
    private readonly satisfactionService: SatisfactionService,
    private readonly exportService: ExportService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Liste toutes les enquêtes de satisfaction' })
  findAll(): Promise<SatisfactionSurvey[]> {
    return this.satisfactionService.findAll();
  }

  @Get('export')
  @ApiOperation({ summary: 'Export enquêtes de satisfaction (xlsx ou pdf)' })
  async export(@Query('format') format = 'xlsx', @Res() res: Response) {
    const data = await this.satisfactionService.findAll();
    const cols = [
      { key: 'titre', header: 'Titre', width: 30 },
      { key: 'type', header: 'Type', width: 16 },
      { key: 'statut', header: 'Statut', width: 14 },
      { key: 'score_moyen', header: 'Score moyen', width: 14 },
      { key: 'nb_reponses', header: 'Réponses', width: 12 },
      { key: 'date_debut', header: 'Début', width: 14 },
      { key: 'date_fin', header: 'Fin', width: 14 },
    ];
    const rows = data.map((d) => ({
      ...d,
      date_debut: d.date_debut ? new Date(d.date_debut).toLocaleDateString('fr-FR') : '',
      date_fin: d.date_fin ? new Date(d.date_fin).toLocaleDateString('fr-FR') : '',
    }));
    if (format === 'pdf') {
      this.exportService.toPdf(res, 'satisfaction', 'Enquêtes de Satisfaction', cols, rows);
    } else {
      await this.exportService.toExcel(res, 'satisfaction', 'Satisfaction', cols, rows);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupère une enquête par ID' })
  findOne(@Param('id') id: string): Promise<SatisfactionSurvey> {
    return this.satisfactionService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crée une enquête de satisfaction' })
  create(@Body() dto: Partial<SatisfactionSurvey>): Promise<SatisfactionSurvey> {
    return this.satisfactionService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Met à jour une enquête' })
  update(@Param('id') id: string, @Body() dto: Partial<SatisfactionSurvey>): Promise<SatisfactionSurvey> {
    return this.satisfactionService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Désactive une enquête' })
  remove(@Param('id') id: string): Promise<void> {
    return this.satisfactionService.remove(id);
  }

  @Post(':id/responses')
  @ApiOperation({ summary: 'Soumet une réponse à l\'enquête' })
  addResponse(@Param('id') id: string, @Body() dto: any) {
    return this.satisfactionService.addResponse(id, dto);
  }

  @Get(':id/responses')
  @ApiOperation({ summary: 'Liste les réponses d\'une enquête' })
  getResponses(@Param('id') id: string) {
    return this.satisfactionService.getResponses(id);
  }
}
