import 'fake-indexeddb/auto';
import { act } from '@testing-library/react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The import boundary spy: if anything in the flag-off path triggers the
// dynamic `import('matrix-js-sdk')`, this factory runs and flips the flag.
const sdkImportBoundary = vi.hoisted(() => ({ triggered: false }));
vi.mock('matrix-js-sdk', () => {
  sdkImportBoundary.triggered = true;
  return {};
});

vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: { id: 'e07aff72-4ec2-49e5-a2d2-t023actor000' } }),
}));

const setEnv = (env: Record<string, string>) => {
  Object.defineProperty(window, '_env_', { value: env, writable: true, configurable: true });
};

/**
 * SC-006/SC-009 mechanical half (T023): with the flag off — or on without
 * admission — the foundation is byte-level inert: no network, no storage,
 * no SDK chunk, no diagnostics handle. Uses the REAL provider, controller,
 * and config; only the user context and the SDK module itself are mocked.
 */
describe('flag gating — inertness (US5)', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    vi.resetModules();
    sdkImportBoundary.triggered = false;
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(async () => {
    await act(async () => {
      root?.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
    delete (window as unknown as Record<string, unknown>)._env_;
    delete (window as unknown as Record<string, unknown>).__alkemioMatrix;
  });

  const renderAndOpenMessaging = async () => {
    const { MatrixSessionProvider } = await import('./MatrixSessionProvider');
    const { notifyMessagingOpened } = await import('./sessionController');
    await act(async () => {
      root = createRoot(container);
      root.render(React.createElement(MatrixSessionProvider, null, null));
    });
    await act(async () => {
      notifyMessagingOpened();
    });
  };

  const expectInert = (spies: {
    fetch: ReturnType<typeof vi.spyOn>;
    open: ReturnType<typeof vi.spyOn>;
    databases: ReturnType<typeof vi.spyOn>;
    deleteDatabase: ReturnType<typeof vi.spyOn>;
  }) => {
    expect(spies.fetch).not.toHaveBeenCalled();
    expect(spies.open).not.toHaveBeenCalled();
    expect(spies.databases).not.toHaveBeenCalled();
    expect(spies.deleteDatabase).not.toHaveBeenCalled();
    expect(sdkImportBoundary.triggered).toBe(false);
    expect((window as unknown as Record<string, unknown>).__alkemioMatrix).toBeUndefined();
  };

  it('flag off: zero network calls, zero storage access, no SDK import, no diagnostics handle', async () => {
    setEnv({ VITE_APP_MATRIX_ENABLED: 'false', VITE_APP_MATRIX_HOMESERVER_URL: 'https://matrix.test.invalid' });
    const spies = {
      fetch: vi.spyOn(globalThis, 'fetch'),
      open: vi.spyOn(indexedDB, 'open'),
      databases: vi.spyOn(indexedDB, 'databases'),
      deleteDatabase: vi.spyOn(indexedDB, 'deleteDatabase'),
    };

    await renderAndOpenMessaging();

    expectInert(spies);
  });

  it('flag on but actor not on the allowlist: equally inert', async () => {
    setEnv({
      VITE_APP_MATRIX_ENABLED: 'true',
      VITE_APP_MATRIX_HOMESERVER_URL: 'https://matrix.test.invalid',
      VITE_APP_MATRIX_ALLOWED_USERS: '00000000-0000-0000-0000-000000000001',
    });
    const spies = {
      fetch: vi.spyOn(globalThis, 'fetch'),
      open: vi.spyOn(indexedDB, 'open'),
      databases: vi.spyOn(indexedDB, 'databases'),
      deleteDatabase: vi.spyOn(indexedDB, 'deleteDatabase'),
    };

    await renderAndOpenMessaging();

    expectInert(spies);
  });
});
