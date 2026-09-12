// since all the errors are in this enum and not all of them are graphql related
// this enum will grow with time
// Keep in sync with the backend file server/src/common/enums/alkemio.error.status.ts
export enum AlkemioGraphqlErrorCode {
  ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND',
  FORBIDDEN = 'FORBIDDEN',
  FORBIDDEN_POLICY = 'FORBIDDEN_POLICY',
  URL_RESOLVER_ERROR = 'URL_RESOLVER_ERROR',
  // 062 — organization associates
  ROLESET_APPLICATIONS_NOT_ACCEPTED = 'ROLESET_APPLICATIONS_NOT_ACCEPTED',
  ROLESET_JOIN_NOT_ELIGIBLE = 'ROLESET_JOIN_NOT_ELIGIBLE',
  ROLESET_ALREADY_MEMBER = 'ROLESET_ALREADY_MEMBER',
  ROLESET_POLICY_ROLE_LIMITS_VIOLATED = 'ROLESET_POLICY_ROLE_LIMITS_VIOLATED',
}
