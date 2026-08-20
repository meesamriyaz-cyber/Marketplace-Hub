import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { CheckCircle2, Clock3, LockKeyhole, RefreshCw, ShoppingCart } from 'lucide-react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const DAY_MS = 86400000;

export default function DemoApp() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [license, setLicense] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const refresh = useCallback(async () => {
    if (!user) return;
    setBusy(true);
    try { setLicense(await api.license.status()); setMessage(''); }
    catch (err) { setMessage(err?.message || 'Unable to verify this demo license.'); }
    finally { setBusy(false); }
  }, [user]);

  useEffect(() => { if (!authLoading && user) refresh(); }, [authLoading, user, refresh]);

  const startTrial = async () => {
    setBusy(true); setMessage('');
    try { setLicense(await api.license.activateTrial()); }
    catch (err) { setMessage(err?.message || 'Unable to start the trial.'); }
    finally { setBusy(false); }
  };

  const days = useMemo(() => {
    if (!license?.trial?.expiresAt) return 0;
    return Math.max(0, Math.ceil((new Date(license.trial.expiresAt).getTime() - Date.now()) / DAY_MS));
  }, [license]);

  if (authLoading) return <div className="flex min-h-screen items-center justify-center bg-[#0d1015] text-white">Loading demo…</div>;
  if (!user) return <div className="flex min-h-screen items-center justify-center bg-[#0d1015] p-6 text-white"><div className="max-w-md rounded-3xl border border-white/10 bg-[#151a21] p-8 text-center"><LockKeyhole className="mx-auto size-10 text-[#d3a83f]" /><h1 className="mt-4 text-2xl font-bold">Sign in to use the demo</h1><p className="mt-2 text-white/60">The demo application uses the same account and backend licensing system as the future real app.</p><button onClick={() => setLocation('/login')} className="mt-6 rounded-full bg-[#d3a83f] px-6 py-3 font-semibold text-[#201b10]">Sign in</button></div></div>;

  const active = license?.status === 'active';
  const trial = license?.status === 'trial';
  const expired = license?.status === 'expired';

  return <div className="min-h-screen bg-[#0d1015] px-5 py-10 text-white sm:px-8">
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div><div className="text-xs font-semibold uppercase tracking-[.2em] text-[#a9d0b8]">Demo Application</div><h1 className="mt-2 text-3xl font-black">Business Manager</h1></div>
        <button onClick={refresh} disabled={busy} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/75 hover:bg-white/5 disabled:opacity-50"><RefreshCw className="size-4" />{busy ? 'Checking…' : 'Check license'}</button>
      </div>

      {message && <div className="mt-6 rounded-2xl border border-red-300/20 bg-red-300/10 p-4 text-sm text-red-100">{message}</div>}

      {(!license || license.status === 'none') && <div className="mt-10 rounded-3xl border border-[#d3a83f]/30 bg-[#151a21] p-8 text-center"><Clock3 className="mx-auto size-12 text-[#d3a83f]" /><h2 className="mt-5 text-3xl font-bold">Start your 7-day free trial</h2><p className="mx-auto mt-3 max-w-xl text-white/65">This is the prototype of the real downloaded application. The trial is created by the backend only when the app is launched.</p><button onClick={startTrial} disabled={busy} className="mt-7 rounded-full bg-[#d3a83f] px-7 py-3.5 font-bold text-[#201b10] disabled:opacity-50">{busy ? 'Starting trial…' : 'Start 7-Day Trial'}</button></div>}

      {trial && <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]"><div className="rounded-3xl border border-[#a9d0b8]/25 bg-[#151a21] p-8"><div className="flex items-center gap-3 text-[#a9d0b8]"><CheckCircle2 className="size-6" /><span className="font-semibold">Trial active</span></div><h2 className="mt-5 text-4xl font-black">Welcome to Business Manager</h2><p className="mt-3 text-white/65">You are using the prototype licensed application.</p><div className="mt-8 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl bg-white/5 p-5"><div className="text-xs uppercase tracking-wider text-white/45">Remaining</div><div className="mt-2 text-3xl font-bold">{days} days</div></div><div className="rounded-2xl bg-white/5 p-5"><div className="text-xs uppercase tracking-wider text-white/45">Status</div><div className="mt-2 font-bold text-[#a9d0b8]">TRIAL</div></div><div className="rounded-2xl bg-white/5 p-5"><div className="text-xs uppercase tracking-wider text-white/45">Server</div><div className="mt-2 font-bold">Verified</div></div></div></div><div className="rounded-3xl border border-white/10 bg-[#151a21] p-7"><h3 className="text-lg font-bold">Full version</h3><p className="mt-2 text-sm leading-6 text-white/55">When the trial ends, this button will launch the real verified Razorpay purchase flow.</p><button disabled className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/40"><ShoppingCart className="size-4" />Purchase after trial</button></div></div>}

      {active && <div className="mt-10 rounded-3xl border border-[#a9d0b8]/25 bg-[#151a21] p-10"><CheckCircle2 className="size-10 text-[#a9d0b8]" /><h2 className="mt-4 text-3xl font-black">Full version unlocked</h2><p className="mt-2 text-white/60">The backend reports an active license. The real application would now unlock all features.</p></div>}

      {expired && <div className="mt-10 rounded-3xl border border-[#d3a83f]/25 bg-[#151a21] p-10 text-center"><LockKeyhole className="mx-auto size-12 text-[#d3a83f]" /><h2 className="mt-5 text-3xl font-black">Trial ended</h2><p className="mx-auto mt-3 max-w-lg text-white/60">The application is locked because the backend reports that the trial has expired.</p><button disabled className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#d3a83f]/40 px-7 py-3.5 font-bold text-white/50"><ShoppingCart className="size-4" />Purchase Full Version — Phase 4</button></div>}
    </div>
  </div>;
}
