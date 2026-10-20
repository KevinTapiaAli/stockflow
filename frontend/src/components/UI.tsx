import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Icon } from './Icon';
import type { Page } from '../types';

export function PageTitle({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="page-title"><div><p className="eyebrow">TU NEGOCIO, EN ORDEN</p><h1>{title}</h1><p className="muted">{description}</p></div>{action}</div>;
}
export function State({ loading, error, retry, children }: { loading: boolean; error: string; retry: () => void; children: ReactNode }) {
  if (loading) return <div className="state" role="status"><span className="spinner" />Cargando información…</div>;
  if (error) return <div className="state error" role="alert"><p>{error}</p><button className="btn secondary" onClick={retry}>Reintentar</button></div>;
  return <>{children}</>;
}
export function Empty({ text = 'Todavía no hay registros.', children }: { text?: string; children?: ReactNode }) {
  return <div className="state"><span className="empty-icon"><Icon name="box" size={28} /></span><h3>{text}</h3>{children}</div>;
}
export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}
export function Modal({ title, children, close, busy = false }: { title: string; children: ReactNode; close: () => void; busy?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => { dialog?.close(); previous?.focus(); };
  }, []);
  return <dialog ref={ref} aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); if (!busy) close(); }}>
    <div className="modal-title"><h2 id={titleId}>{title}</h2><button className="icon-btn" type="button" aria-label="Cerrar" disabled={busy} onClick={close}><Icon name="close" /></button></div>
    {children}
  </dialog>;
}
export function FormActions({ busy, close, label = 'Guardar cambios' }: { busy: boolean; close: () => void; label?: string }) {
  return <div className="form-actions"><button type="button" className="btn secondary" onClick={close} disabled={busy}>Cancelar</button><button type="submit" className="btn primary" disabled={busy}>{busy ? 'Guardando…' : label}</button></div>;
}
export function Pagination({ meta, change }: { meta: Page<unknown>['meta']; change: (page: number) => void }) {
  return <div className="pagination"><span>{meta.total} registros · Página {meta.page} de {Math.max(1, meta.totalPages)}</span><div>
    <button className="btn secondary small" disabled={meta.page <= 1} onClick={() => change(meta.page - 1)}>Anterior</button>
    <button className="btn secondary small" disabled={meta.page >= meta.totalPages} onClick={() => change(meta.page + 1)}>Siguiente</button>
  </div></div>;
}
export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'green' | 'amber' | 'neutral' | 'red' }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

type Notify = (message: string, kind?: 'success' | 'error') => void;
const ToastContext = createContext<Notify>(() => undefined);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<{ id: number; message: string; kind: string }[]>([]);
  const counter = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const notify: Notify = (message, kind = 'success') => {
    const id = ++counter.current;
    setToasts((values) => [...values, { id, message, kind }]);
    timers.current.push(setTimeout(() => setToasts((values) => values.filter((value) => value.id !== id)), 7000));
  };
  return <ToastContext.Provider value={notify}>{children}<div className="toasts" aria-live="polite">
    {toasts.map((toast) => <div key={toast.id} className={`toast ${toast.kind}`}><span>{toast.message}</span><button className="icon-btn" aria-label="Cerrar notificación" onClick={() => setToasts((values) => values.filter((value) => value.id !== toast.id))}><Icon name="close" size={16} /></button></div>)}
  </div></ToastContext.Provider>;
}
export function useMutation() {
  const notify = useContext(ToastContext);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const running = useRef(false);
  async function run(work: () => Promise<unknown>, success: string, done: () => void) {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setError('');
    try { await work(); notify(success); done(); }
    catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo completar la operación.';
      setError(message);
      notify(message, 'error');
    }
    finally { running.current = false; setBusy(false); }
  }
  return { busy, error, run };
}
