import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('satisfaction_surveys')
export class SatisfactionSurvey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  titre: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar' })
  type: string; // 'etudiant' | 'personnel' | 'partenaire' | 'employeur'

  @Column({ type: 'varchar', default: 'brouillon' })
  statut: string; // 'brouillon' | 'actif' | 'ferme' | 'clos'

  @Column({ type: 'timestamp', nullable: true })
  date_debut: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  date_fin: Date | null;

  @Column({ type: 'jsonb', default: [] })
  questions: any[];

  @Column({ type: 'decimal', nullable: true })
  score_moyen: number | null;

  @Column({ type: 'int', default: 0 })
  nb_reponses: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

@Entity('survey_responses')
export class SurveyResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  survey_id: string;

  @ManyToOne(() => SatisfactionSurvey, { nullable: false, eager: false })
  @JoinColumn({ name: 'survey_id' })
  survey: SatisfactionSurvey;

  @Column({ type: 'uuid', nullable: true })
  repondant_id: string | null;

  @Column({ type: 'jsonb', default: {} })
  reponses: Record<string, any>;

  @Column({ type: 'decimal', nullable: true })
  score_global: number | null;

  @Column({ type: 'text', nullable: true })
  commentaire: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
