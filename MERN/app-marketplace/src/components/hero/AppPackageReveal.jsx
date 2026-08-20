import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Download, Heart, X } from 'lucide-react';

const SITE_GOLD = '#d3a83f';
const SITE_GREEN = '#a9d0b8';
const price = (value) => value === undefined || value === null || value === '' ? '' : `₹${Number(value).toLocaleString('en-IN')}`;

export default function AppPackageReveal({ product, open, onClose, onAddToCart, onFavorite, isFavorite = false, light = false }) {
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
  const downloadReady = Boolean(isApp && product.app?.downloadEnabled && product.app?.downloadUrl);
  const demoApp = Boolean(isApp && !downloadReady);
  const openDemo = () => { window.location.href = '/demo-app'; };
  const download = () => { if (downloadReady) window.location.href = product.app.downloadUrl; else openDemo(); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-md sm:p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
          <motion.div className="relative w-full max-w-5xl" initial={{ opacity: 0, y: 55, scale: .9 }} animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: .65, ease: [0.16, 1, .3, 1] } }} exit={{ opacity: 0, y: 30, scale: .96 }} style={{ perspective: 1800 }}>
            <motion.div className="relative rounded-[30px] border shadow-[0_45px_140px_rgba(0,0,0,.28)]" style={{ background: shell, borderColor: light ? '#d7cfc1' : '#303640', color: text }}>
              <div className="absolute inset-x-0 top-0 z-30 h-1 rounded-full" style={{ background: accent, boxShadow: `0 0 24px ${accent}44` }} />
              <div className="grid min-h-[560px] overflow-hidden rounded-[30px] lg:grid-cols-[.8fr_1.2fr]">
                <div className="relative flex items-center justify-center overflow-hidden p-8 sm:p-12" style={{ background: light ? 'radial-gradient(circle at 50% 45%, rgba(211,168,63,.14), transparent 60%), #eee9df' : 'radial-gradient(circle at 50% 45%, rgba(211,168,63,.18), transparent 60%), #11161e' }}>
                  <div className="relative h-[360px] w-[270px] sm:h-[410px] sm:w-[310px]" style={{ perspective: 1400 }}>
                    <motion.div className="absolute inset-0 rounded-[20px] border shadow-[inset_0_0_0_10px_rgba(0,0,0,.08),inset_0_18px_35px_rgba(0,0,0,.18),0_22px_45px_rgba(0,0,0,.25)]" style={{ background: light ? '#dcd4c7' : '#0a0e14', borderColor: light ? '#c9beae' : '#343b45', transformStyle: 'preserve-3d' }} initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1, transition: { duration: .55 } }}>
                      <div className="absolute inset-[13px] rounded-[15px] border p-4" style={{ background: light ? 'linear-gradient(145deg,#eee9df,#d8d0c3)' : 'linear-gradient(145deg,#171d26,#080b10)', borderColor: light ? '#c9c0b2' : '#2d343e' }}>
                        <div className="absolute inset-[10px] rounded-[11px] border" style={{ borderColor: 'rgba(211,168,63,.28)', boxShadow: 'inset 0 0 35px rgba(211,168,63,.07)' }} />
                        <div className="relative h-full rounded-[10px] p-4"><div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[.18em]" style={{ color: faint }}><span>Digital edition</span><span style={{ color: green }}>Ready to deploy</span></div><div className="absolute left-1/2 top-1/2 w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-[14px] border p-5 text-center shadow-[0_14px_28px_rgba(0,0,0,.22)]" style={{ background: panel, borderColor: border }}><div className="mx-auto flex size-14 items-center justify-center rounded-2xl border" style={{ background: 'rgba(211,168,63,.12)', borderColor: 'rgba(211,168,63,.45)', color: accent }}><span className="text-xl font-black">{(product.name || 'A').slice(0, 1).toUpperCase()}</span></div><div className="mt-4 text-2xl font-black" style={{ color: text }}>{product.name || 'Application'}</div><div className="mt-2 text-[11px] leading-5" style={{ color: muted }}>{product.tagline || 'Built for modern business.'}</div><div className="mt-4 flex items-center justify-center gap-2 text-[8px] font-bold uppercase tracking-[.15em]" style={{ color: faint }}><span>License</span><span>•</span><span>Instant access</span></div></div><div className="absolute bottom-2 left-0 right-0 flex justify-center"><span className="rounded-full border px-3 py-1 text-[8px] font-bold uppercase tracking-[.16em]" style={{ borderColor: 'rgba(211,168,63,.35)', color: accent, background: light ? 'rgba(255,253,248,.65)' : 'rgba(0,0,0,.2)' }}>Premium digital product</span></div></div>
                      </div>
                    </motion.div>
                    <motion.div className="absolute left-0 top-0 z-20 h-full w-full origin-left rounded-[18px] border-2 shadow-[18px_24px_55px_rgba(0,0,0,.35)]" style={{ background: light ? 'linear-gradient(145deg, #d3a83f, #9a7425 55%, #66501e)' : 'linear-gradient(145deg, #d3a83f, #4b3b18 55%, #101318)', borderColor: '#d3a83f', transformStyle: 'preserve-3d', transformOrigin: 'left center', backfaceVisibility: 'visible' }} initial={{ rotateY: 0, x: 0 }} animate={{ rotateY: -72, x: -10, transition: { duration: 1.15, delay: .35, ease: [0.16, 1, .3, 1] } }} exit={{ rotateY: 0, x: 0, transition: { duration: .65, ease: [0.7, 0, .84, 0] } }}>
                      <div className="absolute inset-[11px] overflow-hidden rounded-[12px] border p-5" style={{ borderColor: 'rgba(255,255,255,.22)', background: 'rgba(35,31,25,.18)', color: '#fff' }}><div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[.2em]"><span>{product.category || 'BUSINESS APP'}</span><span style={{ color: '#fff4d5' }}>SOFTWARE</span></div><div className="absolute left-5 right-5 top-1/2 -translate-y-1/2"><div className="text-4xl font-black leading-[.9] sm:text-5xl">{product.name || 'Application'}</div><div className="mt-4 max-w-[210px] text-xs leading-5 text-white/80">{product.tagline || 'Built for modern business.'}</div></div><div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[.16em] text-white/65"><span>Cutting-Edge Apps</span><span>Open edition</span></div></div><div className="absolute -right-3 top-5 h-[calc(100%-40px)] w-3 rounded-r-md bg-black/50" />
                    </motion.div>
                    <motion.div className="absolute -bottom-7 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-full border px-4 py-2 text-[9px] font-semibold uppercase tracking-[.2em] backdrop-blur" style={{ borderColor: 'rgba(211,168,63,.45)', background: light ? 'rgba(255,253,248,.85)' : 'rgba(0,0,0,.35)', color: accent }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: 1.05 } }}>Package opened</motion.div>
                  </div>
                </div>
                <div className="relative flex flex-col justify-center p-7 sm:p-10 lg:p-14" style={{ background: panel, color: text }}>
                  <button type="button" onClick={onClose} className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-full border transition" style={{ borderColor: border, background: panelSoft, color: text }} aria-label="Close product presentation"><X className="size-5" /></button>
                  <div className="pr-12 text-xs font-semibold uppercase tracking-[.2em]" style={{ color: green }}>{product.category || 'Business application'}</div>
                  <h2 className="mt-3 text-4xl font-black leading-[.94] tracking-[-.03em] sm:text-6xl" style={{ color: text }}>{product.name || 'Application'}</h2>
                  <p className="mt-5 max-w-2xl text-base leading-7 sm:text-lg" style={{ color: muted }}>{description}</p>
                  {features.length > 0 && <div className="mt-7 grid gap-3 sm:grid-cols-2">{features.map((feature, index) => <div key={`${feature}-${index}`} className="flex gap-3 rounded-xl border p-3 text-sm" style={{ borderColor: border, background: panelSoft, color: text }}><Check className="mt-0.5 size-4 shrink-0" style={{ color: green }} />{feature}</div>)}</div>}
                  {isApp && <div className="mt-7 rounded-2xl border p-4" style={{ borderColor: 'rgba(211,168,63,.3)', background: light ? '#f7f1e4' : '#211d15' }}><div className="flex items-center justify-between gap-4"><div><div className="text-sm font-bold" style={{ color: text }}>7-day free trial</div><div className="mt-1 text-xs" style={{ color: muted }}>{downloadReady ? `Version ${product.app.version || 'latest'} · ${product.app.platform || 'app'}` : 'Demo download · trial activates on first launch'}</div></div><span className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: 'rgba(169,208,184,.14)', color: green }}>{downloadReady ? 'Available' : 'Demo'}</span></div></div>}
                  <div className="mt-8 flex flex-wrap items-center gap-4 border-t pt-7" style={{ borderColor: border }}>
                    {price(product.price) && !isApp && <div><div className="text-[10px] uppercase tracking-[.18em]" style={{ color: faint }}>Price</div><div className="mt-1 text-3xl font-black" style={{ color: accent }}>{price(product.price)}</div></div>}
                    {isApp ? <button type="button" onClick={download} className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold shadow-lg transition hover:-translate-y-0.5" style={{ background: accent, color: '#201b10' }}><Download className="size-4" />{downloadReady ? 'Download & Start Free Trial' : 'Try Demo App'}<ArrowRight className="size-4" /></button> : <button type="button" onClick={() => onAddToCart?.(product)} className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold shadow-lg transition hover:-translate-y-0.5" style={{ background: accent, color: '#201b10' }}>Get this app <ArrowRight className="size-4" /></button>}
                    <button type="button" onClick={() => onFavorite?.(product)} className="inline-flex size-12 items-center justify-center rounded-full border transition" style={{ borderColor: 'rgba(211,168,63,.55)', background: isFavorite ? 'rgba(211,168,63,.14)' : 'transparent' }} aria-label="Favorite app"><Heart className={`size-5 ${isFavorite ? 'fill-current' : ''}`} style={{ color: accent }} /></button>
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
