import { useState } from 'react';
import { useDebounced, useResource } from '../hooks/useResource';
import { query } from '../services/api';
import type { Page, Product } from '../types';
import { Field } from './UI';
export function ProductPicker({ value, change, activeOnly = true, required = true }: {
  value: Product | null; change: (value: Product | null) => void; activeOnly?: boolean; required?: boolean;
}) {
  const [search, setSearch] = useState('');
  const term = useDebounced(search);
  const resource = useResource<Page<Product>>(`/products${query({ search: term, active: activeOnly ? 'true' : undefined, limit: 20 })}`);
  const products = resource.data?.data ?? [];
  const options = value && !products.some((product) => product.id === value.id) ? [value, ...products] : products;
  return <div className="picker">
    <Field label="Buscar producto"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre o SKU…" maxLength={150} /></Field>
    <Field label="Producto" hint="Se muestran hasta 20 coincidencias. Escriba para encontrar otros productos.">
      <select required={required} value={value?.id ?? ''} onChange={(event) => change(options.find((product) => product.id === event.target.value) ?? null)}>
        <option value="">{required ? 'Seleccione un producto' : 'Todos los productos'}</option>
        {options.map((product) => <option key={product.id} value={product.id}>{product.sku} · {product.name} · Stock: {product.stock}</option>)}
      </select>
    </Field>
    {resource.loading && <small role="status">Buscando productos…</small>}
    {resource.error && <p className="error" role="alert">{resource.error} <button type="button" className="text-btn" onClick={resource.reload}>Reintentar</button></p>}
  </div>;
}
