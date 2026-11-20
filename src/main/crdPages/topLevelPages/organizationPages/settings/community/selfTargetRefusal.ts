import { ApolloError } from '@apollo/client';
import { AlkemioGraphqlErrorCode } from '@/main/constants/errors';

/** Translation key (crd-common) for a Platform Support user acting on their own account. */
export const SELF_TARGET_REFUSAL_MESSAGE_KEY = 'apollo.errors.userMessages.authorization.platformSupportSelfTarget';

/** True when the server refused the action because Platform Support targeted their own account. */
export const isSelfTargetRefusal = (error: unknown): boolean =>
  error instanceof ApolloError &&
  error.graphQLErrors.some(e => e.extensions?.code === AlkemioGraphqlErrorCode.PLATFORM_SUPPORT_SELF_TARGET);
