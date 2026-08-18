import { useEffect, useState } from 'react';
import { Link, Route, Switch } from 'wouter';
import Navbar from '@/components/layout/Navbar';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import AdminRoute from '@/components/layout/AdminRoute';
import { useAuth } from '@/contexts/AuthContext';
import HomePage from '@/pages/HomePage';
import Login from '@/pages/login';
import Register from '@/pages/register';
import Orders from '@/pages/orders';
import AdminDashboard from '@/pages/AdminDashboard';

function NotFound() {
  return <div className="flex min-h-screen items-center justify-center bg-background p-6"><div className="w-full max-w-md text-center"><h1 className="mb-4 text-6xl font-bold text-neutral-100">404</h1><p className="mb-8 text-lg text-neutral-400">Page not found</p><Link to="/" className="btn-primary">Back to Cutting Edge Apps</Link></div></div>;
}

function App() {
  const { loading } = useAuth();
  const [theme, setTheme] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('theme') || 'dark' : 'dark');
  useEffect(() => { const root = document.documentElement; if (theme === 'light') { root.classList.add('light'); root.classList.remove('dark'); } else { root.classList.add('dark'); root.classList.remove('light'); } localStorage.setItem('theme', theme); }, [theme]);
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><div className="size-8 animate-spin rounded-full border-2 border-[#ee9d83] border-t-transparent" /></div>;
  return <div className="market-shell"><div className="grain" /><Navbar theme={theme} onToggleTheme={toggleTheme} /><main><Switch><Route path="/" component={HomePage} /><Route path="/orders" component={() => <ProtectedRoute><Orders /></ProtectedRoute>} /><Route path="/admin" component={() => <AdminRoute><AdminDashboard /></AdminRoute>} /><Route path="/login" component={Login} /><Route path="/register" component={Register} /><Route component={NotFound} /></Switch></main></div>;
}

export default App;
