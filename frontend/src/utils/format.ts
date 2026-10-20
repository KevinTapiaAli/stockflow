import type { MovementType } from '../types';
export const money = (value: string) => new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(Number(value));
export const date = (value: string) => new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
export const movementLabel: Record<MovementType, string> = { IN: 'Entrada', OUT: 'Salida', SALE: 'Venta', CANCELLATION: 'Anulación' };
export const cents = (value: string) => {
  const [integer, fraction = ''] = value.split('.');
  return BigInt(integer) * 100n + BigInt(fraction.padEnd(2, '0'));
};
export const decimal = (value: bigint) => `${value / 100n}.${String(value % 100n).padStart(2, '0')}`;
