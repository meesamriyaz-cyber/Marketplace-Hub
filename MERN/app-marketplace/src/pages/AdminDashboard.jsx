import { useQuery } from '@tanstack/react-query';
import { BarChart3, LayoutDashboard, Package, ShoppingCart, Users } from 'lucide-react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const cards = [
  ['products', 'Products', Package],
  ['users', 'Users', Users],
  ['orders', 'Orders', ShoppingCart],
  ['revenue', 'Revenue', BarChart3],
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({ queryKey: ['admin-dashboard'], queryFn: api.admin.dashboard });
  const stats = data?.stats || {};

  return <div className="min-h-screen bg-background text-foreground">
    <div className="border-b border-border bg-surface"><div className="section-container flex items-center justify-between py-5"><div className="flex items-center gap-3"><img src="/logo.png" alt="Cutting Edge Apps" className="size-10 object-contain" /><div><div className="font-semibold">Cutting Edge Apps</div><div className="text-xs text-muted-foreground">Admin Console</div></div></div><div className="text-right"><div className="text-sm font-medium">{user?.name}</div><div className="text-xs text-muted-foreground">{user?.role}</div></div></div></div>
    <div className="section-container py-10"><div className="flex items-center gap-3"><LayoutDashboard className="size-5 text-[#e9c878]" /><div><div className="eyebrow">Administration</div><h1 className="display mt-1 text-4xl sm:text-5xl">Dashboard</h1></div></div>
      {error && <div className="mt-6 rounded-2xl border border-[#ee9d83]/30 bg-[#ee9d83]/10 p-4 text-sm">{error.message}</div>}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([key, label, Icon]) => <div key={key} className="rounded-3xl border border-border bg-surface p-6"><Icon className="size-5 text-[#e9c878]" /><div className="mt-6 text-xs uppercase tracking-[.12em] text-muted-foreground">{label}</div><div className="display mt-2 text-4xl">{isLoading ? '—' : key === 'revenue' ? `₹${Number(stats.revenue || 0).toLocaleString('en-IN')}` : Number(stats[key] || 0).toLocaleString('en-IN')}</div></div>)}</div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_.6fr]"><div className="rounded-3xl border border-border bg-surface p-6"><h2 className="display text-2xl">Recent orders</h2><div className="mt-5 space-y-1">{(data?.recentOrders || []).map((order) => <div key={order._id} className="flex items-center justify-between gap-4 border-b border-border py-4 text-sm"><span className="truncate">{order.customerEmail}</span><span>₹{Number(order.total || 0).toLocaleString('en-IN')}</span><span className="text-muted-foreground">{order.status}</span></div>)}{!isLoading && !data?.recentOrders?.length && <p className="py-8 text-sm text-muted-foreground">No orders yet.</p>}</div></div><div className="rounded-3xl border border-border bg-surface p-6"><h2 className="display text-2xl">Quick actions</h2><div className="mt-5 space-y-3"><button className="btn-primary w-full justify-center">Manage products</button><button className="btn-ghost w-full justify-center">View users</button><button className="btn-ghost w-full justify-center">Sales reports</button></div></div></div>
    </div>
  </div>;
}
