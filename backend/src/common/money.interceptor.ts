import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { map } from 'rxjs';

function serialize(value: unknown): unknown {
  if (value instanceof Prisma.Decimal) return value.toFixed(2);
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(serialize);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, serialize(item)]));
  }
  return value;
}
@Injectable()
export class MoneyInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler) { return next.handle().pipe(map(serialize)); }
}
