import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  findAll(userId: string): Promise<Notification[]> {
    return this.notificationRepo.find({
      where: { destinataire_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    await this.notificationRepo.update(id, { is_read: true });
    const notification = await this.notificationRepo.findOne({ where: { id } });
    if (!notification) throw new NotFoundException(`Notification ${id} non trouvée`);
    return notification;
  }

  create(dto: Partial<Notification>): Promise<Notification> {
    const notification = this.notificationRepo.create(dto);
    return this.notificationRepo.save(notification);
  }

  async remove(id: string): Promise<void> {
    await this.notificationRepo.delete(id);
  }
}
