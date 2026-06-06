import {
  Controller, Get, Post, Patch, Delete, Param, Body,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ComplaintsService } from './complaints.service';
import { Complaint } from './entities/complaint.entity';

@ApiTags('Complaints')
@ApiBearerAuth('access-token')
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste toutes les réclamations' })
  findAll(): Promise<Complaint[]> {
    return this.complaintsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupère une réclamation par ID' })
  findOne(@Param('id') id: string): Promise<Complaint> {
    return this.complaintsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crée une réclamation' })
  create(@Body() dto: Partial<Complaint>): Promise<Complaint> {
    return this.complaintsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Met à jour une réclamation' })
  update(@Param('id') id: string, @Body() dto: Partial<Complaint>): Promise<Complaint> {
    return this.complaintsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Désactive une réclamation' })
  remove(@Param('id') id: string): Promise<void> {
    return this.complaintsService.remove(id);
  }
}
