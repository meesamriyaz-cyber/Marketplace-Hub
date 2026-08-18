import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import Real3DBookshelf from '@/components/hero/Real3DBookshelf';
import MarketplaceOverlays from '@/components/marketplace/MarketplaceOverlays';
import MarketplaceFooter from '@/components/marketplace/MarketplaceFooter';
import RequirementsSection from '@/components/marketplace/RequirementsSection';

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
  const cartTotal = cart.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const toggleFavorite = id => setFavorites(previous => { const next = new Set(previous); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const handleAddToCart = async product => { if (!isAuthenticated) { toast.error('Please sign in to add items to cart'); return; } await addToCartMutation.mutateAsync({ productId: product._id || product.id, quantity: 1 }); setSelected(null); setCartOpen(true); };
  const handleCheckout = () => { setCartOpen(false); setCheckoutOpen(true); };

  return <>
    <Real3DBookshelf products={products} onSelect={setSelected} />
    <RequirementsSection />
    <MarketplaceFooter />
    <MarketplaceOverlays selected={selected} cartOpen={cartOpen} checkoutOpen={checkoutOpen} cart={cart} total={cartTotal} light={theme} favorites={favorites} onCloseProduct={() => setSelected(null)} onFavorite={() => toggleFavorite(selected?.id || selected?._id)} onAddToCart={() => handleAddToCart(selected)} onCloseCart={() => setCartOpen(false)} onRemove={id => removeFromCartMutation.mutate(id)} onCheckout={handleCheckout} onCloseCheckout={() => setCheckoutOpen(false)} />
  </>;
}
