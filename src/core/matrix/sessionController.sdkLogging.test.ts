import { afterEach, expect, it, vi } from 'vitest';
import { establishSession } from './sessionController';

const { quietSdkLogging, createClient } = vi.hoisted(() => ({
  quietSdkLogging: vi.fn(),
  createClient: vi.fn(),
}));
vi.mock('matrix-js-sdk', () => ({ ClientEvent: {}, HttpApiEvent: {}, SyncState: {}, createClient }));
vi.mock('./sdkLogging', () => ({ quietSdkLogging }));

afterEach(() => vi.unstubAllGlobals());

it('quiets SDK diagnostics before a session can issue its identity request', async () => {
  const expected = new Error('identity service unavailable');
  quietSdkLogging.mockResolvedValueOnce(undefined);
  createClient.mockReturnValueOnce({ whoami: vi.fn().mockRejectedValueOnce(expected) });
  vi.stubGlobal('navigator', {
    locks: {
      request: (_key: string, _options: object, use: (lock: object) => Promise<void>) => use({}),
    },
  });
  const running = establishSession(
    '/api/matrix',
    {
      userId: '@actor:platform.example.test',
      sessionBaseUrl: '/api/matrix',
      expiresAt: '2099-01-01T00:00:00Z',
    },
    new AbortController().signal
  );
  await expect(running).rejects.toBe(expected);
  expect(quietSdkLogging).toHaveBeenCalledBefore(createClient);
});
