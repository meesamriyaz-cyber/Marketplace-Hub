import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, CircleDollarSign, Clock3, ShoppingCart, TrendingUp, XCircle } from 'lucide-react';
import { api } from '@/services/api';

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const itemCount = (order) => (order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
const statusLabel = (status) => ({ paid: 'Paid', pending: 'Pending', cancelled: 'Cancelled' }[status] || status || 'Unknown');
const statusClass = (status) => ({
  paid: 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  pending: 'border border-[#e9c878]/30 bg-[#e9c878]/10 text-foreground',
  cancelled: 'border border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300',
}[status] || 'border border-border bg-surface-raised text-muted-foreground');

export default function AdminSales() {
  const [status, setStatus] = useState('all');
  const { data, isLoading, error } = useQuery({ queryKey: ['admin-sales'], queryFn: api.admin.sales });
  const allOrders = data?.orders || [];
  const orders = useMemo(() => allOrders.filter((order) => status === 'all' || order.status === status), [allOrders, status]);
  const counts = useMemo(() => allOrders.reduce((result, order) => { result[order.status] = (result[order.status] || 0) + 1; return result; }, {}), [allOrders]);
  const pendingValue = useMemo(() => allOrders.filter((order) => order.status === 'pending').reduce((sum, order) => sum + Number(order.total || 0), 0), [allOrders]);
  const cancelledValue = useMemo(() => allOrders.filter((order) => order.status === 'cancelled').reduce((sum, order) => sum + Number(order.total || 0), 0), [allOrders]);
  const average = Number(data?.paidOrders || 0) ? Number(data?.totalRevenue || 0) / Number(data.paidOrders) : 0;

  return <div>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><div className="eyebrow">Administration</div><h1 className="display mt-1 text-4xl sm:text-5xl">Sales</h1><p className="mt-2 text-sm text-muted-foreground">Review all orders while keeping paid revenue separate from outstanding and cancelled orders.</p></div>
      <div className="flex items-center gap-2"><CalendarDays className="size-4 text-muted-foreground" /><select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field"><option value="all">All orders</option><option value="paid">Paid</option><option value="pending">Pending</option><option value="cancelled">Cancelled</option></select></div>
    </div>
    {error && <div className="mt-6 rounded-2xl border border-[#ee9d83]/30 bg-[#ee9d83]/10 p-4 text-sm">{error.message}</div>}
    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {[
        ['Revenue', data?.totalRevenue, CircleDollarSign, true],
        ['Paid orders', data?.paidOrders, ShoppingCart, false],
        ['Pending', counts.pending || 0, Clock3, false],
        ['Pending value', pendingValue, Clock3, true],
        ['Cancelled', counts.cancelled || 0, XCircle, false],
      ].map(([label, value, Icon, isMoney]) => <div key={label} className="rounded-3xl border border-border bg-surface p-5"><Icon className="size-5 text-[#e9c878]" /><div className="mt-4 text-xs uppercase tracking-[.12em] text-muted-foreground">{label}</div><div className="display mt-2 text-2xl">{isLoading ? '—' : isMoney ? money(value) : Number(value || 0).toLocaleString('en-IN')}</div></div>)}
    </div>
    <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground"><span>Paid revenue only includes confirmed payments.</span><span>•</span><span>Average paid order: <strong className="text-foreground">{isLoading ? '—' : money(average)}</strong></span><span>•</span><span>Cancelled value: <strong className="text-foreground">{isLoading ? '—' : money(cancelledValue)}</strong></span></div>
    <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-surface">
      <div className="border-b border-border px-6 py-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="display text-2xl">Transactions</h2><p className="mt-1 text-xs text-muted-foreground">{orders.length} order{orders.length === 1 ? '' : 's'} shown</p></div><div className="flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-emerald-700 dark:text-emerald-300">Paid {counts.paid || 0}</span><span className="rounded-full bg-[#e9c878]/10 px-3 py-1.5">Pending {counts.pending || 0}</span><span className="rounded-full bg-red-500/10 px-3 py-1.5 text-red-700 dark:text-red-300">Cancelled {counts.cancelled || 0}</span></div></div></div>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-border text-xs uppercase tracking-[.1em] text-muted-foreground"><tr><th className="px-5 py-4">Order</th><th className="px-5 py-4">Customer</th><th className="px-5 py-4">Date</th><th className="px-5 py-4">Items</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Payment</th><th className="px-5 py-4 text-right">Total</th></tr></thead><tbody>{isLoading ? <tr><td colSpan="7" className="px-5 py-8 text-muted-foreground">Loading sales…</td></tr> : orders.map((order) => <tr key={order._id} className="border-b border-border last:border-0"><td className="px-5 py-4 font-medium">{order._id?.slice(-8) || '—'}</td><td className="px-5 py-4">{order.customerEmail || order.userEmail || '—'}</td><td className="px-5 py-4 text-muted-foreground">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : '—'}</td><td className="px-5 py-4">{itemCount(order)}</td><td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(order.status)}`}>{statusLabel(order.status)}</span></td><td className="px-5 py-4 text-xs text-muted-foreground">{order.payment?.provider ? <>{order.payment.provider}{order.payment.paidAt ? ` · ${new Date(order.payment.paidAt).toLocaleDateString('en-IN')}` : ''}</> : 'Not paid'}</td><td className="px-5 py-4 text-right font-medium">{money(order.total)}</td></tr>)}{!isLoading && !orders.length && <tr><td colSpan="7" className="px-5 py-10 text-center text-muted-foreground">No orders found for this filter.</td></tr>}</tbody></table></div>
    </div>
  </div>;
}
