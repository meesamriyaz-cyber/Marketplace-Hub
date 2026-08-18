import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, LockKeyhole, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { loadRazorpayScript } from '@/lib/razorpay';

export default function CheckoutModal({ total, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [notConfigured, setNotConfigured] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [order, setOrder] = useState(null);
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const createOrder = useMutation({ mutationFn: api.orders.create, onSuccess: (data) => { setOrder(data); queryClient.invalidateQueries({ queryKey: ['cart'] }); queryClient.invalidateQueries({ queryKey: ['orders'] }); } });
  const ensureOrder = async () => order || (await createOrder.mutateAsync());
  const pay = async () => {
    if (!isAuthenticated) { toast.error('Please sign in to checkout'); return; }
    setProcessing(true);
    try {
      const currentOrder = await ensureOrder();
      const payment = await api.payments.createOrder(currentOrder._id);
      const ready = await loadRazorpayScript();
      if (!ready || !window.Razorpay) { toast.error('Could not load the payment gateway.'); setProcessing(false); return; }
      const razorpay = new window.Razorpay({ key: payment.keyId, amount: payment.amount, currency: payment.currency, name: 'Cutting Edge Apps', description: 'App marketplace purchase', order_id: payment.razorpayOrderId, prefill: { name: user?.name, email: user?.email }, theme: { color: '#ee9d83' }, handler: async (response) => { try { await api.payments.verify({ orderId: currentOrder._id, razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature }); setSubmitted(true); toast.success('Payment successful'); } catch (err) { toast.error(err.message || 'Payment verification failed'); } finally { setProcessing(false); } }, modal: { ondismiss: () => setProcessing(false) } });
      razorpay.on('payment.failed', () => { toast.error('Payment failed. Please try again.'); setProcessing(false); });
      razorpay.open();
    } catch (err) { if (err.status === 503) setNotConfigured(true); else toast.error(err.message || 'Checkout failed'); setProcessing(false); }
  };
  const simulate = async () => { setProcessing(true); try { await ensureOrder(); setSubmitted(true); toast.success('Order placed successfully'); } catch (err) { toast.error(err.message || 'Checkout failed'); } finally { setProcessing(false); } };
  return <motion.div className="fixed inset-0 z-[60] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true"><div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} /><motion.div className="relative w-full max-w-lg rounded-[26px] border border-border-subtle bg-surface p-7 shadow-2xl sm:p-9"><button type="button" onClick={onClose} className="absolute right-5 top-5 flex size-9 items-center justify-center rounded-full border border-neutral-800" aria-label="Close checkout"><X className="size-4" /></button>{!submitted ? <><div className="eyebrow text-[#a9d0b8]">Almost yours</div><h2 className="display mt-3 text-5xl text-foreground">Make it real.</h2><p className="mt-4 text-sm text-muted-foreground">Secure checkout powered by Razorpay.</p><div className="mt-7 rounded-2xl border border-border bg-surface-raised p-4"><div className="flex justify-between text-sm"><span>Selected apps</span><span className="mono text-[#e9c878]">₹{Number(total || 0).toLocaleString('en-IN')}</span></div><div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground"><LockKeyhole className="size-3.5 text-[#a9d0b8]" />Encrypted checkout</div></div>{!notConfigured ? <button type="button" onClick={pay} disabled={processing || createOrder.isPending} className="btn-primary mt-6 w-full">{processing ? 'Processing...' : 'Pay with Razorpay'} <ArrowRight className="size-4" /></button> : <div className="mt-6 space-y-3"><p className="rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">Razorpay is not connected yet.</p><button type="button" onClick={simulate} disabled={processing} className="btn-primary w-full">Preview purchase (test mode)</button></div>}</> : <div className="py-8 text-center"><Check className="mx-auto size-10 text-[#a9d0b8]" /><h2 className="display mt-6 text-5xl text-foreground">Good things ahead.</h2><p className="mx-auto mt-4 max-w-xs text-sm text-muted-foreground">{notConfigured ? 'Your order is recorded as pending. Nothing was charged.' : 'Your order is confirmed.'}</p><button type="button" onClick={onClose} className="btn-ghost mt-7">Back to Cutting Edge Apps</button></div>}</motion.div></motion.div>;
}
