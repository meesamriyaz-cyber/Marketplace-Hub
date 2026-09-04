import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { CheckCircle2, Clock3, Copy, KeyRound, LockKeyhole, RefreshCw, ShoppingCart } from 'lucide-react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { loadRazorpayScript } from '@/lib/razorpay';

const DAY_MS = 86400000;

export default function DemoApp() {
  const { user, loading: authLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const [license, setLicense] = useState(null);
  const [product, setProduct] = useState(null);
  const [busy, setBusy] = useState(false);
  const [codeBusy, setCodeBusy] = useState(false);
  const [activationCode, setActivationCode] = useState(null);
  const [message, setMessage] = useState('');
  const productId = useMemo(() => typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('productId') : null, [location]);

  const loadProduct = useCallback(async () => {
    if (!productId) return;
    try { setProduct(await api.products.get(productId)); } catch (err) { setMessage(err?.message || 'Unable to load application.'); }
  }, [productId]);

  const refresh = useCallback(async () => {
    if (!user || !productId) return;
    setBusy(true);
    try { setLicense(await api.license.status(productId)); setMessage(''); }
    catch (err) { setMessage(err?.message || 'Unable to verify this application license.'); }
    finally { setBusy(false); }
  }, [user, productId]);

  useEffect(() => { if (!authLoading && user) { loadProduct(); refresh(); } }, [authLoading, user, loadProduct, refresh]);

  const startTrial = async () => { setBusy(true); setMessage(''); try { setLicense(await api.license.activateTrial(productId)); } catch (err) { setMessage(err?.message || 'Unable to start the trial.'); } finally { setBusy(false); } };

  const generateActivationCode = async () => {
    setCodeBusy(true); setMessage(''); setActivationCode(null);
    try { setActivationCode(await api.license.activationCode(productId)); }
    catch (err) { setMessage(err?.message || 'Unable to generate an activation code.'); }
    finally { setCodeBusy(false); }
  };

  const copyCode = async () => {
    if (!activationCode?.code) return;
    try { await navigator.clipboard.writeText(activationCode.code); setMessage('Activation code copied.'); } catch { setMessage('Copy failed. Please select and copy the code manually.'); }
  };

  const purchase = async () => {
    setBusy(true); setMessage('');
    try {
      const order = await api.orders.createAppPurchase(productId);
      const payment = await api.payments.createOrder(order._id);
      const ready = await loadRazorpayScript();
      if (!ready || !window.Razorpay) throw new Error('Could not load the payment gateway.');
      const razorpay = new window.Razorpay({ key: payment.keyId, amount: payment.amount, currency: payment.currency, name: 'Cutting Edge Apps', description: `${product?.name || 'Application'} — Full Version`, order_id: payment.razorpayOrderId, prefill: { name: user?.name, email: user?.email }, theme: { color: '#d3a83f' }, handler: async (response) => { try { await api.payments.verify({ orderId: order._id, razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature }); await refresh(); setActivationCode(null); } catch (err) { setMessage(err?.message || 'Payment verification failed.'); } finally { setBusy(false); } }, modal: { ondismiss: () => setBusy(false) } });
      razorpay.on('payment.failed', () => { setMessage('Payment failed. Please try again.'); setBusy(false); });
      razorpay.open();
    } catch (err) { setMessage(err?.message || 'Unable to start purchase.'); setBusy(false); }
  };

  const days = useMemo(() => license?.trial?.expiresAt ? Math.max(0, Math.ceil((new Date(license.trial.expiresAt).getTime() - Date.now()) / DAY_MS)) : 0, [license]);
  const codeMinutes = useMemo(() => activationCode?.expiresAt ? Math.max(0, Math.ceil((new Date(activationCode.expiresAt).getTime() - Date.now()) / 60000)) : 0, [activationCode]);

  if (authLoading) return <div className="flex min-h-screen items-center justify-center bg-[#0d1015] text-white">Loading demo…</div>;
  if (!user) return <div className="flex min-h-screen items-center justify-center bg-[#0d1015] p-6 text-white"><div className="max-w-md rounded-3xl border border-white/10 bg-[#151a21] p-8 text-center"><LockKeyhole className="mx-auto size-10 text-[#d3a83f]" /><h1 className="mt-4 text-2xl font-bold">Sign in to use the demo</h1><button onClick={() => setLocation('/login')} className="mt-6 rounded-full bg-[#d3a83f] px-6 py-3 font-semibold text-[#201b10]">Sign in</button></div></div>;
  if (!productId) return <div className="min-h-screen bg-[#0d1015] p-10 text-white"><h1 className="text-3xl font-black">Application not specified</h1><p className="mt-3 text-white/60">Return to the App Shelf and select an application.</p></div>;

  const active = license?.status === 'active';
  const trial = license?.status === 'trial';
  const expired = license?.status === 'expired';
  return <div className="min-h-screen bg-[#0d1015] px-5 py-10 text-white sm:px-8"><div className="mx-auto max-w-5xl">
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5"><div><div className="text-xs font-semibold uppercase tracking-[.2em] text-[#a9d0b8]">Demo Application</div><h1 className="mt-2 text-3xl font-black">{product?.name || 'Business Manager'}</h1></div><button onClick={refresh} disabled={busy} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/75 disabled:opacity-50"><RefreshCw className="size-4" />{busy ? 'Checking…' : 'Check license'}</button></div>
    {message && <div className="mt-6 rounded-2xl border border-red-300/20 bg-red-300/10 p-4 text-sm text-red-100">{message}</div>}
    {(!license || license.status === 'none') && <div className="mt-10 rounded-3xl border border-[#d3a83f]/30 bg-[#151a21] p-8 text-center"><Clock3 className="mx-auto size-12 text-[#d3a83f]" /><h2 className="mt-5 text-3xl font-bold">Start your 7-day free trial</h2><p className="mx-auto mt-3 max-w-xl text-white/65">Your trial is tied specifically to this application and your account.</p><button onClick={startTrial} disabled={busy} className="mt-7 rounded-full bg-[#d3a83f] px-7 py-3.5 font-bold text-[#201b10]">{busy ? 'Starting trial…' : 'Start 7-Day Trial'}</button></div>}
    {trial && <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]"><div className="rounded-3xl border border-[#a9d0b8]/25 bg-[#151a21] p-8"><div className="flex items-center gap-3 text-[#a9d0b8]"><CheckCircle2 className="size-6" /><span className="font-semibold">Trial active</span></div><h2 className="mt-5 text-4xl font-black">{product?.name}</h2><div className="mt-8 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl bg-white/5 p-5"><div className="text-xs uppercase tracking-wider text-white/45">Remaining</div><div className="mt-2 text-3xl font-bold">{days} days</div></div><div className="rounded-2xl bg-white/5 p-5"><div className="text-xs uppercase tracking-wider text-white/45">Status</div><div className="mt-2 font-bold text-[#a9d0b8]">TRIAL</div></div><div className="rounded-2xl bg-white/5 p-5"><div className="text-xs uppercase tracking-wider text-white/45">Server</div><div className="mt-2 font-bold">Verified</div></div></div></div><div className="rounded-3xl border border-white/10 bg-[#151a21] p-7"><h3 className="text-lg font-bold">Full version</h3><p className="mt-2 text-sm leading-6 text-white/55">Purchase the full application at any time.</p><button onClick={purchase} disabled={busy} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#d3a83f] px-4 py-3 text-sm font-semibold text-[#201b10] disabled:opacity-50"><ShoppingCart className="size-4" />Purchase Full Version</button></div></div>}
    {(trial || active) && <div className="mt-6 rounded-3xl border border-[#d3a83f]/25 bg-[#151a21] p-7"><div className="flex items-center gap-3"><KeyRound className="size-6 text-[#d3a83f]" /><div><h3 className="text-lg font-bold">Activate Cloud Kitchen</h3><p className="text-sm text-white/55">Generate a one-time code for the Windows application.</p></div></div>{activationCode ? <div className="mt-6 rounded-2xl bg-white/5 p-5"><div className="text-xs uppercase tracking-wider text-white/45">Activation code</div><div className="mt-2 flex flex-wrap items-center gap-3"><code className="text-2xl font-black tracking-[.25em] text-[#d3a83f]">{activationCode.code}</code><button onClick={copyCode} className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm"><Copy className="size-4" />Copy</button></div><p className="mt-3 text-xs text-white/45">Valid for about {codeMinutes} minute{codeMinutes === 1 ? '' : 's'}. Enter it in Cloud Kitchen to activate this device.</p></div> : <button onClick={generateActivationCode} disabled={codeBusy} className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#d3a83f]/50 px-5 py-3 font-semibold text-[#d3a83f] disabled:opacity-50"><KeyRound className="size-4" />{codeBusy ? 'Generating…' : 'Generate Activation Code'}</button>}</div>}
    {active && <div className="mt-10 rounded-3xl border border-[#a9d0b8]/25 bg-[#151a21] p-10"><CheckCircle2 className="size-10 text-[#a9d0b8]" /><h2 className="mt-4 text-3xl font-black">Full version unlocked</h2><p className="mt-2 text-white/60">Your paid license for this application is active.</p></div>}
    {expired && <div className="mt-10 rounded-3xl border border-[#d3a83f]/25 bg-[#151a21] p-10 text-center"><LockKeyhole className="mx-auto size-12 text-[#d3a83f]" /><h2 className="mt-5 text-3xl font-black">Trial ended</h2><p className="mx-auto mt-3 max-w-lg text-white/60">This application is locked because its trial has expired.</p><button onClick={purchase} disabled={busy} className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#d3a83f] px-7 py-3.5 font-bold text-[#201b10] disabled:opacity-50"><ShoppingCart className="size-4" />Purchase Full Version</button></div>}
  </div></div>;
}
