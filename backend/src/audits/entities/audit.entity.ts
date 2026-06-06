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

@Entity('audits')
export class Audit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  code: string;

  @Column({ type: 'varchar' })
  titre: string;

  @Column({ type: 'varchar' })
  type: string; // 'interne' | 'externe' | 'tierce_partie'

  @Column({ type: 'varchar', default: 'planifie' })
  statut: string; // 'planifie' | 'en_cours' | 'termine' | 'annule'

  @Column({ type: 'timestamp' })
  date_debut: Date;

  @Column({ type: 'timestamp' })
  date_fin: Date;

  @Column({ type: 'uuid', nullable: true })
  auditeur_id: string | null;

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'auditeur_id' })
  responsable: User;

  @Column({ type: 'uuid', nullable: true })
  process_id: string | null;

  @Column({ type: 'varchar', nullable: true })
  rapport_url: string | null;

  @Column({ type: 'text', nullable: true })
  observations: string | null;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
