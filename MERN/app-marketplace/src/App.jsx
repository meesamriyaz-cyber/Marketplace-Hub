import { useEffect, useState } from 'react';
import { Route, Switch } from 'wouter';
import Navbar from '@/components/layout/Navbar';
import NotFound from '@/components/layout/NotFound';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import AdminRoute from '@/components/layout/AdminRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import HomePage from '@/pages/HomePage';
import Login from '@/pages/login';
import Register from '@/pages/register';
import Orders from '@/pages/orders';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminProducts from '@/pages/AdminProducts';
import AdminCategories from '@/pages/AdminCategories';
import AdminUsers from '@/pages/AdminUsers';
import AdminReports from '@/pages/AdminReports';
import { useAuth } from '@/contexts/AuthContext';

function AdminPage({ children }) { return <AdminRoute><AdminLayout>{children}</AdminLayout></AdminRoute>; }

export default function App() {
  const { loading } = useAuth();
  const [theme, setTheme] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('theme') || 'dark' : 'dark');
  useEffect(() => { const root = document.documentElement; root.classList.toggle('light', theme === 'light'); root.classList.toggle('dark', theme !== 'light'); localStorage.setItem('theme', theme); }, [theme]);
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><div className="size-8 animate-spin rounded-full border-2 border-[#ee9d83] border-t-transparent" /></div>;
  return <div className="market-shell"><div className="grain" /><Navbar theme={theme} onToggleTheme={() => setTheme(value => value === 'dark' ? 'light' : 'dark')} /><main><Switch>
    <Route path="/" component={HomePage} />
    <Route path="/orders" component={() => <ProtectedRoute><Orders /></ProtectedRoute>} />
    <Route path="/admin" component={() => <AdminPage><AdminDashboard /></AdminPage>} />
    <Route path="/admin/products" component={() => <AdminPage><AdminProducts /></AdminPage>} />
    <Route path="/admin/categories" component={() => <AdminPage><AdminCategories /></AdminPage>} />
    <Route path="/admin/users" component={() => <AdminPage><AdminUsers /></AdminPage>} />
    <Route path="/admin/reports" component={() => <AdminPage><AdminReports /></AdminPage>} />
    <Route path="/login" component={Login} />
    <Route path="/register" component={Register} />
    <Route component={NotFound} />
  </Switch></main></div>;
}
