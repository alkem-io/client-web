import { ApolloError } from '@apollo/client';

/**
 * Stable reason codes the server attaches to Form rejections, in `extensions.details.code` (with the
 * offending questions in `extensions.details.questionIDs`). Clients map them to localized text; the
 * server message is never shown.
 *
 * Contract: the server's production exception filter rebuilds errors with only `{ errorId, code }`, so it
 * must whitelist `details.code` and `details.questionIDs` (content-free by construction) for the Form
 * reason codes to reach a deployed client. Without them this reader returns undefined and callers fall
 * back to their generic message.
 */
export const CalloutFormErrorCode = {
  CALLOUT_NOT_PUBLISHED: 'CALLOUT_NOT_PUBLISHED',
  FORM_CLOSED: 'FORM_CLOSED',
  FORM_VISIBILITY_CHANGED: 'FORM_VISIBILITY_CHANGED',
  FORM_RESPONSE_ALREADY_EXISTS: 'FORM_RESPONSE_ALREADY_EXISTS',
  FORM_ANSWER_REQUIRED: 'FORM_ANSWER_REQUIRED',
  FORM_ANSWER_TOO_LONG: 'FORM_ANSWER_TOO_LONG',
  FORM_ANSWER_UNKNOWN_QUESTION: 'FORM_ANSWER_UNKNOWN_QUESTION',
  FORM_ANSWER_DUPLICATE_QUESTION: 'FORM_ANSWER_DUPLICATE_QUESTION',
  FORM_ANSWER_TYPE_MISMATCH: 'FORM_ANSWER_TYPE_MISMATCH',
  FORM_ANSWER_INVALID_OPTION: 'FORM_ANSWER_INVALID_OPTION',
  FORM_ANSWER_SELECTION_COUNT: 'FORM_ANSWER_SELECTION_COUNT',
  FORM_QUESTIONS_COUNT: 'FORM_QUESTIONS_COUNT',
  FORM_OPTIONS_COUNT: 'FORM_OPTIONS_COUNT',
  FORM_OPTIONS_DUPLICATE: 'FORM_OPTIONS_DUPLICATE',
  FORM_UNKNOWN_QUESTION_ID: 'FORM_UNKNOWN_QUESTION_ID',
  FORM_UNKNOWN_OPTION_ID: 'FORM_UNKNOWN_OPTION_ID',
  FORM_QUESTION_TYPE_LOCKED: 'FORM_QUESTION_TYPE_LOCKED',
  FORM_VISIBILITY_WIDENING_BLOCKED: 'FORM_VISIBILITY_WIDENING_BLOCKED',
  FORM_RESPONSE_MODE_SWITCH_BLOCKED: 'FORM_RESPONSE_MODE_SWITCH_BLOCKED',
  // placement
  FORM_FRAMING_NOT_ALLOWED: 'FORM_FRAMING_NOT_ALLOWED',
  FORM_FRAMING_FIXED_KIND: 'FORM_FRAMING_FIXED_KIND',
  FORM_TRANSFER_NOT_ALLOWED: 'FORM_TRANSFER_NOT_ALLOWED',
} as const;

export type CalloutFormErrorCodeValue = (typeof CalloutFormErrorCode)[keyof typeof CalloutFormErrorCode];

const KNOWN_CODES = new Set<string>(Object.values(CalloutFormErrorCode));

export type CalloutFormError = {
  code: CalloutFormErrorCodeValue;
  /** The questions a rejection points at; empty when the rejection is not about specific questions. */
  questionIDs: string[];
};

/**
 * Extracts the Form reason code (and the questions it points at) from a failed operation, or undefined
 * when the failure carries none (network error, authorization denial, unknown server error).
 */
export const getCalloutFormError = (error: unknown): CalloutFormError | undefined => {
  if (!(error instanceof ApolloError)) return undefined;
  for (const graphQLError of error.graphQLErrors) {
    const details = graphQLError.extensions?.details as { code?: unknown; questionIDs?: unknown } | undefined;
    const code = details?.code;
    if (typeof code === 'string' && KNOWN_CODES.has(code)) {
      const questionIDs = Array.isArray(details?.questionIDs)
        ? details.questionIDs.filter((id): id is string => typeof id === 'string')
        : [];
      return { code: code as CalloutFormErrorCodeValue, questionIDs };
    }
  }
  return undefined;
};

export const getCalloutFormErrorCode = (error: unknown): CalloutFormErrorCodeValue | undefined =>
  getCalloutFormError(error)?.code;
