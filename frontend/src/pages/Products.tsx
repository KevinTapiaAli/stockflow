import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Badge, Empty, Field, FormActions, Modal, PageTitle, Pagination, State, useMutation } from '../components/UI';
import { useDebounced, useResource } from '../hooks/useResource';
import { api, json, query } from '../services/api';
import { money } from '../utils/format';
import type { Category, Page, Product } from '../types';
export function Products() {
  const [params] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') ?? '');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const term = useDebounced(search);
  const resource = useResource<Page<Product>>(`/products${query({ search: term, categoryId, page })}`);
  const categories = useResource<Category[]>('/categories');
  const [editing, setEditing] = useState<Product | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const mutation = useMutation();
  return <>
    <PageTitle title="Productos" description="Tu catálogo, precios y existencias en un solo lugar." action={<button className="btn primary" onClick={() => setEditing('new')}><Icon name="plus" size={18} />Nuevo producto</button>} />
    <section className="panel"><div className="toolbar">
      <input aria-label="Buscar por nombre o SKU" placeholder="Buscar por nombre o SKU…" value={search} maxLength={150} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
      <select aria-label="Filtrar por categoría" value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setPage(1); }}><option value="">Todas las categorías</option>{categories.data?.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
    </div>{categories.error && <p className="inline-alert" role="alert">{categories.error} <button className="text-btn" onClick={categories.reload}>Recargar categorías</button></p>}
      <State {...resource} retry={resource.reload}>{resource.data && <>
        {resource.data.data.length ? <div className="table-wrap"><table><thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock / mínimo</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{resource.data.data.map((product) => <tr key={product.id}><td><strong>{product.name}</strong><small className="table-sub">{product.sku}</small></td><td>{product.category.name}</td><td className="nowrap">{money(product.price)}</td><td><Badge tone={product.stock <= product.minStock ? 'amber' : 'green'}>{product.stock} / {product.minStock}</Badge></td><td><Badge tone={product.active ? 'green' : 'neutral'}>{product.active ? 'Activo' : 'Inactivo'}</Badge></td><td><div className="row-actions"><button className="text-btn" onClick={() => setEditing(product)}>Editar</button><button className="text-btn danger-text" onClick={() => setDeleting(product)}>Eliminar</button></div></td></tr>)}</tbody></table></div> : <Empty text="No hay productos que coincidan." />}
        <Pagination meta={resource.data.meta} change={setPage} />
      </>}</State>
    </section>
    {editing && <ProductForm product={editing === 'new' ? undefined : editing} categories={categories.data ?? []} close={() => setEditing(null)} saved={() => { setEditing(null); resource.reload(); }} />}
    {deleting && <Modal title="Eliminar producto" close={() => setDeleting(null)} busy={mutation.busy}><p>¿Eliminar «{deleting.name}»? Si tiene stock o historial, puedes desactivarlo desde Editar.</p>{mutation.error && <p className="error" role="alert">{mutation.error}</p>}<div className="form-actions"><button className="btn secondary" disabled={mutation.busy} onClick={() => setDeleting(null)}>Cancelar</button><button className="btn danger" disabled={mutation.busy} onClick={() => void mutation.run(() => api(`/products/${deleting.id}`, { method: 'DELETE' }), 'Producto eliminado.', () => { setDeleting(null); resource.reload(); })}>Eliminar producto</button></div></Modal>}
  </>;
}
function ProductForm({ product, categories, close, saved }: { product?: Product; categories: Category[]; close: () => void; saved: () => void }) {
  const [form, setForm] = useState({
    name: product?.name ?? '', sku: product?.sku ?? '', description: product?.description ?? '',
    price: product?.price ?? '', stock: String(product?.stock ?? 0), minStock: String(product?.minStock ?? 5),
    categoryId: product?.categoryId ?? '', active: product?.active ?? true,
  });
  const mutation = useMutation();
  const field = (key: keyof typeof form, value: string | boolean) => setForm((previous) => ({ ...previous, [key]: value }));
  function submit(event: FormEvent) {
    event.preventDefault();
    const { stock, ...rest } = form;
    const body = { ...rest, name: form.name.trim(), sku: form.sku.trim(), minStock: Number(form.minStock), ...(!product ? { stock: Number(stock) } : {}) };
    void mutation.run(() => api(`/products${product ? `/${product.id}` : ''}`, json(product ? 'PATCH' : 'POST', body)), 'Producto guardado.', saved);
  }
  return <Modal title={product ? 'Editar producto' : 'Nuevo producto'} close={close} busy={mutation.busy}><form onSubmit={submit}><fieldset disabled={mutation.busy}>
    <div className="form-grid"><Field label="Nombre"><input required minLength={2} maxLength={150} value={form.name} onChange={(event) => field('name', event.target.value)} autoFocus /></Field>
      <Field label="SKU único"><input required pattern="[A-Za-z0-9_\-]{2,50}" maxLength={50} value={form.sku} onChange={(event) => field('sku', event.target.value)} /></Field></div>
    <Field label="Categoría"><select required value={form.categoryId} onChange={(event) => field('categoryId', event.target.value)}><option value="">Seleccione una categoría</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field>
    {!categories.length && <p className="inline-alert">Primero registre una categoría y vuelva a abrir este formulario.</p>}
    <div className="form-grid"><Field label="Precio (Bs)" hint="Hasta 2 decimales."><input required type="number" min="0" max="99999999.99" step="0.01" value={form.price} onChange={(event) => field('price', event.target.value)} /></Field>
      <Field label="Stock mínimo"><input required type="number" min="0" max="1000000000" step="1" value={form.minStock} onChange={(event) => field('minStock', event.target.value)} /></Field></div>
    {!product ? <Field label="Stock inicial"><input required type="number" min="0" max="1000000000" step="1" value={form.stock} onChange={(event) => field('stock', event.target.value)} /></Field> : <p className="inline-note">Stock actual: {product.stock}. Registra entradas y salidas desde Movimientos.</p>}
    <Field label="Descripción"><textarea rows={3} maxLength={1000} value={form.description} onChange={(event) => field('description', event.target.value)} /></Field>
    <label className="checkbox-field"><input type="checkbox" checked={form.active} onChange={(event) => field('active', event.target.checked)} />Producto activo para ventas y movimientos manuales</label>
  </fieldset>{mutation.error && <p className="error" role="alert">{mutation.error}</p>}<FormActions busy={mutation.busy} close={close} /></form></Modal>;
}
