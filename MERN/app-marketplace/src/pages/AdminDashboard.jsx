import { useQuery } from '@tanstack/react-query';
import { BarChart3, LayoutDashboard, Package, ShoppingCart, Users } from 'lucide-react';
import { api } from '@/services/api';

const cards = [['products', 'Products', Package], ['users', 'Users', Users], ['orders', 'Orders', ShoppingCart], ['revenue', 'Revenue', BarChart3]];

export default function AdminDashboard() {
  const { data, isLoading, error } = useQuery({ queryKey: ['admin-dashboard'], queryFn: api.admin.dashboard });
  const stats = data?.stats || {};
  return <div>
    <div className="flex items-center gap-3"><LayoutDashboard className="size-5 text-[#e9c878]" /><div><div className="eyebrow">Administration</div><h1 className="display mt-1 text-4xl sm:text-5xl">Dashboard</h1></div></div>
    {error && <div className="mt-6 rounded-2xl border border-[#ee9d83]/30 bg-[#ee9d83]/10 p-4 text-sm">{error.message}</div>}
    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([key, label, Icon]) => <div key={key} className="rounded-3xl border border-border bg-surface p-6"><Icon className="size-5 text-[#e9c878]" /><div className="mt-6 text-xs uppercase tracking-[.12em] text-muted-foreground">{label}</div><div className="display mt-2 text-4xl">{isLoading ? '—' : key === 'revenue' ? `₹${Number(stats.revenue || 0).toLocaleString('en-IN')}` : Number(stats[key] || 0).toLocaleString('en-IN')}</div></div>)}</div>
    <div className="mt-6 rounded-3xl border border-border bg-surface p-6"><h2 className="display text-2xl">Recent orders</h2><div className="mt-5 space-y-1">{(data?.recentOrders || []).map(order => <div key={order._id} className="flex items-center justify-between gap-4 border-b border-border py-4 text-sm"><span className="truncate">{order.customerEmail}</span><span>₹{Number(order.total || 0).toLocaleString('en-IN')}</span><span className="text-muted-foreground">{order.status}</span></div>)}{!isLoading && !data?.recentOrders?.length && <p className="py-8 text-sm text-muted-foreground">No orders yet.</p>}</div></div>
  </div>;
}
