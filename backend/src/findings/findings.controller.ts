import {
  Controller, Get, Post, Patch, Delete, Param, Body,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FindingsService } from './findings.service';
import { Finding } from './entities/finding.entity';

@ApiTags('Findings')
@ApiBearerAuth('access-token')
@Controller('findings')
export class FindingsController {
  constructor(private readonly findingsService: FindingsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste tous les constats' })
  findAll(): Promise<Finding[]> {
    return this.findingsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupère un constat par ID' })
  findOne(@Param('id') id: string): Promise<Finding> {
    return this.findingsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crée un constat' })
  create(@Body() dto: Partial<Finding>): Promise<Finding> {
    return this.findingsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Met à jour un constat' })
  update(@Param('id') id: string, @Body() dto: Partial<Finding>): Promise<Finding> {
    return this.findingsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Désactive un constat' })
  remove(@Param('id') id: string): Promise<void> {
    return this.findingsService.remove(id);
  }
}
