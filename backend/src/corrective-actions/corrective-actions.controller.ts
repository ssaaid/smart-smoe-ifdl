import {
  Controller, Get, Post, Patch, Delete, Param, Body,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CorrectiveActionsService } from './corrective-actions.service';
import { CorrectiveAction } from './entities/corrective-action.entity';

@ApiTags('Actions')
@ApiBearerAuth('access-token')
@Controller('corrective-actions')
export class CorrectiveActionsController {
  constructor(private readonly correctiveActionsService: CorrectiveActionsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste toutes les actions correctives' })
  findAll(): Promise<CorrectiveAction[]> {
    return this.correctiveActionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupère une action corrective par ID' })
  findOne(@Param('id') id: string): Promise<CorrectiveAction> {
    return this.correctiveActionsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crée une action corrective' })
  create(@Body() dto: Partial<CorrectiveAction>): Promise<CorrectiveAction> {
    return this.correctiveActionsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Met à jour une action corrective' })
  update(@Param('id') id: string, @Body() dto: Partial<CorrectiveAction>): Promise<CorrectiveAction> {
    return this.correctiveActionsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Désactive une action corrective' })
  remove(@Param('id') id: string): Promise<void> {
    return this.correctiveActionsService.remove(id);
  }
}
