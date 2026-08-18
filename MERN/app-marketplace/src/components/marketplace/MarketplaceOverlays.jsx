import { AnimatePresence } from 'framer-motion';
import AppPackageReveal from '@/components/hero/AppPackageReveal';
import CartDrawer from '@/components/commerce/CartDrawer';
import CheckoutModal from '@/components/commerce/CheckoutModal';

export default function MarketplaceOverlays({ selected, cartOpen, checkoutOpen, cart, total, light, favorites, onCloseProduct, onFavorite, onAddToCart, onCloseCart, onRemove, onCheckout, onCloseCheckout }) {
  const selectedId = selected?.id || selected?._id;
  return <>
    <AnimatePresence>{selected && <AppPackageReveal product={selected} open light={light} onClose={onCloseProduct} isFavorite={favorites.has(selectedId)} onFavorite={onFavorite} onAddToCart={onAddToCart} />}</AnimatePresence>
    <AnimatePresence>{cartOpen && <CartDrawer cart={cart} onClose={onCloseCart} onRemove={onRemove} onCheckout={onCheckout} />}</AnimatePresence>
    <AnimatePresence>{checkoutOpen && <CheckoutModal total={total} onClose={onCloseCheckout} />}</AnimatePresence>
  </>;
}
