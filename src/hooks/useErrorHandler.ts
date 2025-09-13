import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  ErrorHandler, 
  AppError, 
  ErrorType, 
  ErrorSeverity,
  withErrorHandling,
  createNetworkError,
  createAuthError,
  createValidationError,
  createNotFoundError
} from '@/utils/errorHandling';

interface UseErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  context?: string;
}

interface ErrorState {
  hasError: boolean;
  error: AppError | null;
  isLoading: boolean;
  retryCount: number;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const {
    showToast = true,
    logToConsole = true,
    context = 'Component'
  } = options;

  const { toast } = useToast();
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    isLoading: false,
    retryCount: 0
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const maxRetries = 3;

  // Handle errors with proper categorization and user feedback
  const handleError = useCallback((
    error: Error | AppError | string,
    severity?: ErrorSeverity,
    customContext?: string
  ) => {
    let appError: AppError;

    if (typeof error === 'string') {
      appError = new AppError(error, ErrorType.UNKNOWN, severity || ErrorSeverity.MEDIUM, customContext || context);
    } else if (error instanceof AppError) {
      appError = error;
      if (customContext) appError.context = customContext;
      if (severity) appError.severity = severity;
    } else {
      appError = new AppError(
        error.message,
        ErrorType.UNKNOWN,
        severity || ErrorSeverity.MEDIUM,
        customContext || context,
        error
      );
    }

    // Update error state
    setErrorState(prev => ({
      ...prev,
      hasError: true,
      error: appError,
      isLoading: false
    }));

    // Log error
    ErrorHandler.getInstance().handleError(appError, customContext || context, severity);

    // Show toast notification if enabled
    if (showToast) {
      const toastVariant = getToastVariant(appError.severity);
      const toastTitle = getToastTitle(appError.type);
      
      toast({
        title: toastTitle,
        description: appError.message,
        variant: toastVariant,
        duration: appError.severity === ErrorSeverity.CRITICAL ? 10000 : 5000
      });
    }

    // Log to console if enabled
    if (logToConsole) {
      console.group(`🚨 ${appError.type} Error in ${appError.context}`);
      console.error('Message:', appError.message);
      console.error('Severity:', appError.severity);
      console.error('Error ID:', appError.errorId);
      console.error('Original Error:', appError.originalError);
      console.groupEnd();
    }

    return appError;
  }, [showToast, logToConsole, context, toast]);

  // Handle specific error types
  const handleNetworkError = useCallback((message: string, customContext?: string) => {
    return handleError(createNetworkError(message, customContext || context), ErrorSeverity.MEDIUM);
  }, [handleError, context]);

  const handleAuthError = useCallback((message: string, customContext?: string) => {
    return handleError(createAuthError(message, customContext || context), ErrorSeverity.HIGH);
  }, [handleError, context]);

  const handleValidationError = useCallback((message: string, customContext?: string) => {
    return handleError(createValidationError(message, customContext || context), ErrorSeverity.LOW);
  }, [handleError, context]);

  const handleNotFoundError = useCallback((message: string, customContext?: string) => {
    return handleError(createNotFoundError(message, customContext || context), ErrorSeverity.LOW);
  }, [handleError, context]);

  // Clear error state
  const clearError = useCallback(() => {
    setErrorState(prev => ({
      ...prev,
      hasError: false,
      error: null,
      retryCount: 0
    }));
  }, []);

  // Retry operation with exponential backoff
  const retry = useCallback(async <T>(
    operation: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> => {
    if (errorState.retryCount >= maxRetries) {
      const error = new AppError(
        `Operation failed after ${maxRetries} retries`,
        ErrorType.UNKNOWN,
        ErrorSeverity.HIGH,
        context
      );
      handleError(error);
      throw error;
    }

    setErrorState(prev => ({ ...prev, isLoading: true, retryCount: prev.retryCount + 1 }));

    try {
      const result = await operation();
      clearError();
      return result;
    } catch (error) {
      const delay = Math.pow(2, errorState.retryCount) * 1000; // Exponential backoff
      
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }

      retryTimeoutRef.current = setTimeout(() => {
        retry(operation, maxRetries);
      }, delay);

      throw error;
    }
  }, [errorState.retryCount, context, handleError, clearError]);

  // Wrapper for async operations with automatic error handling
  const safeAsync = useCallback(async <T>(
    operation: () => Promise<T>,
    fallback?: T,
    customContext?: string
  ): Promise<T> => {
    try {
      setErrorState(prev => ({ ...prev, isLoading: true, hasError: false }));
      const result = await operation();
      setErrorState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      handleError(error, undefined, customContext);
      if (fallback !== undefined) {
        return fallback;
      }
      throw error;
    }
  }, [handleError]);

  // Reset error handler state
  const reset = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    setErrorState({
      hasError: false,
      error: null,
      isLoading: false,
      retryCount: 0
    });
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
  }, []);

  return {
    // State
    ...errorState,
    
    // Error handling methods
    handleError,
    handleNetworkError,
    handleAuthError,
    handleValidationError,
    handleNotFoundError,
    
    // Utility methods
    clearError,
    retry,
    safeAsync,
    reset,
    cleanup,
    
    // Error handler instance
    errorHandler: ErrorHandler.getInstance()
  };
};

// Helper functions for toast variants and titles
const getToastVariant = (severity: ErrorSeverity) => {
  switch (severity) {
    case ErrorSeverity.CRITICAL:
    case ErrorSeverity.HIGH:
      return 'destructive' as const;
    case ErrorSeverity.MEDIUM:
      return 'default' as const;
    case ErrorSeverity.LOW:
      return 'default' as const;
    default:
      return 'default' as const;
  }
};

const getToastTitle = (type: ErrorType) => {
  switch (type) {
    case ErrorType.NETWORK:
      return 'Connection Error';
    case ErrorType.AUTHENTICATION:
      return 'Authentication Error';
    case ErrorType.AUTHORIZATION:
      return 'Access Denied';
    case ErrorType.VALIDATION:
      return 'Validation Error';
    case ErrorType.NOT_FOUND:
      return 'Not Found';
    case ErrorType.SERVER_ERROR:
      return 'Server Error';
    case ErrorType.CLIENT_ERROR:
      return 'Client Error';
    default:
      return 'Error';
  }
};

// Export the withErrorHandling utility for use outside of hooks
export { withErrorHandling }; 