import {
  Controller, Get, Post, Patch, Delete, Param, Body,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { Report } from './entities/report.entity';

@ApiTags('Reports')
@ApiBearerAuth('access-token')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste tous les rapports' })
  findAll(): Promise<Report[]> {
    return this.reportsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupère un rapport par ID' })
  findOne(@Param('id') id: string): Promise<Report> {
    return this.reportsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crée un rapport' })
  create(@Body() dto: Partial<Report>): Promise<Report> {
    return this.reportsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Met à jour un rapport' })
  update(@Param('id') id: string, @Body() dto: Partial<Report>): Promise<Report> {
    return this.reportsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Désactive un rapport' })
  remove(@Param('id') id: string): Promise<void> {
    return this.reportsService.remove(id);
  }
}
