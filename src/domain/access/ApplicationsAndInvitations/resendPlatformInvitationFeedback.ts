import { ApolloError } from '@apollo/client';
import { AlkemioGraphqlErrorCode } from '@/main/constants/errors';

export type ResendFeedback = 'success' | 'throttled' | 'error';

/**
 * Maps the outcome of a resend-invitation-email request to the feedback the admin should see:
 * no error → success; the server's per-invitation cool-down → throttled (a normal, expected
 * refusal worth its own copy); anything else → a generic failure.
 */
export const resolveResendFeedback = (error?: unknown): ResendFeedback => {
  if (error === undefined || error === null) return 'success';
  if (
    error instanceof ApolloError &&
    error.graphQLErrors.some(
      graphQLError => graphQLError.extensions?.code === AlkemioGraphqlErrorCode.ROLESET_INVITATION_RESEND_THROTTLED
    )
  ) {
    return 'throttled';
  }
  return 'error';
};

export const RESEND_FEEDBACK_TRANSLATION_KEY = {
  success: 'community.pendingMemberships.resendSuccess',
  throttled: 'community.pendingMemberships.resendThrottled',
  error: 'community.pendingMemberships.resendError',
} as const satisfies Record<ResendFeedback, string>;
