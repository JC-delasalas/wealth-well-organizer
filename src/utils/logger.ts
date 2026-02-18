/**
 * Conditional logging utility that only logs in development mode
 * Prevents sensitive information leakage in production
 */

const isDevelopment = import.meta.env.DEV;

export interface LogLevel {
  DEBUG: 'debug';
  INFO: 'info';
  WARN: 'warn';
  ERROR: 'error';
}

export const LOG_LEVELS: LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const;

/**
 * Safe logger that only outputs in development mode
 */
export const logger = {
  /**
   * Log debug information (development only)
   */
  debug: (message: string, ...args: unknown[]): void => {
    if (isDevelopment) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },

  /**
   * Log general information (development only)
   */
  info: (message: string, ...args: unknown[]): void => {
    if (isDevelopment) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },

  /**
   * Log warnings (development only)
   */
  warn: (message: string, ...args: unknown[]): void => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },

  /**
   * Log errors (development only)
   * In production, errors should be sent to error tracking service
   */
  error: (message: string, ...args: unknown[]): void => {
    if (isDevelopment) {
      console.error(`[ERROR] ${message}`, ...args);
    }
    // TODO: In production, send to error tracking service (e.g., Sentry)
    // if (!isDevelopment) {
    //   errorTrackingService.captureException(new Error(message), { extra: args });
    // }
  },

  /**
   * Log authentication-related events (development only)
   * Special handling for sensitive auth information
   */
  auth: (message: string, sanitizedData?: Record<string, unknown>): void => {
    if (isDevelopment) {
      console.info(`[AUTH] ${message}`, sanitizedData);
    }
  },

  /**
   * Log API calls and responses (development only)
   */
  api: (method: string, url: string, status?: number, data?: unknown): void => {
    if (isDevelopment) {
      console.info(`[API] ${method} ${url}`, { status, data });
    }
  },

  /**
   * Log performance metrics (development only)
   */
  performance: (operation: string, duration: number, metadata?: Record<string, unknown>): void => {
    if (isDevelopment) {
      console.info(`[PERF] ${operation} took ${duration}ms`, metadata);
    }
  },
};

/**
 * Create a scoped logger for specific modules
 */
export const createScopedLogger = (scope: string) => ({
  debug: (message: string, ...args: unknown[]) => logger.debug(`[${scope}] ${message}`, ...args),
  info: (message: string, ...args: unknown[]) => logger.info(`[${scope}] ${message}`, ...args),
  warn: (message: string, ...args: unknown[]) => logger.warn(`[${scope}] ${message}`, ...args),
  error: (message: string, ...args: unknown[]) => logger.error(`[${scope}] ${message}`, ...args),
});

/**
 * Sanitize sensitive data for logging
 */
export const sanitizeForLogging = (data: Record<string, unknown>): Record<string, unknown> => {
  const sensitiveKeys = ['password', 'token', 'key', 'secret', 'auth', 'credential'];
  const sanitized = { ...data };

  Object.keys(sanitized).forEach(key => {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    }
  });

  return sanitized;
};

export default logger;
