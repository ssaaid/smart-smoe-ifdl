import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsOptional, IsNumber, IsUUID, IsBoolean, Min, Max,
} from 'class-validator';

export class CreateRiskDto {
  @ApiProperty({ example: 'RSK-001' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Risque de non-conformité pédagogique' })
  @IsString()
  libelle: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'operationnel' })
  @IsString()
  categorie: string;

  @ApiProperty({ example: 3 })
  @IsNumber()
  @Min(1)
  @Max(5)
  probabilite: number;

  @ApiProperty({ example: 4 })
  @IsNumber()
  @Min(1)
  @Max(5)
  gravite: number;

  @ApiPropertyOptional({ example: 'risque' })
  @IsOptional()
  @IsString()
  type?: string;

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
  @IsString()
  plan_traitement?: string;

  @ApiPropertyOptional()
  @IsOptional()
  echeance?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
