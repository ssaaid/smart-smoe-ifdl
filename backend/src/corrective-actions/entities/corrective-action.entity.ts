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

@Entity('corrective_actions')
export class CorrectiveAction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  code: string;

  @Column({ type: 'varchar' })
  titre: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar' })
  type: string; // 'corrective' | 'preventive' | 'amelioration'

  @Column({ type: 'varchar', default: 'ouverte' })
  statut: string; // 'ouverte' | 'en_cours' | 'efficace' | 'inefficace' | 'fermee' | 'cloturee'

  @Column({ type: 'int', default: 0 })
  avancement: number; // 0-100 percentage

  @Column({ type: 'uuid', nullable: true })
  finding_id: string | null;

  @Column({ type: 'uuid', nullable: true })
  responsable_id: string | null;

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'responsable_id' })
  responsable: User;

  @Column({ type: 'timestamp', nullable: true })
  date_echeance: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  echeance: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  date_cloture: Date | null;

  @Column({ type: 'text', nullable: true })
  actions_realisees: string | null;

  @Column({ type: 'text', nullable: true })
  verification_efficacite: string | null;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
