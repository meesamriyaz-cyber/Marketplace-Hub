import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const DAY_MS = 24 * 60 * 60 * 1000;

export default function TrialGate({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [license, setLicense] = useState(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  const checkLicense = useCallback(async () => {
    if (!user || user.role !== 'user') return;
    setChecking(true);
    try {
      const data = await api.license.status();
      setLicense(data);
      setError('');
    } catch (err) {
      setError(err?.message || 'Unable to verify application access.');
    } finally {
      setChecking(false);
    }
  }, [user]);

  useEffect(() => { checkLicense(); }, [checkLicense]);

  useEffect(() => {
    if (!user || user.role !== 'user') return undefined;
    const onFocus = () => checkLicense();
    window.addEventListener('focus', onFocus);
    const timer = window.setInterval(checkLicense, 15 * 60 * 1000);
    return () => { window.removeEventListener('focus', onFocus); window.clearInterval(timer); };
  }, [user, checkLicense]);

  const trial = license?.trial;
  const isExpired = license?.status === 'expired';
  const isTrial = license?.status === 'trial';
  const daysRemaining = useMemo(() => {
    if (!trial?.expiresAt) return 0;
    return Math.max(0, Math.ceil((new Date(trial.expiresAt).getTime() - Date.now()) / DAY_MS));
  }, [trial?.expiresAt]);

  if (authLoading || (user?.role === 'user' && (checking && !license))) {
    return <div className="flex min-h-[60vh] items-center justify-center bg-background"><div className="size-8 animate-spin rounded-full border-2 border-[#ee9d83] border-t-transparent" /></div>;
  }

  if (!user || user.role !== 'user') return children;

  if (isExpired) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg rounded-3xl border border-[#b8795e]/30 bg-[#3a2118] p-8 text-center shadow-2xl dark:bg-[#2a1712] light:border-[#a95f3f]/30 light:bg-[#6f3b25]">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-[#ee9d83]/15 text-2xl">⏳</div>
          <h1 className="text-2xl font-semibold text-white">Your trial has ended</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/75">Your 7-day trial period has expired. Purchase the full version to continue using the application.</p>
          {error && <p className="mt-4 text-sm text-[#ffd1c2]">{error}</p>}
          <button type="button" onClick={() => setLocation('/purchase')} className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#ee9d83] px-6 text-sm font-semibold text-[#30150d] transition hover:brightness-105">Purchase Full Version</button>
          <button type="button" onClick={checkLicense} disabled={checking} className="mt-3 block w-full text-sm text-white/60 hover:text-white disabled:opacity-50">{checking ? 'Checking access…' : 'Check license again'}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {children}
      {isTrial && (
        <div className="pointer-events-none fixed bottom-4 left-1/2 z-40 -translate-x-1/2">
          <div className="rounded-full border border-[#ee9d83]/30 bg-[#3a2118]/95 px-4 py-2 text-xs font-medium text-white shadow-lg backdrop-blur light:bg-[#6f3b25]/95">Trial · {daysRemaining} day{daysRemaining === 1 ? '' : 's'} remaining</div>
        </div>
      )}
    </div>
  );
}
