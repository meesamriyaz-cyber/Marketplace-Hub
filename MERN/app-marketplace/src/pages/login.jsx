import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function Login() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const user = await login(values.email, values.password);
      toast.success('Welcome back');
      navigate(user?.role === 'admin' || user?.role === 'super_admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center gap-2.5">
          <div className="relative flex size-8 items-center justify-center rounded-full border border-[#d8b985]/70">
            <span className="absolute size-2.5 rounded-full bg-[#ee9d83]" />
            <span className="absolute h-5 w-px rotate-45 bg-[#a9d0b8]" />
          </div>
          <span className="display text-[25px] leading-none tracking-[-.02em] text-foreground">Cutting Edge Apps</span>
        </Link>
        <div className="card-surface p-8 shadow-2xl sm:p-10">
          <div className="eyebrow text-[#a9d0b8]">Welcome back</div>
          <h1 className="display mt-3 text-5xl leading-none text-foreground">Sign in</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Access your collection and orders.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div><label className="mb-2 block text-xs uppercase tracking-[.12em] text-muted-foreground">Email</label><input type="email" {...register('email')} className="input-field" placeholder="you@example.com" />{errors.email && <p className="mt-1.5 text-xs text-[#ee9d83]">{errors.email.message}</p>}</div>
            <div><label className="mb-2 block text-xs uppercase tracking-[.12em] text-muted-foreground">Password</label><input type="password" {...register('password')} className="input-field" placeholder="••••••••" />{errors.password && <p className="mt-1.5 text-xs text-[#ee9d83]">{errors.password.message}</p>}</div>
            <button type="submit" disabled={submitting} className="btn-primary w-full">{submitting ? 'Signing in...' : 'Sign in'} <ArrowRight className="size-4" /></button>
          </form>
          <p className="mt-6 text-center text-xs text-muted-foreground">Don't have an account? <Link to="/register" className="text-[#a9d0b8] hover:underline">Create one</Link></p>
        </div>
      </div>
    </div>
  );
}
