import { ApolloLink, execute, gql, Observable } from '@apollo/client';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useErrorLoggerLink } from './useErrorLoggerLink';

const sentryError = vi.fn();

vi.mock('@/core/logging/sentry/log', () => ({
  error: (...args: unknown[]) => sentryError(...args),
  TagCategoryValues: { SERVER: 'server' },
}));

describe('useErrorLoggerLink', () => {
  it('reports to Sentry and does not throw when the APM agent never started', async () => {
    // No ApmProvider: the agent is undefined, as for a visitor without analysis consent.
    const { result } = renderHook(() => useErrorLoggerLink(true));
    const failing = new ApolloLink(() => new Observable(observer => observer.error(new Error('offline'))));
    const link = ApolloLink.from([result.current, failing]);

    await new Promise<void>(resolve => {
      execute(link, { query: gql('query Q { me { id } }') }).subscribe({ error: () => resolve() });
    });

    expect(sentryError).toHaveBeenCalledTimes(1);
  });
});
