import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Process } from '../../processes/entities/process.entity';
import { User } from '../../users/entities/user.entity';

@Entity('kpis')
export class Kpi {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ type: 'varchar' })
  libelle: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar' })
  unite: string;

  @Column({ type: 'varchar' })
  frequence: string; // 'mensuel' | 'trimestriel' | 'annuel'

  @Column({ type: 'decimal', nullable: true })
  valeur_cible: number | null;

  @Column({ type: 'decimal', nullable: true })
  seuil_alerte: number | null;

  @Column({ type: 'decimal', nullable: true })
  valeur_actuelle: number | null;

  @Column({ type: 'varchar', default: 'vert' })
  statut: string; // 'vert' | 'orange' | 'rouge'

  @Column({ type: 'uuid', nullable: true })
  process_id: string | null;

  @ManyToOne(() => Process, { nullable: true, eager: false })
  @JoinColumn({ name: 'process_id' })
  process: Process;

  @Column({ type: 'uuid', nullable: true })
  responsable_id: string | null;

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'responsable_id' })
  responsable: User;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @OneToMany(() => KpiMesure, (m) => m.kpi)
  mesures: KpiMesure[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

@Entity('kpi_mesures')
export class KpiMesure {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  kpi_id: string;

  @ManyToOne(() => Kpi, (kpi) => kpi.mesures, { eager: false })
  @JoinColumn({ name: 'kpi_id' })
  kpi: Kpi;

  @Column({ type: 'decimal' })
  valeur: number;

  @Column({ type: 'timestamp' })
  periode: Date;

  @Column({ type: 'text', nullable: true })
  commentaire: string | null;

  @Column({ type: 'varchar' })
  statut: string;

  @Column({ type: 'uuid' })
  saisie_par: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
