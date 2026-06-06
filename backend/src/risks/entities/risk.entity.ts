import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Process } from '../../processes/entities/process.entity';
import { User } from '../../users/entities/user.entity';

@Entity('risks')
export class Risk {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ type: 'varchar' })
  libelle: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar' })
  categorie: string; // 'strategique' | 'operationnel' | 'financier' | 'conformite' | 'reputation'

  @Column({ type: 'int' })
  probabilite: number; // 1-5

  @Column({ type: 'int' })
  gravite: number; // 1-5 (impact)

  @Column({ type: 'int', default: 0 })
  criticite: number; // probabilite * gravite

  @Column({ type: 'varchar', default: 'faible' })
  niveau: string; // 'faible' | 'modere' | 'eleve' | 'critique'

  @Column({ type: 'varchar', default: 'identifie' })
  statut: string; // 'identifie' | 'analyse' | 'traite' | 'surveille' | 'clos'

  @Column({ type: 'varchar', default: 'risque' })
  type: string; // 'risque' | 'opportunite'

  @Column({ type: 'uuid', nullable: true })
  process_id: string | null;

  @ManyToOne(() => Process, { nullable: true, eager: false })
  @JoinColumn({ name: 'process_id' })
  process: Process;

  @Column({ type: 'uuid', nullable: true })
  responsable_id: string | null;

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'responsable_id' })
  owner: User;

  @Column({ type: 'text', nullable: true })
  plan_traitement: string | null;

  @Column({ type: 'timestamp', nullable: true })
  echeance: Date | null;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
