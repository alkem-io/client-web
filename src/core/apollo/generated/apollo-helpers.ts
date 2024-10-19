import { FieldPolicy, FieldReadFunction, TypePolicies, TypePolicy } from '@apollo/client/cache';
export type APMKeySpecifier = ('endpoint' | 'rumEnabled' | APMKeySpecifier)[];
export type APMFieldPolicy = {
  endpoint?: FieldPolicy<any> | FieldReadFunction<any>;
  rumEnabled?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AccountKeySpecifier = (
  | 'agent'
  | 'authorization'
  | 'createdDate'
  | 'host'
  | 'id'
  | 'innovationHubs'
  | 'innovationPacks'
  | 'spaces'
  | 'storageAggregator'
  | 'subscriptions'
  | 'type'
  | 'updatedDate'
  | 'virtualContributors'
  | AccountKeySpecifier
)[];
export type AccountFieldPolicy = {
  agent?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  host?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationHubs?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationPacks?: FieldPolicy<any> | FieldReadFunction<any>;
  spaces?: FieldPolicy<any> | FieldReadFunction<any>;
  storageAggregator?: FieldPolicy<any> | FieldReadFunction<any>;
  subscriptions?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  virtualContributors?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AccountSubscriptionKeySpecifier = ('expires' | 'name' | AccountSubscriptionKeySpecifier)[];
export type AccountSubscriptionFieldPolicy = {
  expires?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ActivityCreatedSubscriptionResultKeySpecifier = (
  | 'activity'
  | ActivityCreatedSubscriptionResultKeySpecifier
)[];
export type ActivityCreatedSubscriptionResultFieldPolicy = {
  activity?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ActivityFeedKeySpecifier = ('activityFeed' | 'pageInfo' | 'total' | ActivityFeedKeySpecifier)[];
export type ActivityFeedFieldPolicy = {
  activityFeed?: FieldPolicy<any> | FieldReadFunction<any>;
  pageInfo?: FieldPolicy<any> | FieldReadFunction<any>;
  total?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ActivityLogEntryKeySpecifier = (
  | 'child'
  | 'collaborationID'
  | 'createdDate'
  | 'description'
  | 'id'
  | 'parentDisplayName'
  | 'parentNameID'
  | 'space'
  | 'triggeredBy'
  | 'type'
  | ActivityLogEntryKeySpecifier
)[];
export type ActivityLogEntryFieldPolicy = {
  child?: FieldPolicy<any> | FieldReadFunction<any>;
  collaborationID?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  parentDisplayName?: FieldPolicy<any> | FieldReadFunction<any>;
  parentNameID?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  triggeredBy?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ActivityLogEntryCalendarEventCreatedKeySpecifier = (
  | 'calendar'
  | 'calendarEvent'
  | 'child'
  | 'collaborationID'
  | 'createdDate'
  | 'description'
  | 'id'
  | 'parentDisplayName'
  | 'parentNameID'
  | 'space'
  | 'triggeredBy'
  | 'type'
  | ActivityLogEntryCalendarEventCreatedKeySpecifier
)[];
export type ActivityLogEntryCalendarEventCreatedFieldPolicy = {
  calendar?: FieldPolicy<any> | FieldReadFunction<any>;
  calendarEvent?: FieldPolicy<any> | FieldReadFunction<any>;
  child?: FieldPolicy<any> | FieldReadFunction<any>;
  collaborationID?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  parentDisplayName?: FieldPolicy<any> | FieldReadFunction<any>;
  parentNameID?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  triggeredBy?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ActivityLogEntryCalloutDiscussionCommentKeySpecifier = (
  | 'callout'
  | 'child'
  | 'collaborationID'
  | 'createdDate'
  | 'description'
  | 'id'
  | 'parentDisplayName'
  | 'parentNameID'
  | 'space'
  | 'triggeredBy'
  | 'type'
  | ActivityLogEntryCalloutDiscussionCommentKeySpecifier
)[];
export type ActivityLogEntryCalloutDiscussionCommentFieldPolicy = {
  callout?: FieldPolicy<any> | FieldReadFunction<any>;
  child?: FieldPolicy<any> | FieldReadFunction<any>;
  collaborationID?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  parentDisplayName?: FieldPolicy<any> | FieldReadFunction<any>;
  parentNameID?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  triggeredBy?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ActivityLogEntryCalloutLinkCreatedKeySpecifier = (
  | 'callout'
  | 'child'
  | 'collaborationID'
  | 'createdDate'
  | 'description'
  | 'id'
  | 'link'
  | 'parentDisplayName'
  | 'parentNameID'
  | 'space'
  | 'triggeredBy'
  | 'type'
  | ActivityLogEntryCalloutLinkCreatedKeySpecifier
)[];
export type ActivityLogEntryCalloutLinkCreatedFieldPolicy = {
  callout?: FieldPolicy<any> | FieldReadFunction<any>;
  child?: FieldPolicy<any> | FieldReadFunction<any>;
  collaborationID?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  link?: FieldPolicy<any> | FieldReadFunction<any>;
  parentDisplayName?: FieldPolicy<any> | FieldReadFunction<any>;
  parentNameID?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  triggeredBy?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ActivityLogEntryCalloutPostCommentKeySpecifier = (
  | 'callout'
  | 'child'
  | 'collaborationID'
  | 'createdDate'
  | 'description'
  | 'id'
  | 'parentDisplayName'
  | 'parentNameID'
  | 'post'
  | 'space'
  | 'triggeredBy'
  | 'type'
  | ActivityLogEntryCalloutPostCommentKeySpecifier
)[];
export type ActivityLogEntryCalloutPostCommentFieldPolicy = {
  callout?: FieldPolicy<any> | FieldReadFunction<any>;
  child?: FieldPolicy<any> | FieldReadFunction<any>;
  collaborationID?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  parentDisplayName?: FieldPolicy<any> | FieldReadFunction<any>;
  parentNameID?: FieldPolicy<any> | FieldReadFunction<any>;
  post?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  triggeredBy?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ActivityLogEntryCalloutPostCreatedKeySpecifier = (
  | 'callout'
  | 'child'
  | 'collaborationID'
  | 'createdDate'
  | 'description'
  | 'id'
  | 'parentDisplayName'
  | 'parentNameID'
  | 'post'
  | 'space'
  | 'triggeredBy'
  | 'type'
  | ActivityLogEntryCalloutPostCreatedKeySpecifier
)[];
export type ActivityLogEntryCalloutPostCreatedFieldPolicy = {
  callout?: FieldPolicy<any> | FieldReadFunction<any>;
  child?: FieldPolicy<any> | FieldReadFunction<any>;
  collaborationID?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  parentDisplayName?: FieldPolicy<any> | FieldReadFunction<any>;
  parentNameID?: FieldPolicy<any> | FieldReadFunction<any>;
  post?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  triggeredBy?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ActivityLogEntryCalloutPublishedKeySpecifier = (
  | 'callout'
  | 'child'
  | 'collaborationID'
  | 'createdDate'
  | 'description'
  | 'id'
  | 'parentDisplayName'
  | 'parentNameID'
  | 'space'
  | 'triggeredBy'
  | 'type'
  | ActivityLogEntryCalloutPublishedKeySpecifier
)[];
export type ActivityLogEntryCalloutPublishedFieldPolicy = {
  callout?: FieldPolicy<any> | FieldReadFunction<any>;
  child?: FieldPolicy<any> | FieldReadFunction<any>;
  collaborationID?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  parentDisplayName?: FieldPolicy<any> | FieldReadFunction<any>;
  parentNameID?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  triggeredBy?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ActivityLogEntryCalloutWhiteboardContentModifiedKeySpecifier = (
  | 'callout'
  | 'child'
  | 'collaborationID'
  | 'createdDate'
  | 'description'
  | 'id'
  | 'parentDisplayName'
  | 'parentNameID'
  | 'space'
  | 'triggeredBy'
  | 'type'
  | 'whiteboard'
  | ActivityLogEntryCalloutWhiteboardContentModifiedKeySpecifier
)[];
export type ActivityLogEntryCalloutWhiteboardContentModifiedFieldPolicy = {
  callout?: FieldPolicy<any> | FieldReadFunction<any>;
  child?: FieldPolicy<any> | FieldReadFunction<any>;
  collaborationID?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  parentDisplayName?: FieldPolicy<any> | FieldReadFunction<any>;
  parentNameID?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  triggeredBy?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  whiteboard?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ActivityLogEntryCalloutWhiteboardCreatedKeySpecifier = (
  | 'callout'
  | 'child'
  | 'collaborationID'
  | 'createdDate'
  | 'description'
  | 'id'
  | 'parentDisplayName'
  | 'parentNameID'
  | 'space'
  | 'triggeredBy'
  | 'type'
  | 'whiteboard'
  | ActivityLogEntryCalloutWhiteboardCreatedKeySpecifier
)[];
export type ActivityLogEntryCalloutWhiteboardCreatedFieldPolicy = {
  callout?: FieldPolicy<any> | FieldReadFunction<any>;
  child?: FieldPolicy<any> | FieldReadFunction<any>;
  collaborationID?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  parentDisplayName?: FieldPolicy<any> | FieldReadFunction<any>;
  parentNameID?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  triggeredBy?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  whiteboard?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ActivityLogEntryChallengeCreatedKeySpecifier = (
  | 'child'
  | 'collaborationID'
  | 'createdDate'
  | 'description'
  | 'id'
  | 'parentDisplayName'
  | 'parentNameID'
  | 'space'
  | 'subspace'
  | 'triggeredBy'
  | 'type'
  | ActivityLogEntryChallengeCreatedKeySpecifier
)[];
export type ActivityLogEntryChallengeCreatedFieldPolicy = {
  child?: FieldPolicy<any> | FieldReadFunction<any>;
  collaborationID?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  parentDisplayName?: FieldPolicy<any> | FieldReadFunction<any>;
  parentNameID?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  subspace?: FieldPolicy<any> | FieldReadFunction<any>;
  triggeredBy?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ActivityLogEntryMemberJoinedKeySpecifier = (
  | 'child'
  | 'collaborationID'
  | 'community'
  | 'contributor'
  | 'contributorType'
  | 'createdDate'
  | 'description'
  | 'id'
  | 'parentDisplayName'
  | 'parentNameID'
  | 'space'
  | 'triggeredBy'
  | 'type'
  | ActivityLogEntryMemberJoinedKeySpecifier
)[];
export type ActivityLogEntryMemberJoinedFieldPolicy = {
  child?: FieldPolicy<any> | FieldReadFunction<any>;
  collaborationID?: FieldPolicy<any> | FieldReadFunction<any>;
  community?: FieldPolicy<any> | FieldReadFunction<any>;
  contributor?: FieldPolicy<any> | FieldReadFunction<any>;
  contributorType?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  parentDisplayName?: FieldPolicy<any> | FieldReadFunction<any>;
  parentNameID?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  triggeredBy?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ActivityLogEntryOpportunityCreatedKeySpecifier = (
  | 'child'
  | 'collaborationID'
  | 'createdDate'
  | 'description'
  | 'id'
  | 'parentDisplayName'
  | 'parentNameID'
  | 'space'
  | 'subsubspace'
  | 'triggeredBy'
  | 'type'
  | ActivityLogEntryOpportunityCreatedKeySpecifier
)[];
export type ActivityLogEntryOpportunityCreatedFieldPolicy = {
  child?: FieldPolicy<any> | FieldReadFunction<any>;
  collaborationID?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  parentDisplayName?: FieldPolicy<any> | FieldReadFunction<any>;
  parentNameID?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  subsubspace?: FieldPolicy<any> | FieldReadFunction<any>;
  triggeredBy?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ActivityLogEntryUpdateSentKeySpecifier = (
  | 'child'
  | 'collaborationID'
  | 'createdDate'
  | 'description'
  | 'id'
  | 'journeyUrl'
  | 'message'
  | 'parentDisplayName'
  | 'parentNameID'
  | 'space'
  | 'triggeredBy'
  | 'type'
  | 'updates'
  | ActivityLogEntryUpdateSentKeySpecifier
)[];
export type ActivityLogEntryUpdateSentFieldPolicy = {
  child?: FieldPolicy<any> | FieldReadFunction<any>;
  collaborationID?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  journeyUrl?: FieldPolicy<any> | FieldReadFunction<any>;
  message?: FieldPolicy<any> | FieldReadFunction<any>;
  parentDisplayName?: FieldPolicy<any> | FieldReadFunction<any>;
  parentNameID?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  triggeredBy?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  updates?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ActorKeySpecifier = (
  | 'authorization'
  | 'createdDate'
  | 'description'
  | 'id'
  | 'impact'
  | 'name'
  | 'updatedDate'
  | 'value'
  | ActorKeySpecifier
)[];
export type ActorFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  impact?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  value?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ActorGroupKeySpecifier = (
  | 'actors'
  | 'authorization'
  | 'createdDate'
  | 'description'
  | 'id'
  | 'name'
  | 'updatedDate'
  | ActorGroupKeySpecifier
)[];
export type ActorGroupFieldPolicy = {
  actors?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AgentKeySpecifier = (
  | 'authorization'
  | 'createdDate'
  | 'credentials'
  | 'did'
  | 'id'
  | 'type'
  | 'updatedDate'
  | 'verifiedCredentials'
  | AgentKeySpecifier
)[];
export type AgentFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  credentials?: FieldPolicy<any> | FieldReadFunction<any>;
  did?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  verifiedCredentials?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AgentBeginVerifiedCredentialOfferOutputKeySpecifier = (
  | 'jwt'
  | 'qrCodeImg'
  | AgentBeginVerifiedCredentialOfferOutputKeySpecifier
)[];
export type AgentBeginVerifiedCredentialOfferOutputFieldPolicy = {
  jwt?: FieldPolicy<any> | FieldReadFunction<any>;
  qrCodeImg?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AgentBeginVerifiedCredentialRequestOutputKeySpecifier = (
  | 'jwt'
  | 'qrCodeImg'
  | AgentBeginVerifiedCredentialRequestOutputKeySpecifier
)[];
export type AgentBeginVerifiedCredentialRequestOutputFieldPolicy = {
  jwt?: FieldPolicy<any> | FieldReadFunction<any>;
  qrCodeImg?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AiPersonaKeySpecifier = (
  | 'authorization'
  | 'bodyOfKnowledge'
  | 'bodyOfKnowledgeID'
  | 'bodyOfKnowledgeType'
  | 'createdDate'
  | 'dataAccessMode'
  | 'description'
  | 'id'
  | 'interactionModes'
  | 'updatedDate'
  | AiPersonaKeySpecifier
)[];
export type AiPersonaFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  bodyOfKnowledge?: FieldPolicy<any> | FieldReadFunction<any>;
  bodyOfKnowledgeID?: FieldPolicy<any> | FieldReadFunction<any>;
  bodyOfKnowledgeType?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  dataAccessMode?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  interactionModes?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AiPersonaServiceKeySpecifier = (
  | 'authorization'
  | 'bodyOfKnowledgeID'
  | 'bodyOfKnowledgeLastUpdated'
  | 'bodyOfKnowledgeType'
  | 'createdDate'
  | 'dataAccessMode'
  | 'engine'
  | 'id'
  | 'prompt'
  | 'updatedDate'
  | AiPersonaServiceKeySpecifier
)[];
export type AiPersonaServiceFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  bodyOfKnowledgeID?: FieldPolicy<any> | FieldReadFunction<any>;
  bodyOfKnowledgeLastUpdated?: FieldPolicy<any> | FieldReadFunction<any>;
  bodyOfKnowledgeType?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  dataAccessMode?: FieldPolicy<any> | FieldReadFunction<any>;
  engine?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  prompt?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AiServerKeySpecifier = (
  | 'aiPersonaService'
  | 'aiPersonaServices'
  | 'askAiPersonaServiceQuestion'
  | 'authorization'
  | 'createdDate'
  | 'defaultAiPersonaService'
  | 'id'
  | 'updatedDate'
  | AiServerKeySpecifier
)[];
export type AiServerFieldPolicy = {
  aiPersonaService?: FieldPolicy<any> | FieldReadFunction<any>;
  aiPersonaServices?: FieldPolicy<any> | FieldReadFunction<any>;
  askAiPersonaServiceQuestion?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  defaultAiPersonaService?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ApplicationKeySpecifier = (
  | 'authorization'
  | 'contributor'
  | 'createdDate'
  | 'id'
  | 'lifecycle'
  | 'nextEvents'
  | 'questions'
  | 'state'
  | 'stateIsFinal'
  | 'updatedDate'
  | ApplicationKeySpecifier
)[];
export type ApplicationFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  contributor?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  lifecycle?: FieldPolicy<any> | FieldReadFunction<any>;
  nextEvents?: FieldPolicy<any> | FieldReadFunction<any>;
  questions?: FieldPolicy<any> | FieldReadFunction<any>;
  state?: FieldPolicy<any> | FieldReadFunction<any>;
  stateIsFinal?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AuthenticationConfigKeySpecifier = ('providers' | AuthenticationConfigKeySpecifier)[];
export type AuthenticationConfigFieldPolicy = {
  providers?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AuthenticationProviderConfigKeySpecifier = (
  | 'config'
  | 'enabled'
  | 'icon'
  | 'label'
  | 'name'
  | AuthenticationProviderConfigKeySpecifier
)[];
export type AuthenticationProviderConfigFieldPolicy = {
  config?: FieldPolicy<any> | FieldReadFunction<any>;
  enabled?: FieldPolicy<any> | FieldReadFunction<any>;
  icon?: FieldPolicy<any> | FieldReadFunction<any>;
  label?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AuthorizationKeySpecifier = (
  | 'anonymousReadAccess'
  | 'createdDate'
  | 'credentialRules'
  | 'id'
  | 'myPrivileges'
  | 'privilegeRules'
  | 'type'
  | 'updatedDate'
  | 'verifiedCredentialRules'
  | AuthorizationKeySpecifier
)[];
export type AuthorizationFieldPolicy = {
  anonymousReadAccess?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  credentialRules?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  myPrivileges?: FieldPolicy<any> | FieldReadFunction<any>;
  privilegeRules?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  verifiedCredentialRules?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AuthorizationPolicyRuleCredentialKeySpecifier = (
  | 'cascade'
  | 'criterias'
  | 'grantedPrivileges'
  | 'name'
  | AuthorizationPolicyRuleCredentialKeySpecifier
)[];
export type AuthorizationPolicyRuleCredentialFieldPolicy = {
  cascade?: FieldPolicy<any> | FieldReadFunction<any>;
  criterias?: FieldPolicy<any> | FieldReadFunction<any>;
  grantedPrivileges?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AuthorizationPolicyRulePrivilegeKeySpecifier = (
  | 'grantedPrivileges'
  | 'name'
  | 'sourcePrivilege'
  | AuthorizationPolicyRulePrivilegeKeySpecifier
)[];
export type AuthorizationPolicyRulePrivilegeFieldPolicy = {
  grantedPrivileges?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  sourcePrivilege?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AuthorizationPolicyRuleVerifiedCredentialKeySpecifier = (
  | 'claimRule'
  | 'credentialName'
  | 'grantedPrivileges'
  | AuthorizationPolicyRuleVerifiedCredentialKeySpecifier
)[];
export type AuthorizationPolicyRuleVerifiedCredentialFieldPolicy = {
  claimRule?: FieldPolicy<any> | FieldReadFunction<any>;
  credentialName?: FieldPolicy<any> | FieldReadFunction<any>;
  grantedPrivileges?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CalendarKeySpecifier = (
  | 'authorization'
  | 'createdDate'
  | 'event'
  | 'events'
  | 'id'
  | 'updatedDate'
  | CalendarKeySpecifier
)[];
export type CalendarFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  event?: FieldPolicy<any> | FieldReadFunction<any>;
  events?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CalendarEventKeySpecifier = (
  | 'authorization'
  | 'comments'
  | 'createdBy'
  | 'createdDate'
  | 'durationDays'
  | 'durationMinutes'
  | 'id'
  | 'multipleDays'
  | 'nameID'
  | 'profile'
  | 'startDate'
  | 'type'
  | 'updatedDate'
  | 'wholeDay'
  | CalendarEventKeySpecifier
)[];
export type CalendarEventFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  comments?: FieldPolicy<any> | FieldReadFunction<any>;
  createdBy?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  durationDays?: FieldPolicy<any> | FieldReadFunction<any>;
  durationMinutes?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  multipleDays?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  startDate?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  wholeDay?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CalloutKeySpecifier = (
  | 'activity'
  | 'authorization'
  | 'comments'
  | 'contributionDefaults'
  | 'contributionPolicy'
  | 'contributions'
  | 'createdBy'
  | 'createdDate'
  | 'framing'
  | 'id'
  | 'nameID'
  | 'posts'
  | 'publishedBy'
  | 'publishedDate'
  | 'sortOrder'
  | 'type'
  | 'updatedDate'
  | 'visibility'
  | CalloutKeySpecifier
)[];
export type CalloutFieldPolicy = {
  activity?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  comments?: FieldPolicy<any> | FieldReadFunction<any>;
  contributionDefaults?: FieldPolicy<any> | FieldReadFunction<any>;
  contributionPolicy?: FieldPolicy<any> | FieldReadFunction<any>;
  contributions?: FieldPolicy<any> | FieldReadFunction<any>;
  createdBy?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  framing?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  posts?: FieldPolicy<any> | FieldReadFunction<any>;
  publishedBy?: FieldPolicy<any> | FieldReadFunction<any>;
  publishedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  sortOrder?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  visibility?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CalloutContributionKeySpecifier = (
  | 'authorization'
  | 'createdBy'
  | 'createdDate'
  | 'id'
  | 'link'
  | 'post'
  | 'sortOrder'
  | 'updatedDate'
  | 'whiteboard'
  | CalloutContributionKeySpecifier
)[];
export type CalloutContributionFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdBy?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  link?: FieldPolicy<any> | FieldReadFunction<any>;
  post?: FieldPolicy<any> | FieldReadFunction<any>;
  sortOrder?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  whiteboard?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CalloutContributionDefaultsKeySpecifier = (
  | 'createdDate'
  | 'id'
  | 'postDescription'
  | 'updatedDate'
  | 'whiteboardContent'
  | CalloutContributionDefaultsKeySpecifier
)[];
export type CalloutContributionDefaultsFieldPolicy = {
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  postDescription?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  whiteboardContent?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CalloutContributionPolicyKeySpecifier = (
  | 'allowedContributionTypes'
  | 'createdDate'
  | 'id'
  | 'state'
  | 'updatedDate'
  | CalloutContributionPolicyKeySpecifier
)[];
export type CalloutContributionPolicyFieldPolicy = {
  allowedContributionTypes?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  state?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CalloutFramingKeySpecifier = (
  | 'authorization'
  | 'createdDate'
  | 'id'
  | 'profile'
  | 'updatedDate'
  | 'whiteboard'
  | CalloutFramingKeySpecifier
)[];
export type CalloutFramingFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  whiteboard?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CalloutGroupKeySpecifier = ('description' | 'displayName' | CalloutGroupKeySpecifier)[];
export type CalloutGroupFieldPolicy = {
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CalloutPostCreatedKeySpecifier = (
  | 'calloutID'
  | 'contributionID'
  | 'post'
  | 'sortOrder'
  | CalloutPostCreatedKeySpecifier
)[];
export type CalloutPostCreatedFieldPolicy = {
  calloutID?: FieldPolicy<any> | FieldReadFunction<any>;
  contributionID?: FieldPolicy<any> | FieldReadFunction<any>;
  post?: FieldPolicy<any> | FieldReadFunction<any>;
  sortOrder?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CollaborationKeySpecifier = (
  | 'authorization'
  | 'callouts'
  | 'createdDate'
  | 'groups'
  | 'id'
  | 'innovationFlow'
  | 'tagsetTemplates'
  | 'timeline'
  | 'updatedDate'
  | CollaborationKeySpecifier
)[];
export type CollaborationFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  callouts?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  groups?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationFlow?: FieldPolicy<any> | FieldReadFunction<any>;
  tagsetTemplates?: FieldPolicy<any> | FieldReadFunction<any>;
  timeline?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CommunicationKeySpecifier = (
  | 'authorization'
  | 'createdDate'
  | 'id'
  | 'updatedDate'
  | 'updates'
  | CommunicationKeySpecifier
)[];
export type CommunicationFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  updates?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CommunicationAdminMembershipResultKeySpecifier = (
  | 'displayName'
  | 'id'
  | 'rooms'
  | CommunicationAdminMembershipResultKeySpecifier
)[];
export type CommunicationAdminMembershipResultFieldPolicy = {
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  rooms?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CommunicationAdminOrphanedUsageResultKeySpecifier = (
  | 'rooms'
  | CommunicationAdminOrphanedUsageResultKeySpecifier
)[];
export type CommunicationAdminOrphanedUsageResultFieldPolicy = {
  rooms?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CommunicationAdminRoomMembershipResultKeySpecifier = (
  | 'displayName'
  | 'extraMembers'
  | 'id'
  | 'joinRule'
  | 'members'
  | 'missingMembers'
  | 'roomID'
  | CommunicationAdminRoomMembershipResultKeySpecifier
)[];
export type CommunicationAdminRoomMembershipResultFieldPolicy = {
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  extraMembers?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  joinRule?: FieldPolicy<any> | FieldReadFunction<any>;
  members?: FieldPolicy<any> | FieldReadFunction<any>;
  missingMembers?: FieldPolicy<any> | FieldReadFunction<any>;
  roomID?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CommunicationAdminRoomResultKeySpecifier = (
  | 'displayName'
  | 'id'
  | 'members'
  | CommunicationAdminRoomResultKeySpecifier
)[];
export type CommunicationAdminRoomResultFieldPolicy = {
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  members?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CommunicationRoomKeySpecifier = ('displayName' | 'id' | 'messages' | CommunicationRoomKeySpecifier)[];
export type CommunicationRoomFieldPolicy = {
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  messages?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CommunityKeySpecifier = (
  | 'authorization'
  | 'communication'
  | 'createdDate'
  | 'group'
  | 'groups'
  | 'guidelines'
  | 'id'
  | 'roleSet'
  | 'updatedDate'
  | CommunityKeySpecifier
)[];
export type CommunityFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  communication?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  group?: FieldPolicy<any> | FieldReadFunction<any>;
  groups?: FieldPolicy<any> | FieldReadFunction<any>;
  guidelines?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  roleSet?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CommunityApplicationForRoleResultKeySpecifier = (
  | 'communityID'
  | 'createdDate'
  | 'displayName'
  | 'id'
  | 'spaceID'
  | 'spaceLevel'
  | 'state'
  | 'updatedDate'
  | CommunityApplicationForRoleResultKeySpecifier
)[];
export type CommunityApplicationForRoleResultFieldPolicy = {
  communityID?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  spaceID?: FieldPolicy<any> | FieldReadFunction<any>;
  spaceLevel?: FieldPolicy<any> | FieldReadFunction<any>;
  state?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CommunityApplicationResultKeySpecifier = (
  | 'application'
  | 'id'
  | 'spacePendingMembershipInfo'
  | CommunityApplicationResultKeySpecifier
)[];
export type CommunityApplicationResultFieldPolicy = {
  application?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  spacePendingMembershipInfo?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CommunityGuidelinesKeySpecifier = (
  | 'authorization'
  | 'createdDate'
  | 'id'
  | 'profile'
  | 'updatedDate'
  | CommunityGuidelinesKeySpecifier
)[];
export type CommunityGuidelinesFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CommunityInvitationForRoleResultKeySpecifier = (
  | 'communityID'
  | 'contributorID'
  | 'contributorType'
  | 'createdBy'
  | 'createdDate'
  | 'displayName'
  | 'id'
  | 'spaceID'
  | 'spaceLevel'
  | 'state'
  | 'updatedDate'
  | 'welcomeMessage'
  | CommunityInvitationForRoleResultKeySpecifier
)[];
export type CommunityInvitationForRoleResultFieldPolicy = {
  communityID?: FieldPolicy<any> | FieldReadFunction<any>;
  contributorID?: FieldPolicy<any> | FieldReadFunction<any>;
  contributorType?: FieldPolicy<any> | FieldReadFunction<any>;
  createdBy?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  spaceID?: FieldPolicy<any> | FieldReadFunction<any>;
  spaceLevel?: FieldPolicy<any> | FieldReadFunction<any>;
  state?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  welcomeMessage?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CommunityInvitationResultKeySpecifier = (
  | 'id'
  | 'invitation'
  | 'spacePendingMembershipInfo'
  | CommunityInvitationResultKeySpecifier
)[];
export type CommunityInvitationResultFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  invitation?: FieldPolicy<any> | FieldReadFunction<any>;
  spacePendingMembershipInfo?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CommunityMembershipResultKeySpecifier = (
  | 'childMemberships'
  | 'id'
  | 'space'
  | CommunityMembershipResultKeySpecifier
)[];
export type CommunityMembershipResultFieldPolicy = {
  childMemberships?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ConfigKeySpecifier = (
  | 'apm'
  | 'authentication'
  | 'featureFlags'
  | 'geo'
  | 'locations'
  | 'sentry'
  | 'storage'
  | ConfigKeySpecifier
)[];
export type ConfigFieldPolicy = {
  apm?: FieldPolicy<any> | FieldReadFunction<any>;
  authentication?: FieldPolicy<any> | FieldReadFunction<any>;
  featureFlags?: FieldPolicy<any> | FieldReadFunction<any>;
  geo?: FieldPolicy<any> | FieldReadFunction<any>;
  locations?: FieldPolicy<any> | FieldReadFunction<any>;
  sentry?: FieldPolicy<any> | FieldReadFunction<any>;
  storage?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ContextKeySpecifier = (
  | 'authorization'
  | 'createdDate'
  | 'id'
  | 'impact'
  | 'updatedDate'
  | 'vision'
  | 'who'
  | ContextKeySpecifier
)[];
export type ContextFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  impact?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  vision?: FieldPolicy<any> | FieldReadFunction<any>;
  who?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ContributorKeySpecifier = (
  | 'agent'
  | 'authorization'
  | 'id'
  | 'nameID'
  | 'profile'
  | ContributorKeySpecifier
)[];
export type ContributorFieldPolicy = {
  agent?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ContributorRolePolicyKeySpecifier = ('maximum' | 'minimum' | ContributorRolePolicyKeySpecifier)[];
export type ContributorRolePolicyFieldPolicy = {
  maximum?: FieldPolicy<any> | FieldReadFunction<any>;
  minimum?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ContributorRolesKeySpecifier = (
  | 'applications'
  | 'id'
  | 'invitations'
  | 'organizations'
  | 'spaces'
  | ContributorRolesKeySpecifier
)[];
export type ContributorRolesFieldPolicy = {
  applications?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  invitations?: FieldPolicy<any> | FieldReadFunction<any>;
  organizations?: FieldPolicy<any> | FieldReadFunction<any>;
  spaces?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CreateCalloutContributionDefaultsDataKeySpecifier = (
  | 'postDescription'
  | 'whiteboardContent'
  | CreateCalloutContributionDefaultsDataKeySpecifier
)[];
export type CreateCalloutContributionDefaultsDataFieldPolicy = {
  postDescription?: FieldPolicy<any> | FieldReadFunction<any>;
  whiteboardContent?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CreateCalloutContributionPolicyDataKeySpecifier = (
  | 'state'
  | CreateCalloutContributionPolicyDataKeySpecifier
)[];
export type CreateCalloutContributionPolicyDataFieldPolicy = {
  state?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CreateCalloutDataKeySpecifier = (
  | 'contributionDefaults'
  | 'contributionPolicy'
  | 'enableComments'
  | 'framing'
  | 'groupName'
  | 'nameID'
  | 'sendNotification'
  | 'sortOrder'
  | 'type'
  | 'visibility'
  | CreateCalloutDataKeySpecifier
)[];
export type CreateCalloutDataFieldPolicy = {
  contributionDefaults?: FieldPolicy<any> | FieldReadFunction<any>;
  contributionPolicy?: FieldPolicy<any> | FieldReadFunction<any>;
  enableComments?: FieldPolicy<any> | FieldReadFunction<any>;
  framing?: FieldPolicy<any> | FieldReadFunction<any>;
  groupName?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  sendNotification?: FieldPolicy<any> | FieldReadFunction<any>;
  sortOrder?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  visibility?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CreateCalloutFramingDataKeySpecifier = (
  | 'profile'
  | 'tags'
  | 'whiteboard'
  | CreateCalloutFramingDataKeySpecifier
)[];
export type CreateCalloutFramingDataFieldPolicy = {
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  tags?: FieldPolicy<any> | FieldReadFunction<any>;
  whiteboard?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CreateCollaborationDataKeySpecifier = (
  | 'calloutsData'
  | 'innovationFlowData'
  | CreateCollaborationDataKeySpecifier
)[];
export type CreateCollaborationDataFieldPolicy = {
  calloutsData?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationFlowData?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CreateCommunityGuidelinesDataKeySpecifier = ('profile' | CreateCommunityGuidelinesDataKeySpecifier)[];
export type CreateCommunityGuidelinesDataFieldPolicy = {
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CreateInnovationFlowDataKeySpecifier = ('profile' | 'states' | CreateInnovationFlowDataKeySpecifier)[];
export type CreateInnovationFlowDataFieldPolicy = {
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  states?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CreateInnovationFlowStateDataKeySpecifier = (
  | 'description'
  | 'displayName'
  | CreateInnovationFlowStateDataKeySpecifier
)[];
export type CreateInnovationFlowStateDataFieldPolicy = {
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CreateLocationDataKeySpecifier = (
  | 'addressLine1'
  | 'addressLine2'
  | 'city'
  | 'country'
  | 'postalCode'
  | 'stateOrProvince'
  | CreateLocationDataKeySpecifier
)[];
export type CreateLocationDataFieldPolicy = {
  addressLine1?: FieldPolicy<any> | FieldReadFunction<any>;
  addressLine2?: FieldPolicy<any> | FieldReadFunction<any>;
  city?: FieldPolicy<any> | FieldReadFunction<any>;
  country?: FieldPolicy<any> | FieldReadFunction<any>;
  postalCode?: FieldPolicy<any> | FieldReadFunction<any>;
  stateOrProvince?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CreateProfileDataKeySpecifier = (
  | 'avatarURL'
  | 'description'
  | 'displayName'
  | 'location'
  | 'referencesData'
  | 'tagline'
  | 'tagsets'
  | CreateProfileDataKeySpecifier
)[];
export type CreateProfileDataFieldPolicy = {
  avatarURL?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  location?: FieldPolicy<any> | FieldReadFunction<any>;
  referencesData?: FieldPolicy<any> | FieldReadFunction<any>;
  tagline?: FieldPolicy<any> | FieldReadFunction<any>;
  tagsets?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CreateReferenceDataKeySpecifier = ('description' | 'name' | 'uri' | CreateReferenceDataKeySpecifier)[];
export type CreateReferenceDataFieldPolicy = {
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  uri?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CreateTagsetDataKeySpecifier = ('name' | 'tags' | 'type' | CreateTagsetDataKeySpecifier)[];
export type CreateTagsetDataFieldPolicy = {
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  tags?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CreateWhiteboardDataKeySpecifier = ('content' | CreateWhiteboardDataKeySpecifier)[];
export type CreateWhiteboardDataFieldPolicy = {
  content?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CredentialKeySpecifier = (
  | 'createdDate'
  | 'expires'
  | 'id'
  | 'issuer'
  | 'resourceID'
  | 'type'
  | 'updatedDate'
  | CredentialKeySpecifier
)[];
export type CredentialFieldPolicy = {
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  expires?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  issuer?: FieldPolicy<any> | FieldReadFunction<any>;
  resourceID?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CredentialDefinitionKeySpecifier = ('resourceID' | 'type' | CredentialDefinitionKeySpecifier)[];
export type CredentialDefinitionFieldPolicy = {
  resourceID?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CredentialMetadataOutputKeySpecifier = (
  | 'context'
  | 'description'
  | 'name'
  | 'schema'
  | 'types'
  | 'uniqueType'
  | CredentialMetadataOutputKeySpecifier
)[];
export type CredentialMetadataOutputFieldPolicy = {
  context?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  schema?: FieldPolicy<any> | FieldReadFunction<any>;
  types?: FieldPolicy<any> | FieldReadFunction<any>;
  uniqueType?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type DirectRoomKeySpecifier = ('displayName' | 'id' | 'messages' | 'receiverID' | DirectRoomKeySpecifier)[];
export type DirectRoomFieldPolicy = {
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  messages?: FieldPolicy<any> | FieldReadFunction<any>;
  receiverID?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type DiscussionKeySpecifier = (
  | 'authorization'
  | 'category'
  | 'comments'
  | 'createdBy'
  | 'createdDate'
  | 'id'
  | 'nameID'
  | 'privacy'
  | 'profile'
  | 'timestamp'
  | 'updatedDate'
  | DiscussionKeySpecifier
)[];
export type DiscussionFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  category?: FieldPolicy<any> | FieldReadFunction<any>;
  comments?: FieldPolicy<any> | FieldReadFunction<any>;
  createdBy?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  privacy?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  timestamp?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type DocumentKeySpecifier = (
  | 'authorization'
  | 'createdBy'
  | 'createdDate'
  | 'displayName'
  | 'id'
  | 'mimeType'
  | 'size'
  | 'tagset'
  | 'temporaryLocation'
  | 'updatedDate'
  | 'uploadedDate'
  | 'url'
  | DocumentKeySpecifier
)[];
export type DocumentFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdBy?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  mimeType?: FieldPolicy<any> | FieldReadFunction<any>;
  size?: FieldPolicy<any> | FieldReadFunction<any>;
  tagset?: FieldPolicy<any> | FieldReadFunction<any>;
  temporaryLocation?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  uploadedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type EcosystemModelKeySpecifier = (
  | 'actorGroups'
  | 'authorization'
  | 'createdDate'
  | 'description'
  | 'id'
  | 'updatedDate'
  | EcosystemModelKeySpecifier
)[];
export type EcosystemModelFieldPolicy = {
  actorGroups?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type FileStorageConfigKeySpecifier = ('maxFileSize' | FileStorageConfigKeySpecifier)[];
export type FileStorageConfigFieldPolicy = {
  maxFileSize?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type FormKeySpecifier = (
  | 'createdDate'
  | 'description'
  | 'id'
  | 'questions'
  | 'updatedDate'
  | FormKeySpecifier
)[];
export type FormFieldPolicy = {
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  questions?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type FormQuestionKeySpecifier = (
  | 'explanation'
  | 'maxLength'
  | 'question'
  | 'required'
  | 'sortOrder'
  | FormQuestionKeySpecifier
)[];
export type FormQuestionFieldPolicy = {
  explanation?: FieldPolicy<any> | FieldReadFunction<any>;
  maxLength?: FieldPolicy<any> | FieldReadFunction<any>;
  question?: FieldPolicy<any> | FieldReadFunction<any>;
  required?: FieldPolicy<any> | FieldReadFunction<any>;
  sortOrder?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ForumKeySpecifier = (
  | 'authorization'
  | 'createdDate'
  | 'discussion'
  | 'discussionCategories'
  | 'discussions'
  | 'id'
  | 'updatedDate'
  | ForumKeySpecifier
)[];
export type ForumFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  discussion?: FieldPolicy<any> | FieldReadFunction<any>;
  discussionCategories?: FieldPolicy<any> | FieldReadFunction<any>;
  discussions?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type GeoKeySpecifier = ('endpoint' | GeoKeySpecifier)[];
export type GeoFieldPolicy = {
  endpoint?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type GroupableKeySpecifier = ('groups' | GroupableKeySpecifier)[];
export type GroupableFieldPolicy = {
  groups?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ISearchResultsKeySpecifier = (
  | 'calloutResults'
  | 'calloutResultsCount'
  | 'contributionResults'
  | 'contributionResultsCount'
  | 'contributorResults'
  | 'contributorResultsCount'
  | 'groupResults'
  | 'journeyResults'
  | 'journeyResultsCount'
  | ISearchResultsKeySpecifier
)[];
export type ISearchResultsFieldPolicy = {
  calloutResults?: FieldPolicy<any> | FieldReadFunction<any>;
  calloutResultsCount?: FieldPolicy<any> | FieldReadFunction<any>;
  contributionResults?: FieldPolicy<any> | FieldReadFunction<any>;
  contributionResultsCount?: FieldPolicy<any> | FieldReadFunction<any>;
  contributorResults?: FieldPolicy<any> | FieldReadFunction<any>;
  contributorResultsCount?: FieldPolicy<any> | FieldReadFunction<any>;
  groupResults?: FieldPolicy<any> | FieldReadFunction<any>;
  journeyResults?: FieldPolicy<any> | FieldReadFunction<any>;
  journeyResultsCount?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InnovationFlowKeySpecifier = (
  | 'authorization'
  | 'createdDate'
  | 'currentState'
  | 'id'
  | 'profile'
  | 'states'
  | 'updatedDate'
  | InnovationFlowKeySpecifier
)[];
export type InnovationFlowFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  currentState?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  states?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InnovationFlowStateKeySpecifier = ('description' | 'displayName' | InnovationFlowStateKeySpecifier)[];
export type InnovationFlowStateFieldPolicy = {
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InnovationHubKeySpecifier = (
  | 'account'
  | 'authorization'
  | 'createdDate'
  | 'id'
  | 'listedInStore'
  | 'nameID'
  | 'profile'
  | 'provider'
  | 'searchVisibility'
  | 'spaceListFilter'
  | 'spaceVisibilityFilter'
  | 'subdomain'
  | 'type'
  | 'updatedDate'
  | InnovationHubKeySpecifier
)[];
export type InnovationHubFieldPolicy = {
  account?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  listedInStore?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  provider?: FieldPolicy<any> | FieldReadFunction<any>;
  searchVisibility?: FieldPolicy<any> | FieldReadFunction<any>;
  spaceListFilter?: FieldPolicy<any> | FieldReadFunction<any>;
  spaceVisibilityFilter?: FieldPolicy<any> | FieldReadFunction<any>;
  subdomain?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InnovationPackKeySpecifier = (
  | 'authorization'
  | 'createdDate'
  | 'id'
  | 'listedInStore'
  | 'nameID'
  | 'profile'
  | 'provider'
  | 'searchVisibility'
  | 'templatesSet'
  | 'updatedDate'
  | InnovationPackKeySpecifier
)[];
export type InnovationPackFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  listedInStore?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  provider?: FieldPolicy<any> | FieldReadFunction<any>;
  searchVisibility?: FieldPolicy<any> | FieldReadFunction<any>;
  templatesSet?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InputCreatorQueryResultsKeySpecifier = (
  | 'callout'
  | 'collaboration'
  | 'communityGuidelines'
  | 'innovationFlow'
  | 'whiteboard'
  | InputCreatorQueryResultsKeySpecifier
)[];
export type InputCreatorQueryResultsFieldPolicy = {
  callout?: FieldPolicy<any> | FieldReadFunction<any>;
  collaboration?: FieldPolicy<any> | FieldReadFunction<any>;
  communityGuidelines?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationFlow?: FieldPolicy<any> | FieldReadFunction<any>;
  whiteboard?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InvitationKeySpecifier = (
  | 'authorization'
  | 'contributor'
  | 'contributorType'
  | 'createdBy'
  | 'createdDate'
  | 'extraRole'
  | 'id'
  | 'invitedToParent'
  | 'lifecycle'
  | 'nextEvents'
  | 'state'
  | 'stateIsFinal'
  | 'updatedDate'
  | 'welcomeMessage'
  | InvitationKeySpecifier
)[];
export type InvitationFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  contributor?: FieldPolicy<any> | FieldReadFunction<any>;
  contributorType?: FieldPolicy<any> | FieldReadFunction<any>;
  createdBy?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  extraRole?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  invitedToParent?: FieldPolicy<any> | FieldReadFunction<any>;
  lifecycle?: FieldPolicy<any> | FieldReadFunction<any>;
  nextEvents?: FieldPolicy<any> | FieldReadFunction<any>;
  state?: FieldPolicy<any> | FieldReadFunction<any>;
  stateIsFinal?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  welcomeMessage?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type LatestReleaseDiscussionKeySpecifier = ('id' | 'nameID' | LatestReleaseDiscussionKeySpecifier)[];
export type LatestReleaseDiscussionFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type LibraryKeySpecifier = (
  | 'authorization'
  | 'createdDate'
  | 'id'
  | 'innovationHubs'
  | 'innovationPacks'
  | 'templates'
  | 'updatedDate'
  | 'virtualContributors'
  | LibraryKeySpecifier
)[];
export type LibraryFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationHubs?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationPacks?: FieldPolicy<any> | FieldReadFunction<any>;
  templates?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  virtualContributors?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type LicensePlanKeySpecifier = (
  | 'assignToNewOrganizationAccounts'
  | 'assignToNewUserAccounts'
  | 'createdDate'
  | 'enabled'
  | 'id'
  | 'isFree'
  | 'licenseCredential'
  | 'name'
  | 'pricePerMonth'
  | 'requiresContactSupport'
  | 'requiresPaymentMethod'
  | 'sortOrder'
  | 'trialEnabled'
  | 'type'
  | 'updatedDate'
  | LicensePlanKeySpecifier
)[];
export type LicensePlanFieldPolicy = {
  assignToNewOrganizationAccounts?: FieldPolicy<any> | FieldReadFunction<any>;
  assignToNewUserAccounts?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  enabled?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  isFree?: FieldPolicy<any> | FieldReadFunction<any>;
  licenseCredential?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  pricePerMonth?: FieldPolicy<any> | FieldReadFunction<any>;
  requiresContactSupport?: FieldPolicy<any> | FieldReadFunction<any>;
  requiresPaymentMethod?: FieldPolicy<any> | FieldReadFunction<any>;
  sortOrder?: FieldPolicy<any> | FieldReadFunction<any>;
  trialEnabled?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type LicensePolicyKeySpecifier = (
  | 'authorization'
  | 'createdDate'
  | 'credentialRules'
  | 'id'
  | 'updatedDate'
  | LicensePolicyKeySpecifier
)[];
export type LicensePolicyFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  credentialRules?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type LicensePolicyCredentialRuleKeySpecifier = (
  | 'credentialType'
  | 'grantedPrivileges'
  | 'name'
  | LicensePolicyCredentialRuleKeySpecifier
)[];
export type LicensePolicyCredentialRuleFieldPolicy = {
  credentialType?: FieldPolicy<any> | FieldReadFunction<any>;
  grantedPrivileges?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type LicensingKeySpecifier = (
  | 'authorization'
  | 'createdDate'
  | 'id'
  | 'plans'
  | 'policy'
  | 'updatedDate'
  | LicensingKeySpecifier
)[];
export type LicensingFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  plans?: FieldPolicy<any> | FieldReadFunction<any>;
  policy?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type LifecycleKeySpecifier = ('createdDate' | 'id' | 'updatedDate' | LifecycleKeySpecifier)[];
export type LifecycleFieldPolicy = {
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type LinkKeySpecifier = (
  | 'authorization'
  | 'createdDate'
  | 'id'
  | 'profile'
  | 'updatedDate'
  | 'uri'
  | LinkKeySpecifier
)[];
export type LinkFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  uri?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type LocationKeySpecifier = (
  | 'addressLine1'
  | 'addressLine2'
  | 'city'
  | 'country'
  | 'createdDate'
  | 'id'
  | 'postalCode'
  | 'stateOrProvince'
  | 'updatedDate'
  | LocationKeySpecifier
)[];
export type LocationFieldPolicy = {
  addressLine1?: FieldPolicy<any> | FieldReadFunction<any>;
  addressLine2?: FieldPolicy<any> | FieldReadFunction<any>;
  city?: FieldPolicy<any> | FieldReadFunction<any>;
  country?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  postalCode?: FieldPolicy<any> | FieldReadFunction<any>;
  stateOrProvince?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type LookupByNameQueryResultsKeySpecifier = (
  | 'innovationPack'
  | 'template'
  | LookupByNameQueryResultsKeySpecifier
)[];
export type LookupByNameQueryResultsFieldPolicy = {
  innovationPack?: FieldPolicy<any> | FieldReadFunction<any>;
  template?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type LookupQueryResultsKeySpecifier = (
  | 'account'
  | 'application'
  | 'authorizationPolicy'
  | 'authorizationPrivilegesForUser'
  | 'calendar'
  | 'calendarEvent'
  | 'callout'
  | 'collaboration'
  | 'community'
  | 'communityGuidelines'
  | 'context'
  | 'document'
  | 'innovationFlow'
  | 'innovationHub'
  | 'innovationPack'
  | 'invitation'
  | 'post'
  | 'profile'
  | 'roleSet'
  | 'room'
  | 'space'
  | 'storageAggregator'
  | 'storageBucket'
  | 'template'
  | 'templatesSet'
  | 'virtualContributor'
  | 'whiteboard'
  | LookupQueryResultsKeySpecifier
)[];
export type LookupQueryResultsFieldPolicy = {
  account?: FieldPolicy<any> | FieldReadFunction<any>;
  application?: FieldPolicy<any> | FieldReadFunction<any>;
  authorizationPolicy?: FieldPolicy<any> | FieldReadFunction<any>;
  authorizationPrivilegesForUser?: FieldPolicy<any> | FieldReadFunction<any>;
  calendar?: FieldPolicy<any> | FieldReadFunction<any>;
  calendarEvent?: FieldPolicy<any> | FieldReadFunction<any>;
  callout?: FieldPolicy<any> | FieldReadFunction<any>;
  collaboration?: FieldPolicy<any> | FieldReadFunction<any>;
  community?: FieldPolicy<any> | FieldReadFunction<any>;
  communityGuidelines?: FieldPolicy<any> | FieldReadFunction<any>;
  context?: FieldPolicy<any> | FieldReadFunction<any>;
  document?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationFlow?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationHub?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationPack?: FieldPolicy<any> | FieldReadFunction<any>;
  invitation?: FieldPolicy<any> | FieldReadFunction<any>;
  post?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  roleSet?: FieldPolicy<any> | FieldReadFunction<any>;
  room?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  storageAggregator?: FieldPolicy<any> | FieldReadFunction<any>;
  storageBucket?: FieldPolicy<any> | FieldReadFunction<any>;
  template?: FieldPolicy<any> | FieldReadFunction<any>;
  templatesSet?: FieldPolicy<any> | FieldReadFunction<any>;
  virtualContributor?: FieldPolicy<any> | FieldReadFunction<any>;
  whiteboard?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MeQueryResultsKeySpecifier = (
  | 'communityApplications'
  | 'communityInvitations'
  | 'id'
  | 'mySpaces'
  | 'spaceMembershipsFlat'
  | 'spaceMembershipsHierarchical'
  | 'user'
  | MeQueryResultsKeySpecifier
)[];
export type MeQueryResultsFieldPolicy = {
  communityApplications?: FieldPolicy<any> | FieldReadFunction<any>;
  communityInvitations?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  mySpaces?: FieldPolicy<any> | FieldReadFunction<any>;
  spaceMembershipsFlat?: FieldPolicy<any> | FieldReadFunction<any>;
  spaceMembershipsHierarchical?: FieldPolicy<any> | FieldReadFunction<any>;
  user?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MessageKeySpecifier = (
  | 'id'
  | 'message'
  | 'reactions'
  | 'sender'
  | 'threadID'
  | 'timestamp'
  | MessageKeySpecifier
)[];
export type MessageFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  message?: FieldPolicy<any> | FieldReadFunction<any>;
  reactions?: FieldPolicy<any> | FieldReadFunction<any>;
  sender?: FieldPolicy<any> | FieldReadFunction<any>;
  threadID?: FieldPolicy<any> | FieldReadFunction<any>;
  timestamp?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MessageAnswerQuestionKeySpecifier = (
  | 'answer'
  | 'id'
  | 'question'
  | 'sources'
  | MessageAnswerQuestionKeySpecifier
)[];
export type MessageAnswerQuestionFieldPolicy = {
  answer?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  question?: FieldPolicy<any> | FieldReadFunction<any>;
  sources?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MessageAnswerToQuestionSourceKeySpecifier = ('title' | 'uri' | MessageAnswerToQuestionSourceKeySpecifier)[];
export type MessageAnswerToQuestionSourceFieldPolicy = {
  title?: FieldPolicy<any> | FieldReadFunction<any>;
  uri?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MetadataKeySpecifier = ('services' | MetadataKeySpecifier)[];
export type MetadataFieldPolicy = {
  services?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MigrateEmbeddingsKeySpecifier = ('success' | MigrateEmbeddingsKeySpecifier)[];
export type MigrateEmbeddingsFieldPolicy = {
  success?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MutationKeySpecifier = (
  | 'addReactionToMessageInRoom'
  | 'adminCommunicationEnsureAccessToCommunications'
  | 'adminCommunicationRemoveOrphanedRoom'
  | 'adminCommunicationUpdateRoomState'
  | 'adminSearchIngestFromScratch'
  | 'adminUpdateContributorAvatars'
  | 'adminUserAccountDelete'
  | 'aiServerAuthorizationPolicyReset'
  | 'aiServerCreateAiPersonaService'
  | 'aiServerDeleteAiPersonaService'
  | 'aiServerPersonaServiceIngest'
  | 'aiServerUpdateAiPersonaService'
  | 'applyForEntryRoleOnRoleSet'
  | 'assignLicensePlanToAccount'
  | 'assignLicensePlanToSpace'
  | 'assignOrganizationRoleToUser'
  | 'assignPlatformRoleToUser'
  | 'assignRoleToOrganization'
  | 'assignRoleToUser'
  | 'assignRoleToVirtualContributor'
  | 'assignUserToGroup'
  | 'authorizationPolicyResetAll'
  | 'authorizationPolicyResetOnAccount'
  | 'authorizationPolicyResetOnOrganization'
  | 'authorizationPolicyResetOnPlatform'
  | 'authorizationPolicyResetOnUser'
  | 'authorizationPolicyResetToGlobalAdminsAccess'
  | 'beginAlkemioUserVerifiedCredentialOfferInteraction'
  | 'beginCommunityMemberVerifiedCredentialOfferInteraction'
  | 'beginVerifiedCredentialRequestInteraction'
  | 'cleanupCollections'
  | 'convertChallengeToSpace'
  | 'convertOpportunityToChallenge'
  | 'createActor'
  | 'createActorGroup'
  | 'createCalloutOnCollaboration'
  | 'createContributionOnCallout'
  | 'createDiscussion'
  | 'createEventOnCalendar'
  | 'createGroupOnCommunity'
  | 'createGroupOnOrganization'
  | 'createInnovationHub'
  | 'createInnovationPack'
  | 'createLicensePlan'
  | 'createOrganization'
  | 'createReferenceOnProfile'
  | 'createSpace'
  | 'createSubspace'
  | 'createTagsetOnProfile'
  | 'createTemplate'
  | 'createUser'
  | 'createUserNewRegistration'
  | 'createVirtualContributor'
  | 'deleteActor'
  | 'deleteActorGroup'
  | 'deleteCalendarEvent'
  | 'deleteCallout'
  | 'deleteCollaboration'
  | 'deleteDiscussion'
  | 'deleteDocument'
  | 'deleteInnovationHub'
  | 'deleteInnovationPack'
  | 'deleteInvitation'
  | 'deleteLicensePlan'
  | 'deleteLink'
  | 'deleteOrganization'
  | 'deletePlatformInvitation'
  | 'deletePost'
  | 'deleteReference'
  | 'deleteSpace'
  | 'deleteStorageBucket'
  | 'deleteTemplate'
  | 'deleteUser'
  | 'deleteUserApplication'
  | 'deleteUserGroup'
  | 'deleteVirtualContributor'
  | 'deleteWhiteboard'
  | 'eventOnApplication'
  | 'eventOnCommunityInvitation'
  | 'eventOnOrganizationVerification'
  | 'grantCredentialToOrganization'
  | 'grantCredentialToUser'
  | 'ingest'
  | 'inviteContributorsForRoleSetMembership'
  | 'inviteUserToPlatformAndRoleSet'
  | 'inviteUserToPlatformWithRole'
  | 'joinRoleSet'
  | 'messageUser'
  | 'moveContributionToCallout'
  | 'refreshVirtualContributorBodyOfKnowledge'
  | 'removeMessageOnRoom'
  | 'removeOrganizationRoleFromUser'
  | 'removePlatformRoleFromUser'
  | 'removeReactionToMessageInRoom'
  | 'removeRoleFromOrganization'
  | 'removeRoleFromUser'
  | 'removeRoleFromVirtualContributor'
  | 'removeUserFromGroup'
  | 'resetChatGuidance'
  | 'revokeCredentialFromOrganization'
  | 'revokeCredentialFromUser'
  | 'revokeLicensePlanFromAccount'
  | 'revokeLicensePlanFromSpace'
  | 'sendMessageReplyToRoom'
  | 'sendMessageToCommunityLeads'
  | 'sendMessageToOrganization'
  | 'sendMessageToRoom'
  | 'sendMessageToUser'
  | 'transferInnovationHubToAccount'
  | 'transferInnovationPackToAccount'
  | 'transferSpaceToAccount'
  | 'transferVirtualContributorToAccount'
  | 'updateActor'
  | 'updateAiPersona'
  | 'updateAnswerRelevance'
  | 'updateApplicationFormOnRoleSet'
  | 'updateCalendarEvent'
  | 'updateCallout'
  | 'updateCalloutPublishInfo'
  | 'updateCalloutVisibility'
  | 'updateCalloutsSortOrder'
  | 'updateCommunityGuidelines'
  | 'updateContributionsSortOrder'
  | 'updateDiscussion'
  | 'updateDocument'
  | 'updateEcosystemModel'
  | 'updateInnovationFlow'
  | 'updateInnovationFlowSelectedState'
  | 'updateInnovationFlowSingleState'
  | 'updateInnovationFlowStatesFromTemplate'
  | 'updateInnovationHub'
  | 'updateInnovationPack'
  | 'updateLicensePlan'
  | 'updateLink'
  | 'updateOrganization'
  | 'updateOrganizationPlatformSettings'
  | 'updatePost'
  | 'updatePreferenceOnOrganization'
  | 'updatePreferenceOnUser'
  | 'updateProfile'
  | 'updateReference'
  | 'updateSpace'
  | 'updateSpaceDefaults'
  | 'updateSpacePlatformSettings'
  | 'updateSpaceSettings'
  | 'updateTagset'
  | 'updateTemplate'
  | 'updateUser'
  | 'updateUserGroup'
  | 'updateUserPlatformSettings'
  | 'updateVirtualContributor'
  | 'updateVisual'
  | 'updateWhiteboard'
  | 'uploadFileOnLink'
  | 'uploadFileOnReference'
  | 'uploadFileOnStorageBucket'
  | 'uploadImageOnVisual'
  | MutationKeySpecifier
)[];
export type MutationFieldPolicy = {
  addReactionToMessageInRoom?: FieldPolicy<any> | FieldReadFunction<any>;
  adminCommunicationEnsureAccessToCommunications?: FieldPolicy<any> | FieldReadFunction<any>;
  adminCommunicationRemoveOrphanedRoom?: FieldPolicy<any> | FieldReadFunction<any>;
  adminCommunicationUpdateRoomState?: FieldPolicy<any> | FieldReadFunction<any>;
  adminSearchIngestFromScratch?: FieldPolicy<any> | FieldReadFunction<any>;
  adminUpdateContributorAvatars?: FieldPolicy<any> | FieldReadFunction<any>;
  adminUserAccountDelete?: FieldPolicy<any> | FieldReadFunction<any>;
  aiServerAuthorizationPolicyReset?: FieldPolicy<any> | FieldReadFunction<any>;
  aiServerCreateAiPersonaService?: FieldPolicy<any> | FieldReadFunction<any>;
  aiServerDeleteAiPersonaService?: FieldPolicy<any> | FieldReadFunction<any>;
  aiServerPersonaServiceIngest?: FieldPolicy<any> | FieldReadFunction<any>;
  aiServerUpdateAiPersonaService?: FieldPolicy<any> | FieldReadFunction<any>;
  applyForEntryRoleOnRoleSet?: FieldPolicy<any> | FieldReadFunction<any>;
  assignLicensePlanToAccount?: FieldPolicy<any> | FieldReadFunction<any>;
  assignLicensePlanToSpace?: FieldPolicy<any> | FieldReadFunction<any>;
  assignOrganizationRoleToUser?: FieldPolicy<any> | FieldReadFunction<any>;
  assignPlatformRoleToUser?: FieldPolicy<any> | FieldReadFunction<any>;
  assignRoleToOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  assignRoleToUser?: FieldPolicy<any> | FieldReadFunction<any>;
  assignRoleToVirtualContributor?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserToGroup?: FieldPolicy<any> | FieldReadFunction<any>;
  authorizationPolicyResetAll?: FieldPolicy<any> | FieldReadFunction<any>;
  authorizationPolicyResetOnAccount?: FieldPolicy<any> | FieldReadFunction<any>;
  authorizationPolicyResetOnOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  authorizationPolicyResetOnPlatform?: FieldPolicy<any> | FieldReadFunction<any>;
  authorizationPolicyResetOnUser?: FieldPolicy<any> | FieldReadFunction<any>;
  authorizationPolicyResetToGlobalAdminsAccess?: FieldPolicy<any> | FieldReadFunction<any>;
  beginAlkemioUserVerifiedCredentialOfferInteraction?: FieldPolicy<any> | FieldReadFunction<any>;
  beginCommunityMemberVerifiedCredentialOfferInteraction?: FieldPolicy<any> | FieldReadFunction<any>;
  beginVerifiedCredentialRequestInteraction?: FieldPolicy<any> | FieldReadFunction<any>;
  cleanupCollections?: FieldPolicy<any> | FieldReadFunction<any>;
  convertChallengeToSpace?: FieldPolicy<any> | FieldReadFunction<any>;
  convertOpportunityToChallenge?: FieldPolicy<any> | FieldReadFunction<any>;
  createActor?: FieldPolicy<any> | FieldReadFunction<any>;
  createActorGroup?: FieldPolicy<any> | FieldReadFunction<any>;
  createCalloutOnCollaboration?: FieldPolicy<any> | FieldReadFunction<any>;
  createContributionOnCallout?: FieldPolicy<any> | FieldReadFunction<any>;
  createDiscussion?: FieldPolicy<any> | FieldReadFunction<any>;
  createEventOnCalendar?: FieldPolicy<any> | FieldReadFunction<any>;
  createGroupOnCommunity?: FieldPolicy<any> | FieldReadFunction<any>;
  createGroupOnOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  createInnovationHub?: FieldPolicy<any> | FieldReadFunction<any>;
  createInnovationPack?: FieldPolicy<any> | FieldReadFunction<any>;
  createLicensePlan?: FieldPolicy<any> | FieldReadFunction<any>;
  createOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  createReferenceOnProfile?: FieldPolicy<any> | FieldReadFunction<any>;
  createSpace?: FieldPolicy<any> | FieldReadFunction<any>;
  createSubspace?: FieldPolicy<any> | FieldReadFunction<any>;
  createTagsetOnProfile?: FieldPolicy<any> | FieldReadFunction<any>;
  createTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
  createUser?: FieldPolicy<any> | FieldReadFunction<any>;
  createUserNewRegistration?: FieldPolicy<any> | FieldReadFunction<any>;
  createVirtualContributor?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteActor?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteActorGroup?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteCalendarEvent?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteCallout?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteCollaboration?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteDiscussion?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteDocument?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteInnovationHub?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteInnovationPack?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteInvitation?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteLicensePlan?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteLink?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  deletePlatformInvitation?: FieldPolicy<any> | FieldReadFunction<any>;
  deletePost?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteReference?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteSpace?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteStorageBucket?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteUser?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteUserApplication?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteUserGroup?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteVirtualContributor?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteWhiteboard?: FieldPolicy<any> | FieldReadFunction<any>;
  eventOnApplication?: FieldPolicy<any> | FieldReadFunction<any>;
  eventOnCommunityInvitation?: FieldPolicy<any> | FieldReadFunction<any>;
  eventOnOrganizationVerification?: FieldPolicy<any> | FieldReadFunction<any>;
  grantCredentialToOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  grantCredentialToUser?: FieldPolicy<any> | FieldReadFunction<any>;
  ingest?: FieldPolicy<any> | FieldReadFunction<any>;
  inviteContributorsForRoleSetMembership?: FieldPolicy<any> | FieldReadFunction<any>;
  inviteUserToPlatformAndRoleSet?: FieldPolicy<any> | FieldReadFunction<any>;
  inviteUserToPlatformWithRole?: FieldPolicy<any> | FieldReadFunction<any>;
  joinRoleSet?: FieldPolicy<any> | FieldReadFunction<any>;
  messageUser?: FieldPolicy<any> | FieldReadFunction<any>;
  moveContributionToCallout?: FieldPolicy<any> | FieldReadFunction<any>;
  refreshVirtualContributorBodyOfKnowledge?: FieldPolicy<any> | FieldReadFunction<any>;
  removeMessageOnRoom?: FieldPolicy<any> | FieldReadFunction<any>;
  removeOrganizationRoleFromUser?: FieldPolicy<any> | FieldReadFunction<any>;
  removePlatformRoleFromUser?: FieldPolicy<any> | FieldReadFunction<any>;
  removeReactionToMessageInRoom?: FieldPolicy<any> | FieldReadFunction<any>;
  removeRoleFromOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  removeRoleFromUser?: FieldPolicy<any> | FieldReadFunction<any>;
  removeRoleFromVirtualContributor?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserFromGroup?: FieldPolicy<any> | FieldReadFunction<any>;
  resetChatGuidance?: FieldPolicy<any> | FieldReadFunction<any>;
  revokeCredentialFromOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  revokeCredentialFromUser?: FieldPolicy<any> | FieldReadFunction<any>;
  revokeLicensePlanFromAccount?: FieldPolicy<any> | FieldReadFunction<any>;
  revokeLicensePlanFromSpace?: FieldPolicy<any> | FieldReadFunction<any>;
  sendMessageReplyToRoom?: FieldPolicy<any> | FieldReadFunction<any>;
  sendMessageToCommunityLeads?: FieldPolicy<any> | FieldReadFunction<any>;
  sendMessageToOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  sendMessageToRoom?: FieldPolicy<any> | FieldReadFunction<any>;
  sendMessageToUser?: FieldPolicy<any> | FieldReadFunction<any>;
  transferInnovationHubToAccount?: FieldPolicy<any> | FieldReadFunction<any>;
  transferInnovationPackToAccount?: FieldPolicy<any> | FieldReadFunction<any>;
  transferSpaceToAccount?: FieldPolicy<any> | FieldReadFunction<any>;
  transferVirtualContributorToAccount?: FieldPolicy<any> | FieldReadFunction<any>;
  updateActor?: FieldPolicy<any> | FieldReadFunction<any>;
  updateAiPersona?: FieldPolicy<any> | FieldReadFunction<any>;
  updateAnswerRelevance?: FieldPolicy<any> | FieldReadFunction<any>;
  updateApplicationFormOnRoleSet?: FieldPolicy<any> | FieldReadFunction<any>;
  updateCalendarEvent?: FieldPolicy<any> | FieldReadFunction<any>;
  updateCallout?: FieldPolicy<any> | FieldReadFunction<any>;
  updateCalloutPublishInfo?: FieldPolicy<any> | FieldReadFunction<any>;
  updateCalloutVisibility?: FieldPolicy<any> | FieldReadFunction<any>;
  updateCalloutsSortOrder?: FieldPolicy<any> | FieldReadFunction<any>;
  updateCommunityGuidelines?: FieldPolicy<any> | FieldReadFunction<any>;
  updateContributionsSortOrder?: FieldPolicy<any> | FieldReadFunction<any>;
  updateDiscussion?: FieldPolicy<any> | FieldReadFunction<any>;
  updateDocument?: FieldPolicy<any> | FieldReadFunction<any>;
  updateEcosystemModel?: FieldPolicy<any> | FieldReadFunction<any>;
  updateInnovationFlow?: FieldPolicy<any> | FieldReadFunction<any>;
  updateInnovationFlowSelectedState?: FieldPolicy<any> | FieldReadFunction<any>;
  updateInnovationFlowSingleState?: FieldPolicy<any> | FieldReadFunction<any>;
  updateInnovationFlowStatesFromTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
  updateInnovationHub?: FieldPolicy<any> | FieldReadFunction<any>;
  updateInnovationPack?: FieldPolicy<any> | FieldReadFunction<any>;
  updateLicensePlan?: FieldPolicy<any> | FieldReadFunction<any>;
  updateLink?: FieldPolicy<any> | FieldReadFunction<any>;
  updateOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  updateOrganizationPlatformSettings?: FieldPolicy<any> | FieldReadFunction<any>;
  updatePost?: FieldPolicy<any> | FieldReadFunction<any>;
  updatePreferenceOnOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  updatePreferenceOnUser?: FieldPolicy<any> | FieldReadFunction<any>;
  updateProfile?: FieldPolicy<any> | FieldReadFunction<any>;
  updateReference?: FieldPolicy<any> | FieldReadFunction<any>;
  updateSpace?: FieldPolicy<any> | FieldReadFunction<any>;
  updateSpaceDefaults?: FieldPolicy<any> | FieldReadFunction<any>;
  updateSpacePlatformSettings?: FieldPolicy<any> | FieldReadFunction<any>;
  updateSpaceSettings?: FieldPolicy<any> | FieldReadFunction<any>;
  updateTagset?: FieldPolicy<any> | FieldReadFunction<any>;
  updateTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
  updateUser?: FieldPolicy<any> | FieldReadFunction<any>;
  updateUserGroup?: FieldPolicy<any> | FieldReadFunction<any>;
  updateUserPlatformSettings?: FieldPolicy<any> | FieldReadFunction<any>;
  updateVirtualContributor?: FieldPolicy<any> | FieldReadFunction<any>;
  updateVisual?: FieldPolicy<any> | FieldReadFunction<any>;
  updateWhiteboard?: FieldPolicy<any> | FieldReadFunction<any>;
  uploadFileOnLink?: FieldPolicy<any> | FieldReadFunction<any>;
  uploadFileOnReference?: FieldPolicy<any> | FieldReadFunction<any>;
  uploadFileOnStorageBucket?: FieldPolicy<any> | FieldReadFunction<any>;
  uploadImageOnVisual?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MySpaceResultsKeySpecifier = ('latestActivity' | 'space' | MySpaceResultsKeySpecifier)[];
export type MySpaceResultsFieldPolicy = {
  latestActivity?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type NVPKeySpecifier = ('createdDate' | 'id' | 'name' | 'updatedDate' | 'value' | NVPKeySpecifier)[];
export type NVPFieldPolicy = {
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  value?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type OrganizationKeySpecifier = (
  | 'account'
  | 'admins'
  | 'agent'
  | 'associates'
  | 'authorization'
  | 'contactEmail'
  | 'createdDate'
  | 'domain'
  | 'group'
  | 'groups'
  | 'id'
  | 'legalEntityName'
  | 'metrics'
  | 'myRoles'
  | 'nameID'
  | 'owners'
  | 'preferences'
  | 'profile'
  | 'storageAggregator'
  | 'updatedDate'
  | 'verification'
  | 'website'
  | OrganizationKeySpecifier
)[];
export type OrganizationFieldPolicy = {
  account?: FieldPolicy<any> | FieldReadFunction<any>;
  admins?: FieldPolicy<any> | FieldReadFunction<any>;
  agent?: FieldPolicy<any> | FieldReadFunction<any>;
  associates?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  contactEmail?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  domain?: FieldPolicy<any> | FieldReadFunction<any>;
  group?: FieldPolicy<any> | FieldReadFunction<any>;
  groups?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  legalEntityName?: FieldPolicy<any> | FieldReadFunction<any>;
  metrics?: FieldPolicy<any> | FieldReadFunction<any>;
  myRoles?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  owners?: FieldPolicy<any> | FieldReadFunction<any>;
  preferences?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  storageAggregator?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  verification?: FieldPolicy<any> | FieldReadFunction<any>;
  website?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type OrganizationVerificationKeySpecifier = (
  | 'authorization'
  | 'createdDate'
  | 'id'
  | 'lifecycle'
  | 'nextEvents'
  | 'state'
  | 'stateIsFinal'
  | 'status'
  | 'updatedDate'
  | OrganizationVerificationKeySpecifier
)[];
export type OrganizationVerificationFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  lifecycle?: FieldPolicy<any> | FieldReadFunction<any>;
  nextEvents?: FieldPolicy<any> | FieldReadFunction<any>;
  state?: FieldPolicy<any> | FieldReadFunction<any>;
  stateIsFinal?: FieldPolicy<any> | FieldReadFunction<any>;
  status?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type OryConfigKeySpecifier = ('issuer' | 'kratosPublicBaseURL' | OryConfigKeySpecifier)[];
export type OryConfigFieldPolicy = {
  issuer?: FieldPolicy<any> | FieldReadFunction<any>;
  kratosPublicBaseURL?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type PaginatedOrganizationKeySpecifier = (
  | 'organization'
  | 'pageInfo'
  | 'total'
  | PaginatedOrganizationKeySpecifier
)[];
export type PaginatedOrganizationFieldPolicy = {
  organization?: FieldPolicy<any> | FieldReadFunction<any>;
  pageInfo?: FieldPolicy<any> | FieldReadFunction<any>;
  total?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PaginatedSpacesKeySpecifier = ('pageInfo' | 'spaces' | 'total' | PaginatedSpacesKeySpecifier)[];
export type PaginatedSpacesFieldPolicy = {
  pageInfo?: FieldPolicy<any> | FieldReadFunction<any>;
  spaces?: FieldPolicy<any> | FieldReadFunction<any>;
  total?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PaginatedUsersKeySpecifier = ('pageInfo' | 'total' | 'users' | PaginatedUsersKeySpecifier)[];
export type PaginatedUsersFieldPolicy = {
  pageInfo?: FieldPolicy<any> | FieldReadFunction<any>;
  total?: FieldPolicy<any> | FieldReadFunction<any>;
  users?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PlatformKeySpecifier = (
  | 'authorization'
  | 'configuration'
  | 'createdDate'
  | 'forum'
  | 'id'
  | 'innovationHub'
  | 'latestReleaseDiscussion'
  | 'library'
  | 'licensing'
  | 'metadata'
  | 'myRoles'
  | 'platformInvitations'
  | 'storageAggregator'
  | 'updatedDate'
  | PlatformKeySpecifier
)[];
export type PlatformFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  configuration?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  forum?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationHub?: FieldPolicy<any> | FieldReadFunction<any>;
  latestReleaseDiscussion?: FieldPolicy<any> | FieldReadFunction<any>;
  library?: FieldPolicy<any> | FieldReadFunction<any>;
  licensing?: FieldPolicy<any> | FieldReadFunction<any>;
  metadata?: FieldPolicy<any> | FieldReadFunction<any>;
  myRoles?: FieldPolicy<any> | FieldReadFunction<any>;
  platformInvitations?: FieldPolicy<any> | FieldReadFunction<any>;
  storageAggregator?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PlatformFeatureFlagKeySpecifier = ('enabled' | 'name' | PlatformFeatureFlagKeySpecifier)[];
export type PlatformFeatureFlagFieldPolicy = {
  enabled?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PlatformInvitationKeySpecifier = (
  | 'authorization'
  | 'createdBy'
  | 'createdDate'
  | 'email'
  | 'firstName'
  | 'id'
  | 'lastName'
  | 'platformRole'
  | 'profileCreated'
  | 'roleSetExtraRole'
  | 'roleSetInvitedToParent'
  | 'updatedDate'
  | 'welcomeMessage'
  | PlatformInvitationKeySpecifier
)[];
export type PlatformInvitationFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdBy?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  email?: FieldPolicy<any> | FieldReadFunction<any>;
  firstName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  lastName?: FieldPolicy<any> | FieldReadFunction<any>;
  platformRole?: FieldPolicy<any> | FieldReadFunction<any>;
  profileCreated?: FieldPolicy<any> | FieldReadFunction<any>;
  roleSetExtraRole?: FieldPolicy<any> | FieldReadFunction<any>;
  roleSetInvitedToParent?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  welcomeMessage?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PlatformLocationsKeySpecifier = (
  | 'about'
  | 'aup'
  | 'blog'
  | 'community'
  | 'contactsupport'
  | 'documentation'
  | 'domain'
  | 'environment'
  | 'feedback'
  | 'forumreleases'
  | 'foundation'
  | 'help'
  | 'impact'
  | 'innovationLibrary'
  | 'inspiration'
  | 'landing'
  | 'newuser'
  | 'opensource'
  | 'privacy'
  | 'releases'
  | 'security'
  | 'support'
  | 'switchplan'
  | 'terms'
  | 'tips'
  | PlatformLocationsKeySpecifier
)[];
export type PlatformLocationsFieldPolicy = {
  about?: FieldPolicy<any> | FieldReadFunction<any>;
  aup?: FieldPolicy<any> | FieldReadFunction<any>;
  blog?: FieldPolicy<any> | FieldReadFunction<any>;
  community?: FieldPolicy<any> | FieldReadFunction<any>;
  contactsupport?: FieldPolicy<any> | FieldReadFunction<any>;
  documentation?: FieldPolicy<any> | FieldReadFunction<any>;
  domain?: FieldPolicy<any> | FieldReadFunction<any>;
  environment?: FieldPolicy<any> | FieldReadFunction<any>;
  feedback?: FieldPolicy<any> | FieldReadFunction<any>;
  forumreleases?: FieldPolicy<any> | FieldReadFunction<any>;
  foundation?: FieldPolicy<any> | FieldReadFunction<any>;
  help?: FieldPolicy<any> | FieldReadFunction<any>;
  impact?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationLibrary?: FieldPolicy<any> | FieldReadFunction<any>;
  inspiration?: FieldPolicy<any> | FieldReadFunction<any>;
  landing?: FieldPolicy<any> | FieldReadFunction<any>;
  newuser?: FieldPolicy<any> | FieldReadFunction<any>;
  opensource?: FieldPolicy<any> | FieldReadFunction<any>;
  privacy?: FieldPolicy<any> | FieldReadFunction<any>;
  releases?: FieldPolicy<any> | FieldReadFunction<any>;
  security?: FieldPolicy<any> | FieldReadFunction<any>;
  support?: FieldPolicy<any> | FieldReadFunction<any>;
  switchplan?: FieldPolicy<any> | FieldReadFunction<any>;
  terms?: FieldPolicy<any> | FieldReadFunction<any>;
  tips?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PostKeySpecifier = (
  | 'authorization'
  | 'comments'
  | 'createdBy'
  | 'createdDate'
  | 'id'
  | 'nameID'
  | 'profile'
  | 'updatedDate'
  | PostKeySpecifier
)[];
export type PostFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  comments?: FieldPolicy<any> | FieldReadFunction<any>;
  createdBy?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PreferenceKeySpecifier = (
  | 'authorization'
  | 'createdDate'
  | 'definition'
  | 'id'
  | 'updatedDate'
  | 'value'
  | PreferenceKeySpecifier
)[];
export type PreferenceFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  definition?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  value?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PreferenceDefinitionKeySpecifier = (
  | 'createdDate'
  | 'description'
  | 'displayName'
  | 'group'
  | 'id'
  | 'type'
  | 'updatedDate'
  | 'valueType'
  | PreferenceDefinitionKeySpecifier
)[];
export type PreferenceDefinitionFieldPolicy = {
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  group?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  valueType?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ProfileKeySpecifier = (
  | 'authorization'
  | 'createdDate'
  | 'description'
  | 'displayName'
  | 'id'
  | 'location'
  | 'references'
  | 'storageBucket'
  | 'tagline'
  | 'tagset'
  | 'tagsets'
  | 'type'
  | 'updatedDate'
  | 'url'
  | 'visual'
  | 'visuals'
  | ProfileKeySpecifier
)[];
export type ProfileFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  location?: FieldPolicy<any> | FieldReadFunction<any>;
  references?: FieldPolicy<any> | FieldReadFunction<any>;
  storageBucket?: FieldPolicy<any> | FieldReadFunction<any>;
  tagline?: FieldPolicy<any> | FieldReadFunction<any>;
  tagset?: FieldPolicy<any> | FieldReadFunction<any>;
  tagsets?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
  visual?: FieldPolicy<any> | FieldReadFunction<any>;
  visuals?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ProfileCredentialVerifiedKeySpecifier = ('userEmail' | 'vc' | ProfileCredentialVerifiedKeySpecifier)[];
export type ProfileCredentialVerifiedFieldPolicy = {
  userEmail?: FieldPolicy<any> | FieldReadFunction<any>;
  vc?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type QueryKeySpecifier = (
  | 'account'
  | 'accounts'
  | 'activityFeed'
  | 'activityFeedGrouped'
  | 'activityLogOnCollaboration'
  | 'adminCommunicationMembership'
  | 'adminCommunicationOrphanedUsage'
  | 'aiServer'
  | 'askChatGuidanceQuestion'
  | 'askVirtualContributorQuestion'
  | 'exploreSpaces'
  | 'getSupportedVerifiedCredentialMetadata'
  | 'inputCreator'
  | 'lookup'
  | 'lookupByName'
  | 'me'
  | 'organization'
  | 'organizations'
  | 'organizationsPaginated'
  | 'platform'
  | 'rolesOrganization'
  | 'rolesUser'
  | 'rolesVirtualContributor'
  | 'search'
  | 'space'
  | 'spaces'
  | 'spacesPaginated'
  | 'task'
  | 'tasks'
  | 'user'
  | 'userAuthorizationPrivileges'
  | 'users'
  | 'usersPaginated'
  | 'usersWithAuthorizationCredential'
  | 'virtualContributor'
  | 'virtualContributors'
  | QueryKeySpecifier
)[];
export type QueryFieldPolicy = {
  account?: FieldPolicy<any> | FieldReadFunction<any>;
  accounts?: FieldPolicy<any> | FieldReadFunction<any>;
  activityFeed?: FieldPolicy<any> | FieldReadFunction<any>;
  activityFeedGrouped?: FieldPolicy<any> | FieldReadFunction<any>;
  activityLogOnCollaboration?: FieldPolicy<any> | FieldReadFunction<any>;
  adminCommunicationMembership?: FieldPolicy<any> | FieldReadFunction<any>;
  adminCommunicationOrphanedUsage?: FieldPolicy<any> | FieldReadFunction<any>;
  aiServer?: FieldPolicy<any> | FieldReadFunction<any>;
  askChatGuidanceQuestion?: FieldPolicy<any> | FieldReadFunction<any>;
  askVirtualContributorQuestion?: FieldPolicy<any> | FieldReadFunction<any>;
  exploreSpaces?: FieldPolicy<any> | FieldReadFunction<any>;
  getSupportedVerifiedCredentialMetadata?: FieldPolicy<any> | FieldReadFunction<any>;
  inputCreator?: FieldPolicy<any> | FieldReadFunction<any>;
  lookup?: FieldPolicy<any> | FieldReadFunction<any>;
  lookupByName?: FieldPolicy<any> | FieldReadFunction<any>;
  me?: FieldPolicy<any> | FieldReadFunction<any>;
  organization?: FieldPolicy<any> | FieldReadFunction<any>;
  organizations?: FieldPolicy<any> | FieldReadFunction<any>;
  organizationsPaginated?: FieldPolicy<any> | FieldReadFunction<any>;
  platform?: FieldPolicy<any> | FieldReadFunction<any>;
  rolesOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  rolesUser?: FieldPolicy<any> | FieldReadFunction<any>;
  rolesVirtualContributor?: FieldPolicy<any> | FieldReadFunction<any>;
  search?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  spaces?: FieldPolicy<any> | FieldReadFunction<any>;
  spacesPaginated?: FieldPolicy<any> | FieldReadFunction<any>;
  task?: FieldPolicy<any> | FieldReadFunction<any>;
  tasks?: FieldPolicy<any> | FieldReadFunction<any>;
  user?: FieldPolicy<any> | FieldReadFunction<any>;
  userAuthorizationPrivileges?: FieldPolicy<any> | FieldReadFunction<any>;
  users?: FieldPolicy<any> | FieldReadFunction<any>;
  usersPaginated?: FieldPolicy<any> | FieldReadFunction<any>;
  usersWithAuthorizationCredential?: FieldPolicy<any> | FieldReadFunction<any>;
  virtualContributor?: FieldPolicy<any> | FieldReadFunction<any>;
  virtualContributors?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type QuestionKeySpecifier = ('createdDate' | 'id' | 'name' | 'updatedDate' | 'value' | QuestionKeySpecifier)[];
export type QuestionFieldPolicy = {
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  value?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ReactionKeySpecifier = ('emoji' | 'id' | 'sender' | 'timestamp' | ReactionKeySpecifier)[];
export type ReactionFieldPolicy = {
  emoji?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  sender?: FieldPolicy<any> | FieldReadFunction<any>;
  timestamp?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ReferenceKeySpecifier = (
  | 'authorization'
  | 'createdDate'
  | 'description'
  | 'id'
  | 'name'
  | 'updatedDate'
  | 'uri'
  | ReferenceKeySpecifier
)[];
export type ReferenceFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  uri?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type RelayPaginatedSpaceKeySpecifier = (
  | 'account'
  | 'activeSubscription'
  | 'agent'
  | 'authorization'
  | 'collaboration'
  | 'community'
  | 'context'
  | 'createdDate'
  | 'defaults'
  | 'id'
  | 'level'
  | 'levelZeroSpaceID'
  | 'library'
  | 'licensePrivileges'
  | 'metrics'
  | 'nameID'
  | 'profile'
  | 'provider'
  | 'settings'
  | 'storageAggregator'
  | 'subscriptions'
  | 'subspace'
  | 'subspaces'
  | 'type'
  | 'updatedDate'
  | 'visibility'
  | RelayPaginatedSpaceKeySpecifier
)[];
export type RelayPaginatedSpaceFieldPolicy = {
  account?: FieldPolicy<any> | FieldReadFunction<any>;
  activeSubscription?: FieldPolicy<any> | FieldReadFunction<any>;
  agent?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  collaboration?: FieldPolicy<any> | FieldReadFunction<any>;
  community?: FieldPolicy<any> | FieldReadFunction<any>;
  context?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  defaults?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  level?: FieldPolicy<any> | FieldReadFunction<any>;
  levelZeroSpaceID?: FieldPolicy<any> | FieldReadFunction<any>;
  library?: FieldPolicy<any> | FieldReadFunction<any>;
  licensePrivileges?: FieldPolicy<any> | FieldReadFunction<any>;
  metrics?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  provider?: FieldPolicy<any> | FieldReadFunction<any>;
  settings?: FieldPolicy<any> | FieldReadFunction<any>;
  storageAggregator?: FieldPolicy<any> | FieldReadFunction<any>;
  subscriptions?: FieldPolicy<any> | FieldReadFunction<any>;
  subspace?: FieldPolicy<any> | FieldReadFunction<any>;
  subspaces?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  visibility?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type RelayPaginatedSpaceEdgeKeySpecifier = ('node' | RelayPaginatedSpaceEdgeKeySpecifier)[];
export type RelayPaginatedSpaceEdgeFieldPolicy = {
  node?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type RelayPaginatedSpacePageInfoKeySpecifier = (
  | 'endCursor'
  | 'hasNextPage'
  | 'hasPreviousPage'
  | 'startCursor'
  | RelayPaginatedSpacePageInfoKeySpecifier
)[];
export type RelayPaginatedSpacePageInfoFieldPolicy = {
  endCursor?: FieldPolicy<any> | FieldReadFunction<any>;
  hasNextPage?: FieldPolicy<any> | FieldReadFunction<any>;
  hasPreviousPage?: FieldPolicy<any> | FieldReadFunction<any>;
  startCursor?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type RoleKeySpecifier = (
  | 'createdDate'
  | 'credential'
  | 'id'
  | 'organizationPolicy'
  | 'parentCredentials'
  | 'requiresEntryRole'
  | 'requiresSameRoleInParentRoleSet'
  | 'type'
  | 'updatedDate'
  | 'userPolicy'
  | 'virtualContributorPolicy'
  | RoleKeySpecifier
)[];
export type RoleFieldPolicy = {
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  credential?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  organizationPolicy?: FieldPolicy<any> | FieldReadFunction<any>;
  parentCredentials?: FieldPolicy<any> | FieldReadFunction<any>;
  requiresEntryRole?: FieldPolicy<any> | FieldReadFunction<any>;
  requiresSameRoleInParentRoleSet?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  userPolicy?: FieldPolicy<any> | FieldReadFunction<any>;
  virtualContributorPolicy?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type RoleSetKeySpecifier = (
  | 'applicationForm'
  | 'applications'
  | 'authorization'
  | 'availableUsersForLeadRole'
  | 'availableUsersForMemberRole'
  | 'createdDate'
  | 'entryRoleType'
  | 'id'
  | 'invitations'
  | 'myMembershipStatus'
  | 'myRoles'
  | 'myRolesImplicit'
  | 'organizationsInRole'
  | 'platformInvitations'
  | 'roleDefinition'
  | 'roleDefinitions'
  | 'updatedDate'
  | 'usersInRole'
  | 'virtualContributorsInRole'
  | RoleSetKeySpecifier
)[];
export type RoleSetFieldPolicy = {
  applicationForm?: FieldPolicy<any> | FieldReadFunction<any>;
  applications?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  availableUsersForLeadRole?: FieldPolicy<any> | FieldReadFunction<any>;
  availableUsersForMemberRole?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  entryRoleType?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  invitations?: FieldPolicy<any> | FieldReadFunction<any>;
  myMembershipStatus?: FieldPolicy<any> | FieldReadFunction<any>;
  myRoles?: FieldPolicy<any> | FieldReadFunction<any>;
  myRolesImplicit?: FieldPolicy<any> | FieldReadFunction<any>;
  organizationsInRole?: FieldPolicy<any> | FieldReadFunction<any>;
  platformInvitations?: FieldPolicy<any> | FieldReadFunction<any>;
  roleDefinition?: FieldPolicy<any> | FieldReadFunction<any>;
  roleDefinitions?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  usersInRole?: FieldPolicy<any> | FieldReadFunction<any>;
  virtualContributorsInRole?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type RolesResultKeySpecifier = ('displayName' | 'id' | 'nameID' | 'roles' | RolesResultKeySpecifier)[];
export type RolesResultFieldPolicy = {
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  roles?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type RolesResultCommunityKeySpecifier = (
  | 'displayName'
  | 'id'
  | 'level'
  | 'nameID'
  | 'roles'
  | 'type'
  | RolesResultCommunityKeySpecifier
)[];
export type RolesResultCommunityFieldPolicy = {
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  level?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  roles?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type RolesResultOrganizationKeySpecifier = (
  | 'displayName'
  | 'id'
  | 'nameID'
  | 'organizationID'
  | 'roles'
  | 'userGroups'
  | RolesResultOrganizationKeySpecifier
)[];
export type RolesResultOrganizationFieldPolicy = {
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  organizationID?: FieldPolicy<any> | FieldReadFunction<any>;
  roles?: FieldPolicy<any> | FieldReadFunction<any>;
  userGroups?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type RolesResultSpaceKeySpecifier = (
  | 'displayName'
  | 'id'
  | 'level'
  | 'nameID'
  | 'roles'
  | 'spaceID'
  | 'subspaces'
  | 'type'
  | 'visibility'
  | RolesResultSpaceKeySpecifier
)[];
export type RolesResultSpaceFieldPolicy = {
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  level?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  roles?: FieldPolicy<any> | FieldReadFunction<any>;
  spaceID?: FieldPolicy<any> | FieldReadFunction<any>;
  subspaces?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  visibility?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type RoomKeySpecifier = (
  | 'authorization'
  | 'createdDate'
  | 'id'
  | 'messages'
  | 'messagesCount'
  | 'updatedDate'
  | 'vcInteractions'
  | RoomKeySpecifier
)[];
export type RoomFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  messages?: FieldPolicy<any> | FieldReadFunction<any>;
  messagesCount?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  vcInteractions?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type RoomEventSubscriptionResultKeySpecifier = (
  | 'message'
  | 'reaction'
  | 'room'
  | 'roomID'
  | RoomEventSubscriptionResultKeySpecifier
)[];
export type RoomEventSubscriptionResultFieldPolicy = {
  message?: FieldPolicy<any> | FieldReadFunction<any>;
  reaction?: FieldPolicy<any> | FieldReadFunction<any>;
  room?: FieldPolicy<any> | FieldReadFunction<any>;
  roomID?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type RoomMessageEventSubscriptionResultKeySpecifier = (
  | 'data'
  | 'type'
  | RoomMessageEventSubscriptionResultKeySpecifier
)[];
export type RoomMessageEventSubscriptionResultFieldPolicy = {
  data?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type RoomMessageReactionEventSubscriptionResultKeySpecifier = (
  | 'data'
  | 'messageID'
  | 'type'
  | RoomMessageReactionEventSubscriptionResultKeySpecifier
)[];
export type RoomMessageReactionEventSubscriptionResultFieldPolicy = {
  data?: FieldPolicy<any> | FieldReadFunction<any>;
  messageID?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SearchResultKeySpecifier = ('id' | 'score' | 'terms' | 'type' | SearchResultKeySpecifier)[];
export type SearchResultFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  score?: FieldPolicy<any> | FieldReadFunction<any>;
  terms?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SearchResultCalloutKeySpecifier = (
  | 'callout'
  | 'id'
  | 'score'
  | 'space'
  | 'terms'
  | 'type'
  | SearchResultCalloutKeySpecifier
)[];
export type SearchResultCalloutFieldPolicy = {
  callout?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  score?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  terms?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SearchResultOrganizationKeySpecifier = (
  | 'id'
  | 'organization'
  | 'score'
  | 'terms'
  | 'type'
  | SearchResultOrganizationKeySpecifier
)[];
export type SearchResultOrganizationFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  organization?: FieldPolicy<any> | FieldReadFunction<any>;
  score?: FieldPolicy<any> | FieldReadFunction<any>;
  terms?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SearchResultPostKeySpecifier = (
  | 'callout'
  | 'id'
  | 'post'
  | 'score'
  | 'space'
  | 'terms'
  | 'type'
  | SearchResultPostKeySpecifier
)[];
export type SearchResultPostFieldPolicy = {
  callout?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  post?: FieldPolicy<any> | FieldReadFunction<any>;
  score?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  terms?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SearchResultSpaceKeySpecifier = (
  | 'id'
  | 'parentSpace'
  | 'score'
  | 'space'
  | 'terms'
  | 'type'
  | SearchResultSpaceKeySpecifier
)[];
export type SearchResultSpaceFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  parentSpace?: FieldPolicy<any> | FieldReadFunction<any>;
  score?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  terms?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SearchResultUserKeySpecifier = (
  | 'id'
  | 'score'
  | 'terms'
  | 'type'
  | 'user'
  | SearchResultUserKeySpecifier
)[];
export type SearchResultUserFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  score?: FieldPolicy<any> | FieldReadFunction<any>;
  terms?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  user?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SearchResultUserGroupKeySpecifier = (
  | 'id'
  | 'score'
  | 'terms'
  | 'type'
  | 'userGroup'
  | SearchResultUserGroupKeySpecifier
)[];
export type SearchResultUserGroupFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  score?: FieldPolicy<any> | FieldReadFunction<any>;
  terms?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  userGroup?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SentryKeySpecifier = ('enabled' | 'endpoint' | 'environment' | 'submitPII' | SentryKeySpecifier)[];
export type SentryFieldPolicy = {
  enabled?: FieldPolicy<any> | FieldReadFunction<any>;
  endpoint?: FieldPolicy<any> | FieldReadFunction<any>;
  environment?: FieldPolicy<any> | FieldReadFunction<any>;
  submitPII?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ServiceMetadataKeySpecifier = ('name' | 'version' | ServiceMetadataKeySpecifier)[];
export type ServiceMetadataFieldPolicy = {
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  version?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SpaceKeySpecifier = (
  | 'account'
  | 'activeSubscription'
  | 'agent'
  | 'authorization'
  | 'collaboration'
  | 'community'
  | 'context'
  | 'createdDate'
  | 'defaults'
  | 'id'
  | 'level'
  | 'levelZeroSpaceID'
  | 'library'
  | 'licensePrivileges'
  | 'metrics'
  | 'nameID'
  | 'profile'
  | 'provider'
  | 'settings'
  | 'storageAggregator'
  | 'subscriptions'
  | 'subspace'
  | 'subspaces'
  | 'type'
  | 'updatedDate'
  | 'visibility'
  | SpaceKeySpecifier
)[];
export type SpaceFieldPolicy = {
  account?: FieldPolicy<any> | FieldReadFunction<any>;
  activeSubscription?: FieldPolicy<any> | FieldReadFunction<any>;
  agent?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  collaboration?: FieldPolicy<any> | FieldReadFunction<any>;
  community?: FieldPolicy<any> | FieldReadFunction<any>;
  context?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  defaults?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  level?: FieldPolicy<any> | FieldReadFunction<any>;
  levelZeroSpaceID?: FieldPolicy<any> | FieldReadFunction<any>;
  library?: FieldPolicy<any> | FieldReadFunction<any>;
  licensePrivileges?: FieldPolicy<any> | FieldReadFunction<any>;
  metrics?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  provider?: FieldPolicy<any> | FieldReadFunction<any>;
  settings?: FieldPolicy<any> | FieldReadFunction<any>;
  storageAggregator?: FieldPolicy<any> | FieldReadFunction<any>;
  subscriptions?: FieldPolicy<any> | FieldReadFunction<any>;
  subspace?: FieldPolicy<any> | FieldReadFunction<any>;
  subspaces?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  visibility?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SpaceDefaultsKeySpecifier = (
  | 'authorization'
  | 'createdDate'
  | 'id'
  | 'innovationFlowTemplate'
  | 'updatedDate'
  | SpaceDefaultsKeySpecifier
)[];
export type SpaceDefaultsFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationFlowTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SpacePendingMembershipInfoKeySpecifier = (
  | 'communityGuidelines'
  | 'context'
  | 'id'
  | 'level'
  | 'profile'
  | SpacePendingMembershipInfoKeySpecifier
)[];
export type SpacePendingMembershipInfoFieldPolicy = {
  communityGuidelines?: FieldPolicy<any> | FieldReadFunction<any>;
  context?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  level?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SpaceSettingsKeySpecifier = ('collaboration' | 'membership' | 'privacy' | SpaceSettingsKeySpecifier)[];
export type SpaceSettingsFieldPolicy = {
  collaboration?: FieldPolicy<any> | FieldReadFunction<any>;
  membership?: FieldPolicy<any> | FieldReadFunction<any>;
  privacy?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SpaceSettingsCollaborationKeySpecifier = (
  | 'allowMembersToCreateCallouts'
  | 'allowMembersToCreateSubspaces'
  | 'inheritMembershipRights'
  | SpaceSettingsCollaborationKeySpecifier
)[];
export type SpaceSettingsCollaborationFieldPolicy = {
  allowMembersToCreateCallouts?: FieldPolicy<any> | FieldReadFunction<any>;
  allowMembersToCreateSubspaces?: FieldPolicy<any> | FieldReadFunction<any>;
  inheritMembershipRights?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SpaceSettingsMembershipKeySpecifier = (
  | 'allowSubspaceAdminsToInviteMembers'
  | 'policy'
  | 'trustedOrganizations'
  | SpaceSettingsMembershipKeySpecifier
)[];
export type SpaceSettingsMembershipFieldPolicy = {
  allowSubspaceAdminsToInviteMembers?: FieldPolicy<any> | FieldReadFunction<any>;
  policy?: FieldPolicy<any> | FieldReadFunction<any>;
  trustedOrganizations?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SpaceSettingsPrivacyKeySpecifier = (
  | 'allowPlatformSupportAsAdmin'
  | 'mode'
  | SpaceSettingsPrivacyKeySpecifier
)[];
export type SpaceSettingsPrivacyFieldPolicy = {
  allowPlatformSupportAsAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  mode?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SpaceSubscriptionKeySpecifier = ('expires' | 'name' | SpaceSubscriptionKeySpecifier)[];
export type SpaceSubscriptionFieldPolicy = {
  expires?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type StorageAggregatorKeySpecifier = (
  | 'authorization'
  | 'createdDate'
  | 'directStorageBucket'
  | 'id'
  | 'parentEntity'
  | 'size'
  | 'storageAggregators'
  | 'storageBuckets'
  | 'type'
  | 'updatedDate'
  | StorageAggregatorKeySpecifier
)[];
export type StorageAggregatorFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  directStorageBucket?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  parentEntity?: FieldPolicy<any> | FieldReadFunction<any>;
  size?: FieldPolicy<any> | FieldReadFunction<any>;
  storageAggregators?: FieldPolicy<any> | FieldReadFunction<any>;
  storageBuckets?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type StorageAggregatorParentKeySpecifier = (
  | 'displayName'
  | 'id'
  | 'level'
  | 'url'
  | StorageAggregatorParentKeySpecifier
)[];
export type StorageAggregatorParentFieldPolicy = {
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  level?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type StorageBucketKeySpecifier = (
  | 'allowedMimeTypes'
  | 'authorization'
  | 'createdDate'
  | 'document'
  | 'documents'
  | 'id'
  | 'maxFileSize'
  | 'parentEntity'
  | 'size'
  | 'updatedDate'
  | StorageBucketKeySpecifier
)[];
export type StorageBucketFieldPolicy = {
  allowedMimeTypes?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  document?: FieldPolicy<any> | FieldReadFunction<any>;
  documents?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  maxFileSize?: FieldPolicy<any> | FieldReadFunction<any>;
  parentEntity?: FieldPolicy<any> | FieldReadFunction<any>;
  size?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type StorageBucketParentKeySpecifier = (
  | 'displayName'
  | 'id'
  | 'type'
  | 'url'
  | StorageBucketParentKeySpecifier
)[];
export type StorageBucketParentFieldPolicy = {
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type StorageConfigKeySpecifier = ('file' | StorageConfigKeySpecifier)[];
export type StorageConfigFieldPolicy = {
  file?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SubscriptionKeySpecifier = (
  | 'activityCreated'
  | 'calloutPostCreated'
  | 'forumDiscussionUpdated'
  | 'profileVerifiedCredential'
  | 'roomEvents'
  | 'subspaceCreated'
  | 'virtualContributorUpdated'
  | SubscriptionKeySpecifier
)[];
export type SubscriptionFieldPolicy = {
  activityCreated?: FieldPolicy<any> | FieldReadFunction<any>;
  calloutPostCreated?: FieldPolicy<any> | FieldReadFunction<any>;
  forumDiscussionUpdated?: FieldPolicy<any> | FieldReadFunction<any>;
  profileVerifiedCredential?: FieldPolicy<any> | FieldReadFunction<any>;
  roomEvents?: FieldPolicy<any> | FieldReadFunction<any>;
  subspaceCreated?: FieldPolicy<any> | FieldReadFunction<any>;
  virtualContributorUpdated?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SubspaceCreatedKeySpecifier = ('spaceID' | 'subspace' | SubspaceCreatedKeySpecifier)[];
export type SubspaceCreatedFieldPolicy = {
  spaceID?: FieldPolicy<any> | FieldReadFunction<any>;
  subspace?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type TagsetKeySpecifier = (
  | 'allowedValues'
  | 'authorization'
  | 'createdDate'
  | 'id'
  | 'name'
  | 'tags'
  | 'type'
  | 'updatedDate'
  | TagsetKeySpecifier
)[];
export type TagsetFieldPolicy = {
  allowedValues?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  tags?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type TagsetTemplateKeySpecifier = (
  | 'allowedValues'
  | 'createdDate'
  | 'defaultSelectedValue'
  | 'id'
  | 'name'
  | 'type'
  | 'updatedDate'
  | TagsetTemplateKeySpecifier
)[];
export type TagsetTemplateFieldPolicy = {
  allowedValues?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  defaultSelectedValue?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type TaskKeySpecifier = (
  | 'created'
  | 'end'
  | 'errors'
  | 'id'
  | 'itemsCount'
  | 'itemsDone'
  | 'progress'
  | 'results'
  | 'start'
  | 'status'
  | 'type'
  | TaskKeySpecifier
)[];
export type TaskFieldPolicy = {
  created?: FieldPolicy<any> | FieldReadFunction<any>;
  end?: FieldPolicy<any> | FieldReadFunction<any>;
  errors?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  itemsCount?: FieldPolicy<any> | FieldReadFunction<any>;
  itemsDone?: FieldPolicy<any> | FieldReadFunction<any>;
  progress?: FieldPolicy<any> | FieldReadFunction<any>;
  results?: FieldPolicy<any> | FieldReadFunction<any>;
  start?: FieldPolicy<any> | FieldReadFunction<any>;
  status?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type TemplateKeySpecifier = (
  | 'authorization'
  | 'callout'
  | 'collaboration'
  | 'communityGuidelines'
  | 'createdDate'
  | 'id'
  | 'innovationFlow'
  | 'nameID'
  | 'postDefaultDescription'
  | 'profile'
  | 'type'
  | 'updatedDate'
  | 'whiteboard'
  | TemplateKeySpecifier
)[];
export type TemplateFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  callout?: FieldPolicy<any> | FieldReadFunction<any>;
  collaboration?: FieldPolicy<any> | FieldReadFunction<any>;
  communityGuidelines?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationFlow?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  postDefaultDescription?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  whiteboard?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type TemplateResultKeySpecifier = ('innovationPack' | 'template' | TemplateResultKeySpecifier)[];
export type TemplateResultFieldPolicy = {
  innovationPack?: FieldPolicy<any> | FieldReadFunction<any>;
  template?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type TemplatesSetKeySpecifier = (
  | 'authorization'
  | 'calloutTemplates'
  | 'calloutTemplatesCount'
  | 'communityGuidelinesTemplates'
  | 'communityGuidelinesTemplatesCount'
  | 'createdDate'
  | 'id'
  | 'innovationFlowTemplates'
  | 'innovationFlowTemplatesCount'
  | 'postTemplates'
  | 'postTemplatesCount'
  | 'templates'
  | 'templatesCount'
  | 'updatedDate'
  | 'whiteboardTemplates'
  | 'whiteboardTemplatesCount'
  | TemplatesSetKeySpecifier
)[];
export type TemplatesSetFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  calloutTemplates?: FieldPolicy<any> | FieldReadFunction<any>;
  calloutTemplatesCount?: FieldPolicy<any> | FieldReadFunction<any>;
  communityGuidelinesTemplates?: FieldPolicy<any> | FieldReadFunction<any>;
  communityGuidelinesTemplatesCount?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationFlowTemplates?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationFlowTemplatesCount?: FieldPolicy<any> | FieldReadFunction<any>;
  postTemplates?: FieldPolicy<any> | FieldReadFunction<any>;
  postTemplatesCount?: FieldPolicy<any> | FieldReadFunction<any>;
  templates?: FieldPolicy<any> | FieldReadFunction<any>;
  templatesCount?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  whiteboardTemplates?: FieldPolicy<any> | FieldReadFunction<any>;
  whiteboardTemplatesCount?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type TimelineKeySpecifier = (
  | 'authorization'
  | 'calendar'
  | 'createdDate'
  | 'id'
  | 'updatedDate'
  | TimelineKeySpecifier
)[];
export type TimelineFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  calendar?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UserKeySpecifier = (
  | 'account'
  | 'accountUpn'
  | 'agent'
  | 'authentication'
  | 'authorization'
  | 'communityRooms'
  | 'createdDate'
  | 'directRooms'
  | 'email'
  | 'firstName'
  | 'id'
  | 'isContactable'
  | 'lastName'
  | 'nameID'
  | 'phone'
  | 'preferences'
  | 'profile'
  | 'storageAggregator'
  | 'updatedDate'
  | UserKeySpecifier
)[];
export type UserFieldPolicy = {
  account?: FieldPolicy<any> | FieldReadFunction<any>;
  accountUpn?: FieldPolicy<any> | FieldReadFunction<any>;
  agent?: FieldPolicy<any> | FieldReadFunction<any>;
  authentication?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  communityRooms?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  directRooms?: FieldPolicy<any> | FieldReadFunction<any>;
  email?: FieldPolicy<any> | FieldReadFunction<any>;
  firstName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  isContactable?: FieldPolicy<any> | FieldReadFunction<any>;
  lastName?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  phone?: FieldPolicy<any> | FieldReadFunction<any>;
  preferences?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  storageAggregator?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UserAuthenticationResultKeySpecifier = ('createdAt' | 'method' | UserAuthenticationResultKeySpecifier)[];
export type UserAuthenticationResultFieldPolicy = {
  createdAt?: FieldPolicy<any> | FieldReadFunction<any>;
  method?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UserGroupKeySpecifier = (
  | 'authorization'
  | 'createdDate'
  | 'id'
  | 'members'
  | 'parent'
  | 'profile'
  | 'updatedDate'
  | UserGroupKeySpecifier
)[];
export type UserGroupFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  members?: FieldPolicy<any> | FieldReadFunction<any>;
  parent?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type VcInteractionKeySpecifier = (
  | 'createdDate'
  | 'id'
  | 'room'
  | 'threadID'
  | 'updatedDate'
  | 'virtualContributorID'
  | VcInteractionKeySpecifier
)[];
export type VcInteractionFieldPolicy = {
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  room?: FieldPolicy<any> | FieldReadFunction<any>;
  threadID?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  virtualContributorID?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type VerifiedCredentialKeySpecifier = (
  | 'claims'
  | 'context'
  | 'expires'
  | 'issued'
  | 'issuer'
  | 'name'
  | 'type'
  | VerifiedCredentialKeySpecifier
)[];
export type VerifiedCredentialFieldPolicy = {
  claims?: FieldPolicy<any> | FieldReadFunction<any>;
  context?: FieldPolicy<any> | FieldReadFunction<any>;
  expires?: FieldPolicy<any> | FieldReadFunction<any>;
  issued?: FieldPolicy<any> | FieldReadFunction<any>;
  issuer?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type VerifiedCredentialClaimKeySpecifier = ('name' | 'value' | VerifiedCredentialClaimKeySpecifier)[];
export type VerifiedCredentialClaimFieldPolicy = {
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  value?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type VirtualContributorKeySpecifier = (
  | 'account'
  | 'agent'
  | 'aiPersona'
  | 'authorization'
  | 'createdDate'
  | 'id'
  | 'listedInStore'
  | 'nameID'
  | 'profile'
  | 'provider'
  | 'searchVisibility'
  | 'status'
  | 'updatedDate'
  | VirtualContributorKeySpecifier
)[];
export type VirtualContributorFieldPolicy = {
  account?: FieldPolicy<any> | FieldReadFunction<any>;
  agent?: FieldPolicy<any> | FieldReadFunction<any>;
  aiPersona?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  listedInStore?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  provider?: FieldPolicy<any> | FieldReadFunction<any>;
  searchVisibility?: FieldPolicy<any> | FieldReadFunction<any>;
  status?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type VirtualContributorUpdatedSubscriptionResultKeySpecifier = (
  | 'virtualContributor'
  | VirtualContributorUpdatedSubscriptionResultKeySpecifier
)[];
export type VirtualContributorUpdatedSubscriptionResultFieldPolicy = {
  virtualContributor?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type VisualKeySpecifier = (
  | 'allowedTypes'
  | 'alternativeText'
  | 'aspectRatio'
  | 'authorization'
  | 'createdDate'
  | 'id'
  | 'maxHeight'
  | 'maxWidth'
  | 'minHeight'
  | 'minWidth'
  | 'name'
  | 'updatedDate'
  | 'uri'
  | VisualKeySpecifier
)[];
export type VisualFieldPolicy = {
  allowedTypes?: FieldPolicy<any> | FieldReadFunction<any>;
  alternativeText?: FieldPolicy<any> | FieldReadFunction<any>;
  aspectRatio?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  maxHeight?: FieldPolicy<any> | FieldReadFunction<any>;
  maxWidth?: FieldPolicy<any> | FieldReadFunction<any>;
  minHeight?: FieldPolicy<any> | FieldReadFunction<any>;
  minWidth?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  uri?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type WhiteboardKeySpecifier = (
  | 'authorization'
  | 'content'
  | 'contentUpdatePolicy'
  | 'createdBy'
  | 'createdDate'
  | 'id'
  | 'isMultiUser'
  | 'nameID'
  | 'profile'
  | 'updatedDate'
  | WhiteboardKeySpecifier
)[];
export type WhiteboardFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  content?: FieldPolicy<any> | FieldReadFunction<any>;
  contentUpdatePolicy?: FieldPolicy<any> | FieldReadFunction<any>;
  createdBy?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  isMultiUser?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type StrictTypedTypePolicies = {
  APM?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | APMKeySpecifier | (() => undefined | APMKeySpecifier);
    fields?: APMFieldPolicy;
  };
  Account?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | AccountKeySpecifier | (() => undefined | AccountKeySpecifier);
    fields?: AccountFieldPolicy;
  };
  AccountSubscription?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | AccountSubscriptionKeySpecifier | (() => undefined | AccountSubscriptionKeySpecifier);
    fields?: AccountSubscriptionFieldPolicy;
  };
  ActivityCreatedSubscriptionResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | ActivityCreatedSubscriptionResultKeySpecifier
      | (() => undefined | ActivityCreatedSubscriptionResultKeySpecifier);
    fields?: ActivityCreatedSubscriptionResultFieldPolicy;
  };
  ActivityFeed?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ActivityFeedKeySpecifier | (() => undefined | ActivityFeedKeySpecifier);
    fields?: ActivityFeedFieldPolicy;
  };
  ActivityLogEntry?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ActivityLogEntryKeySpecifier | (() => undefined | ActivityLogEntryKeySpecifier);
    fields?: ActivityLogEntryFieldPolicy;
  };
  ActivityLogEntryCalendarEventCreated?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | ActivityLogEntryCalendarEventCreatedKeySpecifier
      | (() => undefined | ActivityLogEntryCalendarEventCreatedKeySpecifier);
    fields?: ActivityLogEntryCalendarEventCreatedFieldPolicy;
  };
  ActivityLogEntryCalloutDiscussionComment?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | ActivityLogEntryCalloutDiscussionCommentKeySpecifier
      | (() => undefined | ActivityLogEntryCalloutDiscussionCommentKeySpecifier);
    fields?: ActivityLogEntryCalloutDiscussionCommentFieldPolicy;
  };
  ActivityLogEntryCalloutLinkCreated?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | ActivityLogEntryCalloutLinkCreatedKeySpecifier
      | (() => undefined | ActivityLogEntryCalloutLinkCreatedKeySpecifier);
    fields?: ActivityLogEntryCalloutLinkCreatedFieldPolicy;
  };
  ActivityLogEntryCalloutPostComment?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | ActivityLogEntryCalloutPostCommentKeySpecifier
      | (() => undefined | ActivityLogEntryCalloutPostCommentKeySpecifier);
    fields?: ActivityLogEntryCalloutPostCommentFieldPolicy;
  };
  ActivityLogEntryCalloutPostCreated?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | ActivityLogEntryCalloutPostCreatedKeySpecifier
      | (() => undefined | ActivityLogEntryCalloutPostCreatedKeySpecifier);
    fields?: ActivityLogEntryCalloutPostCreatedFieldPolicy;
  };
  ActivityLogEntryCalloutPublished?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | ActivityLogEntryCalloutPublishedKeySpecifier
      | (() => undefined | ActivityLogEntryCalloutPublishedKeySpecifier);
    fields?: ActivityLogEntryCalloutPublishedFieldPolicy;
  };
  ActivityLogEntryCalloutWhiteboardContentModified?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | ActivityLogEntryCalloutWhiteboardContentModifiedKeySpecifier
      | (() => undefined | ActivityLogEntryCalloutWhiteboardContentModifiedKeySpecifier);
    fields?: ActivityLogEntryCalloutWhiteboardContentModifiedFieldPolicy;
  };
  ActivityLogEntryCalloutWhiteboardCreated?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | ActivityLogEntryCalloutWhiteboardCreatedKeySpecifier
      | (() => undefined | ActivityLogEntryCalloutWhiteboardCreatedKeySpecifier);
    fields?: ActivityLogEntryCalloutWhiteboardCreatedFieldPolicy;
  };
  ActivityLogEntryChallengeCreated?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | ActivityLogEntryChallengeCreatedKeySpecifier
      | (() => undefined | ActivityLogEntryChallengeCreatedKeySpecifier);
    fields?: ActivityLogEntryChallengeCreatedFieldPolicy;
  };
  ActivityLogEntryMemberJoined?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | ActivityLogEntryMemberJoinedKeySpecifier
      | (() => undefined | ActivityLogEntryMemberJoinedKeySpecifier);
    fields?: ActivityLogEntryMemberJoinedFieldPolicy;
  };
  ActivityLogEntryOpportunityCreated?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | ActivityLogEntryOpportunityCreatedKeySpecifier
      | (() => undefined | ActivityLogEntryOpportunityCreatedKeySpecifier);
    fields?: ActivityLogEntryOpportunityCreatedFieldPolicy;
  };
  ActivityLogEntryUpdateSent?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | ActivityLogEntryUpdateSentKeySpecifier
      | (() => undefined | ActivityLogEntryUpdateSentKeySpecifier);
    fields?: ActivityLogEntryUpdateSentFieldPolicy;
  };
  Actor?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ActorKeySpecifier | (() => undefined | ActorKeySpecifier);
    fields?: ActorFieldPolicy;
  };
  ActorGroup?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ActorGroupKeySpecifier | (() => undefined | ActorGroupKeySpecifier);
    fields?: ActorGroupFieldPolicy;
  };
  Agent?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | AgentKeySpecifier | (() => undefined | AgentKeySpecifier);
    fields?: AgentFieldPolicy;
  };
  AgentBeginVerifiedCredentialOfferOutput?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | AgentBeginVerifiedCredentialOfferOutputKeySpecifier
      | (() => undefined | AgentBeginVerifiedCredentialOfferOutputKeySpecifier);
    fields?: AgentBeginVerifiedCredentialOfferOutputFieldPolicy;
  };
  AgentBeginVerifiedCredentialRequestOutput?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | AgentBeginVerifiedCredentialRequestOutputKeySpecifier
      | (() => undefined | AgentBeginVerifiedCredentialRequestOutputKeySpecifier);
    fields?: AgentBeginVerifiedCredentialRequestOutputFieldPolicy;
  };
  AiPersona?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | AiPersonaKeySpecifier | (() => undefined | AiPersonaKeySpecifier);
    fields?: AiPersonaFieldPolicy;
  };
  AiPersonaService?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | AiPersonaServiceKeySpecifier | (() => undefined | AiPersonaServiceKeySpecifier);
    fields?: AiPersonaServiceFieldPolicy;
  };
  AiServer?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | AiServerKeySpecifier | (() => undefined | AiServerKeySpecifier);
    fields?: AiServerFieldPolicy;
  };
  Application?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ApplicationKeySpecifier | (() => undefined | ApplicationKeySpecifier);
    fields?: ApplicationFieldPolicy;
  };
  AuthenticationConfig?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | AuthenticationConfigKeySpecifier | (() => undefined | AuthenticationConfigKeySpecifier);
    fields?: AuthenticationConfigFieldPolicy;
  };
  AuthenticationProviderConfig?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | AuthenticationProviderConfigKeySpecifier
      | (() => undefined | AuthenticationProviderConfigKeySpecifier);
    fields?: AuthenticationProviderConfigFieldPolicy;
  };
  Authorization?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | AuthorizationKeySpecifier | (() => undefined | AuthorizationKeySpecifier);
    fields?: AuthorizationFieldPolicy;
  };
  AuthorizationPolicyRuleCredential?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | AuthorizationPolicyRuleCredentialKeySpecifier
      | (() => undefined | AuthorizationPolicyRuleCredentialKeySpecifier);
    fields?: AuthorizationPolicyRuleCredentialFieldPolicy;
  };
  AuthorizationPolicyRulePrivilege?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | AuthorizationPolicyRulePrivilegeKeySpecifier
      | (() => undefined | AuthorizationPolicyRulePrivilegeKeySpecifier);
    fields?: AuthorizationPolicyRulePrivilegeFieldPolicy;
  };
  AuthorizationPolicyRuleVerifiedCredential?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | AuthorizationPolicyRuleVerifiedCredentialKeySpecifier
      | (() => undefined | AuthorizationPolicyRuleVerifiedCredentialKeySpecifier);
    fields?: AuthorizationPolicyRuleVerifiedCredentialFieldPolicy;
  };
  Calendar?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CalendarKeySpecifier | (() => undefined | CalendarKeySpecifier);
    fields?: CalendarFieldPolicy;
  };
  CalendarEvent?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CalendarEventKeySpecifier | (() => undefined | CalendarEventKeySpecifier);
    fields?: CalendarEventFieldPolicy;
  };
  Callout?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CalloutKeySpecifier | (() => undefined | CalloutKeySpecifier);
    fields?: CalloutFieldPolicy;
  };
  CalloutContribution?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CalloutContributionKeySpecifier | (() => undefined | CalloutContributionKeySpecifier);
    fields?: CalloutContributionFieldPolicy;
  };
  CalloutContributionDefaults?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | CalloutContributionDefaultsKeySpecifier
      | (() => undefined | CalloutContributionDefaultsKeySpecifier);
    fields?: CalloutContributionDefaultsFieldPolicy;
  };
  CalloutContributionPolicy?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | CalloutContributionPolicyKeySpecifier
      | (() => undefined | CalloutContributionPolicyKeySpecifier);
    fields?: CalloutContributionPolicyFieldPolicy;
  };
  CalloutFraming?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CalloutFramingKeySpecifier | (() => undefined | CalloutFramingKeySpecifier);
    fields?: CalloutFramingFieldPolicy;
  };
  CalloutGroup?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CalloutGroupKeySpecifier | (() => undefined | CalloutGroupKeySpecifier);
    fields?: CalloutGroupFieldPolicy;
  };
  CalloutPostCreated?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CalloutPostCreatedKeySpecifier | (() => undefined | CalloutPostCreatedKeySpecifier);
    fields?: CalloutPostCreatedFieldPolicy;
  };
  Collaboration?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CollaborationKeySpecifier | (() => undefined | CollaborationKeySpecifier);
    fields?: CollaborationFieldPolicy;
  };
  Communication?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CommunicationKeySpecifier | (() => undefined | CommunicationKeySpecifier);
    fields?: CommunicationFieldPolicy;
  };
  CommunicationAdminMembershipResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | CommunicationAdminMembershipResultKeySpecifier
      | (() => undefined | CommunicationAdminMembershipResultKeySpecifier);
    fields?: CommunicationAdminMembershipResultFieldPolicy;
  };
  CommunicationAdminOrphanedUsageResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | CommunicationAdminOrphanedUsageResultKeySpecifier
      | (() => undefined | CommunicationAdminOrphanedUsageResultKeySpecifier);
    fields?: CommunicationAdminOrphanedUsageResultFieldPolicy;
  };
  CommunicationAdminRoomMembershipResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | CommunicationAdminRoomMembershipResultKeySpecifier
      | (() => undefined | CommunicationAdminRoomMembershipResultKeySpecifier);
    fields?: CommunicationAdminRoomMembershipResultFieldPolicy;
  };
  CommunicationAdminRoomResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | CommunicationAdminRoomResultKeySpecifier
      | (() => undefined | CommunicationAdminRoomResultKeySpecifier);
    fields?: CommunicationAdminRoomResultFieldPolicy;
  };
  CommunicationRoom?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CommunicationRoomKeySpecifier | (() => undefined | CommunicationRoomKeySpecifier);
    fields?: CommunicationRoomFieldPolicy;
  };
  Community?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CommunityKeySpecifier | (() => undefined | CommunityKeySpecifier);
    fields?: CommunityFieldPolicy;
  };
  CommunityApplicationForRoleResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | CommunityApplicationForRoleResultKeySpecifier
      | (() => undefined | CommunityApplicationForRoleResultKeySpecifier);
    fields?: CommunityApplicationForRoleResultFieldPolicy;
  };
  CommunityApplicationResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | CommunityApplicationResultKeySpecifier
      | (() => undefined | CommunityApplicationResultKeySpecifier);
    fields?: CommunityApplicationResultFieldPolicy;
  };
  CommunityGuidelines?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CommunityGuidelinesKeySpecifier | (() => undefined | CommunityGuidelinesKeySpecifier);
    fields?: CommunityGuidelinesFieldPolicy;
  };
  CommunityInvitationForRoleResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | CommunityInvitationForRoleResultKeySpecifier
      | (() => undefined | CommunityInvitationForRoleResultKeySpecifier);
    fields?: CommunityInvitationForRoleResultFieldPolicy;
  };
  CommunityInvitationResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | CommunityInvitationResultKeySpecifier
      | (() => undefined | CommunityInvitationResultKeySpecifier);
    fields?: CommunityInvitationResultFieldPolicy;
  };
  CommunityMembershipResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | CommunityMembershipResultKeySpecifier
      | (() => undefined | CommunityMembershipResultKeySpecifier);
    fields?: CommunityMembershipResultFieldPolicy;
  };
  Config?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ConfigKeySpecifier | (() => undefined | ConfigKeySpecifier);
    fields?: ConfigFieldPolicy;
  };
  Context?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ContextKeySpecifier | (() => undefined | ContextKeySpecifier);
    fields?: ContextFieldPolicy;
  };
  Contributor?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ContributorKeySpecifier | (() => undefined | ContributorKeySpecifier);
    fields?: ContributorFieldPolicy;
  };
  ContributorRolePolicy?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ContributorRolePolicyKeySpecifier | (() => undefined | ContributorRolePolicyKeySpecifier);
    fields?: ContributorRolePolicyFieldPolicy;
  };
  ContributorRoles?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ContributorRolesKeySpecifier | (() => undefined | ContributorRolesKeySpecifier);
    fields?: ContributorRolesFieldPolicy;
  };
  CreateCalloutContributionDefaultsData?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | CreateCalloutContributionDefaultsDataKeySpecifier
      | (() => undefined | CreateCalloutContributionDefaultsDataKeySpecifier);
    fields?: CreateCalloutContributionDefaultsDataFieldPolicy;
  };
  CreateCalloutContributionPolicyData?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | CreateCalloutContributionPolicyDataKeySpecifier
      | (() => undefined | CreateCalloutContributionPolicyDataKeySpecifier);
    fields?: CreateCalloutContributionPolicyDataFieldPolicy;
  };
  CreateCalloutData?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CreateCalloutDataKeySpecifier | (() => undefined | CreateCalloutDataKeySpecifier);
    fields?: CreateCalloutDataFieldPolicy;
  };
  CreateCalloutFramingData?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CreateCalloutFramingDataKeySpecifier | (() => undefined | CreateCalloutFramingDataKeySpecifier);
    fields?: CreateCalloutFramingDataFieldPolicy;
  };
  CreateCollaborationData?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CreateCollaborationDataKeySpecifier | (() => undefined | CreateCollaborationDataKeySpecifier);
    fields?: CreateCollaborationDataFieldPolicy;
  };
  CreateCommunityGuidelinesData?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | CreateCommunityGuidelinesDataKeySpecifier
      | (() => undefined | CreateCommunityGuidelinesDataKeySpecifier);
    fields?: CreateCommunityGuidelinesDataFieldPolicy;
  };
  CreateInnovationFlowData?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CreateInnovationFlowDataKeySpecifier | (() => undefined | CreateInnovationFlowDataKeySpecifier);
    fields?: CreateInnovationFlowDataFieldPolicy;
  };
  CreateInnovationFlowStateData?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | CreateInnovationFlowStateDataKeySpecifier
      | (() => undefined | CreateInnovationFlowStateDataKeySpecifier);
    fields?: CreateInnovationFlowStateDataFieldPolicy;
  };
  CreateLocationData?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CreateLocationDataKeySpecifier | (() => undefined | CreateLocationDataKeySpecifier);
    fields?: CreateLocationDataFieldPolicy;
  };
  CreateProfileData?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CreateProfileDataKeySpecifier | (() => undefined | CreateProfileDataKeySpecifier);
    fields?: CreateProfileDataFieldPolicy;
  };
  CreateReferenceData?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CreateReferenceDataKeySpecifier | (() => undefined | CreateReferenceDataKeySpecifier);
    fields?: CreateReferenceDataFieldPolicy;
  };
  CreateTagsetData?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CreateTagsetDataKeySpecifier | (() => undefined | CreateTagsetDataKeySpecifier);
    fields?: CreateTagsetDataFieldPolicy;
  };
  CreateWhiteboardData?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CreateWhiteboardDataKeySpecifier | (() => undefined | CreateWhiteboardDataKeySpecifier);
    fields?: CreateWhiteboardDataFieldPolicy;
  };
  Credential?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CredentialKeySpecifier | (() => undefined | CredentialKeySpecifier);
    fields?: CredentialFieldPolicy;
  };
  CredentialDefinition?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CredentialDefinitionKeySpecifier | (() => undefined | CredentialDefinitionKeySpecifier);
    fields?: CredentialDefinitionFieldPolicy;
  };
  CredentialMetadataOutput?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CredentialMetadataOutputKeySpecifier | (() => undefined | CredentialMetadataOutputKeySpecifier);
    fields?: CredentialMetadataOutputFieldPolicy;
  };
  DirectRoom?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | DirectRoomKeySpecifier | (() => undefined | DirectRoomKeySpecifier);
    fields?: DirectRoomFieldPolicy;
  };
  Discussion?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | DiscussionKeySpecifier | (() => undefined | DiscussionKeySpecifier);
    fields?: DiscussionFieldPolicy;
  };
  Document?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | DocumentKeySpecifier | (() => undefined | DocumentKeySpecifier);
    fields?: DocumentFieldPolicy;
  };
  EcosystemModel?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | EcosystemModelKeySpecifier | (() => undefined | EcosystemModelKeySpecifier);
    fields?: EcosystemModelFieldPolicy;
  };
  FileStorageConfig?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | FileStorageConfigKeySpecifier | (() => undefined | FileStorageConfigKeySpecifier);
    fields?: FileStorageConfigFieldPolicy;
  };
  Form?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | FormKeySpecifier | (() => undefined | FormKeySpecifier);
    fields?: FormFieldPolicy;
  };
  FormQuestion?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | FormQuestionKeySpecifier | (() => undefined | FormQuestionKeySpecifier);
    fields?: FormQuestionFieldPolicy;
  };
  Forum?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ForumKeySpecifier | (() => undefined | ForumKeySpecifier);
    fields?: ForumFieldPolicy;
  };
  Geo?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | GeoKeySpecifier | (() => undefined | GeoKeySpecifier);
    fields?: GeoFieldPolicy;
  };
  Groupable?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | GroupableKeySpecifier | (() => undefined | GroupableKeySpecifier);
    fields?: GroupableFieldPolicy;
  };
  ISearchResults?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ISearchResultsKeySpecifier | (() => undefined | ISearchResultsKeySpecifier);
    fields?: ISearchResultsFieldPolicy;
  };
  InnovationFlow?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | InnovationFlowKeySpecifier | (() => undefined | InnovationFlowKeySpecifier);
    fields?: InnovationFlowFieldPolicy;
  };
  InnovationFlowState?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | InnovationFlowStateKeySpecifier | (() => undefined | InnovationFlowStateKeySpecifier);
    fields?: InnovationFlowStateFieldPolicy;
  };
  InnovationHub?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | InnovationHubKeySpecifier | (() => undefined | InnovationHubKeySpecifier);
    fields?: InnovationHubFieldPolicy;
  };
  InnovationPack?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | InnovationPackKeySpecifier | (() => undefined | InnovationPackKeySpecifier);
    fields?: InnovationPackFieldPolicy;
  };
  InputCreatorQueryResults?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | InputCreatorQueryResultsKeySpecifier | (() => undefined | InputCreatorQueryResultsKeySpecifier);
    fields?: InputCreatorQueryResultsFieldPolicy;
  };
  Invitation?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | InvitationKeySpecifier | (() => undefined | InvitationKeySpecifier);
    fields?: InvitationFieldPolicy;
  };
  LatestReleaseDiscussion?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | LatestReleaseDiscussionKeySpecifier | (() => undefined | LatestReleaseDiscussionKeySpecifier);
    fields?: LatestReleaseDiscussionFieldPolicy;
  };
  Library?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | LibraryKeySpecifier | (() => undefined | LibraryKeySpecifier);
    fields?: LibraryFieldPolicy;
  };
  LicensePlan?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | LicensePlanKeySpecifier | (() => undefined | LicensePlanKeySpecifier);
    fields?: LicensePlanFieldPolicy;
  };
  LicensePolicy?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | LicensePolicyKeySpecifier | (() => undefined | LicensePolicyKeySpecifier);
    fields?: LicensePolicyFieldPolicy;
  };
  LicensePolicyCredentialRule?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | LicensePolicyCredentialRuleKeySpecifier
      | (() => undefined | LicensePolicyCredentialRuleKeySpecifier);
    fields?: LicensePolicyCredentialRuleFieldPolicy;
  };
  Licensing?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | LicensingKeySpecifier | (() => undefined | LicensingKeySpecifier);
    fields?: LicensingFieldPolicy;
  };
  Lifecycle?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | LifecycleKeySpecifier | (() => undefined | LifecycleKeySpecifier);
    fields?: LifecycleFieldPolicy;
  };
  Link?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | LinkKeySpecifier | (() => undefined | LinkKeySpecifier);
    fields?: LinkFieldPolicy;
  };
  Location?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | LocationKeySpecifier | (() => undefined | LocationKeySpecifier);
    fields?: LocationFieldPolicy;
  };
  LookupByNameQueryResults?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | LookupByNameQueryResultsKeySpecifier | (() => undefined | LookupByNameQueryResultsKeySpecifier);
    fields?: LookupByNameQueryResultsFieldPolicy;
  };
  LookupQueryResults?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | LookupQueryResultsKeySpecifier | (() => undefined | LookupQueryResultsKeySpecifier);
    fields?: LookupQueryResultsFieldPolicy;
  };
  MeQueryResults?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | MeQueryResultsKeySpecifier | (() => undefined | MeQueryResultsKeySpecifier);
    fields?: MeQueryResultsFieldPolicy;
  };
  Message?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | MessageKeySpecifier | (() => undefined | MessageKeySpecifier);
    fields?: MessageFieldPolicy;
  };
  MessageAnswerQuestion?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | MessageAnswerQuestionKeySpecifier | (() => undefined | MessageAnswerQuestionKeySpecifier);
    fields?: MessageAnswerQuestionFieldPolicy;
  };
  MessageAnswerToQuestionSource?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | MessageAnswerToQuestionSourceKeySpecifier
      | (() => undefined | MessageAnswerToQuestionSourceKeySpecifier);
    fields?: MessageAnswerToQuestionSourceFieldPolicy;
  };
  Metadata?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | MetadataKeySpecifier | (() => undefined | MetadataKeySpecifier);
    fields?: MetadataFieldPolicy;
  };
  MigrateEmbeddings?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | MigrateEmbeddingsKeySpecifier | (() => undefined | MigrateEmbeddingsKeySpecifier);
    fields?: MigrateEmbeddingsFieldPolicy;
  };
  Mutation?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | MutationKeySpecifier | (() => undefined | MutationKeySpecifier);
    fields?: MutationFieldPolicy;
  };
  MySpaceResults?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | MySpaceResultsKeySpecifier | (() => undefined | MySpaceResultsKeySpecifier);
    fields?: MySpaceResultsFieldPolicy;
  };
  NVP?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | NVPKeySpecifier | (() => undefined | NVPKeySpecifier);
    fields?: NVPFieldPolicy;
  };
  Organization?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | OrganizationKeySpecifier | (() => undefined | OrganizationKeySpecifier);
    fields?: OrganizationFieldPolicy;
  };
  OrganizationVerification?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | OrganizationVerificationKeySpecifier | (() => undefined | OrganizationVerificationKeySpecifier);
    fields?: OrganizationVerificationFieldPolicy;
  };
  OryConfig?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | OryConfigKeySpecifier | (() => undefined | OryConfigKeySpecifier);
    fields?: OryConfigFieldPolicy;
  };
  PageInfo?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PageInfoKeySpecifier | (() => undefined | PageInfoKeySpecifier);
    fields?: PageInfoFieldPolicy;
  };
  PaginatedOrganization?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PaginatedOrganizationKeySpecifier | (() => undefined | PaginatedOrganizationKeySpecifier);
    fields?: PaginatedOrganizationFieldPolicy;
  };
  PaginatedSpaces?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PaginatedSpacesKeySpecifier | (() => undefined | PaginatedSpacesKeySpecifier);
    fields?: PaginatedSpacesFieldPolicy;
  };
  PaginatedUsers?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PaginatedUsersKeySpecifier | (() => undefined | PaginatedUsersKeySpecifier);
    fields?: PaginatedUsersFieldPolicy;
  };
  Platform?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PlatformKeySpecifier | (() => undefined | PlatformKeySpecifier);
    fields?: PlatformFieldPolicy;
  };
  PlatformFeatureFlag?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PlatformFeatureFlagKeySpecifier | (() => undefined | PlatformFeatureFlagKeySpecifier);
    fields?: PlatformFeatureFlagFieldPolicy;
  };
  PlatformInvitation?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PlatformInvitationKeySpecifier | (() => undefined | PlatformInvitationKeySpecifier);
    fields?: PlatformInvitationFieldPolicy;
  };
  PlatformLocations?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PlatformLocationsKeySpecifier | (() => undefined | PlatformLocationsKeySpecifier);
    fields?: PlatformLocationsFieldPolicy;
  };
  Post?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PostKeySpecifier | (() => undefined | PostKeySpecifier);
    fields?: PostFieldPolicy;
  };
  Preference?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PreferenceKeySpecifier | (() => undefined | PreferenceKeySpecifier);
    fields?: PreferenceFieldPolicy;
  };
  PreferenceDefinition?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PreferenceDefinitionKeySpecifier | (() => undefined | PreferenceDefinitionKeySpecifier);
    fields?: PreferenceDefinitionFieldPolicy;
  };
  Profile?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ProfileKeySpecifier | (() => undefined | ProfileKeySpecifier);
    fields?: ProfileFieldPolicy;
  };
  ProfileCredentialVerified?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | ProfileCredentialVerifiedKeySpecifier
      | (() => undefined | ProfileCredentialVerifiedKeySpecifier);
    fields?: ProfileCredentialVerifiedFieldPolicy;
  };
  Query?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | QueryKeySpecifier | (() => undefined | QueryKeySpecifier);
    fields?: QueryFieldPolicy;
  };
  Question?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | QuestionKeySpecifier | (() => undefined | QuestionKeySpecifier);
    fields?: QuestionFieldPolicy;
  };
  Reaction?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ReactionKeySpecifier | (() => undefined | ReactionKeySpecifier);
    fields?: ReactionFieldPolicy;
  };
  Reference?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ReferenceKeySpecifier | (() => undefined | ReferenceKeySpecifier);
    fields?: ReferenceFieldPolicy;
  };
  RelayPaginatedSpace?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | RelayPaginatedSpaceKeySpecifier | (() => undefined | RelayPaginatedSpaceKeySpecifier);
    fields?: RelayPaginatedSpaceFieldPolicy;
  };
  RelayPaginatedSpaceEdge?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | RelayPaginatedSpaceEdgeKeySpecifier | (() => undefined | RelayPaginatedSpaceEdgeKeySpecifier);
    fields?: RelayPaginatedSpaceEdgeFieldPolicy;
  };
  RelayPaginatedSpacePageInfo?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | RelayPaginatedSpacePageInfoKeySpecifier
      | (() => undefined | RelayPaginatedSpacePageInfoKeySpecifier);
    fields?: RelayPaginatedSpacePageInfoFieldPolicy;
  };
  Role?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | RoleKeySpecifier | (() => undefined | RoleKeySpecifier);
    fields?: RoleFieldPolicy;
  };
  RoleSet?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | RoleSetKeySpecifier | (() => undefined | RoleSetKeySpecifier);
    fields?: RoleSetFieldPolicy;
  };
  RolesResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | RolesResultKeySpecifier | (() => undefined | RolesResultKeySpecifier);
    fields?: RolesResultFieldPolicy;
  };
  RolesResultCommunity?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | RolesResultCommunityKeySpecifier | (() => undefined | RolesResultCommunityKeySpecifier);
    fields?: RolesResultCommunityFieldPolicy;
  };
  RolesResultOrganization?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | RolesResultOrganizationKeySpecifier | (() => undefined | RolesResultOrganizationKeySpecifier);
    fields?: RolesResultOrganizationFieldPolicy;
  };
  RolesResultSpace?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | RolesResultSpaceKeySpecifier | (() => undefined | RolesResultSpaceKeySpecifier);
    fields?: RolesResultSpaceFieldPolicy;
  };
  Room?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | RoomKeySpecifier | (() => undefined | RoomKeySpecifier);
    fields?: RoomFieldPolicy;
  };
  RoomEventSubscriptionResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | RoomEventSubscriptionResultKeySpecifier
      | (() => undefined | RoomEventSubscriptionResultKeySpecifier);
    fields?: RoomEventSubscriptionResultFieldPolicy;
  };
  RoomMessageEventSubscriptionResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | RoomMessageEventSubscriptionResultKeySpecifier
      | (() => undefined | RoomMessageEventSubscriptionResultKeySpecifier);
    fields?: RoomMessageEventSubscriptionResultFieldPolicy;
  };
  RoomMessageReactionEventSubscriptionResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | RoomMessageReactionEventSubscriptionResultKeySpecifier
      | (() => undefined | RoomMessageReactionEventSubscriptionResultKeySpecifier);
    fields?: RoomMessageReactionEventSubscriptionResultFieldPolicy;
  };
  SearchResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | SearchResultKeySpecifier | (() => undefined | SearchResultKeySpecifier);
    fields?: SearchResultFieldPolicy;
  };
  SearchResultCallout?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | SearchResultCalloutKeySpecifier | (() => undefined | SearchResultCalloutKeySpecifier);
    fields?: SearchResultCalloutFieldPolicy;
  };
  SearchResultOrganization?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | SearchResultOrganizationKeySpecifier | (() => undefined | SearchResultOrganizationKeySpecifier);
    fields?: SearchResultOrganizationFieldPolicy;
  };
  SearchResultPost?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | SearchResultPostKeySpecifier | (() => undefined | SearchResultPostKeySpecifier);
    fields?: SearchResultPostFieldPolicy;
  };
  SearchResultSpace?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | SearchResultSpaceKeySpecifier | (() => undefined | SearchResultSpaceKeySpecifier);
    fields?: SearchResultSpaceFieldPolicy;
  };
  SearchResultUser?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | SearchResultUserKeySpecifier | (() => undefined | SearchResultUserKeySpecifier);
    fields?: SearchResultUserFieldPolicy;
  };
  SearchResultUserGroup?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | SearchResultUserGroupKeySpecifier | (() => undefined | SearchResultUserGroupKeySpecifier);
    fields?: SearchResultUserGroupFieldPolicy;
  };
  Sentry?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | SentryKeySpecifier | (() => undefined | SentryKeySpecifier);
    fields?: SentryFieldPolicy;
  };
  ServiceMetadata?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ServiceMetadataKeySpecifier | (() => undefined | ServiceMetadataKeySpecifier);
    fields?: ServiceMetadataFieldPolicy;
  };
  Space?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | SpaceKeySpecifier | (() => undefined | SpaceKeySpecifier);
    fields?: SpaceFieldPolicy;
  };
  SpaceDefaults?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | SpaceDefaultsKeySpecifier | (() => undefined | SpaceDefaultsKeySpecifier);
    fields?: SpaceDefaultsFieldPolicy;
  };
  SpacePendingMembershipInfo?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | SpacePendingMembershipInfoKeySpecifier
      | (() => undefined | SpacePendingMembershipInfoKeySpecifier);
    fields?: SpacePendingMembershipInfoFieldPolicy;
  };
  SpaceSettings?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | SpaceSettingsKeySpecifier | (() => undefined | SpaceSettingsKeySpecifier);
    fields?: SpaceSettingsFieldPolicy;
  };
  SpaceSettingsCollaboration?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | SpaceSettingsCollaborationKeySpecifier
      | (() => undefined | SpaceSettingsCollaborationKeySpecifier);
    fields?: SpaceSettingsCollaborationFieldPolicy;
  };
  SpaceSettingsMembership?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | SpaceSettingsMembershipKeySpecifier | (() => undefined | SpaceSettingsMembershipKeySpecifier);
    fields?: SpaceSettingsMembershipFieldPolicy;
  };
  SpaceSettingsPrivacy?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | SpaceSettingsPrivacyKeySpecifier | (() => undefined | SpaceSettingsPrivacyKeySpecifier);
    fields?: SpaceSettingsPrivacyFieldPolicy;
  };
  SpaceSubscription?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | SpaceSubscriptionKeySpecifier | (() => undefined | SpaceSubscriptionKeySpecifier);
    fields?: SpaceSubscriptionFieldPolicy;
  };
  StorageAggregator?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | StorageAggregatorKeySpecifier | (() => undefined | StorageAggregatorKeySpecifier);
    fields?: StorageAggregatorFieldPolicy;
  };
  StorageAggregatorParent?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | StorageAggregatorParentKeySpecifier | (() => undefined | StorageAggregatorParentKeySpecifier);
    fields?: StorageAggregatorParentFieldPolicy;
  };
  StorageBucket?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | StorageBucketKeySpecifier | (() => undefined | StorageBucketKeySpecifier);
    fields?: StorageBucketFieldPolicy;
  };
  StorageBucketParent?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | StorageBucketParentKeySpecifier | (() => undefined | StorageBucketParentKeySpecifier);
    fields?: StorageBucketParentFieldPolicy;
  };
  StorageConfig?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | StorageConfigKeySpecifier | (() => undefined | StorageConfigKeySpecifier);
    fields?: StorageConfigFieldPolicy;
  };
  Subscription?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | SubscriptionKeySpecifier | (() => undefined | SubscriptionKeySpecifier);
    fields?: SubscriptionFieldPolicy;
  };
  SubspaceCreated?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | SubspaceCreatedKeySpecifier | (() => undefined | SubspaceCreatedKeySpecifier);
    fields?: SubspaceCreatedFieldPolicy;
  };
  Tagset?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | TagsetKeySpecifier | (() => undefined | TagsetKeySpecifier);
    fields?: TagsetFieldPolicy;
  };
  TagsetTemplate?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | TagsetTemplateKeySpecifier | (() => undefined | TagsetTemplateKeySpecifier);
    fields?: TagsetTemplateFieldPolicy;
  };
  Task?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | TaskKeySpecifier | (() => undefined | TaskKeySpecifier);
    fields?: TaskFieldPolicy;
  };
  Template?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | TemplateKeySpecifier | (() => undefined | TemplateKeySpecifier);
    fields?: TemplateFieldPolicy;
  };
  TemplateResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | TemplateResultKeySpecifier | (() => undefined | TemplateResultKeySpecifier);
    fields?: TemplateResultFieldPolicy;
  };
  TemplatesSet?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | TemplatesSetKeySpecifier | (() => undefined | TemplatesSetKeySpecifier);
    fields?: TemplatesSetFieldPolicy;
  };
  Timeline?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | TimelineKeySpecifier | (() => undefined | TimelineKeySpecifier);
    fields?: TimelineFieldPolicy;
  };
  User?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | UserKeySpecifier | (() => undefined | UserKeySpecifier);
    fields?: UserFieldPolicy;
  };
  UserAuthenticationResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | UserAuthenticationResultKeySpecifier | (() => undefined | UserAuthenticationResultKeySpecifier);
    fields?: UserAuthenticationResultFieldPolicy;
  };
  UserGroup?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | UserGroupKeySpecifier | (() => undefined | UserGroupKeySpecifier);
    fields?: UserGroupFieldPolicy;
  };
  VcInteraction?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | VcInteractionKeySpecifier | (() => undefined | VcInteractionKeySpecifier);
    fields?: VcInteractionFieldPolicy;
  };
  VerifiedCredential?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | VerifiedCredentialKeySpecifier | (() => undefined | VerifiedCredentialKeySpecifier);
    fields?: VerifiedCredentialFieldPolicy;
  };
  VerifiedCredentialClaim?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | VerifiedCredentialClaimKeySpecifier | (() => undefined | VerifiedCredentialClaimKeySpecifier);
    fields?: VerifiedCredentialClaimFieldPolicy;
  };
  VirtualContributor?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | VirtualContributorKeySpecifier | (() => undefined | VirtualContributorKeySpecifier);
    fields?: VirtualContributorFieldPolicy;
  };
  VirtualContributorUpdatedSubscriptionResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | VirtualContributorUpdatedSubscriptionResultKeySpecifier
      | (() => undefined | VirtualContributorUpdatedSubscriptionResultKeySpecifier);
    fields?: VirtualContributorUpdatedSubscriptionResultFieldPolicy;
  };
  Visual?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | VisualKeySpecifier | (() => undefined | VisualKeySpecifier);
    fields?: VisualFieldPolicy;
  };
  Whiteboard?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | WhiteboardKeySpecifier | (() => undefined | WhiteboardKeySpecifier);
    fields?: WhiteboardFieldPolicy;
  };
};
export type TypedTypePolicies = StrictTypedTypePolicies & TypePolicies;
