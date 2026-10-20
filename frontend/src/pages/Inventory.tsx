import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { ProductPicker } from '../components/ProductPicker';
import { Badge, Empty, Field, FormActions, Modal, PageTitle, Pagination, State, useMutation } from '../components/UI';
import { useResource } from '../hooks/useResource';
import { api, json, query } from '../services/api';
import { date, movementLabel } from '../utils/format';
import type { Movement, Page, Product } from '../types';
export function Inventory() {
  const [product, setProduct] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const resource = useResource<Page<Movement>>(`/inventory/movements${query({ productId: product?.id, page })}`);
  return <>
    <PageTitle title="Movimientos de inventario" description="Cada entrada y salida queda registrada. Tu historial siempre disponible." action={<button className="btn primary" onClick={() => setCreating(true)}><Icon name="plus" size={18} />Nuevo movimiento</button>} />
    <section className="panel"><div className="filter-picker"><ProductPicker value={product} change={(value) => { setProduct(value); setPage(1); }} required={false} activeOnly={false} /></div>
      <State {...resource} retry={resource.reload}>{resource.data && <>
        {resource.data.data.length ? <div className="table-wrap"><table><thead><tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th>Cantidad</th><th>Motivo / referencia</th></tr></thead><tbody>{resource.data.data.map((movement) => <tr key={movement.id}><td className="nowrap">{date(movement.createdAt)}</td><td><strong>{movement.product.name}</strong><small className="table-sub">{movement.product.sku}</small></td><td><Badge tone={['IN', 'CANCELLATION'].includes(movement.type) ? 'green' : 'amber'}>{movementLabel[movement.type]}</Badge></td><td>{['IN', 'CANCELLATION'].includes(movement.type) ? '+' : '−'}{movement.quantity}</td><td>{movement.reason}{movement.saleId && <Link className="table-sub text-link" to={`/sales/${movement.saleId}`}>Ver venta</Link>}</td></tr>)}</tbody></table></div> : <Empty text="Sin movimientos para esta selección." />}
        <Pagination meta={resource.data.meta} change={setPage} />
      </>}</State>
    </section>
    {creating && <MovementForm close={() => setCreating(false)} saved={() => { setCreating(false); resource.reload(); }} />}
  </>;
}
function MovementForm({ close, saved }: { close: () => void; saved: () => void }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [type, setType] = useState<'IN' | 'OUT'>('IN');
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState('');
  const mutation = useMutation();
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!product) return;
    void mutation.run(() => api('/inventory/movements', json('POST', { productId: product.id, type, quantity: Number(quantity), reason: reason.trim() })), 'Movimiento registrado.', saved);
  }
  return <Modal title="Nuevo movimiento" close={close} busy={mutation.busy}><form onSubmit={submit}><fieldset disabled={mutation.busy}>
    <ProductPicker value={product} change={setProduct} />
    <div className="form-grid"><Field label="Tipo"><select value={type} onChange={(event) => setType(event.target.value as 'IN' | 'OUT')}><option value="IN">Entrada de stock</option><option value="OUT">Salida de stock</option></select></Field><Field label="Cantidad"><input type="number" required min="1" max="1000000" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></Field></div>
    <Field label="Motivo"><textarea required minLength={3} maxLength={500} rows={3} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Ej. Reposición del proveedor" /></Field>
    <p className="inline-note">Los movimientos son permanentes. Para corregir uno, registra un movimiento compensatorio con el motivo correspondiente.</p>
  </fieldset>{mutation.error && <p className="error" role="alert">{mutation.error}</p>}<FormActions busy={mutation.busy} close={close} label="Registrar movimiento" /></form></Modal>;
}
