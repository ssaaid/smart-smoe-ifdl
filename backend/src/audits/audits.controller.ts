import {
  Controller, Get, Post, Patch, Delete, Param, Body,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuditsService } from './audits.service';
import { Audit } from './entities/audit.entity';

@ApiTags('Audits')
@ApiBearerAuth('access-token')
@Controller('audits')
export class AuditsController {
  constructor(private readonly auditsService: AuditsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste tous les audits' })
  findAll(): Promise<Audit[]> {
    return this.auditsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupère un audit par ID' })
  findOne(@Param('id') id: string): Promise<Audit> {
    return this.auditsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crée un audit' })
  create(@Body() dto: Partial<Audit>): Promise<Audit> {
    return this.auditsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Met à jour un audit' })
  update(@Param('id') id: string, @Body() dto: Partial<Audit>): Promise<Audit> {
    return this.auditsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Désactive un audit' })
  remove(@Param('id') id: string): Promise<void> {
    return this.auditsService.remove(id);
  }
}
