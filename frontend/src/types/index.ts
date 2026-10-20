export interface Category { id: string; name: string; description: string; _count?: { products: number } }
export interface Product {
  id: string; name: string; sku: string; description: string; price: string; stock: number;
  minStock: number; active: boolean; categoryId: string; category: Category; createdAt: string; updatedAt: string;
}
export type MovementType = 'IN' | 'OUT' | 'SALE' | 'CANCELLATION';
export interface Movement {
  id: string; productId: string; product: Product; type: MovementType;
  quantity: number; reason: string; createdAt: string; saleId: string | null;
}
export interface SaleItem {
  id: string; productId: string; productName: string; sku: string;
  quantity: number; unitPrice: string; subtotal: string;
}
export interface Sale {
  id: string; customer: string; total: string; status: 'CONFIRMED' | 'CANCELLED'; createdAt: string;
  cancelledAt: string | null; cancellationReason: string | null; items: SaleItem[];
  _count?: { items: number };
}
export interface Page<T> { data: T[]; meta: { page: number; limit: number; total: number; totalPages: number } }
export interface Summary {
  products: number; categories: number; lowStock: number; sales: number; confirmedSales: number;
  totalRevenue: string; recentMovements: Movement[]; lowStockProducts: Product[];
}
