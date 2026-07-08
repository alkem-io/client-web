import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const parseUrlMock = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUrlResolverLazyQuery: () => [parseUrlMock],
}));

import { SpaceLevel, UrlResolverResultState, UrlType } from '@/core/apollo/generated/graphql-schema';
import useResolveHubResourceUrl from './useResolveHubResourceUrl';

const spaceResponse = {
  data: {
    urlResolver: {
      state: UrlResolverResultState.Resolved,
      type: UrlType.Space,
      space: { id: 'space-xyz', level: SpaceLevel.L0 },
    },
  },
};

const packResponse = {
  data: {
    urlResolver: {
      state: UrlResolverResultState.Resolved,
      type: UrlType.InnovationPacks,
      innovationPack: { id: 'pack-xyz' },
    },
  },
};

const virtualContributorResponse = {
  data: {
    urlResolver: {
      state: UrlResolverResultState.Resolved,
      type: UrlType.VirtualContributor,
      virtualContributor: { id: 'vc-xyz' },
    },
  },
};

describe('useResolveHubResourceUrl', () => {
  beforeEach(() => {
    parseUrlMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('returns ok with the space id on a fully-valid resolved L0 Space', async () => {
    parseUrlMock.mockResolvedValue(spaceResponse);

    const { result } = renderHook(() => useResolveHubResourceUrl());
    const outcome = await result.current.resolve('https://alkem.io/welcome-space', 'space');

    expect(outcome).toEqual({ kind: 'ok', id: 'space-xyz' });
  });

  test('returns ok with the pack id on a resolved Innovation Pack URL', async () => {
    parseUrlMock.mockResolvedValue(packResponse);

    const { result } = renderHook(() => useResolveHubResourceUrl());
    const outcome = await result.current.resolve('https://alkem.io/innovation-packs/some-pack', 'pack');

    expect(outcome).toEqual({ kind: 'ok', id: 'pack-xyz' });
  });

  test('returns ok with the VC id on a resolved Virtual Contributor URL', async () => {
    parseUrlMock.mockResolvedValue(virtualContributorResponse);

    const { result } = renderHook(() => useResolveHubResourceUrl());
    const outcome = await result.current.resolve('https://alkem.io/vc/some-vc', 'virtualContributor');

    expect(outcome).toEqual({ kind: 'ok', id: 'vc-xyz' });
  });

  test('trims the URL before passing to the resolver', async () => {
    parseUrlMock.mockResolvedValue(spaceResponse);

    const { result } = renderHook(() => useResolveHubResourceUrl());
    await result.current.resolve('   https://alkem.io/welcome-space   ', 'space');

    expect(parseUrlMock).toHaveBeenCalledWith({
      variables: { url: 'https://alkem.io/welcome-space' },
    });
  });

  test('returns invalid when Apollo returns an error', async () => {
    parseUrlMock.mockResolvedValue({ data: undefined, error: new Error('network') });

    const { result } = renderHook(() => useResolveHubResourceUrl());
    const outcome = await result.current.resolve('https://alkem.io/foo', 'space');

    expect(outcome).toEqual({ kind: 'invalid' });
  });

  test('returns invalid when the lazy query throws', async () => {
    parseUrlMock.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useResolveHubResourceUrl());
    const outcome = await result.current.resolve('https://alkem.io/foo', 'pack');

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

    const { result } = renderHook(() => useResolveHubResourceUrl());
    expect(await result.current.resolve('https://alkem.io/missing', 'space')).toEqual({ kind: 'invalid' });
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

    const { result } = renderHook(() => useResolveHubResourceUrl());
    expect(await result.current.resolve('https://alkem.io/private-space', 'space')).toEqual({ kind: 'invalid' });
  });

  test('returns invalid when the URL resolves to a different resource type (wrong-type URL)', async () => {
    parseUrlMock.mockResolvedValue(packResponse);

    const { result } = renderHook(() => useResolveHubResourceUrl());
    expect(await result.current.resolve('https://alkem.io/innovation-packs/some-pack', 'space')).toEqual({
      kind: 'invalid',
    });
    expect(await result.current.resolve('https://alkem.io/innovation-packs/some-pack', 'virtualContributor')).toEqual({
      kind: 'invalid',
    });
  });

  test('returns invalid when a space URL is pasted into the pack form', async () => {
    parseUrlMock.mockResolvedValue(spaceResponse);

    const { result } = renderHook(() => useResolveHubResourceUrl());
    expect(await result.current.resolve('https://alkem.io/welcome-space', 'pack')).toEqual({ kind: 'invalid' });
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

    const { result } = renderHook(() => useResolveHubResourceUrl());
    expect(await result.current.resolve('https://alkem.io/parent/child', 'space')).toEqual({ kind: 'invalid' });
  });

  test('returns invalid when the resolved entity id is missing', async () => {
    parseUrlMock.mockResolvedValue({
      data: {
        urlResolver: {
          state: UrlResolverResultState.Resolved,
          type: UrlType.InnovationPacks,
          innovationPack: { id: '' },
        },
      },
    });

    const { result } = renderHook(() => useResolveHubResourceUrl());
    expect(await result.current.resolve('https://alkem.io/innovation-packs/foo', 'pack')).toEqual({
      kind: 'invalid',
    });
  });

  test('returns invalid when data is undefined', async () => {
    parseUrlMock.mockResolvedValue({ data: undefined });

    const { result } = renderHook(() => useResolveHubResourceUrl());
    expect(await result.current.resolve('https://alkem.io/foo', 'virtualContributor')).toEqual({ kind: 'invalid' });
  });
});
