import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Check, LockKeyhole } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import Real3DBookshelf from '@/components/hero/Real3DBookshelf';
import AppPackageReveal from '@/components/hero/AppPackageReveal';
import CartDrawer from '@/components/commerce/CartDrawer';
import CheckoutModal from '@/components/commerce/CheckoutModal';
import ContactForm from '@/components/requirements/ContactForm';

export default function HomePage() {
  const [favorites, setFavorites] = useState(new Set());
  const [selected, setSelected] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [theme, setTheme] = useState(() => typeof document !== 'undefined' && document.documentElement.classList.contains('light'));

  useEffect(() => { const root = document.documentElement; const observer = new MutationObserver(() => setTheme(root.classList.contains('light'))); observer.observe(root, { attributes: true, attributeFilter: ['class'] }); return () => observer.disconnect(); }, []);
  useEffect(() => { const handler = () => document.getElementById('requirements')?.scrollIntoView({ behavior: 'smooth' }); window.addEventListener('open-contact', handler); return () => window.removeEventListener('open-contact', handler); }, []);
  useEffect(() => { const handler = () => setCartOpen(true); window.addEventListener('open-cart', handler); return () => window.removeEventListener('open-cart', handler); }, []);

  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: api.products.list });
  const { data: cartItems = [] } = useQuery({ queryKey: ['cart'], queryFn: api.cart.get, enabled: isAuthenticated });
  const addToCartMutation = useMutation({ mutationFn: api.cart.add, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['cart'] }); toast.success('Added to cart'); }, onError: (err) => toast.error(err.message || 'Failed to add to cart') });
  const removeFromCartMutation = useMutation({ mutationFn: api.cart.remove, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }) });
  const cart = Array.isArray(cartItems) ? cartItems : [];
  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);
  const toggleFavorite = id => setFavorites(previous => { const next = new Set(previous); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const handleAddToCart = async product => { if (!isAuthenticated) { toast.error('Please sign in to add items to cart'); return; } await addToCartMutation.mutateAsync({ productId: product._id || product.id, quantity: 1 }); setSelected(null); setCartOpen(true); };
  const handleCheckout = () => { setCartOpen(false); setCheckoutOpen(true); };

  return <>
    <Real3DBookshelf products={products} onSelect={setSelected} />
    <section id="requirements" className="min-h-[100svh] bg-background"><div className="section-container flex min-h-[100svh] items-center py-16 sm:py-20"><div className="grid w-full items-center gap-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-16"><div><div className="eyebrow text-[#e9c878]">Need something specific?</div><h2 className="display mt-3 max-w-xl text-5xl leading-[.92] text-foreground sm:text-6xl">Tell us what your business needs.</h2><p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">Cannot find the right application? Tell us what you need. We can identify, customise, or build a practical solution around your workflow.</p><div className="mt-7 space-y-3 text-sm text-muted-foreground"><div className="flex gap-3"><Check className="mt-0.5 size-4 shrink-0 text-[#a9d0b8]" />Explain the workflow or problem.</div><div className="flex gap-3"><Check className="mt-0.5 size-4 shrink-0 text-[#a9d0b8] />Share integrations, users, or constraints.</div><div className="flex gap-3"><Check className="mt-0.5 size-4 shrink-0 text-[#a9d0b8] />Get a recommendation instead of browsing endlessly.</div></div></div><ContactForm /></div></div></section>
    <footer className="border-t border-border bg-background"><div className="section-container flex min-h-[52px] items-center justify-between gap-4 py-3 text-[11px] text-muted-foreground"><span>© 2026 Cutting-Edge Enterprises. All rights reserved.</span><span className="flex items-center gap-2"><LockKeyhole className="size-3.5 text-[#a9d0b8]" /><span>Secure payments</span></span></div></footer>
    <AnimatePresence>{selected && <AppPackageReveal product={selected} open={Boolean(selected)} light={theme} onClose={() => setSelected(null)} isFavorite={favorites.has(selected.id || selected._id)} onFavorite={() => toggleFavorite(selected.id || selected._id)} onAddToCart={() => handleAddToCart(selected)} />}</AnimatePresence>
    <AnimatePresence>{cartOpen && <CartDrawer cart={cart} onClose={() => setCartOpen(false)} onRemove={id => removeFromCartMutation.mutate(id)} onCheckout={handleCheckout} />}</AnimatePresence>
    <AnimatePresence>{checkoutOpen && <CheckoutModal total={cartTotal} onClose={() => setCheckoutOpen(false)} />}</AnimatePresence>
  </>;
}
