import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Benali' })
  @IsString()
  nom: string;

  @ApiProperty({ example: 'Karim' })
  @IsString()
  prenom: string;

  @ApiProperty({ example: 'k.benali@esef-berrechid.ma' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Secure@Pass2024' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ example: 'enseignant' })
  @IsOptional()
  @IsString()
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
