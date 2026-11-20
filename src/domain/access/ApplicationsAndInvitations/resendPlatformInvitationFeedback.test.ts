import { ApolloError } from '@apollo/client';
import { GraphQLError } from 'graphql';
import { describe, expect, test } from 'vitest';
import { resolveResendFeedback } from './resendPlatformInvitationFeedback';

const apolloErrorWithCode = (code: string) =>
  new ApolloError({ graphQLErrors: [new GraphQLError('boom', { extensions: { code } })] });

describe('resolveResendFeedback', () => {
  test('no error is a success', () => {
    expect(resolveResendFeedback()).toBe('success');
  });

  test('the resend cool-down code is throttled', () => {
    expect(resolveResendFeedback(apolloErrorWithCode('ROLESET_INVITATION_RESEND_THROTTLED'))).toBe('throttled');
  });

  test('any other GraphQL error is a generic error', () => {
    expect(resolveResendFeedback(apolloErrorWithCode('FORBIDDEN'))).toBe('error');
  });

  test('a network failure is a generic error', () => {
    expect(resolveResendFeedback(new ApolloError({ networkError: new Error('offline') }))).toBe('error');
    expect(resolveResendFeedback(new Error('offline'))).toBe('error');
  });
});
