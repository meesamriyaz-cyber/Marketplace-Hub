import { Link } from 'wouter';

export default function NotFound() {
  return <div className="flex min-h-screen items-center justify-center bg-background p-6"><div className="w-full max-w-md text-center"><h1 className="mb-4 text-6xl font-bold text-neutral-100">404</h1><p className="mb-8 text-lg text-neutral-400">Page not found</p><Link to="/" className="btn-primary">Back to Cutting Edge Apps</Link></div></div>;
}
