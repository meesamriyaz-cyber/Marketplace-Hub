import { useEffect, useState } from 'react';
import { Link, Route, Switch } from 'wouter';
import Navbar from '@/components/layout/Navbar';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import AdminRoute from '@/components/layout/AdminRoute';
import Login from '@/pages/login';
import Register from '@/pages/register';
import Orders from '@/pages/orders';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminProducts from '@/pages/AdminProducts';
import { useAuth } from '@/contexts/AuthContext';

function HomePage() {
  return <div className="min-h-screen bg-background text-foreground"><div className="section-container flex min-h-[70vh] items-center justify-center"><div className="text-center"><h1 className="display text-6xl">Cutting Edge Apps</h1><p className="mt-4 text-muted-foreground">Business apps that work everywhere.</p></div></div></div>;
}

function NotFound() { return <div className="flex min-h-screen items-center justify-center bg-background p-6"><div className="text-center"><h1 className="display text-6xl">404</h1><p className="mt-3 text-muted-foreground">Page not found</p><Link to="/" className="btn-primary mt-6">Back to Cutting Edge Apps</Link></div></div>; }

export default function App() {
  const { loading } = useAuth();
  const [theme, setTheme] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('theme') || 'dark' : 'dark');
  useEffect(() => { const root = document.documentElement; root.classList.toggle('light', theme === 'light'); root.classList.toggle('dark', theme !== 'light'); localStorage.setItem('theme', theme); }, [theme]);
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><div className="size-8 animate-spin rounded-full border-2 border-[#ee9d83] border-t-transparent" /></div>;
  return <div className="market-shell"><div className="grain" /><Navbar theme={theme} onToggleTheme={() => setTheme((value) => value === 'dark' ? 'light' : 'dark')} /><main><Switch>
    <Route path="/" component={HomePage} />
    <Route path="/orders" component={() => <ProtectedRoute><Orders /></ProtectedRoute>} />
    <Route path="/admin" component={() => <AdminRoute><AdminDashboard /></AdminRoute>} />
    <Route path="/admin/products" component={() => <AdminRoute><AdminProducts /></AdminRoute>} />
    <Route path="/login" component={Login} />
    <Route path="/register" component={Register} />
    <Route component={NotFound} />
  </Switch></main></div>;
}
