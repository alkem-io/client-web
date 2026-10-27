import { ApolloError } from '@apollo/client';
import { GraphQLError } from 'graphql';
import { describe, expect, it } from 'vitest';
import { isSelfTargetRefusal } from './selfTargetRefusal';

const apolloErrorWithCode = (code: string) =>
  new ApolloError({ graphQLErrors: [new GraphQLError('refused', { extensions: { code } })] });

describe('isSelfTargetRefusal', () => {
  it('recognises the PLATFORM_SUPPORT_SELF_TARGET code', () => {
    expect(isSelfTargetRefusal(apolloErrorWithCode('PLATFORM_SUPPORT_SELF_TARGET'))).toBe(true);
  });

  it('ignores other codes and non-Apollo errors', () => {
    expect(isSelfTargetRefusal(apolloErrorWithCode('FORBIDDEN_POLICY'))).toBe(false);
    expect(isSelfTargetRefusal(new Error('boom'))).toBe(false);
    expect(isSelfTargetRefusal(undefined)).toBe(false);
  });
});
