import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('iso_clauses')
export class IsoClause {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  code: string; // e.g. '4.1'

  @Column({ type: 'varchar' })
  titre: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  exigences: string | null;

  @Column({ type: 'uuid', nullable: true })
  parent_id: string | null;

  @Column({ type: 'int', default: 1 })
  niveau: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

@Entity('maturity_assessments')
export class MaturityAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  clause_id: string;

  @ManyToOne(() => IsoClause, { nullable: false, eager: false })
  @JoinColumn({ name: 'clause_id' })
  clause: IsoClause;

  @Column({ type: 'int' })
  niveau_maturite: number; // 1-5

  @Column({ type: 'decimal', nullable: true })
  score_global: number | null;

  @Column({ type: 'text', nullable: true })
  commentaire: string | null;

  @Column({ type: 'uuid', nullable: true })
  evaluateur_id: string | null;

  @Column({ type: 'timestamp' })
  date_evaluation: Date;

  @Column({ type: 'text', array: true, default: [] })
  preuves: string[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
