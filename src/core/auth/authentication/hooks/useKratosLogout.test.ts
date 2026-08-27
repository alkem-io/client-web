import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useKratosLogout } from './useKratosLogout';

const mockCreateBrowserLogoutFlow = vi.fn();

// A stable client object, as the real `useKratosClient` provides.
const mockClient = {
  createBrowserLogoutFlow: (...args: unknown[]) => mockCreateBrowserLogoutFlow(...args),
};

let clientAvailable = true;

vi.mock('./useKratosClient', () => ({
  useKratosClient: () => (clientAvailable ? mockClient : undefined),
}));

describe('useKratosLogout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clientAvailable = true;
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getKratosLogoutUrl', () => {
    it('returns the logout URL when a session is live', async () => {
      mockCreateBrowserLogoutFlow.mockResolvedValue({ data: { logout_url: 'https://identity.test/logout?token=1' } });
      const { result } = renderHook(() => useKratosLogout());

      await expect(result.current.getKratosLogoutUrl()).resolves.toBe('https://identity.test/logout?token=1');
    });

    it('returns undefined on any failure (401 no-session, or otherwise) — best-effort', async () => {
      mockCreateBrowserLogoutFlow.mockRejectedValue({ response: { status: 401 } });
      const { result } = renderHook(() => useKratosLogout());

      await expect(result.current.getKratosLogoutUrl()).resolves.toBeUndefined();
    });
  });

  describe('endKratosSsoSession', () => {
    it("reports 'ended' after successfully fetching the Kratos-issued logout URL", async () => {
      mockCreateBrowserLogoutFlow.mockResolvedValue({ data: { logout_url: 'https://identity.test/logout?token=1' } });
      const { result } = renderHook(() => useKratosLogout());

      await expect(result.current.endKratosSsoSession()).resolves.toBe('ended');
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://identity.test/logout?token=1',
        expect.objectContaining({ credentials: 'include' })
      );
    });

    it("reports 'no-session' on a 401 — nothing to end, safe to proceed", async () => {
      mockCreateBrowserLogoutFlow.mockRejectedValue({ response: { status: 401 } });
      const { result } = renderHook(() => useKratosLogout());

      await expect(result.current.endKratosSsoSession()).resolves.toBe('no-session');
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("reports 'failed' — never 'no-session' — when the logout flow request errors for a reason other than 401", async () => {
      mockCreateBrowserLogoutFlow.mockRejectedValue({ response: { status: 500 } });
      const { result } = renderHook(() => useKratosLogout());

      await expect(result.current.endKratosSsoSession()).resolves.toBe('failed');
    });

    it("reports 'failed' when the logout flow errors with no response at all (e.g. a network error)", async () => {
      mockCreateBrowserLogoutFlow.mockRejectedValue(new Error('network error'));
      const { result } = renderHook(() => useKratosLogout());

      await expect(result.current.endKratosSsoSession()).resolves.toBe('failed');
    });

    it("reports 'failed' when the credentialed fetch to the logout URL itself fails", async () => {
      mockCreateBrowserLogoutFlow.mockResolvedValue({ data: { logout_url: 'https://identity.test/logout?token=1' } });
      (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('network error'));
      const { result } = renderHook(() => useKratosLogout());

      await expect(result.current.endKratosSsoSession()).resolves.toBe('failed');
    });

    // sec-client-web-2: `fetch` rejects only on a network-level failure, so an
    // HTTP error status resolves normally. Reporting 'ended' without inspecting
    // the response would let the caller's step-up gate proceed on a Kratos
    // session that is provably still alive.
    it.each([
      400, 401, 403, 500, 502,
    ])("reports 'failed' when the logout URL answers HTTP %i — the session may still be live", async status => {
      mockCreateBrowserLogoutFlow.mockResolvedValue({ data: { logout_url: 'https://identity.test/logout?token=1' } });
      (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(new Response(null, { status }));
      const { result } = renderHook(() => useKratosLogout());

      await expect(result.current.endKratosSsoSession()).resolves.toBe('failed');
    });

    it("reports 'ended' on an opaque redirect — Kratos's normal answer under redirect:'manual'", async () => {
      mockCreateBrowserLogoutFlow.mockResolvedValue({ data: { logout_url: 'https://identity.test/logout?token=1' } });
      // Response.type is read-only, so stand in the shape the fetch spec produces
      // for a manual-redirect response: type 'opaqueredirect', status 0, ok false.
      (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        type: 'opaqueredirect',
        status: 0,
        ok: false,
      });
      const { result } = renderHook(() => useKratosLogout());

      await expect(result.current.endKratosSsoSession()).resolves.toBe('ended');
    });

    it("reports 'failed' when there is no Kratos client available", async () => {
      clientAvailable = false;
      const { result } = renderHook(() => useKratosLogout());

      await expect(result.current.endKratosSsoSession()).resolves.toBe('failed');
      expect(mockCreateBrowserLogoutFlow).not.toHaveBeenCalled();
    });
  });
});
