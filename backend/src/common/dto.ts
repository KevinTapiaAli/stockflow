import { Transform, Type } from 'class-transformer';
import { IsInt, Max, Min, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const Optional = () => ValidateIf((_object: unknown, value: unknown) => value !== undefined);
export const Trim = () => Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value);
export class PageDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Optional() @Type(() => Number) @IsInt() @Min(1) @Max(100000)
  page = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @Optional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit = 10;
}

export function pageResult<T>(data: T[], total: number, query: PageDto) {
  return { data, meta: { total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) } };
}
