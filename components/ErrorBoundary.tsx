'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * ErrorBoundary - Catches unhandled React rendering errors gracefully.
 * 
 * Prevents the entire app from crashing when a component throws an error.
 * Shows a user-friendly fallback UI with retry and navigation options.
 * Logs errors to the centralized error tracking API.
 * 
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional fallback UI to render instead of the default error screen */
  fallback?: ReactNode;
  /** Optional callback when an error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log to centralized error tracking
    this.logErrorToServer(error, errorInfo);

    // Call optional callback
    this.props.onError?.(error, errorInfo);
  }

  private async logErrorToServer(error: Error, errorInfo: React.ErrorInfo): Promise<void> {
    try {
      const res = await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ReactErrorBoundary',
          message: error.message,
          stack: error.stack,
          route: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
          severity: 'high',
          componentStack: errorInfo.componentStack,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        this.setState({ errorId: data.errorId });
      }
    } catch {
      // Silently fail — don't throw another error from the error handler
    }
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorId: null });
  };

  private handleGoHome = (): void => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[300px] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-red-100 dark:border-red-900 p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Something went wrong
            </h2>

            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
              An unexpected error occurred. Your data is safe.
            </p>

            {this.state.errorId && (
              <p className="text-xs text-gray-400 mb-4 font-mono">
                Error ID: {this.state.errorId}
              </p>
            )}

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-4 bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                <summary className="text-xs text-gray-500 cursor-pointer font-medium">
                  Technical Details (dev only)
                </summary>
                <pre className="text-xs text-red-600 dark:text-red-400 mt-2 overflow-auto max-h-32 whitespace-pre-wrap">
                  {this.state.error.message}
                  {'\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                aria-label="Try again"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors"
                aria-label="Go to home page"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
