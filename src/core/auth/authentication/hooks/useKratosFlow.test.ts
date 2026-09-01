import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { error as logError } from '@/core/logging/sentry/log';
import useKratosFlow, { FlowTypeName, isKratosSessionExpiredError } from './useKratosFlow';

const mockCreateBrowserRegistrationFlow = vi.fn();
const mockGetRegistrationFlow = vi.fn();
const mockCreateBrowserLoginFlow = vi.fn();
const mockGetLoginFlow = vi.fn();
const mockCreateBrowserSettingsFlow = vi.fn();

// A stable client object, as the real `useKratosClient` provides — a fresh
// object per render would re-trigger the hook's [client, ...] effect on every
// render and turn a persistent mock rejection into an update loop.
const mockClient = {
  createBrowserRegistrationFlow: (...args: unknown[]) => mockCreateBrowserRegistrationFlow(...args),
  getRegistrationFlow: (...args: unknown[]) => mockGetRegistrationFlow(...args),
  createBrowserLoginFlow: (...args: unknown[]) => mockCreateBrowserLoginFlow(...args),
  getLoginFlow: (...args: unknown[]) => mockGetLoginFlow(...args),
  createBrowserSettingsFlow: (...args: unknown[]) => mockCreateBrowserSettingsFlow(...args),
};

vi.mock('./useKratosClient', () => ({
  useKratosClient: () => mockClient,
}));

vi.mock('@/core/logging/sentry/log', () => ({
  error: vi.fn(),
  TagCategoryValues: { AUTH: 'AUTH' },
}));

describe('useKratosFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('extracts flow from HTTP 400 response and updates flow state', async () => {
    const flowWith400Error = {
      id: 'flow-123',
      ui: {
        nodes: [],
        messages: [
          {
            id: 1010016,
            type: 'error',
            text: 'You tried to sign in with microsoft, but that email is already used by another account.',
          },
        ],
        action: '/self-service/registration?flow=flow-123',
        method: 'POST',
      },
    };

    mockCreateBrowserRegistrationFlow.mockRejectedValue({
      response: {
        status: 400,
        data: flowWith400Error,
      },
      message: 'Request failed with status code 400',
    });

    const { result } = renderHook(() => useKratosFlow(FlowTypeName.Registration, undefined));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.flow).toEqual(flowWith400Error);
    expect(result.current.error).toBeUndefined();
  });

  it('re-throws non-400 errors normally', async () => {
    mockCreateBrowserRegistrationFlow.mockRejectedValue({
      response: {
        status: 500,
        data: { error: { message: 'Internal Server Error' } },
      },
      message: 'Request failed with status code 500',
    });

    const { result } = renderHook(() => useKratosFlow(FlowTypeName.Registration, undefined));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.flow).toBeUndefined();
    expect(result.current.error).toBeDefined();
  });

  it('handles 410 Gone by redirecting', async () => {
    const originalLocation = window.location;
    const replaceMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { replace: replaceMock },
      writable: true,
    });

    mockCreateBrowserRegistrationFlow.mockRejectedValue({
      response: {
        status: 410,
        data: { error: { details: { redirect_to: '/self-service/registration/browser' } } },
      },
      message: 'Request failed with status code 410',
    });

    renderHook(() => useKratosFlow(FlowTypeName.Registration, undefined));

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/self-service/registration/browser');
    });

    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  it('clears a previous error when a refetch succeeds', async () => {
    mockCreateBrowserRegistrationFlow.mockRejectedValue({
      response: {
        status: 502,
        data: { error: { message: 'Bad Gateway' } },
      },
      message: 'Request failed with status code 502',
    });

    const { result } = renderHook(() => useKratosFlow(FlowTypeName.Registration, undefined));

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });

    const flow = {
      id: 'flow-789',
      ui: { nodes: [], messages: [], action: '/self-service/registration?flow=flow-789', method: 'POST' },
    };
    mockCreateBrowserRegistrationFlow.mockResolvedValue({ status: 200, data: flow });

    result.current.refetch();

    await waitFor(() => {
      expect(result.current.flow).toEqual(flow);
    });
    expect(result.current.error).toBeUndefined();
    expect(result.current.loading).toBe(false);
  });

  it('loads flow successfully on 200', async () => {
    const flow = {
      id: 'flow-456',
      ui: { nodes: [], messages: [], action: '/self-service/registration?flow=flow-456', method: 'POST' },
    };

    mockCreateBrowserRegistrationFlow.mockResolvedValue({
      status: 200,
      data: flow,
    });

    const { result } = renderHook(() => useKratosFlow(FlowTypeName.Registration, undefined));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.flow).toEqual(flow);
    expect(result.current.error).toBeUndefined();
  });

  // A login is only ever started through the OIDC BFF (Hydra → Kratos), which
  // lands back here with a flow id on the URL. Self-initiating a Kratos-native
  // login flow from the browser is not just redundant: `createBrowserLoginFlow`
  // ROTATES the anti-CSRF cookie server-side, so the Hydra-minted flow whose id
  // is about to arrive on the URL can no longer be read — Kratos answers the
  // subsequent `getLoginFlow` with 403 `security_csrf_violation` and sign-in
  // dead-ends. The request-sequence guard cannot help: the damage is the
  // request's server-side side effect, not a stale response winning a race.
  it('never self-initiates a Login flow when no flow id is present', async () => {
    const { result } = renderHook(() => useKratosFlow(FlowTypeName.Login, undefined));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockCreateBrowserLoginFlow).not.toHaveBeenCalled();
    expect(result.current.flow).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it('still reads a Login flow that Kratos put on the URL', async () => {
    const flow = {
      id: 'login-flow-1',
      ui: { nodes: [], messages: [], action: '/self-service/login?flow=login-flow-1', method: 'POST' },
    };
    mockGetLoginFlow.mockResolvedValue({ status: 200, data: flow });

    const { result } = renderHook(() => useKratosFlow(FlowTypeName.Login, 'login-flow-1'));

    await waitFor(() => {
      expect(result.current.flow).toEqual(flow);
    });
    expect(mockGetLoginFlow).toHaveBeenCalledWith({ id: 'login-flow-1' });
    expect(mockCreateBrowserLoginFlow).not.toHaveBeenCalled();
  });

  it('every other flow type still self-initiates when no flow id is present', async () => {
    const flow = { id: 'reg-1', ui: { nodes: [], messages: [], action: '/x', method: 'POST' } };
    mockCreateBrowserRegistrationFlow.mockResolvedValue({ status: 200, data: flow });

    renderHook(() => useKratosFlow(FlowTypeName.Registration, undefined));

    await waitFor(() => {
      expect(mockCreateBrowserRegistrationFlow).toHaveBeenCalled();
    });
  });

  // The identity provider's session (`ory_kratos_session`) and the platform's
  // own BFF session have independent lifetimes: the BFF one renews itself on
  // ordinary use without ever consulting the identity provider, so someone who
  // signed in once and simply kept using the app can reach a state where the
  // first has lapsed and the second has not. The Security settings tab is the
  // only surface that talks to the identity provider directly, so it is the
  // only place this shows up — as a 401 `session_inactive` on the settings
  // flow, which used to fall through to the generic branch and surface as an
  // opaque error telling the person to refresh (which cannot possibly help).
  describe('401 — lapsed identity-provider session', () => {
    it('follows the redirect Kratos supplies, as the 403 re-auth branch does', async () => {
      const originalLocation = window.location;
      const replaceMock = vi.fn();
      Object.defineProperty(window, 'location', { value: { replace: replaceMock }, writable: true });

      mockCreateBrowserSettingsFlow.mockRejectedValue({
        response: {
          status: 401,
          data: {
            error: {
              id: 'session_inactive',
              details: { redirect_browser_to: 'https://identity.example.test/login?flow=re-auth' },
            },
          },
        },
        message: 'Request failed with status code 401',
      });

      renderHook(() => useKratosFlow(FlowTypeName.Settings, undefined));

      await waitFor(() => {
        expect(replaceMock).toHaveBeenCalledWith('https://identity.example.test/login?flow=re-auth');
      });

      Object.defineProperty(window, 'location', { value: originalLocation, writable: true });
    });

    it('reports a bare 401 as a distinct typed error instead of an opaque one, and does not redirect', async () => {
      const originalLocation = window.location;
      const replaceMock = vi.fn();
      Object.defineProperty(window, 'location', { value: { replace: replaceMock }, writable: true });

      // Kratos answers a scripted flow request with a bare 401 and no redirect
      // target — there is nowhere to send the browser on its own initiative.
      mockCreateBrowserSettingsFlow.mockRejectedValue({
        response: { status: 401, data: { error: { id: 'session_inactive', code: 401 } } },
        message: 'Request failed with status code 401',
      });

      const { result } = renderHook(() => useKratosFlow(FlowTypeName.Settings, undefined));

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });

      expect(isKratosSessionExpiredError(result.current.error)).toBe(true);
      expect(result.current.error?.message).toContain('session_inactive');
      expect(result.current.flow).toBeUndefined();
      // Redirecting unilaterally would loop: re-entering sign-in does not rebuild
      // the lapsed identity-provider session, so the flow would 401 again on return.
      expect(replaceMock).not.toHaveBeenCalled();
      // Reported to telemetry legibly rather than suppressed — unlike `whoami`
      // 401s, a settings-flow 401 is a real, actionable condition.
      expect(logError).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'KratosSessionExpiredError' }),
        expect.objectContaining({ label: 'SettingsFlowSessionExpired' })
      );

      Object.defineProperty(window, 'location', { value: originalLocation, writable: true });
    });
  });

  // A failure with no HTTP response at all — CORS rejection, DNS/network
  // failure, aborted request — used to take no branch whatsoever: no error was
  // stored and nothing structured was logged, so the consumer only failed
  // through its downstream "no flow" fallback and the sole telemetry was an
  // opaque `Network Error` carrying neither a URL nor the flow being loaded.
  it('records a response-less failure with the request URL instead of failing silently', async () => {
    mockCreateBrowserSettingsFlow.mockRejectedValue({
      config: { baseURL: 'https://identity.example.test', url: '/self-service/settings/browser' },
      message: 'Network Error',
    });

    const { result } = renderHook(() => useKratosFlow(FlowTypeName.Settings, undefined));

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });

    expect(result.current.error?.message).toContain('https://identity.example.test/self-service/settings/browser');
    expect(result.current.error?.message).toContain('Network Error');
    expect(result.current.loading).toBe(false);
    expect(logError).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('/self-service/settings/browser') }),
      expect.objectContaining({ label: 'SettingsFlowNoResponse' })
    );
  });
});
