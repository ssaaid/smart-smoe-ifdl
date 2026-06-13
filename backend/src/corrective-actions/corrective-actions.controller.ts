import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, Res,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { CorrectiveActionsService } from './corrective-actions.service';
import { CorrectiveAction } from './entities/corrective-action.entity';
import { ExportService } from '../common/export/export.service';

@ApiTags('Actions')
@ApiBearerAuth('access-token')
@Controller('corrective-actions')
export class CorrectiveActionsController {
  constructor(
    private readonly correctiveActionsService: CorrectiveActionsService,
    private readonly exportService: ExportService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Liste toutes les actions correctives' })
  findAll(): Promise<CorrectiveAction[]> {
    return this.correctiveActionsService.findAll();
  }

  @Get('export')
  @ApiOperation({ summary: 'Export actions correctives (xlsx ou pdf)' })
  async export(@Query('format') format = 'xlsx', @Res() res: Response) {
    const data = await this.correctiveActionsService.findAll();
    const cols = [
      { key: 'code', header: 'Code', width: 12 },
      { key: 'titre', header: 'Titre', width: 30 },
      { key: 'type', header: 'Type', width: 16 },
      { key: 'statut', header: 'Statut', width: 14 },
      { key: 'avancement', header: 'Avancement (%)', width: 16 },
      { key: 'date_echeance', header: 'Échéance', width: 14 },
      { key: 'date_cloture', header: 'Clôture', width: 14 },
    ];
    const rows = data.map((d) => ({
      ...d,
      date_echeance: d.date_echeance ? new Date(d.date_echeance).toLocaleDateString('fr-FR') : '',
      date_cloture: d.date_cloture ? new Date(d.date_cloture).toLocaleDateString('fr-FR') : '',
    }));
    if (format === 'pdf') {
      this.exportService.toPdf(res, 'actions-correctives', 'Plan d\'Actions Correctives', cols, rows);
    } else {
      await this.exportService.toExcel(res, 'actions-correctives', 'Actions Correctives', cols, rows);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupère une action corrective par ID' })
  findOne(@Param('id') id: string): Promise<CorrectiveAction> {
    return this.correctiveActionsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crée une action corrective' })
  create(@Body() dto: Partial<CorrectiveAction>): Promise<CorrectiveAction> {
    return this.correctiveActionsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Met à jour une action corrective' })
  update(@Param('id') id: string, @Body() dto: Partial<CorrectiveAction>): Promise<CorrectiveAction> {
    return this.correctiveActionsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Désactive une action corrective' })
  remove(@Param('id') id: string): Promise<void> {
    return this.correctiveActionsService.remove(id);
  }
}
