import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, CircleDollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import { api } from '@/services/api';

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

export default function AdminSales() {
  const [status, setStatus] = useState('paid');
  const { data, isLoading, error } = useQuery({ queryKey: ['admin-sales'], queryFn: api.admin.sales });
  const orders = useMemo(() => (data?.orders || []).filter((order) => status === 'all' || order.status === status), [data, status]);
  const average = orders.length ? Number(data?.totalRevenue || 0) / orders.length : 0;

  return <div>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><div className="eyebrow">Administration</div><h1 className="display mt-1 text-4xl sm:text-5xl">Sales</h1><p className="mt-2 text-sm text-muted-foreground">Review paid orders, revenue and transaction activity.</p></div>
      <div className="flex items-center gap-2"><CalendarDays className="size-4 text-muted-foreground" /><select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field"><option value="paid">Paid orders</option><option value="all">All returned orders</option></select></div>
    </div>
    {error && <div className="mt-6 rounded-2xl border border-[#ee9d83]/30 bg-[#ee9d83]/10 p-4 text-sm">{error.message}</div>}
    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[['Revenue', data?.totalRevenue, CircleDollarSign, true], ['Paid orders', data?.paidOrders, ShoppingCart], ['Items sold', data?.totalItems, TrendingUp], ['Average order', average, CircleDollarSign, true]].map(([label, value, Icon, isMoney]) => <div key={label} className="rounded-3xl border border-border bg-surface p-6"><Icon className="size-5 text-[#e9c878]" /><div className="mt-5 text-xs uppercase tracking-[.12em] text-muted-foreground">{label}</div><div className="display mt-2 text-3xl">{isLoading ? '—' : isMoney ? money(value) : Number(value || 0).toLocaleString('en-IN')}</div></div>)}
    </div>
    <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-surface">
      <div className="border-b border-border px-6 py-5"><h2 className="display text-2xl">Transactions</h2></div>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-border text-xs uppercase tracking-[.1em] text-muted-foreground"><tr><th className="px-5 py-4">Order</th><th className="px-5 py-4">Customer</th><th className="px-5 py-4">Date</th><th className="px-5 py-4">Items</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Total</th></tr></thead><tbody>{isLoading ? <tr><td colSpan="6" className="px-5 py-8 text-muted-foreground">Loading sales…</td></tr> : orders.map((order) => <tr key={order._id} className="border-b border-border last:border-0"><td className="px-5 py-4 font-medium">{order._id?.slice(-8) || '—'}</td><td className="px-5 py-4">{order.customerEmail || order.userEmail || '—'}</td><td className="px-5 py-4 text-muted-foreground">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : '—'}</td><td className="px-5 py-4">{(order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0)}</td><td className="px-5 py-4"><span className={order.status === 'paid' ? 'text-emerald-600' : 'text-muted-foreground'}>{order.status || '—'}</span></td><td className="px-5 py-4 text-right font-medium">{money(order.total)}</td></tr>)}{!isLoading && !orders.length && <tr><td colSpan="6" className="px-5 py-10 text-center text-muted-foreground">No sales found.</td></tr>}</tbody></table></div>
    </div>
  </div>;
}
