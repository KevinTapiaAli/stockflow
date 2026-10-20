import { useState, type FormEvent } from 'react';
import { Icon } from '../components/Icon';
import { Empty, Field, FormActions, Modal, PageTitle, State, useMutation } from '../components/UI';
import { useResource } from '../hooks/useResource';
import { api, json } from '../services/api';
import type { Category } from '../types';
export function Categories() {
  const resource = useResource<Category[]>('/categories');
  const [editing, setEditing] = useState<Category | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const mutation = useMutation();
  return <>
    <PageTitle title="Categorías" description="Organiza tu catálogo para encontrar todo más fácilmente." action={<button className="btn primary" onClick={() => setEditing('new')}><Icon name="plus" size={18} />Nueva categoría</button>} />
    <section className="panel"><State {...resource} retry={resource.reload}>
      {resource.data?.length ? <div className="table-wrap"><table><thead><tr><th>Categoría</th><th>Descripción</th><th>Productos</th><th>Acciones</th></tr></thead><tbody>{resource.data.map((category) => <tr key={category.id}><td><strong>{category.name}</strong></td><td>{category.description || '—'}</td><td>{category._count?.products ?? 0}</td><td><div className="row-actions"><button className="text-btn" onClick={() => setEditing(category)}>Editar</button><button className="text-btn danger-text" onClick={() => setDeleting(category)}>Eliminar</button></div></td></tr>)}</tbody></table></div> : <Empty text="Crea tu primera categoría." />}
    </State></section>
    {editing && <CategoryForm category={editing === 'new' ? undefined : editing} close={() => setEditing(null)} saved={() => { setEditing(null); resource.reload(); }} />}
    {deleting && <Modal title="Eliminar categoría" close={() => setDeleting(null)} busy={mutation.busy}><p>¿Eliminar «{deleting.name}»? Solo es posible si no contiene productos.</p>{mutation.error && <p className="error" role="alert">{mutation.error}</p>}<div className="form-actions"><button className="btn secondary" disabled={mutation.busy} onClick={() => setDeleting(null)}>Cancelar</button><button className="btn danger" disabled={mutation.busy} onClick={() => void mutation.run(() => api(`/categories/${deleting.id}`, { method: 'DELETE' }), 'Categoría eliminada.', () => { setDeleting(null); resource.reload(); })}>Eliminar categoría</button></div></Modal>}
  </>;
}
function CategoryForm({ category, close, saved }: { category?: Category; close: () => void; saved: () => void }) {
  const [name, setName] = useState(category?.name ?? '');
  const [description, setDescription] = useState(category?.description ?? '');
  const mutation = useMutation();
  function submit(event: FormEvent) {
    event.preventDefault();
    void mutation.run(() => api(`/categories${category ? `/${category.id}` : ''}`, json(category ? 'PATCH' : 'POST', { name: name.trim(), description: description.trim() })), 'Categoría guardada.', saved);
  }
  return <Modal title={category ? 'Editar categoría' : 'Nueva categoría'} close={close} busy={mutation.busy}><form onSubmit={submit}><fieldset disabled={mutation.busy}>
    <Field label="Nombre"><input required minLength={2} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} autoFocus /></Field>
    <Field label="Descripción"><textarea maxLength={500} value={description} onChange={(event) => setDescription(event.target.value)} rows={3} /></Field>
  </fieldset>{mutation.error && <p className="error" role="alert">{mutation.error}</p>}<FormActions busy={mutation.busy} close={close} /></form></Modal>;
}
