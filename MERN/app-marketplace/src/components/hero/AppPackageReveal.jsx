import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, ChefHat, Copy, Download, Heart, ShoppingCart, UtensilsCrossed, X } from 'lucide-react';
import { useState } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SITE_GOLD = '#d3a83f';
const SITE_GREEN = '#a9d0b8';
const price = (value) => value === undefined || value === null || value === '' ? '' : `₹${Number(value).toLocaleString('en-IN')}`;

export default function AppPackageReveal({ product, open, onClose, onAddToCart, onFavorite, isFavorite = false, light = false }) {
  const { isAuthenticated } = useAuth();
  const [activation, setActivation] = useState(null);
  const [activating, setActivating] = useState(false);
  if (!product) return null;
  const features = Array.isArray(product.features) ? product.features.slice(0, 4) : [];
  const description = product.description || product.tagline || 'A practical business application designed to simplify everyday operations.';
  const accent = SITE_GOLD;
  const shell = light ? '#f4f0e7' : '#0d1015';
  const panel = light ? '#fffdf8' : '#151a21';
  const panelSoft = light ? '#f0ece3' : '#1c222b';
  const text = light ? '#292722' : '#f4f1e9';
  const muted = light ? '#655f56' : '#b9b5ad';
  const faint = light ? '#82796d' : '#8f969f';
  const border = light ? '#ddd5c7' : '#2b313a';
  const green = light ? '#4f8067' : SITE_GREEN;
  const isApp = Boolean(product.app?.isApp);
  const productId = product._id || product.id;
  const downloadReady = Boolean(isApp && product.app?.downloadEnabled && product.app?.downloadUrl);
  const isCloudKitchen = String(product.name || '').toLowerCase() === 'cloud kitchen';

  const openDemo = () => {
    if (!productId) return;
    window.location.href = `/demo-app?productId=${encodeURIComponent(productId)}`;
  };
  const download = () => { if (downloadReady) window.location.href = product.app.downloadUrl; else openDemo(); };
  const startTrial = async () => {
    if (!productId) return;
    if (!isAuthenticated) {
      toast.error('Please sign in to start your free trial');
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    setActivating(true);
    try {
      const result = await api.license.activationCode(productId);
      setActivation(result);
      toast.success('Your 7-day trial is ready');
    } catch (err) {
      toast.error(err.message || 'Could not start the free trial');
    } finally {
      setActivating(false);
    }
  };
  const copyCode = async () => {
    if (!activation?.code) return;
    try {
      await navigator.clipboard.writeText(activation.code);
      toast.success('Activation code copied');
    } catch {
      toast.error('Could not copy the code');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-md sm:p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
          <motion.div className="relative w-full max-w-5xl" initial={{ opacity: 0, y: 55, scale: .9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: .96 }} style={{ perspective: 1800 }}>
            <motion.div className="relative rounded-[30px] border shadow-[0_45px_140px_rgba(0,0,0,.28)]" style={{ background: shell, borderColor: light ? '#d7cfc1' : '#303640', color: text }}>
              <div className="absolute inset-x-0 top-0 z-30 h-1 rounded-full" style={{ background: accent }} />
              <div className="grid min-h-[560px] overflow-hidden rounded-[30px] lg:grid-cols-[.8fr_1.2fr]">
                <div className="relative flex items-center justify-center overflow-hidden p-8 sm:p-12" style={{ background: light ? '#eee9df' : '#11161e' }}>
                  <div className="relative h-[360px] w-[270px] sm:h-[410px] sm:w-[310px]">
                    <motion.div className="absolute inset-0 rounded-[20px] border" style={{ background: light ? '#dcd4c7' : '#0a0e14', borderColor: light ? '#c9beae' : '#343b45' }} animate={{ scale: 1 }}>
                      <div className="absolute inset-[13px] rounded-[15px] border p-4" style={{ background: panel, borderColor: border }}>
                        <div className="flex h-full items-center justify-center text-center">
                          <div>
                            {isCloudKitchen ? <div className="relative mx-auto flex size-24 items-center justify-center rounded-[28px] border" style={{ background: 'rgba(211,168,63,.10)', borderColor: 'rgba(211,168,63,.35)', color: accent }}>
                              <ChefHat className="size-12" strokeWidth={1.7} />
                              <UtensilsCrossed className="absolute bottom-3 right-3 size-5" strokeWidth={1.8} />
                            </div> : <div className="mx-auto flex size-14 items-center justify-center rounded-2xl" style={{ background: 'rgba(211,168,63,.12)', color: accent }}><span className="text-xl font-black">{(product.name || 'A').slice(0, 1).toUpperCase()}</span></div>}
                            <div className="mt-5 text-2xl font-black">{product.name || 'Application'}</div>
                            <div className="mt-2 text-[11px]" style={{ color: muted }}>{product.tagline || 'Built for modern business.'}</div>
                            {isApp && price(product.price) && <div className="mt-5 text-xl font-black" style={{ color: accent }}>{price(product.price)} <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: faint }}>one-time</span></div>}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
                <div className="relative flex flex-col justify-center p-7 sm:p-10 lg:p-14" style={{ background: panel, color: text }}>
                  <button type="button" onClick={onClose} className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-full border" style={{ borderColor: border, background: panelSoft }} aria-label="Close product presentation"><X className="size-5" /></button>
                  <div className="flex flex-wrap items-center gap-2 pr-12">
                    <div className="text-xs font-semibold uppercase tracking-[.2em]" style={{ color: green }}>{product.category || 'Business application'}</div>
                    {isApp && <span className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: 'rgba(169,208,184,.12)', color: green }}>{product.app?.platform === 'windows' ? 'Windows App' : 'Application'}</span>}
                  </div>
                  <h2 className="mt-3 text-4xl font-black sm:text-6xl">{product.name || 'Application'}</h2>
                  <p className="mt-5 max-w-2xl text-base leading-7 sm:text-lg" style={{ color: muted }}>{description}</p>
                  {features.length > 0 && <div className="mt-7 grid gap-3 sm:grid-cols-2">{features.map((feature, index) => <div key={`${feature}-${index}`} className="flex gap-3 rounded-xl border p-3 text-sm" style={{ borderColor: border, background: panelSoft }}><Check className="mt-0.5 size-4 shrink-0" style={{ color: green }} />{feature}</div>)}</div>}
                  {isApp && <div className="mt-7 rounded-2xl border p-4" style={{ borderColor: 'rgba(211,168,63,.3)', background: light ? '#f7f1e4' : '#211d15' }}>
                    <div className="flex items-center justify-between gap-4">
                      <div><div className="text-sm font-bold">7-day free trial</div><div className="mt-1 text-xs" style={{ color: muted }}>{downloadReady ? `Version ${product.app.version || 'latest'} · ${product.app.platform || 'app'}` : 'Trial starts when you activate the application'}</div></div>
                      <span className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: 'rgba(169,208,184,.14)', color: green }}>7 DAYS</span>
                    </div>
                  </div>}

                  {activation?.code && <div className="mt-5 rounded-2xl border p-4" style={{ borderColor: 'rgba(169,208,184,.38)', background: light ? '#eef7f1' : '#15231c' }}>
                    <div className="text-[10px] font-bold uppercase tracking-[.18em]" style={{ color: green }}>Your activation code</div>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <div className="rounded-xl border px-4 py-2.5 font-mono text-xl font-black tracking-[.2em]" style={{ borderColor: 'rgba(169,208,184,.32)', background: panel, color: text }}>{activation.code}</div>
                      <button type="button" onClick={copyCode} className="inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-bold" style={{ borderColor: border, background: panelSoft, color: text }}><Copy className="size-4" />Copy</button>
                    </div>
                    <div className="mt-2 text-xs" style={{ color: muted }}>Enter this code in Cloud Kitchen during first-run setup. The code is valid for 10 minutes.</div>
                  </div>}

                  <div className="mt-8 flex flex-wrap items-end gap-4 border-t pt-7" style={{ borderColor: border }}>
                    {isApp && price(product.price) && <div className="mr-auto"><div className="text-[10px] uppercase tracking-[.18em]" style={{ color: faint }}>Full version</div><div className="mt-1 text-3xl font-black" style={{ color: accent }}>{price(product.price)} <span className="text-xs font-semibold" style={{ color: faint }}>one-time</span></div></div>}
                    {price(product.price) && !isApp && <div><div className="text-[10px] uppercase tracking-[.18em]" style={{ color: faint }}>Price</div><div className="mt-1 text-3xl font-black" style={{ color: accent }}>{price(product.price)}</div></div>}
                    {isApp ? <>
                      <button type="button" onClick={downloadReady ? download : startTrial} disabled={!productId || activating} className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50" style={{ background: accent, color: '#201b10' }}>
                        {downloadReady ? <Download className="size-4" /> : null}
                        {activating ? 'Preparing Trial...' : downloadReady ? 'Download & Start Free Trial' : activation?.code ? 'Code Generated' : 'Start 7-Day Free Trial'}
                        <ArrowRight className="size-4" />
                      </button>
                      {price(product.price) && <button type="button" onClick={() => onAddToCart?.(product)} disabled={!productId} className="inline-flex items-center gap-2 rounded-full border px-5 py-3.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50" style={{ borderColor: 'rgba(211,168,63,.55)', background: 'transparent', color: text }}><ShoppingCart className="size-4" />Buy Full Version</button>}
                    </> : <button type="button" onClick={() => onAddToCart?.(product)} className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold" style={{ background: accent, color: '#201b10' }}>Get this app <ArrowRight className="size-4" /></button>}
                    <button type="button" onClick={() => onFavorite?.(product)} className="inline-flex size-12 items-center justify-center rounded-full border" style={{ borderColor: 'rgba(211,168,63,.55)', background: isFavorite ? 'rgba(211,168,63,.14)' : 'transparent' }} aria-label="Favorite app"><Heart className={`size-5 ${isFavorite ? 'fill-current' : ''}`} style={{ color: accent }} /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
