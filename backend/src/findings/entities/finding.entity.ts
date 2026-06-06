import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('findings')
export class Finding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar' })
  type: string; // 'non_conformite' | 'ecart_mineur' | 'observation' | 'point_fort'

  @Column({ type: 'varchar', nullable: true })
  severite: string | null; // 'majeure' | 'mineure'

  @Column({ type: 'varchar', default: 'ouvert' })
  statut: string; // 'ouvert' | 'en_traitement' | 'clos'

  @Column({ type: 'uuid', nullable: true })
  audit_id: string | null;

  @Column({ type: 'uuid', nullable: true })
  process_id: string | null;

  @Column({ type: 'uuid', nullable: true })
  responsable_id: string | null;

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'responsable_id' })
  responsable: User;

  @Column({ type: 'timestamp', nullable: true })
  echeance: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  date_cloture: Date | null;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
