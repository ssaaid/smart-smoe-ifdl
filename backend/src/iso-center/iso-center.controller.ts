import {
  Controller, Get, Post, Patch, Delete, Param, Body,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsoCenterService } from './iso-center.service';
import { IsoClause, MaturityAssessment } from './entities/iso.entity';

@ApiTags('ISO Center')
@ApiBearerAuth('access-token')
@Controller('iso-center')
export class IsoCenterController {
  constructor(private readonly isoCenterService: IsoCenterService) {}

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
}
