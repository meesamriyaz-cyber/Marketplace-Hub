import { Redirect } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="size-8 animate-spin rounded-full border-2 border-[#ee9d83] border-t-transparent" /></div>;
  if (!isAuthenticated) return <Redirect to="/login" />;
  if (!['admin', 'super_admin'].includes(user?.role)) return <Redirect to="/" />;
  return children;
}
