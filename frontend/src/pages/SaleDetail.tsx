import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge, Field, FormActions, Modal, PageTitle, State, useMutation } from '../components/UI';
import { useResource } from '../hooks/useResource';
import { api, json } from '../services/api';
import { date, money } from '../utils/format';
import type { Sale } from '../types';
export function SaleDetail() {
  const { id } = useParams<{ id: string }>();
  const resource = useResource<Sale>(`/sales/${id}`);
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState('');
  const mutation = useMutation();
  const sale = resource.data;
  function cancel(event: FormEvent) {
    event.preventDefault();
    void mutation.run(() => api(`/sales/${id}/cancel`, json('PATCH', { reason: reason.trim() })), 'Venta anulada y existencias restituidas.', () => { setCancelling(false); resource.reload(); });
  }
  return <>
    <PageTitle title="Detalle de venta" description={`Referencia: ${id ?? ''}`} action={<Link className="btn secondary" to="/sales">Volver a ventas</Link>} />
    <State {...resource} retry={resource.reload}>{sale && <section className="panel">
      <div className="sale-heading"><div><p className="muted">Cliente</p><h2>{sale.customer}</h2><p className="muted">{date(sale.createdAt)}</p></div><Badge tone={sale.status === 'CONFIRMED' ? 'green' : 'neutral'}>{sale.status === 'CONFIRMED' ? 'Confirmada' : 'Anulada'}</Badge></div>
      <div className="table-wrap"><table><thead><tr><th>Producto</th><th>SKU</th><th>Cantidad</th><th>Precio unitario</th><th>Subtotal</th></tr></thead><tbody>{sale.items.map((item) => <tr key={item.id}><td><strong>{item.productName}</strong></td><td>{item.sku}</td><td>{item.quantity}</td><td>{money(item.unitPrice)}</td><td>{money(item.subtotal)}</td></tr>)}</tbody></table></div>
      <div className="padded"><div className="sale-total"><span>Total de la operación</span><strong>{money(sale.total)}</strong></div>
        {sale.status === 'CANCELLED' ? <div className="inline-alert"><strong>Venta anulada {sale.cancelledAt ? date(sale.cancelledAt) : ''}</strong><p>{sale.cancellationReason}</p><p>Las existencias fueron restituidas. Este total no se contabiliza como ingreso.</p></div> : <button className="btn danger" onClick={() => setCancelling(true)}>Anular venta</button>}
      </div>
    </section>}</State>
    {cancelling && <Modal title="Anular venta" close={() => setCancelling(false)} busy={mutation.busy}><p>Esta acción restituye las existencias una sola vez y conserva la venta en el historial.</p><form onSubmit={cancel}><Field label="Motivo de anulación"><textarea required minLength={3} maxLength={500} rows={3} value={reason} onChange={(event) => setReason(event.target.value)} disabled={mutation.busy} autoFocus /></Field>{mutation.error && <p className="error" role="alert">{mutation.error}</p>}<FormActions busy={mutation.busy} close={() => setCancelling(false)} label="Confirmar anulación" /></form></Modal>}
  </>;
}
