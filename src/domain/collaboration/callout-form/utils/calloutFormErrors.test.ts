import { ApolloError } from '@apollo/client';
import { GraphQLError } from 'graphql';
import { describe, expect, it } from 'vitest';
import { CalloutFormErrorCode, getCalloutFormError, getCalloutFormErrorCode } from './calloutFormErrors';

const withDetails = (details: unknown) =>
  new ApolloError({
    graphQLErrors: [new GraphQLError('rejected', { extensions: { code: 'BAD_USER_INPUT', details } })],
  });

describe('getCalloutFormErrorCode', () => {
  it('reads a known reason code from extensions.details.code', () => {
    expect(getCalloutFormErrorCode(withDetails({ code: 'FORM_VISIBILITY_CHANGED' }))).toBe(
      CalloutFormErrorCode.FORM_VISIBILITY_CHANGED
    );
  });

  it('ignores unknown codes, missing details and non-Apollo errors', () => {
    expect(getCalloutFormErrorCode(withDetails({ code: 'SOMETHING_ELSE' }))).toBeUndefined();
    expect(getCalloutFormErrorCode(withDetails(undefined))).toBeUndefined();
    expect(getCalloutFormErrorCode(new Error('boom'))).toBeUndefined();
    expect(getCalloutFormErrorCode(undefined)).toBeUndefined();
  });

  it('takes the first coded error when several are present', () => {
    const error = new ApolloError({
      graphQLErrors: [
        new GraphQLError('a', { extensions: { code: 'X' } }),
        new GraphQLError('b', { extensions: { details: { code: 'FORM_CLOSED' } } }),
      ],
    });
    expect(getCalloutFormErrorCode(error)).toBe(CalloutFormErrorCode.FORM_CLOSED);
  });
});

describe('getCalloutFormError', () => {
  it('returns the question ids the rejection points at, ignoring non-string entries', () => {
    expect(getCalloutFormError(withDetails({ code: 'FORM_ANSWER_REQUIRED', questionIDs: ['q1', 7, 'q2'] }))).toEqual({
      code: 'FORM_ANSWER_REQUIRED',
      questionIDs: ['q1', 'q2'],
    });
  });

  it('defaults to no question ids', () => {
    expect(getCalloutFormError(withDetails({ code: 'FORM_CLOSED' }))).toEqual({ code: 'FORM_CLOSED', questionIDs: [] });
  });
});
