// since all the errors are in this enum and not all of them are graphql related
// this enum will grow with time
// Keep in sync with the backend file server/src/common/enums/alkemio.error.status.ts
export enum AlkemioGraphqlErrorCode {
  ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND',
  FORBIDDEN = 'FORBIDDEN',
  FORBIDDEN_POLICY = 'FORBIDDEN_POLICY',
  URL_RESOLVER_ERROR = 'URL_RESOLVER_ERROR',
}
