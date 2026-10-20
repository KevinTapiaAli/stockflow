import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProductPicker } from '../components/ProductPicker';
import { Empty, Field, Modal, PageTitle, useMutation } from '../components/UI';
import { api, json } from '../services/api';
import { cents, decimal, money } from '../utils/format';
import type { Product, Sale } from '../types';
interface Line { product: Product; quantity: number }
export function NewSale() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState('Cliente de mostrador');
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [lines, setLines] = useState<Line[]>([]);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const mutation = useMutation();
  const total = decimal(lines.reduce((sum, line) => sum + cents(line.product.price) * BigInt(line.quantity), 0n));
  function add(event: FormEvent) {
    event.preventDefault();
    if (!product) return;
    const number = Number(quantity);
    const existing = lines.find((line) => line.product.id === product.id);
    const combined = number + (existing?.quantity ?? 0);
    if (combined > product.stock || combined > 10000) { setError('La cantidad excede el stock disponible o el máximo de 10.000 por producto.'); return; }
    if (!existing && lines.length >= 50) { setError('Una venta admite hasta 50 productos distintos.'); return; }
    setLines((previous) => existing ? previous.map((line) => line.product.id === product.id ? { product, quantity: combined } : line) : [...previous, { product, quantity: number }]);
    setError('');
    setProduct(null);
    setQuantity('1');
  }
  async function confirm() {
    let sale: Sale | undefined;
    await mutation.run(async () => {
      sale = await api<Sale>('/sales', json('POST', { customer: customer.trim(), items: lines.map((line) => ({ productId: line.product.id, quantity: line.quantity })) }));
    }, 'Venta registrada correctamente.', () => { if (sale) navigate(`/sales/${sale.id}`); });
    setConfirming(false);
  }
  return <>
    <PageTitle title="Registrar venta" description="Selecciona productos. El servidor validará existencias y calculará el importe final." action={<Link className="btn secondary" to="/sales">Volver a ventas</Link>} />
    <div className="sale-columns">
      <section className="panel padded"><h2>Agregar productos</h2><form onSubmit={add}><ProductPicker value={product} change={setProduct} /><Field label="Cantidad"><input type="number" required min="1" max="10000" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></Field>{product && <p className="inline-note">Precio actual: {money(product.price)} · Stock: {product.stock}</p>}{error && <p className="error" role="alert">{error}</p>}<button className="btn secondary full" type="submit" disabled={!product}>Agregar a la venta</button></form></section>
      <section className="panel padded"><h2>Detalle de la operación</h2>
        {lines.length ? <div className="cart-lines">{lines.map((line) => <div className="cart-line" key={line.product.id}><div className="grow"><strong>{line.product.name}</strong><small>{line.quantity} × {money(line.product.price)}</small></div><strong>{money(decimal(cents(line.product.price) * BigInt(line.quantity)))}</strong><button className="text-btn danger-text" aria-label={`Quitar ${line.product.name}`} onClick={() => setLines((previous) => previous.filter((item) => item.product.id !== line.product.id))}>Quitar</button></div>)}</div> : <Empty text="Agrega productos a la venta." />}
        <form onSubmit={(event) => { event.preventDefault(); if (lines.length) setConfirming(true); }}>
          <Field label="Nombre del cliente"><input required minLength={2} maxLength={150} value={customer} onChange={(event) => setCustomer(event.target.value)} /></Field>
          <div className="sale-total"><span>Total estimado</span><strong>{money(total)}</strong></div>
          <p className="inline-note">Los precios y el stock pueden cambiar. Se aplicarán los valores vigentes al confirmar.</p>
          {mutation.error && <p className="error" role="alert">{mutation.error}</p>}<button className="btn primary full" disabled={!lines.length || mutation.busy}>Confirmar venta</button>
        </form>
      </section>
    </div>
    {confirming && <Modal title="Confirmar venta" close={() => setConfirming(false)} busy={mutation.busy}><p>Se registrará la venta para {customer.trim()} y se descontarán las existencias de {lines.length} productos.</p><div className="form-actions"><button className="btn secondary" disabled={mutation.busy} onClick={() => setConfirming(false)}>Volver</button><button className="btn primary" disabled={mutation.busy} onClick={() => void confirm()}>{mutation.busy ? 'Registrando…' : 'Registrar venta'}</button></div></Modal>}
  </>;
}
