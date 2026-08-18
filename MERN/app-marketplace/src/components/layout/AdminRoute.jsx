import { Redirect } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><div className="size-8 animate-spin rounded-full border-2 border-[#ee9d83] border-t-transparent" /></div>;
  if (!user) return <Redirect to="/login" />;
  if (!['admin', 'super_admin'].includes(user.role)) return <Redirect to="/" />;
  return children;
}
