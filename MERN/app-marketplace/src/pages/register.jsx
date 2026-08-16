import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { toast } from 'sonner';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function Register() {
  const { register: registerUser } = useAuth();
  const [, navigate] = useLocation();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await registerUser(values.name, values.email, values.password);
      toast.success('Account created');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
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
          <div className="eyebrow text-[#a9d0b8]">Join the shelf</div>
          <h1 className="display mt-3 text-5xl leading-none text-foreground">Create account</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Start building your collection.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div>
               <label className="mb-2 block text-xs uppercase tracking-[.12em] text-muted-foreground">Name</label>
              <input
                type="text"
                {...register('name')}
                className="input-field"
                placeholder="Your name"
              />
              {errors.name && <p className="mt-1.5 text-xs text-[#ee9d83]">{errors.name.message}</p>}
            </div>

            <div>
               <label className="mb-2 block text-xs uppercase tracking-[.12em] text-muted-foreground">Email</label>
              <input
                type="email"
                {...register('email')}
                className="input-field"
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1.5 text-xs text-[#ee9d83]">{errors.email.message}</p>}
            </div>

            <div>
               <label className="mb-2 block text-xs uppercase tracking-[.12em] text-muted-foreground">Password</label>
              <input
                type="password"
                {...register('password')}
                className="input-field"
                placeholder="At least 6 characters"
              />
              {errors.password && <p className="mt-1.5 text-xs text-[#ee9d83]">{errors.password.message}</p>}
            </div>

            <div>
               <label className="mb-2 block text-xs uppercase tracking-[.12em] text-muted-foreground">Confirm Password</label>
              <input
                type="password"
                {...register('confirmPassword')}
                className="input-field"
                placeholder="Repeat password"
              />
              {errors.confirmPassword && <p className="mt-1.5 text-xs text-[#ee9d83]">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full"
            >
              {submitting ? 'Creating account...' : 'Create account'} <ArrowRight className="size-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Already have an account? <Link to="/login" className="text-[#a9d0b8] hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
