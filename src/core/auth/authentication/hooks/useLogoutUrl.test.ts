import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLogoutUrl } from './useLogoutUrl';

const { getFlow } = vi.hoisted(() => ({ getFlow: vi.fn() }));
vi.mock('./useKratosLogout', () => ({ useKratosLogout: () => ({ getKratosLogoutUrl: getFlow }) }));
const fetchLogout = vi.fn<typeof fetch>();
const logoutPath = `/api/auth/oidc/logout?${new URLSearchParams({ post_logout_redirect_uri: `${window.location.origin}/logout` })}`;

beforeEach(() => {
  fetchLogout.mockReset();
  getFlow.mockReset().mockResolvedValue({ kind: 'no-session' });
  vi.stubGlobal('fetch', fetchLogout);
});
afterEach(() => vi.unstubAllGlobals());

describe('the retained RP/Hydra then Kratos logout flow', () => {
  it('starts the normal RP leg from the admitted requester session without another status or token read', async () => {
    const { result } = renderHook(useLogoutUrl);
    await act(() => result.current.getLogoutUrl(true));
    expect(result.current.outcome).toEqual({ kind: 'redirect', url: logoutPath });
    expect(fetchLogout).not.toHaveBeenCalled();
    expect(getFlow).not.toHaveBeenCalled();
  });

  it('on a Hydra return or already-ended BFF, completes only after an actual Kratos no-session outcome', async () => {
    fetchLogout.mockResolvedValueOnce(new Response(null, { status: 204 }));
    const { result } = renderHook(useLogoutUrl);
    await act(() => result.current.getLogoutUrl(false));
    expect(fetchLogout).toHaveBeenCalledExactlyOnceWith(logoutPath, { credentials: 'include', redirect: 'manual' });
    expect(getFlow).toHaveBeenCalledTimes(1);
    expect(result.current.outcome).toEqual({ kind: 'cleared' });
    expect(result.current.error).toBeUndefined();
  });

  it('uses the provider-issued URL for a live Kratos session without claiming it has completed', async () => {
    fetchLogout.mockResolvedValueOnce(new Response(null, { status: 204 }));
    getFlow.mockResolvedValue({ kind: 'redirect', url: 'https://identity.test/provider-issued-logout' });
    const { result } = renderHook(useLogoutUrl);
    await act(() => result.current.getLogoutUrl(false));
    expect(result.current.outcome).toEqual({ kind: 'redirect', url: 'https://identity.test/provider-issued-logout' });
    expect(result.current.error).toBeUndefined();
  });

  it('does not turn an unavailable BFF action into a completed logout', async () => {
    fetchLogout.mockResolvedValue(new Response(null, { status: 503 }));
    const { result } = renderHook(useLogoutUrl);
    await act(() => result.current.getLogoutUrl(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.outcome).toBeUndefined();
    expect(fetchLogout).toHaveBeenCalledTimes(1);
    expect(getFlow).not.toHaveBeenCalled();
  });

  it('does not turn a transport failure into no session', async () => {
    fetchLogout.mockRejectedValue(new TypeError('Network unavailable'));
    const { result } = renderHook(useLogoutUrl);
    await act(() => result.current.getLogoutUrl(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.outcome).toBeUndefined();
    expect(getFlow).not.toHaveBeenCalled();
  });

  it.each([401, 500])('does not interpret an unexpected BFF cleanup status %i as no session', async status => {
    fetchLogout.mockResolvedValueOnce(new Response(null, { status }));
    const { result } = renderHook(useLogoutUrl);
    await act(() => result.current.getLogoutUrl(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.outcome).toBeUndefined();
    expect(getFlow).not.toHaveBeenCalled();
  });

  it('uses the existing logout route for one fresh observation after invalid-session management confirms 204', async () => {
    fetchLogout.mockResolvedValueOnce(new Response(null, { status: 204 }));
    const { result } = renderHook(useLogoutUrl);
    await act(() => result.current.getLogoutUrl('invalid-session'));
    expect(fetchLogout).toHaveBeenCalledExactlyOnceWith(logoutPath, { credentials: 'include', redirect: 'manual' });
    expect(result.current.outcome).toEqual({ kind: 'redirect', url: '/logout' });
    expect(getFlow).not.toHaveBeenCalled();
  });

  it.each([
    'opaqueredirect',
    'basic',
  ])('keeps a consumed %s management redirect unknown and never replays it', async type => {
    const response = new Response(null, { status: 302 });
    Object.defineProperty(response, 'type', { value: type });
    if (type === 'opaqueredirect') Object.defineProperty(response, 'status', { value: 0 });
    fetchLogout.mockResolvedValueOnce(response).mockResolvedValue(new Response(null, { status: 204 }));
    const { result } = renderHook(useLogoutUrl);
    await act(() => result.current.getLogoutUrl('invalid-session'));
    expect(result.current.outcome).toEqual({ kind: 'unknown' });
    expect(result.current.error).toBeUndefined();
    await act(() => result.current.getLogoutUrl(false));
    expect(fetchLogout).toHaveBeenCalledTimes(1);
    expect(getFlow).not.toHaveBeenCalled();
    expect(result.current.outcome).toEqual({ kind: 'unknown' });
  });

  it('also preserves an unexpected consumed redirect on the admitted return pass as unknown', async () => {
    const response = new Response(null, { status: 302 });
    Object.defineProperty(response, 'type', { value: 'opaqueredirect' });
    Object.defineProperty(response, 'status', { value: 0 });
    fetchLogout.mockResolvedValueOnce(response);
    const { result } = renderHook(useLogoutUrl);
    await act(() => result.current.getLogoutUrl(false));
    expect(result.current.outcome).toEqual({ kind: 'unknown' });
    expect(getFlow).not.toHaveBeenCalled();
  });

  it('does not report completion when the provider outcome is unknown', async () => {
    fetchLogout.mockResolvedValueOnce(new Response(null, { status: 204 }));
    getFlow.mockResolvedValue({ kind: 'failed' });
    const { result } = renderHook(useLogoutUrl);
    await act(() => result.current.getLogoutUrl(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.outcome).toBeUndefined();
  });

  it('retries an unavailable outcome only on an explicit new invocation', async () => {
    fetchLogout.mockResolvedValueOnce(new Response(null, { status: 503 }));
    const { result } = renderHook(useLogoutUrl);
    await act(() => result.current.getLogoutUrl(false));
    expect(fetchLogout).toHaveBeenCalledTimes(1);
    fetchLogout.mockResolvedValueOnce(new Response(null, { status: 204 }));
    await act(() => result.current.getLogoutUrl(false));
    expect(result.current.error).toBeUndefined();
    expect(result.current.outcome).toEqual({ kind: 'cleared' });
  });
});
