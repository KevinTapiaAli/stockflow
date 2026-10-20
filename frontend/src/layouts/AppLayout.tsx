import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Icon, type IconName } from '../components/Icon';
const navigation: { path: string; name: string; icon: IconName }[] = [
  { path: '/', name: 'Resumen general', icon: 'grid' },
  { path: '/products', name: 'Productos', icon: 'box' },
  { path: '/categories', name: 'Categorías', icon: 'layers' },
  { path: '/inventory', name: 'Movimientos', icon: 'arrows' },
  { path: '/sales', name: 'Ventas', icon: 'cart' },
];
export function AppLayout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const current = navigation.find((item) => item.path === '/' ? pathname === '/' : pathname.startsWith(item.path));
  return <div className="app-shell">
    {open && <button className="sidebar-backdrop" aria-label="Cerrar navegación" onClick={() => setOpen(false)} />}
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <NavLink to="/" className="brand" onClick={() => setOpen(false)}><span className="brand-icon"><Icon name="box" size={25} /></span>stockflow<span className="brand-dot">.</span></NavLink>
      <div className="workspace"><span className="workspace-avatar">SF</span><div><strong>Mi negocio</strong><small>Gestión de inventario</small></div><BadgeLocal /></div>
      <p className="nav-caption">ESPACIO DE TRABAJO</p>
      <nav aria-label="Navegación principal">{navigation.map((item) => <NavLink key={item.path} to={item.path} end={item.path === '/'} onClick={() => setOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><Icon name={item.icon} /><span>{item.name}</span></NavLink>)}</nav>
      <div className="sidebar-note"><span className="note-dot" /><h3>Todo bajo control</h3><p>Productos, existencias y ventas en un solo lugar.</p><NavLink to="/inventory" onClick={() => setOpen(false)}>Consultar movimientos <Icon name="arrow" size={16} /></NavLink></div>
      <div className="sidebar-footer"><span className="user-avatar">KT</span><div><strong>Kevin Tapia Ali</strong><small>Proyecto académico · UCB</small></div></div>
    </aside>
    <div className="main-shell">
      <header className="header"><div className="header-left"><button className="icon-btn mobile-menu" aria-label="Abrir navegación" aria-expanded={open} onClick={() => setOpen(true)}><Icon name="menu" /></button><span className="muted">Mi negocio</span><span className="slash">/</span><strong>{current?.name ?? 'Página'}</strong></div><div className="header-right"><span className="local-label">Entorno local</span><span className="user-avatar light">KT</span></div></header>
      <main id="main-content"><Outlet /></main>
      <footer className="main-footer"><span>StockFlow · Tecnologías Web II</span><span>Segundo parcial / 2026</span></footer>
    </div>
  </div>;
}
function BadgeLocal() { return <span className="workspace-tag">LOCAL</span>; }
