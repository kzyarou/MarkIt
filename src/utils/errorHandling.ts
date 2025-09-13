// Error types for better error categorization
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  CLIENT_ERROR = 'CLIENT_ERROR',
  UNKNOWN = 'UNKNOWN',
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// Custom error class with additional context
export class AppError extends Error {
  public readonly type: ErrorType;
  public severity: ErrorSeverity;
  public context?: string;
  public readonly originalError?: Error;
  public timestamp: Date;
  public errorId: string;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: string,
    originalError?: Error
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.context = context;
    this.originalError = originalError;
    this.timestamp = new Date();
    this.errorId = this.generateErrorId();
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      severity: this.severity,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      errorId: this.errorId,
      stack: this.stack,
      originalError: this.originalError?.message,
    };
  }
}

// Error handler class
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];
  private maxLogSize = 100;

  private constructor() {
    this.loadErrorLog();
    this.setupGlobalErrorHandlers();
  }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Handle different types of errors
  public handleError(
    error: Error | AppError,
    context?: string,
    severity?: ErrorSeverity
  ): AppError {
    let appError: AppError;

    if (error instanceof AppError) {
      appError = error;
      if (context) appError.context = context;
      if (severity) appError.severity = severity;
    } else {
      const errorType = this.categorizeError(error);
      const errorSeverity = severity || this.determineSeverity(errorType);
      
      appError = new AppError(
        error.message,
        errorType,
        errorSeverity,
        context,
        error
      );
    }

    this.logError(appError);
    this.notifyError(appError);
    
    return appError;
  }

  // Categorize errors based on message and properties
  private categorizeError(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    if (name.includes('firebase') || name.includes('auth')) {
      return ErrorType.AUTHENTICATION;
    }

    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return ErrorType.NETWORK;
    }

    if (message.includes('permission') || message.includes('unauthorized') || message.includes('forbidden')) {
      return ErrorType.AUTHORIZATION;
    }

    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      return ErrorType.VALIDATION;
    }

    if (message.includes('not found') || message.includes('404')) {
      return ErrorType.NOT_FOUND;
    }

    if (message.includes('server') || message.includes('500')) {
      return ErrorType.SERVER_ERROR;
    }

    return ErrorType.UNKNOWN;
  }

  // Determine error severity
  private determineSeverity(type: ErrorType): ErrorSeverity {
    switch (type) {
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
        return ErrorSeverity.HIGH;
      case ErrorType.NETWORK:
      case ErrorType.SERVER_ERROR:
        return ErrorSeverity.MEDIUM;
      case ErrorType.VALIDATION:
      case ErrorType.NOT_FOUND:
        return ErrorSeverity.LOW;
      default:
        return ErrorSeverity.MEDIUM;
    }
  }

  // Log error to localStorage and memory
  private logError(error: AppError): void {
    try {
      this.errorLog.push(error);
      
      // Keep only the last maxLogSize errors
      if (this.errorLog.length > this.maxLogSize) {
        this.errorLog = this.errorLog.slice(-this.maxLogSize);
      }

      // Save to localStorage
      localStorage.setItem('appErrorLog', JSON.stringify(this.errorLog.map(e => e.toJSON())));
      
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.group(`🚨 ${error.type} Error (${error.severity})`);
        console.error('Message:', error.message);
        console.error('Context:', error.context);
        console.error('Error ID:', error.errorId);
        console.error('Original Error:', error.originalError);
        console.groupEnd();
      }
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  // Load error log from localStorage
  private loadErrorLog(): void {
    try {
      const stored = localStorage.getItem('appErrorLog');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.errorLog = parsed.map((e: any) => {
          const error = new AppError(e.message, e.type, e.severity, e.context);
          error.timestamp = new Date(e.timestamp);
          error.errorId = e.errorId;
          return error;
        });
      }
    } catch (error) {
      console.error('Failed to load error log:', error);
    }
  }

  // Notify about errors (can be extended to send to external services)
  private notifyError(error: AppError): void {
    // For critical errors, you might want to send to external monitoring service
    if (error.severity === ErrorSeverity.CRITICAL) {
      this.sendToMonitoringService(error);
    }
  }

  // Send error to external monitoring service (placeholder)
  private sendToMonitoringService(error: AppError): void {
    // Implement integration with services like Sentry, LogRocket, etc.
    // For now, just log to console
    if (process.env.NODE_ENV === 'production') {
      console.warn('Critical error should be sent to monitoring service:', error.toJSON());
    }
  }

  // Setup global error handlers
  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = new AppError(
        event.reason?.message || 'Unhandled Promise Rejection',
        ErrorType.UNKNOWN,
        ErrorSeverity.HIGH,
        'Global Promise Handler'
      );
      this.handleError(error);
      event.preventDefault();
    });

    // Handle global errors
    window.addEventListener('error', (event) => {
      const error = new AppError(
        event.message,
        ErrorType.UNKNOWN,
        ErrorSeverity.HIGH,
        'Global Error Handler',
        event.error
      );
      this.handleError(error);
    });
  }

  // Get error log
  public getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  // Clear error log
  public clearErrorLog(): void {
    this.errorLog = [];
    localStorage.removeItem('appErrorLog');
  }

  // Get errors by type
  public getErrorsByType(type: ErrorType): AppError[] {
    return this.errorLog.filter(error => error.type === type);
  }

  // Get errors by severity
  public getErrorsBySeverity(severity: ErrorSeverity): AppError[] {
    return this.errorLog.filter(error => error.severity === severity);
  }
}

// Utility functions for common error scenarios
export const createNetworkError = (message: string, context?: string): AppError => {
  return new AppError(message, ErrorType.NETWORK, ErrorSeverity.MEDIUM, context);
};

export const createAuthError = (message: string, context?: string): AppError => {
  return new AppError(message, ErrorType.AUTHENTICATION, ErrorSeverity.HIGH, context);
};

export const createValidationError = (message: string, context?: string): AppError => {
  return new AppError(message, ErrorType.VALIDATION, ErrorSeverity.LOW, context);
};

export const createNotFoundError = (message: string, context?: string): AppError => {
  return new AppError(message, ErrorType.NOT_FOUND, ErrorSeverity.LOW, context);
};

// Async error wrapper for better error handling in async functions
export const withErrorHandling = async <T>(
  fn: () => Promise<T>,
  context?: string,
  fallback?: T
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    const appError = ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error(String(error)),
      context
    );
    
    if (fallback !== undefined) {
      return fallback;
    }
    
    throw appError;
  }
};

// Error boundary hook for functional components
export const useErrorBoundary = () => {
  const handleError = (error: Error, context?: string) => {
    ErrorHandler.getInstance().handleError(error, context);
  };

  return { handleError };
}; 