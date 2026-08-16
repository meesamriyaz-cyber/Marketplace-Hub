import { useState, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Command, Heart, LockKeyhole, Orbit, Plus, Search, ShoppingBag, SlidersHorizontal, Star, Trash2, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Real3DBookshelf from '@/components/hero/Real3DBookshelf';
import ContactOverlay from '@/components/sections/ContactOverlay';
import { loadRazorpayScript } from '@/lib/razorpay';
import { Link, Route, Switch } from 'wouter';
import { toast } from 'sonner';
import Login from '@/pages/login';
import Register from '@/pages/register';
import Orders from '@/pages/orders';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

function Rating({ value = 0, reviews = 0 }) {
  return (
    <span className="flex items-center gap-1.5 text-[12px] text-neutral-400">
      <Star className="size-3.5 fill-[#e9c878] text-[#e9c878]" />
      <span>{Number(value).toFixed(1)}</span>
      <span className="text-neutral-500">({reviews})</span>
    </span>
  );
}

function ProductArtwork({ product, large = false }) {
  const key = product.name?.toLowerCase();
  return (
    <div className={`product-art ${product.art || 'art-default'} ${large ? 'product-art-large' : ''}`} style={{ '--product-accent': product.accent }}>
      <div className="art-noise" />
      {key === 'lumen' && <><div className="lumen-orbit orbit-one" /><div className="lumen-orbit orbit-two" /><div className="lumen-core" /></>}
      {key === 'kairo' && <><div className="kairo-sun" /><div className="kairo-line line-one" /><div className="kairo-line line-two" /><div className="kairo-line line-three" /></>}
      {key === 'drift' && <><div className="drift-grid" /><div className="drift-wave wave-one" /><div className="drift-wave wave-two" /><div className="drift-dot" /></>}
      {key === 'arc' && <><div className="arc-ring ring-one" /><div className="arc-ring ring-two" /><div className="arc-spark" /></>}
      <span className="absolute bottom-4 left-5 font-mono text-[10px] uppercase tracking-[.22em] text-white/60">{product.name} / {product.category}</span>
    </div>
  );
}

function ProductCard({ product, favorite, onFavorite, onOpen, onAdd }) {
  return (
    <motion.article layout initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.4 }} className="group cursor-pointer" onClick={onOpen} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onOpen(); }} tabIndex={0}>
      <div className="relative overflow-hidden rounded-[20px] border border-border-subtle bg-surface shadow-[0_10px_28px_rgba(0,0,0,.16)] transition-transform duration-500 group-hover:-translate-y-1">
        <ProductArtwork product={product} />
        {product.badge && <span className="absolute left-4 top-4 rounded-full bg-[#f1c977] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.12em] text-foreground">{product.badge}</span>}
        <button type="button" onClick={(event) => { event.stopPropagation(); onFavorite(); }} className={`absolute right-4 top-4 flex size-9 items-center justify-center rounded-full border backdrop-blur-md transition-colors ${favorite ? 'border-[#ee9d83] bg-[#ee9d83] text-foreground' : 'border-border bg-card text-foreground hover:bg-white/10'}`} aria-label={favorite ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}>
          <Heart className={`size-4 ${favorite ? 'fill-current' : ''}`} />
        </button>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3 px-1">
        <div>
          <div className="flex items-center gap-2"><h3 className="display text-[25px] leading-none text-foreground">{product.name}</h3><span className="mt-0.5 rounded-full border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-[.12em] text-muted-foreground">{product.category}</span></div>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{product.tagline}</p>
          <div className="mt-3 flex items-center gap-3"><Rating value={product.rating} reviews={product.reviews} /><span className="text-neutral-600">·</span><span className="text-[12px] text-muted-foreground">{product.creator}</span></div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2"><span className="mono text-[13px] text-[#e9c878]">₹{Number(product.price || 0).toLocaleString('en-IN')}</span><button type="button" onClick={(event) => { event.stopPropagation(); onAdd(); }} className="flex size-8 items-center justify-center rounded-full border border-neutral-800 text-neutral-300 transition-colors hover:border-[#a9d0b8] hover:bg-[#a9d0b8] hover:text-neutral-900" aria-label={`Add ${product.name} to cart`}><Plus className="size-4" /></button></div>
      </div>
    </motion.article>
  );
}

function DetailModal({ product, favorite, onClose, onFavorite, onAdd }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={`${product.name} details`} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, y: 22, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }} className="relative max-h-[calc(100dvh-32px)] w-full max-w-4xl overflow-y-auto rounded-[28px] border border-border-subtle bg-surface shadow-[0_24px_100px_rgba(0,0,0,.55)] quiet-scrollbar">
        <button type="button" onClick={onClose} className="absolute right-5 top-5 z-10 flex size-10 items-center justify-center rounded-full border border-white/10 bg-surface/65 text-neutral-100 backdrop-blur hover:bg-white/10" aria-label="Close product details"><X className="size-4" /></button>
        <div className="grid md:grid-cols-[.92fr_1.08fr]">
          <ProductArtwork product={product} large />
          <div className="p-7 sm:p-10">
            <div className="eyebrow">{product.category} · {product.install}</div>
            <h2 className="display mt-4 text-6xl leading-[.82] text-foreground sm:text-8xl">{product.name}</h2>
            <p className="mt-5 text-xl leading-snug text-muted-foreground">{product.tagline}</p>
            <div className="mt-5 flex items-center gap-4"><Rating value={product.rating} reviews={product.reviews} /><span className="text-[12px] text-muted-foreground">by {product.creator}</span></div>
            <p className="mt-8 text-[14px] leading-7 text-muted-foreground">{product.description}</p>
            <div className="my-8 h-px bg-neutral-800" />
            <div className="space-y-4"><div className="eyebrow">What you get</div>{(product.features || []).map((feature) => <div className="flex gap-3 text-[13px] text-muted-foreground" key={feature}><Check className="mt-0.5 size-4 shrink-0 text-[#a9d0b8]" />{feature}</div>)}</div>
            <div className="mt-9 flex flex-wrap items-center gap-3"><button type="button" onClick={onAdd} className="btn-primary flex h-12 flex-1 sm:flex-none">Add to cart <ArrowRight className="size-4" /></button><button type="button" onClick={onFavorite} className={`btn-ghost ${favorite ? 'border-[#ee9d83] text-[#ee9d83]' : ''}`}><Heart className={`size-4 ${favorite ? 'fill-current' : ''}`} /> {favorite ? 'Saved' : 'Save'}</button></div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CartDrawer({ cart, onClose, onRemove, onCheckout }) {
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  return (
    <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label="Shopping bag">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 250 }} className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-border-subtle bg-surface shadow-[-20px_0_80px_rgba(0,0,0,.35)]">
        <div className="flex items-center justify-between border-b border-border px-6 py-5"><div><div className="eyebrow">Your collection</div><h2 className="display mt-1 text-3xl text-foreground">Shopping bag</h2></div><button type="button" onClick={onClose} className="flex size-9 items-center justify-center rounded-full border border-border hover:bg-white/10" aria-label="Close shopping bag"><X className="size-4" /></button></div>
        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center"><div className="mb-5 flex size-16 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground"><ShoppingBag className="size-6" /></div><h3 className="display text-3xl text-foreground">A little more room.</h3><p className="mt-3 max-w-[240px] text-sm leading-6 text-muted-foreground">Your bag is empty. The good stuff is just below.</p><button type="button" onClick={onClose} className="btn-ghost mt-7">Browse apps</button></div>
        ) : (
          <><div className="quiet-scrollbar flex-1 space-y-4 overflow-y-auto p-6">{cart.map((item) => <div key={item.id} className="flex gap-4 border-b border-border pb-4"><div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl"><ProductArtwork product={item} /></div><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><h3 className="display text-2xl text-foreground">{item.name}</h3><span className="mono text-xs text-[#e9c878]">₹{Number(item.price || 0).toLocaleString('en-IN')}</span></div><p className="mt-1 truncate text-xs text-muted-foreground">{item.creator}</p><button type="button" onClick={() => onRemove(item.id)} className="mt-3 flex items-center gap-1.5 text-[11px] uppercase tracking-[.12em] text-[#ee9d83]"><Trash2 className="size-3" /> Remove</button></div></div>)}</div><div className="border-t border-border p-6"><div className="flex items-center justify-between text-sm text-muted-foreground"><span>Subtotal</span><span className="mono text-foreground">₹{Number(total || 0).toLocaleString('en-IN')}</span></div><p className="mt-3 text-[11px] leading-5 text-muted-foreground">One-time purchase · instant download · updates included</p><button type="button" onClick={onCheckout} className="btn-primary mt-6 w-full">Continue to checkout <ArrowRight className="size-4" /></button></div></>
        )}
      </motion.aside>
    </motion.div>
  );
}

function CheckoutModal({ total, onClose }) {
  const [submitted, setSubmitted] = useState(false); const [notConfigured, setNotConfigured] = useState(false); const [processing, setProcessing] = useState(false); const [order, setOrder] = useState(null); const { isAuthenticated, user } = useAuth(); const queryClient = useQueryClient();
  const createOrder = useMutation({ mutationFn: api.orders.create, onSuccess: (data) => { setOrder(data); queryClient.invalidateQueries({ queryKey: ['cart'] }); queryClient.invalidateQueries({ queryKey: ['orders'] }); } });
  const ensureOrder = async () => order || (await createOrder.mutateAsync());
  const handlePayWithRazorpay = async () => {
    if (!isAuthenticated) { toast.error('Please sign in to checkout'); return; }
    setProcessing(true);
    try { const currentOrder = await ensureOrder(); const payment = await api.payments.createOrder(currentOrder._id); const scriptReady = await loadRazorpayScript(); if (!scriptReady || !window.Razorpay) { toast.error('Could not load the payment gateway. Please try again.'); setProcessing(false); return; }
      const razorpay = new window.Razorpay({ key: payment.keyId, amount: payment.amount, currency: payment.currency, name: 'Cutting Edge Apps', description: 'App marketplace purchase', order_id: payment.razorpayOrderId, prefill: { name: user?.name, email: user?.email }, theme: { color: '#ee9d83' }, handler: async (response) => { try { await api.payments.verify({ orderId: currentOrder._id, razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature }); setSubmitted(true); toast.success('Payment successful'); } catch (err) { toast.error(err.message || 'Payment verification failed'); } finally { setProcessing(false); } }, modal: { ondismiss: () => setProcessing(false) } });
      razorpay.on('payment.failed', () => { toast.error('Payment failed. Please try again.'); setProcessing(false); }); razorpay.open();
    } catch (err) { if (err.status === 503) { setNotConfigured(true); setProcessing(false); } else { toast.error(err.message || 'Checkout failed'); setProcessing(false); } }
  };
  const handleSimulatePurchase = async () => { setProcessing(true); try { await ensureOrder(); setSubmitted(true); toast.success('Order placed successfully'); } catch (err) { toast.error(err.message || 'Checkout failed'); } finally { setProcessing(false); } };
  return <motion.div className="fixed inset-0 z-[60] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label="Checkout"><div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} /><motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-lg rounded-[26px] border border-border-subtle bg-surface p-7 shadow-[0_24px_90px_rgba(0,0,0,.5)] sm:p-9"><button type="button" onClick={onClose} className="absolute right-5 top-5 flex size-9 items-center justify-center rounded-full border border-neutral-800 hover:bg-white/10" aria-label="Close checkout"><X className="size-4" /></button>{!submitted ? <><div className="eyebrow text-[#a9d0b8]">Almost yours</div><h2 className="display mt-3 text-5xl leading-none text-foreground">Make it real.</h2><p className="mt-4 text-sm leading-6 text-muted-foreground">Secure checkout powered by Razorpay.</p><div className="mt-7 rounded-2xl border border-border bg-surface-raised p-4"><div className="flex items-center justify-between text-sm"><span className="text-foreground">Selected apps</span><span className="mono text-[#e9c878]">₹{Number(total || 0).toLocaleString('en-IN')}</span></div><div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground"><LockKeyhole className="size-3.5 text-[#a9d0b8]" /> Encrypted, PCI-compliant checkout</div></div>{!notConfigured ? <button type="button" onClick={handlePayWithRazorpay} disabled={processing || createOrder.isPending} className="btn-primary mt-6 w-full">{processing ? 'Processing...' : 'Pay with Razorpay'} <ArrowRight className="size-4" /></button> : <div className="mt-6 space-y-3"><p className="rounded-xl border border-dashed border-border bg-surface-raised/60 px-4 py-3 text-[12px] leading-5 text-muted-foreground">Razorpay is not connected for this store yet. Add the gateway credentials to the server environment before accepting live payments.</p><button type="button" onClick={handleSimulatePurchase} disabled={processing} className="btn-primary w-full">{processing ? 'Processing...' : 'Preview purchase (test mode)'} <ArrowRight className="size-4" /></button></div>}</> : <div className="py-8 text-center"><div className="mx-auto flex size-16 items-center justify-center rounded-full border border-[#7ea890] text-[#a9d0b8]"><Check className="size-7" /></div><h2 className="display mt-6 text-5xl text-foreground">Good things ahead.</h2><p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-muted-foreground">{notConfigured ? 'Your order is recorded as pending. Payment is not connected yet, so nothing was charged.' : 'Your order is confirmed. A receipt has been sent to your email.'}</p><button type="button" onClick={onClose} className="btn-ghost mt-7">Back to Cutting Edge Apps</button></div>}</motion.div></motion.div>;
}

const categories = ['All', 'Creative', 'Focus', 'Finance', 'Utilities'];

function HomePage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [favorites, setFavorites] = useState(new Set());
  const [selected, setSelected] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [contactOverlayOpen, setContactOverlayOpen] = useState(false);
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  useEffect(() => { const handler = () => setCartOpen(true); window.addEventListener('open-cart', handler); return () => window.removeEventListener('open-cart', handler); }, []);
  useEffect(() => { const handler = () => setContactOverlayOpen(true); window.addEventListener('open-contact', handler); return () => window.removeEventListener('open-contact', handler); }, []);
  const { data: products = [], isLoading } = useQuery({ queryKey: ['products'], queryFn: api.products.list });
  const { data: cartItems = [] } = useQuery({ queryKey: ['cart'], queryFn: api.cart.get, enabled: isAuthenticated });
  const addToCartMutation = useMutation({ mutationFn: api.cart.add, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['cart'] }); toast.success('Added to cart'); }, onError: (err) => toast.error(err.message || 'Failed to add to cart') });
  const removeFromCartMutation = useMutation({ mutationFn: api.cart.remove, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }), onError: (err) => toast.error(err.message || 'Failed to remove item') });
  const cart = Array.isArray(cartItems) ? cartItems : [];
  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);
  const filtered = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    return list.filter((product) => {
      const haystack = `${product.name} ${product.tagline} ${product.creator} ${product.category}`.toLowerCase();
      return haystack.includes(query.toLowerCase()) && (category === 'All' || product.category === category);
    });
  }, [products, query, category]);
  const toggleFavorite = (id) => setFavorites((previous) => { const next = new Set(previous); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const handleAddToCart = async (product) => { if (!isAuthenticated) { toast.error('Please sign in to add items to cart'); return; } await addToCartMutation.mutateAsync({ productId: product._id || product.id, quantity: 1 }); setSelected(null); setCartOpen(true); };
  const handleCheckout = () => { setCartOpen(false); setCheckoutOpen(true); };

  return (
    <>
      <Real3DBookshelf products={products} onSelect={setSelected} />

      <section id="catalog" className="section-container relative pb-24 pt-16 sm:pt-20">
        <div className="mb-8 flex flex-col justify-between gap-5 border-t border-border pt-7 sm:flex-row sm:items-end">
          <div><div className="eyebrow text-[#a9d0b8]">The marketplace</div><h2 className="display mt-2 text-5xl leading-none text-foreground sm:text-6xl">Find the right app.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Search the full catalogue, compare what matters, and choose software built for the job.</p></div>
          <div className="flex items-center gap-2 text-xs text-neutral-500"><Orbit className="size-3.5 text-[#e9c878]" /> {filtered.length} of {products.length} apps</div>
        </div>

        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="quiet-scrollbar flex max-w-full gap-2 overflow-x-auto pb-1">{categories.map((item) => <button type="button" key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full border px-4 py-2 text-[11px] uppercase tracking-[.1em] transition-colors ${category === item ? 'border-[#a9d0b8] bg-[#a9d0b8] text-foreground' : 'border-border text-muted-foreground hover:border-[#a9d0b8] hover:text-foreground'}`} aria-pressed={category === item}>{item}</button>)}</div>
          <label className="flex h-11 w-full items-center gap-3 rounded-full border border-border bg-surface-raised px-4 text-sm text-muted-foreground focus-within:border-[#ee9d83] lg:max-w-[320px]"><Search className="size-4" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search apps, creators..." className="w-full bg-transparent text-sm outline-none" aria-label="Search apps and creators" />{query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search"><X className="size-3.5" /></button>}<Command className="hidden size-3.5 sm:block" /></label>
        </div>

        {isLoading ? <div className="flex min-h-[310px] items-center justify-center"><div className="size-8 animate-spin rounded-full border-2 border-[#ee9d83] border-t-transparent" /></div> : <AnimatePresence mode="popLayout">{filtered.length > 0 ? <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">{filtered.map((product) => <ProductCard key={product._id || product.id} product={{ ...product, id: product._id || product.id }} favorite={favorites.has(product.id || product._id)} onFavorite={() => toggleFavorite(product.id || product._id)} onOpen={() => setSelected(product)} onAdd={() => handleAddToCart(product)} />)}</div> : <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[310px] flex-col items-center justify-center rounded-[24px] border border-dashed border-border bg-surface/50 px-6 text-center"><SlidersHorizontal className="size-6 text-[#a9d0b8]" /><h3 className="display mt-5 text-4xl text-foreground">Nothing quite like that.</h3><p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">Try a different phrase or clear your filters.</p><button type="button" onClick={() => { setQuery(''); setCategory('All'); }} className="btn-ghost mt-6">Clear filters</button></motion.div>}</AnimatePresence>}
      </section>

      <section id="requirements" className="border-y border-border bg-surface-raised/35">
        <div className="section-container py-20 sm:py-24">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
            <div><div className="eyebrow text-[#e9c878]">Need something specific?</div><h2 className="display mt-3 max-w-3xl text-5xl leading-[.92] text-foreground sm:text-6xl">Tell us what your business needs.</h2><p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">If you cannot find the right application, send us your requirement. We can help identify, customise, or build a solution around your workflow.</p></div>
            <div className="rounded-[24px] border border-border bg-surface p-7 shadow-[0_18px_60px_rgba(0,0,0,.16)]"><div className="space-y-4 text-sm text-muted-foreground"><div className="flex gap-3"><Check className="mt-0.5 size-4 shrink-0 text-[#a9d0b8]" />Explain the workflow or problem you want to solve.</div><div className="flex gap-3"><Check className="mt-0.5 size-4 shrink-0 text-[#a9d0b8]" />Tell us about integrations, users, or constraints.</div><div className="flex gap-3"><Check className="mt-0.5 size-4 shrink-0 text-[#a9d0b8]" />Get a practical recommendation instead of browsing endlessly.</div></div><button type="button" onClick={() => setContactOverlayOpen(true)} className="btn-primary mt-7 w-full">Submit your requirement <ArrowRight className="size-4" /></button></div>
          </div>
        </div>
      </section>

      <AnimatePresence>{selected && <DetailModal product={selected} favorite={favorites.has(selected.id || selected._id)} onClose={() => setSelected(null)} onFavorite={() => toggleFavorite(selected.id || selected._id)} onAdd={() => handleAddToCart(selected)} />}</AnimatePresence>
      <AnimatePresence>{cartOpen && <CartDrawer cart={cart} onClose={() => setCartOpen(false)} onRemove={(id) => removeFromCartMutation.mutate(id)} onCheckout={handleCheckout} />}</AnimatePresence>
      <AnimatePresence>{checkoutOpen && <CheckoutModal total={cartTotal} onClose={() => setCheckoutOpen(false)} />}</AnimatePresence>
      <AnimatePresence>{contactOverlayOpen && <ContactOverlay open={contactOverlayOpen} onClose={() => setContactOverlayOpen(false)} />}</AnimatePresence>
    </>
  );
}

function App() {
  const { loading } = useAuth();
  const [theme, setTheme] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('theme') || 'dark' : 'dark');
  useEffect(() => { const root = document.documentElement; if (theme === 'light') { root.classList.add('light'); root.classList.remove('dark'); } else { root.classList.add('dark'); root.classList.remove('light'); } localStorage.setItem('theme', theme); }, [theme]);
  const toggleTheme = () => setTheme((t) => t === 'dark' ? 'light' : 'dark');
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><div className="size-8 animate-spin rounded-full border-2 border-[#ee9d83] border-t-transparent" /></div>;
  return <div className="market-shell"><div className="grain" /><Navbar theme={theme} onToggleTheme={toggleTheme} /><main><Switch><Route path="/" component={HomePage} /><Route path="/orders" component={() => <ProtectedRoute><Orders /></ProtectedRoute>} /><Route path="/login" component={Login} /><Route path="/register" component={Register} /><Route component={() => <div className="flex min-h-screen items-center justify-center bg-background p-6"><div className="w-full max-w-md text-center"><h1 className="mb-4 text-6xl font-bold text-neutral-100">404</h1><p className="mb-8 text-lg text-neutral-400">Page not found</p><Link to="/" className="btn-primary">Back to Cutting Edge Apps</Link></div></div>} /></Switch></main><Footer /></div>;
}

export default App;
