import {
  Controller, Get, Post, Patch, Delete, Param, Body,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProcessesService } from './processes.service';
import { Process } from './entities/process.entity';

@ApiTags('Processes')
@ApiBearerAuth('access-token')
@Controller('processes')
export class ProcessesController {
  constructor(private readonly processesService: ProcessesService) {}

  @Get()
  @ApiOperation({ summary: 'Liste tous les processus' })
  findAll(): Promise<Process[]> {
    return this.processesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupère un processus par ID' })
  findOne(@Param('id') id: string): Promise<Process> {
    return this.processesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crée un processus' })
  create(@Body() dto: Partial<Process>): Promise<Process> {
    return this.processesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Met à jour un processus' })
  update(@Param('id') id: string, @Body() dto: Partial<Process>): Promise<Process> {
    return this.processesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Désactive un processus' })
  remove(@Param('id') id: string): Promise<void> {
    return this.processesService.remove(id);
  }
}
