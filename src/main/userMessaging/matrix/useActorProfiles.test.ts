import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({ query: vi.fn() }));

vi.mock('@apollo/client', () => ({ useApolloClient: () => ({ query: harness.query }) }));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({ ActorProfileDocument: {} }));

import { useActorProfiles } from './useActorProfiles';

const profileOf = (displayName: string) => ({ data: { actor: { profile: { displayName, avatar: { uri: 'u' } } } } });

describe('useActorProfiles', () => {
  it('looks a sender up once, however often later messages ask for it again', async () => {
    harness.query.mockReset();
    harness.query.mockResolvedValue(profileOf('Former Member'));

    const { result, rerender } = renderHook(({ ids }) => useActorProfiles(ids), {
      initialProps: { ids: ['a'] },
    });
    await waitFor(() => expect(result.current.get('a')).toEqual({ displayName: 'Former Member', avatarUri: 'u' }));
    rerender({ ids: ['a'] });
    rerender({ ids: ['a', 'b'] });
    await waitFor(() => expect(harness.query).toHaveBeenCalledTimes(2));
    rerender({ ids: ['b', 'a'] });

    expect(harness.query.mock.calls.map(call => call[0].variables.actorId)).toEqual(['a', 'b']);
  });

  it('gives no profile for a denied lookup and still resolves the others', async () => {
    harness.query.mockReset();
    harness.query.mockImplementation(async ({ variables }) => {
      if (variables.actorId === 'denied') {
        throw new Error('forbidden');
      }
      return profileOf('Visible');
    });

    const { result } = renderHook(() => useActorProfiles(['denied', 'ok']));

    await waitFor(() => expect(result.current.get('ok')?.displayName).toBe('Visible'));
    expect(result.current.has('denied')).toBe(false);
  });

  it('gives no profile when the lookup returns no actor', async () => {
    harness.query.mockReset();
    harness.query.mockResolvedValue({ data: { actor: null } });

    const { result } = renderHook(() => useActorProfiles(['gone']));

    await waitFor(() => expect(harness.query).toHaveBeenCalledTimes(1));
    expect(result.current.size).toBe(0);
  });
});
