import { afterEach, describe, expect, it, vi } from 'vitest';
import { submitKratosSettings } from './submitKratosSettings';

const ACTION = 'http://localhost:3000/ory/kratos/public/self-service/settings?flow=f1';
const answer = (status: number, body: unknown) =>
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status })));

describe('submitKratosSettings', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('posts the fields as JSON with the session cookie, asking for JSON back', async () => {
    answer(200, { id: 'f1', ui: { nodes: [] } });

    await submitKratosSettings(ACTION, { method: 'totp', totp_code: '123456' });

    expect(fetch).toHaveBeenCalledWith(ACTION, {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: 'totp', totp_code: '123456' }),
    });
  });

  it('returns the flow Kratos saved (200) or refused with its messages (400)', async () => {
    answer(200, { id: 'f1', state: 'success', ui: { nodes: [] } });
    expect(await submitKratosSettings(ACTION, {})).toEqual({
      kind: 'flow',
      flow: { id: 'f1', state: 'success', ui: { nodes: [] } },
    });

    answer(400, { id: 'f1', ui: { nodes: [], messages: [{ id: 4000008, text: 'wrong code' }] } });
    expect(await submitKratosSettings(ACTION, {})).toMatchObject({ kind: 'flow', flow: { id: 'f1' } });
  });

  it('returns where Kratos sends the browser, e.g. to re-confirm an old session', async () => {
    answer(403, {
      error: { id: 'session_refresh_required' },
      redirect_browser_to: 'http://localhost:3000/login?refresh=true',
    });

    expect(await submitKratosSettings(ACTION, {})).toEqual({
      kind: 'redirect',
      to: 'http://localhost:3000/login?refresh=true',
    });
  });

  it('throws on an answer that is neither', async () => {
    answer(500, { error: { code: 500 } });

    await expect(submitKratosSettings(ACTION, {})).rejects.toThrow('500');
  });
});
