import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  titre: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', default: 'info' })
  type: string; // 'info' | 'warning' | 'error' | 'success'

  @Column({ type: 'uuid' })
  destinataire_id: string;

  @ManyToOne(() => User, { nullable: false, eager: false })
  @JoinColumn({ name: 'destinataire_id' })
  destinataire: User;

  @Column({ type: 'boolean', default: false })
  is_read: boolean;

  @Column({ type: 'varchar', nullable: true })
  lien: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
