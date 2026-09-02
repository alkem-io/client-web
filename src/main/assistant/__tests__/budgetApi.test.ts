/**
 * T049 — the asvc budget endpoint client (`getBudget`).
 *
 * - Cookie auth only, no Authorization header (SC-006), same as the rest of the
 *   assistant REST surface.
 * - Graceful degradation: a 404 (endpoint not yet deployed — asvc T056) or a 204
 *   resolves to `null` so the meter hides; a real failure rejects.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getBudget } from '../assistantApi';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getBudget', () => {
  it('returns the parsed budget on 200, with cookie auth and no Authorization header', async () => {
    const payload = { tokensPerMonth: 100000, monthToDateUsed: 1234, resetsOn: '2026-07-01' };
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify(payload), { status: 200, headers: { 'Content-Type': 'application/json' } })
      );

    const result = await getBudget();
    expect(result).toEqual(payload);

    const [, init] = fetchSpy.mock.calls[0];
    expect(init?.credentials).toBe('include');
    expect(new Headers(init?.headers).has('authorization')).toBe(false);
  });

  it('resolves to null on 404 (endpoint not deployed) — the meter hides', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 404 }));
    await expect(getBudget()).resolves.toBeNull();
  });

  it('resolves to null on 204 (no content)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }));
    await expect(getBudget()).resolves.toBeNull();
  });

  it('rejects on a real failure (e.g. 500) so it is not silently masked', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 500 }));
    await expect(getBudget()).rejects.toThrow(/budget request failed: 500/);
  });
});
