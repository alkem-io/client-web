import { ApolloError } from '@apollo/client';
import { GraphQLError } from 'graphql';
import i18next from 'i18next';
import { afterEach, describe, expect, test } from 'vitest';
import appI18n, { defaultNS } from '@/core/i18n/config';
import commonEN from '@/crd/i18n/common/common.en.json';
import commonNL from '@/crd/i18n/common/common.nl.json';
import { getMessageSendLimitMessage } from './messageSendLimit';

const KEY = 'apollo.errors.userMessages.operations.messageSendLimitReached';
const limitTextEN = commonEN.apollo.errors.userMessages.operations.messageSendLimitReached;
const limitTextNL = commonNL.apollo.errors.userMessages.operations.messageSendLimitReached;

const apolloErrorWithCode = (code: string, message = 'refused') =>
  new ApolloError({ graphQLErrors: [new GraphQLError(message, { extensions: { code } })] });

describe('getMessageSendLimitMessage', () => {
  afterEach(async () => {
    await i18next.changeLanguage('en');
  });

  test('reads the instance and namespace the app initialises', () => {
    expect(appI18n).toBe(i18next);
    expect(defaultNS).toBe('crd-common');
  });

  test('returns the English limit text for an error carrying only the limit code', () => {
    const message = getMessageSendLimitMessage(apolloErrorWithCode('MESSAGE_SEND_LIMIT_REACHED'));
    expect(message).toBe(limitTextEN);
    expect(message).not.toBe(KEY);
  });

  test('returns the limit text in the active language', async () => {
    await i18next.changeLanguage('nl');
    const message = getMessageSendLimitMessage(apolloErrorWithCode('MESSAGE_SEND_LIMIT_REACHED'));
    expect(message).toBe(limitTextNL);
    expect(message).not.toBe(limitTextEN);
    expect(message).not.toBe(KEY);
  });

  test.each(['MESSAGING_NOT_ENABLED', 'FORBIDDEN_POLICY', 'UNSPECIFIED'])('returns undefined for %s', code => {
    expect(getMessageSendLimitMessage(apolloErrorWithCode(code))).toBeUndefined();
  });

  test('returns undefined for a plain Error and for undefined', () => {
    expect(getMessageSendLimitMessage(new Error('boom'))).toBeUndefined();
    expect(getMessageSendLimitMessage(undefined)).toBeUndefined();
  });

  test('ignores message text that mentions the limit when the code is different', () => {
    const error = apolloErrorWithCode('UNSPECIFIED', 'You can send up to 20 messages an hour.');
    expect(getMessageSendLimitMessage(error)).toBeUndefined();
  });
});
