import { Link } from 'react-router-dom';
import { useResource } from '../hooks/useResource';
import { Icon, type IconName } from '../components/Icon';
import { Badge, Empty, PageTitle, State } from '../components/UI';
import { date, money, movementLabel } from '../utils/format';
import type { Summary } from '../types';
export function Dashboard() {
  const resource = useResource<Summary>('/dashboard/summary');
  const data = resource.data;
  const metrics: { name: string; value: string | number; note: string; icon: IconName; tone?: string }[] = data ? [
    { name: 'Productos registrados', value: data.products, note: `${data.categories} categorías en el catálogo`, icon: 'box' },
    { name: 'Productos con bajo stock', value: data.lowStock, note: 'En el mínimo o por debajo', icon: 'layers', tone: 'warning' },
    { name: 'Ventas registradas', value: data.sales, note: `${data.confirmedSales} ventas confirmadas`, icon: 'cart' },
    { name: 'Monto total vendido', value: money(data.totalRevenue), note: 'Ventas confirmadas · BOB', icon: 'arrows', tone: 'featured' },
  ] : [];
  return <>
    <PageTitle title="Resumen general" description="Una mirada clara a lo que pasa en tu negocio." action={<Link className="btn primary" to="/sales/new"><Icon name="plus" size={18} />Registrar venta</Link>} />
    <State {...resource} retry={resource.reload}>
      {data && <>
        <div className="metrics">{metrics.map((metric) => <section className={`metric ${metric.tone ?? ''}`} key={metric.name}><div className="metric-top"><span>{metric.name}</span><span className="metric-icon"><Icon name={metric.icon} /></span></div><strong className="metric-value">{metric.value}</strong><small>{metric.note}</small></section>)}</div>
        <div className="overview-banner"><div><span className="eyebrow">INVENTARIO CON TRAZABILIDAD</span><h2>Cada movimiento cuenta.</h2><p>Registra entradas y salidas para mantener tus existencias al día.</p><Link className="text-link" to="/inventory">Gestionar inventario <Icon name="arrow" size={17} /></Link></div><div className="box-illustration" aria-hidden="true"><Icon name="box" size={106} /><span className="floating-tag"><Icon name="check" size={16} /> StockFlow</span></div></div>
        <div className="dashboard-columns">
          <section className="panel"><div className="panel-heading"><div><h2>Movimientos recientes</h2><p>El historial de tu inventario</p></div><Link className="text-link" to="/inventory">Ver todos <Icon name="arrow" size={16} /></Link></div>
            {data.recentMovements.length ? <div className="movement-list">{data.recentMovements.map((movement) => <div className="movement-row" key={movement.id}><span className={`movement-icon ${['IN', 'CANCELLATION'].includes(movement.type) ? 'positive' : ''}`}><Icon name="arrows" size={18} /></span><div className="grow"><strong>{movement.product.name}</strong><small>{movementLabel[movement.type]} · {date(movement.createdAt)}</small></div><strong className={['IN', 'CANCELLATION'].includes(movement.type) ? 'positive-text' : ''}>{['IN', 'CANCELLATION'].includes(movement.type) ? '+' : '−'}{movement.quantity}</strong></div>)}</div> : <Empty text="Sin movimientos todavía." />}
          </section>
          <section className="panel"><div className="panel-heading"><div><h2>Necesitan reposición</h2><p>Hasta 6 productos con menor stock</p></div><Badge tone="amber">{data.lowStock}</Badge></div>
            {data.lowStockProducts.length ? <div className="low-stock-list">{data.lowStockProducts.map((product) => <Link key={product.id} className="low-stock-row" to={`/products?search=${encodeURIComponent(product.sku)}`}><span className="product-initial">{product.name.slice(0, 2).toUpperCase()}</span><div className="grow"><strong>{product.name}</strong><small>Mínimo: {product.minStock} unidades</small></div><Badge tone="amber">{product.stock} uds.</Badge></Link>)}</div> : <Empty text="Tu stock está al día." />}
          </section>
        </div>
      </>}
    </State>
  </>;
}
