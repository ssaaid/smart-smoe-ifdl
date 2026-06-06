import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsDateString, IsOptional, IsString } from 'class-validator';

export class AddMesureDto {
  @ApiProperty({ example: 85.5 })
  @IsNumber()
  valeur: number;

  @ApiProperty({ example: '2024-06-01T00:00:00.000Z' })
  @IsDateString()
  periode: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  commentaire?: string;
}
