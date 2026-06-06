/**
 * Auth DTOs — Data Transfer Objects for validation
 */
import {
  IsEmail, IsString, MinLength, MaxLength,
  IsEnum, IsOptional, IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ── LoginDto ──────────────────────────────────────────────────
export class LoginDto {
  @ApiProperty({ example: 'admin@smoe-ifdl.ma' })
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @ApiProperty({ example: 'Admin@SMOE2024' })
  @IsString()
  @MinLength(8)
  password: string;
}

// ── RegisterDto ───────────────────────────────────────────────
export class RegisterDto {
  @ApiProperty({ example: 'Benali' })
  @IsString()
  @MaxLength(100)
  nom: string;

  @ApiProperty({ example: 'Karim' })
  @IsString()
  @MaxLength(100)
  prenom: string;

  @ApiProperty({ example: 'k.benali@esef-berrechid.ma' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Secure@Pass2024' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ enum: ['admin', 'responsable_qualite', 'coordonnateur', 'enseignant', 'personnel_admin', 'etudiant', 'auditeur'] })
  @IsOptional()
  @IsEnum(['admin', 'responsable_qualite', 'coordonnateur', 'enseignant', 'personnel_admin', 'etudiant', 'auditeur'])
  role?: string;

  @ApiPropertyOptional({ example: 'Département Informatique' })
  @IsOptional()
  @IsString()
  departement?: string;

  @ApiPropertyOptional({ example: '+212 6 XX XX XX XX' })
  @IsOptional()
  @IsString()
  telephone?: string;
}

// ── RefreshTokenDto ───────────────────────────────────────────
export class RefreshTokenDto {
  @ApiProperty()
  @IsUUID()
  user_id: string;

  @ApiProperty()
  @IsString()
  refresh_token: string;
}

// ── ChangePasswordDto ─────────────────────────────────────────
export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  current_password: string;

  @ApiProperty({ example: 'NewSecure@Pass2024' })
  @IsString()
  @MinLength(8)
  new_password: string;
}
