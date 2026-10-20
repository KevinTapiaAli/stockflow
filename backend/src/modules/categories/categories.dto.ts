import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, Length, MaxLength } from 'class-validator';
import { Optional, Trim } from '../../common/dto';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Tecnología', maxLength: 100 })
  @Trim() @IsString() @Length(2, 100)
  name!: string;

  @ApiPropertyOptional({ example: 'Accesorios tecnológicos', maxLength: 500 })
  @Optional() @Trim() @IsString() @MaxLength(500)
  description?: string;
}
export class UpdateCategoryDto extends PartialType(CreateCategoryDto, { skipNullProperties: false }) {}
