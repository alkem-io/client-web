import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const parseUrlMock = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUrlResolverLazyQuery: () => [parseUrlMock],
}));

import { SpaceLevel, UrlResolverResultState, UrlType } from '@/core/apollo/generated/graphql-schema';
import useResolveSpaceUrl from './useResolveSpaceUrl';

const successResponse = {
  data: {
    urlResolver: {
      state: UrlResolverResultState.Resolved,
      type: UrlType.Space,
      space: { id: 'space-xyz', level: SpaceLevel.L0 },
    },
  },
};

describe('useResolveSpaceUrl', () => {
  beforeEach(() => {
    parseUrlMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('returns ok with the space id on a fully-valid resolved L0 Space', async () => {
    parseUrlMock.mockResolvedValue(successResponse);

    const { result } = renderHook(() => useResolveSpaceUrl());
    const outcome = await result.current.resolve('https://alkem.io/welcome-space');

    expect(outcome).toEqual({ kind: 'ok', spaceId: 'space-xyz' });
  });

  test('trims the URL before passing to the resolver', async () => {
    parseUrlMock.mockResolvedValue(successResponse);

    const { result } = renderHook(() => useResolveSpaceUrl());
    await result.current.resolve('   https://alkem.io/welcome-space   ');

    expect(parseUrlMock).toHaveBeenCalledWith({
      variables: { url: 'https://alkem.io/welcome-space' },
    });
  });

  test('returns invalid when Apollo returns an error', async () => {
    parseUrlMock.mockResolvedValue({ data: undefined, error: new Error('network') });

    const { result } = renderHook(() => useResolveSpaceUrl());
    const outcome = await result.current.resolve('https://alkem.io/foo');

    expect(outcome).toEqual({ kind: 'invalid' });
  });

  test('returns invalid when the lazy query throws', async () => {
    parseUrlMock.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useResolveSpaceUrl());
    const outcome = await result.current.resolve('https://alkem.io/foo');

    expect(outcome).toEqual({ kind: 'invalid' });
  });

  test('returns invalid on state=NotFound', async () => {
    parseUrlMock.mockResolvedValue({
      data: {
        urlResolver: {
          state: UrlResolverResultState.NotFound,
          type: UrlType.Unknown,
          space: null,
        },
      },
    });

    const { result } = renderHook(() => useResolveSpaceUrl());
    expect(await result.current.resolve('https://alkem.io/missing')).toEqual({ kind: 'invalid' });
  });

  test('returns invalid on state=Forbidden', async () => {
    parseUrlMock.mockResolvedValue({
      data: {
        urlResolver: {
          state: UrlResolverResultState.Forbidden,
          type: UrlType.Space,
          space: { id: 'space-xyz', level: SpaceLevel.L0 },
        },
      },
    });

    const { result } = renderHook(() => useResolveSpaceUrl());
    expect(await result.current.resolve('https://alkem.io/private-space')).toEqual({ kind: 'invalid' });
  });

  test('returns invalid when type is not Space', async () => {
    parseUrlMock.mockResolvedValue({
      data: {
        urlResolver: {
          state: UrlResolverResultState.Resolved,
          type: UrlType.User,
          space: null,
        },
      },
    });

    const { result } = renderHook(() => useResolveSpaceUrl());
    expect(await result.current.resolve('https://alkem.io/some-user')).toEqual({ kind: 'invalid' });
  });

  test('returns invalid when space.level is not 0 (subspace)', async () => {
    parseUrlMock.mockResolvedValue({
      data: {
        urlResolver: {
          state: UrlResolverResultState.Resolved,
          type: UrlType.Space,
          space: { id: 'subspace-1', level: SpaceLevel.L1 },
        },
      },
    });

    const { result } = renderHook(() => useResolveSpaceUrl());
    expect(await result.current.resolve('https://alkem.io/parent/child')).toEqual({ kind: 'invalid' });
  });

  test('returns invalid when space.id is missing', async () => {
    parseUrlMock.mockResolvedValue({
      data: {
        urlResolver: {
          state: UrlResolverResultState.Resolved,
          type: UrlType.Space,
          space: { id: '', level: SpaceLevel.L0 },
        },
      },
    });

    const { result } = renderHook(() => useResolveSpaceUrl());
    expect(await result.current.resolve('https://alkem.io/foo')).toEqual({ kind: 'invalid' });
  });

  test('returns invalid when data is undefined', async () => {
    parseUrlMock.mockResolvedValue({ data: undefined });

    const { result } = renderHook(() => useResolveSpaceUrl());
    expect(await result.current.resolve('https://alkem.io/foo')).toEqual({ kind: 'invalid' });
  });
});
