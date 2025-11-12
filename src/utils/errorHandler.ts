/**
 * Error Handler Utility
 *
 * Centralized error handling with recovery strategies.
 * Provides graceful degradation when systems fail.
 */

import { logger } from './logger';

export enum ErrorSeverity {
  LOW = 'LOW',       // Minor issue, game continues normally
  MEDIUM = 'MEDIUM', // Feature disabled, game continues
  HIGH = 'HIGH',     // Major issue, but game can recover
  CRITICAL = 'CRITICAL', // Game cannot continue
}

export interface GameError {
  message: string;
  severity: ErrorSeverity;
  context: string;
  error?: Error;
  timestamp: number;
  handled: boolean;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errors: GameError[] = [];
  private maxErrorHistory: number = 50;
  private onCriticalError?: (error: GameError) => void;

  private constructor() {
    // Singleton
    this.setupGlobalErrorHandlers();
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    // Catch unhandled errors
    window.addEventListener('error', (event) => {
      this.handleError(
        'Unhandled JavaScript error',
        ErrorSeverity.HIGH,
        'Global',
        event.error
      );
      event.preventDefault();
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(
        'Unhandled promise rejection',
        ErrorSeverity.HIGH,
        'Promise',
        event.reason
      );
      event.preventDefault();
    });
  }

  /**
   * Register callback for critical errors
   */
  onCritical(callback: (error: GameError) => void): void {
    this.onCriticalError = callback;
  }

  /**
   * Handle an error with appropriate severity
   */
  handleError(
    message: string,
    severity: ErrorSeverity,
    context: string,
    error?: Error | any
  ): GameError {
    const gameError: GameError = {
      message,
      severity,
      context,
      error: error instanceof Error ? error : undefined,
      timestamp: Date.now(),
      handled: true,
    };

    // Add to history
    this.errors.push(gameError);
    if (this.errors.length > this.maxErrorHistory) {
      this.errors.shift();
    }

    // Log based on severity
    switch (severity) {
      case ErrorSeverity.LOW:
        logger.warn(message, error, context);
        break;
      case ErrorSeverity.MEDIUM:
        logger.warn(`[FEATURE DISABLED] ${message}`, error, context);
        break;
      case ErrorSeverity.HIGH:
        logger.error(message, error, context);
        break;
      case ErrorSeverity.CRITICAL:
        logger.error(`[CRITICAL] ${message}`, error, context);
        if (this.onCriticalError) {
          this.onCriticalError(gameError);
        }
        break;
    }

    return gameError;
  }

  /**
   * Try to execute a function with error handling
   */
  tryExecute<T>(
    fn: () => T,
    context: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    fallback?: T
  ): T | undefined {
    try {
      return fn();
    } catch (error) {
      this.handleError(
        `Error in ${context}`,
        severity,
        context,
        error as Error
      );
      return fallback;
    }
  }

  /**
   * Try to execute an async function with error handling
   */
  async tryExecuteAsync<T>(
    fn: () => Promise<T>,
    context: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    fallback?: T
  ): Promise<T | undefined> {
    try {
      return await fn();
    } catch (error) {
      this.handleError(
        `Async error in ${context}`,
        severity,
        context,
        error as Error
      );
      return fallback;
    }
  }

  /**
   * Get error history
   */
  getErrors(severity?: ErrorSeverity): GameError[] {
    if (severity) {
      return this.errors.filter((e) => e.severity === severity);
    }
    return [...this.errors];
  }

  /**
   * Get critical errors
   */
  getCriticalErrors(): GameError[] {
    return this.getErrors(ErrorSeverity.CRITICAL);
  }

  /**
   * Clear error history
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * Get error count by severity
   */
  getErrorCount(severity?: ErrorSeverity): number {
    if (severity) {
      return this.errors.filter((e) => e.severity === severity).length;
    }
    return this.errors.length;
  }

  /**
   * Check if there are any critical errors
   */
  hasCriticalErrors(): boolean {
    return this.getErrorCount(ErrorSeverity.CRITICAL) > 0;
  }

  /**
   * Format error for display
   */
  formatError(error: GameError): string {
    const date = new Date(error.timestamp).toLocaleTimeString();
    return `[${date}] [${error.severity}] ${error.context}: ${error.message}`;
  }

  /**
   * Export errors for debugging
   */
  exportErrors(): string {
    return JSON.stringify(
      this.errors.map((e) => ({
        ...e,
        error: e.error ? {
          message: e.error.message,
          stack: e.error.stack,
        } : undefined,
      })),
      null,
      2
    );
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Helper functions for common patterns
export function safeExecute<T>(
  fn: () => T,
  context: string,
  fallback?: T
): T | undefined {
  return errorHandler.tryExecute(fn, context, ErrorSeverity.MEDIUM, fallback);
}

export function safeExecuteAsync<T>(
  fn: () => Promise<T>,
  context: string,
  fallback?: T
): Promise<T | undefined> {
  return errorHandler.tryExecuteAsync(fn, context, ErrorSeverity.MEDIUM, fallback);
}
