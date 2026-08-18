import { useState } from 'react';
import { Link } from 'wouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Edit3, FolderTree, Plus, Trash2 } from 'lucide-react';
import { api } from '@/services/api';

const emptyForm = { name: '', description: '', isActive: true };

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const { data: categories = [], isLoading } = useQuery({ queryKey: ['admin-categories'], queryFn: api.admin.categories });
  const save = useMutation({ mutationFn: () => editing ? api.admin.updateCategory(editing._id, form) : api.admin.createCategory(form), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-categories'] }); close(); }, onError: (e) => setError(e.message || 'Could not save category.') });
  const remove = useMutation({ mutationFn: api.admin.deleteCategory, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-categories'] }), onError: (e) => setError(e.message || 'Could not delete category.') });
  const close = () => { setEditing(null); setForm(emptyForm); setShowForm(false); setError(''); };
  const startEdit = (category) => { setEditing(category); setForm({ name: category.name, description: category.description || '', isActive: category.isActive }); setShowForm(true); setError(''); };
  const startAdd = () => { setEditing(null); setForm(emptyForm); setShowForm(true); setError(''); };

  return <div className="min-h-screen bg-background text-foreground">
    <div className="border-b border-border bg-surface"><div className="section-container flex items-center justify-between py-5"><Link href="/admin" className="btn-ghost"><ArrowLeft className="size-4" /> Dashboard</Link><div className="flex items-center gap-2"><FolderTree className="size-5" /><span className="font-semibold">Category Management</span></div></div></div>
    <div className="section-container py-8">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><div className="eyebrow">Administration</div><h1 className="display mt-1 text-4xl">Categories</h1><p className="mt-2 text-sm text-muted-foreground">Manage the categories used by marketplace products.</p></div><button type="button" className="btn-primary" onClick={startAdd}><Plus className="size-4" /> Add category</button></div>
      {error && <div className="mt-5 rounded-2xl border border-[#ee9d83]/30 bg-[#ee9d83]/10 p-4 text-sm" role="alert">{error}</div>}
      {showForm && <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="mt-6 rounded-3xl border border-border bg-surface p-6"><div className="flex items-center justify-between"><div><div className="eyebrow">{editing ? 'Update category' : 'New category'}</div><h2 className="display text-2xl">{editing ? 'Edit category' : 'Add category'}</h2></div><button type="button" className="btn-ghost" onClick={close}>Cancel</button></div><div className="mt-6 grid gap-5 md:grid-cols-2"><label className="block"><span className="mb-2 block text-xs uppercase tracking-[.1em] text-muted-foreground">Name *</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-[#e9c878]" /></label><label className="block"><span className="mb-2 block text-xs uppercase tracking-[.1em] text-muted-foreground">Status</span><select value={form.isActive ? 'active' : 'inactive'} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'active' })} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-[#e9c878]"><option value="active">Active</option><option value="inactive">Inactive</option></select></label><label className="block md:col-span-2"><span className="mb-2 block text-xs uppercase tracking-[.1em] text-muted-foreground">Description</span><textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-[#e9c878]" /></label></div><div className="mt-6 flex justify-end gap-3"><button type="button" className="btn-ghost" onClick={close}>Cancel</button><button type="submit" className="btn-primary" disabled={save.isPending}>{save.isPending ? 'Saving…' : editing ? 'Save changes' : 'Create category'}</button></div></form>}
      <div className="mt-6 grid gap-3">{isLoading ? <div className="rounded-3xl border border-border bg-surface p-8 text-muted-foreground">Loading categories…</div> : categories.map((category) => <div key={category._id} className="rounded-2xl border border-border bg-surface p-5"><div className="flex flex-wrap items-center justify-between gap-4"><div><div className="flex items-center gap-2"><h2 className="font-semibold">{category.name}</h2><span className={`rounded-full px-2 py-1 text-xs ${category.isActive ? 'bg-[#a9d0b8]/15 text-[#a9d0b8]' : 'bg-neutral-500/15 text-muted-foreground'}`}>{category.isActive ? 'Active' : 'Inactive'}</span></div>{category.description && <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>}</div><div className="flex items-center gap-2"><button type="button" className="btn-ghost" onClick={() => startEdit(category)}><Edit3 className="size-4" /> Edit</button><button type="button" className="btn-ghost text-[#ee9d83]" disabled={remove.isPending} onClick={() => window.confirm(`Delete ${category.name}?`) && remove.mutate(category._id)}><Trash2 className="size-4" /> Delete</button></div></div></div>)}{!isLoading && !categories.length && <div className="rounded-3xl border border-border bg-surface p-8 text-center text-muted-foreground">No categories yet.</div>}</div>
    </div>
  </div>;
}
