import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router } from 'wouter';
import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'sonner';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <App />
          <Toaster position="bottom-right" richColors />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>,
);
