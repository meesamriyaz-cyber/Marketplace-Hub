import { Link, useLocation } from 'wouter';
import { BarChart3, LayoutDashboard, LogOut, Package, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
];

export default function AdminLayout({ children }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border bg-surface">
      <div className="section-container flex min-h-16 items-center justify-between gap-4 py-3">
        <Link href="/admin" className="flex items-center gap-3">
          <img src="/logo.png" alt="Cutting Edge Apps" className="size-9 object-contain" />
          <div><div className="font-semibold">Cutting Edge Apps</div><div className="text-xs text-muted-foreground">Admin Console</div></div>
        </Link>
        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block"><div className="text-sm font-medium">{user?.name}</div><div className="text-xs text-muted-foreground">{user?.role}</div></div>
          <button type="button" onClick={logout} className="btn-ghost" title="Sign out"><LogOut className="size-4" /><span className="hidden sm:inline">Sign out</span></button>
        </div>
      </div>
    </header>
    <div className="section-container flex flex-col gap-8 py-8 lg:flex-row">
      <aside className="w-full shrink-0 lg:w-56">
        <nav className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = location === href || (href !== '/admin' && location.startsWith(`${href}/`));
            return <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${active ? 'bg-[#e9c878]/10 text-foreground' : 'text-muted-foreground hover:bg-surface hover:text-foreground'}`}><Icon className="size-4" />{label}</Link>;
          })}
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-surface hover:text-foreground">View marketplace</Link>
        </nav>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  </div>;
}
