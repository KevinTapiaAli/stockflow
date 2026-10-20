import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsString, IsUUID, Length, Max, Min, ValidateNested } from 'class-validator';
import { Trim } from '../../common/dto';
export class SaleItemDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID()
  productId!: string;
  @ApiProperty({ example: 2, minimum: 1, maximum: 10000 }) @IsInt() @Min(1) @Max(10000)
  quantity!: number;
}
export class CreateSaleDto {
  @ApiProperty({ example: 'Cliente de mostrador' }) @Trim() @IsString() @Length(2, 150)
  customer!: string;
  @ApiProperty({ type: [SaleItemDto], minItems: 1, maxItems: 50 })
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(50) @ValidateNested({ each: true }) @Type(() => SaleItemDto)
  items!: SaleItemDto[];
}
export class CancelSaleDto {
  @ApiProperty({ example: 'Solicitud del cliente' }) @Trim() @IsString() @Length(3, 500)
  reason!: string;
}
