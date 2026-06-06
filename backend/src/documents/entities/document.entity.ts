import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  reference: string;

  @Column({ type: 'varchar' })
  titre: string;

  @Column({ type: 'varchar' })
  type: string; // 'procedure' | 'instruction' | 'formulaire' | 'charte' | 'rapport'

  @Column({ type: 'varchar', default: '1.0' })
  version: string;

  @Column({ type: 'varchar', default: 'brouillon' })
  statut: string; // 'brouillon' | 'en_revision' | 'approuve' | 'archive'

  @Column({ type: 'uuid', nullable: true })
  process_id: string | null;

  @Column({ type: 'uuid', nullable: true })
  auteur_id: string | null;

  @Column({ type: 'uuid', nullable: true })
  approbateur_id: string | null;

  @Column({ type: 'timestamp', nullable: true })
  date_approbation: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  date_revision: Date | null;

  @Column({ type: 'varchar', nullable: true })
  file_url: string | null;

  @Column({ type: 'text', nullable: true })
  contenu: string | null;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
