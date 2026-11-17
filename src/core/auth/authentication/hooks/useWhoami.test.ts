import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWhoami } from './useWhoami';

const toSession = vi.fn();
const kratosClient = { toSession };

vi.mock('./useKratosClient', () => ({ useKratosClient: () => kratosClient }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

const axiosError = (status: number, data: unknown) =>
  Object.assign(new Error(`Request failed with status code ${status}`), {
    request: { status },
    response: { status, data },
  });

describe('useWhoami', () => {
  beforeEach(() => {
    toSession.mockReset();
  });

  it('reads a 200 as authenticated', async () => {
    toSession.mockResolvedValue({ status: 200, data: { identity: { verifiable_addresses: [{ verified: true }] } } });

    const { result } = renderHook(() => useWhoami());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.error).toBeUndefined();
  });

  it('reads a sign-in that owes its second step as not authenticated, without an error', async () => {
    toSession.mockRejectedValue(axiosError(403, { error: { id: 'session_aal2_required', code: 403 } }));

    const { result } = renderHook(() => useWhoami());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it('still reports any other 403 as an error', async () => {
    toSession.mockRejectedValue(axiosError(403, { error: { id: 'security_csrf_violation', code: 403 } }));

    const { result } = renderHook(() => useWhoami());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe('Request failed with status code 403');
  });

  it('still reports a 401 as an error', async () => {
    toSession.mockRejectedValue(axiosError(401, {}));

    const { result } = renderHook(() => useWhoami());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('401 - kratos.errors.401');
  });
});
