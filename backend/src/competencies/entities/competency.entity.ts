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

@Entity('competencies')
export class Competency {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  libelle: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', nullable: true })
  domaine: string | null;

  @Column({ type: 'int', default: 1 })
  niveau_requis: number; // 1-5 scale

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

@Entity('user_competencies')
export class UserCompetency {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, { nullable: false, eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  competency_id: string;

  @ManyToOne(() => Competency, { nullable: false, eager: false })
  @JoinColumn({ name: 'competency_id' })
  competency: Competency;

  @Column({ type: 'int' })
  niveau_actuel: number; // 1-5

  @Column({ type: 'timestamp' })
  date_evaluation: Date;

  @Column({ type: 'uuid', nullable: true })
  evaluateur_id: string | null;

  @Column({ type: 'text', nullable: true })
  commentaire: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
