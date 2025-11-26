/* eslint-disable @typescript-eslint/no-explicit-any */
import { FieldPolicy, FieldReadFunction, TypePolicies, TypePolicy } from '@apollo/client/cache';
export type APMKeySpecifier = ('endpoint' | 'rumEnabled' | APMKeySpecifier)[];
export type APMFieldPolicy = {
  endpoint?: FieldPolicy<any> | FieldReadFunction<any>;
  rumEnabled?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AccountKeySpecifier = (
  | 'agent'
  | 'authorization'
  | 'baselineLicensePlan'
  | 'createdDate'
  | 'externalSubscriptionID'
  | 'host'
  | 'id'
  | 'innovationHubs'
  | 'innovationPacks'
  | 'license'
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
  baselineLicensePlan?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  externalSubscriptionID?: FieldPolicy<any> | FieldReadFunction<any>;
  host?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationHubs?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationPacks?: FieldPolicy<any> | FieldReadFunction<any>;
  license?: FieldPolicy<any> | FieldReadFunction<any>;
  spaces?: FieldPolicy<any> | FieldReadFunction<any>;
  storageAggregator?: FieldPolicy<any> | FieldReadFunction<any>;
  subscriptions?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  virtualContributors?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AccountLicensePlanKeySpecifier = (
  | 'innovationPacks'
  | 'spaceFree'
  | 'spacePlus'
  | 'spacePremium'
  | 'startingPages'
  | 'virtualContributor'
  | AccountLicensePlanKeySpecifier
)[];
export type AccountLicensePlanFieldPolicy = {
  innovationPacks?: FieldPolicy<any> | FieldReadFunction<any>;
  spaceFree?: FieldPolicy<any> | FieldReadFunction<any>;
  spacePlus?: FieldPolicy<any> | FieldReadFunction<any>;
  spacePremium?: FieldPolicy<any> | FieldReadFunction<any>;
  startingPages?: FieldPolicy<any> | FieldReadFunction<any>;
  virtualContributor?: FieldPolicy<any> | FieldReadFunction<any>;
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
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  triggeredBy?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ActivityLogEntryCalloutMemoCreatedKeySpecifier = (
  | 'callout'
  | 'child'
  | 'collaborationID'
  | 'createdDate'
  | 'description'
  | 'id'
  | 'memo'
  | 'parentDisplayName'
  | 'space'
  | 'triggeredBy'
  | 'type'
  | ActivityLogEntryCalloutMemoCreatedKeySpecifier
)[];
export type ActivityLogEntryCalloutMemoCreatedFieldPolicy = {
  callout?: FieldPolicy<any> | FieldReadFunction<any>;
  child?: FieldPolicy<any> | FieldReadFunction<any>;
  collaborationID?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  memo?: FieldPolicy<any> | FieldReadFunction<any>;
  parentDisplayName?: FieldPolicy<any> | FieldReadFunction<any>;
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
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  triggeredBy?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  whiteboard?: FieldPolicy<any> | FieldReadFunction<any>;
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
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  triggeredBy?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ActivityLogEntrySubspaceCreatedKeySpecifier = (
  | 'child'
  | 'collaborationID'
  | 'createdDate'
  | 'description'
  | 'id'
  | 'parentDisplayName'
  | 'space'
  | 'subspace'
  | 'triggeredBy'
  | 'type'
  | ActivityLogEntrySubspaceCreatedKeySpecifier
)[];
export type ActivityLogEntrySubspaceCreatedFieldPolicy = {
  child?: FieldPolicy<any> | FieldReadFunction<any>;
  collaborationID?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  parentDisplayName?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  subspace?: FieldPolicy<any> | FieldReadFunction<any>;
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
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  triggeredBy?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  updates?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'bodyOfKnowledgeLastUpdated'
  | 'createdDate'
  | 'engine'
  | 'externalConfig'
  | 'id'
  | 'prompt'
  | 'promptGraph'
  | 'updatedDate'
  | AiPersonaKeySpecifier
)[];
export type AiPersonaFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  bodyOfKnowledgeLastUpdated?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  engine?: FieldPolicy<any> | FieldReadFunction<any>;
  externalConfig?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  prompt?: FieldPolicy<any> | FieldReadFunction<any>;
  promptGraph?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AiServerKeySpecifier = (
  | 'aiPersona'
  | 'aiPersonas'
  | 'authorization'
  | 'createdDate'
  | 'defaultAiPersona'
  | 'id'
  | 'updatedDate'
  | AiServerKeySpecifier
)[];
export type AiServerFieldPolicy = {
  aiPersona?: FieldPolicy<any> | FieldReadFunction<any>;
  aiPersonas?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  defaultAiPersona?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ApplicationKeySpecifier = (
  | 'authorization'
  | 'contributor'
  | 'createdDate'
  | 'id'
  | 'isFinalized'
  | 'lifecycle'
  | 'nextEvents'
  | 'questions'
  | 'state'
  | 'updatedDate'
  | ApplicationKeySpecifier
)[];
export type ApplicationFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  contributor?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  isFinalized?: FieldPolicy<any> | FieldReadFunction<any>;
  lifecycle?: FieldPolicy<any> | FieldReadFunction<any>;
  nextEvents?: FieldPolicy<any> | FieldReadFunction<any>;
  questions?: FieldPolicy<any> | FieldReadFunction<any>;
  state?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'createdDate'
  | 'credentialRules'
  | 'hasPrivilege'
  | 'id'
  | 'myPrivileges'
  | 'privilegeRules'
  | 'type'
  | 'updatedDate'
  | 'verifiedCredentialRules'
  | AuthorizationKeySpecifier
)[];
export type AuthorizationFieldPolicy = {
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  credentialRules?: FieldPolicy<any> | FieldReadFunction<any>;
  hasPrivilege?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'subspace'
  | 'type'
  | 'updatedDate'
  | 'visibleOnParentCalendar'
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
  subspace?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  visibleOnParentCalendar?: FieldPolicy<any> | FieldReadFunction<any>;
  wholeDay?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CalloutKeySpecifier = (
  | 'activity'
  | 'authorization'
  | 'classification'
  | 'comments'
  | 'contributionDefaults'
  | 'contributions'
  | 'contributionsCount'
  | 'createdBy'
  | 'createdDate'
  | 'framing'
  | 'id'
  | 'isTemplate'
  | 'nameID'
  | 'posts'
  | 'publishedBy'
  | 'publishedDate'
  | 'settings'
  | 'sortOrder'
  | 'updatedDate'
  | CalloutKeySpecifier
)[];
export type CalloutFieldPolicy = {
  activity?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  classification?: FieldPolicy<any> | FieldReadFunction<any>;
  comments?: FieldPolicy<any> | FieldReadFunction<any>;
  contributionDefaults?: FieldPolicy<any> | FieldReadFunction<any>;
  contributions?: FieldPolicy<any> | FieldReadFunction<any>;
  contributionsCount?: FieldPolicy<any> | FieldReadFunction<any>;
  createdBy?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  framing?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  isTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  posts?: FieldPolicy<any> | FieldReadFunction<any>;
  publishedBy?: FieldPolicy<any> | FieldReadFunction<any>;
  publishedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  settings?: FieldPolicy<any> | FieldReadFunction<any>;
  sortOrder?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CalloutContributionKeySpecifier = (
  | 'authorization'
  | 'createdBy'
  | 'createdDate'
  | 'id'
  | 'link'
  | 'memo'
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
  memo?: FieldPolicy<any> | FieldReadFunction<any>;
  post?: FieldPolicy<any> | FieldReadFunction<any>;
  sortOrder?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  whiteboard?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CalloutContributionDefaultsKeySpecifier = (
  | 'createdDate'
  | 'defaultDisplayName'
  | 'id'
  | 'postDescription'
  | 'updatedDate'
  | 'whiteboardContent'
  | CalloutContributionDefaultsKeySpecifier
)[];
export type CalloutContributionDefaultsFieldPolicy = {
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  defaultDisplayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  postDescription?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  whiteboardContent?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CalloutContributionsCountOutputKeySpecifier = (
  | 'link'
  | 'memo'
  | 'post'
  | 'whiteboard'
  | CalloutContributionsCountOutputKeySpecifier
)[];
export type CalloutContributionsCountOutputFieldPolicy = {
  link?: FieldPolicy<any> | FieldReadFunction<any>;
  memo?: FieldPolicy<any> | FieldReadFunction<any>;
  post?: FieldPolicy<any> | FieldReadFunction<any>;
  whiteboard?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CalloutFramingKeySpecifier = (
  | 'authorization'
  | 'createdDate'
  | 'id'
  | 'link'
  | 'memo'
  | 'profile'
  | 'type'
  | 'updatedDate'
  | 'whiteboard'
  | CalloutFramingKeySpecifier
)[];
export type CalloutFramingFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  link?: FieldPolicy<any> | FieldReadFunction<any>;
  memo?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  whiteboard?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type CalloutSettingsKeySpecifier = ('contribution' | 'framing' | 'visibility' | CalloutSettingsKeySpecifier)[];
export type CalloutSettingsFieldPolicy = {
  contribution?: FieldPolicy<any> | FieldReadFunction<any>;
  framing?: FieldPolicy<any> | FieldReadFunction<any>;
  visibility?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CalloutSettingsContributionKeySpecifier = (
  | 'allowedTypes'
  | 'canAddContributions'
  | 'commentsEnabled'
  | 'enabled'
  | CalloutSettingsContributionKeySpecifier
)[];
export type CalloutSettingsContributionFieldPolicy = {
  allowedTypes?: FieldPolicy<any> | FieldReadFunction<any>;
  canAddContributions?: FieldPolicy<any> | FieldReadFunction<any>;
  commentsEnabled?: FieldPolicy<any> | FieldReadFunction<any>;
  enabled?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CalloutSettingsFramingKeySpecifier = ('commentsEnabled' | CalloutSettingsFramingKeySpecifier)[];
export type CalloutSettingsFramingFieldPolicy = {
  commentsEnabled?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CalloutsSetKeySpecifier = (
  | 'authorization'
  | 'callouts'
  | 'createdDate'
  | 'id'
  | 'tags'
  | 'tagsetTemplates'
  | 'type'
  | 'updatedDate'
  | CalloutsSetKeySpecifier
)[];
export type CalloutsSetFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  callouts?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  tags?: FieldPolicy<any> | FieldReadFunction<any>;
  tagsetTemplates?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ClassificationKeySpecifier = (
  | 'authorization'
  | 'createdDate'
  | 'id'
  | 'tagset'
  | 'tagsets'
  | 'updatedDate'
  | ClassificationKeySpecifier
)[];
export type ClassificationFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  tagset?: FieldPolicy<any> | FieldReadFunction<any>;
  tagsets?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CollaborationKeySpecifier = (
  | 'authorization'
  | 'calloutsSet'
  | 'createdDate'
  | 'id'
  | 'innovationFlow'
  | 'isTemplate'
  | 'license'
  | 'timeline'
  | 'updatedDate'
  | CollaborationKeySpecifier
)[];
export type CollaborationFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  calloutsSet?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationFlow?: FieldPolicy<any> | FieldReadFunction<any>;
  isTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
  license?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type CommunityKeySpecifier = (
  | 'authorization'
  | 'communication'
  | 'createdDate'
  | 'group'
  | 'groups'
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
  | 'defaultVisualTypeConstraints'
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
  defaultVisualTypeConstraints?: FieldPolicy<any> | FieldReadFunction<any>;
  featureFlags?: FieldPolicy<any> | FieldReadFunction<any>;
  geo?: FieldPolicy<any> | FieldReadFunction<any>;
  locations?: FieldPolicy<any> | FieldReadFunction<any>;
  sentry?: FieldPolicy<any> | FieldReadFunction<any>;
  storage?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ContributorKeySpecifier = (
  | 'agent'
  | 'authorization'
  | 'createdDate'
  | 'id'
  | 'nameID'
  | 'profile'
  | 'updatedDate'
  | ContributorKeySpecifier
)[];
export type ContributorFieldPolicy = {
  agent?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type ConversationKeySpecifier = (
  | 'authorization'
  | 'createdDate'
  | 'id'
  | 'room'
  | 'type'
  | 'updatedDate'
  | 'user'
  | 'virtualContributor'
  | 'wellKnownVirtualContributor'
  | ConversationKeySpecifier
)[];
export type ConversationFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  room?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  user?: FieldPolicy<any> | FieldReadFunction<any>;
  virtualContributor?: FieldPolicy<any> | FieldReadFunction<any>;
  wellKnownVirtualContributor?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CreateCalloutContributionDataKeySpecifier = (
  | 'link'
  | 'memo'
  | 'post'
  | 'sortOrder'
  | 'type'
  | 'whiteboard'
  | CreateCalloutContributionDataKeySpecifier
)[];
export type CreateCalloutContributionDataFieldPolicy = {
  link?: FieldPolicy<any> | FieldReadFunction<any>;
  memo?: FieldPolicy<any> | FieldReadFunction<any>;
  post?: FieldPolicy<any> | FieldReadFunction<any>;
  sortOrder?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  whiteboard?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CreateCalloutContributionDefaultsDataKeySpecifier = (
  | 'defaultDisplayName'
  | 'postDescription'
  | 'whiteboardContent'
  | CreateCalloutContributionDefaultsDataKeySpecifier
)[];
export type CreateCalloutContributionDefaultsDataFieldPolicy = {
  defaultDisplayName?: FieldPolicy<any> | FieldReadFunction<any>;
  postDescription?: FieldPolicy<any> | FieldReadFunction<any>;
  whiteboardContent?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CreateCalloutDataKeySpecifier = (
  | 'classification'
  | 'contributionDefaults'
  | 'contributions'
  | 'framing'
  | 'nameID'
  | 'sendNotification'
  | 'settings'
  | 'sortOrder'
  | CreateCalloutDataKeySpecifier
)[];
export type CreateCalloutDataFieldPolicy = {
  classification?: FieldPolicy<any> | FieldReadFunction<any>;
  contributionDefaults?: FieldPolicy<any> | FieldReadFunction<any>;
  contributions?: FieldPolicy<any> | FieldReadFunction<any>;
  framing?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  sendNotification?: FieldPolicy<any> | FieldReadFunction<any>;
  settings?: FieldPolicy<any> | FieldReadFunction<any>;
  sortOrder?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CreateCalloutFramingDataKeySpecifier = (
  | 'link'
  | 'memo'
  | 'profile'
  | 'tags'
  | 'type'
  | 'whiteboard'
  | CreateCalloutFramingDataKeySpecifier
)[];
export type CreateCalloutFramingDataFieldPolicy = {
  link?: FieldPolicy<any> | FieldReadFunction<any>;
  memo?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  tags?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  whiteboard?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CreateCalloutSettingsContributionDataKeySpecifier = (
  | 'allowedTypes'
  | 'canAddContributions'
  | 'commentsEnabled'
  | 'enabled'
  | CreateCalloutSettingsContributionDataKeySpecifier
)[];
export type CreateCalloutSettingsContributionDataFieldPolicy = {
  allowedTypes?: FieldPolicy<any> | FieldReadFunction<any>;
  canAddContributions?: FieldPolicy<any> | FieldReadFunction<any>;
  commentsEnabled?: FieldPolicy<any> | FieldReadFunction<any>;
  enabled?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CreateCalloutSettingsDataKeySpecifier = (
  | 'contribution'
  | 'framing'
  | 'visibility'
  | CreateCalloutSettingsDataKeySpecifier
)[];
export type CreateCalloutSettingsDataFieldPolicy = {
  contribution?: FieldPolicy<any> | FieldReadFunction<any>;
  framing?: FieldPolicy<any> | FieldReadFunction<any>;
  visibility?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CreateCalloutSettingsFramingDataKeySpecifier = (
  | 'commentsEnabled'
  | CreateCalloutSettingsFramingDataKeySpecifier
)[];
export type CreateCalloutSettingsFramingDataFieldPolicy = {
  commentsEnabled?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CreateCalloutsSetDataKeySpecifier = ('calloutsData' | CreateCalloutsSetDataKeySpecifier)[];
export type CreateCalloutsSetDataFieldPolicy = {
  calloutsData?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CreateClassificationDataKeySpecifier = ('tagsets' | CreateClassificationDataKeySpecifier)[];
export type CreateClassificationDataFieldPolicy = {
  tagsets?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CreateCollaborationDataKeySpecifier = (
  | 'calloutsSetData'
  | 'innovationFlowData'
  | CreateCollaborationDataKeySpecifier
)[];
export type CreateCollaborationDataFieldPolicy = {
  calloutsSetData?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'settings'
  | 'sortOrder'
  | CreateInnovationFlowStateDataKeySpecifier
)[];
export type CreateInnovationFlowStateDataFieldPolicy = {
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  settings?: FieldPolicy<any> | FieldReadFunction<any>;
  sortOrder?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CreateInnovationFlowStateSettingsDataKeySpecifier = (
  | 'allowNewCallouts'
  | CreateInnovationFlowStateSettingsDataKeySpecifier
)[];
export type CreateInnovationFlowStateSettingsDataFieldPolicy = {
  allowNewCallouts?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CreateLinkDataKeySpecifier = ('profile' | 'uri' | CreateLinkDataKeySpecifier)[];
export type CreateLinkDataFieldPolicy = {
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  uri?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type CreateMemoDataKeySpecifier = ('markdown' | 'profile' | CreateMemoDataKeySpecifier)[];
export type CreateMemoDataFieldPolicy = {
  markdown?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CreatePostDataKeySpecifier = ('tags' | CreatePostDataKeySpecifier)[];
export type CreatePostDataFieldPolicy = {
  tags?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CreateProfileDataKeySpecifier = (
  | 'description'
  | 'displayName'
  | 'location'
  | 'referencesData'
  | 'tagline'
  | 'tags'
  | 'tagsets'
  | 'visuals'
  | CreateProfileDataKeySpecifier
)[];
export type CreateProfileDataFieldPolicy = {
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  location?: FieldPolicy<any> | FieldReadFunction<any>;
  referencesData?: FieldPolicy<any> | FieldReadFunction<any>;
  tagline?: FieldPolicy<any> | FieldReadFunction<any>;
  tags?: FieldPolicy<any> | FieldReadFunction<any>;
  tagsets?: FieldPolicy<any> | FieldReadFunction<any>;
  visuals?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type CreateVisualOnProfileDataKeySpecifier = ('name' | 'uri' | CreateVisualOnProfileDataKeySpecifier)[];
export type CreateVisualOnProfileDataFieldPolicy = {
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  uri?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CreateWhiteboardDataKeySpecifier = (
  | 'content'
  | 'nameID'
  | 'previewSettings'
  | 'profile'
  | CreateWhiteboardDataKeySpecifier
)[];
export type CreateWhiteboardDataFieldPolicy = {
  content?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  previewSettings?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CreateWhiteboardPreviewSettingsDataKeySpecifier = (
  | 'coordinates'
  | 'mode'
  | CreateWhiteboardPreviewSettingsDataKeySpecifier
)[];
export type CreateWhiteboardPreviewSettingsDataFieldPolicy = {
  coordinates?: FieldPolicy<any> | FieldReadFunction<any>;
  mode?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type DiscussionDetailsKeySpecifier = (
  | 'category'
  | 'description'
  | 'displayName'
  | 'id'
  | 'url'
  | DiscussionDetailsKeySpecifier
)[];
export type DiscussionDetailsFieldPolicy = {
  category?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type ExternalConfigKeySpecifier = ('apiKey' | 'assistantId' | 'model' | ExternalConfigKeySpecifier)[];
export type ExternalConfigFieldPolicy = {
  apiKey?: FieldPolicy<any> | FieldReadFunction<any>;
  assistantId?: FieldPolicy<any> | FieldReadFunction<any>;
  model?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type GeoKeySpecifier = ('enabled' | 'endpoint' | GeoKeySpecifier)[];
export type GeoFieldPolicy = {
  enabled?: FieldPolicy<any> | FieldReadFunction<any>;
  endpoint?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type GeoLocationKeySpecifier = ('latitude' | 'longitude' | GeoLocationKeySpecifier)[];
export type GeoLocationFieldPolicy = {
  latitude?: FieldPolicy<any> | FieldReadFunction<any>;
  longitude?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type GroupableKeySpecifier = ('groups' | GroupableKeySpecifier)[];
export type GroupableFieldPolicy = {
  groups?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ISearchCategoryResultKeySpecifier = ('cursor' | 'results' | 'total' | ISearchCategoryResultKeySpecifier)[];
export type ISearchCategoryResultFieldPolicy = {
  cursor?: FieldPolicy<any> | FieldReadFunction<any>;
  results?: FieldPolicy<any> | FieldReadFunction<any>;
  total?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ISearchResultsKeySpecifier = (
  | 'calloutResults'
  | 'contributionResults'
  | 'contributorResults'
  | 'spaceResults'
  | ISearchResultsKeySpecifier
)[];
export type ISearchResultsFieldPolicy = {
  calloutResults?: FieldPolicy<any> | FieldReadFunction<any>;
  contributionResults?: FieldPolicy<any> | FieldReadFunction<any>;
  contributorResults?: FieldPolicy<any> | FieldReadFunction<any>;
  spaceResults?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InAppNotificationKeySpecifier = (
  | 'category'
  | 'createdDate'
  | 'id'
  | 'payload'
  | 'receiver'
  | 'state'
  | 'triggeredAt'
  | 'triggeredBy'
  | 'type'
  | 'updatedDate'
  | InAppNotificationKeySpecifier
)[];
export type InAppNotificationFieldPolicy = {
  category?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  payload?: FieldPolicy<any> | FieldReadFunction<any>;
  receiver?: FieldPolicy<any> | FieldReadFunction<any>;
  state?: FieldPolicy<any> | FieldReadFunction<any>;
  triggeredAt?: FieldPolicy<any> | FieldReadFunction<any>;
  triggeredBy?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InAppNotificationPayloadKeySpecifier = ('type' | InAppNotificationPayloadKeySpecifier)[];
export type InAppNotificationPayloadFieldPolicy = {
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InAppNotificationPayloadOrganizationMessageDirectKeySpecifier = (
  | 'message'
  | 'organization'
  | 'type'
  | InAppNotificationPayloadOrganizationMessageDirectKeySpecifier
)[];
export type InAppNotificationPayloadOrganizationMessageDirectFieldPolicy = {
  message?: FieldPolicy<any> | FieldReadFunction<any>;
  organization?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InAppNotificationPayloadOrganizationMessageRoomKeySpecifier = (
  | 'comment'
  | 'organization'
  | 'roomID'
  | 'type'
  | InAppNotificationPayloadOrganizationMessageRoomKeySpecifier
)[];
export type InAppNotificationPayloadOrganizationMessageRoomFieldPolicy = {
  comment?: FieldPolicy<any> | FieldReadFunction<any>;
  organization?: FieldPolicy<any> | FieldReadFunction<any>;
  roomID?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InAppNotificationPayloadPlatformForumDiscussionKeySpecifier = (
  | 'comment'
  | 'discussion'
  | 'type'
  | InAppNotificationPayloadPlatformForumDiscussionKeySpecifier
)[];
export type InAppNotificationPayloadPlatformForumDiscussionFieldPolicy = {
  comment?: FieldPolicy<any> | FieldReadFunction<any>;
  discussion?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InAppNotificationPayloadPlatformGlobalRoleChangeKeySpecifier = (
  | 'role'
  | 'type'
  | 'user'
  | InAppNotificationPayloadPlatformGlobalRoleChangeKeySpecifier
)[];
export type InAppNotificationPayloadPlatformGlobalRoleChangeFieldPolicy = {
  role?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  user?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InAppNotificationPayloadPlatformUserKeySpecifier = (
  | 'type'
  | InAppNotificationPayloadPlatformUserKeySpecifier
)[];
export type InAppNotificationPayloadPlatformUserFieldPolicy = {
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InAppNotificationPayloadPlatformUserMessageRoomKeySpecifier = (
  | 'messageDetails'
  | 'type'
  | 'user'
  | InAppNotificationPayloadPlatformUserMessageRoomKeySpecifier
)[];
export type InAppNotificationPayloadPlatformUserMessageRoomFieldPolicy = {
  messageDetails?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  user?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InAppNotificationPayloadPlatformUserProfileRemovedKeySpecifier = (
  | 'type'
  | 'userDisplayName'
  | 'userEmail'
  | InAppNotificationPayloadPlatformUserProfileRemovedKeySpecifier
)[];
export type InAppNotificationPayloadPlatformUserProfileRemovedFieldPolicy = {
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  userDisplayName?: FieldPolicy<any> | FieldReadFunction<any>;
  userEmail?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InAppNotificationPayloadSpaceKeySpecifier = (
  | 'space'
  | 'type'
  | InAppNotificationPayloadSpaceKeySpecifier
)[];
export type InAppNotificationPayloadSpaceFieldPolicy = {
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InAppNotificationPayloadSpaceCollaborationCalloutKeySpecifier = (
  | 'callout'
  | 'space'
  | 'type'
  | InAppNotificationPayloadSpaceCollaborationCalloutKeySpecifier
)[];
export type InAppNotificationPayloadSpaceCollaborationCalloutFieldPolicy = {
  callout?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InAppNotificationPayloadSpaceCollaborationCalloutCommentKeySpecifier = (
  | 'callout'
  | 'messageDetails'
  | 'space'
  | 'type'
  | InAppNotificationPayloadSpaceCollaborationCalloutCommentKeySpecifier
)[];
export type InAppNotificationPayloadSpaceCollaborationCalloutCommentFieldPolicy = {
  callout?: FieldPolicy<any> | FieldReadFunction<any>;
  messageDetails?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InAppNotificationPayloadSpaceCollaborationCalloutPostCommentKeySpecifier = (
  | 'callout'
  | 'messageDetails'
  | 'space'
  | 'type'
  | InAppNotificationPayloadSpaceCollaborationCalloutPostCommentKeySpecifier
)[];
export type InAppNotificationPayloadSpaceCollaborationCalloutPostCommentFieldPolicy = {
  callout?: FieldPolicy<any> | FieldReadFunction<any>;
  messageDetails?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InAppNotificationPayloadSpaceCommunicationMessageDirectKeySpecifier = (
  | 'message'
  | 'space'
  | 'type'
  | InAppNotificationPayloadSpaceCommunicationMessageDirectKeySpecifier
)[];
export type InAppNotificationPayloadSpaceCommunicationMessageDirectFieldPolicy = {
  message?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InAppNotificationPayloadSpaceCommunicationUpdateKeySpecifier = (
  | 'space'
  | 'type'
  | 'update'
  | InAppNotificationPayloadSpaceCommunicationUpdateKeySpecifier
)[];
export type InAppNotificationPayloadSpaceCommunicationUpdateFieldPolicy = {
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  update?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InAppNotificationPayloadSpaceCommunityApplicationKeySpecifier = (
  | 'application'
  | 'space'
  | 'type'
  | InAppNotificationPayloadSpaceCommunityApplicationKeySpecifier
)[];
export type InAppNotificationPayloadSpaceCommunityApplicationFieldPolicy = {
  application?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InAppNotificationPayloadSpaceCommunityCalendarEventKeySpecifier = (
  | 'calendarEvent'
  | 'space'
  | 'type'
  | InAppNotificationPayloadSpaceCommunityCalendarEventKeySpecifier
)[];
export type InAppNotificationPayloadSpaceCommunityCalendarEventFieldPolicy = {
  calendarEvent?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InAppNotificationPayloadSpaceCommunityCalendarEventCommentKeySpecifier = (
  | 'calendarEvent'
  | 'commentText'
  | 'space'
  | 'type'
  | InAppNotificationPayloadSpaceCommunityCalendarEventCommentKeySpecifier
)[];
export type InAppNotificationPayloadSpaceCommunityCalendarEventCommentFieldPolicy = {
  calendarEvent?: FieldPolicy<any> | FieldReadFunction<any>;
  commentText?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InAppNotificationPayloadSpaceCommunityContributorKeySpecifier = (
  | 'contributor'
  | 'space'
  | 'type'
  | InAppNotificationPayloadSpaceCommunityContributorKeySpecifier
)[];
export type InAppNotificationPayloadSpaceCommunityContributorFieldPolicy = {
  contributor?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InAppNotificationPayloadSpaceCommunityInvitationKeySpecifier = (
  | 'space'
  | 'type'
  | InAppNotificationPayloadSpaceCommunityInvitationKeySpecifier
)[];
export type InAppNotificationPayloadSpaceCommunityInvitationFieldPolicy = {
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InAppNotificationPayloadSpaceCommunityInvitationPlatformKeySpecifier = (
  | 'space'
  | 'type'
  | InAppNotificationPayloadSpaceCommunityInvitationPlatformKeySpecifier
)[];
export type InAppNotificationPayloadSpaceCommunityInvitationPlatformFieldPolicy = {
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InAppNotificationPayloadUserMessageDirectKeySpecifier = (
  | 'message'
  | 'type'
  | 'user'
  | InAppNotificationPayloadUserMessageDirectKeySpecifier
)[];
export type InAppNotificationPayloadUserMessageDirectFieldPolicy = {
  message?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  user?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InAppNotificationPayloadVirtualContributorKeySpecifier = (
  | 'contributor'
  | 'space'
  | 'type'
  | InAppNotificationPayloadVirtualContributorKeySpecifier
)[];
export type InAppNotificationPayloadVirtualContributorFieldPolicy = {
  contributor?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InnovationFlowKeySpecifier = (
  | 'authorization'
  | 'createdDate'
  | 'currentState'
  | 'id'
  | 'profile'
  | 'settings'
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
  settings?: FieldPolicy<any> | FieldReadFunction<any>;
  states?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InnovationFlowSettingsKeySpecifier = (
  | 'maximumNumberOfStates'
  | 'minimumNumberOfStates'
  | InnovationFlowSettingsKeySpecifier
)[];
export type InnovationFlowSettingsFieldPolicy = {
  maximumNumberOfStates?: FieldPolicy<any> | FieldReadFunction<any>;
  minimumNumberOfStates?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InnovationFlowStateKeySpecifier = (
  | 'authorization'
  | 'createdDate'
  | 'description'
  | 'displayName'
  | 'id'
  | 'settings'
  | 'sortOrder'
  | 'updatedDate'
  | InnovationFlowStateKeySpecifier
)[];
export type InnovationFlowStateFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  settings?: FieldPolicy<any> | FieldReadFunction<any>;
  sortOrder?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InnovationFlowStateSettingsKeySpecifier = ('allowNewCallouts' | InnovationFlowStateSettingsKeySpecifier)[];
export type InnovationFlowStateSettingsFieldPolicy = {
  allowNewCallouts?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'extraRoles'
  | 'id'
  | 'invitedToParent'
  | 'isFinalized'
  | 'lifecycle'
  | 'nextEvents'
  | 'state'
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
  extraRoles?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  invitedToParent?: FieldPolicy<any> | FieldReadFunction<any>;
  isFinalized?: FieldPolicy<any> | FieldReadFunction<any>;
  lifecycle?: FieldPolicy<any> | FieldReadFunction<any>;
  nextEvents?: FieldPolicy<any> | FieldReadFunction<any>;
  state?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  welcomeMessage?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type KnowledgeBaseKeySpecifier = (
  | 'authorization'
  | 'calloutsSet'
  | 'createdDate'
  | 'id'
  | 'profile'
  | 'updatedDate'
  | KnowledgeBaseKeySpecifier
)[];
export type KnowledgeBaseFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  calloutsSet?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type KratosIdentityKeySpecifier = (
  | 'createdAt'
  | 'email'
  | 'firstName'
  | 'id'
  | 'isVerified'
  | 'lastName'
  | 'verificationStatus'
  | KratosIdentityKeySpecifier
)[];
export type KratosIdentityFieldPolicy = {
  createdAt?: FieldPolicy<any> | FieldReadFunction<any>;
  email?: FieldPolicy<any> | FieldReadFunction<any>;
  firstName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  isVerified?: FieldPolicy<any> | FieldReadFunction<any>;
  lastName?: FieldPolicy<any> | FieldReadFunction<any>;
  verificationStatus?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type LicenseKeySpecifier = (
  | 'authorization'
  | 'availableEntitlements'
  | 'createdDate'
  | 'entitlements'
  | 'id'
  | 'type'
  | 'updatedDate'
  | LicenseKeySpecifier
)[];
export type LicenseFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  availableEntitlements?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  entitlements?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type LicenseEntitlementKeySpecifier = (
  | 'createdDate'
  | 'dataType'
  | 'enabled'
  | 'id'
  | 'isAvailable'
  | 'limit'
  | 'type'
  | 'updatedDate'
  | 'usage'
  | LicenseEntitlementKeySpecifier
)[];
export type LicenseEntitlementFieldPolicy = {
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  dataType?: FieldPolicy<any> | FieldReadFunction<any>;
  enabled?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  isAvailable?: FieldPolicy<any> | FieldReadFunction<any>;
  limit?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  usage?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type LicensingCredentialBasedPolicyCredentialRuleKeySpecifier = (
  | 'credentialType'
  | 'grantedEntitlements'
  | 'id'
  | 'name'
  | LicensingCredentialBasedPolicyCredentialRuleKeySpecifier
)[];
export type LicensingCredentialBasedPolicyCredentialRuleFieldPolicy = {
  credentialType?: FieldPolicy<any> | FieldReadFunction<any>;
  grantedEntitlements?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type LicensingGrantedEntitlementKeySpecifier = ('limit' | 'type' | LicensingGrantedEntitlementKeySpecifier)[];
export type LicensingGrantedEntitlementFieldPolicy = {
  limit?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'geoLocation'
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
  geoLocation?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  postalCode?: FieldPolicy<any> | FieldReadFunction<any>;
  stateOrProvince?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type LookupByNameQueryResultsKeySpecifier = (
  | 'innovationHub'
  | 'innovationPack'
  | 'organization'
  | 'space'
  | 'template'
  | 'user'
  | 'virtualContributor'
  | LookupByNameQueryResultsKeySpecifier
)[];
export type LookupByNameQueryResultsFieldPolicy = {
  innovationHub?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationPack?: FieldPolicy<any> | FieldReadFunction<any>;
  organization?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  template?: FieldPolicy<any> | FieldReadFunction<any>;
  user?: FieldPolicy<any> | FieldReadFunction<any>;
  virtualContributor?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type LookupMyPrivilegesQueryResultsKeySpecifier = (
  | 'account'
  | 'application'
  | 'calendar'
  | 'calendarEvent'
  | 'callout'
  | 'collaboration'
  | 'community'
  | 'communityGuidelines'
  | 'document'
  | 'innovationFlow'
  | 'innovationHub'
  | 'innovationPack'
  | 'invitation'
  | 'license'
  | 'post'
  | 'profile'
  | 'roleSet'
  | 'room'
  | 'space'
  | 'spaceAbout'
  | 'storageAggregator'
  | 'storageBucket'
  | 'template'
  | 'templatesManager'
  | 'templatesSet'
  | 'user'
  | 'virtualContributor'
  | 'whiteboard'
  | LookupMyPrivilegesQueryResultsKeySpecifier
)[];
export type LookupMyPrivilegesQueryResultsFieldPolicy = {
  account?: FieldPolicy<any> | FieldReadFunction<any>;
  application?: FieldPolicy<any> | FieldReadFunction<any>;
  calendar?: FieldPolicy<any> | FieldReadFunction<any>;
  calendarEvent?: FieldPolicy<any> | FieldReadFunction<any>;
  callout?: FieldPolicy<any> | FieldReadFunction<any>;
  collaboration?: FieldPolicy<any> | FieldReadFunction<any>;
  community?: FieldPolicy<any> | FieldReadFunction<any>;
  communityGuidelines?: FieldPolicy<any> | FieldReadFunction<any>;
  document?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationFlow?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationHub?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationPack?: FieldPolicy<any> | FieldReadFunction<any>;
  invitation?: FieldPolicy<any> | FieldReadFunction<any>;
  license?: FieldPolicy<any> | FieldReadFunction<any>;
  post?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  roleSet?: FieldPolicy<any> | FieldReadFunction<any>;
  room?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  spaceAbout?: FieldPolicy<any> | FieldReadFunction<any>;
  storageAggregator?: FieldPolicy<any> | FieldReadFunction<any>;
  storageBucket?: FieldPolicy<any> | FieldReadFunction<any>;
  template?: FieldPolicy<any> | FieldReadFunction<any>;
  templatesManager?: FieldPolicy<any> | FieldReadFunction<any>;
  templatesSet?: FieldPolicy<any> | FieldReadFunction<any>;
  user?: FieldPolicy<any> | FieldReadFunction<any>;
  virtualContributor?: FieldPolicy<any> | FieldReadFunction<any>;
  whiteboard?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type LookupQueryResultsKeySpecifier = (
  | 'about'
  | 'account'
  | 'application'
  | 'authorizationPolicy'
  | 'authorizationPrivilegesForUser'
  | 'calendar'
  | 'calendarEvent'
  | 'callout'
  | 'calloutsSet'
  | 'collaboration'
  | 'community'
  | 'communityGuidelines'
  | 'contribution'
  | 'conversation'
  | 'document'
  | 'innovationFlow'
  | 'innovationHub'
  | 'innovationPack'
  | 'invitation'
  | 'knowledgeBase'
  | 'license'
  | 'memo'
  | 'myPrivileges'
  | 'organization'
  | 'platformInvitation'
  | 'post'
  | 'profile'
  | 'roleSet'
  | 'room'
  | 'space'
  | 'storageAggregator'
  | 'storageBucket'
  | 'template'
  | 'templateContentSpace'
  | 'templatesManager'
  | 'templatesSet'
  | 'user'
  | 'virtualContributor'
  | 'whiteboard'
  | LookupQueryResultsKeySpecifier
)[];
export type LookupQueryResultsFieldPolicy = {
  about?: FieldPolicy<any> | FieldReadFunction<any>;
  account?: FieldPolicy<any> | FieldReadFunction<any>;
  application?: FieldPolicy<any> | FieldReadFunction<any>;
  authorizationPolicy?: FieldPolicy<any> | FieldReadFunction<any>;
  authorizationPrivilegesForUser?: FieldPolicy<any> | FieldReadFunction<any>;
  calendar?: FieldPolicy<any> | FieldReadFunction<any>;
  calendarEvent?: FieldPolicy<any> | FieldReadFunction<any>;
  callout?: FieldPolicy<any> | FieldReadFunction<any>;
  calloutsSet?: FieldPolicy<any> | FieldReadFunction<any>;
  collaboration?: FieldPolicy<any> | FieldReadFunction<any>;
  community?: FieldPolicy<any> | FieldReadFunction<any>;
  communityGuidelines?: FieldPolicy<any> | FieldReadFunction<any>;
  contribution?: FieldPolicy<any> | FieldReadFunction<any>;
  conversation?: FieldPolicy<any> | FieldReadFunction<any>;
  document?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationFlow?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationHub?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationPack?: FieldPolicy<any> | FieldReadFunction<any>;
  invitation?: FieldPolicy<any> | FieldReadFunction<any>;
  knowledgeBase?: FieldPolicy<any> | FieldReadFunction<any>;
  license?: FieldPolicy<any> | FieldReadFunction<any>;
  memo?: FieldPolicy<any> | FieldReadFunction<any>;
  myPrivileges?: FieldPolicy<any> | FieldReadFunction<any>;
  organization?: FieldPolicy<any> | FieldReadFunction<any>;
  platformInvitation?: FieldPolicy<any> | FieldReadFunction<any>;
  post?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  roleSet?: FieldPolicy<any> | FieldReadFunction<any>;
  room?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  storageAggregator?: FieldPolicy<any> | FieldReadFunction<any>;
  storageBucket?: FieldPolicy<any> | FieldReadFunction<any>;
  template?: FieldPolicy<any> | FieldReadFunction<any>;
  templateContentSpace?: FieldPolicy<any> | FieldReadFunction<any>;
  templatesManager?: FieldPolicy<any> | FieldReadFunction<any>;
  templatesSet?: FieldPolicy<any> | FieldReadFunction<any>;
  user?: FieldPolicy<any> | FieldReadFunction<any>;
  virtualContributor?: FieldPolicy<any> | FieldReadFunction<any>;
  whiteboard?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MeConversationsResultKeySpecifier = (
  | 'users'
  | 'virtualContributor'
  | 'virtualContributors'
  | MeConversationsResultKeySpecifier
)[];
export type MeConversationsResultFieldPolicy = {
  users?: FieldPolicy<any> | FieldReadFunction<any>;
  virtualContributor?: FieldPolicy<any> | FieldReadFunction<any>;
  virtualContributors?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MeQueryResultsKeySpecifier = (
  | 'communityApplications'
  | 'communityInvitations'
  | 'communityInvitationsCount'
  | 'conversations'
  | 'id'
  | 'mySpaces'
  | 'notifications'
  | 'notificationsUnreadCount'
  | 'spaceMembershipsFlat'
  | 'spaceMembershipsHierarchical'
  | 'user'
  | MeQueryResultsKeySpecifier
)[];
export type MeQueryResultsFieldPolicy = {
  communityApplications?: FieldPolicy<any> | FieldReadFunction<any>;
  communityInvitations?: FieldPolicy<any> | FieldReadFunction<any>;
  communityInvitationsCount?: FieldPolicy<any> | FieldReadFunction<any>;
  conversations?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  mySpaces?: FieldPolicy<any> | FieldReadFunction<any>;
  notifications?: FieldPolicy<any> | FieldReadFunction<any>;
  notificationsUnreadCount?: FieldPolicy<any> | FieldReadFunction<any>;
  spaceMembershipsFlat?: FieldPolicy<any> | FieldReadFunction<any>;
  spaceMembershipsHierarchical?: FieldPolicy<any> | FieldReadFunction<any>;
  user?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MemoKeySpecifier = (
  | 'authorization'
  | 'content'
  | 'contentUpdatePolicy'
  | 'createdBy'
  | 'createdDate'
  | 'id'
  | 'isMultiUser'
  | 'markdown'
  | 'nameID'
  | 'profile'
  | 'updatedDate'
  | MemoKeySpecifier
)[];
export type MemoFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  content?: FieldPolicy<any> | FieldReadFunction<any>;
  contentUpdatePolicy?: FieldPolicy<any> | FieldReadFunction<any>;
  createdBy?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  isMultiUser?: FieldPolicy<any> | FieldReadFunction<any>;
  markdown?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'error'
  | 'id'
  | 'question'
  | 'success'
  | MessageAnswerQuestionKeySpecifier
)[];
export type MessageAnswerQuestionFieldPolicy = {
  error?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  question?: FieldPolicy<any> | FieldReadFunction<any>;
  success?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MessageDetailsKeySpecifier = ('message' | 'parent' | 'room' | MessageDetailsKeySpecifier)[];
export type MessageDetailsFieldPolicy = {
  message?: FieldPolicy<any> | FieldReadFunction<any>;
  parent?: FieldPolicy<any> | FieldReadFunction<any>;
  room?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MessageParentKeySpecifier = ('displayName' | 'id' | 'url' | MessageParentKeySpecifier)[];
export type MessageParentFieldPolicy = {
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MetadataKeySpecifier = ('services' | MetadataKeySpecifier)[];
export type MetadataFieldPolicy = {
  services?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MigrateEmbeddingsKeySpecifier = ('success' | MigrateEmbeddingsKeySpecifier)[];
export type MigrateEmbeddingsFieldPolicy = {
  success?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ModelCardAiEngineResultKeySpecifier = (
  | 'additionalTechnicalDetails'
  | 'areAnswersRestrictedToBodyOfKnowledge'
  | 'canAccessWebWhenAnswering'
  | 'hostingLocation'
  | 'isExternal'
  | 'isInteractionDataUsedForTraining'
  | 'isUsingOpenWeightsModel'
  | ModelCardAiEngineResultKeySpecifier
)[];
export type ModelCardAiEngineResultFieldPolicy = {
  additionalTechnicalDetails?: FieldPolicy<any> | FieldReadFunction<any>;
  areAnswersRestrictedToBodyOfKnowledge?: FieldPolicy<any> | FieldReadFunction<any>;
  canAccessWebWhenAnswering?: FieldPolicy<any> | FieldReadFunction<any>;
  hostingLocation?: FieldPolicy<any> | FieldReadFunction<any>;
  isExternal?: FieldPolicy<any> | FieldReadFunction<any>;
  isInteractionDataUsedForTraining?: FieldPolicy<any> | FieldReadFunction<any>;
  isUsingOpenWeightsModel?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ModelCardMonitoringResultKeySpecifier = (
  | 'isUsageMonitoredByAlkemio'
  | ModelCardMonitoringResultKeySpecifier
)[];
export type ModelCardMonitoringResultFieldPolicy = {
  isUsageMonitoredByAlkemio?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ModelCardSpaceUsageResultKeySpecifier = (
  | 'flags'
  | 'modelCardEntry'
  | ModelCardSpaceUsageResultKeySpecifier
)[];
export type ModelCardSpaceUsageResultFieldPolicy = {
  flags?: FieldPolicy<any> | FieldReadFunction<any>;
  modelCardEntry?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MutationKeySpecifier = (
  | 'addIframeAllowedURL'
  | 'addNotificationEmailToBlacklist'
  | 'addReactionToMessageInRoom'
  | 'adminCommunicationEnsureAccessToCommunications'
  | 'adminCommunicationRemoveOrphanedRoom'
  | 'adminCommunicationUpdateRoomState'
  | 'adminIdentityDeleteKratosIdentity'
  | 'adminInAppNotificationsPrune'
  | 'adminLicensePolicyCreateCredentialRule'
  | 'adminLicensePolicyDeleteCredentialRule'
  | 'adminLicensePolicyUpdateCredentialRule'
  | 'adminSearchIngestFromScratch'
  | 'adminUpdateContributorAvatars'
  | 'adminUpdateGeoLocationData'
  | 'adminUserAccountDelete'
  | 'adminWingbackCreateTestCustomer'
  | 'adminWingbackGetCustomerEntitlements'
  | 'aiServerAuthorizationPolicyReset'
  | 'aiServerCreateAiPersona'
  | 'aiServerDeleteAiPersona'
  | 'aiServerUpdateAiPersona'
  | 'applyForEntryRoleOnRoleSet'
  | 'askVcQuestion'
  | 'assignLicensePlanToAccount'
  | 'assignLicensePlanToSpace'
  | 'assignPlatformRoleToUser'
  | 'assignRoleToOrganization'
  | 'assignRoleToUser'
  | 'assignRoleToVirtualContributor'
  | 'assignUserToGroup'
  | 'authorizationPlatformRolesAccessReset'
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
  | 'convertSpaceL1ToSpaceL0'
  | 'convertSpaceL1ToSpaceL2'
  | 'convertSpaceL2ToSpaceL1'
  | 'convertVirtualContributorToUseKnowledgeBase'
  | 'createCalloutOnCalloutsSet'
  | 'createContributionOnCallout'
  | 'createConversationOnConversationsSet'
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
  | 'createStateOnInnovationFlow'
  | 'createSubspace'
  | 'createTagsetOnProfile'
  | 'createTemplate'
  | 'createTemplateFromContentSpace'
  | 'createTemplateFromSpace'
  | 'createUser'
  | 'createUserNewRegistration'
  | 'createVirtualContributor'
  | 'createWingbackAccount'
  | 'deleteCalendarEvent'
  | 'deleteCallout'
  | 'deleteContribution'
  | 'deleteConversation'
  | 'deleteDiscussion'
  | 'deleteDocument'
  | 'deleteInnovationHub'
  | 'deleteInnovationPack'
  | 'deleteInvitation'
  | 'deleteLicensePlan'
  | 'deleteLink'
  | 'deleteMemo'
  | 'deleteOrganization'
  | 'deletePlatformInvitation'
  | 'deletePost'
  | 'deleteReference'
  | 'deleteSpace'
  | 'deleteStateOnInnovationFlow'
  | 'deleteStorageBucket'
  | 'deleteTemplate'
  | 'deleteUser'
  | 'deleteUserApplication'
  | 'deleteUserGroup'
  | 'deleteVirtualContributor'
  | 'deleteWhiteboard'
  | 'eventOnApplication'
  | 'eventOnInvitation'
  | 'eventOnOrganizationVerification'
  | 'feedbackOnVcAnswerRelevance'
  | 'grantCredentialToOrganization'
  | 'grantCredentialToUser'
  | 'inviteForEntryRoleOnRoleSet'
  | 'joinRoleSet'
  | 'licenseResetOnAccount'
  | 'markNotificationsAsRead'
  | 'markNotificationsAsUnread'
  | 'moveContributionToCallout'
  | 'refreshAllBodiesOfKnowledge'
  | 'refreshVirtualContributorBodyOfKnowledge'
  | 'removeCommunityGuidelinesContent'
  | 'removeIframeAllowedURL'
  | 'removeMessageOnRoom'
  | 'removeNotificationEmailFromBlacklist'
  | 'removePlatformRoleFromUser'
  | 'removeReactionToMessageInRoom'
  | 'removeRoleFromOrganization'
  | 'removeRoleFromUser'
  | 'removeRoleFromVirtualContributor'
  | 'removeUserFromGroup'
  | 'resetConversationVc'
  | 'resetLicenseOnAccounts'
  | 'revokeCredentialFromOrganization'
  | 'revokeCredentialFromUser'
  | 'revokeLicensePlanFromAccount'
  | 'revokeLicensePlanFromSpace'
  | 'sendMessageReplyToRoom'
  | 'sendMessageToCommunityLeads'
  | 'sendMessageToOrganization'
  | 'sendMessageToRoom'
  | 'sendMessageToUsers'
  | 'setPlatformWellKnownVirtualContributor'
  | 'transferCallout'
  | 'transferInnovationHubToAccount'
  | 'transferInnovationPackToAccount'
  | 'transferSpaceToAccount'
  | 'transferVirtualContributorToAccount'
  | 'updateApplicationFormOnRoleSet'
  | 'updateBaselineLicensePlanOnAccount'
  | 'updateCalendarEvent'
  | 'updateCallout'
  | 'updateCalloutPublishInfo'
  | 'updateCalloutVisibility'
  | 'updateCalloutsSortOrder'
  | 'updateClassificationTagset'
  | 'updateCollaborationFromSpaceTemplate'
  | 'updateCommunityGuidelines'
  | 'updateContributionsSortOrder'
  | 'updateDiscussion'
  | 'updateDocument'
  | 'updateInnovationFlow'
  | 'updateInnovationFlowCurrentState'
  | 'updateInnovationFlowState'
  | 'updateInnovationFlowStatesSortOrder'
  | 'updateInnovationHub'
  | 'updateInnovationPack'
  | 'updateLicensePlan'
  | 'updateLink'
  | 'updateMemo'
  | 'updateNotificationState'
  | 'updateOrganization'
  | 'updateOrganizationPlatformSettings'
  | 'updateOrganizationSettings'
  | 'updatePlatformSettings'
  | 'updatePost'
  | 'updateProfile'
  | 'updateReference'
  | 'updateSpace'
  | 'updateSpacePlatformSettings'
  | 'updateSpaceSettings'
  | 'updateTagset'
  | 'updateTemplate'
  | 'updateTemplateContentSpace'
  | 'updateTemplateDefault'
  | 'updateTemplateFromSpace'
  | 'updateUser'
  | 'updateUserGroup'
  | 'updateUserPlatformSettings'
  | 'updateUserSettings'
  | 'updateVirtualContributor'
  | 'updateVirtualContributorSettings'
  | 'updateVisual'
  | 'updateWhiteboard'
  | 'uploadFileOnLink'
  | 'uploadFileOnReference'
  | 'uploadFileOnStorageBucket'
  | 'uploadImageOnVisual'
  | MutationKeySpecifier
)[];
export type MutationFieldPolicy = {
  addIframeAllowedURL?: FieldPolicy<any> | FieldReadFunction<any>;
  addNotificationEmailToBlacklist?: FieldPolicy<any> | FieldReadFunction<any>;
  addReactionToMessageInRoom?: FieldPolicy<any> | FieldReadFunction<any>;
  adminCommunicationEnsureAccessToCommunications?: FieldPolicy<any> | FieldReadFunction<any>;
  adminCommunicationRemoveOrphanedRoom?: FieldPolicy<any> | FieldReadFunction<any>;
  adminCommunicationUpdateRoomState?: FieldPolicy<any> | FieldReadFunction<any>;
  adminIdentityDeleteKratosIdentity?: FieldPolicy<any> | FieldReadFunction<any>;
  adminInAppNotificationsPrune?: FieldPolicy<any> | FieldReadFunction<any>;
  adminLicensePolicyCreateCredentialRule?: FieldPolicy<any> | FieldReadFunction<any>;
  adminLicensePolicyDeleteCredentialRule?: FieldPolicy<any> | FieldReadFunction<any>;
  adminLicensePolicyUpdateCredentialRule?: FieldPolicy<any> | FieldReadFunction<any>;
  adminSearchIngestFromScratch?: FieldPolicy<any> | FieldReadFunction<any>;
  adminUpdateContributorAvatars?: FieldPolicy<any> | FieldReadFunction<any>;
  adminUpdateGeoLocationData?: FieldPolicy<any> | FieldReadFunction<any>;
  adminUserAccountDelete?: FieldPolicy<any> | FieldReadFunction<any>;
  adminWingbackCreateTestCustomer?: FieldPolicy<any> | FieldReadFunction<any>;
  adminWingbackGetCustomerEntitlements?: FieldPolicy<any> | FieldReadFunction<any>;
  aiServerAuthorizationPolicyReset?: FieldPolicy<any> | FieldReadFunction<any>;
  aiServerCreateAiPersona?: FieldPolicy<any> | FieldReadFunction<any>;
  aiServerDeleteAiPersona?: FieldPolicy<any> | FieldReadFunction<any>;
  aiServerUpdateAiPersona?: FieldPolicy<any> | FieldReadFunction<any>;
  applyForEntryRoleOnRoleSet?: FieldPolicy<any> | FieldReadFunction<any>;
  askVcQuestion?: FieldPolicy<any> | FieldReadFunction<any>;
  assignLicensePlanToAccount?: FieldPolicy<any> | FieldReadFunction<any>;
  assignLicensePlanToSpace?: FieldPolicy<any> | FieldReadFunction<any>;
  assignPlatformRoleToUser?: FieldPolicy<any> | FieldReadFunction<any>;
  assignRoleToOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  assignRoleToUser?: FieldPolicy<any> | FieldReadFunction<any>;
  assignRoleToVirtualContributor?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserToGroup?: FieldPolicy<any> | FieldReadFunction<any>;
  authorizationPlatformRolesAccessReset?: FieldPolicy<any> | FieldReadFunction<any>;
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
  convertSpaceL1ToSpaceL0?: FieldPolicy<any> | FieldReadFunction<any>;
  convertSpaceL1ToSpaceL2?: FieldPolicy<any> | FieldReadFunction<any>;
  convertSpaceL2ToSpaceL1?: FieldPolicy<any> | FieldReadFunction<any>;
  convertVirtualContributorToUseKnowledgeBase?: FieldPolicy<any> | FieldReadFunction<any>;
  createCalloutOnCalloutsSet?: FieldPolicy<any> | FieldReadFunction<any>;
  createContributionOnCallout?: FieldPolicy<any> | FieldReadFunction<any>;
  createConversationOnConversationsSet?: FieldPolicy<any> | FieldReadFunction<any>;
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
  createStateOnInnovationFlow?: FieldPolicy<any> | FieldReadFunction<any>;
  createSubspace?: FieldPolicy<any> | FieldReadFunction<any>;
  createTagsetOnProfile?: FieldPolicy<any> | FieldReadFunction<any>;
  createTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
  createTemplateFromContentSpace?: FieldPolicy<any> | FieldReadFunction<any>;
  createTemplateFromSpace?: FieldPolicy<any> | FieldReadFunction<any>;
  createUser?: FieldPolicy<any> | FieldReadFunction<any>;
  createUserNewRegistration?: FieldPolicy<any> | FieldReadFunction<any>;
  createVirtualContributor?: FieldPolicy<any> | FieldReadFunction<any>;
  createWingbackAccount?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteCalendarEvent?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteCallout?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteContribution?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteConversation?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteDiscussion?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteDocument?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteInnovationHub?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteInnovationPack?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteInvitation?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteLicensePlan?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteLink?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteMemo?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  deletePlatformInvitation?: FieldPolicy<any> | FieldReadFunction<any>;
  deletePost?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteReference?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteSpace?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteStateOnInnovationFlow?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteStorageBucket?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteUser?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteUserApplication?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteUserGroup?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteVirtualContributor?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteWhiteboard?: FieldPolicy<any> | FieldReadFunction<any>;
  eventOnApplication?: FieldPolicy<any> | FieldReadFunction<any>;
  eventOnInvitation?: FieldPolicy<any> | FieldReadFunction<any>;
  eventOnOrganizationVerification?: FieldPolicy<any> | FieldReadFunction<any>;
  feedbackOnVcAnswerRelevance?: FieldPolicy<any> | FieldReadFunction<any>;
  grantCredentialToOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  grantCredentialToUser?: FieldPolicy<any> | FieldReadFunction<any>;
  inviteForEntryRoleOnRoleSet?: FieldPolicy<any> | FieldReadFunction<any>;
  joinRoleSet?: FieldPolicy<any> | FieldReadFunction<any>;
  licenseResetOnAccount?: FieldPolicy<any> | FieldReadFunction<any>;
  markNotificationsAsRead?: FieldPolicy<any> | FieldReadFunction<any>;
  markNotificationsAsUnread?: FieldPolicy<any> | FieldReadFunction<any>;
  moveContributionToCallout?: FieldPolicy<any> | FieldReadFunction<any>;
  refreshAllBodiesOfKnowledge?: FieldPolicy<any> | FieldReadFunction<any>;
  refreshVirtualContributorBodyOfKnowledge?: FieldPolicy<any> | FieldReadFunction<any>;
  removeCommunityGuidelinesContent?: FieldPolicy<any> | FieldReadFunction<any>;
  removeIframeAllowedURL?: FieldPolicy<any> | FieldReadFunction<any>;
  removeMessageOnRoom?: FieldPolicy<any> | FieldReadFunction<any>;
  removeNotificationEmailFromBlacklist?: FieldPolicy<any> | FieldReadFunction<any>;
  removePlatformRoleFromUser?: FieldPolicy<any> | FieldReadFunction<any>;
  removeReactionToMessageInRoom?: FieldPolicy<any> | FieldReadFunction<any>;
  removeRoleFromOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  removeRoleFromUser?: FieldPolicy<any> | FieldReadFunction<any>;
  removeRoleFromVirtualContributor?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserFromGroup?: FieldPolicy<any> | FieldReadFunction<any>;
  resetConversationVc?: FieldPolicy<any> | FieldReadFunction<any>;
  resetLicenseOnAccounts?: FieldPolicy<any> | FieldReadFunction<any>;
  revokeCredentialFromOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  revokeCredentialFromUser?: FieldPolicy<any> | FieldReadFunction<any>;
  revokeLicensePlanFromAccount?: FieldPolicy<any> | FieldReadFunction<any>;
  revokeLicensePlanFromSpace?: FieldPolicy<any> | FieldReadFunction<any>;
  sendMessageReplyToRoom?: FieldPolicy<any> | FieldReadFunction<any>;
  sendMessageToCommunityLeads?: FieldPolicy<any> | FieldReadFunction<any>;
  sendMessageToOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  sendMessageToRoom?: FieldPolicy<any> | FieldReadFunction<any>;
  sendMessageToUsers?: FieldPolicy<any> | FieldReadFunction<any>;
  setPlatformWellKnownVirtualContributor?: FieldPolicy<any> | FieldReadFunction<any>;
  transferCallout?: FieldPolicy<any> | FieldReadFunction<any>;
  transferInnovationHubToAccount?: FieldPolicy<any> | FieldReadFunction<any>;
  transferInnovationPackToAccount?: FieldPolicy<any> | FieldReadFunction<any>;
  transferSpaceToAccount?: FieldPolicy<any> | FieldReadFunction<any>;
  transferVirtualContributorToAccount?: FieldPolicy<any> | FieldReadFunction<any>;
  updateApplicationFormOnRoleSet?: FieldPolicy<any> | FieldReadFunction<any>;
  updateBaselineLicensePlanOnAccount?: FieldPolicy<any> | FieldReadFunction<any>;
  updateCalendarEvent?: FieldPolicy<any> | FieldReadFunction<any>;
  updateCallout?: FieldPolicy<any> | FieldReadFunction<any>;
  updateCalloutPublishInfo?: FieldPolicy<any> | FieldReadFunction<any>;
  updateCalloutVisibility?: FieldPolicy<any> | FieldReadFunction<any>;
  updateCalloutsSortOrder?: FieldPolicy<any> | FieldReadFunction<any>;
  updateClassificationTagset?: FieldPolicy<any> | FieldReadFunction<any>;
  updateCollaborationFromSpaceTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
  updateCommunityGuidelines?: FieldPolicy<any> | FieldReadFunction<any>;
  updateContributionsSortOrder?: FieldPolicy<any> | FieldReadFunction<any>;
  updateDiscussion?: FieldPolicy<any> | FieldReadFunction<any>;
  updateDocument?: FieldPolicy<any> | FieldReadFunction<any>;
  updateInnovationFlow?: FieldPolicy<any> | FieldReadFunction<any>;
  updateInnovationFlowCurrentState?: FieldPolicy<any> | FieldReadFunction<any>;
  updateInnovationFlowState?: FieldPolicy<any> | FieldReadFunction<any>;
  updateInnovationFlowStatesSortOrder?: FieldPolicy<any> | FieldReadFunction<any>;
  updateInnovationHub?: FieldPolicy<any> | FieldReadFunction<any>;
  updateInnovationPack?: FieldPolicy<any> | FieldReadFunction<any>;
  updateLicensePlan?: FieldPolicy<any> | FieldReadFunction<any>;
  updateLink?: FieldPolicy<any> | FieldReadFunction<any>;
  updateMemo?: FieldPolicy<any> | FieldReadFunction<any>;
  updateNotificationState?: FieldPolicy<any> | FieldReadFunction<any>;
  updateOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  updateOrganizationPlatformSettings?: FieldPolicy<any> | FieldReadFunction<any>;
  updateOrganizationSettings?: FieldPolicy<any> | FieldReadFunction<any>;
  updatePlatformSettings?: FieldPolicy<any> | FieldReadFunction<any>;
  updatePost?: FieldPolicy<any> | FieldReadFunction<any>;
  updateProfile?: FieldPolicy<any> | FieldReadFunction<any>;
  updateReference?: FieldPolicy<any> | FieldReadFunction<any>;
  updateSpace?: FieldPolicy<any> | FieldReadFunction<any>;
  updateSpacePlatformSettings?: FieldPolicy<any> | FieldReadFunction<any>;
  updateSpaceSettings?: FieldPolicy<any> | FieldReadFunction<any>;
  updateTagset?: FieldPolicy<any> | FieldReadFunction<any>;
  updateTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
  updateTemplateContentSpace?: FieldPolicy<any> | FieldReadFunction<any>;
  updateTemplateDefault?: FieldPolicy<any> | FieldReadFunction<any>;
  updateTemplateFromSpace?: FieldPolicy<any> | FieldReadFunction<any>;
  updateUser?: FieldPolicy<any> | FieldReadFunction<any>;
  updateUserGroup?: FieldPolicy<any> | FieldReadFunction<any>;
  updateUserPlatformSettings?: FieldPolicy<any> | FieldReadFunction<any>;
  updateUserSettings?: FieldPolicy<any> | FieldReadFunction<any>;
  updateVirtualContributor?: FieldPolicy<any> | FieldReadFunction<any>;
  updateVirtualContributorSettings?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type NotificationRecipientResultKeySpecifier = (
  | 'emailRecipients'
  | 'inAppRecipients'
  | 'triggeredBy'
  | NotificationRecipientResultKeySpecifier
)[];
export type NotificationRecipientResultFieldPolicy = {
  emailRecipients?: FieldPolicy<any> | FieldReadFunction<any>;
  inAppRecipients?: FieldPolicy<any> | FieldReadFunction<any>;
  triggeredBy?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type OrganizationKeySpecifier = (
  | 'account'
  | 'agent'
  | 'authorization'
  | 'contactEmail'
  | 'createdDate'
  | 'domain'
  | 'group'
  | 'groups'
  | 'id'
  | 'legalEntityName'
  | 'metrics'
  | 'nameID'
  | 'profile'
  | 'roleSet'
  | 'settings'
  | 'storageAggregator'
  | 'updatedDate'
  | 'verification'
  | 'website'
  | OrganizationKeySpecifier
)[];
export type OrganizationFieldPolicy = {
  account?: FieldPolicy<any> | FieldReadFunction<any>;
  agent?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  contactEmail?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  domain?: FieldPolicy<any> | FieldReadFunction<any>;
  group?: FieldPolicy<any> | FieldReadFunction<any>;
  groups?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  legalEntityName?: FieldPolicy<any> | FieldReadFunction<any>;
  metrics?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  roleSet?: FieldPolicy<any> | FieldReadFunction<any>;
  settings?: FieldPolicy<any> | FieldReadFunction<any>;
  storageAggregator?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  verification?: FieldPolicy<any> | FieldReadFunction<any>;
  website?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type OrganizationSettingsKeySpecifier = ('membership' | 'privacy' | OrganizationSettingsKeySpecifier)[];
export type OrganizationSettingsFieldPolicy = {
  membership?: FieldPolicy<any> | FieldReadFunction<any>;
  privacy?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type OrganizationSettingsMembershipKeySpecifier = (
  | 'allowUsersMatchingDomainToJoin'
  | OrganizationSettingsMembershipKeySpecifier
)[];
export type OrganizationSettingsMembershipFieldPolicy = {
  allowUsersMatchingDomainToJoin?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type OrganizationSettingsPrivacyKeySpecifier = (
  | 'contributionRolesPubliclyVisible'
  | OrganizationSettingsPrivacyKeySpecifier
)[];
export type OrganizationSettingsPrivacyFieldPolicy = {
  contributionRolesPubliclyVisible?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type OrganizationVerificationKeySpecifier = (
  | 'authorization'
  | 'createdDate'
  | 'id'
  | 'isFinalized'
  | 'lifecycle'
  | 'nextEvents'
  | 'state'
  | 'status'
  | 'updatedDate'
  | OrganizationVerificationKeySpecifier
)[];
export type OrganizationVerificationFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  isFinalized?: FieldPolicy<any> | FieldReadFunction<any>;
  lifecycle?: FieldPolicy<any> | FieldReadFunction<any>;
  nextEvents?: FieldPolicy<any> | FieldReadFunction<any>;
  state?: FieldPolicy<any> | FieldReadFunction<any>;
  status?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type OrganizationsInRolesResponseKeySpecifier = (
  | 'organizations'
  | 'role'
  | OrganizationsInRolesResponseKeySpecifier
)[];
export type OrganizationsInRolesResponseFieldPolicy = {
  organizations?: FieldPolicy<any> | FieldReadFunction<any>;
  role?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type PaginatedInAppNotificationsKeySpecifier = (
  | 'inAppNotifications'
  | 'pageInfo'
  | 'total'
  | PaginatedInAppNotificationsKeySpecifier
)[];
export type PaginatedInAppNotificationsFieldPolicy = {
  inAppNotifications?: FieldPolicy<any> | FieldReadFunction<any>;
  pageInfo?: FieldPolicy<any> | FieldReadFunction<any>;
  total?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type PaginatedVirtualContributorKeySpecifier = (
  | 'pageInfo'
  | 'total'
  | 'virtualContributors'
  | PaginatedVirtualContributorKeySpecifier
)[];
export type PaginatedVirtualContributorFieldPolicy = {
  pageInfo?: FieldPolicy<any> | FieldReadFunction<any>;
  total?: FieldPolicy<any> | FieldReadFunction<any>;
  virtualContributors?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'licensingFramework'
  | 'metadata'
  | 'roleSet'
  | 'settings'
  | 'storageAggregator'
  | 'templatesManager'
  | 'updatedDate'
  | 'wellKnownVirtualContributors'
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
  licensingFramework?: FieldPolicy<any> | FieldReadFunction<any>;
  metadata?: FieldPolicy<any> | FieldReadFunction<any>;
  roleSet?: FieldPolicy<any> | FieldReadFunction<any>;
  settings?: FieldPolicy<any> | FieldReadFunction<any>;
  storageAggregator?: FieldPolicy<any> | FieldReadFunction<any>;
  templatesManager?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  wellKnownVirtualContributors?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PlatformAccessRoleKeySpecifier = ('grantedPrivileges' | 'roleName' | PlatformAccessRoleKeySpecifier)[];
export type PlatformAccessRoleFieldPolicy = {
  grantedPrivileges?: FieldPolicy<any> | FieldReadFunction<any>;
  roleName?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PlatformAdminCommunicationQueryResultsKeySpecifier = (
  | 'adminCommunicationMembership'
  | 'adminCommunicationOrphanedUsage'
  | PlatformAdminCommunicationQueryResultsKeySpecifier
)[];
export type PlatformAdminCommunicationQueryResultsFieldPolicy = {
  adminCommunicationMembership?: FieldPolicy<any> | FieldReadFunction<any>;
  adminCommunicationOrphanedUsage?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PlatformAdminIdentityQueryResultsKeySpecifier = (
  | 'identities'
  | PlatformAdminIdentityQueryResultsKeySpecifier
)[];
export type PlatformAdminIdentityQueryResultsFieldPolicy = {
  identities?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PlatformAdminQueryResultsKeySpecifier = (
  | 'communication'
  | 'identity'
  | 'innovationHubs'
  | 'innovationPacks'
  | 'organizations'
  | 'spaces'
  | 'users'
  | 'virtualContributors'
  | PlatformAdminQueryResultsKeySpecifier
)[];
export type PlatformAdminQueryResultsFieldPolicy = {
  communication?: FieldPolicy<any> | FieldReadFunction<any>;
  identity?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationHubs?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationPacks?: FieldPolicy<any> | FieldReadFunction<any>;
  organizations?: FieldPolicy<any> | FieldReadFunction<any>;
  spaces?: FieldPolicy<any> | FieldReadFunction<any>;
  users?: FieldPolicy<any> | FieldReadFunction<any>;
  virtualContributors?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PlatformFeatureFlagKeySpecifier = ('enabled' | 'name' | PlatformFeatureFlagKeySpecifier)[];
export type PlatformFeatureFlagFieldPolicy = {
  enabled?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PlatformIntegrationSettingsKeySpecifier = (
  | 'iframeAllowedUrls'
  | 'notificationEmailBlacklist'
  | PlatformIntegrationSettingsKeySpecifier
)[];
export type PlatformIntegrationSettingsFieldPolicy = {
  iframeAllowedUrls?: FieldPolicy<any> | FieldReadFunction<any>;
  notificationEmailBlacklist?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'roleSetExtraRoles'
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
  roleSetExtraRoles?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type PlatformRolesAccessKeySpecifier = ('roles' | PlatformRolesAccessKeySpecifier)[];
export type PlatformRolesAccessFieldPolicy = {
  roles?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PlatformSettingsKeySpecifier = ('integration' | PlatformSettingsKeySpecifier)[];
export type PlatformSettingsFieldPolicy = {
  integration?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PlatformWellKnownVirtualContributorMappingKeySpecifier = (
  | 'virtualContributorID'
  | 'wellKnown'
  | PlatformWellKnownVirtualContributorMappingKeySpecifier
)[];
export type PlatformWellKnownVirtualContributorMappingFieldPolicy = {
  virtualContributorID?: FieldPolicy<any> | FieldReadFunction<any>;
  wellKnown?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PlatformWellKnownVirtualContributorsKeySpecifier = (
  | 'mappings'
  | PlatformWellKnownVirtualContributorsKeySpecifier
)[];
export type PlatformWellKnownVirtualContributorsFieldPolicy = {
  mappings?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type PromptGraphKeySpecifier = ('edges' | 'end' | 'nodes' | 'start' | 'state' | PromptGraphKeySpecifier)[];
export type PromptGraphFieldPolicy = {
  edges?: FieldPolicy<any> | FieldReadFunction<any>;
  end?: FieldPolicy<any> | FieldReadFunction<any>;
  nodes?: FieldPolicy<any> | FieldReadFunction<any>;
  start?: FieldPolicy<any> | FieldReadFunction<any>;
  state?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PromptGraphDataPointKeySpecifier = (
  | 'description'
  | 'items'
  | 'name'
  | 'optional'
  | 'type'
  | PromptGraphDataPointKeySpecifier
)[];
export type PromptGraphDataPointFieldPolicy = {
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  items?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  optional?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PromptGraphDataStructKeySpecifier = ('properties' | 'title' | 'type' | PromptGraphDataStructKeySpecifier)[];
export type PromptGraphDataStructFieldPolicy = {
  properties?: FieldPolicy<any> | FieldReadFunction<any>;
  title?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PromptGraphDefinitionKeySpecifier = (
  | 'edges'
  | 'end'
  | 'nodes'
  | 'start'
  | 'state'
  | PromptGraphDefinitionKeySpecifier
)[];
export type PromptGraphDefinitionFieldPolicy = {
  edges?: FieldPolicy<any> | FieldReadFunction<any>;
  end?: FieldPolicy<any> | FieldReadFunction<any>;
  nodes?: FieldPolicy<any> | FieldReadFunction<any>;
  start?: FieldPolicy<any> | FieldReadFunction<any>;
  state?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PromptGraphDefinitionDataPointKeySpecifier = (
  | 'description'
  | 'name'
  | 'optional'
  | 'type'
  | PromptGraphDefinitionDataPointKeySpecifier
)[];
export type PromptGraphDefinitionDataPointFieldPolicy = {
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  optional?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PromptGraphDefinitionDataStructKeySpecifier = (
  | 'properties'
  | 'title'
  | 'type'
  | PromptGraphDefinitionDataStructKeySpecifier
)[];
export type PromptGraphDefinitionDataStructFieldPolicy = {
  properties?: FieldPolicy<any> | FieldReadFunction<any>;
  title?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PromptGraphDefinitionEdgeKeySpecifier = ('from' | 'to' | PromptGraphDefinitionEdgeKeySpecifier)[];
export type PromptGraphDefinitionEdgeFieldPolicy = {
  from?: FieldPolicy<any> | FieldReadFunction<any>;
  to?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PromptGraphDefinitionNodeKeySpecifier = (
  | 'input_variables'
  | 'name'
  | 'output'
  | 'prompt'
  | 'system'
  | PromptGraphDefinitionNodeKeySpecifier
)[];
export type PromptGraphDefinitionNodeFieldPolicy = {
  input_variables?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  output?: FieldPolicy<any> | FieldReadFunction<any>;
  prompt?: FieldPolicy<any> | FieldReadFunction<any>;
  system?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PromptGraphEdgeKeySpecifier = ('from' | 'to' | PromptGraphEdgeKeySpecifier)[];
export type PromptGraphEdgeFieldPolicy = {
  from?: FieldPolicy<any> | FieldReadFunction<any>;
  to?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PromptGraphNodeKeySpecifier = (
  | 'input_variables'
  | 'name'
  | 'output'
  | 'prompt'
  | 'system'
  | PromptGraphNodeKeySpecifier
)[];
export type PromptGraphNodeFieldPolicy = {
  input_variables?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  output?: FieldPolicy<any> | FieldReadFunction<any>;
  prompt?: FieldPolicy<any> | FieldReadFunction<any>;
  system?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PruneInAppNotificationAdminResultKeySpecifier = (
  | 'removedCountExceedingUserLimit'
  | 'removedCountOutsideRetentionPeriod'
  | PruneInAppNotificationAdminResultKeySpecifier
)[];
export type PruneInAppNotificationAdminResultFieldPolicy = {
  removedCountExceedingUserLimit?: FieldPolicy<any> | FieldReadFunction<any>;
  removedCountOutsideRetentionPeriod?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type QueryKeySpecifier = (
  | 'accounts'
  | 'activityFeed'
  | 'activityFeedGrouped'
  | 'activityLogOnCollaboration'
  | 'adminIdentitiesUnverified'
  | 'aiServer'
  | 'exploreSpaces'
  | 'getSupportedVerifiedCredentialMetadata'
  | 'inputCreator'
  | 'lookup'
  | 'lookupByName'
  | 'me'
  | 'notificationRecipients'
  | 'organization'
  | 'organizations'
  | 'organizationsPaginated'
  | 'platform'
  | 'platformAdmin'
  | 'restrictedSpaceNames'
  | 'rolesOrganization'
  | 'rolesUser'
  | 'rolesVirtualContributor'
  | 'search'
  | 'spaces'
  | 'spacesPaginated'
  | 'task'
  | 'tasks'
  | 'urlResolver'
  | 'user'
  | 'users'
  | 'usersPaginated'
  | 'usersWithAuthorizationCredential'
  | 'virtualContributor'
  | 'virtualContributors'
  | QueryKeySpecifier
)[];
export type QueryFieldPolicy = {
  accounts?: FieldPolicy<any> | FieldReadFunction<any>;
  activityFeed?: FieldPolicy<any> | FieldReadFunction<any>;
  activityFeedGrouped?: FieldPolicy<any> | FieldReadFunction<any>;
  activityLogOnCollaboration?: FieldPolicy<any> | FieldReadFunction<any>;
  adminIdentitiesUnverified?: FieldPolicy<any> | FieldReadFunction<any>;
  aiServer?: FieldPolicy<any> | FieldReadFunction<any>;
  exploreSpaces?: FieldPolicy<any> | FieldReadFunction<any>;
  getSupportedVerifiedCredentialMetadata?: FieldPolicy<any> | FieldReadFunction<any>;
  inputCreator?: FieldPolicy<any> | FieldReadFunction<any>;
  lookup?: FieldPolicy<any> | FieldReadFunction<any>;
  lookupByName?: FieldPolicy<any> | FieldReadFunction<any>;
  me?: FieldPolicy<any> | FieldReadFunction<any>;
  notificationRecipients?: FieldPolicy<any> | FieldReadFunction<any>;
  organization?: FieldPolicy<any> | FieldReadFunction<any>;
  organizations?: FieldPolicy<any> | FieldReadFunction<any>;
  organizationsPaginated?: FieldPolicy<any> | FieldReadFunction<any>;
  platform?: FieldPolicy<any> | FieldReadFunction<any>;
  platformAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  restrictedSpaceNames?: FieldPolicy<any> | FieldReadFunction<any>;
  rolesOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  rolesUser?: FieldPolicy<any> | FieldReadFunction<any>;
  rolesVirtualContributor?: FieldPolicy<any> | FieldReadFunction<any>;
  search?: FieldPolicy<any> | FieldReadFunction<any>;
  spaces?: FieldPolicy<any> | FieldReadFunction<any>;
  spacesPaginated?: FieldPolicy<any> | FieldReadFunction<any>;
  task?: FieldPolicy<any> | FieldReadFunction<any>;
  tasks?: FieldPolicy<any> | FieldReadFunction<any>;
  urlResolver?: FieldPolicy<any> | FieldReadFunction<any>;
  user?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'about'
  | 'account'
  | 'activeSubscription'
  | 'agent'
  | 'authorization'
  | 'collaboration'
  | 'community'
  | 'createdDate'
  | 'id'
  | 'level'
  | 'levelZeroSpaceID'
  | 'license'
  | 'nameID'
  | 'platformAccess'
  | 'settings'
  | 'storageAggregator'
  | 'subscriptions'
  | 'subspaceByNameID'
  | 'subspaces'
  | 'templatesManager'
  | 'updatedDate'
  | 'visibility'
  | RelayPaginatedSpaceKeySpecifier
)[];
export type RelayPaginatedSpaceFieldPolicy = {
  about?: FieldPolicy<any> | FieldReadFunction<any>;
  account?: FieldPolicy<any> | FieldReadFunction<any>;
  activeSubscription?: FieldPolicy<any> | FieldReadFunction<any>;
  agent?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  collaboration?: FieldPolicy<any> | FieldReadFunction<any>;
  community?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  level?: FieldPolicy<any> | FieldReadFunction<any>;
  levelZeroSpaceID?: FieldPolicy<any> | FieldReadFunction<any>;
  license?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  platformAccess?: FieldPolicy<any> | FieldReadFunction<any>;
  settings?: FieldPolicy<any> | FieldReadFunction<any>;
  storageAggregator?: FieldPolicy<any> | FieldReadFunction<any>;
  subscriptions?: FieldPolicy<any> | FieldReadFunction<any>;
  subspaceByNameID?: FieldPolicy<any> | FieldReadFunction<any>;
  subspaces?: FieldPolicy<any> | FieldReadFunction<any>;
  templatesManager?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'name'
  | 'organizationPolicy'
  | 'parentCredentials'
  | 'requiresEntryRole'
  | 'requiresSameRoleInParentRoleSet'
  | 'updatedDate'
  | 'userPolicy'
  | 'virtualContributorPolicy'
  | RoleKeySpecifier
)[];
export type RoleFieldPolicy = {
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  credential?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  organizationPolicy?: FieldPolicy<any> | FieldReadFunction<any>;
  parentCredentials?: FieldPolicy<any> | FieldReadFunction<any>;
  requiresEntryRole?: FieldPolicy<any> | FieldReadFunction<any>;
  requiresSameRoleInParentRoleSet?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  userPolicy?: FieldPolicy<any> | FieldReadFunction<any>;
  virtualContributorPolicy?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type RoleSetKeySpecifier = (
  | 'applicationForm'
  | 'applications'
  | 'authorization'
  | 'availableUsersForElevatedRole'
  | 'availableUsersForEntryRole'
  | 'availableVirtualContributorsForEntryRole'
  | 'createdDate'
  | 'entryRoleName'
  | 'id'
  | 'invitations'
  | 'license'
  | 'myMembershipStatus'
  | 'myRoles'
  | 'myRolesImplicit'
  | 'organizationsInRole'
  | 'organizationsInRoles'
  | 'platformInvitations'
  | 'roleDefinition'
  | 'roleDefinitions'
  | 'roleNames'
  | 'type'
  | 'updatedDate'
  | 'usersInRole'
  | 'usersInRoles'
  | 'virtualContributorsInRole'
  | 'virtualContributorsInRoleInHierarchy'
  | 'virtualContributorsInRoles'
  | RoleSetKeySpecifier
)[];
export type RoleSetFieldPolicy = {
  applicationForm?: FieldPolicy<any> | FieldReadFunction<any>;
  applications?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  availableUsersForElevatedRole?: FieldPolicy<any> | FieldReadFunction<any>;
  availableUsersForEntryRole?: FieldPolicy<any> | FieldReadFunction<any>;
  availableVirtualContributorsForEntryRole?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  entryRoleName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  invitations?: FieldPolicy<any> | FieldReadFunction<any>;
  license?: FieldPolicy<any> | FieldReadFunction<any>;
  myMembershipStatus?: FieldPolicy<any> | FieldReadFunction<any>;
  myRoles?: FieldPolicy<any> | FieldReadFunction<any>;
  myRolesImplicit?: FieldPolicy<any> | FieldReadFunction<any>;
  organizationsInRole?: FieldPolicy<any> | FieldReadFunction<any>;
  organizationsInRoles?: FieldPolicy<any> | FieldReadFunction<any>;
  platformInvitations?: FieldPolicy<any> | FieldReadFunction<any>;
  roleDefinition?: FieldPolicy<any> | FieldReadFunction<any>;
  roleDefinitions?: FieldPolicy<any> | FieldReadFunction<any>;
  roleNames?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  usersInRole?: FieldPolicy<any> | FieldReadFunction<any>;
  usersInRoles?: FieldPolicy<any> | FieldReadFunction<any>;
  virtualContributorsInRole?: FieldPolicy<any> | FieldReadFunction<any>;
  virtualContributorsInRoleInHierarchy?: FieldPolicy<any> | FieldReadFunction<any>;
  virtualContributorsInRoles?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type RoleSetInvitationResultKeySpecifier = (
  | 'invitation'
  | 'platformInvitation'
  | 'type'
  | RoleSetInvitationResultKeySpecifier
)[];
export type RoleSetInvitationResultFieldPolicy = {
  invitation?: FieldPolicy<any> | FieldReadFunction<any>;
  platformInvitation?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | RolesResultCommunityKeySpecifier
)[];
export type RolesResultCommunityFieldPolicy = {
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  level?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  roles?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'about'
  | 'account'
  | 'activeSubscription'
  | 'agent'
  | 'authorization'
  | 'collaboration'
  | 'community'
  | 'createdDate'
  | 'id'
  | 'level'
  | 'levelZeroSpaceID'
  | 'license'
  | 'nameID'
  | 'platformAccess'
  | 'settings'
  | 'storageAggregator'
  | 'subscriptions'
  | 'subspaceByNameID'
  | 'subspaces'
  | 'templatesManager'
  | 'updatedDate'
  | 'visibility'
  | SpaceKeySpecifier
)[];
export type SpaceFieldPolicy = {
  about?: FieldPolicy<any> | FieldReadFunction<any>;
  account?: FieldPolicy<any> | FieldReadFunction<any>;
  activeSubscription?: FieldPolicy<any> | FieldReadFunction<any>;
  agent?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  collaboration?: FieldPolicy<any> | FieldReadFunction<any>;
  community?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  level?: FieldPolicy<any> | FieldReadFunction<any>;
  levelZeroSpaceID?: FieldPolicy<any> | FieldReadFunction<any>;
  license?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  platformAccess?: FieldPolicy<any> | FieldReadFunction<any>;
  settings?: FieldPolicy<any> | FieldReadFunction<any>;
  storageAggregator?: FieldPolicy<any> | FieldReadFunction<any>;
  subscriptions?: FieldPolicy<any> | FieldReadFunction<any>;
  subspaceByNameID?: FieldPolicy<any> | FieldReadFunction<any>;
  subspaces?: FieldPolicy<any> | FieldReadFunction<any>;
  templatesManager?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  visibility?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SpaceAboutKeySpecifier = (
  | 'authorization'
  | 'createdDate'
  | 'guidelines'
  | 'id'
  | 'isContentPublic'
  | 'membership'
  | 'metrics'
  | 'profile'
  | 'provider'
  | 'updatedDate'
  | 'who'
  | 'why'
  | SpaceAboutKeySpecifier
)[];
export type SpaceAboutFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  guidelines?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  isContentPublic?: FieldPolicy<any> | FieldReadFunction<any>;
  membership?: FieldPolicy<any> | FieldReadFunction<any>;
  metrics?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  provider?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  who?: FieldPolicy<any> | FieldReadFunction<any>;
  why?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SpaceAboutMembershipKeySpecifier = (
  | 'applicationForm'
  | 'communityID'
  | 'leadOrganizations'
  | 'leadUsers'
  | 'myMembershipStatus'
  | 'myPrivileges'
  | 'roleSetID'
  | SpaceAboutMembershipKeySpecifier
)[];
export type SpaceAboutMembershipFieldPolicy = {
  applicationForm?: FieldPolicy<any> | FieldReadFunction<any>;
  communityID?: FieldPolicy<any> | FieldReadFunction<any>;
  leadOrganizations?: FieldPolicy<any> | FieldReadFunction<any>;
  leadUsers?: FieldPolicy<any> | FieldReadFunction<any>;
  myMembershipStatus?: FieldPolicy<any> | FieldReadFunction<any>;
  myPrivileges?: FieldPolicy<any> | FieldReadFunction<any>;
  roleSetID?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SpacePendingMembershipInfoKeySpecifier = (
  | 'about'
  | 'communityGuidelines'
  | 'id'
  | 'level'
  | SpacePendingMembershipInfoKeySpecifier
)[];
export type SpacePendingMembershipInfoFieldPolicy = {
  about?: FieldPolicy<any> | FieldReadFunction<any>;
  communityGuidelines?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  level?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SpaceSettingsKeySpecifier = ('collaboration' | 'membership' | 'privacy' | SpaceSettingsKeySpecifier)[];
export type SpaceSettingsFieldPolicy = {
  collaboration?: FieldPolicy<any> | FieldReadFunction<any>;
  membership?: FieldPolicy<any> | FieldReadFunction<any>;
  privacy?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SpaceSettingsCollaborationKeySpecifier = (
  | 'allowEventsFromSubspaces'
  | 'allowMembersToCreateCallouts'
  | 'allowMembersToCreateSubspaces'
  | 'allowMembersToVideoCall'
  | 'inheritMembershipRights'
  | SpaceSettingsCollaborationKeySpecifier
)[];
export type SpaceSettingsCollaborationFieldPolicy = {
  allowEventsFromSubspaces?: FieldPolicy<any> | FieldReadFunction<any>;
  allowMembersToCreateCallouts?: FieldPolicy<any> | FieldReadFunction<any>;
  allowMembersToCreateSubspaces?: FieldPolicy<any> | FieldReadFunction<any>;
  allowMembersToVideoCall?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'inAppNotificationReceived'
  | 'notificationsUnreadCount'
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
  inAppNotificationReceived?: FieldPolicy<any> | FieldReadFunction<any>;
  notificationsUnreadCount?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'communityGuidelines'
  | 'contentSpace'
  | 'createdDate'
  | 'id'
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
  communityGuidelines?: FieldPolicy<any> | FieldReadFunction<any>;
  contentSpace?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  postDefaultDescription?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  whiteboard?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type TemplateContentSpaceKeySpecifier = (
  | 'about'
  | 'authorization'
  | 'collaboration'
  | 'createdDate'
  | 'id'
  | 'level'
  | 'settings'
  | 'subspaces'
  | 'updatedDate'
  | TemplateContentSpaceKeySpecifier
)[];
export type TemplateContentSpaceFieldPolicy = {
  about?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  collaboration?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  level?: FieldPolicy<any> | FieldReadFunction<any>;
  settings?: FieldPolicy<any> | FieldReadFunction<any>;
  subspaces?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type TemplateDefaultKeySpecifier = (
  | 'allowedTemplateType'
  | 'authorization'
  | 'createdDate'
  | 'id'
  | 'template'
  | 'type'
  | 'updatedDate'
  | TemplateDefaultKeySpecifier
)[];
export type TemplateDefaultFieldPolicy = {
  allowedTemplateType?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  template?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type TemplateResultKeySpecifier = ('innovationPack' | 'template' | TemplateResultKeySpecifier)[];
export type TemplateResultFieldPolicy = {
  innovationPack?: FieldPolicy<any> | FieldReadFunction<any>;
  template?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type TemplatesManagerKeySpecifier = (
  | 'authorization'
  | 'createdDate'
  | 'id'
  | 'templateDefaults'
  | 'templatesSet'
  | 'updatedDate'
  | TemplatesManagerKeySpecifier
)[];
export type TemplatesManagerFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  templateDefaults?: FieldPolicy<any> | FieldReadFunction<any>;
  templatesSet?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type TemplatesSetKeySpecifier = (
  | 'authorization'
  | 'calloutTemplates'
  | 'calloutTemplatesCount'
  | 'communityGuidelinesTemplates'
  | 'communityGuidelinesTemplatesCount'
  | 'createdDate'
  | 'id'
  | 'postTemplates'
  | 'postTemplatesCount'
  | 'spaceTemplates'
  | 'spaceTemplatesCount'
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
  postTemplates?: FieldPolicy<any> | FieldReadFunction<any>;
  postTemplatesCount?: FieldPolicy<any> | FieldReadFunction<any>;
  spaceTemplates?: FieldPolicy<any> | FieldReadFunction<any>;
  spaceTemplatesCount?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type UrlResolverQueryResultCalendarKeySpecifier = (
  | 'calendarEventId'
  | 'id'
  | UrlResolverQueryResultCalendarKeySpecifier
)[];
export type UrlResolverQueryResultCalendarFieldPolicy = {
  calendarEventId?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UrlResolverQueryResultCalloutsSetKeySpecifier = (
  | 'calloutId'
  | 'contributionId'
  | 'id'
  | 'memoId'
  | 'postId'
  | 'type'
  | 'whiteboardId'
  | UrlResolverQueryResultCalloutsSetKeySpecifier
)[];
export type UrlResolverQueryResultCalloutsSetFieldPolicy = {
  calloutId?: FieldPolicy<any> | FieldReadFunction<any>;
  contributionId?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  memoId?: FieldPolicy<any> | FieldReadFunction<any>;
  postId?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  whiteboardId?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UrlResolverQueryResultCollaborationKeySpecifier = (
  | 'calloutsSet'
  | 'id'
  | UrlResolverQueryResultCollaborationKeySpecifier
)[];
export type UrlResolverQueryResultCollaborationFieldPolicy = {
  calloutsSet?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UrlResolverQueryResultInnovationPackKeySpecifier = (
  | 'id'
  | 'templatesSet'
  | UrlResolverQueryResultInnovationPackKeySpecifier
)[];
export type UrlResolverQueryResultInnovationPackFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  templatesSet?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UrlResolverQueryResultSpaceKeySpecifier = (
  | 'calendar'
  | 'collaboration'
  | 'id'
  | 'level'
  | 'levelZeroSpaceID'
  | 'parentSpaces'
  | 'templatesSet'
  | UrlResolverQueryResultSpaceKeySpecifier
)[];
export type UrlResolverQueryResultSpaceFieldPolicy = {
  calendar?: FieldPolicy<any> | FieldReadFunction<any>;
  collaboration?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  level?: FieldPolicy<any> | FieldReadFunction<any>;
  levelZeroSpaceID?: FieldPolicy<any> | FieldReadFunction<any>;
  parentSpaces?: FieldPolicy<any> | FieldReadFunction<any>;
  templatesSet?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UrlResolverQueryResultTemplatesSetKeySpecifier = (
  | 'id'
  | 'templateId'
  | UrlResolverQueryResultTemplatesSetKeySpecifier
)[];
export type UrlResolverQueryResultTemplatesSetFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  templateId?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UrlResolverQueryResultVirtualContributorKeySpecifier = (
  | 'calloutsSet'
  | 'id'
  | UrlResolverQueryResultVirtualContributorKeySpecifier
)[];
export type UrlResolverQueryResultVirtualContributorFieldPolicy = {
  calloutsSet?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UrlResolverQueryResultsKeySpecifier = (
  | 'discussionId'
  | 'innovationHubId'
  | 'innovationPack'
  | 'organizationId'
  | 'space'
  | 'type'
  | 'userId'
  | 'virtualContributor'
  | UrlResolverQueryResultsKeySpecifier
)[];
export type UrlResolverQueryResultsFieldPolicy = {
  discussionId?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationHubId?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationPack?: FieldPolicy<any> | FieldReadFunction<any>;
  organizationId?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  userId?: FieldPolicy<any> | FieldReadFunction<any>;
  virtualContributor?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UserKeySpecifier = (
  | 'account'
  | 'accountUpn'
  | 'agent'
  | 'authentication'
  | 'authorization'
  | 'createdDate'
  | 'email'
  | 'firstName'
  | 'id'
  | 'isContactable'
  | 'lastName'
  | 'nameID'
  | 'phone'
  | 'profile'
  | 'settings'
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
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  email?: FieldPolicy<any> | FieldReadFunction<any>;
  firstName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  isContactable?: FieldPolicy<any> | FieldReadFunction<any>;
  lastName?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  phone?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  settings?: FieldPolicy<any> | FieldReadFunction<any>;
  storageAggregator?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UserAuthenticationResultKeySpecifier = (
  | 'authenticatedAt'
  | 'createdAt'
  | 'methods'
  | UserAuthenticationResultKeySpecifier
)[];
export type UserAuthenticationResultFieldPolicy = {
  authenticatedAt?: FieldPolicy<any> | FieldReadFunction<any>;
  createdAt?: FieldPolicy<any> | FieldReadFunction<any>;
  methods?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type UserSettingsKeySpecifier = (
  | 'authorization'
  | 'communication'
  | 'createdDate'
  | 'id'
  | 'notification'
  | 'privacy'
  | 'updatedDate'
  | UserSettingsKeySpecifier
)[];
export type UserSettingsFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  communication?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  notification?: FieldPolicy<any> | FieldReadFunction<any>;
  privacy?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UserSettingsCommunicationKeySpecifier = (
  | 'allowOtherUsersToSendMessages'
  | UserSettingsCommunicationKeySpecifier
)[];
export type UserSettingsCommunicationFieldPolicy = {
  allowOtherUsersToSendMessages?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UserSettingsNotificationKeySpecifier = (
  | 'organization'
  | 'platform'
  | 'space'
  | 'user'
  | 'virtualContributor'
  | UserSettingsNotificationKeySpecifier
)[];
export type UserSettingsNotificationFieldPolicy = {
  organization?: FieldPolicy<any> | FieldReadFunction<any>;
  platform?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  user?: FieldPolicy<any> | FieldReadFunction<any>;
  virtualContributor?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UserSettingsNotificationChannelsKeySpecifier = (
  | 'email'
  | 'inApp'
  | UserSettingsNotificationChannelsKeySpecifier
)[];
export type UserSettingsNotificationChannelsFieldPolicy = {
  email?: FieldPolicy<any> | FieldReadFunction<any>;
  inApp?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UserSettingsNotificationOrganizationKeySpecifier = (
  | 'adminMentioned'
  | 'adminMessageReceived'
  | UserSettingsNotificationOrganizationKeySpecifier
)[];
export type UserSettingsNotificationOrganizationFieldPolicy = {
  adminMentioned?: FieldPolicy<any> | FieldReadFunction<any>;
  adminMessageReceived?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UserSettingsNotificationPlatformKeySpecifier = (
  | 'admin'
  | 'forumDiscussionComment'
  | 'forumDiscussionCreated'
  | UserSettingsNotificationPlatformKeySpecifier
)[];
export type UserSettingsNotificationPlatformFieldPolicy = {
  admin?: FieldPolicy<any> | FieldReadFunction<any>;
  forumDiscussionComment?: FieldPolicy<any> | FieldReadFunction<any>;
  forumDiscussionCreated?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UserSettingsNotificationPlatformAdminKeySpecifier = (
  | 'spaceCreated'
  | 'userGlobalRoleChanged'
  | 'userProfileCreated'
  | 'userProfileRemoved'
  | UserSettingsNotificationPlatformAdminKeySpecifier
)[];
export type UserSettingsNotificationPlatformAdminFieldPolicy = {
  spaceCreated?: FieldPolicy<any> | FieldReadFunction<any>;
  userGlobalRoleChanged?: FieldPolicy<any> | FieldReadFunction<any>;
  userProfileCreated?: FieldPolicy<any> | FieldReadFunction<any>;
  userProfileRemoved?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UserSettingsNotificationSpaceKeySpecifier = (
  | 'admin'
  | 'collaborationCalloutComment'
  | 'collaborationCalloutContributionCreated'
  | 'collaborationCalloutPostContributionComment'
  | 'collaborationCalloutPublished'
  | 'communicationUpdates'
  | 'communityCalendarEvents'
  | UserSettingsNotificationSpaceKeySpecifier
)[];
export type UserSettingsNotificationSpaceFieldPolicy = {
  admin?: FieldPolicy<any> | FieldReadFunction<any>;
  collaborationCalloutComment?: FieldPolicy<any> | FieldReadFunction<any>;
  collaborationCalloutContributionCreated?: FieldPolicy<any> | FieldReadFunction<any>;
  collaborationCalloutPostContributionComment?: FieldPolicy<any> | FieldReadFunction<any>;
  collaborationCalloutPublished?: FieldPolicy<any> | FieldReadFunction<any>;
  communicationUpdates?: FieldPolicy<any> | FieldReadFunction<any>;
  communityCalendarEvents?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UserSettingsNotificationSpaceAdminKeySpecifier = (
  | 'collaborationCalloutContributionCreated'
  | 'communicationMessageReceived'
  | 'communityApplicationReceived'
  | 'communityNewMember'
  | UserSettingsNotificationSpaceAdminKeySpecifier
)[];
export type UserSettingsNotificationSpaceAdminFieldPolicy = {
  collaborationCalloutContributionCreated?: FieldPolicy<any> | FieldReadFunction<any>;
  communicationMessageReceived?: FieldPolicy<any> | FieldReadFunction<any>;
  communityApplicationReceived?: FieldPolicy<any> | FieldReadFunction<any>;
  communityNewMember?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UserSettingsNotificationUserKeySpecifier = (
  | 'commentReply'
  | 'membership'
  | 'mentioned'
  | 'messageReceived'
  | UserSettingsNotificationUserKeySpecifier
)[];
export type UserSettingsNotificationUserFieldPolicy = {
  commentReply?: FieldPolicy<any> | FieldReadFunction<any>;
  membership?: FieldPolicy<any> | FieldReadFunction<any>;
  mentioned?: FieldPolicy<any> | FieldReadFunction<any>;
  messageReceived?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UserSettingsNotificationUserMembershipKeySpecifier = (
  | 'spaceCommunityInvitationReceived'
  | 'spaceCommunityJoined'
  | UserSettingsNotificationUserMembershipKeySpecifier
)[];
export type UserSettingsNotificationUserMembershipFieldPolicy = {
  spaceCommunityInvitationReceived?: FieldPolicy<any> | FieldReadFunction<any>;
  spaceCommunityJoined?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UserSettingsNotificationVirtualContributorKeySpecifier = (
  | 'adminSpaceCommunityInvitation'
  | UserSettingsNotificationVirtualContributorKeySpecifier
)[];
export type UserSettingsNotificationVirtualContributorFieldPolicy = {
  adminSpaceCommunityInvitation?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UserSettingsPrivacyKeySpecifier = ('contributionRolesPubliclyVisible' | UserSettingsPrivacyKeySpecifier)[];
export type UserSettingsPrivacyFieldPolicy = {
  contributionRolesPubliclyVisible?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UsersInRolesResponseKeySpecifier = ('role' | 'users' | UsersInRolesResponseKeySpecifier)[];
export type UsersInRolesResponseFieldPolicy = {
  role?: FieldPolicy<any> | FieldReadFunction<any>;
  users?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'bodyOfKnowledgeDescription'
  | 'bodyOfKnowledgeID'
  | 'bodyOfKnowledgeType'
  | 'createdDate'
  | 'dataAccessMode'
  | 'engine'
  | 'id'
  | 'interactionModes'
  | 'knowledgeBase'
  | 'knowledgeSpace'
  | 'listedInStore'
  | 'modelCard'
  | 'nameID'
  | 'profile'
  | 'promptGraphDefinition'
  | 'provider'
  | 'searchVisibility'
  | 'settings'
  | 'status'
  | 'updatedDate'
  | VirtualContributorKeySpecifier
)[];
export type VirtualContributorFieldPolicy = {
  account?: FieldPolicy<any> | FieldReadFunction<any>;
  agent?: FieldPolicy<any> | FieldReadFunction<any>;
  aiPersona?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  bodyOfKnowledgeDescription?: FieldPolicy<any> | FieldReadFunction<any>;
  bodyOfKnowledgeID?: FieldPolicy<any> | FieldReadFunction<any>;
  bodyOfKnowledgeType?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  dataAccessMode?: FieldPolicy<any> | FieldReadFunction<any>;
  engine?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  interactionModes?: FieldPolicy<any> | FieldReadFunction<any>;
  knowledgeBase?: FieldPolicy<any> | FieldReadFunction<any>;
  knowledgeSpace?: FieldPolicy<any> | FieldReadFunction<any>;
  listedInStore?: FieldPolicy<any> | FieldReadFunction<any>;
  modelCard?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  promptGraphDefinition?: FieldPolicy<any> | FieldReadFunction<any>;
  provider?: FieldPolicy<any> | FieldReadFunction<any>;
  searchVisibility?: FieldPolicy<any> | FieldReadFunction<any>;
  settings?: FieldPolicy<any> | FieldReadFunction<any>;
  status?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type VirtualContributorModelCardKeySpecifier = (
  | 'aiEngine'
  | 'monitoring'
  | 'spaceUsage'
  | VirtualContributorModelCardKeySpecifier
)[];
export type VirtualContributorModelCardFieldPolicy = {
  aiEngine?: FieldPolicy<any> | FieldReadFunction<any>;
  monitoring?: FieldPolicy<any> | FieldReadFunction<any>;
  spaceUsage?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type VirtualContributorModelCardFlagKeySpecifier = (
  | 'enabled'
  | 'name'
  | VirtualContributorModelCardFlagKeySpecifier
)[];
export type VirtualContributorModelCardFlagFieldPolicy = {
  enabled?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type VirtualContributorSettingsKeySpecifier = ('privacy' | VirtualContributorSettingsKeySpecifier)[];
export type VirtualContributorSettingsFieldPolicy = {
  privacy?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type VirtualContributorSettingsPrivacyKeySpecifier = (
  | 'knowledgeBaseContentVisible'
  | VirtualContributorSettingsPrivacyKeySpecifier
)[];
export type VirtualContributorSettingsPrivacyFieldPolicy = {
  knowledgeBaseContentVisible?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type VirtualContributorUpdatedSubscriptionResultKeySpecifier = (
  | 'virtualContributor'
  | VirtualContributorUpdatedSubscriptionResultKeySpecifier
)[];
export type VirtualContributorUpdatedSubscriptionResultFieldPolicy = {
  virtualContributor?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type VirtualContributorsInRolesResponseKeySpecifier = (
  | 'role'
  | 'virtualContributors'
  | VirtualContributorsInRolesResponseKeySpecifier
)[];
export type VirtualContributorsInRolesResponseFieldPolicy = {
  role?: FieldPolicy<any> | FieldReadFunction<any>;
  virtualContributors?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type VisualConstraintsKeySpecifier = (
  | 'allowedTypes'
  | 'aspectRatio'
  | 'maxHeight'
  | 'maxWidth'
  | 'minHeight'
  | 'minWidth'
  | VisualConstraintsKeySpecifier
)[];
export type VisualConstraintsFieldPolicy = {
  allowedTypes?: FieldPolicy<any> | FieldReadFunction<any>;
  aspectRatio?: FieldPolicy<any> | FieldReadFunction<any>;
  maxHeight?: FieldPolicy<any> | FieldReadFunction<any>;
  maxWidth?: FieldPolicy<any> | FieldReadFunction<any>;
  minHeight?: FieldPolicy<any> | FieldReadFunction<any>;
  minWidth?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'previewSettings'
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
  previewSettings?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type WhiteboardPreviewCoordinatesKeySpecifier = (
  | 'height'
  | 'width'
  | 'x'
  | 'y'
  | WhiteboardPreviewCoordinatesKeySpecifier
)[];
export type WhiteboardPreviewCoordinatesFieldPolicy = {
  height?: FieldPolicy<any> | FieldReadFunction<any>;
  width?: FieldPolicy<any> | FieldReadFunction<any>;
  x?: FieldPolicy<any> | FieldReadFunction<any>;
  y?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type WhiteboardPreviewCoordinatesDataKeySpecifier = (
  | 'height'
  | 'width'
  | 'x'
  | 'y'
  | WhiteboardPreviewCoordinatesDataKeySpecifier
)[];
export type WhiteboardPreviewCoordinatesDataFieldPolicy = {
  height?: FieldPolicy<any> | FieldReadFunction<any>;
  width?: FieldPolicy<any> | FieldReadFunction<any>;
  x?: FieldPolicy<any> | FieldReadFunction<any>;
  y?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type WhiteboardPreviewSettingsKeySpecifier = ('coordinates' | 'mode' | WhiteboardPreviewSettingsKeySpecifier)[];
export type WhiteboardPreviewSettingsFieldPolicy = {
  coordinates?: FieldPolicy<any> | FieldReadFunction<any>;
  mode?: FieldPolicy<any> | FieldReadFunction<any>;
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
  AccountLicensePlan?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | AccountLicensePlanKeySpecifier | (() => undefined | AccountLicensePlanKeySpecifier);
    fields?: AccountLicensePlanFieldPolicy;
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
  ActivityLogEntryCalloutMemoCreated?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | ActivityLogEntryCalloutMemoCreatedKeySpecifier
      | (() => undefined | ActivityLogEntryCalloutMemoCreatedKeySpecifier);
    fields?: ActivityLogEntryCalloutMemoCreatedFieldPolicy;
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
  ActivityLogEntryMemberJoined?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | ActivityLogEntryMemberJoinedKeySpecifier
      | (() => undefined | ActivityLogEntryMemberJoinedKeySpecifier);
    fields?: ActivityLogEntryMemberJoinedFieldPolicy;
  };
  ActivityLogEntrySubspaceCreated?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | ActivityLogEntrySubspaceCreatedKeySpecifier
      | (() => undefined | ActivityLogEntrySubspaceCreatedKeySpecifier);
    fields?: ActivityLogEntrySubspaceCreatedFieldPolicy;
  };
  ActivityLogEntryUpdateSent?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | ActivityLogEntryUpdateSentKeySpecifier
      | (() => undefined | ActivityLogEntryUpdateSentKeySpecifier);
    fields?: ActivityLogEntryUpdateSentFieldPolicy;
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
  CalloutContributionsCountOutput?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | CalloutContributionsCountOutputKeySpecifier
      | (() => undefined | CalloutContributionsCountOutputKeySpecifier);
    fields?: CalloutContributionsCountOutputFieldPolicy;
  };
  CalloutFraming?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CalloutFramingKeySpecifier | (() => undefined | CalloutFramingKeySpecifier);
    fields?: CalloutFramingFieldPolicy;
  };
  CalloutPostCreated?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CalloutPostCreatedKeySpecifier | (() => undefined | CalloutPostCreatedKeySpecifier);
    fields?: CalloutPostCreatedFieldPolicy;
  };
  CalloutSettings?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CalloutSettingsKeySpecifier | (() => undefined | CalloutSettingsKeySpecifier);
    fields?: CalloutSettingsFieldPolicy;
  };
  CalloutSettingsContribution?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | CalloutSettingsContributionKeySpecifier
      | (() => undefined | CalloutSettingsContributionKeySpecifier);
    fields?: CalloutSettingsContributionFieldPolicy;
  };
  CalloutSettingsFraming?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CalloutSettingsFramingKeySpecifier | (() => undefined | CalloutSettingsFramingKeySpecifier);
    fields?: CalloutSettingsFramingFieldPolicy;
  };
  CalloutsSet?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CalloutsSetKeySpecifier | (() => undefined | CalloutsSetKeySpecifier);
    fields?: CalloutsSetFieldPolicy;
  };
  Classification?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ClassificationKeySpecifier | (() => undefined | ClassificationKeySpecifier);
    fields?: ClassificationFieldPolicy;
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
  Conversation?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ConversationKeySpecifier | (() => undefined | ConversationKeySpecifier);
    fields?: ConversationFieldPolicy;
  };
  CreateCalloutContributionData?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | CreateCalloutContributionDataKeySpecifier
      | (() => undefined | CreateCalloutContributionDataKeySpecifier);
    fields?: CreateCalloutContributionDataFieldPolicy;
  };
  CreateCalloutContributionDefaultsData?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | CreateCalloutContributionDefaultsDataKeySpecifier
      | (() => undefined | CreateCalloutContributionDefaultsDataKeySpecifier);
    fields?: CreateCalloutContributionDefaultsDataFieldPolicy;
  };
  CreateCalloutData?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CreateCalloutDataKeySpecifier | (() => undefined | CreateCalloutDataKeySpecifier);
    fields?: CreateCalloutDataFieldPolicy;
  };
  CreateCalloutFramingData?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CreateCalloutFramingDataKeySpecifier | (() => undefined | CreateCalloutFramingDataKeySpecifier);
    fields?: CreateCalloutFramingDataFieldPolicy;
  };
  CreateCalloutSettingsContributionData?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | CreateCalloutSettingsContributionDataKeySpecifier
      | (() => undefined | CreateCalloutSettingsContributionDataKeySpecifier);
    fields?: CreateCalloutSettingsContributionDataFieldPolicy;
  };
  CreateCalloutSettingsData?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | CreateCalloutSettingsDataKeySpecifier
      | (() => undefined | CreateCalloutSettingsDataKeySpecifier);
    fields?: CreateCalloutSettingsDataFieldPolicy;
  };
  CreateCalloutSettingsFramingData?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | CreateCalloutSettingsFramingDataKeySpecifier
      | (() => undefined | CreateCalloutSettingsFramingDataKeySpecifier);
    fields?: CreateCalloutSettingsFramingDataFieldPolicy;
  };
  CreateCalloutsSetData?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CreateCalloutsSetDataKeySpecifier | (() => undefined | CreateCalloutsSetDataKeySpecifier);
    fields?: CreateCalloutsSetDataFieldPolicy;
  };
  CreateClassificationData?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CreateClassificationDataKeySpecifier | (() => undefined | CreateClassificationDataKeySpecifier);
    fields?: CreateClassificationDataFieldPolicy;
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
  CreateInnovationFlowStateSettingsData?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | CreateInnovationFlowStateSettingsDataKeySpecifier
      | (() => undefined | CreateInnovationFlowStateSettingsDataKeySpecifier);
    fields?: CreateInnovationFlowStateSettingsDataFieldPolicy;
  };
  CreateLinkData?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CreateLinkDataKeySpecifier | (() => undefined | CreateLinkDataKeySpecifier);
    fields?: CreateLinkDataFieldPolicy;
  };
  CreateLocationData?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CreateLocationDataKeySpecifier | (() => undefined | CreateLocationDataKeySpecifier);
    fields?: CreateLocationDataFieldPolicy;
  };
  CreateMemoData?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CreateMemoDataKeySpecifier | (() => undefined | CreateMemoDataKeySpecifier);
    fields?: CreateMemoDataFieldPolicy;
  };
  CreatePostData?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CreatePostDataKeySpecifier | (() => undefined | CreatePostDataKeySpecifier);
    fields?: CreatePostDataFieldPolicy;
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
  CreateVisualOnProfileData?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | CreateVisualOnProfileDataKeySpecifier
      | (() => undefined | CreateVisualOnProfileDataKeySpecifier);
    fields?: CreateVisualOnProfileDataFieldPolicy;
  };
  CreateWhiteboardData?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CreateWhiteboardDataKeySpecifier | (() => undefined | CreateWhiteboardDataKeySpecifier);
    fields?: CreateWhiteboardDataFieldPolicy;
  };
  CreateWhiteboardPreviewSettingsData?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | CreateWhiteboardPreviewSettingsDataKeySpecifier
      | (() => undefined | CreateWhiteboardPreviewSettingsDataKeySpecifier);
    fields?: CreateWhiteboardPreviewSettingsDataFieldPolicy;
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
  Discussion?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | DiscussionKeySpecifier | (() => undefined | DiscussionKeySpecifier);
    fields?: DiscussionFieldPolicy;
  };
  DiscussionDetails?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | DiscussionDetailsKeySpecifier | (() => undefined | DiscussionDetailsKeySpecifier);
    fields?: DiscussionDetailsFieldPolicy;
  };
  Document?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | DocumentKeySpecifier | (() => undefined | DocumentKeySpecifier);
    fields?: DocumentFieldPolicy;
  };
  ExternalConfig?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ExternalConfigKeySpecifier | (() => undefined | ExternalConfigKeySpecifier);
    fields?: ExternalConfigFieldPolicy;
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
  GeoLocation?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | GeoLocationKeySpecifier | (() => undefined | GeoLocationKeySpecifier);
    fields?: GeoLocationFieldPolicy;
  };
  Groupable?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | GroupableKeySpecifier | (() => undefined | GroupableKeySpecifier);
    fields?: GroupableFieldPolicy;
  };
  ISearchCategoryResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ISearchCategoryResultKeySpecifier | (() => undefined | ISearchCategoryResultKeySpecifier);
    fields?: ISearchCategoryResultFieldPolicy;
  };
  ISearchResults?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ISearchResultsKeySpecifier | (() => undefined | ISearchResultsKeySpecifier);
    fields?: ISearchResultsFieldPolicy;
  };
  InAppNotification?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | InAppNotificationKeySpecifier | (() => undefined | InAppNotificationKeySpecifier);
    fields?: InAppNotificationFieldPolicy;
  };
  InAppNotificationPayload?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | InAppNotificationPayloadKeySpecifier | (() => undefined | InAppNotificationPayloadKeySpecifier);
    fields?: InAppNotificationPayloadFieldPolicy;
  };
  InAppNotificationPayloadOrganizationMessageDirect?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | InAppNotificationPayloadOrganizationMessageDirectKeySpecifier
      | (() => undefined | InAppNotificationPayloadOrganizationMessageDirectKeySpecifier);
    fields?: InAppNotificationPayloadOrganizationMessageDirectFieldPolicy;
  };
  InAppNotificationPayloadOrganizationMessageRoom?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | InAppNotificationPayloadOrganizationMessageRoomKeySpecifier
      | (() => undefined | InAppNotificationPayloadOrganizationMessageRoomKeySpecifier);
    fields?: InAppNotificationPayloadOrganizationMessageRoomFieldPolicy;
  };
  InAppNotificationPayloadPlatformForumDiscussion?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | InAppNotificationPayloadPlatformForumDiscussionKeySpecifier
      | (() => undefined | InAppNotificationPayloadPlatformForumDiscussionKeySpecifier);
    fields?: InAppNotificationPayloadPlatformForumDiscussionFieldPolicy;
  };
  InAppNotificationPayloadPlatformGlobalRoleChange?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | InAppNotificationPayloadPlatformGlobalRoleChangeKeySpecifier
      | (() => undefined | InAppNotificationPayloadPlatformGlobalRoleChangeKeySpecifier);
    fields?: InAppNotificationPayloadPlatformGlobalRoleChangeFieldPolicy;
  };
  InAppNotificationPayloadPlatformUser?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | InAppNotificationPayloadPlatformUserKeySpecifier
      | (() => undefined | InAppNotificationPayloadPlatformUserKeySpecifier);
    fields?: InAppNotificationPayloadPlatformUserFieldPolicy;
  };
  InAppNotificationPayloadPlatformUserMessageRoom?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | InAppNotificationPayloadPlatformUserMessageRoomKeySpecifier
      | (() => undefined | InAppNotificationPayloadPlatformUserMessageRoomKeySpecifier);
    fields?: InAppNotificationPayloadPlatformUserMessageRoomFieldPolicy;
  };
  InAppNotificationPayloadPlatformUserProfileRemoved?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | InAppNotificationPayloadPlatformUserProfileRemovedKeySpecifier
      | (() => undefined | InAppNotificationPayloadPlatformUserProfileRemovedKeySpecifier);
    fields?: InAppNotificationPayloadPlatformUserProfileRemovedFieldPolicy;
  };
  InAppNotificationPayloadSpace?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | InAppNotificationPayloadSpaceKeySpecifier
      | (() => undefined | InAppNotificationPayloadSpaceKeySpecifier);
    fields?: InAppNotificationPayloadSpaceFieldPolicy;
  };
  InAppNotificationPayloadSpaceCollaborationCallout?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | InAppNotificationPayloadSpaceCollaborationCalloutKeySpecifier
      | (() => undefined | InAppNotificationPayloadSpaceCollaborationCalloutKeySpecifier);
    fields?: InAppNotificationPayloadSpaceCollaborationCalloutFieldPolicy;
  };
  InAppNotificationPayloadSpaceCollaborationCalloutComment?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | InAppNotificationPayloadSpaceCollaborationCalloutCommentKeySpecifier
      | (() => undefined | InAppNotificationPayloadSpaceCollaborationCalloutCommentKeySpecifier);
    fields?: InAppNotificationPayloadSpaceCollaborationCalloutCommentFieldPolicy;
  };
  InAppNotificationPayloadSpaceCollaborationCalloutPostComment?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | InAppNotificationPayloadSpaceCollaborationCalloutPostCommentKeySpecifier
      | (() => undefined | InAppNotificationPayloadSpaceCollaborationCalloutPostCommentKeySpecifier);
    fields?: InAppNotificationPayloadSpaceCollaborationCalloutPostCommentFieldPolicy;
  };
  InAppNotificationPayloadSpaceCommunicationMessageDirect?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | InAppNotificationPayloadSpaceCommunicationMessageDirectKeySpecifier
      | (() => undefined | InAppNotificationPayloadSpaceCommunicationMessageDirectKeySpecifier);
    fields?: InAppNotificationPayloadSpaceCommunicationMessageDirectFieldPolicy;
  };
  InAppNotificationPayloadSpaceCommunicationUpdate?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | InAppNotificationPayloadSpaceCommunicationUpdateKeySpecifier
      | (() => undefined | InAppNotificationPayloadSpaceCommunicationUpdateKeySpecifier);
    fields?: InAppNotificationPayloadSpaceCommunicationUpdateFieldPolicy;
  };
  InAppNotificationPayloadSpaceCommunityApplication?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | InAppNotificationPayloadSpaceCommunityApplicationKeySpecifier
      | (() => undefined | InAppNotificationPayloadSpaceCommunityApplicationKeySpecifier);
    fields?: InAppNotificationPayloadSpaceCommunityApplicationFieldPolicy;
  };
  InAppNotificationPayloadSpaceCommunityCalendarEvent?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | InAppNotificationPayloadSpaceCommunityCalendarEventKeySpecifier
      | (() => undefined | InAppNotificationPayloadSpaceCommunityCalendarEventKeySpecifier);
    fields?: InAppNotificationPayloadSpaceCommunityCalendarEventFieldPolicy;
  };
  InAppNotificationPayloadSpaceCommunityCalendarEventComment?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | InAppNotificationPayloadSpaceCommunityCalendarEventCommentKeySpecifier
      | (() => undefined | InAppNotificationPayloadSpaceCommunityCalendarEventCommentKeySpecifier);
    fields?: InAppNotificationPayloadSpaceCommunityCalendarEventCommentFieldPolicy;
  };
  InAppNotificationPayloadSpaceCommunityContributor?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | InAppNotificationPayloadSpaceCommunityContributorKeySpecifier
      | (() => undefined | InAppNotificationPayloadSpaceCommunityContributorKeySpecifier);
    fields?: InAppNotificationPayloadSpaceCommunityContributorFieldPolicy;
  };
  InAppNotificationPayloadSpaceCommunityInvitation?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | InAppNotificationPayloadSpaceCommunityInvitationKeySpecifier
      | (() => undefined | InAppNotificationPayloadSpaceCommunityInvitationKeySpecifier);
    fields?: InAppNotificationPayloadSpaceCommunityInvitationFieldPolicy;
  };
  InAppNotificationPayloadSpaceCommunityInvitationPlatform?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | InAppNotificationPayloadSpaceCommunityInvitationPlatformKeySpecifier
      | (() => undefined | InAppNotificationPayloadSpaceCommunityInvitationPlatformKeySpecifier);
    fields?: InAppNotificationPayloadSpaceCommunityInvitationPlatformFieldPolicy;
  };
  InAppNotificationPayloadUserMessageDirect?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | InAppNotificationPayloadUserMessageDirectKeySpecifier
      | (() => undefined | InAppNotificationPayloadUserMessageDirectKeySpecifier);
    fields?: InAppNotificationPayloadUserMessageDirectFieldPolicy;
  };
  InAppNotificationPayloadVirtualContributor?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | InAppNotificationPayloadVirtualContributorKeySpecifier
      | (() => undefined | InAppNotificationPayloadVirtualContributorKeySpecifier);
    fields?: InAppNotificationPayloadVirtualContributorFieldPolicy;
  };
  InnovationFlow?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | InnovationFlowKeySpecifier | (() => undefined | InnovationFlowKeySpecifier);
    fields?: InnovationFlowFieldPolicy;
  };
  InnovationFlowSettings?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | InnovationFlowSettingsKeySpecifier | (() => undefined | InnovationFlowSettingsKeySpecifier);
    fields?: InnovationFlowSettingsFieldPolicy;
  };
  InnovationFlowState?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | InnovationFlowStateKeySpecifier | (() => undefined | InnovationFlowStateKeySpecifier);
    fields?: InnovationFlowStateFieldPolicy;
  };
  InnovationFlowStateSettings?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | InnovationFlowStateSettingsKeySpecifier
      | (() => undefined | InnovationFlowStateSettingsKeySpecifier);
    fields?: InnovationFlowStateSettingsFieldPolicy;
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
  KnowledgeBase?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | KnowledgeBaseKeySpecifier | (() => undefined | KnowledgeBaseKeySpecifier);
    fields?: KnowledgeBaseFieldPolicy;
  };
  KratosIdentity?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | KratosIdentityKeySpecifier | (() => undefined | KratosIdentityKeySpecifier);
    fields?: KratosIdentityFieldPolicy;
  };
  LatestReleaseDiscussion?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | LatestReleaseDiscussionKeySpecifier | (() => undefined | LatestReleaseDiscussionKeySpecifier);
    fields?: LatestReleaseDiscussionFieldPolicy;
  };
  Library?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | LibraryKeySpecifier | (() => undefined | LibraryKeySpecifier);
    fields?: LibraryFieldPolicy;
  };
  License?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | LicenseKeySpecifier | (() => undefined | LicenseKeySpecifier);
    fields?: LicenseFieldPolicy;
  };
  LicenseEntitlement?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | LicenseEntitlementKeySpecifier | (() => undefined | LicenseEntitlementKeySpecifier);
    fields?: LicenseEntitlementFieldPolicy;
  };
  LicensePlan?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | LicensePlanKeySpecifier | (() => undefined | LicensePlanKeySpecifier);
    fields?: LicensePlanFieldPolicy;
  };
  LicensePolicy?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | LicensePolicyKeySpecifier | (() => undefined | LicensePolicyKeySpecifier);
    fields?: LicensePolicyFieldPolicy;
  };
  Licensing?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | LicensingKeySpecifier | (() => undefined | LicensingKeySpecifier);
    fields?: LicensingFieldPolicy;
  };
  LicensingCredentialBasedPolicyCredentialRule?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | LicensingCredentialBasedPolicyCredentialRuleKeySpecifier
      | (() => undefined | LicensingCredentialBasedPolicyCredentialRuleKeySpecifier);
    fields?: LicensingCredentialBasedPolicyCredentialRuleFieldPolicy;
  };
  LicensingGrantedEntitlement?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | LicensingGrantedEntitlementKeySpecifier
      | (() => undefined | LicensingGrantedEntitlementKeySpecifier);
    fields?: LicensingGrantedEntitlementFieldPolicy;
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
  LookupMyPrivilegesQueryResults?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | LookupMyPrivilegesQueryResultsKeySpecifier
      | (() => undefined | LookupMyPrivilegesQueryResultsKeySpecifier);
    fields?: LookupMyPrivilegesQueryResultsFieldPolicy;
  };
  LookupQueryResults?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | LookupQueryResultsKeySpecifier | (() => undefined | LookupQueryResultsKeySpecifier);
    fields?: LookupQueryResultsFieldPolicy;
  };
  MeConversationsResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | MeConversationsResultKeySpecifier | (() => undefined | MeConversationsResultKeySpecifier);
    fields?: MeConversationsResultFieldPolicy;
  };
  MeQueryResults?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | MeQueryResultsKeySpecifier | (() => undefined | MeQueryResultsKeySpecifier);
    fields?: MeQueryResultsFieldPolicy;
  };
  Memo?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | MemoKeySpecifier | (() => undefined | MemoKeySpecifier);
    fields?: MemoFieldPolicy;
  };
  Message?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | MessageKeySpecifier | (() => undefined | MessageKeySpecifier);
    fields?: MessageFieldPolicy;
  };
  MessageAnswerQuestion?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | MessageAnswerQuestionKeySpecifier | (() => undefined | MessageAnswerQuestionKeySpecifier);
    fields?: MessageAnswerQuestionFieldPolicy;
  };
  MessageDetails?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | MessageDetailsKeySpecifier | (() => undefined | MessageDetailsKeySpecifier);
    fields?: MessageDetailsFieldPolicy;
  };
  MessageParent?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | MessageParentKeySpecifier | (() => undefined | MessageParentKeySpecifier);
    fields?: MessageParentFieldPolicy;
  };
  Metadata?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | MetadataKeySpecifier | (() => undefined | MetadataKeySpecifier);
    fields?: MetadataFieldPolicy;
  };
  MigrateEmbeddings?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | MigrateEmbeddingsKeySpecifier | (() => undefined | MigrateEmbeddingsKeySpecifier);
    fields?: MigrateEmbeddingsFieldPolicy;
  };
  ModelCardAiEngineResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ModelCardAiEngineResultKeySpecifier | (() => undefined | ModelCardAiEngineResultKeySpecifier);
    fields?: ModelCardAiEngineResultFieldPolicy;
  };
  ModelCardMonitoringResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | ModelCardMonitoringResultKeySpecifier
      | (() => undefined | ModelCardMonitoringResultKeySpecifier);
    fields?: ModelCardMonitoringResultFieldPolicy;
  };
  ModelCardSpaceUsageResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | ModelCardSpaceUsageResultKeySpecifier
      | (() => undefined | ModelCardSpaceUsageResultKeySpecifier);
    fields?: ModelCardSpaceUsageResultFieldPolicy;
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
  NotificationRecipientResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | NotificationRecipientResultKeySpecifier
      | (() => undefined | NotificationRecipientResultKeySpecifier);
    fields?: NotificationRecipientResultFieldPolicy;
  };
  Organization?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | OrganizationKeySpecifier | (() => undefined | OrganizationKeySpecifier);
    fields?: OrganizationFieldPolicy;
  };
  OrganizationSettings?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | OrganizationSettingsKeySpecifier | (() => undefined | OrganizationSettingsKeySpecifier);
    fields?: OrganizationSettingsFieldPolicy;
  };
  OrganizationSettingsMembership?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | OrganizationSettingsMembershipKeySpecifier
      | (() => undefined | OrganizationSettingsMembershipKeySpecifier);
    fields?: OrganizationSettingsMembershipFieldPolicy;
  };
  OrganizationSettingsPrivacy?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | OrganizationSettingsPrivacyKeySpecifier
      | (() => undefined | OrganizationSettingsPrivacyKeySpecifier);
    fields?: OrganizationSettingsPrivacyFieldPolicy;
  };
  OrganizationVerification?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | OrganizationVerificationKeySpecifier | (() => undefined | OrganizationVerificationKeySpecifier);
    fields?: OrganizationVerificationFieldPolicy;
  };
  OrganizationsInRolesResponse?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | OrganizationsInRolesResponseKeySpecifier
      | (() => undefined | OrganizationsInRolesResponseKeySpecifier);
    fields?: OrganizationsInRolesResponseFieldPolicy;
  };
  OryConfig?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | OryConfigKeySpecifier | (() => undefined | OryConfigKeySpecifier);
    fields?: OryConfigFieldPolicy;
  };
  PageInfo?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PageInfoKeySpecifier | (() => undefined | PageInfoKeySpecifier);
    fields?: PageInfoFieldPolicy;
  };
  PaginatedInAppNotifications?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | PaginatedInAppNotificationsKeySpecifier
      | (() => undefined | PaginatedInAppNotificationsKeySpecifier);
    fields?: PaginatedInAppNotificationsFieldPolicy;
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
  PaginatedVirtualContributor?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | PaginatedVirtualContributorKeySpecifier
      | (() => undefined | PaginatedVirtualContributorKeySpecifier);
    fields?: PaginatedVirtualContributorFieldPolicy;
  };
  Platform?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PlatformKeySpecifier | (() => undefined | PlatformKeySpecifier);
    fields?: PlatformFieldPolicy;
  };
  PlatformAccessRole?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PlatformAccessRoleKeySpecifier | (() => undefined | PlatformAccessRoleKeySpecifier);
    fields?: PlatformAccessRoleFieldPolicy;
  };
  PlatformAdminCommunicationQueryResults?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | PlatformAdminCommunicationQueryResultsKeySpecifier
      | (() => undefined | PlatformAdminCommunicationQueryResultsKeySpecifier);
    fields?: PlatformAdminCommunicationQueryResultsFieldPolicy;
  };
  PlatformAdminIdentityQueryResults?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | PlatformAdminIdentityQueryResultsKeySpecifier
      | (() => undefined | PlatformAdminIdentityQueryResultsKeySpecifier);
    fields?: PlatformAdminIdentityQueryResultsFieldPolicy;
  };
  PlatformAdminQueryResults?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | PlatformAdminQueryResultsKeySpecifier
      | (() => undefined | PlatformAdminQueryResultsKeySpecifier);
    fields?: PlatformAdminQueryResultsFieldPolicy;
  };
  PlatformFeatureFlag?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PlatformFeatureFlagKeySpecifier | (() => undefined | PlatformFeatureFlagKeySpecifier);
    fields?: PlatformFeatureFlagFieldPolicy;
  };
  PlatformIntegrationSettings?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | PlatformIntegrationSettingsKeySpecifier
      | (() => undefined | PlatformIntegrationSettingsKeySpecifier);
    fields?: PlatformIntegrationSettingsFieldPolicy;
  };
  PlatformInvitation?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PlatformInvitationKeySpecifier | (() => undefined | PlatformInvitationKeySpecifier);
    fields?: PlatformInvitationFieldPolicy;
  };
  PlatformLocations?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PlatformLocationsKeySpecifier | (() => undefined | PlatformLocationsKeySpecifier);
    fields?: PlatformLocationsFieldPolicy;
  };
  PlatformRolesAccess?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PlatformRolesAccessKeySpecifier | (() => undefined | PlatformRolesAccessKeySpecifier);
    fields?: PlatformRolesAccessFieldPolicy;
  };
  PlatformSettings?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PlatformSettingsKeySpecifier | (() => undefined | PlatformSettingsKeySpecifier);
    fields?: PlatformSettingsFieldPolicy;
  };
  PlatformWellKnownVirtualContributorMapping?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | PlatformWellKnownVirtualContributorMappingKeySpecifier
      | (() => undefined | PlatformWellKnownVirtualContributorMappingKeySpecifier);
    fields?: PlatformWellKnownVirtualContributorMappingFieldPolicy;
  };
  PlatformWellKnownVirtualContributors?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | PlatformWellKnownVirtualContributorsKeySpecifier
      | (() => undefined | PlatformWellKnownVirtualContributorsKeySpecifier);
    fields?: PlatformWellKnownVirtualContributorsFieldPolicy;
  };
  Post?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PostKeySpecifier | (() => undefined | PostKeySpecifier);
    fields?: PostFieldPolicy;
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
  PromptGraph?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PromptGraphKeySpecifier | (() => undefined | PromptGraphKeySpecifier);
    fields?: PromptGraphFieldPolicy;
  };
  PromptGraphDataPoint?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PromptGraphDataPointKeySpecifier | (() => undefined | PromptGraphDataPointKeySpecifier);
    fields?: PromptGraphDataPointFieldPolicy;
  };
  PromptGraphDataStruct?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PromptGraphDataStructKeySpecifier | (() => undefined | PromptGraphDataStructKeySpecifier);
    fields?: PromptGraphDataStructFieldPolicy;
  };
  PromptGraphDefinition?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PromptGraphDefinitionKeySpecifier | (() => undefined | PromptGraphDefinitionKeySpecifier);
    fields?: PromptGraphDefinitionFieldPolicy;
  };
  PromptGraphDefinitionDataPoint?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | PromptGraphDefinitionDataPointKeySpecifier
      | (() => undefined | PromptGraphDefinitionDataPointKeySpecifier);
    fields?: PromptGraphDefinitionDataPointFieldPolicy;
  };
  PromptGraphDefinitionDataStruct?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | PromptGraphDefinitionDataStructKeySpecifier
      | (() => undefined | PromptGraphDefinitionDataStructKeySpecifier);
    fields?: PromptGraphDefinitionDataStructFieldPolicy;
  };
  PromptGraphDefinitionEdge?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | PromptGraphDefinitionEdgeKeySpecifier
      | (() => undefined | PromptGraphDefinitionEdgeKeySpecifier);
    fields?: PromptGraphDefinitionEdgeFieldPolicy;
  };
  PromptGraphDefinitionNode?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | PromptGraphDefinitionNodeKeySpecifier
      | (() => undefined | PromptGraphDefinitionNodeKeySpecifier);
    fields?: PromptGraphDefinitionNodeFieldPolicy;
  };
  PromptGraphEdge?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PromptGraphEdgeKeySpecifier | (() => undefined | PromptGraphEdgeKeySpecifier);
    fields?: PromptGraphEdgeFieldPolicy;
  };
  PromptGraphNode?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PromptGraphNodeKeySpecifier | (() => undefined | PromptGraphNodeKeySpecifier);
    fields?: PromptGraphNodeFieldPolicy;
  };
  PruneInAppNotificationAdminResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | PruneInAppNotificationAdminResultKeySpecifier
      | (() => undefined | PruneInAppNotificationAdminResultKeySpecifier);
    fields?: PruneInAppNotificationAdminResultFieldPolicy;
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
  RoleSetInvitationResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | RoleSetInvitationResultKeySpecifier | (() => undefined | RoleSetInvitationResultKeySpecifier);
    fields?: RoleSetInvitationResultFieldPolicy;
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
  SpaceAbout?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | SpaceAboutKeySpecifier | (() => undefined | SpaceAboutKeySpecifier);
    fields?: SpaceAboutFieldPolicy;
  };
  SpaceAboutMembership?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | SpaceAboutMembershipKeySpecifier | (() => undefined | SpaceAboutMembershipKeySpecifier);
    fields?: SpaceAboutMembershipFieldPolicy;
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
  TemplateContentSpace?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | TemplateContentSpaceKeySpecifier | (() => undefined | TemplateContentSpaceKeySpecifier);
    fields?: TemplateContentSpaceFieldPolicy;
  };
  TemplateDefault?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | TemplateDefaultKeySpecifier | (() => undefined | TemplateDefaultKeySpecifier);
    fields?: TemplateDefaultFieldPolicy;
  };
  TemplateResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | TemplateResultKeySpecifier | (() => undefined | TemplateResultKeySpecifier);
    fields?: TemplateResultFieldPolicy;
  };
  TemplatesManager?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | TemplatesManagerKeySpecifier | (() => undefined | TemplatesManagerKeySpecifier);
    fields?: TemplatesManagerFieldPolicy;
  };
  TemplatesSet?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | TemplatesSetKeySpecifier | (() => undefined | TemplatesSetKeySpecifier);
    fields?: TemplatesSetFieldPolicy;
  };
  Timeline?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | TimelineKeySpecifier | (() => undefined | TimelineKeySpecifier);
    fields?: TimelineFieldPolicy;
  };
  UrlResolverQueryResultCalendar?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | UrlResolverQueryResultCalendarKeySpecifier
      | (() => undefined | UrlResolverQueryResultCalendarKeySpecifier);
    fields?: UrlResolverQueryResultCalendarFieldPolicy;
  };
  UrlResolverQueryResultCalloutsSet?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | UrlResolverQueryResultCalloutsSetKeySpecifier
      | (() => undefined | UrlResolverQueryResultCalloutsSetKeySpecifier);
    fields?: UrlResolverQueryResultCalloutsSetFieldPolicy;
  };
  UrlResolverQueryResultCollaboration?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | UrlResolverQueryResultCollaborationKeySpecifier
      | (() => undefined | UrlResolverQueryResultCollaborationKeySpecifier);
    fields?: UrlResolverQueryResultCollaborationFieldPolicy;
  };
  UrlResolverQueryResultInnovationPack?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | UrlResolverQueryResultInnovationPackKeySpecifier
      | (() => undefined | UrlResolverQueryResultInnovationPackKeySpecifier);
    fields?: UrlResolverQueryResultInnovationPackFieldPolicy;
  };
  UrlResolverQueryResultSpace?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | UrlResolverQueryResultSpaceKeySpecifier
      | (() => undefined | UrlResolverQueryResultSpaceKeySpecifier);
    fields?: UrlResolverQueryResultSpaceFieldPolicy;
  };
  UrlResolverQueryResultTemplatesSet?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | UrlResolverQueryResultTemplatesSetKeySpecifier
      | (() => undefined | UrlResolverQueryResultTemplatesSetKeySpecifier);
    fields?: UrlResolverQueryResultTemplatesSetFieldPolicy;
  };
  UrlResolverQueryResultVirtualContributor?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | UrlResolverQueryResultVirtualContributorKeySpecifier
      | (() => undefined | UrlResolverQueryResultVirtualContributorKeySpecifier);
    fields?: UrlResolverQueryResultVirtualContributorFieldPolicy;
  };
  UrlResolverQueryResults?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | UrlResolverQueryResultsKeySpecifier | (() => undefined | UrlResolverQueryResultsKeySpecifier);
    fields?: UrlResolverQueryResultsFieldPolicy;
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
  UserSettings?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | UserSettingsKeySpecifier | (() => undefined | UserSettingsKeySpecifier);
    fields?: UserSettingsFieldPolicy;
  };
  UserSettingsCommunication?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | UserSettingsCommunicationKeySpecifier
      | (() => undefined | UserSettingsCommunicationKeySpecifier);
    fields?: UserSettingsCommunicationFieldPolicy;
  };
  UserSettingsNotification?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | UserSettingsNotificationKeySpecifier | (() => undefined | UserSettingsNotificationKeySpecifier);
    fields?: UserSettingsNotificationFieldPolicy;
  };
  UserSettingsNotificationChannels?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | UserSettingsNotificationChannelsKeySpecifier
      | (() => undefined | UserSettingsNotificationChannelsKeySpecifier);
    fields?: UserSettingsNotificationChannelsFieldPolicy;
  };
  UserSettingsNotificationOrganization?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | UserSettingsNotificationOrganizationKeySpecifier
      | (() => undefined | UserSettingsNotificationOrganizationKeySpecifier);
    fields?: UserSettingsNotificationOrganizationFieldPolicy;
  };
  UserSettingsNotificationPlatform?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | UserSettingsNotificationPlatformKeySpecifier
      | (() => undefined | UserSettingsNotificationPlatformKeySpecifier);
    fields?: UserSettingsNotificationPlatformFieldPolicy;
  };
  UserSettingsNotificationPlatformAdmin?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | UserSettingsNotificationPlatformAdminKeySpecifier
      | (() => undefined | UserSettingsNotificationPlatformAdminKeySpecifier);
    fields?: UserSettingsNotificationPlatformAdminFieldPolicy;
  };
  UserSettingsNotificationSpace?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | UserSettingsNotificationSpaceKeySpecifier
      | (() => undefined | UserSettingsNotificationSpaceKeySpecifier);
    fields?: UserSettingsNotificationSpaceFieldPolicy;
  };
  UserSettingsNotificationSpaceAdmin?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | UserSettingsNotificationSpaceAdminKeySpecifier
      | (() => undefined | UserSettingsNotificationSpaceAdminKeySpecifier);
    fields?: UserSettingsNotificationSpaceAdminFieldPolicy;
  };
  UserSettingsNotificationUser?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | UserSettingsNotificationUserKeySpecifier
      | (() => undefined | UserSettingsNotificationUserKeySpecifier);
    fields?: UserSettingsNotificationUserFieldPolicy;
  };
  UserSettingsNotificationUserMembership?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | UserSettingsNotificationUserMembershipKeySpecifier
      | (() => undefined | UserSettingsNotificationUserMembershipKeySpecifier);
    fields?: UserSettingsNotificationUserMembershipFieldPolicy;
  };
  UserSettingsNotificationVirtualContributor?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | UserSettingsNotificationVirtualContributorKeySpecifier
      | (() => undefined | UserSettingsNotificationVirtualContributorKeySpecifier);
    fields?: UserSettingsNotificationVirtualContributorFieldPolicy;
  };
  UserSettingsPrivacy?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | UserSettingsPrivacyKeySpecifier | (() => undefined | UserSettingsPrivacyKeySpecifier);
    fields?: UserSettingsPrivacyFieldPolicy;
  };
  UsersInRolesResponse?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | UsersInRolesResponseKeySpecifier | (() => undefined | UsersInRolesResponseKeySpecifier);
    fields?: UsersInRolesResponseFieldPolicy;
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
  VirtualContributorModelCard?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | VirtualContributorModelCardKeySpecifier
      | (() => undefined | VirtualContributorModelCardKeySpecifier);
    fields?: VirtualContributorModelCardFieldPolicy;
  };
  VirtualContributorModelCardFlag?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | VirtualContributorModelCardFlagKeySpecifier
      | (() => undefined | VirtualContributorModelCardFlagKeySpecifier);
    fields?: VirtualContributorModelCardFlagFieldPolicy;
  };
  VirtualContributorSettings?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | VirtualContributorSettingsKeySpecifier
      | (() => undefined | VirtualContributorSettingsKeySpecifier);
    fields?: VirtualContributorSettingsFieldPolicy;
  };
  VirtualContributorSettingsPrivacy?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | VirtualContributorSettingsPrivacyKeySpecifier
      | (() => undefined | VirtualContributorSettingsPrivacyKeySpecifier);
    fields?: VirtualContributorSettingsPrivacyFieldPolicy;
  };
  VirtualContributorUpdatedSubscriptionResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | VirtualContributorUpdatedSubscriptionResultKeySpecifier
      | (() => undefined | VirtualContributorUpdatedSubscriptionResultKeySpecifier);
    fields?: VirtualContributorUpdatedSubscriptionResultFieldPolicy;
  };
  VirtualContributorsInRolesResponse?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | VirtualContributorsInRolesResponseKeySpecifier
      | (() => undefined | VirtualContributorsInRolesResponseKeySpecifier);
    fields?: VirtualContributorsInRolesResponseFieldPolicy;
  };
  Visual?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | VisualKeySpecifier | (() => undefined | VisualKeySpecifier);
    fields?: VisualFieldPolicy;
  };
  VisualConstraints?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | VisualConstraintsKeySpecifier | (() => undefined | VisualConstraintsKeySpecifier);
    fields?: VisualConstraintsFieldPolicy;
  };
  Whiteboard?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | WhiteboardKeySpecifier | (() => undefined | WhiteboardKeySpecifier);
    fields?: WhiteboardFieldPolicy;
  };
  WhiteboardPreviewCoordinates?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | WhiteboardPreviewCoordinatesKeySpecifier
      | (() => undefined | WhiteboardPreviewCoordinatesKeySpecifier);
    fields?: WhiteboardPreviewCoordinatesFieldPolicy;
  };
  WhiteboardPreviewCoordinatesData?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | WhiteboardPreviewCoordinatesDataKeySpecifier
      | (() => undefined | WhiteboardPreviewCoordinatesDataKeySpecifier);
    fields?: WhiteboardPreviewCoordinatesDataFieldPolicy;
  };
  WhiteboardPreviewSettings?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | WhiteboardPreviewSettingsKeySpecifier
      | (() => undefined | WhiteboardPreviewSettingsKeySpecifier);
    fields?: WhiteboardPreviewSettingsFieldPolicy;
  };
};
export type TypedTypePolicies = StrictTypedTypePolicies & TypePolicies;
