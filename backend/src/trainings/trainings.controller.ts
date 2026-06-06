import {
  Controller, Get, Post, Patch, Delete, Param, Body,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TrainingsService } from './trainings.service';
import { Training } from './entities/training.entity';

@ApiTags('Trainings')
@ApiBearerAuth('access-token')
@Controller('trainings')
export class TrainingsController {
  constructor(private readonly trainingsService: TrainingsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste toutes les formations' })
  findAll(): Promise<Training[]> {
    return this.trainingsService.findAll();
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
