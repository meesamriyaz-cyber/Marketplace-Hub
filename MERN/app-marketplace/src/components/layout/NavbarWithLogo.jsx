import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, LogOut, Sun, Moon } from 'lucide-react';

const FIRM_LOGO = '/cutting-edge-enterprises-logo.svg';

export default function NavbarWithLogo({ onToggleTheme, theme }) {
  const { isAuthenticated, logout } = useAuth();
  const { data: cartItems = [] } = useQuery({ queryKey: ['cart'], queryFn: api.cart.get, enabled: isAuthenticated });
  const cartCount = Array.isArray(cartItems) ? cartItems.length : 0;
  const handleOpenCart = () => window.dispatchEvent(new CustomEvent('open-cart'));
  const handleOpenContact = () => window.dispatchEvent(new CustomEvent('open-contact'));

  return (
    <header className="sticky top-0 z-40 bg-background backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Cutting Edge Apps home">
          <img src={FIRM_LOGO} alt="Cutting Edge Enterprises" className="size-10 shrink-0 object-contain sm:size-11" />
          <span className="display text-[25px] leading-none tracking-[-.02em] text-foreground">Cutting Edge Apps</span>
        </Link>
        <div className="flex items-center gap-2.5">
          {isAuthenticated && <button type="button" onClick={handleOpenCart} className="relative flex size-10 items-center justify-center rounded-full border border-border-subtle text-neutral-300 transition-colors hover:border-[#ee9d83]" aria-label={`Open shopping bag with ${cartCount} items`}><ShoppingBag className="size-4" />{cartCount > 0 && <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-[#ee9d83] text-[9px] font-bold text-neutral-900">{cartCount}</span>}</button>}
          <button type="button" onClick={onToggleTheme} className="relative flex size-10 items-center justify-center rounded-full border border-border-subtle text-neutral-300 transition-colors hover:border-[#a9d0b8]" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>{theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}</button>
          <button type="button" onClick={handleOpenContact} className="btn-primary-sm">Need an app?</button>
          {isAuthenticated ? <button type="button" onClick={logout} className="btn-primary-sm flex items-center gap-2"><LogOut className="size-3.5" /> Sign out</button> : <Link to="/login" className="btn-primary-sm">Sign in</Link>}
        </div>
      </div>
    </header>
  );
}
