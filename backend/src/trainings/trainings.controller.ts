import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, Res,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { TrainingsService } from './trainings.service';
import { Training } from './entities/training.entity';
import { ExportService } from '../common/export/export.service';

@ApiTags('Trainings')
@ApiBearerAuth('access-token')
@Controller('trainings')
export class TrainingsController {
  constructor(
    private readonly trainingsService: TrainingsService,
    private readonly exportService: ExportService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Liste toutes les formations' })
  findAll(): Promise<Training[]> {
    return this.trainingsService.findAll();
  }

  @Get('export')
  @ApiOperation({ summary: 'Export formations (xlsx ou pdf)' })
  async export(@Query('format') format = 'xlsx', @Res() res: Response) {
    const data = await this.trainingsService.findAll();
    const cols = [
      { key: 'titre', header: 'Titre', width: 30 },
      { key: 'type', header: 'Type', width: 14 },
      { key: 'statut', header: 'Statut', width: 14 },
      { key: 'formateur', header: 'Formateur', width: 20 },
      { key: 'lieu', header: 'Lieu', width: 18 },
      { key: 'date_debut', header: 'Début', width: 14 },
      { key: 'date_fin', header: 'Fin', width: 14 },
      { key: 'nb_heures', header: 'Heures', width: 10 },
      { key: 'cout', header: 'Coût (MAD)', width: 14 },
    ];
    const rows = data.map((d) => ({
      ...d,
      date_debut: d.date_debut ? new Date(d.date_debut).toLocaleDateString('fr-FR') : '',
      date_fin: d.date_fin ? new Date(d.date_fin).toLocaleDateString('fr-FR') : '',
    }));
    if (format === 'pdf') {
      this.exportService.toPdf(res, 'formations', 'Plan de Formation', cols, rows);
    } else {
      await this.exportService.toExcel(res, 'formations', 'Formations', cols, rows);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupère une formation par ID' })
  findOne(@Param('id') id: string): Promise<Training> {
    return this.trainingsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crée une formation' })
  create(@Body() dto: Partial<Training>): Promise<Training> {
    return this.trainingsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Met à jour une formation' })
  update(@Param('id') id: string, @Body() dto: Partial<Training>): Promise<Training> {
    return this.trainingsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Désactive une formation' })
  remove(@Param('id') id: string): Promise<void> {
    return this.trainingsService.remove(id);
  }
}
