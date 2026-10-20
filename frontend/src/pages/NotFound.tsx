import { Link } from 'react-router-dom';
export function NotFound() {
  return <section className="not-found"><p className="eyebrow">ERROR 404</p><h1>Esta página no está en el inventario.</h1><p className="muted">Revisa la dirección o vuelve al resumen general.</p><Link to="/" className="btn primary">Volver al inicio</Link></section>;
}
