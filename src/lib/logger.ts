/**
 * Logger utility that conditionally logs based on environment
 * Prevents console.log from appearing in production builds
 */

const isDev = import.meta.env.DEV;

export const logger = {
  /**
   * Logs only in development mode
   */
  log: (...args: unknown[]) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Always logs errors (important for debugging production issues)
   */
  error: (...args: unknown[]) => {
    console.error(...args);
    // In production, you might want to send this to an error tracking service
    // Example: Sentry.captureException(args[0]);
  },

  /**
   * Logs warnings only in development mode
   */
  warn: (...args: unknown[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },

  /**
   * Logs info only in development mode
   */
  info: (...args: unknown[]) => {
    if (isDev) {
      console.info(...args);
    }
  },

  /**
   * Debug logs - only in development mode
   */
  debug: (...args: unknown[]) => {
    if (isDev) {
      console.debug(...args);
    }
  },
};
