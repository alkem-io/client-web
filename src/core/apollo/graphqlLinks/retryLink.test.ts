import type { Operation } from '@apollo/client';
import { gql } from '@apollo/client';
import { describe, expect, it } from 'vitest';
import { retryIf } from './retryLink';

const asOperation = (query: ReturnType<typeof gql>): Operation => ({ query }) as Operation;

const MUTATION = gql`
  mutation DeleteCallout($calloutId: UUID!) {
    deleteCallout(deleteData: { ID: $calloutId }) {
      id
    }
  }
`;

const QUERY = gql`
  query TaskBoardData($calloutId: UUID!) {
    lookup {
      callout(ID: $calloutId) {
        id
      }
    }
  }
`;

describe('retryLink retryIf', () => {
  it('never retries a mutation — retrying a slow-but-successful delete would double-submit', () => {
    // Even a retryable-looking network error must not retry a mutation.
    expect(retryIf({ statusCode: 502 }, asOperation(MUTATION))).toBe(false);
  });

  it('retries a query on a retryable network error', () => {
    expect(retryIf({ statusCode: 502 }, asOperation(QUERY))).toBe(true);
  });

  it('does not retry a query on a non-retryable status code', () => {
    for (const statusCode of [500, 400, 401, 403]) {
      expect(retryIf({ statusCode }, asOperation(QUERY))).toBe(false);
    }
  });

  it('does not retry a redirected query response', () => {
    expect(retryIf({ response: { redirected: true } }, asOperation(QUERY))).toBe(false);
  });
});
