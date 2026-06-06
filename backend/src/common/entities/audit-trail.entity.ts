import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('audit_trails')
export class AuditTrail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'varchar' })
  action: string;

  @Column({ type: 'varchar' })
  entity_type: string;

  @Column({ type: 'varchar', nullable: true })
  entity_id: string | null;

  @Column({ type: 'varchar', nullable: true })
  ip_address: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
