import { Heart, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import Rating from './Rating';
import ProductArtwork from './ProductArtwork';

export default function ProductCard({ product, favorite, onFavorite, onOpen, onAdd }) {
  return <motion.article layout initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: .4 }} className="group cursor-pointer" onClick={onOpen} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onOpen(); }} tabIndex={0}>
    <div className="relative overflow-hidden rounded-[20px] border border-border-subtle bg-surface shadow-[0_10px_28px_rgba(0,0,0,.16)] transition-transform duration-500 group-hover:-translate-y-1">
      <ProductArtwork product={product} />
      {product.badge && <span className="absolute left-4 top-4 rounded-full bg-[#f1c977] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.12em] text-foreground">{product.badge}</span>}
      <button type="button" onClick={(event) => { event.stopPropagation(); onFavorite(); }} className={`absolute right-4 top-4 flex size-9 items-center justify-center rounded-full border backdrop-blur-md transition-colors ${favorite ? 'border-[#ee9d83] bg-[#ee9d83] text-foreground' : 'border-border bg-card text-foreground hover:bg-white/10'}`} aria-label={favorite ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}><Heart className={`size-4 ${favorite ? 'fill-current' : ''}`} /></button>
    </div>
    <div className="mt-4 flex items-start justify-between gap-3 px-1"><div><div className="flex items-center gap-2"><h3 className="display text-[25px] leading-none text-foreground">{product.name}</h3><span className="mt-0.5 rounded-full border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-[.12em] text-muted-foreground">{product.category}</span></div><p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{product.tagline}</p><div className="mt-3 flex items-center gap-3"><Rating value={product.rating} reviews={product.reviews} /><span className="text-neutral-600">·</span><span className="text-[12px] text-muted-foreground">{product.creator}</span></div></div><div className="flex shrink-0 flex-col items-end gap-2"><span className="mono text-[13px] text-[#e9c878]">₹{Number(product.price || 0).toLocaleString('en-IN')}</span><button type="button" onClick={(event) => { event.stopPropagation(); onAdd(); }} className="flex size-8 items-center justify-center rounded-full border border-neutral-800 text-neutral-300 transition-colors hover:border-[#a9d0b8] hover:bg-[#a9d0b8] hover:text-neutral-900" aria-label={`Add ${product.name} to cart`}><Plus className="size-4" /></button></div></div>
  </motion.article>;
}
