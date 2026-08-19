import { useMemo, useState } from 'react';
import { BarChart3, CalendarDays, CircleDollarSign, Download, FileSpreadsheet, Package, ShoppingCart, XCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const dateValue = (d) => d.toISOString().slice(0, 10);
const escapeCsv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;

export default function AdminReports() {
  const today = new Date();
  const defaultFrom = new Date(today); defaultFrom.setDate(defaultFrom.getDate() - 29);
  const [from, setFrom] = useState(dateValue(defaultFrom));
  const [to, setTo] = useState(dateValue(today));
  const [granularity, setGranularity] = useState('daily');

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-reports', from, to, granularity],
    queryFn: () => api.admin.reports({ from, to, granularity }),
  });

  const summary = data?.summary || { revenue: 0, orders: 0, items: 0, averageOrderValue: 0 };
  const statuses = data?.statuses || { paid: { count: 0, value: 0 }, pending: { count: 0, value: 0 }, cancelled: { count: 0, value: 0 } };
  const trend = data?.trend || [];
  const topProducts = data?.topProducts || [];
  const maxRevenue = Math.max(...trend.map((x) => Number(x.revenue || 0)), 1);

  const exportRows = useMemo(() => {
    const rows = [
      ['Report', 'Marketplace Sales Report'],
      ['From', from], ['To', to], ['Granularity', granularity], [],
      ['Summary', 'Value'], ['Revenue', summary.revenue], ['Paid Orders', summary.orders], ['Items Sold', summary.items], ['Average Order Value', summary.averageOrderValue], [],
      ['Status', 'Orders', 'Value'],
      ['Paid', statuses.paid.count, statuses.paid.value], ['Pending', statuses.pending.count, statuses.pending.value], ['Cancelled', statuses.cancelled.count, statuses.cancelled.value], [],
      ['Top Products', 'Quantity', 'Revenue'],
      ...topProducts.map((p) => [p.name || p._id, p.quantity, p.revenue]), [],
      [granularity === 'monthly' ? 'Month' : 'Date', 'Paid Orders', 'Revenue', 'Items Sold'],
      ...trend.map((x) => [x._id, x.orders, x.revenue, x.items]),
    ];
    return rows;
  }, [from, to, granularity, summary, statuses, topProducts, trend]);

  const downloadCsv = () => {
    const csv = '\uFEFF' + exportRows.map((row) => row.map(escapeCsv).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = `sales-report-${from}-to-${to}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const downloadExcel = () => {
    // Spreadsheet-compatible HTML opens directly in Excel without adding a dependency.
    const table = exportRows.map((row) => `<tr>${row.map((cell) => `<td>${String(cell ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</td>`).join('')}</tr>`).join('');
    const html = `<html><head><meta charset="utf-8"></head><body><table>${table}</table></body></html>`;
    const blob = new Blob([`\uFEFF${html}`], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = `sales-report-${from}-to-${to}.xls`; a.click(); URL.revokeObjectURL(url);
  };

  const applyPreset = (days) => { const end = new Date(); const start = new Date(end); start.setDate(start.getDate() - days + 1); setFrom(dateValue(start)); setTo(dateValue(end)); setGranularity('daily'); };

  return <div>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-center gap-3"><BarChart3 className="size-5 text-[#e9c878]" /><div><div className="eyebrow">Administration</div><h1 className="display mt-1 text-4xl sm:text-5xl">Reports</h1><p className="mt-2 text-sm text-muted-foreground">Sales performance and order activity from the existing order data.</p></div></div>
      <div className="flex flex-wrap gap-2"><button type="button" className="btn-ghost" onClick={() => applyPreset(7)}>7 days</button><button type="button" className="btn-ghost" onClick={() => applyPreset(30)}>30 days</button><button type="button" className="btn-ghost" onClick={() => applyPreset(90)}>90 days</button><button type="button" className="btn-ghost" onClick={downloadCsv}><Download className="size-4" />CSV</button><button type="button" className="btn-ghost" onClick={downloadExcel}><FileSpreadsheet className="size-4" />Excel</button></div>
    </div>

    <div className="mt-5 flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface p-4"><div><label className="mb-1 block text-xs font-medium text-muted-foreground">From</label><div className="relative"><CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className="input-field pl-9" /></div></div><div><label className="mb-1 block text-xs font-medium text-muted-foreground">To</label><div className="relative"><CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className="input-field pl-9" /></div></div><div><label className="mb-1 block text-xs font-medium text-muted-foreground">Grouping</label><select value={granularity} onChange={(e) => setGranularity(e.target.value)} className="input-field"><option value="daily">Daily</option><option value="monthly">Monthly</option></select></div><div className="pb-2 text-xs text-muted-foreground">{from} → {to}</div></div>

    {error && <div className="mt-6 rounded-2xl border border-[#ee9d83]/30 bg-[#ee9d83]/10 p-4 text-sm">{error.message}</div>}
    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[['Revenue', summary.revenue, CircleDollarSign], ['Paid orders', summary.orders, ShoppingCart], ['Items sold', summary.items, Package], ['Average order value', summary.averageOrderValue, CircleDollarSign]].map(([label, value, Icon]) => <div key={label} className="rounded-3xl border border-border bg-surface p-5"><Icon className="size-5 text-[#e9c878]" /><div className="mt-4 text-xs uppercase tracking-[.12em] text-muted-foreground">{label}</div><div className="display mt-2 text-2xl">{isLoading ? '—' : label === 'Revenue' || label === 'Average order value' ? money(value) : Number(value || 0).toLocaleString('en-IN')}</div></div>)}</div>

    <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
      <section className="rounded-3xl border border-border bg-surface p-6"><h2 className="display text-2xl">Sales trend</h2><p className="mt-1 text-xs text-muted-foreground">Revenue from paid orders · {granularity}</p>{isLoading ? <p className="mt-6 text-sm text-muted-foreground">Loading reports…</p> : trend.length ? <div className="mt-6 space-y-3">{trend.map((item) => <div key={item._id}><div className="mb-1 flex justify-between gap-3 text-xs"><span>{item._id}</span><span>{money(item.revenue)} · {item.orders} orders</span></div><div className="h-2 rounded-full bg-surface-raised"><div className="h-2 rounded-full bg-[#e9c878]" style={{ width: `${Number(item.revenue || 0) ? Math.max((Number(item.revenue || 0) / maxRevenue) * 100, 4) : 0}%` }} /></div></div>)}</div> : <p className="mt-6 py-8 text-sm text-muted-foreground">No paid sales in this range.</p>}</section>
      <section className="rounded-3xl border border-border bg-surface p-6"><h2 className="display text-2xl">Order status</h2><p className="mt-1 text-xs text-muted-foreground">All orders in selected range</p><div className="mt-6 space-y-4">{[['Paid', statuses.paid, 'text-emerald-700 dark:text-emerald-300'], ['Pending', statuses.pending, 'text-[#8a6b18] dark:text-[#e9c878]'], ['Cancelled', statuses.cancelled, 'text-red-700 dark:text-red-300']].map(([name, item, cls]) => <div key={name} className="flex items-center justify-between rounded-2xl border border-border p-4"><div><div className={`font-semibold ${cls}`}>{name}</div><div className="mt-1 text-xs text-muted-foreground">{item.count} orders</div></div><div className="text-right text-sm font-medium">{money(item.value)}</div></div>)}</div></section>
    </div>

    <section className="mt-6 rounded-3xl border border-border bg-surface p-6"><div className="flex items-end justify-between gap-4"><div><h2 className="display text-2xl">Top-selling products</h2><p className="mt-1 text-xs text-muted-foreground">Paid orders only, ranked by revenue</p></div></div>{isLoading ? <p className="mt-6 text-sm text-muted-foreground">Loading products…</p> : topProducts.length ? <div className="mt-5 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-border text-xs uppercase tracking-[.1em] text-muted-foreground"><tr><th className="px-3 py-3">Product</th><th className="px-3 py-3 text-right">Qty sold</th><th className="px-3 py-3 text-right">Revenue</th></tr></thead><tbody>{topProducts.map((item, index) => <tr key={item._id} className="border-b border-border last:border-0"><td className="px-3 py-3"><span className="mr-2 text-xs text-muted-foreground">#{index + 1}</span>{item.name || item._id}</td><td className="px-3 py-3 text-right">{Number(item.quantity || 0).toLocaleString('en-IN')}</td><td className="px-3 py-3 text-right font-medium">{money(item.revenue)}</td></tr>)}</tbody></table></div> : <p className="py-8 text-sm text-muted-foreground">No paid sales in this range.</p>}</section>

    <section className="mt-6 rounded-3xl border border-border bg-surface p-6"><h2 className="display text-2xl">Report detail</h2><div className="mt-5 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-border text-xs uppercase tracking-[.1em] text-muted-foreground"><tr><th className="px-3 py-3">{granularity === 'monthly' ? 'Month' : 'Date'}</th><th className="px-3 py-3">Paid orders</th><th className="px-3 py-3">Items</th><th className="px-3 py-3 text-right">Revenue</th></tr></thead><tbody>{trend.map((item) => <tr key={item._id} className="border-b border-border last:border-0"><td className="px-3 py-3">{item._id}</td><td className="px-3 py-3">{item.orders}</td><td className="px-3 py-3">{item.items}</td><td className="px-3 py-3 text-right font-medium">{money(item.revenue)}</td></tr>)}{!isLoading && !trend.length && <tr><td colSpan="4" className="px-3 py-8 text-center text-muted-foreground">No paid sales in this range.</td></tr>}</tbody></table></div></section>
    <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1"><CircleDollarSign className="size-3" /> Revenue counts paid orders only</span><span className="inline-flex items-center gap-1"><XCircle className="size-3" /> Pending and cancelled orders never contribute to revenue</span></div>
  </div>;
}
