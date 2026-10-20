import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsString, IsUUID, Length, Matches, Max, MaxLength, Min } from 'class-validator';
import { Optional, PageDto, Trim } from '../../common/dto';

export class CreateProductDto {
  @ApiProperty({ example: 'Teclado inalámbrico' }) @Trim() @IsString() @Length(2, 150)
  name!: string;
  @ApiProperty({ example: 'TEC-010' })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().toUpperCase() : value)
  @IsString() @Matches(/^[A-Z0-9_-]{2,50}$/)
  sku!: string;
  @ApiPropertyOptional({ example: 'Conexión USB' }) @Optional() @Trim() @IsString() @MaxLength(1000)
  description?: string;
  @ApiProperty({ example: '185.00', type: String, description: 'BOB; cadena decimal, hasta 8 enteros y 2 decimales' })
  @IsString() @Matches(/^(0|[1-9]\d{0,7})(\.\d{1,2})?$/)
  price!: string;
  @ApiPropertyOptional({ default: 0 }) @Optional() @IsInt() @Min(0) @Max(1000000000)
  stock?: number;
  @ApiPropertyOptional({ default: 5 }) @Optional() @IsInt() @Min(0) @Max(1000000000)
  minStock?: number;
  @ApiPropertyOptional({ default: true }) @Optional() @IsBoolean()
  active?: boolean;
  @ApiProperty({ format: 'uuid' }) @IsUUID()
  categoryId!: string;
}
// Después del alta, todo cambio de existencias requiere un movimiento.
export class UpdateProductDto extends PartialType(OmitType(CreateProductDto, ['stock'] as const), { skipNullProperties: false }) {}
export class ProductQueryDto extends PageDto {
  @ApiPropertyOptional() @Optional() @Trim() @IsString() @MaxLength(150)
  search?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @Optional() @IsUUID()
  categoryId?: string;
  @ApiPropertyOptional({ enum: ['true', 'false'] }) @Optional() @IsIn(['true', 'false'])
  active?: string;
}
