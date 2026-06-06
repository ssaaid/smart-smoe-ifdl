import {
  Controller, Get, Post, Patch, Delete, Param, Body,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SatisfactionService } from './satisfaction.service';
import { SatisfactionSurvey } from './entities/survey.entity';

@ApiTags('Satisfaction')
@ApiBearerAuth('access-token')
@Controller('satisfaction')
export class SatisfactionController {
  constructor(private readonly satisfactionService: SatisfactionService) {}

  @Get()
  @ApiOperation({ summary: 'Liste toutes les enquêtes de satisfaction' })
  findAll(): Promise<SatisfactionSurvey[]> {
    return this.satisfactionService.findAll();
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
