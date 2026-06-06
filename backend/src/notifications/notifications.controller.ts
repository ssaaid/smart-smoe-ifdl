import {
  Controller, Get, Post, Patch, Delete, Param, Body,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { Notification } from './entities/notification.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste les notifications de l\'utilisateur connecté' })
  findAll(@CurrentUser() user: any): Promise<Notification[]> {
    return this.notificationsService.findAll(user?.sub);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marque une notification comme lue' })
  markAsRead(@Param('id') id: string): Promise<Notification> {
    return this.notificationsService.markAsRead(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crée une notification' })
  create(@Body() dto: Partial<Notification>): Promise<Notification> {
    return this.notificationsService.create(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprime une notification' })
  remove(@Param('id') id: string): Promise<void> {
    return this.notificationsService.remove(id);
  }
}
