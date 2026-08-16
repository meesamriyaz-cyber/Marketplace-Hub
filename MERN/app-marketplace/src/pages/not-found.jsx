import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center">
         <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
         <p className="text-lg text-muted-foreground mb-8">Page not found</p>
        <Link to="/" className="btn-primary">Back to Cutting Edge Apps</Link>
      </div>
    </div>
  );
}
