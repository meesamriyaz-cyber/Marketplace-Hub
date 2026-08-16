import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { PackageOpen, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Orders() {
  const { isAuthenticated } = useAuth();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: api.orders.list,
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="text-center">
          <PackageOpen className="mx-auto size-12 text-[#a9d0b8]" />
           <h2 className="display mt-6 text-4xl text-foreground">Sign in to view orders</h2>
           <p className="mt-3 text-sm text-muted-foreground">Your order history will appear here.</p>
          <Link to="/login" className="btn-primary-sm mt-6">Sign in <ArrowRight className="size-3.5" /></Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-[#ee9d83] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="section-container py-12">
      <div className="mb-10">
        <div className="eyebrow text-[#a9d0b8]">Your history</div>
         <h1 className="display mt-3 text-5xl leading-none text-foreground sm:text-6xl">Your orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="flex min-h-[310px] flex-col items-center justify-center rounded-[24px] border border-dashed border-neutral-800 bg-surface/50 px-6 text-center">
          <PackageOpen className="size-8 text-[#a9d0b8]" />
           <h3 className="display mt-5 text-4xl text-foreground">Nothing here yet.</h3>
           <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">Once you place an order, it will show up right here.</p>
          <Link to="/" className="btn-ghost mt-6">Browse the shelf</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card-surface p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                 <div className="mono text-xs text-muted-foreground">Order #{order._id.slice(-6).toUpperCase()}</div>
                 <div className="mt-1 text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[.12em] ${order.status === 'paid' ? 'bg-[#a9d0b8]/10 text-[#a9d0b8]' : 'bg-[#f1c977]/10 text-[#f1c977]'}`}>{order.status}</span>
                  <span className="mono text-sm text-[#e9c878]">${order.total.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {(order.items || []).map((item, idx) => (
                   <div key={idx} className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{item.name} {item.quantity > 1 ? `x${item.quantity}` : ''}</span>
                    <span className="mono text-[#e9c878]">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
