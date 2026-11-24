import { ApolloError } from '@apollo/client';
import i18n from 'i18next';
import { AlkemioGraphqlErrorCode } from '@/main/constants/errors';

/**
 * The message shown when a send is refused because the sender's hourly message allowance is used up,
 * or undefined for any other error. The text is read from `crd-common` by name, so it resolves
 * whichever namespace the calling component translates with.
 */
export const getMessageSendLimitMessage = (error: unknown): string | undefined => {
  const isLimitReached =
    error instanceof ApolloError &&
    error.graphQLErrors.some(
      graphQLError => graphQLError.extensions?.code === AlkemioGraphqlErrorCode.MESSAGE_SEND_LIMIT_REACHED
    );
  if (!isLimitReached) {
    return undefined;
  }
  return i18n.t('apollo.errors.userMessages.operations.messageSendLimitReached', { ns: 'crd-common' });
};
