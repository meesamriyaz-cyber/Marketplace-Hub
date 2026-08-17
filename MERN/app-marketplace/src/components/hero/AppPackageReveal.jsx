import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Heart, X } from 'lucide-react';

const ACCENTS = ['#b77b18', '#2f7d59', '#b94f37', '#4669a8', '#7955a8'];
const accentFor = (product) => product?.accent || ACCENTS[(product?._id || product?.id || product?.name || '').length % ACCENTS.length];
const price = (value) => value === undefined || value === null || value === '' ? '' : `₹${Number(value).toLocaleString('en-IN')}`;

export default function AppPackageReveal({ product, open, onClose, onAddToCart, onFavorite, isFavorite = false, light = false }) {
  if (!product) return null;
  const accent = accentFor(product);
  const features = Array.isArray(product.features) ? product.features.slice(0, 4) : [];
  const description = product.description || product.tagline || 'A practical business application designed to simplify everyday operations.';
  const shell = light ? '#f7f4ee' : '#090c11';
  const panel = light ? '#fffdf8' : '#11161e';
  const panelSoft = light ? '#f1ede4' : 'rgba(255,255,255,.04)';
  const text = light ? '#25231f' : '#ffffff';
  const muted = light ? '#665f56' : 'rgba(255,255,255,.70)';
  const faint = light ? '#81786d' : 'rgba(255,255,255,.45)';
  const border = light ? '#ded7ca' : 'rgba(255,255,255,.10)';

  return <AnimatePresence>
    {open && <motion.div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-md sm:p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <motion.div className="relative w-full max-w-5xl" initial={{ opacity: 0, y: 55, scale: .9 }} animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: .65, ease: [0.16, 1, .3, 1] } }} exit={{ opacity: 0, y: 30, scale: .96 }} style={{ perspective: 1800 }}>
        <motion.div className="relative rounded-[30px] border shadow-[0_45px_140px_rgba(0,0,0,.28)]" style={{ background: shell, borderColor: light ? '#d7cfc1' : `${accent}88`, color: text }}>
          <div className="absolute inset-x-0 top-0 z-30 h-1 rounded-full" style={{ background: accent, boxShadow: `0 0 24px ${accent}66` }} />
          <div className="grid min-h-[560px] overflow-hidden rounded-[30px] lg:grid-cols-[.8fr_1.2fr]">
            <div className="relative flex items-center justify-center overflow-hidden p-8 sm:p-12" style={{ background: light ? `radial-gradient(circle at 50% 45%, ${accent}16, transparent 60%), #eee9df` : `radial-gradient(circle at 50% 45%, ${accent}32, transparent 60%), #11161e` }}>
              <div className="relative h-[360px] w-[270px] sm:h-[410px] sm:w-[310px]" style={{ perspective: 1400 }}>
                <motion.div className="absolute inset-0 rounded-[18px] border shadow-2xl" style={{ background: light ? '#e9e3d8' : '#07090d', borderColor: light ? '#d1c7b7' : `${accent}55`, transformStyle: 'preserve-3d' }} initial={{ opacity: 0, scale: .88 }} animate={{ opacity: 1, scale: 1, transition: { duration: .55 } }}>
                  <div className="absolute inset-[12px] rounded-[12px] border p-5" style={{ borderColor: light ? '#d8d0c2' : 'rgba(255,255,255,.10)', background: light ? `radial-gradient(circle at 50% 20%, ${accent}12, transparent 55%), #fffdf8` : `radial-gradient(circle at 50% 20%, ${accent}26, transparent 55%), linear-gradient(145deg, #171c24, #07090d)` }}>
                    <div className="text-[10px] font-semibold uppercase tracking-[.2em]" style={{ color: faint }}>Software package</div>
                    <div className="mt-8 h-px w-full" style={{ background: `${accent}66` }} />
                    <div className="mt-8 text-xs uppercase tracking-[.18em]" style={{ color: faint }}>Inside</div>
                    <div className="mt-3 text-3xl font-black sm:text-4xl" style={{ color: text }}>{product.name || 'Application'}</div>
                    <div className="mt-4 max-w-[210px] text-xs leading-5" style={{ color: muted }}>{product.tagline || 'Built for modern business.'}</div>
                    <div className="absolute bottom-5 left-5 right-5 flex justify-between text-[9px] font-semibold uppercase tracking-[.16em]" style={{ color: faint }}><span>Cutting-Edge Apps</span><span style={{ color: accent }}>Digital Edition</span></div>
                  </div>
                </motion.div>

                <motion.div className="absolute left-0 top-0 z-20 h-full w-full origin-left rounded-[18px] border-2 shadow-[18px_24px_55px_rgba(0,0,0,.35)]" style={{ background: light ? `linear-gradient(145deg, ${accent}, #8b6426 55%, #5c431f)` : `linear-gradient(145deg, ${accent}, #16191f 55%, #07090d)`, borderColor: light ? `${accent}dd` : `${accent}dd`, transformStyle: 'preserve-3d', transformOrigin: 'left center', backfaceVisibility: 'visible' }} initial={{ rotateY: 0, x: 0 }} animate={{ rotateY: -72, x: -10, transition: { duration: 1.15, delay: .35, ease: [0.16, 1, .3, 1] } }} exit={{ rotateY: 0, x: 0, transition: { duration: .65, ease: [0.7, 0, .84, 0] } }}>
                  <div className="absolute inset-[11px] overflow-hidden rounded-[12px] border p-5" style={{ borderColor: 'rgba(255,255,255,.20)', background: light ? 'rgba(35,31,25,.18)' : 'rgba(0,0,0,.25)', color: '#fff' }}>
                    <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[.2em]"><span>{product.category || 'BUSINESS APP'}</span><span style={{ color: light ? '#fff4d5' : accent }}>SOFTWARE</span></div>
                    <div className="absolute left-5 right-5 top-1/2 -translate-y-1/2"><div className="text-4xl font-black leading-[.9] sm:text-5xl">{product.name || 'Application'}</div><div className="mt-4 max-w-[210px] text-xs leading-5 text-white/80">{product.tagline || 'Built for modern business.'}</div></div>
                    <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[.16em] text-white/65"><span>Cutting-Edge Apps</span><span>Open edition</span></div>
                  </div>
                  <div className="absolute -right-3 top-5 h-[calc(100%-40px)] w-3 rounded-r-md bg-black/50" />
                </motion.div>

                <motion.div className="absolute -bottom-7 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-full border px-4 py-2 text-[9px] font-semibold uppercase tracking-[.2em] backdrop-blur" style={{ borderColor: `${accent}55`, background: light ? 'rgba(255,253,248,.85)' : 'rgba(0,0,0,.35)', color: accent }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: 1.05 } }}>Package opened</motion.div>
              </div>
            </div>

            <div className="relative flex flex-col justify-center p-7 sm:p-10 lg:p-14" style={{ background: panel, color: text }}>
              <button type="button" onClick={onClose} className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-full border transition" style={{ borderColor: border, background: panelSoft, color: text }} aria-label="Close product presentation"><X className="size-5" /></button>
              <div className="pr-12 text-xs font-semibold uppercase tracking-[.2em]" style={{ color: accent }}>{product.category || 'Business application'}</div>
              <h2 className="mt-3 text-4xl font-black leading-[.94] tracking-[-.03em] sm:text-6xl" style={{ color: text }}>{product.name || 'Application'}</h2>
              <p className="mt-5 max-w-2xl text-base leading-7 sm:text-lg" style={{ color: muted }}>{description}</p>
              {features.length > 0 && <div className="mt-7 grid gap-3 sm:grid-cols-2">{features.map((feature, index) => <div key={`${feature}-${index}`} className="flex gap-3 rounded-xl border p-3 text-sm" style={{ borderColor: border, background: panelSoft, color: text }}><Check className="mt-0.5 size-4 shrink-0" style={{ color: accent }} />{feature}</div>)}</div>}
              <div className="mt-8 flex flex-wrap items-center gap-4 border-t pt-7" style={{ borderColor: border }}>
                {price(product.price) && <div><div className="text-[10px] uppercase tracking-[.18em]" style={{ color: faint }}>Price</div><div className="mt-1 text-3xl font-black" style={{ color: accent }}>{price(product.price)}</div></div>}
                <button type="button" onClick={() => onAddToCart?.(product)} className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold shadow-lg transition hover:-translate-y-0.5" style={{ background: accent, color: '#fff' }}>Get this app <ArrowRight className="size-4" /></button>
                <button type="button" onClick={() => onFavorite?.(product)} className="inline-flex size-12 items-center justify-center rounded-full border transition" style={{ borderColor: `${accent}66`, background: isFavorite ? `${accent}18` : 'transparent' }} aria-label="Favorite app"><Heart className={`size-5 ${isFavorite ? 'fill-current' : ''}`} style={{ color: accent }} /></button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>}
  </AnimatePresence>;
}
