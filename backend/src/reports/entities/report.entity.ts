import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  titre: string;

  @Column({ type: 'varchar' })
  type: string; // 'revue_direction' | 'bilan_qualite' | 'audit' | 'satisfaction' | 'kpi'

  @Column({ type: 'varchar', default: 'brouillon' })
  statut: string; // 'brouillon' | 'finalise' | 'approuve'

  @Column({ type: 'timestamp', nullable: true })
  periode_debut: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  periode_fin: Date | null;

  @Column({ type: 'uuid', nullable: true })
  auteur_id: string | null;

  @Column({ type: 'jsonb', default: {} })
  contenu: Record<string, any>;

  @Column({ type: 'varchar', nullable: true })
  file_url: string | null;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
