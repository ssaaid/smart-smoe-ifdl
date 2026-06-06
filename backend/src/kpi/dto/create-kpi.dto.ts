import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsOptional, IsNumber, IsUUID, IsBoolean,
} from 'class-validator';

export class CreateKpiDto {
  @ApiProperty({ example: 'KPI-001' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Taux de réussite' })
  @IsString()
  libelle: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '%' })
  @IsString()
  unite: string;

  @ApiProperty({ example: 'mensuel' })
  @IsString()
  frequence: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  valeur_cible?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  seuil_alerte?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  valeur_actuelle?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  statut?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  process_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  responsable_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
