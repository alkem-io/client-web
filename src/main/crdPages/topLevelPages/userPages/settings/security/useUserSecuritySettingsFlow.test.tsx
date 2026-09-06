import type { SettingsFlow } from '@ory/kratos-client';
import { act, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { KratosSessionExpiredError } from '@/core/auth/authentication/hooks/useKratosFlow';
import useUserSecuritySettingsFlow from './useUserSecuritySettingsFlow';

const mockUseKratosFlow = vi.fn();
const mockRefetch = vi.fn();

vi.mock('@/core/auth/authentication/hooks/useKratosFlow', async importOriginal => {
  const actual = await importOriginal<typeof import('@/core/auth/authentication/hooks/useKratosFlow')>();
  return {
    ...actual,
    default: (...args: unknown[]) => mockUseKratosFlow(...args),
  };
});

const settingsFlow = { id: 'flow-abc', ui: { nodes: [] } } as unknown as SettingsFlow;

const wrapperWithUrl =
  (url: string) =>
  ({ children }: PropsWithChildren) => <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>;

/** The hook under test plus a live view of the URL's search params. */
const useHarness = () => {
  const result = useUserSecuritySettingsFlow('/return/here');
  const [searchParams] = useSearchParams();
  return { result, flowParam: searchParams.get('flow') };
};

describe('useUserSecuritySettingsFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseKratosFlow.mockReturnValue({ flow: settingsFlow, error: undefined, loading: false, refetch: mockRefetch });
  });

  it('requests the flow named by ?flow= and reports it as resumed', () => {
    const { result } = renderHook(useHarness, { wrapper: wrapperWithUrl('/security?flow=flow-abc') });

    expect(mockUseKratosFlow).toHaveBeenCalledWith('Settings', 'flow-abc', { returnTo: '/return/here' });
    expect(result.current.result.kind).toBe('ready');
    expect(result.current.result.kind === 'ready' && result.current.result.flowWasResumed).toBe(true);
  });

  it('strips ?flow= from the URL once the resumed flow has settled, keeping the flow rendered', () => {
    const { result } = renderHook(useHarness, { wrapper: wrapperWithUrl('/security?flow=flow-abc') });

    expect(result.current.flowParam).toBeNull();
    expect(result.current.result.kind).toBe('ready');
  });

  it('keeps ?flow= while the resumed flow is still loading', () => {
    mockUseKratosFlow.mockReturnValue({ flow: undefined, error: undefined, loading: true, refetch: mockRefetch });

    const { result } = renderHook(useHarness, { wrapper: wrapperWithUrl('/security?flow=flow-abc') });

    expect(result.current.flowParam).toBe('flow-abc');
    expect(result.current.result.kind).toBe('loading');
  });

  it('retries an errored resumed flow by provisioning a fresh flow instead of re-fetching the dead one', () => {
    mockUseKratosFlow.mockReturnValue({
      flow: undefined,
      error: new Error('410 gone'),
      loading: false,
      refetch: mockRefetch,
    });

    const { result } = renderHook(useHarness, { wrapper: wrapperWithUrl('/security?flow=flow-dead') });

    expect(result.current.result.kind).toBe('error');
    act(() => {
      result.current.result.refetch();
    });

    const lastCall = mockUseKratosFlow.mock.calls[mockUseKratosFlow.mock.calls.length - 1];
    expect(lastCall[1]).toBeUndefined();
    expect(mockRefetch).not.toHaveBeenCalled();
  });

  it('retries a fresh flow by re-running the same request', () => {
    mockUseKratosFlow.mockReturnValue({
      flow: undefined,
      error: new Error('kratos down'),
      loading: false,
      refetch: mockRefetch,
    });

    const { result } = renderHook(useHarness, { wrapper: wrapperWithUrl('/security') });

    expect(result.current.result.kind).toBe('error');
    act(() => {
      result.current.result.refetch();
    });

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  // A lapsed identity-provider session must not collapse into the generic error
  // state: that state's copy tells the person to refresh, and refreshing cannot
  // mint a new identity-provider session — the platform session that keeps
  // every other page working renews itself without ever consulting it. The tab
  // needs the distinction to offer the one action that actually recovers.
  it('reports a lapsed identity-provider session as its own kind, not a generic error', () => {
    mockUseKratosFlow.mockReturnValue({
      flow: undefined,
      error: new KratosSessionExpiredError('Kratos Settings flow: identity provider session expired (401)'),
      loading: false,
      refetch: mockRefetch,
    });

    const { result } = renderHook(useHarness, { wrapper: wrapperWithUrl('/security') });

    expect(result.current.result.kind).toBe('sessionExpired');
  });

  it('still reports any other flow failure as a generic error', () => {
    mockUseKratosFlow.mockReturnValue({
      flow: undefined,
      error: new Error('Request failed with status code 500'),
      loading: false,
      refetch: mockRefetch,
    });

    const { result } = renderHook(useHarness, { wrapper: wrapperWithUrl('/security') });

    expect(result.current.result.kind).toBe('error');
  });
});
