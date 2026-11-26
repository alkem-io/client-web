import type { FieldPolicy, FieldReadFunction, TypePolicies, TypePolicy } from '@apollo/client/cache';
export type AboutKeySpecifier = (
  | 'avatar'
  | 'banner'
  | 'card'
  | 'description'
  | 'displayName'
  | 'facets'
  | 'location'
  | 'tagline'
  | AboutKeySpecifier
)[];
export type AboutFieldPolicy = {
  avatar?: FieldPolicy<any> | FieldReadFunction<any>;
  banner?: FieldPolicy<any> | FieldReadFunction<any>;
  card?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  facets?: FieldPolicy<any> | FieldReadFunction<any>;
  location?: FieldPolicy<any> | FieldReadFunction<any>;
  tagline?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AboutFacetKeySpecifier = ('name' | 'namespace' | 'value' | AboutFacetKeySpecifier)[];
export type AboutFacetFieldPolicy = {
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  namespace?: FieldPolicy<any> | FieldReadFunction<any>;
  value?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AccessInspectionKeySpecifier = (
  | 'actor'
  | 'privileges'
  | 'proofs'
  | 'target'
  | AccessInspectionKeySpecifier
)[];
export type AccessInspectionFieldPolicy = {
  actor?: FieldPolicy<any> | FieldReadFunction<any>;
  privileges?: FieldPolicy<any> | FieldReadFunction<any>;
  proofs?: FieldPolicy<any> | FieldReadFunction<any>;
  target?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AccountSummaryKeySpecifier = (
  | 'canAcceptTransfer'
  | 'canCreate'
  | 'entitlements'
  | 'externalSubscriptionId'
  | 'host'
  | 'hosted'
  | 'id'
  | 'planAssignments'
  | AccountSummaryKeySpecifier
)[];
export type AccountSummaryFieldPolicy = {
  canAcceptTransfer?: FieldPolicy<any> | FieldReadFunction<any>;
  canCreate?: FieldPolicy<any> | FieldReadFunction<any>;
  entitlements?: FieldPolicy<any> | FieldReadFunction<any>;
  externalSubscriptionId?: FieldPolicy<any> | FieldReadFunction<any>;
  host?: FieldPolicy<any> | FieldReadFunction<any>;
  hosted?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  planAssignments?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ActivityKeySpecifier = (
  | 'actor'
  | 'createdAt'
  | 'id'
  | 'payload'
  | 'space'
  | 'subject'
  | 'type'
  | ActivityKeySpecifier
)[];
export type ActivityFieldPolicy = {
  actor?: FieldPolicy<any> | FieldReadFunction<any>;
  createdAt?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  payload?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  subject?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ActivityConnectionKeySpecifier = ('edges' | 'pageInfo' | 'totalCount' | ActivityConnectionKeySpecifier)[];
export type ActivityConnectionFieldPolicy = {
  edges?: FieldPolicy<any> | FieldReadFunction<any>;
  pageInfo?: FieldPolicy<any> | FieldReadFunction<any>;
  totalCount?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ActivityEdgeKeySpecifier = ('cursor' | 'node' | ActivityEdgeKeySpecifier)[];
export type ActivityEdgeFieldPolicy = {
  cursor?: FieldPolicy<any> | FieldReadFunction<any>;
  node?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ActivityKindInfoKeySpecifier = ('payloadSchema' | 'type' | ActivityKindInfoKeySpecifier)[];
export type ActivityKindInfoFieldPolicy = {
  payloadSchema?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ActorKeySpecifier = (
  | 'about'
  | 'account'
  | 'actorType'
  | 'can'
  | 'id'
  | 'notificationPrefs'
  | 'settings'
  | 'url'
  | ActorKeySpecifier
)[];
export type ActorFieldPolicy = {
  about?: FieldPolicy<any> | FieldReadFunction<any>;
  account?: FieldPolicy<any> | FieldReadFunction<any>;
  actorType?: FieldPolicy<any> | FieldReadFunction<any>;
  can?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  notificationPrefs?: FieldPolicy<any> | FieldReadFunction<any>;
  settings?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ActorCanKeySpecifier = ('delete' | 'invite' | 'message' | 'read' | 'update' | ActorCanKeySpecifier)[];
export type ActorCanFieldPolicy = {
  delete?: FieldPolicy<any> | FieldReadFunction<any>;
  invite?: FieldPolicy<any> | FieldReadFunction<any>;
  message?: FieldPolicy<any> | FieldReadFunction<any>;
  read?: FieldPolicy<any> | FieldReadFunction<any>;
  update?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ActorConnectionKeySpecifier = ('edges' | 'pageInfo' | 'totalCount' | ActorConnectionKeySpecifier)[];
export type ActorConnectionFieldPolicy = {
  edges?: FieldPolicy<any> | FieldReadFunction<any>;
  pageInfo?: FieldPolicy<any> | FieldReadFunction<any>;
  totalCount?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ActorEdgeKeySpecifier = ('cursor' | 'node' | ActorEdgeKeySpecifier)[];
export type ActorEdgeFieldPolicy = {
  cursor?: FieldPolicy<any> | FieldReadFunction<any>;
  node?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AgentKeySpecifier = (
  | 'about'
  | 'account'
  | 'actorType'
  | 'can'
  | 'engine'
  | 'entityType'
  | 'handle'
  | 'id'
  | 'keywords'
  | 'kind'
  | 'knowledge'
  | 'knowledgeDescription'
  | 'knowledgeKind'
  | 'links'
  | 'memberships'
  | 'modelCard'
  | 'notificationPrefs'
  | 'settings'
  | 'url'
  | AgentKeySpecifier
)[];
export type AgentFieldPolicy = {
  about?: FieldPolicy<any> | FieldReadFunction<any>;
  account?: FieldPolicy<any> | FieldReadFunction<any>;
  actorType?: FieldPolicy<any> | FieldReadFunction<any>;
  can?: FieldPolicy<any> | FieldReadFunction<any>;
  engine?: FieldPolicy<any> | FieldReadFunction<any>;
  entityType?: FieldPolicy<any> | FieldReadFunction<any>;
  handle?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  keywords?: FieldPolicy<any> | FieldReadFunction<any>;
  kind?: FieldPolicy<any> | FieldReadFunction<any>;
  knowledge?: FieldPolicy<any> | FieldReadFunction<any>;
  knowledgeDescription?: FieldPolicy<any> | FieldReadFunction<any>;
  knowledgeKind?: FieldPolicy<any> | FieldReadFunction<any>;
  links?: FieldPolicy<any> | FieldReadFunction<any>;
  memberships?: FieldPolicy<any> | FieldReadFunction<any>;
  modelCard?: FieldPolicy<any> | FieldReadFunction<any>;
  notificationPrefs?: FieldPolicy<any> | FieldReadFunction<any>;
  settings?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AgentModelCardKeySpecifier = (
  | 'aiEngine'
  | 'attestation'
  | 'monitoring'
  | 'spaceUsage'
  | AgentModelCardKeySpecifier
)[];
export type AgentModelCardFieldPolicy = {
  aiEngine?: FieldPolicy<any> | FieldReadFunction<any>;
  attestation?: FieldPolicy<any> | FieldReadFunction<any>;
  monitoring?: FieldPolicy<any> | FieldReadFunction<any>;
  spaceUsage?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AgentModelCardFlagKeySpecifier = ('enabled' | 'name' | AgentModelCardFlagKeySpecifier)[];
export type AgentModelCardFlagFieldPolicy = {
  enabled?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AgentModelCardMonitoringKeySpecifier = (
  | 'isUsageMonitoredByAlkemio'
  | AgentModelCardMonitoringKeySpecifier
)[];
export type AgentModelCardMonitoringFieldPolicy = {
  isUsageMonitoredByAlkemio?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AgentModelCardSpaceUsageKeySpecifier = (
  | 'flags'
  | 'modelCardEntry'
  | AgentModelCardSpaceUsageKeySpecifier
)[];
export type AgentModelCardSpaceUsageFieldPolicy = {
  flags?: FieldPolicy<any> | FieldReadFunction<any>;
  modelCardEntry?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AiEngineKeySpecifier = (
  | 'additionalTechnicalDetails'
  | 'areAnswersRestrictedToBodyOfKnowledge'
  | 'canAccessWebWhenAnswering'
  | 'capabilities'
  | 'displayName'
  | 'enabled'
  | 'hostingLocation'
  | 'isExternal'
  | 'isInteractionDataUsedForTraining'
  | 'isUsingOpenWeightsModel'
  | 'name'
  | AiEngineKeySpecifier
)[];
export type AiEngineFieldPolicy = {
  additionalTechnicalDetails?: FieldPolicy<any> | FieldReadFunction<any>;
  areAnswersRestrictedToBodyOfKnowledge?: FieldPolicy<any> | FieldReadFunction<any>;
  canAccessWebWhenAnswering?: FieldPolicy<any> | FieldReadFunction<any>;
  capabilities?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  enabled?: FieldPolicy<any> | FieldReadFunction<any>;
  hostingLocation?: FieldPolicy<any> | FieldReadFunction<any>;
  isExternal?: FieldPolicy<any> | FieldReadFunction<any>;
  isInteractionDataUsedForTraining?: FieldPolicy<any> | FieldReadFunction<any>;
  isUsingOpenWeightsModel?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ApmConfigKeySpecifier = ('endpoint' | 'rumEnabled' | ApmConfigKeySpecifier)[];
export type ApmConfigFieldPolicy = {
  endpoint?: FieldPolicy<any> | FieldReadFunction<any>;
  rumEnabled?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AttestationKeySpecifier = ('claims' | 'format' | 'id' | 'kind' | 'status' | AttestationKeySpecifier)[];
export type AttestationFieldPolicy = {
  claims?: FieldPolicy<any> | FieldReadFunction<any>;
  format?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  kind?: FieldPolicy<any> | FieldReadFunction<any>;
  status?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AuthorizationProofKeySpecifier = (
  | 'basePrivilege'
  | 'criterion'
  | 'grantId'
  | 'implicationId'
  | 'origin'
  | 'path'
  | 'privilege'
  | AuthorizationProofKeySpecifier
)[];
export type AuthorizationProofFieldPolicy = {
  basePrivilege?: FieldPolicy<any> | FieldReadFunction<any>;
  criterion?: FieldPolicy<any> | FieldReadFunction<any>;
  grantId?: FieldPolicy<any> | FieldReadFunction<any>;
  implicationId?: FieldPolicy<any> | FieldReadFunction<any>;
  origin?: FieldPolicy<any> | FieldReadFunction<any>;
  path?: FieldPolicy<any> | FieldReadFunction<any>;
  privilege?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type BlueprintOmissionKeySpecifier = ('code' | 'path' | BlueprintOmissionKeySpecifier)[];
export type BlueprintOmissionFieldPolicy = {
  code?: FieldPolicy<any> | FieldReadFunction<any>;
  path?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type BlueprintResultKeySpecifier = ('node' | 'omissions' | BlueprintResultKeySpecifier)[];
export type BlueprintResultFieldPolicy = {
  node?: FieldPolicy<any> | FieldReadFunction<any>;
  omissions?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CalendarLinkKeySpecifier = ('provider' | 'url' | CalendarLinkKeySpecifier)[];
export type CalendarLinkFieldPolicy = {
  provider?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CanCreateKeySpecifier = ('allowed' | 'byEntitlement' | 'kind' | 'reason' | CanCreateKeySpecifier)[];
export type CanCreateFieldPolicy = {
  allowed?: FieldPolicy<any> | FieldReadFunction<any>;
  byEntitlement?: FieldPolicy<any> | FieldReadFunction<any>;
  kind?: FieldPolicy<any> | FieldReadFunction<any>;
  reason?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CapabilityKeySpecifier = ('description' | 'displayName' | 'kind' | 'name' | CapabilityKeySpecifier)[];
export type CapabilityFieldPolicy = {
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  kind?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ChoiceKeySpecifier = ('description' | 'id' | 'settings' | 'sortOrder' | 'value' | ChoiceKeySpecifier)[];
export type ChoiceFieldPolicy = {
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  settings?: FieldPolicy<any> | FieldReadFunction<any>;
  sortOrder?: FieldPolicy<any> | FieldReadFunction<any>;
  value?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ChoiceSetRefKeySpecifier = ('id' | 'mode' | 'name' | 'namespace' | 'values' | ChoiceSetRefKeySpecifier)[];
export type ChoiceSetRefFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  mode?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  namespace?: FieldPolicy<any> | FieldReadFunction<any>;
  values?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ClassificationKeySpecifier = (
  | 'id'
  | 'label'
  | 'selected'
  | 'settings'
  | 'values'
  | ClassificationKeySpecifier
)[];
export type ClassificationFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  label?: FieldPolicy<any> | FieldReadFunction<any>;
  selected?: FieldPolicy<any> | FieldReadFunction<any>;
  settings?: FieldPolicy<any> | FieldReadFunction<any>;
  values?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ConfigKeySpecifier = (
  | 'activityKinds'
  | 'aiEngines'
  | 'assistantCapabilities'
  | 'authProviders'
  | 'authentication'
  | 'choiceSets'
  | 'defaultLanguage'
  | 'entitlementCatalog'
  | 'features'
  | 'geo'
  | 'iframeAllowlist'
  | 'languages'
  | 'links'
  | 'matrix'
  | 'notificationKinds'
  | 'platformId'
  | 'pointers'
  | 'postKinds'
  | 'storage'
  | 'telemetry'
  | 'vapidPublicKey'
  | 'versions'
  | 'visualConstraints'
  | ConfigKeySpecifier
)[];
export type ConfigFieldPolicy = {
  activityKinds?: FieldPolicy<any> | FieldReadFunction<any>;
  aiEngines?: FieldPolicy<any> | FieldReadFunction<any>;
  assistantCapabilities?: FieldPolicy<any> | FieldReadFunction<any>;
  authProviders?: FieldPolicy<any> | FieldReadFunction<any>;
  authentication?: FieldPolicy<any> | FieldReadFunction<any>;
  choiceSets?: FieldPolicy<any> | FieldReadFunction<any>;
  defaultLanguage?: FieldPolicy<any> | FieldReadFunction<any>;
  entitlementCatalog?: FieldPolicy<any> | FieldReadFunction<any>;
  features?: FieldPolicy<any> | FieldReadFunction<any>;
  geo?: FieldPolicy<any> | FieldReadFunction<any>;
  iframeAllowlist?: FieldPolicy<any> | FieldReadFunction<any>;
  languages?: FieldPolicy<any> | FieldReadFunction<any>;
  links?: FieldPolicy<any> | FieldReadFunction<any>;
  matrix?: FieldPolicy<any> | FieldReadFunction<any>;
  notificationKinds?: FieldPolicy<any> | FieldReadFunction<any>;
  platformId?: FieldPolicy<any> | FieldReadFunction<any>;
  pointers?: FieldPolicy<any> | FieldReadFunction<any>;
  postKinds?: FieldPolicy<any> | FieldReadFunction<any>;
  storage?: FieldPolicy<any> | FieldReadFunction<any>;
  telemetry?: FieldPolicy<any> | FieldReadFunction<any>;
  vapidPublicKey?: FieldPolicy<any> | FieldReadFunction<any>;
  versions?: FieldPolicy<any> | FieldReadFunction<any>;
  visualConstraints?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ConfigAuthenticationKeySpecifier = ('kratosPublicUrl' | ConfigAuthenticationKeySpecifier)[];
export type ConfigAuthenticationFieldPolicy = {
  kratosPublicUrl?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ConfigGeoKeySpecifier = ('enabled' | 'endpoint' | ConfigGeoKeySpecifier)[];
export type ConfigGeoFieldPolicy = {
  enabled?: FieldPolicy<any> | FieldReadFunction<any>;
  endpoint?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ConfigLinkKeySpecifier = ('key' | 'url' | ConfigLinkKeySpecifier)[];
export type ConfigLinkFieldPolicy = {
  key?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ConfigMatrixKeySpecifier = ('homeserverUrl' | 'serverName' | 'sessionBaseUrl' | ConfigMatrixKeySpecifier)[];
export type ConfigMatrixFieldPolicy = {
  homeserverUrl?: FieldPolicy<any> | FieldReadFunction<any>;
  serverName?: FieldPolicy<any> | FieldReadFunction<any>;
  sessionBaseUrl?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ConfigPointersKeySpecifier = (
  | 'forumSpace'
  | 'guidanceVirtualContributor'
  | 'releasesCategory'
  | ConfigPointersKeySpecifier
)[];
export type ConfigPointersFieldPolicy = {
  forumSpace?: FieldPolicy<any> | FieldReadFunction<any>;
  guidanceVirtualContributor?: FieldPolicy<any> | FieldReadFunction<any>;
  releasesCategory?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ConfigTelemetryKeySpecifier = ('apm' | 'environment' | 'sentry' | ConfigTelemetryKeySpecifier)[];
export type ConfigTelemetryFieldPolicy = {
  apm?: FieldPolicy<any> | FieldReadFunction<any>;
  environment?: FieldPolicy<any> | FieldReadFunction<any>;
  sentry?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ConfigVersionsKeySpecifier = ('server' | ConfigVersionsKeySpecifier)[];
export type ConfigVersionsFieldPolicy = {
  server?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ContributorsContentKeySpecifier = (
  | 'contributors'
  | 'counts'
  | 'settings'
  | ContributorsContentKeySpecifier
)[];
export type ContributorsContentFieldPolicy = {
  contributors?: FieldPolicy<any> | FieldReadFunction<any>;
  counts?: FieldPolicy<any> | FieldReadFunction<any>;
  settings?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CuratedItemKeySpecifier = ('node' | 'role' | 'sortOrder' | CuratedItemKeySpecifier)[];
export type CuratedItemFieldPolicy = {
  node?: FieldPolicy<any> | FieldReadFunction<any>;
  role?: FieldPolicy<any> | FieldReadFunction<any>;
  sortOrder?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type DeleteResultKeySpecifier = ('deletedId' | 'parent' | DeleteResultKeySpecifier)[];
export type DeleteResultFieldPolicy = {
  deletedId?: FieldPolicy<any> | FieldReadFunction<any>;
  parent?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type DocumentKeySpecifier = (
  | 'about'
  | 'can'
  | 'contentFile'
  | 'contentVersion'
  | 'docType'
  | 'draftExpiresAt'
  | 'engine'
  | 'entityType'
  | 'id'
  | 'preview'
  | 'role'
  | 'saveServiceAvailable'
  | 'textSnapshot'
  | 'updatePolicy'
  | 'updatedAt'
  | 'url'
  | 'versions'
  | DocumentKeySpecifier
)[];
export type DocumentFieldPolicy = {
  about?: FieldPolicy<any> | FieldReadFunction<any>;
  can?: FieldPolicy<any> | FieldReadFunction<any>;
  contentFile?: FieldPolicy<any> | FieldReadFunction<any>;
  contentVersion?: FieldPolicy<any> | FieldReadFunction<any>;
  docType?: FieldPolicy<any> | FieldReadFunction<any>;
  draftExpiresAt?: FieldPolicy<any> | FieldReadFunction<any>;
  engine?: FieldPolicy<any> | FieldReadFunction<any>;
  entityType?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  preview?: FieldPolicy<any> | FieldReadFunction<any>;
  role?: FieldPolicy<any> | FieldReadFunction<any>;
  saveServiceAvailable?: FieldPolicy<any> | FieldReadFunction<any>;
  textSnapshot?: FieldPolicy<any> | FieldReadFunction<any>;
  updatePolicy?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedAt?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
  versions?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type DocumentCanKeySpecifier = (
  | 'delete'
  | 'edit'
  | 'privileges'
  | 'read'
  | 'rename'
  | 'share'
  | 'sign'
  | DocumentCanKeySpecifier
)[];
export type DocumentCanFieldPolicy = {
  delete?: FieldPolicy<any> | FieldReadFunction<any>;
  edit?: FieldPolicy<any> | FieldReadFunction<any>;
  privileges?: FieldPolicy<any> | FieldReadFunction<any>;
  read?: FieldPolicy<any> | FieldReadFunction<any>;
  rename?: FieldPolicy<any> | FieldReadFunction<any>;
  share?: FieldPolicy<any> | FieldReadFunction<any>;
  sign?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type DocumentContentKeySpecifier = ('document' | DocumentContentKeySpecifier)[];
export type DocumentContentFieldPolicy = {
  document?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type DocumentSessionKeySpecifier = (
  | 'editDeniedReason'
  | 'editorUrl'
  | 'expiresAt'
  | 'kind'
  | 'token'
  | DocumentSessionKeySpecifier
)[];
export type DocumentSessionFieldPolicy = {
  editDeniedReason?: FieldPolicy<any> | FieldReadFunction<any>;
  editorUrl?: FieldPolicy<any> | FieldReadFunction<any>;
  expiresAt?: FieldPolicy<any> | FieldReadFunction<any>;
  kind?: FieldPolicy<any> | FieldReadFunction<any>;
  token?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type EntitlementKeySpecifier = ('limit' | 'name' | 'usage' | EntitlementKeySpecifier)[];
export type EntitlementFieldPolicy = {
  limit?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  usage?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type EntitlementAvailabilityKeySpecifier = (
  | 'allowed'
  | 'name'
  | 'reason'
  | 'remaining'
  | EntitlementAvailabilityKeySpecifier
)[];
export type EntitlementAvailabilityFieldPolicy = {
  allowed?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  reason?: FieldPolicy<any> | FieldReadFunction<any>;
  remaining?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type EntitlementCreationKindKeySpecifier = ('entityType' | 'kind' | EntitlementCreationKindKeySpecifier)[];
export type EntitlementCreationKindFieldPolicy = {
  entityType?: FieldPolicy<any> | FieldReadFunction<any>;
  kind?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type EntitlementInfoKeySpecifier = (
  | 'creationKinds'
  | 'effectiveEntitlement'
  | 'name'
  | 'usagePriority'
  | EntitlementInfoKeySpecifier
)[];
export type EntitlementInfoFieldPolicy = {
  creationKinds?: FieldPolicy<any> | FieldReadFunction<any>;
  effectiveEntitlement?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  usagePriority?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type EventContentKeySpecifier = (
  | 'allDay'
  | 'calendarLinks'
  | 'endsAt'
  | 'endsOn'
  | 'location'
  | 'rollUp'
  | 'startsAt'
  | 'startsOn'
  | 'timezone'
  | 'type'
  | EventContentKeySpecifier
)[];
export type EventContentFieldPolicy = {
  allDay?: FieldPolicy<any> | FieldReadFunction<any>;
  calendarLinks?: FieldPolicy<any> | FieldReadFunction<any>;
  endsAt?: FieldPolicy<any> | FieldReadFunction<any>;
  endsOn?: FieldPolicy<any> | FieldReadFunction<any>;
  location?: FieldPolicy<any> | FieldReadFunction<any>;
  rollUp?: FieldPolicy<any> | FieldReadFunction<any>;
  startsAt?: FieldPolicy<any> | FieldReadFunction<any>;
  startsOn?: FieldPolicy<any> | FieldReadFunction<any>;
  timezone?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type FileKeySpecifier = (
  | 'can'
  | 'createdAt'
  | 'folder'
  | 'id'
  | 'mime'
  | 'name'
  | 'size'
  | 'uploadedBy'
  | 'url'
  | FileKeySpecifier
)[];
export type FileFieldPolicy = {
  can?: FieldPolicy<any> | FieldReadFunction<any>;
  createdAt?: FieldPolicy<any> | FieldReadFunction<any>;
  folder?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  mime?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  size?: FieldPolicy<any> | FieldReadFunction<any>;
  uploadedBy?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type FileCanKeySpecifier = ('delete' | FileCanKeySpecifier)[];
export type FileCanFieldPolicy = {
  delete?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type FileConnectionKeySpecifier = ('edges' | 'pageInfo' | 'totalCount' | FileConnectionKeySpecifier)[];
export type FileConnectionFieldPolicy = {
  edges?: FieldPolicy<any> | FieldReadFunction<any>;
  pageInfo?: FieldPolicy<any> | FieldReadFunction<any>;
  totalCount?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type FileEdgeKeySpecifier = ('cursor' | 'node' | FileEdgeKeySpecifier)[];
export type FileEdgeFieldPolicy = {
  cursor?: FieldPolicy<any> | FieldReadFunction<any>;
  node?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type FileRefKeySpecifier = ('alt' | 'aspectRatio' | 'file' | FileRefKeySpecifier)[];
export type FileRefFieldPolicy = {
  alt?: FieldPolicy<any> | FieldReadFunction<any>;
  aspectRatio?: FieldPolicy<any> | FieldReadFunction<any>;
  file?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type FormContentKeySpecifier = ('myResponseCount' | 'questions' | 'responseCount' | FormContentKeySpecifier)[];
export type FormContentFieldPolicy = {
  myResponseCount?: FieldPolicy<any> | FieldReadFunction<any>;
  questions?: FieldPolicy<any> | FieldReadFunction<any>;
  responseCount?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type FormResponseContentKeySpecifier = ('answers' | FormResponseContentKeySpecifier)[];
export type FormResponseContentFieldPolicy = {
  answers?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type GalleryContentKeySpecifier = ('images' | GalleryContentKeySpecifier)[];
export type GalleryContentFieldPolicy = {
  images?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type GenericActorKeySpecifier = (
  | 'about'
  | 'account'
  | 'actorType'
  | 'can'
  | 'entityType'
  | 'id'
  | 'notificationPrefs'
  | 'settings'
  | 'url'
  | GenericActorKeySpecifier
)[];
export type GenericActorFieldPolicy = {
  about?: FieldPolicy<any> | FieldReadFunction<any>;
  account?: FieldPolicy<any> | FieldReadFunction<any>;
  actorType?: FieldPolicy<any> | FieldReadFunction<any>;
  can?: FieldPolicy<any> | FieldReadFunction<any>;
  entityType?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  notificationPrefs?: FieldPolicy<any> | FieldReadFunction<any>;
  settings?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type HostedResourcesKeySpecifier = ('agents' | 'homepages' | 'packs' | 'spaces' | HostedResourcesKeySpecifier)[];
export type HostedResourcesFieldPolicy = {
  agents?: FieldPolicy<any> | FieldReadFunction<any>;
  homepages?: FieldPolicy<any> | FieldReadFunction<any>;
  packs?: FieldPolicy<any> | FieldReadFunction<any>;
  spaces?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InnovationPackKeySpecifier = ('about' | 'entityType' | 'id' | InnovationPackKeySpecifier)[];
export type InnovationPackFieldPolicy = {
  about?: FieldPolicy<any> | FieldReadFunction<any>;
  entityType?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InviteOutcomeKeySpecifier = (
  | 'actor'
  | 'email'
  | 'noOrganizationAdmin'
  | 'outcome'
  | 'request'
  | InviteOutcomeKeySpecifier
)[];
export type InviteOutcomeFieldPolicy = {
  actor?: FieldPolicy<any> | FieldReadFunction<any>;
  email?: FieldPolicy<any> | FieldReadFunction<any>;
  noOrganizationAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  outcome?: FieldPolicy<any> | FieldReadFunction<any>;
  request?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type JoiningSpaceKeySpecifier = ('displayName' | 'url' | JoiningSpaceKeySpecifier)[];
export type JoiningSpaceFieldPolicy = {
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type LinkKeySpecifier = (
  | 'description'
  | 'file'
  | 'id'
  | 'role'
  | 'sortOrder'
  | 'title'
  | 'uri'
  | LinkKeySpecifier
)[];
export type LinkFieldPolicy = {
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  file?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  role?: FieldPolicy<any> | FieldReadFunction<any>;
  sortOrder?: FieldPolicy<any> | FieldReadFunction<any>;
  title?: FieldPolicy<any> | FieldReadFunction<any>;
  uri?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type LinkContentKeySpecifier = ('link' | LinkContentKeySpecifier)[];
export type LinkContentFieldPolicy = {
  link?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MatrixAccessKeySpecifier = ('expiresAt' | 'sessionBaseUrl' | 'userId' | MatrixAccessKeySpecifier)[];
export type MatrixAccessFieldPolicy = {
  expiresAt?: FieldPolicy<any> | FieldReadFunction<any>;
  sessionBaseUrl?: FieldPolicy<any> | FieldReadFunction<any>;
  userId?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MemberKeySpecifier = ('actor' | 'entityType' | 'id' | 'joinedAt' | 'roles' | MemberKeySpecifier)[];
export type MemberFieldPolicy = {
  actor?: FieldPolicy<any> | FieldReadFunction<any>;
  entityType?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  joinedAt?: FieldPolicy<any> | FieldReadFunction<any>;
  roles?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MemberConnectionKeySpecifier = ('edges' | 'pageInfo' | 'totalCount' | MemberConnectionKeySpecifier)[];
export type MemberConnectionFieldPolicy = {
  edges?: FieldPolicy<any> | FieldReadFunction<any>;
  pageInfo?: FieldPolicy<any> | FieldReadFunction<any>;
  totalCount?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MemberEdgeKeySpecifier = ('cursor' | 'node' | MemberEdgeKeySpecifier)[];
export type MemberEdgeFieldPolicy = {
  cursor?: FieldPolicy<any> | FieldReadFunction<any>;
  node?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MembershipKeySpecifier = ('request' | 'roles' | 'status' | 'wouldJoin' | MembershipKeySpecifier)[];
export type MembershipFieldPolicy = {
  request?: FieldPolicy<any> | FieldReadFunction<any>;
  roles?: FieldPolicy<any> | FieldReadFunction<any>;
  status?: FieldPolicy<any> | FieldReadFunction<any>;
  wouldJoin?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MembershipRequestKeySpecifier = (
  | 'actor'
  | 'answers'
  | 'availableEvents'
  | 'createdAt'
  | 'createdBy'
  | 'decidedAt'
  | 'decidedBy'
  | 'direction'
  | 'email'
  | 'id'
  | 'language'
  | 'message'
  | 'profileCreated'
  | 'resource'
  | 'roles'
  | 'space'
  | 'state'
  | 'updatedAt'
  | 'withheldRoles'
  | 'wouldJoin'
  | MembershipRequestKeySpecifier
)[];
export type MembershipRequestFieldPolicy = {
  actor?: FieldPolicy<any> | FieldReadFunction<any>;
  answers?: FieldPolicy<any> | FieldReadFunction<any>;
  availableEvents?: FieldPolicy<any> | FieldReadFunction<any>;
  createdAt?: FieldPolicy<any> | FieldReadFunction<any>;
  createdBy?: FieldPolicy<any> | FieldReadFunction<any>;
  decidedAt?: FieldPolicy<any> | FieldReadFunction<any>;
  decidedBy?: FieldPolicy<any> | FieldReadFunction<any>;
  direction?: FieldPolicy<any> | FieldReadFunction<any>;
  email?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  language?: FieldPolicy<any> | FieldReadFunction<any>;
  message?: FieldPolicy<any> | FieldReadFunction<any>;
  profileCreated?: FieldPolicy<any> | FieldReadFunction<any>;
  resource?: FieldPolicy<any> | FieldReadFunction<any>;
  roles?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  state?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedAt?: FieldPolicy<any> | FieldReadFunction<any>;
  withheldRoles?: FieldPolicy<any> | FieldReadFunction<any>;
  wouldJoin?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MembershipRequestConnectionKeySpecifier = (
  | 'edges'
  | 'pageInfo'
  | 'totalCount'
  | MembershipRequestConnectionKeySpecifier
)[];
export type MembershipRequestConnectionFieldPolicy = {
  edges?: FieldPolicy<any> | FieldReadFunction<any>;
  pageInfo?: FieldPolicy<any> | FieldReadFunction<any>;
  totalCount?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MembershipRequestEdgeKeySpecifier = ('cursor' | 'node' | MembershipRequestEdgeKeySpecifier)[];
export type MembershipRequestEdgeFieldPolicy = {
  cursor?: FieldPolicy<any> | FieldReadFunction<any>;
  node?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MembershipResultKeySpecifier = ('node' | 'request' | 'viewer' | MembershipResultKeySpecifier)[];
export type MembershipResultFieldPolicy = {
  node?: FieldPolicy<any> | FieldReadFunction<any>;
  request?: FieldPolicy<any> | FieldReadFunction<any>;
  viewer?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MutationKeySpecifier = (
  | 'addClassification'
  | 'assignPlan'
  | 'attachFile'
  | 'createDocument'
  | 'createSpace'
  | 'createTemplate'
  | 'deleteDocument'
  | 'deleteFile'
  | 'deleteLink'
  | 'deletePlan'
  | 'deleteSpace'
  | 'detachFile'
  | 'inspectAccess'
  | 'invite'
  | 'leave'
  | 'openDocument'
  | 'pinSubspace'
  | 'removeClassification'
  | 'reorderSubspaces'
  | 'replaceDocument'
  | 'requestUpload'
  | 'resendInvitation'
  | 'respondToRequest'
  | 'revokePlan'
  | 'setLabels'
  | 'setPostStatus'
  | 'setReferences'
  | 'setRoles'
  | 'setSettings'
  | 'setSpaceAudience'
  | 'setTemplateDefault'
  | 'subscribePush'
  | 'unsubscribePush'
  | 'updateActor'
  | 'updateClassification'
  | 'updateDocument'
  | 'updatePost'
  | 'updateSpace'
  | 'updateTemplate'
  | 'upsertLink'
  | 'upsertPlan'
  | MutationKeySpecifier
)[];
export type MutationFieldPolicy = {
  addClassification?: FieldPolicy<any> | FieldReadFunction<any>;
  assignPlan?: FieldPolicy<any> | FieldReadFunction<any>;
  attachFile?: FieldPolicy<any> | FieldReadFunction<any>;
  createDocument?: FieldPolicy<any> | FieldReadFunction<any>;
  createSpace?: FieldPolicy<any> | FieldReadFunction<any>;
  createTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteDocument?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteFile?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteLink?: FieldPolicy<any> | FieldReadFunction<any>;
  deletePlan?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteSpace?: FieldPolicy<any> | FieldReadFunction<any>;
  detachFile?: FieldPolicy<any> | FieldReadFunction<any>;
  inspectAccess?: FieldPolicy<any> | FieldReadFunction<any>;
  invite?: FieldPolicy<any> | FieldReadFunction<any>;
  leave?: FieldPolicy<any> | FieldReadFunction<any>;
  openDocument?: FieldPolicy<any> | FieldReadFunction<any>;
  pinSubspace?: FieldPolicy<any> | FieldReadFunction<any>;
  removeClassification?: FieldPolicy<any> | FieldReadFunction<any>;
  reorderSubspaces?: FieldPolicy<any> | FieldReadFunction<any>;
  replaceDocument?: FieldPolicy<any> | FieldReadFunction<any>;
  requestUpload?: FieldPolicy<any> | FieldReadFunction<any>;
  resendInvitation?: FieldPolicy<any> | FieldReadFunction<any>;
  respondToRequest?: FieldPolicy<any> | FieldReadFunction<any>;
  revokePlan?: FieldPolicy<any> | FieldReadFunction<any>;
  setLabels?: FieldPolicy<any> | FieldReadFunction<any>;
  setPostStatus?: FieldPolicy<any> | FieldReadFunction<any>;
  setReferences?: FieldPolicy<any> | FieldReadFunction<any>;
  setRoles?: FieldPolicy<any> | FieldReadFunction<any>;
  setSettings?: FieldPolicy<any> | FieldReadFunction<any>;
  setSpaceAudience?: FieldPolicy<any> | FieldReadFunction<any>;
  setTemplateDefault?: FieldPolicy<any> | FieldReadFunction<any>;
  subscribePush?: FieldPolicy<any> | FieldReadFunction<any>;
  unsubscribePush?: FieldPolicy<any> | FieldReadFunction<any>;
  updateActor?: FieldPolicy<any> | FieldReadFunction<any>;
  updateClassification?: FieldPolicy<any> | FieldReadFunction<any>;
  updateDocument?: FieldPolicy<any> | FieldReadFunction<any>;
  updatePost?: FieldPolicy<any> | FieldReadFunction<any>;
  updateSpace?: FieldPolicy<any> | FieldReadFunction<any>;
  updateTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
  upsertLink?: FieldPolicy<any> | FieldReadFunction<any>;
  upsertPlan?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type NodeKeySpecifier = ('entityType' | 'id' | NodeKeySpecifier)[];
export type NodeFieldPolicy = {
  entityType?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type NodeConnectionKeySpecifier = ('edges' | 'pageInfo' | 'totalCount' | NodeConnectionKeySpecifier)[];
export type NodeConnectionFieldPolicy = {
  edges?: FieldPolicy<any> | FieldReadFunction<any>;
  pageInfo?: FieldPolicy<any> | FieldReadFunction<any>;
  totalCount?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type NodeEdgeKeySpecifier = ('cursor' | 'node' | NodeEdgeKeySpecifier)[];
export type NodeEdgeFieldPolicy = {
  cursor?: FieldPolicy<any> | FieldReadFunction<any>;
  node?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type NotificationKeySpecifier = (
  | 'category'
  | 'createdAt'
  | 'id'
  | 'payload'
  | 'readAt'
  | 'state'
  | 'type'
  | NotificationKeySpecifier
)[];
export type NotificationFieldPolicy = {
  category?: FieldPolicy<any> | FieldReadFunction<any>;
  createdAt?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  payload?: FieldPolicy<any> | FieldReadFunction<any>;
  readAt?: FieldPolicy<any> | FieldReadFunction<any>;
  state?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type NotificationConnectionKeySpecifier = (
  | 'edges'
  | 'pageInfo'
  | 'totalCount'
  | NotificationConnectionKeySpecifier
)[];
export type NotificationConnectionFieldPolicy = {
  edges?: FieldPolicy<any> | FieldReadFunction<any>;
  pageInfo?: FieldPolicy<any> | FieldReadFunction<any>;
  totalCount?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type NotificationDebounceKeySpecifier = ('max' | 'quiet' | NotificationDebounceKeySpecifier)[];
export type NotificationDebounceFieldPolicy = {
  max?: FieldPolicy<any> | FieldReadFunction<any>;
  quiet?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type NotificationEdgeKeySpecifier = ('cursor' | 'node' | NotificationEdgeKeySpecifier)[];
export type NotificationEdgeFieldPolicy = {
  cursor?: FieldPolicy<any> | FieldReadFunction<any>;
  node?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type NotificationKindInfoKeySpecifier = (
  | 'category'
  | 'channels'
  | 'debounce'
  | 'defaults'
  | 'locked'
  | 'payloadSchema'
  | 'type'
  | NotificationKindInfoKeySpecifier
)[];
export type NotificationKindInfoFieldPolicy = {
  category?: FieldPolicy<any> | FieldReadFunction<any>;
  channels?: FieldPolicy<any> | FieldReadFunction<any>;
  debounce?: FieldPolicy<any> | FieldReadFunction<any>;
  defaults?: FieldPolicy<any> | FieldReadFunction<any>;
  locked?: FieldPolicy<any> | FieldReadFunction<any>;
  payloadSchema?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type OrganizationKeySpecifier = (
  | 'about'
  | 'account'
  | 'actorType'
  | 'associateCount'
  | 'associates'
  | 'can'
  | 'capabilities'
  | 'domain'
  | 'entityType'
  | 'handle'
  | 'hosted'
  | 'id'
  | 'legalName'
  | 'links'
  | 'notificationPrefs'
  | 'settings'
  | 'spacesLed'
  | 'spacesMemberOf'
  | 'tags'
  | 'url'
  | 'verification'
  | 'website'
  | OrganizationKeySpecifier
)[];
export type OrganizationFieldPolicy = {
  about?: FieldPolicy<any> | FieldReadFunction<any>;
  account?: FieldPolicy<any> | FieldReadFunction<any>;
  actorType?: FieldPolicy<any> | FieldReadFunction<any>;
  associateCount?: FieldPolicy<any> | FieldReadFunction<any>;
  associates?: FieldPolicy<any> | FieldReadFunction<any>;
  can?: FieldPolicy<any> | FieldReadFunction<any>;
  capabilities?: FieldPolicy<any> | FieldReadFunction<any>;
  domain?: FieldPolicy<any> | FieldReadFunction<any>;
  entityType?: FieldPolicy<any> | FieldReadFunction<any>;
  handle?: FieldPolicy<any> | FieldReadFunction<any>;
  hosted?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  legalName?: FieldPolicy<any> | FieldReadFunction<any>;
  links?: FieldPolicy<any> | FieldReadFunction<any>;
  notificationPrefs?: FieldPolicy<any> | FieldReadFunction<any>;
  settings?: FieldPolicy<any> | FieldReadFunction<any>;
  spacesLed?: FieldPolicy<any> | FieldReadFunction<any>;
  spacesMemberOf?: FieldPolicy<any> | FieldReadFunction<any>;
  tags?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
  verification?: FieldPolicy<any> | FieldReadFunction<any>;
  website?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type OrganizationMembershipKeySpecifier = ('organization' | 'roles' | OrganizationMembershipKeySpecifier)[];
export type OrganizationMembershipFieldPolicy = {
  organization?: FieldPolicy<any> | FieldReadFunction<any>;
  roles?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PageInfoKeySpecifier = (
  | 'endCursor'
  | 'hasNextPage'
  | 'hasPreviousPage'
  | 'startCursor'
  | PageInfoKeySpecifier
)[];
export type PageInfoFieldPolicy = {
  endCursor?: FieldPolicy<any> | FieldReadFunction<any>;
  hasNextPage?: FieldPolicy<any> | FieldReadFunction<any>;
  hasPreviousPage?: FieldPolicy<any> | FieldReadFunction<any>;
  startCursor?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PlanKeySpecifier = (
  | 'autoAssignTo'
  | 'enabled'
  | 'entitlements'
  | 'id'
  | 'name'
  | 'pricing'
  | 'requiresContact'
  | 'scope'
  | 'sortOrder'
  | 'tier'
  | PlanKeySpecifier
)[];
export type PlanFieldPolicy = {
  autoAssignTo?: FieldPolicy<any> | FieldReadFunction<any>;
  enabled?: FieldPolicy<any> | FieldReadFunction<any>;
  entitlements?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  pricing?: FieldPolicy<any> | FieldReadFunction<any>;
  requiresContact?: FieldPolicy<any> | FieldReadFunction<any>;
  scope?: FieldPolicy<any> | FieldReadFunction<any>;
  sortOrder?: FieldPolicy<any> | FieldReadFunction<any>;
  tier?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PlanAssignmentKeySpecifier = (
  | 'assignedAt'
  | 'expiresAt'
  | 'externalRef'
  | 'id'
  | 'plan'
  | PlanAssignmentKeySpecifier
)[];
export type PlanAssignmentFieldPolicy = {
  assignedAt?: FieldPolicy<any> | FieldReadFunction<any>;
  expiresAt?: FieldPolicy<any> | FieldReadFunction<any>;
  externalRef?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  plan?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PollContentKeySpecifier = (
  | 'deadline'
  | 'myVotes'
  | 'options'
  | 'question'
  | 'settings'
  | 'status'
  | 'totalVotes'
  | PollContentKeySpecifier
)[];
export type PollContentFieldPolicy = {
  deadline?: FieldPolicy<any> | FieldReadFunction<any>;
  myVotes?: FieldPolicy<any> | FieldReadFunction<any>;
  options?: FieldPolicy<any> | FieldReadFunction<any>;
  question?: FieldPolicy<any> | FieldReadFunction<any>;
  settings?: FieldPolicy<any> | FieldReadFunction<any>;
  status?: FieldPolicy<any> | FieldReadFunction<any>;
  totalVotes?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PollOptionKeySpecifier = (
  | 'id'
  | 'mine'
  | 'percentage'
  | 'sortOrder'
  | 'value'
  | 'voters'
  | 'votes'
  | PollOptionKeySpecifier
)[];
export type PollOptionFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  mine?: FieldPolicy<any> | FieldReadFunction<any>;
  percentage?: FieldPolicy<any> | FieldReadFunction<any>;
  sortOrder?: FieldPolicy<any> | FieldReadFunction<any>;
  value?: FieldPolicy<any> | FieldReadFunction<any>;
  voters?: FieldPolicy<any> | FieldReadFunction<any>;
  votes?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PostKeySpecifier = (
  | 'about'
  | 'author'
  | 'availableEvents'
  | 'can'
  | 'commentsEnabled'
  | 'content'
  | 'contentKind'
  | 'createdAt'
  | 'entityType'
  | 'handle'
  | 'id'
  | 'links'
  | 'parentPost'
  | 'publishedAt'
  | 'publishedBy'
  | 'responseCount'
  | 'responseDefaults'
  | 'responseKind'
  | 'responsePolicy'
  | 'responses'
  | 'room'
  | 'sortOrder'
  | 'space'
  | 'stage'
  | 'status'
  | 'tags'
  | 'updatedAt'
  | 'url'
  | PostKeySpecifier
)[];
export type PostFieldPolicy = {
  about?: FieldPolicy<any> | FieldReadFunction<any>;
  author?: FieldPolicy<any> | FieldReadFunction<any>;
  availableEvents?: FieldPolicy<any> | FieldReadFunction<any>;
  can?: FieldPolicy<any> | FieldReadFunction<any>;
  commentsEnabled?: FieldPolicy<any> | FieldReadFunction<any>;
  content?: FieldPolicy<any> | FieldReadFunction<any>;
  contentKind?: FieldPolicy<any> | FieldReadFunction<any>;
  createdAt?: FieldPolicy<any> | FieldReadFunction<any>;
  entityType?: FieldPolicy<any> | FieldReadFunction<any>;
  handle?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  links?: FieldPolicy<any> | FieldReadFunction<any>;
  parentPost?: FieldPolicy<any> | FieldReadFunction<any>;
  publishedAt?: FieldPolicy<any> | FieldReadFunction<any>;
  publishedBy?: FieldPolicy<any> | FieldReadFunction<any>;
  responseCount?: FieldPolicy<any> | FieldReadFunction<any>;
  responseDefaults?: FieldPolicy<any> | FieldReadFunction<any>;
  responseKind?: FieldPolicy<any> | FieldReadFunction<any>;
  responsePolicy?: FieldPolicy<any> | FieldReadFunction<any>;
  responses?: FieldPolicy<any> | FieldReadFunction<any>;
  room?: FieldPolicy<any> | FieldReadFunction<any>;
  sortOrder?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  stage?: FieldPolicy<any> | FieldReadFunction<any>;
  status?: FieldPolicy<any> | FieldReadFunction<any>;
  tags?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedAt?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PostCanKeySpecifier = (
  | 'comment'
  | 'delete'
  | 'manageColumns'
  | 'move'
  | 'moveTask'
  | 'privileges'
  | 'publish'
  | 'react'
  | 'read'
  | 'respond'
  | 'share'
  | 'update'
  | 'vote'
  | PostCanKeySpecifier
)[];
export type PostCanFieldPolicy = {
  comment?: FieldPolicy<any> | FieldReadFunction<any>;
  delete?: FieldPolicy<any> | FieldReadFunction<any>;
  manageColumns?: FieldPolicy<any> | FieldReadFunction<any>;
  move?: FieldPolicy<any> | FieldReadFunction<any>;
  moveTask?: FieldPolicy<any> | FieldReadFunction<any>;
  privileges?: FieldPolicy<any> | FieldReadFunction<any>;
  publish?: FieldPolicy<any> | FieldReadFunction<any>;
  react?: FieldPolicy<any> | FieldReadFunction<any>;
  read?: FieldPolicy<any> | FieldReadFunction<any>;
  respond?: FieldPolicy<any> | FieldReadFunction<any>;
  share?: FieldPolicy<any> | FieldReadFunction<any>;
  update?: FieldPolicy<any> | FieldReadFunction<any>;
  vote?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PostConnectionKeySpecifier = ('edges' | 'pageInfo' | 'totalCount' | PostConnectionKeySpecifier)[];
export type PostConnectionFieldPolicy = {
  edges?: FieldPolicy<any> | FieldReadFunction<any>;
  pageInfo?: FieldPolicy<any> | FieldReadFunction<any>;
  totalCount?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PostEdgeKeySpecifier = ('cursor' | 'node' | PostEdgeKeySpecifier)[];
export type PostEdgeFieldPolicy = {
  cursor?: FieldPolicy<any> | FieldReadFunction<any>;
  node?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PostKindInfoKeySpecifier = (
  | 'blueprintSchema'
  | 'computed'
  | 'kind'
  | 'role'
  | 'settingsSchema'
  | 'templatable'
  | PostKindInfoKeySpecifier
)[];
export type PostKindInfoFieldPolicy = {
  blueprintSchema?: FieldPolicy<any> | FieldReadFunction<any>;
  computed?: FieldPolicy<any> | FieldReadFunction<any>;
  kind?: FieldPolicy<any> | FieldReadFunction<any>;
  role?: FieldPolicy<any> | FieldReadFunction<any>;
  settingsSchema?: FieldPolicy<any> | FieldReadFunction<any>;
  templatable?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PushSubscriptionKeySpecifier = (
  | 'endpoint'
  | 'id'
  | 'status'
  | 'userAgent'
  | PushSubscriptionKeySpecifier
)[];
export type PushSubscriptionFieldPolicy = {
  endpoint?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  status?: FieldPolicy<any> | FieldReadFunction<any>;
  userAgent?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type QueryKeySpecifier = (
  | 'activity'
  | 'actors'
  | 'candidates'
  | 'config'
  | 'files'
  | 'library'
  | 'members'
  | 'node'
  | 'notifications'
  | 'plans'
  | 'post'
  | 'requests'
  | 'resolve'
  | 'rolePolicies'
  | 'spaceActivity'
  | 'spacePosts'
  | 'spaces'
  | 'subtree'
  | 'templateDefaults'
  | 'templates'
  | 'viewer'
  | QueryKeySpecifier
)[];
export type QueryFieldPolicy = {
  activity?: FieldPolicy<any> | FieldReadFunction<any>;
  actors?: FieldPolicy<any> | FieldReadFunction<any>;
  candidates?: FieldPolicy<any> | FieldReadFunction<any>;
  config?: FieldPolicy<any> | FieldReadFunction<any>;
  files?: FieldPolicy<any> | FieldReadFunction<any>;
  library?: FieldPolicy<any> | FieldReadFunction<any>;
  members?: FieldPolicy<any> | FieldReadFunction<any>;
  node?: FieldPolicy<any> | FieldReadFunction<any>;
  notifications?: FieldPolicy<any> | FieldReadFunction<any>;
  plans?: FieldPolicy<any> | FieldReadFunction<any>;
  post?: FieldPolicy<any> | FieldReadFunction<any>;
  requests?: FieldPolicy<any> | FieldReadFunction<any>;
  resolve?: FieldPolicy<any> | FieldReadFunction<any>;
  rolePolicies?: FieldPolicy<any> | FieldReadFunction<any>;
  spaceActivity?: FieldPolicy<any> | FieldReadFunction<any>;
  spacePosts?: FieldPolicy<any> | FieldReadFunction<any>;
  spaces?: FieldPolicy<any> | FieldReadFunction<any>;
  subtree?: FieldPolicy<any> | FieldReadFunction<any>;
  templateDefaults?: FieldPolicy<any> | FieldReadFunction<any>;
  templates?: FieldPolicy<any> | FieldReadFunction<any>;
  viewer?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type RecentSpaceKeySpecifier = ('lastParticipatedAt' | 'space' | RecentSpaceKeySpecifier)[];
export type RecentSpaceFieldPolicy = {
  lastParticipatedAt?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ResolveResultKeySpecifier = (
  | 'ancestors'
  | 'closestReadable'
  | 'homepage'
  | 'matchedPrefix'
  | 'node'
  | 'remainder'
  | 'space'
  | 'state'
  | ResolveResultKeySpecifier
)[];
export type ResolveResultFieldPolicy = {
  ancestors?: FieldPolicy<any> | FieldReadFunction<any>;
  closestReadable?: FieldPolicy<any> | FieldReadFunction<any>;
  homepage?: FieldPolicy<any> | FieldReadFunction<any>;
  matchedPrefix?: FieldPolicy<any> | FieldReadFunction<any>;
  node?: FieldPolicy<any> | FieldReadFunction<any>;
  remainder?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  state?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type RolePolicyKeySpecifier = (
  | 'actorType'
  | 'entryModes'
  | 'holders'
  | 'maxHolders'
  | 'minHolders'
  | 'role'
  | RolePolicyKeySpecifier
)[];
export type RolePolicyFieldPolicy = {
  actorType?: FieldPolicy<any> | FieldReadFunction<any>;
  entryModes?: FieldPolicy<any> | FieldReadFunction<any>;
  holders?: FieldPolicy<any> | FieldReadFunction<any>;
  maxHolders?: FieldPolicy<any> | FieldReadFunction<any>;
  minHolders?: FieldPolicy<any> | FieldReadFunction<any>;
  role?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type RoomKeySpecifier = (
  | 'can'
  | 'entityType'
  | 'id'
  | 'kind'
  | 'lastMessageAt'
  | 'messageCount'
  | RoomKeySpecifier
)[];
export type RoomFieldPolicy = {
  can?: FieldPolicy<any> | FieldReadFunction<any>;
  entityType?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  kind?: FieldPolicy<any> | FieldReadFunction<any>;
  lastMessageAt?: FieldPolicy<any> | FieldReadFunction<any>;
  messageCount?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type RoomCanKeySpecifier = ('createMessage' | 'deleteAny' | 'react' | RoomCanKeySpecifier)[];
export type RoomCanFieldPolicy = {
  createMessage?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteAny?: FieldPolicy<any> | FieldReadFunction<any>;
  react?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SentryConfigKeySpecifier = (
  | 'enabled'
  | 'endpoint'
  | 'environment'
  | 'submitPII'
  | SentryConfigKeySpecifier
)[];
export type SentryConfigFieldPolicy = {
  enabled?: FieldPolicy<any> | FieldReadFunction<any>;
  endpoint?: FieldPolicy<any> | FieldReadFunction<any>;
  environment?: FieldPolicy<any> | FieldReadFunction<any>;
  submitPII?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SessionInfoKeySpecifier = (
  | 'authMethods'
  | 'authenticated'
  | 'fresh'
  | 'issuedAt'
  | SessionInfoKeySpecifier
)[];
export type SessionInfoFieldPolicy = {
  authMethods?: FieldPolicy<any> | FieldReadFunction<any>;
  authenticated?: FieldPolicy<any> | FieldReadFunction<any>;
  fresh?: FieldPolicy<any> | FieldReadFunction<any>;
  issuedAt?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SpaceKeySpecifier = (
  | 'about'
  | 'activityScore'
  | 'applicationForm'
  | 'audience'
  | 'can'
  | 'classifications'
  | 'createdAt'
  | 'curated'
  | 'depth'
  | 'entitlements'
  | 'entityType'
  | 'guidelines'
  | 'handle'
  | 'host'
  | 'id'
  | 'isContentPublic'
  | 'kind'
  | 'leads'
  | 'links'
  | 'memberCount'
  | 'membership'
  | 'parent'
  | 'pinned'
  | 'planAssignments'
  | 'settings'
  | 'sortOrder'
  | 'stages'
  | 'status'
  | 'subdomain'
  | 'subspaces'
  | 'tags'
  | 'templateCount'
  | 'url'
  | 'videoCallUrl'
  | SpaceKeySpecifier
)[];
export type SpaceFieldPolicy = {
  about?: FieldPolicy<any> | FieldReadFunction<any>;
  activityScore?: FieldPolicy<any> | FieldReadFunction<any>;
  applicationForm?: FieldPolicy<any> | FieldReadFunction<any>;
  audience?: FieldPolicy<any> | FieldReadFunction<any>;
  can?: FieldPolicy<any> | FieldReadFunction<any>;
  classifications?: FieldPolicy<any> | FieldReadFunction<any>;
  createdAt?: FieldPolicy<any> | FieldReadFunction<any>;
  curated?: FieldPolicy<any> | FieldReadFunction<any>;
  depth?: FieldPolicy<any> | FieldReadFunction<any>;
  entitlements?: FieldPolicy<any> | FieldReadFunction<any>;
  entityType?: FieldPolicy<any> | FieldReadFunction<any>;
  guidelines?: FieldPolicy<any> | FieldReadFunction<any>;
  handle?: FieldPolicy<any> | FieldReadFunction<any>;
  host?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  isContentPublic?: FieldPolicy<any> | FieldReadFunction<any>;
  kind?: FieldPolicy<any> | FieldReadFunction<any>;
  leads?: FieldPolicy<any> | FieldReadFunction<any>;
  links?: FieldPolicy<any> | FieldReadFunction<any>;
  memberCount?: FieldPolicy<any> | FieldReadFunction<any>;
  membership?: FieldPolicy<any> | FieldReadFunction<any>;
  parent?: FieldPolicy<any> | FieldReadFunction<any>;
  pinned?: FieldPolicy<any> | FieldReadFunction<any>;
  planAssignments?: FieldPolicy<any> | FieldReadFunction<any>;
  settings?: FieldPolicy<any> | FieldReadFunction<any>;
  sortOrder?: FieldPolicy<any> | FieldReadFunction<any>;
  stages?: FieldPolicy<any> | FieldReadFunction<any>;
  status?: FieldPolicy<any> | FieldReadFunction<any>;
  subdomain?: FieldPolicy<any> | FieldReadFunction<any>;
  subspaces?: FieldPolicy<any> | FieldReadFunction<any>;
  tags?: FieldPolicy<any> | FieldReadFunction<any>;
  templateCount?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
  videoCallUrl?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SpaceCanKeySpecifier = (
  | 'apply'
  | 'archive'
  | 'createDocument'
  | 'createPost'
  | 'createSubspace'
  | 'delete'
  | 'invite'
  | 'join'
  | 'manageMembers'
  | 'manageTemplates'
  | 'read'
  | 'readActivity'
  | 'saveAsTemplate'
  | 'update'
  | 'upload'
  | SpaceCanKeySpecifier
)[];
export type SpaceCanFieldPolicy = {
  apply?: FieldPolicy<any> | FieldReadFunction<any>;
  archive?: FieldPolicy<any> | FieldReadFunction<any>;
  createDocument?: FieldPolicy<any> | FieldReadFunction<any>;
  createPost?: FieldPolicy<any> | FieldReadFunction<any>;
  createSubspace?: FieldPolicy<any> | FieldReadFunction<any>;
  delete?: FieldPolicy<any> | FieldReadFunction<any>;
  invite?: FieldPolicy<any> | FieldReadFunction<any>;
  join?: FieldPolicy<any> | FieldReadFunction<any>;
  manageMembers?: FieldPolicy<any> | FieldReadFunction<any>;
  manageTemplates?: FieldPolicy<any> | FieldReadFunction<any>;
  read?: FieldPolicy<any> | FieldReadFunction<any>;
  readActivity?: FieldPolicy<any> | FieldReadFunction<any>;
  saveAsTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
  update?: FieldPolicy<any> | FieldReadFunction<any>;
  upload?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SpaceConnectionKeySpecifier = ('edges' | 'pageInfo' | 'totalCount' | SpaceConnectionKeySpecifier)[];
export type SpaceConnectionFieldPolicy = {
  edges?: FieldPolicy<any> | FieldReadFunction<any>;
  pageInfo?: FieldPolicy<any> | FieldReadFunction<any>;
  totalCount?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SpaceEdgeKeySpecifier = ('cursor' | 'node' | SpaceEdgeKeySpecifier)[];
export type SpaceEdgeFieldPolicy = {
  cursor?: FieldPolicy<any> | FieldReadFunction<any>;
  node?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SpaceMembershipKeySpecifier = ('joinedAt' | 'roles' | 'space' | SpaceMembershipKeySpecifier)[];
export type SpaceMembershipFieldPolicy = {
  joinedAt?: FieldPolicy<any> | FieldReadFunction<any>;
  roles?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SpacesContentKeySpecifier = ('hasHiddenSpaces' | 'settings' | 'spaces' | SpacesContentKeySpecifier)[];
export type SpacesContentFieldPolicy = {
  hasHiddenSpaces?: FieldPolicy<any> | FieldReadFunction<any>;
  settings?: FieldPolicy<any> | FieldReadFunction<any>;
  spaces?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type StageKeySpecifier = ('defaultTemplate' | 'description' | 'id' | 'name' | 'sortOrder' | StageKeySpecifier)[];
export type StageFieldPolicy = {
  defaultTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  sortOrder?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type StorageLimitsKeySpecifier = ('allowedMime' | 'maxFileSize' | StorageLimitsKeySpecifier)[];
export type StorageLimitsFieldPolicy = {
  allowedMime?: FieldPolicy<any> | FieldReadFunction<any>;
  maxFileSize?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type TaskBoardContentKeySpecifier = ('columns' | 'tasks' | TaskBoardContentKeySpecifier)[];
export type TaskBoardContentFieldPolicy = {
  columns?: FieldPolicy<any> | FieldReadFunction<any>;
  tasks?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type TemplateKeySpecifier = (
  | 'about'
  | 'body'
  | 'entityType'
  | 'handle'
  | 'id'
  | 'kind'
  | 'provider'
  | 'scope'
  | 'tags'
  | 'url'
  | TemplateKeySpecifier
)[];
export type TemplateFieldPolicy = {
  about?: FieldPolicy<any> | FieldReadFunction<any>;
  body?: FieldPolicy<any> | FieldReadFunction<any>;
  entityType?: FieldPolicy<any> | FieldReadFunction<any>;
  handle?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  kind?: FieldPolicy<any> | FieldReadFunction<any>;
  provider?: FieldPolicy<any> | FieldReadFunction<any>;
  scope?: FieldPolicy<any> | FieldReadFunction<any>;
  tags?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type TemplateConnectionKeySpecifier = ('edges' | 'pageInfo' | 'totalCount' | TemplateConnectionKeySpecifier)[];
export type TemplateConnectionFieldPolicy = {
  edges?: FieldPolicy<any> | FieldReadFunction<any>;
  pageInfo?: FieldPolicy<any> | FieldReadFunction<any>;
  totalCount?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type TemplateDefaultKeySpecifier = ('slot' | 'stage' | 'template' | TemplateDefaultKeySpecifier)[];
export type TemplateDefaultFieldPolicy = {
  slot?: FieldPolicy<any> | FieldReadFunction<any>;
  stage?: FieldPolicy<any> | FieldReadFunction<any>;
  template?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type TemplateEdgeKeySpecifier = ('cursor' | 'node' | TemplateEdgeKeySpecifier)[];
export type TemplateEdgeFieldPolicy = {
  cursor?: FieldPolicy<any> | FieldReadFunction<any>;
  node?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type TypeCountKeySpecifier = ('count' | 'type' | TypeCountKeySpecifier)[];
export type TypeCountFieldPolicy = {
  count?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UploadTokenKeySpecifier = (
  | 'allowedMime'
  | 'expiresAt'
  | 'maxSize'
  | 'token'
  | 'url'
  | UploadTokenKeySpecifier
)[];
export type UploadTokenFieldPolicy = {
  allowedMime?: FieldPolicy<any> | FieldReadFunction<any>;
  expiresAt?: FieldPolicy<any> | FieldReadFunction<any>;
  maxSize?: FieldPolicy<any> | FieldReadFunction<any>;
  token?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UserKeySpecifier = (
  | 'about'
  | 'account'
  | 'actorType'
  | 'can'
  | 'email'
  | 'entityType'
  | 'firstName'
  | 'handle'
  | 'hosted'
  | 'id'
  | 'keywords'
  | 'lastName'
  | 'links'
  | 'memberships'
  | 'notificationPrefs'
  | 'organizations'
  | 'settings'
  | 'skills'
  | 'url'
  | UserKeySpecifier
)[];
export type UserFieldPolicy = {
  about?: FieldPolicy<any> | FieldReadFunction<any>;
  account?: FieldPolicy<any> | FieldReadFunction<any>;
  actorType?: FieldPolicy<any> | FieldReadFunction<any>;
  can?: FieldPolicy<any> | FieldReadFunction<any>;
  email?: FieldPolicy<any> | FieldReadFunction<any>;
  entityType?: FieldPolicy<any> | FieldReadFunction<any>;
  firstName?: FieldPolicy<any> | FieldReadFunction<any>;
  handle?: FieldPolicy<any> | FieldReadFunction<any>;
  hosted?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  keywords?: FieldPolicy<any> | FieldReadFunction<any>;
  lastName?: FieldPolicy<any> | FieldReadFunction<any>;
  links?: FieldPolicy<any> | FieldReadFunction<any>;
  memberships?: FieldPolicy<any> | FieldReadFunction<any>;
  notificationPrefs?: FieldPolicy<any> | FieldReadFunction<any>;
  organizations?: FieldPolicy<any> | FieldReadFunction<any>;
  settings?: FieldPolicy<any> | FieldReadFunction<any>;
  skills?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ViewerKeySpecifier = (
  | 'account'
  | 'actor'
  | 'homeSpace'
  | 'id'
  | 'language'
  | 'matrix'
  | 'pendingApplications'
  | 'pendingInvitations'
  | 'platformPrivileges'
  | 'platformRoles'
  | 'recentSpaces'
  | 'session'
  | ViewerKeySpecifier
)[];
export type ViewerFieldPolicy = {
  account?: FieldPolicy<any> | FieldReadFunction<any>;
  actor?: FieldPolicy<any> | FieldReadFunction<any>;
  homeSpace?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  language?: FieldPolicy<any> | FieldReadFunction<any>;
  matrix?: FieldPolicy<any> | FieldReadFunction<any>;
  pendingApplications?: FieldPolicy<any> | FieldReadFunction<any>;
  pendingInvitations?: FieldPolicy<any> | FieldReadFunction<any>;
  platformPrivileges?: FieldPolicy<any> | FieldReadFunction<any>;
  platformRoles?: FieldPolicy<any> | FieldReadFunction<any>;
  recentSpaces?: FieldPolicy<any> | FieldReadFunction<any>;
  session?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type VisualConstraintKeySpecifier = (
  | 'allowedTypes'
  | 'aspectRatio'
  | 'maxAspectRatio'
  | 'maxHeight'
  | 'maxWidth'
  | 'minAspectRatio'
  | 'minHeight'
  | 'minWidth'
  | 'name'
  | VisualConstraintKeySpecifier
)[];
export type VisualConstraintFieldPolicy = {
  allowedTypes?: FieldPolicy<any> | FieldReadFunction<any>;
  aspectRatio?: FieldPolicy<any> | FieldReadFunction<any>;
  maxAspectRatio?: FieldPolicy<any> | FieldReadFunction<any>;
  maxHeight?: FieldPolicy<any> | FieldReadFunction<any>;
  maxWidth?: FieldPolicy<any> | FieldReadFunction<any>;
  minAspectRatio?: FieldPolicy<any> | FieldReadFunction<any>;
  minHeight?: FieldPolicy<any> | FieldReadFunction<any>;
  minWidth?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type WithheldRoleKeySpecifier = ('reason' | 'role' | WithheldRoleKeySpecifier)[];
export type WithheldRoleFieldPolicy = {
  reason?: FieldPolicy<any> | FieldReadFunction<any>;
  role?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type StrictTypedTypePolicies = {
  About?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | AboutKeySpecifier | (() => undefined | AboutKeySpecifier);
    fields?: AboutFieldPolicy;
  };
  AboutFacet?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | AboutFacetKeySpecifier | (() => undefined | AboutFacetKeySpecifier);
    fields?: AboutFacetFieldPolicy;
  };
  AccessInspection?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | AccessInspectionKeySpecifier | (() => undefined | AccessInspectionKeySpecifier);
    fields?: AccessInspectionFieldPolicy;
  };
  AccountSummary?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | AccountSummaryKeySpecifier | (() => undefined | AccountSummaryKeySpecifier);
    fields?: AccountSummaryFieldPolicy;
  };
  Activity?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ActivityKeySpecifier | (() => undefined | ActivityKeySpecifier);
    fields?: ActivityFieldPolicy;
  };
  ActivityConnection?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ActivityConnectionKeySpecifier | (() => undefined | ActivityConnectionKeySpecifier);
    fields?: ActivityConnectionFieldPolicy;
  };
  ActivityEdge?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ActivityEdgeKeySpecifier | (() => undefined | ActivityEdgeKeySpecifier);
    fields?: ActivityEdgeFieldPolicy;
  };
  ActivityKindInfo?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ActivityKindInfoKeySpecifier | (() => undefined | ActivityKindInfoKeySpecifier);
    fields?: ActivityKindInfoFieldPolicy;
  };
  Actor?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ActorKeySpecifier | (() => undefined | ActorKeySpecifier);
    fields?: ActorFieldPolicy;
  };
  ActorCan?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ActorCanKeySpecifier | (() => undefined | ActorCanKeySpecifier);
    fields?: ActorCanFieldPolicy;
  };
  ActorConnection?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ActorConnectionKeySpecifier | (() => undefined | ActorConnectionKeySpecifier);
    fields?: ActorConnectionFieldPolicy;
  };
  ActorEdge?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ActorEdgeKeySpecifier | (() => undefined | ActorEdgeKeySpecifier);
    fields?: ActorEdgeFieldPolicy;
  };
  Agent?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | AgentKeySpecifier | (() => undefined | AgentKeySpecifier);
    fields?: AgentFieldPolicy;
  };
  AgentModelCard?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | AgentModelCardKeySpecifier | (() => undefined | AgentModelCardKeySpecifier);
    fields?: AgentModelCardFieldPolicy;
  };
  AgentModelCardFlag?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | AgentModelCardFlagKeySpecifier | (() => undefined | AgentModelCardFlagKeySpecifier);
    fields?: AgentModelCardFlagFieldPolicy;
  };
  AgentModelCardMonitoring?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | AgentModelCardMonitoringKeySpecifier | (() => undefined | AgentModelCardMonitoringKeySpecifier);
    fields?: AgentModelCardMonitoringFieldPolicy;
  };
  AgentModelCardSpaceUsage?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | AgentModelCardSpaceUsageKeySpecifier | (() => undefined | AgentModelCardSpaceUsageKeySpecifier);
    fields?: AgentModelCardSpaceUsageFieldPolicy;
  };
  AiEngine?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | AiEngineKeySpecifier | (() => undefined | AiEngineKeySpecifier);
    fields?: AiEngineFieldPolicy;
  };
  ApmConfig?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ApmConfigKeySpecifier | (() => undefined | ApmConfigKeySpecifier);
    fields?: ApmConfigFieldPolicy;
  };
  Attestation?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | AttestationKeySpecifier | (() => undefined | AttestationKeySpecifier);
    fields?: AttestationFieldPolicy;
  };
  AuthorizationProof?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | AuthorizationProofKeySpecifier | (() => undefined | AuthorizationProofKeySpecifier);
    fields?: AuthorizationProofFieldPolicy;
  };
  BlueprintOmission?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | BlueprintOmissionKeySpecifier | (() => undefined | BlueprintOmissionKeySpecifier);
    fields?: BlueprintOmissionFieldPolicy;
  };
  BlueprintResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | BlueprintResultKeySpecifier | (() => undefined | BlueprintResultKeySpecifier);
    fields?: BlueprintResultFieldPolicy;
  };
  CalendarLink?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CalendarLinkKeySpecifier | (() => undefined | CalendarLinkKeySpecifier);
    fields?: CalendarLinkFieldPolicy;
  };
  CanCreate?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CanCreateKeySpecifier | (() => undefined | CanCreateKeySpecifier);
    fields?: CanCreateFieldPolicy;
  };
  Capability?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CapabilityKeySpecifier | (() => undefined | CapabilityKeySpecifier);
    fields?: CapabilityFieldPolicy;
  };
  Choice?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ChoiceKeySpecifier | (() => undefined | ChoiceKeySpecifier);
    fields?: ChoiceFieldPolicy;
  };
  ChoiceSetRef?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ChoiceSetRefKeySpecifier | (() => undefined | ChoiceSetRefKeySpecifier);
    fields?: ChoiceSetRefFieldPolicy;
  };
  Classification?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ClassificationKeySpecifier | (() => undefined | ClassificationKeySpecifier);
    fields?: ClassificationFieldPolicy;
  };
  Config?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ConfigKeySpecifier | (() => undefined | ConfigKeySpecifier);
    fields?: ConfigFieldPolicy;
  };
  ConfigAuthentication?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ConfigAuthenticationKeySpecifier | (() => undefined | ConfigAuthenticationKeySpecifier);
    fields?: ConfigAuthenticationFieldPolicy;
  };
  ConfigGeo?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ConfigGeoKeySpecifier | (() => undefined | ConfigGeoKeySpecifier);
    fields?: ConfigGeoFieldPolicy;
  };
  ConfigLink?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ConfigLinkKeySpecifier | (() => undefined | ConfigLinkKeySpecifier);
    fields?: ConfigLinkFieldPolicy;
  };
  ConfigMatrix?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ConfigMatrixKeySpecifier | (() => undefined | ConfigMatrixKeySpecifier);
    fields?: ConfigMatrixFieldPolicy;
  };
  ConfigPointers?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ConfigPointersKeySpecifier | (() => undefined | ConfigPointersKeySpecifier);
    fields?: ConfigPointersFieldPolicy;
  };
  ConfigTelemetry?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ConfigTelemetryKeySpecifier | (() => undefined | ConfigTelemetryKeySpecifier);
    fields?: ConfigTelemetryFieldPolicy;
  };
  ConfigVersions?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ConfigVersionsKeySpecifier | (() => undefined | ConfigVersionsKeySpecifier);
    fields?: ConfigVersionsFieldPolicy;
  };
  ContributorsContent?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ContributorsContentKeySpecifier | (() => undefined | ContributorsContentKeySpecifier);
    fields?: ContributorsContentFieldPolicy;
  };
  CuratedItem?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CuratedItemKeySpecifier | (() => undefined | CuratedItemKeySpecifier);
    fields?: CuratedItemFieldPolicy;
  };
  DeleteResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | DeleteResultKeySpecifier | (() => undefined | DeleteResultKeySpecifier);
    fields?: DeleteResultFieldPolicy;
  };
  Document?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | DocumentKeySpecifier | (() => undefined | DocumentKeySpecifier);
    fields?: DocumentFieldPolicy;
  };
  DocumentCan?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | DocumentCanKeySpecifier | (() => undefined | DocumentCanKeySpecifier);
    fields?: DocumentCanFieldPolicy;
  };
  DocumentContent?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | DocumentContentKeySpecifier | (() => undefined | DocumentContentKeySpecifier);
    fields?: DocumentContentFieldPolicy;
  };
  DocumentSession?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | DocumentSessionKeySpecifier | (() => undefined | DocumentSessionKeySpecifier);
    fields?: DocumentSessionFieldPolicy;
  };
  Entitlement?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | EntitlementKeySpecifier | (() => undefined | EntitlementKeySpecifier);
    fields?: EntitlementFieldPolicy;
  };
  EntitlementAvailability?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | EntitlementAvailabilityKeySpecifier | (() => undefined | EntitlementAvailabilityKeySpecifier);
    fields?: EntitlementAvailabilityFieldPolicy;
  };
  EntitlementCreationKind?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | EntitlementCreationKindKeySpecifier | (() => undefined | EntitlementCreationKindKeySpecifier);
    fields?: EntitlementCreationKindFieldPolicy;
  };
  EntitlementInfo?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | EntitlementInfoKeySpecifier | (() => undefined | EntitlementInfoKeySpecifier);
    fields?: EntitlementInfoFieldPolicy;
  };
  EventContent?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | EventContentKeySpecifier | (() => undefined | EventContentKeySpecifier);
    fields?: EventContentFieldPolicy;
  };
  File?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | FileKeySpecifier | (() => undefined | FileKeySpecifier);
    fields?: FileFieldPolicy;
  };
  FileCan?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | FileCanKeySpecifier | (() => undefined | FileCanKeySpecifier);
    fields?: FileCanFieldPolicy;
  };
  FileConnection?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | FileConnectionKeySpecifier | (() => undefined | FileConnectionKeySpecifier);
    fields?: FileConnectionFieldPolicy;
  };
  FileEdge?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | FileEdgeKeySpecifier | (() => undefined | FileEdgeKeySpecifier);
    fields?: FileEdgeFieldPolicy;
  };
  FileRef?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | FileRefKeySpecifier | (() => undefined | FileRefKeySpecifier);
    fields?: FileRefFieldPolicy;
  };
  FormContent?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | FormContentKeySpecifier | (() => undefined | FormContentKeySpecifier);
    fields?: FormContentFieldPolicy;
  };
  FormResponseContent?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | FormResponseContentKeySpecifier | (() => undefined | FormResponseContentKeySpecifier);
    fields?: FormResponseContentFieldPolicy;
  };
  GalleryContent?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | GalleryContentKeySpecifier | (() => undefined | GalleryContentKeySpecifier);
    fields?: GalleryContentFieldPolicy;
  };
  GenericActor?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | GenericActorKeySpecifier | (() => undefined | GenericActorKeySpecifier);
    fields?: GenericActorFieldPolicy;
  };
  HostedResources?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | HostedResourcesKeySpecifier | (() => undefined | HostedResourcesKeySpecifier);
    fields?: HostedResourcesFieldPolicy;
  };
  InnovationPack?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | InnovationPackKeySpecifier | (() => undefined | InnovationPackKeySpecifier);
    fields?: InnovationPackFieldPolicy;
  };
  InviteOutcome?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | InviteOutcomeKeySpecifier | (() => undefined | InviteOutcomeKeySpecifier);
    fields?: InviteOutcomeFieldPolicy;
  };
  JoiningSpace?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | JoiningSpaceKeySpecifier | (() => undefined | JoiningSpaceKeySpecifier);
    fields?: JoiningSpaceFieldPolicy;
  };
  Link?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | LinkKeySpecifier | (() => undefined | LinkKeySpecifier);
    fields?: LinkFieldPolicy;
  };
  LinkContent?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | LinkContentKeySpecifier | (() => undefined | LinkContentKeySpecifier);
    fields?: LinkContentFieldPolicy;
  };
  MatrixAccess?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | MatrixAccessKeySpecifier | (() => undefined | MatrixAccessKeySpecifier);
    fields?: MatrixAccessFieldPolicy;
  };
  Member?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | MemberKeySpecifier | (() => undefined | MemberKeySpecifier);
    fields?: MemberFieldPolicy;
  };
  MemberConnection?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | MemberConnectionKeySpecifier | (() => undefined | MemberConnectionKeySpecifier);
    fields?: MemberConnectionFieldPolicy;
  };
  MemberEdge?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | MemberEdgeKeySpecifier | (() => undefined | MemberEdgeKeySpecifier);
    fields?: MemberEdgeFieldPolicy;
  };
  Membership?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | MembershipKeySpecifier | (() => undefined | MembershipKeySpecifier);
    fields?: MembershipFieldPolicy;
  };
  MembershipRequest?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | MembershipRequestKeySpecifier | (() => undefined | MembershipRequestKeySpecifier);
    fields?: MembershipRequestFieldPolicy;
  };
  MembershipRequestConnection?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | MembershipRequestConnectionKeySpecifier
      | (() => undefined | MembershipRequestConnectionKeySpecifier);
    fields?: MembershipRequestConnectionFieldPolicy;
  };
  MembershipRequestEdge?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | MembershipRequestEdgeKeySpecifier | (() => undefined | MembershipRequestEdgeKeySpecifier);
    fields?: MembershipRequestEdgeFieldPolicy;
  };
  MembershipResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | MembershipResultKeySpecifier | (() => undefined | MembershipResultKeySpecifier);
    fields?: MembershipResultFieldPolicy;
  };
  Mutation?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | MutationKeySpecifier | (() => undefined | MutationKeySpecifier);
    fields?: MutationFieldPolicy;
  };
  Node?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | NodeKeySpecifier | (() => undefined | NodeKeySpecifier);
    fields?: NodeFieldPolicy;
  };
  NodeConnection?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | NodeConnectionKeySpecifier | (() => undefined | NodeConnectionKeySpecifier);
    fields?: NodeConnectionFieldPolicy;
  };
  NodeEdge?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | NodeEdgeKeySpecifier | (() => undefined | NodeEdgeKeySpecifier);
    fields?: NodeEdgeFieldPolicy;
  };
  Notification?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | NotificationKeySpecifier | (() => undefined | NotificationKeySpecifier);
    fields?: NotificationFieldPolicy;
  };
  NotificationConnection?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | NotificationConnectionKeySpecifier | (() => undefined | NotificationConnectionKeySpecifier);
    fields?: NotificationConnectionFieldPolicy;
  };
  NotificationDebounce?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | NotificationDebounceKeySpecifier | (() => undefined | NotificationDebounceKeySpecifier);
    fields?: NotificationDebounceFieldPolicy;
  };
  NotificationEdge?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | NotificationEdgeKeySpecifier | (() => undefined | NotificationEdgeKeySpecifier);
    fields?: NotificationEdgeFieldPolicy;
  };
  NotificationKindInfo?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | NotificationKindInfoKeySpecifier | (() => undefined | NotificationKindInfoKeySpecifier);
    fields?: NotificationKindInfoFieldPolicy;
  };
  Organization?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | OrganizationKeySpecifier | (() => undefined | OrganizationKeySpecifier);
    fields?: OrganizationFieldPolicy;
  };
  OrganizationMembership?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | OrganizationMembershipKeySpecifier | (() => undefined | OrganizationMembershipKeySpecifier);
    fields?: OrganizationMembershipFieldPolicy;
  };
  PageInfo?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PageInfoKeySpecifier | (() => undefined | PageInfoKeySpecifier);
    fields?: PageInfoFieldPolicy;
  };
  Plan?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PlanKeySpecifier | (() => undefined | PlanKeySpecifier);
    fields?: PlanFieldPolicy;
  };
  PlanAssignment?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PlanAssignmentKeySpecifier | (() => undefined | PlanAssignmentKeySpecifier);
    fields?: PlanAssignmentFieldPolicy;
  };
  PollContent?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PollContentKeySpecifier | (() => undefined | PollContentKeySpecifier);
    fields?: PollContentFieldPolicy;
  };
  PollOption?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PollOptionKeySpecifier | (() => undefined | PollOptionKeySpecifier);
    fields?: PollOptionFieldPolicy;
  };
  Post?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PostKeySpecifier | (() => undefined | PostKeySpecifier);
    fields?: PostFieldPolicy;
  };
  PostCan?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PostCanKeySpecifier | (() => undefined | PostCanKeySpecifier);
    fields?: PostCanFieldPolicy;
  };
  PostConnection?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PostConnectionKeySpecifier | (() => undefined | PostConnectionKeySpecifier);
    fields?: PostConnectionFieldPolicy;
  };
  PostEdge?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PostEdgeKeySpecifier | (() => undefined | PostEdgeKeySpecifier);
    fields?: PostEdgeFieldPolicy;
  };
  PostKindInfo?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PostKindInfoKeySpecifier | (() => undefined | PostKindInfoKeySpecifier);
    fields?: PostKindInfoFieldPolicy;
  };
  PushSubscription?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PushSubscriptionKeySpecifier | (() => undefined | PushSubscriptionKeySpecifier);
    fields?: PushSubscriptionFieldPolicy;
  };
  Query?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | QueryKeySpecifier | (() => undefined | QueryKeySpecifier);
    fields?: QueryFieldPolicy;
  };
  RecentSpace?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | RecentSpaceKeySpecifier | (() => undefined | RecentSpaceKeySpecifier);
    fields?: RecentSpaceFieldPolicy;
  };
  ResolveResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ResolveResultKeySpecifier | (() => undefined | ResolveResultKeySpecifier);
    fields?: ResolveResultFieldPolicy;
  };
  RolePolicy?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | RolePolicyKeySpecifier | (() => undefined | RolePolicyKeySpecifier);
    fields?: RolePolicyFieldPolicy;
  };
  Room?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | RoomKeySpecifier | (() => undefined | RoomKeySpecifier);
    fields?: RoomFieldPolicy;
  };
  RoomCan?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | RoomCanKeySpecifier | (() => undefined | RoomCanKeySpecifier);
    fields?: RoomCanFieldPolicy;
  };
  SentryConfig?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | SentryConfigKeySpecifier | (() => undefined | SentryConfigKeySpecifier);
    fields?: SentryConfigFieldPolicy;
  };
  SessionInfo?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | SessionInfoKeySpecifier | (() => undefined | SessionInfoKeySpecifier);
    fields?: SessionInfoFieldPolicy;
  };
  Space?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | SpaceKeySpecifier | (() => undefined | SpaceKeySpecifier);
    fields?: SpaceFieldPolicy;
  };
  SpaceCan?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | SpaceCanKeySpecifier | (() => undefined | SpaceCanKeySpecifier);
    fields?: SpaceCanFieldPolicy;
  };
  SpaceConnection?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | SpaceConnectionKeySpecifier | (() => undefined | SpaceConnectionKeySpecifier);
    fields?: SpaceConnectionFieldPolicy;
  };
  SpaceEdge?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | SpaceEdgeKeySpecifier | (() => undefined | SpaceEdgeKeySpecifier);
    fields?: SpaceEdgeFieldPolicy;
  };
  SpaceMembership?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | SpaceMembershipKeySpecifier | (() => undefined | SpaceMembershipKeySpecifier);
    fields?: SpaceMembershipFieldPolicy;
  };
  SpacesContent?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | SpacesContentKeySpecifier | (() => undefined | SpacesContentKeySpecifier);
    fields?: SpacesContentFieldPolicy;
  };
  Stage?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | StageKeySpecifier | (() => undefined | StageKeySpecifier);
    fields?: StageFieldPolicy;
  };
  StorageLimits?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | StorageLimitsKeySpecifier | (() => undefined | StorageLimitsKeySpecifier);
    fields?: StorageLimitsFieldPolicy;
  };
  TaskBoardContent?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | TaskBoardContentKeySpecifier | (() => undefined | TaskBoardContentKeySpecifier);
    fields?: TaskBoardContentFieldPolicy;
  };
  Template?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | TemplateKeySpecifier | (() => undefined | TemplateKeySpecifier);
    fields?: TemplateFieldPolicy;
  };
  TemplateConnection?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | TemplateConnectionKeySpecifier | (() => undefined | TemplateConnectionKeySpecifier);
    fields?: TemplateConnectionFieldPolicy;
  };
  TemplateDefault?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | TemplateDefaultKeySpecifier | (() => undefined | TemplateDefaultKeySpecifier);
    fields?: TemplateDefaultFieldPolicy;
  };
  TemplateEdge?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | TemplateEdgeKeySpecifier | (() => undefined | TemplateEdgeKeySpecifier);
    fields?: TemplateEdgeFieldPolicy;
  };
  TypeCount?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | TypeCountKeySpecifier | (() => undefined | TypeCountKeySpecifier);
    fields?: TypeCountFieldPolicy;
  };
  UploadToken?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | UploadTokenKeySpecifier | (() => undefined | UploadTokenKeySpecifier);
    fields?: UploadTokenFieldPolicy;
  };
  User?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | UserKeySpecifier | (() => undefined | UserKeySpecifier);
    fields?: UserFieldPolicy;
  };
  Viewer?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ViewerKeySpecifier | (() => undefined | ViewerKeySpecifier);
    fields?: ViewerFieldPolicy;
  };
  VisualConstraint?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | VisualConstraintKeySpecifier | (() => undefined | VisualConstraintKeySpecifier);
    fields?: VisualConstraintFieldPolicy;
  };
  WithheldRole?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | WithheldRoleKeySpecifier | (() => undefined | WithheldRoleKeySpecifier);
    fields?: WithheldRoleFieldPolicy;
  };
};
export type TypedTypePolicies = StrictTypedTypePolicies & TypePolicies;
