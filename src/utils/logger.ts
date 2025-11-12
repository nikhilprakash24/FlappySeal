/**
 * Logger Utility
 *
 * Centralized logging system with different log levels and formatting.
 * Helps with debugging and error tracking.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;
  private enableTimestamps: boolean = true;
  private enableStackTrace: boolean = false;

  private constructor() {
    // Singleton
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Set the minimum log level to display
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Enable/disable timestamps in logs
   */
  setTimestamps(enabled: boolean): void {
    this.enableTimestamps = enabled;
  }

  /**
   * Enable/disable stack traces for errors
   */
  setStackTrace(enabled: boolean): void {
    this.enableStackTrace = enabled;
  }

  /**
   * Format log message with timestamp and context
   */
  private formatMessage(level: string, message: string, context?: string): string {
    const timestamp = this.enableTimestamps ? `[${new Date().toISOString()}]` : '';
    const ctx = context ? `[${context}]` : '';
    return `${timestamp} ${level} ${ctx} ${message}`.trim();
  }

  /**
   * Debug log - for detailed debugging information
   */
  debug(message: string, data?: any, context?: string): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      console.log(this.formatMessage('[DEBUG]', message, context));
      if (data !== undefined) {
        console.log(data);
      }
    }
  }

  /**
   * Info log - for general informational messages
   */
  info(message: string, data?: any, context?: string): void {
    if (this.logLevel <= LogLevel.INFO) {
      console.log(this.formatMessage('[INFO]', message, context));
      if (data !== undefined) {
        console.log(data);
      }
    }
  }

  /**
   * Warning log - for potentially problematic situations
   */
  warn(message: string, data?: any, context?: string): void {
    if (this.logLevel <= LogLevel.WARN) {
      console.warn(this.formatMessage('[WARN]', message, context));
      if (data !== undefined) {
        console.warn(data);
      }
    }
  }

  /**
   * Error log - for error conditions
   */
  error(message: string, error?: Error | any, context?: string): void {
    if (this.logLevel <= LogLevel.ERROR) {
      console.error(this.formatMessage('[ERROR]', message, context));

      if (error) {
        if (error instanceof Error) {
          console.error(error.message);
          if (this.enableStackTrace && error.stack) {
            console.error(error.stack);
          }
        } else {
          console.error(error);
        }
      }
    }
  }

  /**
   * Group related log messages
   */
  group(label: string): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      console.group(label);
    }
  }

  /**
   * End log group
   */
  groupEnd(): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      console.groupEnd();
    }
  }

  /**
   * Time a block of code
   */
  time(label: string): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      console.time(label);
    }
  }

  /**
   * End timing
   */
  timeEnd(label: string): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      console.timeEnd(label);
    }
  }

  /**
   * Table output for structured data
   */
  table(data: any): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      console.table(data);
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Development vs Production configuration
if (import.meta.env.MODE === 'development') {
  logger.setLogLevel(LogLevel.DEBUG);
  logger.setStackTrace(true);
} else {
  logger.setLogLevel(LogLevel.ERROR);
  logger.setStackTrace(false);
}
