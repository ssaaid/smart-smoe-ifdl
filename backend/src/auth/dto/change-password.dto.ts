import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  current_password: string;

  @ApiProperty({ example: 'NewSecure@Pass2024' })
  @IsString()
  @MinLength(8)
  new_password: string;

  @ApiProperty({ example: 'NewSecure@Pass2024' })
  @IsString()
  confirm_password: string;
}
