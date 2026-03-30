import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useKratosFlow, { FlowTypeName } from './useKratosFlow';

const mockCreateBrowserRegistrationFlow = vi.fn();
const mockGetRegistrationFlow = vi.fn();

vi.mock('./useKratosClient', () => ({
  useKratosClient: () => ({
    createBrowserRegistrationFlow: mockCreateBrowserRegistrationFlow,
    getRegistrationFlow: mockGetRegistrationFlow,
  }),
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
});
