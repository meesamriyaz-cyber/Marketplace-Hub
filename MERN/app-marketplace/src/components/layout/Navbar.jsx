import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, LogOut, Sun, Moon } from 'lucide-react';

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
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Cutting Edge Apps home">
          <div className="relative flex size-8 items-center justify-center rounded-full border border-[#d8b985]/70">
            <span className="absolute size-2.5 rounded-full bg-[#ee9d83]" />
            <span className="absolute h-5 w-px rotate-45 bg-[#a9d0b8]" />
          </div>
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
