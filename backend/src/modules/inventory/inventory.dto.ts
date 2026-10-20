import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsString, IsUUID, Length, Max, Min } from 'class-validator';
import { Optional, PageDto, Trim } from '../../common/dto';

export class CreateMovementDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID()
  productId!: string;
  @ApiProperty({ enum: ['IN', 'OUT'] }) @IsIn(['IN', 'OUT'])
  type!: 'IN' | 'OUT';
  @ApiProperty({ example: 5, minimum: 1, maximum: 1000000 }) @IsInt() @Min(1) @Max(1000000)
  quantity!: number;
  @ApiProperty({ example: 'Reposición de proveedor' }) @Trim() @IsString() @Length(3, 500)
  reason!: string;
}
export class MovementQueryDto extends PageDto {
  @ApiPropertyOptional({ format: 'uuid' }) @Optional() @IsUUID()
  productId?: string;
}
