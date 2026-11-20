import 'fake-indexeddb/auto';
import { logger as sdkLogger } from 'matrix-js-sdk/lib/logger';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { stopActiveSession } from './activeSession';
import { establishSession } from './sessionController';
import { clearNamespace, storeCredentials } from './storage';

// The SDK module is only evaluated by the session's own dynamic import, so the
// logger created here stands in for the ones SDK modules create at load time.
const loadTime = vi.hoisted(() => ({ logger: undefined as ReturnType<typeof sdkLogger.getChild> | undefined }));

vi.mock('matrix-js-sdk', async () => {
  const { logger } = await import('matrix-js-sdk/lib/logger');
  loadTime.logger = logger.getChild('[load-time]');
  return {
    createClient: vi.fn(() => ({ stopClient: vi.fn(), startClient: vi.fn(async () => {}), on: vi.fn() })),
  };
});
vi.mock('./ssoLogin', () => ({ attemptSilentSso: vi.fn() }));

describe('establishSession SDK logging', () => {
  const USER_ID = '@abc-123:matrix.dev-alkem.io';

  afterEach(async () => {
    stopActiveSession();
    await clearNamespace(USER_ID);
  });

  it('keeps SDK debug and info out of the console for loggers created at SDK load and after, but not warnings or errors', async () => {
    await storeCredentials({
      userId: USER_ID,
      deviceId: 'DEV1',
      accessToken: 'syt_stored_access',
      homeserverUrl: 'https://matrix.dev-alkem.io',
    });

    await establishSession('abc-123');

    const spies = (['debug', 'info', 'warn', 'error'] as const).map(method =>
      vi.spyOn(console, method).mockImplementation(() => {})
    );
    const [debug, info, warn, error] = spies;
    try {
      for (const target of [loadTime.logger, sdkLogger.getChild('[room]')]) {
        target?.debug('debug line');
        target?.info('info line');
        target?.warn('warn line');
        target?.error('error line');
      }

      expect(debug).not.toHaveBeenCalled();
      expect(info).not.toHaveBeenCalled();
      expect(warn).toHaveBeenCalledTimes(2);
      expect(error).toHaveBeenCalledTimes(2);
      expect(warn).toHaveBeenNthCalledWith(1, '[load-time]', 'warn line');
      expect(warn).toHaveBeenNthCalledWith(2, '[room]', 'warn line');
    } finally {
      for (const spy of spies) spy.mockRestore();
    }
  });
});
