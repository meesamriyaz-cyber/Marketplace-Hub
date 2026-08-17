import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Heart, X } from 'lucide-react';

const ACCENTS = ['#f0b429', '#4f9f78', '#e96f52', '#5f86d8', '#9a70c7'];
const accentFor = (product) => product?.accent || ACCENTS[(product?._id || product?.id || product?.name || '').length % ACCENTS.length];
const price = (value) => value === undefined || value === null || value === '' ? '' : `₹${Number(value).toLocaleString('en-IN')}`;

export default function AppPackageReveal({ product, open, onClose, onAddToCart, onFavorite, isFavorite = false, light = false }) {
  if (!product) return null;
  const accent = accentFor(product);
  const features = Array.isArray(product.features) ? product.features.slice(0, 4) : [];
  const description = product.description || product.tagline || 'A practical business application designed to simplify everyday operations.';

  return <AnimatePresence>
    {open && <motion.div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-md sm:p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <motion.div className="relative w-full max-w-5xl" initial={{ opacity: 0, y: 55, scale: .9 }} animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: .65, ease: [0.16, 1, .3, 1] } }} exit={{ opacity: 0, y: 30, scale: .96 }} style={{ perspective: 1800 }}>
        <motion.div className="relative rounded-[30px] border shadow-[0_45px_140px_rgba(0,0,0,.55)]" style={{ background: light ? '#24201c' : '#090c11', borderColor: `${accent}88` }}>
          <div className="absolute inset-x-0 top-0 z-30 h-1 rounded-full" style={{ background: accent, boxShadow: `0 0 28px ${accent}` }} />
          <div className="grid min-h-[560px] overflow-hidden rounded-[30px] lg:grid-cols-[.8fr_1.2fr]">
            <div className="relative flex items-center justify-center overflow-hidden p-8 sm:p-12" style={{ background: `radial-gradient(circle at 50% 45%, ${accent}32, transparent 60%), ${light ? '#302a24' : '#11161e'}` }}>
              <div className="relative h-[360px] w-[270px] sm:h-[410px] sm:w-[310px]" style={{ perspective: 1400 }}>
                <motion.div className="absolute inset-0 rounded-[18px] border shadow-2xl" style={{ background: light ? '#17191c' : '#07090d', borderColor: `${accent}55`, transformStyle: 'preserve-3d' }} initial={{ opacity: 0, scale: .88 }} animate={{ opacity: 1, scale: 1, transition: { duration: .55 } }}>
                  <div className="absolute inset-[12px] rounded-[12px] border border-white/10 p-5" style={{ background: `radial-gradient(circle at 50% 20%, ${accent}26, transparent 55%), linear-gradient(145deg, ${light ? '#39322a' : '#171c24'}, ${light ? '#17191d' : '#07090d'})` }}>
                    <div className="text-[10px] font-semibold uppercase tracking-[.2em] text-white/55">Software package</div>
                    <div className="mt-8 h-px w-full" style={{ background: `${accent}99` }} />
                    <div className="mt-8 text-xs uppercase tracking-[.18em] text-white/45">Inside</div>
                    <div className="mt-3 text-3xl font-black text-white sm:text-4xl">{product.name || 'Application'}</div>
                    <div className="mt-4 max-w-[210px] text-xs leading-5 text-white/60">{product.tagline || 'Built for modern business.'}</div>
                    <div className="absolute bottom-5 left-5 right-5 flex justify-between text-[9px] font-semibold uppercase tracking-[.16em] text-white/45"><span>Cutting-Edge Apps</span><span style={{ color: accent }}>Digital Edition</span></div>
                  </div>
                </motion.div>

                <motion.div className="absolute left-0 top-0 z-20 h-full w-full origin-left rounded-[18px] border-2 shadow-[18px_24px_55px_rgba(0,0,0,.45)]" style={{ background: `linear-gradient(145deg, ${accent}, #16191f 55%, #07090d)`, borderColor: `${accent}dd`, transformStyle: 'preserve-3d', transformOrigin: 'left center', backfaceVisibility: 'visible' }} initial={{ rotateY: 0, x: 0 }} animate={{ rotateY: -72, x: -10, transition: { duration: 1.15, delay: .35, ease: [0.16, 1, .3, 1] } }} exit={{ rotateY: 0, x: 0, transition: { duration: .65, ease: [0.7, 0, .84, 0] } }}>
                  <div className="absolute inset-[11px] overflow-hidden rounded-[12px] border border-white/15 bg-black/25 p-5 text-white">
                    <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[.2em]"><span>{product.category || 'BUSINESS APP'}</span><span style={{ color: accent }}>SOFTWARE</span></div>
                    <div className="absolute left-5 right-5 top-1/2 -translate-y-1/2"><div className="text-4xl font-black leading-[.9] sm:text-5xl">{product.name || 'Application'}</div><div className="mt-4 max-w-[210px] text-xs leading-5 text-white/75">{product.tagline || 'Built for modern business.'}</div></div>
                    <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[.16em] text-white/55"><span>Cutting-Edge Apps</span><span>Open edition</span></div>
                  </div>
                  <div className="absolute -right-3 top-5 h-[calc(100%-40px)] w-3 rounded-r-md bg-black/70" />
                </motion.div>

                <motion.div className="absolute -bottom-7 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-full border px-4 py-2 text-[9px] font-semibold uppercase tracking-[.2em] backdrop-blur" style={{ borderColor: `${accent}55`, background: 'rgba(0,0,0,.35)', color: accent }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: 1.05 } }}>Package opened</motion.div>
              </div>
            </div>

            <div className="relative flex flex-col justify-center p-7 text-white sm:p-10 lg:p-14">
              <button type="button" onClick={onClose} className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:bg-white/10" aria-label="Close product presentation"><X className="size-5" /></button>
              <div className="pr-12 text-xs font-semibold uppercase tracking-[.2em]" style={{ color: accent }}>{product.category || 'Business application'}</div>
              <h2 className="mt-3 text-4xl font-black leading-[.94] tracking-[-.03em] sm:text-6xl">{product.name || 'Application'}</h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">{description}</p>
              {features.length > 0 && <div className="mt-7 grid gap-3 sm:grid-cols-2">{features.map((feature, index) => <div key={`${feature}-${index}`} className="flex gap-3 rounded-xl border border-white/10 bg-white/[.04] p-3 text-sm text-white/85"><Check className="mt-0.5 size-4 shrink-0" style={{ color: accent }} />{feature}</div>)}</div>}
              <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-white/10 pt-7">
                {price(product.price) && <div><div className="text-[10px] uppercase tracking-[.18em] text-white/45">Price</div><div className="mt-1 text-3xl font-black" style={{ color: accent }}>{price(product.price)}</div></div>}
                <button type="button" onClick={() => onAddToCart?.(product)} className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold text-[#101216] shadow-lg transition hover:-translate-y-0.5" style={{ background: accent }}>Get this app <ArrowRight className="size-4" /></button>
                <button type="button" onClick={() => onFavorite?.(product)} className={`inline-flex size-12 items-center justify-center rounded-full border transition ${isFavorite ? 'bg-white/10' : 'bg-transparent'}`} style={{ borderColor: `${accent}66` }} aria-label="Favorite app"><Heart className={`size-5 ${isFavorite ? 'fill-current' : ''}`} style={{ color: accent }} /></button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>}
  </AnimatePresence>;
}
