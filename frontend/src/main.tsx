import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from './components/UI';
import { AppLayout } from './layouts/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Categories } from './pages/Categories';
import { Products } from './pages/Products';
import { Inventory } from './pages/Inventory';
import { Sales } from './pages/Sales';
import { NewSale } from './pages/NewSale';
import { SaleDetail } from './pages/SaleDetail';
import { NotFound } from './pages/NotFound';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode><BrowserRouter><ToastProvider><a className="skip-link" href="#main-content">Saltar al contenido</a><Routes><Route element={<AppLayout />}>
    <Route index element={<Dashboard />} /><Route path="categories" element={<Categories />} />
    <Route path="products" element={<Products />} /><Route path="inventory" element={<Inventory />} />
    <Route path="sales" element={<Sales />} /><Route path="sales/new" element={<NewSale />} />
    <Route path="sales/:id" element={<SaleDetail />} /><Route path="*" element={<NotFound />} />
  </Route></Routes></ToastProvider></BrowserRouter></StrictMode>,
);
