import { renderHook } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import { useChatRecipientDirectory } from './useChatRecipientDirectory';

const query = vi.fn();
vi.mock('@/core/apollo/generated-v2/apollo-hooks', () => ({
  useChatRecipientDirectoryQuery: (...args: unknown[]) => query(...args),
}));

const data = {
  actors: {
    edges: [
      { node: { id: 'me', about: { displayName: 'My account' } } },
      { node: { id: 'hidden', about: null } },
      {
        node: {
          id: 'visible',
          about: {
            displayName: 'Ada',
            avatar: { file: { url: '/avatar/ada' } },
            location: { city: 'Delft', country: 31 },
          },
        },
      },
    ],
  },
};

beforeEach(() => query.mockReset());

test('searches trimmed terms and returns only visible faces other than the viewer', () => {
  query.mockReturnValue({ data, loading: false });
  const { result } = renderHook(() => useChatRecipientDirectory(' Ada ', 'me'));

  expect(query).toHaveBeenCalledWith({ variables: { terms: 'Ada' }, skip: false });
  expect(result.current).toEqual({
    searchResults: [{ id: 'visible', displayName: 'Ada', avatarUrl: '/avatar/ada', city: 'Delft' }],
    loading: false,
    error: undefined,
  });
});

test('a skipped search suppresses the previous results, loading state and error', () => {
  query.mockReturnValue({ data, loading: false });
  const { result, rerender } = renderHook(({ terms }) => useChatRecipientDirectory(terms, 'me'), {
    initialProps: { terms: 'Ada' },
  });
  expect(result.current.searchResults).toHaveLength(1);

  query.mockReturnValue({ data, loading: true, error: new Error('previous search failed') });
  rerender({ terms: '  ' });

  expect(query).toHaveBeenLastCalledWith({ variables: { terms: '' }, skip: true });
  expect(result.current).toEqual({ searchResults: [], loading: false, error: undefined });
});

test('hides stale data during a replacement search and returns a settled denial', () => {
  const error = new Error('FORBIDDEN');
  query.mockReturnValue({ data, loading: true, error });
  const { result, rerender } = renderHook(() => useChatRecipientDirectory('Ben', 'me'));
  expect(result.current).toEqual({ searchResults: [], loading: true, error: undefined });

  query.mockReturnValue({ data, loading: false, error });
  rerender();
  expect(result.current).toEqual({ searchResults: [], loading: false, error });
});
