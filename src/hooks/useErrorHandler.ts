import { useEffect } from 'react';
import { toast } from 'sonner';
import type { ApiError } from '@/types/entities';

export const useErrorHandler = () => {
  useEffect(() => {
    // Global error handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      const error = event.reason as ApiError;
      const message = error?.message || 'An unexpected error occurred';
      
      toast.error('Error', {
        description: message,
      });
    };

    // Global error handler for uncaught errors
    const handleError = (event: ErrorEvent) => {
      console.error('Uncaught error:', event.error);
      
      toast.error('Application Error', {
        description: 'Something went wrong. Please try again.',
      });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  const handleError = (error: unknown, fallbackMessage = 'An error occurred') => {
    console.error('Error:', error);
    
    const apiError = error as ApiError;
    const message = apiError?.message || fallbackMessage;
    
    toast.error('Error', {
      description: message,
    });
  };

  return { handleError };
};
