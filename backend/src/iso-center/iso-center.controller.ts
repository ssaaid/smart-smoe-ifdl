import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, Res,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { IsoCenterService } from './iso-center.service';
import { IsoClause, MaturityAssessment } from './entities/iso.entity';
import { ExportService } from '../common/export/export.service';

@ApiTags('ISO Center')
@ApiBearerAuth('access-token')
@Controller('iso-center')
export class IsoCenterController {
  constructor(
    private readonly isoCenterService: IsoCenterService,
    private readonly exportService: ExportService,
  ) {}

  @Get('clauses')
  @ApiOperation({ summary: 'Liste toutes les clauses ISO 21001' })
  findAllClauses(): Promise<IsoClause[]> {
    return this.isoCenterService.findAllClauses();
  }

  @Get('clauses/:id')
  @ApiOperation({ summary: 'Récupère une clause ISO par ID' })
  findOneClause(@Param('id') id: string): Promise<IsoClause> {
    return this.isoCenterService.findOneClause(id);
  }

  @Post('clauses')
  @ApiOperation({ summary: 'Crée une clause ISO' })
  createClause(@Body() dto: Partial<IsoClause>): Promise<IsoClause> {
    return this.isoCenterService.createClause(dto);
  }

  @Patch('clauses/:id')
  @ApiOperation({ summary: 'Met à jour une clause ISO' })
  updateClause(@Param('id') id: string, @Body() dto: Partial<IsoClause>): Promise<IsoClause> {
    return this.isoCenterService.updateClause(id, dto);
  }

  @Delete('clauses/:id')
  @ApiOperation({ summary: 'Désactive une clause ISO' })
  removeClause(@Param('id') id: string): Promise<void> {
    return this.isoCenterService.removeClause(id);
  }

  @Get('assessments')
  @ApiOperation({ summary: 'Liste toutes les évaluations de maturité' })
  findAllAssessments(): Promise<MaturityAssessment[]> {
    return this.isoCenterService.findAllAssessments();
  }

  @Post('assessments')
  @ApiOperation({ summary: 'Crée une évaluation de maturité' })
  createAssessment(@Body() dto: Partial<MaturityAssessment>): Promise<MaturityAssessment> {
    return this.isoCenterService.createAssessment(dto);
  }

  @Get('maturity-score')
  @ApiOperation({ summary: 'Dernier score de maturité ISO' })
  getLatestMaturityScore() {
    return this.isoCenterService.getLatestMaturityScore();
  }

  @Get('export')
  @ApiOperation({ summary: 'Export rapport GAP ISO 21001 (xlsx ou pdf)' })
  async export(@Query('format') format = 'xlsx', @Res() res: Response) {
    const clauses = await this.isoCenterService.findAllClauses();
    const cols = [
      { key: 'code', header: 'Clause', width: 10 },
      { key: 'titre', header: 'Titre', width: 35 },
      { key: 'description', header: 'Description', width: 45 },
      { key: 'exigences', header: 'Exigences', width: 45 },
    ];
    if (format === 'pdf') {
      this.exportService.toPdf(res, 'rapport-gap-iso21001', 'Rapport GAP ISO 21001', cols, clauses);
    } else {
      await this.exportService.toExcel(res, 'rapport-gap-iso21001', 'ISO 21001 GAP', cols, clauses);
    }
  }
}
