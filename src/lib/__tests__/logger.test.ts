import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '../logger';

describe('logger', () => {
  const originalEnv = import.meta.env.DEV;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    import.meta.env.DEV = originalEnv;
  });

  it('logs in development mode', () => {
    import.meta.env.DEV = true;
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    logger.log('test message');

    expect(consoleSpy).toHaveBeenCalledWith('test message');
    consoleSpy.mockRestore();
  });

  it('does not log in production mode', () => {
    import.meta.env.DEV = false;
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    logger.log('test message');

    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('always logs errors', () => {
    import.meta.env.DEV = false;
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logger.error('error message');

    expect(consoleErrorSpy).toHaveBeenCalledWith('error message');
    consoleErrorSpy.mockRestore();
  });

  it('warns only in development', () => {
    import.meta.env.DEV = true;
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    logger.warn('warning message');

    expect(consoleWarnSpy).toHaveBeenCalledWith('warning message');
    consoleWarnSpy.mockRestore();
  });
});
