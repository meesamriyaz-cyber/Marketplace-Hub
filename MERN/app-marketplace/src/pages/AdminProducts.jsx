import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Edit3, Package, Plus, Search, Trash2 } from 'lucide-react';
import { api } from '@/services/api';

const emptyForm = { name: '', category: '', tagline: '', description: '', price: '', creator: '', initials: '', rating: '', reviews: '', install: '', art: '', accent: '', features: '', badge: '', salesCount: 0 };

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const { data: products = [], isLoading } = useQuery({ queryKey: ['admin-products'], queryFn: api.admin.products });

  const visible = useMemo(() => products.filter((p) => `${p.name} ${p.category} ${p.creator}`.toLowerCase().includes(search.toLowerCase())), [products, search]);
  const closeForm = () => { setEditing(null); setForm(emptyForm); setShowForm(false); setError(''); };
  const startAdd = () => { setEditing(null); setForm(emptyForm); setError(''); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const startEdit = (product) => { setEditing(product); setForm({ ...emptyForm, ...product, features: (product.features || []).join(', ') }); setError(''); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        price: Number(form.price),
        rating: Number(form.rating),
        reviews: Number(form.reviews),
        salesCount: Number(form.salesCount || 0),
        features: String(form.features || '').split(',').map((v) => v.trim()).filter(Boolean),
      };
      return editing ? api.admin.updateProduct(editing._id, payload) : api.admin.createProduct(payload);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] }); closeForm(); },
    onError: (e) => setError(e.message || 'Could not save product.'),
  });
  const remove = useMutation({ mutationFn: api.admin.deleteProduct, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] }); }, onError: (e) => setError(e.message || 'Could not delete product.') });
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const field = (key, label, type = 'text', required = true) => <label className="block"><span className="mb-2 block text-xs font-medium uppercase tracking-[.1em] text-muted-foreground">{label}{required && <span className="ml-1 text-[#ee9d83]">*</span>}</span><input type={type} value={form[key] ?? ''} onChange={update(key)} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-[#e9c878]" required={required} /></label>;

  return <div className="min-h-screen bg-background text-foreground">
    <div className="border-b border-border bg-surface"><div className="section-container flex items-center justify-between py-5"><Link href="/admin" className="btn-ghost"><ArrowLeft className="size-4" /> Dashboard</Link><div className="flex items-center gap-2"><Package className="size-5" /><span className="font-semibold">Product Management</span></div></div></div>
    <div className="section-container py-8">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><div className="eyebrow">Administration</div><h1 className="display mt-1 text-4xl">Products</h1><p className="mt-2 text-sm text-muted-foreground">Manage the products shown in the marketplace.</p></div><button type="button" className="btn-primary" onClick={startAdd}><Plus className="size-4" /> Add product</button></div>
      {error && <div className="mt-5 rounded-2xl border border-[#ee9d83]/30 bg-[#ee9d83]/10 p-4 text-sm" role="alert">{error}</div>}
      <div className="mt-6 rounded-3xl border border-border bg-surface p-4"><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products, categories or creators…" className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 outline-none focus:border-[#e9c878]" /></div></div>
      <div className="mt-6 grid gap-4">{isLoading ? <div className="rounded-3xl border border-border bg-surface p-8 text-muted-foreground">Loading products…</div> : visible.map((product) => <div key={product._id} className="rounded-3xl border border-border bg-surface p-5"><div className="flex flex-wrap items-center justify-between gap-4"><div className="min-w-0"><div className="flex items-center gap-2"><h2 className="font-semibold">{product.name}</h2>{product.badge && <span className="rounded-full bg-[#e9c878]/15 px-2 py-1 text-xs">{product.badge}</span>}</div><p className="mt-1 text-sm text-muted-foreground">{product.category} · {product.creator}</p></div><div className="flex items-center gap-2"><span className="mr-3 font-semibold">₹{Number(product.price || 0).toLocaleString('en-IN')}</span><button type="button" className="btn-ghost" onClick={() => startEdit(product)}><Edit3 className="size-4" /> Edit</button><button type="button" className="btn-ghost text-[#ee9d83]" disabled={remove.isPending} onClick={() => window.confirm(`Delete ${product.name}?`) && remove.mutate(product._id)}><Trash2 className="size-4" /> Delete</button></div></div></div>)}{!isLoading && !visible.length && <div className="rounded-3xl border border-border bg-surface p-8 text-center text-muted-foreground">No products found.</div>}</div>
      {showForm && <form onSubmit={(event) => { event.preventDefault(); save.mutate(); }} className="mt-8 rounded-3xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between"><div><div className="eyebrow">{editing ? 'Update listing' : 'New listing'}</div><h2 className="display text-2xl">{editing ? 'Edit product' : 'New product'}</h2></div><button type="button" className="btn-ghost" onClick={closeForm}>Cancel</button></div>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2"><h3 className="text-sm font-semibold">Basic information</h3><p className="mt-1 text-xs text-muted-foreground">The customer-facing product identity and description.</p></div>
          {field('name', 'Name')}{field('category', 'Category')}{field('tagline', 'Tagline')}{field('creator', 'Creator')}
          <label className="block md:col-span-2"><span className="mb-2 block text-xs font-medium uppercase tracking-[.1em] text-muted-foreground">Description<span className="ml-1 text-[#ee9d83]">*</span></span><textarea value={form.description} onChange={update('description')} rows={4} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-[#e9c878]" required /></label>
          <div className="md:col-span-2 border-t border-border pt-5"><h3 className="text-sm font-semibold">Commercial</h3></div>
          {field('price', 'Price (₹)', 'number')}{field('badge', 'Badge', 'text', false)}{field('salesCount', 'Sales count', 'number', false)}
          <div className="md:col-span-2 border-t border-border pt-5"><h3 className="text-sm font-semibold">Marketplace presentation</h3><p className="mt-1 text-xs text-muted-foreground">These values control how the existing marketplace presents the product.</p></div>
          {field('initials', 'Initials')}{field('rating', 'Rating', 'number')}{field('reviews', 'Reviews', 'number')}{field('install', 'Install text')}{field('art', 'Art class')}{field('accent', 'Accent')}
          <label className="block md:col-span-2"><span className="mb-2 block text-xs font-medium uppercase tracking-[.1em] text-muted-foreground">Features</span><input value={form.features} onChange={update('features')} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-[#e9c878]" placeholder="Feature 1, Feature 2, Feature 3" /></label>
        </div>
        <div className="mt-6 flex justify-end gap-3"><button type="button" className="btn-ghost" onClick={closeForm}>Cancel</button><button type="submit" className="btn-primary" disabled={save.isPending}>{save.isPending ? 'Saving…' : editing ? 'Save changes' : 'Create product'}</button></div>
      </form>}
    </div>
  </div>;
}
