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
    {open && <motion.div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/65 p-4 backdrop-blur-md sm:p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <motion.div className="relative w-full max-w-5xl" initial={{ opacity: 0, y: 45, scale: .94, rotateX: 8 }} animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0, transition: { duration: .65, ease: [0.16, 1, .3, 1] } }} exit={{ opacity: 0, y: 25, scale: .96 }} style={{ perspective: 1600 }}>
        <motion.div className="relative overflow-hidden rounded-[30px] border shadow-[0_40px_120px_rgba(0,0,0,.45)]" style={{ background: light ? '#24201c' : '#0a0d12', borderColor: `${accent}88` }} initial={{ rotateY: -12 }} animate={{ rotateY: 0, transition: { duration: .8, delay: .08 } }}>
          <div className="absolute inset-x-0 top-0 h-1" style={{ background: accent, boxShadow: `0 0 28px ${accent}` }} />
          <div className="grid min-h-[560px] lg:grid-cols-[.8fr_1.2fr]">
            <div className="relative flex items-center justify-center overflow-hidden p-8 sm:p-12" style={{ background: `radial-gradient(circle at 50% 35%, ${accent}32, transparent 58%), ${light ? '#302a24' : '#11161e'}` }}>
              <motion.div className="relative aspect-[.72] w-[230px] rounded-[18px] border-2 shadow-2xl sm:w-[280px]" style={{ background: `linear-gradient(145deg, ${accent}, #15171b 54%, #080a0d)`, borderColor: `${accent}cc`, transformStyle: 'preserve-3d' }} initial={{ rotateY: -26, x: -80, scale: .78 }} animate={{ rotateY: 0, x: 0, scale: 1, transition: { duration: .8, delay: .15, ease: [0.16,1,.3,1] } }}>
                <div className="absolute inset-[10px] rounded-[12px] border border-white/15 bg-black/30 p-5 text-white shadow-inner">
                  <div className="text-[10px] font-semibold uppercase tracking-[.2em] opacity-70">{product.category || 'BUSINESS APP'}</div>
                  <div className="mt-16 text-3xl font-black leading-none sm:text-4xl">{product.name || 'Application'}</div>
                  <div className="mt-4 text-xs leading-5 text-white/75">{product.tagline || 'Built for modern business.'}</div>
                  <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[.16em]"><span>Cutting-Edge Apps</span><span style={{ color: accent }}>SOFTWARE</span></div>
                </div>
                <div className="absolute -right-5 top-8 h-[calc(100%-64px)] w-5 rounded-r-lg border-y border-r border-white/10" style={{ background: '#11151b' }} />
              </motion.div>
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
