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

@Entity('complaints')
export class Complaint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  reference: string;

  @Column({ type: 'varchar' })
  objet: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar' })
  type: string; // 'reclamation' | 'recours' | 'suggestion'

  @Column({ type: 'varchar' })
  source: string; // 'etudiant' | 'parent' | 'personnel' | 'partenaire' | 'autre'

  @Column({ type: 'varchar', default: 'recu' })
  statut: string; // 'recu' | 'deposee' | 'en_cours' | 'resolue' | 'resolu' | 'clos'

  @Column({ type: 'varchar', nullable: true })
  plaignant_nom: string | null;

  @Column({ type: 'varchar', nullable: true })
  plaignant_email: string | null;

  @Column({ type: 'uuid', nullable: true })
  responsable_id: string | null;

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'responsable_id' })
  responsable: User;

  @Column({ type: 'decimal', nullable: true })
  delai_traitement: number | null;

  @Column({ type: 'timestamp', nullable: true })
  date_resolution: Date | null;

  @Column({ type: 'text', nullable: true })
  reponse: string | null;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
