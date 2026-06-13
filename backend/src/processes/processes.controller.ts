import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, Res,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { ProcessesService } from './processes.service';
import { Process } from './entities/process.entity';
import { ExportService } from '../common/export/export.service';

@ApiTags('Processes')
@ApiBearerAuth('access-token')
@Controller('processes')
export class ProcessesController {
  constructor(
    private readonly processesService: ProcessesService,
    private readonly exportService: ExportService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Liste tous les processus' })
  findAll(): Promise<Process[]> {
    return this.processesService.findAll();
  }

  @Get('export')
  @ApiOperation({ summary: 'Export cartographie des processus (xlsx ou pdf)' })
  async export(@Query('format') format = 'xlsx', @Res() res: Response) {
    const data = await this.processesService.findAll();
    const cols = [
      { key: 'code', header: 'Code', width: 12 },
      { key: 'libelle', header: 'Libellé', width: 30 },
      { key: 'type', header: 'Type', width: 16 },
      { key: 'objectifs', header: 'Objectifs', width: 40 },
      { key: 'description', header: 'Description', width: 40 },
    ];
    if (format === 'pdf') {
      this.exportService.toPdf(res, 'processus', 'Cartographie des Processus', cols, data);
    } else {
      await this.exportService.toExcel(res, 'processus', 'Processus', cols, data);
    }
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
