import {
  Controller, Get, Post, Patch, Delete, Param, Body,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CompetenciesService } from './competencies.service';
import { Competency } from './entities/competency.entity';

@ApiTags('Trainings')
@ApiBearerAuth('access-token')
@Controller('competencies')
export class CompetenciesController {
  constructor(private readonly competenciesService: CompetenciesService) {}

  @Get()
  @ApiOperation({ summary: 'Liste toutes les compétences' })
  findAll(): Promise<Competency[]> {
    return this.competenciesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupère une compétence par ID' })
  findOne(@Param('id') id: string): Promise<Competency> {
    return this.competenciesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crée une compétence' })
  create(@Body() dto: Partial<Competency>): Promise<Competency> {
    return this.competenciesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Met à jour une compétence' })
  update(@Param('id') id: string, @Body() dto: Partial<Competency>): Promise<Competency> {
    return this.competenciesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Désactive une compétence' })
  remove(@Param('id') id: string): Promise<void> {
    return this.competenciesService.remove(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Compétences d\'un utilisateur' })
  getUserCompetencies(@Param('userId') userId: string) {
    return this.competenciesService.getUserCompetencies(userId);
  }

  @Post('assign')
  @ApiOperation({ summary: 'Assigne une compétence à un utilisateur' })
  assignCompetency(@Body() dto: any) {
    return this.competenciesService.assignCompetency(dto);
  }
}
