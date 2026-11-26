import type { ApolloError } from '@apollo/client';
import type { GraphQLFormattedError } from 'graphql';

/**
 * Every `extensions.code` the native server emits: server-go internal/adapter/graphql/errors.go ErrorPresenter and
 * presentTypedError (DEFAULT_UNAVAILABLE), plus extension/publiconly.go (FORBIDDEN_OPERATION).
 * BlueprintOmissionCode values (REFERENCE_UNAVAILABLE, DEPTH_EXCEEDED) are create receipts, not errors.
 */
export const NativeErrorCode = {
  INTERNAL: 'INTERNAL',
  VALIDATION: 'VALIDATION',
  FORBIDDEN: 'FORBIDDEN',
  FORBIDDEN_OPERATION: 'FORBIDDEN_OPERATION',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  ENTITLEMENT: 'ENTITLEMENT',
  UNAVAILABLE: 'UNAVAILABLE',
  TEMPLATE_NOT_READY: 'TEMPLATE_NOT_READY',
  DEFAULT_UNAVAILABLE: 'DEFAULT_UNAVAILABLE',
  VISIT_BUDGET_EXHAUSTED: 'VISIT_BUDGET_EXHAUSTED',
  UNSUPPORTED_NODE_TYPE: 'UNSUPPORTED_NODE_TYPE',
  DELEGATION_UNSUPPORTED: 'DELEGATION_UNSUPPORTED',
  DOCUMENT_ACTION_UNAVAILABLE: 'DOCUMENT_ACTION_UNAVAILABLE',
  UNSUPPORTED_DOCUMENT_SESSION: 'UNSUPPORTED_DOCUMENT_SESSION',
} as const;

export type NativeErrorCode = (typeof NativeErrorCode)[keyof typeof NativeErrorCode];

/** The bare text the server sends with VALIDATION when it has no field message (server-go domain.ErrInvalid). */
const BARE_VALIDATION_MESSAGE = 'invalid';

/**
 * Each native code shown with the LEGACY wording of the same situation: the legacy server's AlkemioErrorStatus →
 * userMessage key (server@f155cae22 src/common/exceptions/error.status.metadata.ts), translated under
 * `apollo.errors.` exactly as legacy errors were. No new wording.
 */
const NATIVE_TO_LEGACY_KEY: Record<Exclude<NativeErrorCode, 'VALIDATION'>, string> = {
  // UNSPECIFIED / fallback (metadata.ts:510)
  INTERNAL: 'apollo.errors.UNSPECIFIED',
  // FORBIDDEN_POLICY: an authorization refusal (authorization.service.ts:24 → metadata.ts:108)
  FORBIDDEN: 'apollo.errors.userMessages.authorization.forbiddenPolicy',
  // OPERATION_NOT_ALLOWED (metadata.ts:256)
  FORBIDDEN_OPERATION: 'apollo.errors.userMessages.operations.operationNotAllowed',
  // ENTITY_NOT_FOUND (metadata.ts:39)
  NOT_FOUND: 'apollo.errors.userMessages.notFound.entity',
  // A write the current state refuses: OPERATION_NOT_ALLOWED (metadata.ts:256)
  CONFLICT: 'apollo.errors.userMessages.operations.operationNotAllowed',
  // LICENSE_ENTITLEMENT_NOT_AVAILABLE (metadata.ts:321)
  ENTITLEMENT: 'apollo.errors.userMessages.operations.licenseEntitlementNotAvailable',
  // NOT_ENABLED (metadata.ts:261)
  UNAVAILABLE: 'apollo.errors.userMessages.operations.notEnabled',
  // A template without usable content: ENTITY_NOT_INITIALIZED (metadata.ts:222; space.defaults.service.ts:223-227)
  TEMPLATE_NOT_READY: 'apollo.errors.userMessages.validation.entityNotInitialized',
  DEFAULT_UNAVAILABLE: 'apollo.errors.userMessages.validation.entityNotInitialized',
  // No legacy situation: the unexpected-error fallback (metadata.ts:510)
  VISIT_BUDGET_EXHAUSTED: 'apollo.errors.UNSPECIFIED',
  // NOT_SUPPORTED (metadata.ts:247)
  UNSUPPORTED_NODE_TYPE: 'apollo.errors.userMessages.validation.notSupported',
  DELEGATION_UNSUPPORTED: 'apollo.errors.userMessages.validation.notSupported',
  DOCUMENT_ACTION_UNAVAILABLE: 'apollo.errors.userMessages.validation.notSupported',
  UNSUPPORTED_DOCUMENT_SESSION: 'apollo.errors.userMessages.validation.notSupported',
};

const NATIVE_CODES = new Set<string>(Object.values(NativeErrorCode));

export const isNativeErrorCode = (code: unknown): code is NativeErrorCode =>
  typeof code === 'string' && NATIVE_CODES.has(code);

/** An operation or field the server does not serve yet. */
export const NOT_AVAILABLE_YET_KEY = 'apollo.errors.userMessages.operations.notAvailableYet';

/**
 * The legacy i18n key for a native error. VALIDATION with a field message is legacy BAD_USER_INPUT (a
 * ValidationException, validation.exception.ts:11), whose wording is the server's message; a bare VALIDATION is
 * legacy INPUT_VALIDATION_ERROR (metadata.ts:192). A bare VALIDATION located in the document but on no field path
 * is the server's schema validation (HTTP 422) refusing an operation or field it does not serve yet; an UNAVAILABLE on
 * no field path is its selection admission refusing one before execution (server-go PrepareSelections), the same
 * notice.
 */
export const nativeErrorKey = (error: GraphQLFormattedError): string | undefined => {
  const code = error.extensions?.code;
  if (!isNativeErrorCode(code)) return undefined;
  if (code === NativeErrorCode.UNAVAILABLE && !error.path) return NOT_AVAILABLE_YET_KEY;
  if (code === NativeErrorCode.VALIDATION) {
    if (error.locations?.length && !error.path) return NOT_AVAILABLE_YET_KEY;
    return error.message && error.message !== BARE_VALIDATION_MESSAGE
      ? 'apollo.errors.userMessages.validation.badUserInput'
      : 'apollo.errors.userMessages.validation.inputValidation';
  }
  return NATIVE_TO_LEGACY_KEY[code];
};

/**
 * Whether a read failed because the server does not serve it yet (its 422 schema refusal, carried as the network
 * error's payload, or its selection admission refusal): a section on such a read shows its not-available state once.
 */
export const isNotServedYet = (error: ApolloError | undefined): boolean => {
  if (!error) return false;
  const payload = error.networkError && 'result' in error.networkError ? error.networkError.result : undefined;
  const served = typeof payload === 'object' && payload !== null && 'errors' in payload ? payload.errors : [];
  return [...error.graphQLErrors, ...(Array.isArray(served) ? served : [])].some(
    e => nativeErrorKey(e as GraphQLFormattedError) === NOT_AVAILABLE_YET_KEY
  );
};
