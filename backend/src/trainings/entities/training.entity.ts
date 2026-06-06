import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('trainings')
export class Training {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  titre: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar' })
  type: string; // 'interne' | 'externe' | 'elearning'

  @Column({ type: 'varchar', default: 'planifie' })
  statut: string; // 'planifie' | 'en_cours' | 'termine' | 'annule'

  @Column({ type: 'timestamp' })
  date_debut: Date;

  @Column({ type: 'timestamp' })
  date_fin: Date;

  @Column({ type: 'varchar', nullable: true })
  formateur: string | null;

  @Column({ type: 'varchar', nullable: true })
  lieu: string | null;

  @Column({ type: 'text', array: true, default: [] })
  participants: string[];

  @Column({ type: 'decimal', nullable: true })
  nb_heures: number | null;

  @Column({ type: 'decimal', nullable: true })
  cout: number | null;

  @Column({ type: 'decimal', nullable: true })
  evaluation_score: number | null;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
