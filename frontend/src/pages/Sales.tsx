import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Badge, Empty, PageTitle, Pagination, State } from '../components/UI';
import { useResource } from '../hooks/useResource';
import { date, money } from '../utils/format';
import type { Page, Sale } from '../types';
export function Sales() {
  const [page, setPage] = useState(1);
  const resource = useResource<Page<Sale>>(`/sales?page=${page}`);
  return <>
    <PageTitle title="Ventas" description="Consulta las operaciones de tu negocio y su estado." action={<Link className="btn primary" to="/sales/new"><Icon name="plus" size={18} />Registrar venta</Link>} />
    <section className="panel"><State {...resource} retry={resource.reload}>{resource.data && <>
      {resource.data.data.length ? <div className="table-wrap"><table><thead><tr><th>Venta</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Detalle</th></tr></thead><tbody>{resource.data.data.map((sale) => <tr key={sale.id}><td><span className="reference">#{sale.id.slice(0, 8).toUpperCase()}</span><small className="table-sub">{sale._count?.items ?? 0} productos</small></td><td>{sale.customer}</td><td>{date(sale.createdAt)}</td><td className="nowrap"><strong>{money(sale.total)}</strong></td><td><Badge tone={sale.status === 'CONFIRMED' ? 'green' : 'neutral'}>{sale.status === 'CONFIRMED' ? 'Confirmada' : 'Anulada'}</Badge></td><td><Link className="text-link" to={`/sales/${sale.id}`}>Ver detalle <Icon name="arrow" size={16} /></Link></td></tr>)}</tbody></table></div> : <Empty text="Aún no registraste ventas."><Link className="btn primary" to="/sales/new">Registrar primera venta</Link></Empty>}
      <Pagination meta={resource.data.meta} change={setPage} />
    </>}</State></section>
  </>;
}
