import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, LogOut, Sun, Moon } from 'lucide-react';

const FIRM_LOGO = 'data:image/webp;base64,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';

export default function Navbar({ onToggleTheme, theme }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();

  const { data: cartItems = [] } = useQuery({
    queryKey: ['cart'],
    queryFn: api.cart.get,
    enabled: isAuthenticated,
  });

  const cartCount = Array.isArray(cartItems) ? cartItems.length : 0;

  const handleOpenCart = () => {
    const event = new CustomEvent('open-cart');
    window.dispatchEvent(event);
  };

  const handleOpenContact = () => {
    const event = new CustomEvent('open-contact');
    window.dispatchEvent(event);
  };

  const isHome = location === '/';

  return (
    <header className="sticky top-0 z-40 bg-background backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Cutting Edge Apps home">
          <img src={FIRM_LOGO} alt="Cutting Edge Enterprises" className="size-10 shrink-0 object-contain sm:size-11" />
          <span className="display text-[25px] leading-none tracking-[-.02em] text-foreground">Cutting Edge Apps</span>
        </Link>

        <div className="flex items-center gap-2.5">
          {isAuthenticated && (
            <button type="button" onClick={handleOpenCart} className="relative flex size-10 items-center justify-center rounded-full border border-border-subtle text-neutral-300 transition-colors hover:border-[#ee9d83]" aria-label={`Open shopping bag with ${cartCount} items`}>
              <ShoppingBag className="size-4" />
              {cartCount > 0 && <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-[#ee9d83] text-[9px] font-bold text-neutral-900">{cartCount}</span>}
            </button>
          )}

          <button type="button" onClick={onToggleTheme} className="relative flex size-10 items-center justify-center rounded-full border border-border-subtle text-neutral-300 transition-colors hover:border-[#a9d0b8]" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          <button type="button" onClick={handleOpenContact} className="btn-primary-sm">Need an app?</button>

          {isAuthenticated ? (
            <button type="button" onClick={logout} className="btn-primary-sm flex items-center gap-2">
              <LogOut className="size-3.5" /> Sign out
            </button>
          ) : (
            <Link to="/login" className="btn-primary-sm">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  );
}
