import { FieldPolicy, FieldReadFunction, TypePolicies, TypePolicy } from '@apollo/client/cache';
export type APMKeySpecifier = ('endpoint' | 'rumEnabled' | APMKeySpecifier)[];
export type APMFieldPolicy = {
  endpoint?: FieldPolicy<any> | FieldReadFunction<any>;
  rumEnabled?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AccountKeySpecifier = (
  | 'authorization'
  | 'defaults'
  | 'host'
  | 'id'
  | 'library'
  | 'license'
  | 'spaceID'
  | AccountKeySpecifier
)[];
export type AccountFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  defaults?: FieldPolicy<any> | FieldReadFunction<any>;
  host?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  library?: FieldPolicy<any> | FieldReadFunction<any>;
  license?: FieldPolicy<any> | FieldReadFunction<any>;
  spaceID?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'journey'
  | 'parentDisplayName'
  | 'parentNameID'
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
  journey?: FieldPolicy<any> | FieldReadFunction<any>;
  parentDisplayName?: FieldPolicy<any> | FieldReadFunction<any>;
  parentNameID?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'journey'
  | 'parentDisplayName'
  | 'parentNameID'
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
  journey?: FieldPolicy<any> | FieldReadFunction<any>;
  parentDisplayName?: FieldPolicy<any> | FieldReadFunction<any>;
  parentNameID?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'journey'
  | 'parentDisplayName'
  | 'parentNameID'
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
  journey?: FieldPolicy<any> | FieldReadFunction<any>;
  parentDisplayName?: FieldPolicy<any> | FieldReadFunction<any>;
  parentNameID?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'journey'
  | 'link'
  | 'parentDisplayName'
  | 'parentNameID'
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
  journey?: FieldPolicy<any> | FieldReadFunction<any>;
  link?: FieldPolicy<any> | FieldReadFunction<any>;
  parentDisplayName?: FieldPolicy<any> | FieldReadFunction<any>;
  parentNameID?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'journey'
  | 'parentDisplayName'
  | 'parentNameID'
  | 'post'
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
  journey?: FieldPolicy<any> | FieldReadFunction<any>;
  parentDisplayName?: FieldPolicy<any> | FieldReadFunction<any>;
  parentNameID?: FieldPolicy<any> | FieldReadFunction<any>;
  post?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'journey'
  | 'parentDisplayName'
  | 'parentNameID'
  | 'post'
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
  journey?: FieldPolicy<any> | FieldReadFunction<any>;
  parentDisplayName?: FieldPolicy<any> | FieldReadFunction<any>;
  parentNameID?: FieldPolicy<any> | FieldReadFunction<any>;
  post?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'journey'
  | 'parentDisplayName'
  | 'parentNameID'
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
  journey?: FieldPolicy<any> | FieldReadFunction<any>;
  parentDisplayName?: FieldPolicy<any> | FieldReadFunction<any>;
  parentNameID?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'journey'
  | 'parentDisplayName'
  | 'parentNameID'
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
  journey?: FieldPolicy<any> | FieldReadFunction<any>;
  parentDisplayName?: FieldPolicy<any> | FieldReadFunction<any>;
  parentNameID?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'journey'
  | 'parentDisplayName'
  | 'parentNameID'
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
  journey?: FieldPolicy<any> | FieldReadFunction<any>;
  parentDisplayName?: FieldPolicy<any> | FieldReadFunction<any>;
  parentNameID?: FieldPolicy<any> | FieldReadFunction<any>;
  triggeredBy?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  whiteboard?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ActivityLogEntryChallengeCreatedKeySpecifier = (
  | 'challenge'
  | 'child'
  | 'collaborationID'
  | 'createdDate'
  | 'description'
  | 'id'
  | 'journey'
  | 'parentDisplayName'
  | 'parentNameID'
  | 'triggeredBy'
  | 'type'
  | ActivityLogEntryChallengeCreatedKeySpecifier
)[];
export type ActivityLogEntryChallengeCreatedFieldPolicy = {
  challenge?: FieldPolicy<any> | FieldReadFunction<any>;
  child?: FieldPolicy<any> | FieldReadFunction<any>;
  collaborationID?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  journey?: FieldPolicy<any> | FieldReadFunction<any>;
  parentDisplayName?: FieldPolicy<any> | FieldReadFunction<any>;
  parentNameID?: FieldPolicy<any> | FieldReadFunction<any>;
  triggeredBy?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ActivityLogEntryMemberJoinedKeySpecifier = (
  | 'child'
  | 'collaborationID'
  | 'community'
  | 'communityType'
  | 'createdDate'
  | 'description'
  | 'id'
  | 'journey'
  | 'parentDisplayName'
  | 'parentNameID'
  | 'triggeredBy'
  | 'type'
  | 'user'
  | ActivityLogEntryMemberJoinedKeySpecifier
)[];
export type ActivityLogEntryMemberJoinedFieldPolicy = {
  child?: FieldPolicy<any> | FieldReadFunction<any>;
  collaborationID?: FieldPolicy<any> | FieldReadFunction<any>;
  community?: FieldPolicy<any> | FieldReadFunction<any>;
  communityType?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  journey?: FieldPolicy<any> | FieldReadFunction<any>;
  parentDisplayName?: FieldPolicy<any> | FieldReadFunction<any>;
  parentNameID?: FieldPolicy<any> | FieldReadFunction<any>;
  triggeredBy?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  user?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ActivityLogEntryOpportunityCreatedKeySpecifier = (
  | 'child'
  | 'collaborationID'
  | 'createdDate'
  | 'description'
  | 'id'
  | 'journey'
  | 'opportunity'
  | 'parentDisplayName'
  | 'parentNameID'
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
  journey?: FieldPolicy<any> | FieldReadFunction<any>;
  opportunity?: FieldPolicy<any> | FieldReadFunction<any>;
  parentDisplayName?: FieldPolicy<any> | FieldReadFunction<any>;
  parentNameID?: FieldPolicy<any> | FieldReadFunction<any>;
  triggeredBy?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ActivityLogEntryUpdateSentKeySpecifier = (
  | 'child'
  | 'collaborationID'
  | 'createdDate'
  | 'description'
  | 'id'
  | 'journey'
  | 'message'
  | 'parentDisplayName'
  | 'parentNameID'
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
  journey?: FieldPolicy<any> | FieldReadFunction<any>;
  message?: FieldPolicy<any> | FieldReadFunction<any>;
  parentDisplayName?: FieldPolicy<any> | FieldReadFunction<any>;
  parentNameID?: FieldPolicy<any> | FieldReadFunction<any>;
  triggeredBy?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  updates?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ActorKeySpecifier = (
  | 'authorization'
  | 'description'
  | 'id'
  | 'impact'
  | 'name'
  | 'value'
  | ActorKeySpecifier
)[];
export type ActorFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  impact?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  value?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ActorGroupKeySpecifier = (
  | 'actors'
  | 'authorization'
  | 'description'
  | 'id'
  | 'name'
  | ActorGroupKeySpecifier
)[];
export type ActorGroupFieldPolicy = {
  actors?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AgentKeySpecifier = (
  | 'authorization'
  | 'credentials'
  | 'did'
  | 'id'
  | 'verifiedCredentials'
  | AgentKeySpecifier
)[];
export type AgentFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  credentials?: FieldPolicy<any> | FieldReadFunction<any>;
  did?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type ApplicationKeySpecifier = (
  | 'authorization'
  | 'createdDate'
  | 'id'
  | 'lifecycle'
  | 'questions'
  | 'updatedDate'
  | 'user'
  | ApplicationKeySpecifier
)[];
export type ApplicationFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  lifecycle?: FieldPolicy<any> | FieldReadFunction<any>;
  questions?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  user?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ApplicationForRoleResultKeySpecifier = (
  | 'challengeID'
  | 'communityID'
  | 'createdDate'
  | 'displayName'
  | 'id'
  | 'opportunityID'
  | 'spaceID'
  | 'state'
  | 'updatedDate'
  | ApplicationForRoleResultKeySpecifier
)[];
export type ApplicationForRoleResultFieldPolicy = {
  challengeID?: FieldPolicy<any> | FieldReadFunction<any>;
  communityID?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  opportunityID?: FieldPolicy<any> | FieldReadFunction<any>;
  spaceID?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'anonymousReadAccess'
  | 'credentialRules'
  | 'id'
  | 'myPrivileges'
  | 'privilegeRules'
  | 'verifiedCredentialRules'
  | AuthorizationKeySpecifier
)[];
export type AuthorizationFieldPolicy = {
  anonymousReadAccess?: FieldPolicy<any> | FieldReadFunction<any>;
  credentialRules?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  myPrivileges?: FieldPolicy<any> | FieldReadFunction<any>;
  privilegeRules?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type CalendarKeySpecifier = ('authorization' | 'event' | 'events' | 'id' | CalendarKeySpecifier)[];
export type CalendarFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  event?: FieldPolicy<any> | FieldReadFunction<any>;
  events?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'framing'
  | 'id'
  | 'nameID'
  | 'posts'
  | 'publishedBy'
  | 'publishedDate'
  | 'sortOrder'
  | 'type'
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
  framing?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  posts?: FieldPolicy<any> | FieldReadFunction<any>;
  publishedBy?: FieldPolicy<any> | FieldReadFunction<any>;
  publishedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  sortOrder?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  visibility?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CalloutContributionKeySpecifier = (
  | 'authorization'
  | 'createdBy'
  | 'id'
  | 'link'
  | 'post'
  | 'whiteboard'
  | CalloutContributionKeySpecifier
)[];
export type CalloutContributionFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdBy?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  link?: FieldPolicy<any> | FieldReadFunction<any>;
  post?: FieldPolicy<any> | FieldReadFunction<any>;
  whiteboard?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CalloutContributionDefaultsKeySpecifier = (
  | 'id'
  | 'postDescription'
  | 'whiteboardContent'
  | CalloutContributionDefaultsKeySpecifier
)[];
export type CalloutContributionDefaultsFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  postDescription?: FieldPolicy<any> | FieldReadFunction<any>;
  whiteboardContent?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CalloutContributionPolicyKeySpecifier = (
  | 'allowedContributionTypes'
  | 'id'
  | 'state'
  | CalloutContributionPolicyKeySpecifier
)[];
export type CalloutContributionPolicyFieldPolicy = {
  allowedContributionTypes?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  state?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CalloutFramingKeySpecifier = (
  | 'authorization'
  | 'id'
  | 'profile'
  | 'whiteboard'
  | CalloutFramingKeySpecifier
)[];
export type CalloutFramingFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  whiteboard?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CalloutPostCreatedKeySpecifier = ('calloutID' | 'post' | CalloutPostCreatedKeySpecifier)[];
export type CalloutPostCreatedFieldPolicy = {
  calloutID?: FieldPolicy<any> | FieldReadFunction<any>;
  post?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CalloutTemplateKeySpecifier = (
  | 'authorization'
  | 'contributionDefaults'
  | 'contributionPolicy'
  | 'framing'
  | 'id'
  | 'profile'
  | 'type'
  | CalloutTemplateKeySpecifier
)[];
export type CalloutTemplateFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  contributionDefaults?: FieldPolicy<any> | FieldReadFunction<any>;
  contributionPolicy?: FieldPolicy<any> | FieldReadFunction<any>;
  framing?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ChallengeKeySpecifier = (
  | 'account'
  | 'agent'
  | 'authorization'
  | 'collaboration'
  | 'community'
  | 'context'
  | 'id'
  | 'metrics'
  | 'nameID'
  | 'opportunities'
  | 'preferences'
  | 'profile'
  | 'storageAggregator'
  | ChallengeKeySpecifier
)[];
export type ChallengeFieldPolicy = {
  account?: FieldPolicy<any> | FieldReadFunction<any>;
  agent?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  collaboration?: FieldPolicy<any> | FieldReadFunction<any>;
  community?: FieldPolicy<any> | FieldReadFunction<any>;
  context?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  metrics?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  opportunities?: FieldPolicy<any> | FieldReadFunction<any>;
  preferences?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  storageAggregator?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ChallengeCreatedKeySpecifier = ('challenge' | 'spaceID' | ChallengeCreatedKeySpecifier)[];
export type ChallengeCreatedFieldPolicy = {
  challenge?: FieldPolicy<any> | FieldReadFunction<any>;
  spaceID?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ChallengeTemplateKeySpecifier = ('feedback' | 'name' | ChallengeTemplateKeySpecifier)[];
export type ChallengeTemplateFieldPolicy = {
  feedback?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ChatGuidanceResultKeySpecifier = (
  | 'answer'
  | 'id'
  | 'question'
  | 'sources'
  | ChatGuidanceResultKeySpecifier
)[];
export type ChatGuidanceResultFieldPolicy = {
  answer?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  question?: FieldPolicy<any> | FieldReadFunction<any>;
  sources?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CollaborationKeySpecifier = (
  | 'authorization'
  | 'callouts'
  | 'id'
  | 'innovationFlow'
  | 'relations'
  | 'tagsetTemplates'
  | 'timeline'
  | CollaborationKeySpecifier
)[];
export type CollaborationFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  callouts?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationFlow?: FieldPolicy<any> | FieldReadFunction<any>;
  relations?: FieldPolicy<any> | FieldReadFunction<any>;
  tagsetTemplates?: FieldPolicy<any> | FieldReadFunction<any>;
  timeline?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CommunicationKeySpecifier = (
  | 'authorization'
  | 'discussion'
  | 'discussionCategories'
  | 'discussions'
  | 'id'
  | 'updates'
  | CommunicationKeySpecifier
)[];
export type CommunicationFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  discussion?: FieldPolicy<any> | FieldReadFunction<any>;
  discussionCategories?: FieldPolicy<any> | FieldReadFunction<any>;
  discussions?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'applicationForm'
  | 'applications'
  | 'authorization'
  | 'availableLeadUsers'
  | 'availableMemberUsers'
  | 'communication'
  | 'groups'
  | 'id'
  | 'invitations'
  | 'invitationsExternal'
  | 'memberUsers'
  | 'myMembershipStatus'
  | 'myRoles'
  | 'organizationsInRole'
  | 'policy'
  | 'usersInRole'
  | CommunityKeySpecifier
)[];
export type CommunityFieldPolicy = {
  applicationForm?: FieldPolicy<any> | FieldReadFunction<any>;
  applications?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  availableLeadUsers?: FieldPolicy<any> | FieldReadFunction<any>;
  availableMemberUsers?: FieldPolicy<any> | FieldReadFunction<any>;
  communication?: FieldPolicy<any> | FieldReadFunction<any>;
  groups?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  invitations?: FieldPolicy<any> | FieldReadFunction<any>;
  invitationsExternal?: FieldPolicy<any> | FieldReadFunction<any>;
  memberUsers?: FieldPolicy<any> | FieldReadFunction<any>;
  myMembershipStatus?: FieldPolicy<any> | FieldReadFunction<any>;
  myRoles?: FieldPolicy<any> | FieldReadFunction<any>;
  organizationsInRole?: FieldPolicy<any> | FieldReadFunction<any>;
  policy?: FieldPolicy<any> | FieldReadFunction<any>;
  usersInRole?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CommunityPolicyKeySpecifier = ('admin' | 'host' | 'id' | 'lead' | 'member' | CommunityPolicyKeySpecifier)[];
export type CommunityPolicyFieldPolicy = {
  admin?: FieldPolicy<any> | FieldReadFunction<any>;
  host?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  lead?: FieldPolicy<any> | FieldReadFunction<any>;
  member?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CommunityRolePolicyKeySpecifier = (
  | 'credential'
  | 'enabled'
  | 'maxOrg'
  | 'maxUser'
  | 'minOrg'
  | 'minUser'
  | 'parentCredentials'
  | CommunityRolePolicyKeySpecifier
)[];
export type CommunityRolePolicyFieldPolicy = {
  credential?: FieldPolicy<any> | FieldReadFunction<any>;
  enabled?: FieldPolicy<any> | FieldReadFunction<any>;
  maxOrg?: FieldPolicy<any> | FieldReadFunction<any>;
  maxUser?: FieldPolicy<any> | FieldReadFunction<any>;
  minOrg?: FieldPolicy<any> | FieldReadFunction<any>;
  minUser?: FieldPolicy<any> | FieldReadFunction<any>;
  parentCredentials?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ConfigKeySpecifier = (
  | 'apm'
  | 'authentication'
  | 'featureFlags'
  | 'geo'
  | 'locations'
  | 'sentry'
  | 'storage'
  | 'template'
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
  template?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ContextKeySpecifier = (
  | 'authorization'
  | 'ecosystemModel'
  | 'id'
  | 'impact'
  | 'vision'
  | 'who'
  | ContextKeySpecifier
)[];
export type ContextFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  ecosystemModel?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  impact?: FieldPolicy<any> | FieldReadFunction<any>;
  vision?: FieldPolicy<any> | FieldReadFunction<any>;
  who?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type CredentialKeySpecifier = ('id' | 'resourceID' | 'type' | CredentialKeySpecifier)[];
export type CredentialFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  resourceID?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'id'
  | 'nameID'
  | 'profile'
  | 'timestamp'
  | DiscussionKeySpecifier
)[];
export type DiscussionFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  category?: FieldPolicy<any> | FieldReadFunction<any>;
  comments?: FieldPolicy<any> | FieldReadFunction<any>;
  createdBy?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  timestamp?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type DocumentKeySpecifier = (
  | 'authorization'
  | 'createdBy'
  | 'displayName'
  | 'id'
  | 'mimeType'
  | 'size'
  | 'tagset'
  | 'uploadedDate'
  | 'url'
  | DocumentKeySpecifier
)[];
export type DocumentFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdBy?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  mimeType?: FieldPolicy<any> | FieldReadFunction<any>;
  size?: FieldPolicy<any> | FieldReadFunction<any>;
  tagset?: FieldPolicy<any> | FieldReadFunction<any>;
  uploadedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type EcosystemModelKeySpecifier = (
  | 'actorGroups'
  | 'authorization'
  | 'description'
  | 'id'
  | EcosystemModelKeySpecifier
)[];
export type EcosystemModelFieldPolicy = {
  actorGroups?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type FeedbackTemplateKeySpecifier = ('name' | 'questions' | FeedbackTemplateKeySpecifier)[];
export type FeedbackTemplateFieldPolicy = {
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  questions?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type FileStorageConfigKeySpecifier = ('maxFileSize' | 'mimeTypes' | FileStorageConfigKeySpecifier)[];
export type FileStorageConfigFieldPolicy = {
  maxFileSize?: FieldPolicy<any> | FieldReadFunction<any>;
  mimeTypes?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type FormKeySpecifier = ('description' | 'id' | 'questions' | FormKeySpecifier)[];
export type FormFieldPolicy = {
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  questions?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'currentState'
  | 'id'
  | 'profile'
  | 'states'
  | InnovationFlowKeySpecifier
)[];
export type InnovationFlowFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  currentState?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  states?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InnovationFlowStateKeySpecifier = ('description' | 'displayName' | InnovationFlowStateKeySpecifier)[];
export type InnovationFlowStateFieldPolicy = {
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InnovationFlowTemplateKeySpecifier = (
  | 'authorization'
  | 'id'
  | 'profile'
  | 'states'
  | InnovationFlowTemplateKeySpecifier
)[];
export type InnovationFlowTemplateFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  states?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InnovationHubKeySpecifier = (
  | 'authorization'
  | 'id'
  | 'nameID'
  | 'profile'
  | 'spaceListFilter'
  | 'spaceVisibilityFilter'
  | 'subdomain'
  | 'type'
  | InnovationHubKeySpecifier
)[];
export type InnovationHubFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  spaceListFilter?: FieldPolicy<any> | FieldReadFunction<any>;
  spaceVisibilityFilter?: FieldPolicy<any> | FieldReadFunction<any>;
  subdomain?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InnovationPackKeySpecifier = (
  | 'authorization'
  | 'id'
  | 'nameID'
  | 'profile'
  | 'provider'
  | 'templates'
  | InnovationPackKeySpecifier
)[];
export type InnovationPackFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  provider?: FieldPolicy<any> | FieldReadFunction<any>;
  templates?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InvitationKeySpecifier = (
  | 'authorization'
  | 'createdBy'
  | 'createdDate'
  | 'id'
  | 'lifecycle'
  | 'updatedDate'
  | 'user'
  | 'welcomeMessage'
  | InvitationKeySpecifier
)[];
export type InvitationFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdBy?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  lifecycle?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  user?: FieldPolicy<any> | FieldReadFunction<any>;
  welcomeMessage?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InvitationExternalKeySpecifier = (
  | 'authorization'
  | 'createdBy'
  | 'createdDate'
  | 'email'
  | 'firstName'
  | 'id'
  | 'lastName'
  | 'profileCreated'
  | 'welcomeMessage'
  | InvitationExternalKeySpecifier
)[];
export type InvitationExternalFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  createdBy?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  email?: FieldPolicy<any> | FieldReadFunction<any>;
  firstName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  lastName?: FieldPolicy<any> | FieldReadFunction<any>;
  profileCreated?: FieldPolicy<any> | FieldReadFunction<any>;
  welcomeMessage?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type InvitationForRoleResultKeySpecifier = (
  | 'challengeID'
  | 'communityID'
  | 'createdBy'
  | 'createdDate'
  | 'displayName'
  | 'id'
  | 'opportunityID'
  | 'spaceID'
  | 'state'
  | 'updatedDate'
  | 'welcomeMessage'
  | InvitationForRoleResultKeySpecifier
)[];
export type InvitationForRoleResultFieldPolicy = {
  challengeID?: FieldPolicy<any> | FieldReadFunction<any>;
  communityID?: FieldPolicy<any> | FieldReadFunction<any>;
  createdBy?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  opportunityID?: FieldPolicy<any> | FieldReadFunction<any>;
  spaceID?: FieldPolicy<any> | FieldReadFunction<any>;
  state?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
  welcomeMessage?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type JourneyKeySpecifier = ('authorization' | 'collaboration' | 'id' | 'nameID' | JourneyKeySpecifier)[];
export type JourneyFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  collaboration?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type LibraryKeySpecifier = (
  | 'authorization'
  | 'id'
  | 'innovationPack'
  | 'innovationPacks'
  | 'storageAggregator'
  | LibraryKeySpecifier
)[];
export type LibraryFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationPack?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationPacks?: FieldPolicy<any> | FieldReadFunction<any>;
  storageAggregator?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type LicenseKeySpecifier = ('authorization' | 'featureFlags' | 'id' | 'visibility' | LicenseKeySpecifier)[];
export type LicenseFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  featureFlags?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  visibility?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type LicenseFeatureFlagKeySpecifier = ('enabled' | 'name' | LicenseFeatureFlagKeySpecifier)[];
export type LicenseFeatureFlagFieldPolicy = {
  enabled?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type LifecycleKeySpecifier = (
  | 'id'
  | 'machineDef'
  | 'nextEvents'
  | 'state'
  | 'stateIsFinal'
  | 'templateName'
  | LifecycleKeySpecifier
)[];
export type LifecycleFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  machineDef?: FieldPolicy<any> | FieldReadFunction<any>;
  nextEvents?: FieldPolicy<any> | FieldReadFunction<any>;
  state?: FieldPolicy<any> | FieldReadFunction<any>;
  stateIsFinal?: FieldPolicy<any> | FieldReadFunction<any>;
  templateName?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type LinkKeySpecifier = ('authorization' | 'id' | 'profile' | 'uri' | LinkKeySpecifier)[];
export type LinkFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  uri?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type LocationKeySpecifier = (
  | 'addressLine1'
  | 'addressLine2'
  | 'city'
  | 'country'
  | 'id'
  | 'postalCode'
  | 'stateOrProvince'
  | LocationKeySpecifier
)[];
export type LocationFieldPolicy = {
  addressLine1?: FieldPolicy<any> | FieldReadFunction<any>;
  addressLine2?: FieldPolicy<any> | FieldReadFunction<any>;
  city?: FieldPolicy<any> | FieldReadFunction<any>;
  country?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  postalCode?: FieldPolicy<any> | FieldReadFunction<any>;
  stateOrProvince?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type LookupQueryResultsKeySpecifier = (
  | 'application'
  | 'authorizationPolicy'
  | 'authorizationPrivilegesForUser'
  | 'calendar'
  | 'calendarEvent'
  | 'callout'
  | 'calloutTemplate'
  | 'challenge'
  | 'collaboration'
  | 'community'
  | 'context'
  | 'document'
  | 'innovationFlow'
  | 'innovationFlowTemplate'
  | 'invitation'
  | 'opportunity'
  | 'post'
  | 'profile'
  | 'room'
  | 'storageAggregator'
  | 'whiteboard'
  | 'whiteboardTemplate'
  | LookupQueryResultsKeySpecifier
)[];
export type LookupQueryResultsFieldPolicy = {
  application?: FieldPolicy<any> | FieldReadFunction<any>;
  authorizationPolicy?: FieldPolicy<any> | FieldReadFunction<any>;
  authorizationPrivilegesForUser?: FieldPolicy<any> | FieldReadFunction<any>;
  calendar?: FieldPolicy<any> | FieldReadFunction<any>;
  calendarEvent?: FieldPolicy<any> | FieldReadFunction<any>;
  callout?: FieldPolicy<any> | FieldReadFunction<any>;
  calloutTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
  challenge?: FieldPolicy<any> | FieldReadFunction<any>;
  collaboration?: FieldPolicy<any> | FieldReadFunction<any>;
  community?: FieldPolicy<any> | FieldReadFunction<any>;
  context?: FieldPolicy<any> | FieldReadFunction<any>;
  document?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationFlow?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationFlowTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
  invitation?: FieldPolicy<any> | FieldReadFunction<any>;
  opportunity?: FieldPolicy<any> | FieldReadFunction<any>;
  post?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  room?: FieldPolicy<any> | FieldReadFunction<any>;
  storageAggregator?: FieldPolicy<any> | FieldReadFunction<any>;
  whiteboard?: FieldPolicy<any> | FieldReadFunction<any>;
  whiteboardTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MeQueryResultsKeySpecifier = (
  | 'applications'
  | 'id'
  | 'invitations'
  | 'myJourneys'
  | 'spaceMemberships'
  | 'user'
  | MeQueryResultsKeySpecifier
)[];
export type MeQueryResultsFieldPolicy = {
  applications?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  invitations?: FieldPolicy<any> | FieldReadFunction<any>;
  myJourneys?: FieldPolicy<any> | FieldReadFunction<any>;
  spaceMemberships?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type MetadataKeySpecifier = ('services' | MetadataKeySpecifier)[];
export type MetadataFieldPolicy = {
  services?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MutationKeySpecifier = (
  | 'addReactionToMessageInRoom'
  | 'adminCommunicationEnsureAccessToCommunications'
  | 'adminCommunicationRemoveOrphanedRoom'
  | 'adminCommunicationUpdateRoomsJoinRule'
  | 'applyForCommunityMembership'
  | 'assignCommunityRoleToOrganization'
  | 'assignCommunityRoleToUser'
  | 'assignUserAsGlobalAdmin'
  | 'assignUserAsGlobalCommunityAdmin'
  | 'assignUserAsGlobalSpacesAdmin'
  | 'assignUserAsOrganizationAdmin'
  | 'assignUserAsOrganizationOwner'
  | 'assignUserToGroup'
  | 'assignUserToOrganization'
  | 'authorizationPolicyResetAll'
  | 'authorizationPolicyResetOnOrganization'
  | 'authorizationPolicyResetOnPlatform'
  | 'authorizationPolicyResetOnSpace'
  | 'authorizationPolicyResetOnUser'
  | 'beginAlkemioUserVerifiedCredentialOfferInteraction'
  | 'beginCommunityMemberVerifiedCredentialOfferInteraction'
  | 'beginVerifiedCredentialRequestInteraction'
  | 'convertChallengeToSpace'
  | 'convertOpportunityToChallenge'
  | 'createActor'
  | 'createActorGroup'
  | 'createCalloutOnCollaboration'
  | 'createCalloutTemplate'
  | 'createChallenge'
  | 'createContributionOnCallout'
  | 'createDiscussion'
  | 'createEventOnCalendar'
  | 'createFeedbackOnCommunityContext'
  | 'createGroupOnCommunity'
  | 'createGroupOnOrganization'
  | 'createInnovationFlowTemplate'
  | 'createInnovationHub'
  | 'createInnovationPackOnLibrary'
  | 'createOpportunity'
  | 'createOrganization'
  | 'createPostTemplate'
  | 'createReferenceOnProfile'
  | 'createRelationOnCollaboration'
  | 'createSpace'
  | 'createTagsetOnProfile'
  | 'createUser'
  | 'createUserNewRegistration'
  | 'createWhiteboardTemplate'
  | 'deleteActor'
  | 'deleteActorGroup'
  | 'deleteCalendarEvent'
  | 'deleteCallout'
  | 'deleteCalloutTemplate'
  | 'deleteChallenge'
  | 'deleteCollaboration'
  | 'deleteDiscussion'
  | 'deleteDocument'
  | 'deleteInnovationFlowTemplate'
  | 'deleteInnovationHub'
  | 'deleteInnovationPack'
  | 'deleteInvitation'
  | 'deleteInvitationExternal'
  | 'deleteLink'
  | 'deleteOpportunity'
  | 'deleteOrganization'
  | 'deletePost'
  | 'deletePostTemplate'
  | 'deleteReference'
  | 'deleteRelation'
  | 'deleteSpace'
  | 'deleteStorageBucket'
  | 'deleteUser'
  | 'deleteUserApplication'
  | 'deleteUserGroup'
  | 'deleteWhiteboard'
  | 'deleteWhiteboardTemplate'
  | 'eventOnApplication'
  | 'eventOnCommunityInvitation'
  | 'eventOnOrganizationVerification'
  | 'grantCredentialToOrganization'
  | 'grantCredentialToUser'
  | 'ingest'
  | 'inviteExistingUserForCommunityMembership'
  | 'inviteExternalUserForCommunityMembership'
  | 'joinCommunity'
  | 'messageUser'
  | 'moveContributionToCallout'
  | 'removeCommunityRoleFromOrganization'
  | 'removeCommunityRoleFromUser'
  | 'removeMessageOnRoom'
  | 'removeReactionToMessageInRoom'
  | 'removeUserAsGlobalAdmin'
  | 'removeUserAsGlobalCommunityAdmin'
  | 'removeUserAsGlobalSpacesAdmin'
  | 'removeUserAsOrganizationAdmin'
  | 'removeUserAsOrganizationOwner'
  | 'removeUserFromGroup'
  | 'removeUserFromOrganization'
  | 'resetChatGuidance'
  | 'revokeCredentialFromOrganization'
  | 'revokeCredentialFromUser'
  | 'sendMessageReplyToRoom'
  | 'sendMessageToCommunityLeads'
  | 'sendMessageToOrganization'
  | 'sendMessageToRoom'
  | 'sendMessageToUser'
  | 'updateActor'
  | 'updateAnswerRelevance'
  | 'updateCalendarEvent'
  | 'updateCallout'
  | 'updateCalloutPublishInfo'
  | 'updateCalloutTemplate'
  | 'updateCalloutVisibility'
  | 'updateCalloutsSortOrder'
  | 'updateChallenge'
  | 'updateCommunityApplicationForm'
  | 'updateDiscussion'
  | 'updateDocument'
  | 'updateEcosystemModel'
  | 'updateInnovationFlow'
  | 'updateInnovationFlowSelectedState'
  | 'updateInnovationFlowSingleState'
  | 'updateInnovationFlowStatesFromTemplate'
  | 'updateInnovationFlowTemplate'
  | 'updateInnovationHub'
  | 'updateInnovationPack'
  | 'updateLink'
  | 'updateOpportunity'
  | 'updateOrganization'
  | 'updatePost'
  | 'updatePostTemplate'
  | 'updatePreferenceOnChallenge'
  | 'updatePreferenceOnOrganization'
  | 'updatePreferenceOnSpace'
  | 'updatePreferenceOnUser'
  | 'updateProfile'
  | 'updateReference'
  | 'updateSpace'
  | 'updateSpacePlatformSettings'
  | 'updateTagset'
  | 'updateUser'
  | 'updateUserGroup'
  | 'updateUserPlatformSettings'
  | 'updateVisual'
  | 'updateWhiteboard'
  | 'updateWhiteboardContent'
  | 'updateWhiteboardTemplate'
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
  adminCommunicationUpdateRoomsJoinRule?: FieldPolicy<any> | FieldReadFunction<any>;
  applyForCommunityMembership?: FieldPolicy<any> | FieldReadFunction<any>;
  assignCommunityRoleToOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  assignCommunityRoleToUser?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserAsGlobalAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserAsGlobalCommunityAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserAsGlobalSpacesAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserAsOrganizationAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserAsOrganizationOwner?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserToGroup?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserToOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  authorizationPolicyResetAll?: FieldPolicy<any> | FieldReadFunction<any>;
  authorizationPolicyResetOnOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  authorizationPolicyResetOnPlatform?: FieldPolicy<any> | FieldReadFunction<any>;
  authorizationPolicyResetOnSpace?: FieldPolicy<any> | FieldReadFunction<any>;
  authorizationPolicyResetOnUser?: FieldPolicy<any> | FieldReadFunction<any>;
  beginAlkemioUserVerifiedCredentialOfferInteraction?: FieldPolicy<any> | FieldReadFunction<any>;
  beginCommunityMemberVerifiedCredentialOfferInteraction?: FieldPolicy<any> | FieldReadFunction<any>;
  beginVerifiedCredentialRequestInteraction?: FieldPolicy<any> | FieldReadFunction<any>;
  convertChallengeToSpace?: FieldPolicy<any> | FieldReadFunction<any>;
  convertOpportunityToChallenge?: FieldPolicy<any> | FieldReadFunction<any>;
  createActor?: FieldPolicy<any> | FieldReadFunction<any>;
  createActorGroup?: FieldPolicy<any> | FieldReadFunction<any>;
  createCalloutOnCollaboration?: FieldPolicy<any> | FieldReadFunction<any>;
  createCalloutTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
  createChallenge?: FieldPolicy<any> | FieldReadFunction<any>;
  createContributionOnCallout?: FieldPolicy<any> | FieldReadFunction<any>;
  createDiscussion?: FieldPolicy<any> | FieldReadFunction<any>;
  createEventOnCalendar?: FieldPolicy<any> | FieldReadFunction<any>;
  createFeedbackOnCommunityContext?: FieldPolicy<any> | FieldReadFunction<any>;
  createGroupOnCommunity?: FieldPolicy<any> | FieldReadFunction<any>;
  createGroupOnOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  createInnovationFlowTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
  createInnovationHub?: FieldPolicy<any> | FieldReadFunction<any>;
  createInnovationPackOnLibrary?: FieldPolicy<any> | FieldReadFunction<any>;
  createOpportunity?: FieldPolicy<any> | FieldReadFunction<any>;
  createOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  createPostTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
  createReferenceOnProfile?: FieldPolicy<any> | FieldReadFunction<any>;
  createRelationOnCollaboration?: FieldPolicy<any> | FieldReadFunction<any>;
  createSpace?: FieldPolicy<any> | FieldReadFunction<any>;
  createTagsetOnProfile?: FieldPolicy<any> | FieldReadFunction<any>;
  createUser?: FieldPolicy<any> | FieldReadFunction<any>;
  createUserNewRegistration?: FieldPolicy<any> | FieldReadFunction<any>;
  createWhiteboardTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteActor?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteActorGroup?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteCalendarEvent?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteCallout?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteCalloutTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteChallenge?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteCollaboration?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteDiscussion?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteDocument?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteInnovationFlowTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteInnovationHub?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteInnovationPack?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteInvitation?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteInvitationExternal?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteLink?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteOpportunity?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  deletePost?: FieldPolicy<any> | FieldReadFunction<any>;
  deletePostTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteReference?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteRelation?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteSpace?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteStorageBucket?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteUser?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteUserApplication?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteUserGroup?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteWhiteboard?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteWhiteboardTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
  eventOnApplication?: FieldPolicy<any> | FieldReadFunction<any>;
  eventOnCommunityInvitation?: FieldPolicy<any> | FieldReadFunction<any>;
  eventOnOrganizationVerification?: FieldPolicy<any> | FieldReadFunction<any>;
  grantCredentialToOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  grantCredentialToUser?: FieldPolicy<any> | FieldReadFunction<any>;
  ingest?: FieldPolicy<any> | FieldReadFunction<any>;
  inviteExistingUserForCommunityMembership?: FieldPolicy<any> | FieldReadFunction<any>;
  inviteExternalUserForCommunityMembership?: FieldPolicy<any> | FieldReadFunction<any>;
  joinCommunity?: FieldPolicy<any> | FieldReadFunction<any>;
  messageUser?: FieldPolicy<any> | FieldReadFunction<any>;
  moveContributionToCallout?: FieldPolicy<any> | FieldReadFunction<any>;
  removeCommunityRoleFromOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  removeCommunityRoleFromUser?: FieldPolicy<any> | FieldReadFunction<any>;
  removeMessageOnRoom?: FieldPolicy<any> | FieldReadFunction<any>;
  removeReactionToMessageInRoom?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserAsGlobalAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserAsGlobalCommunityAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserAsGlobalSpacesAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserAsOrganizationAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserAsOrganizationOwner?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserFromGroup?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserFromOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  resetChatGuidance?: FieldPolicy<any> | FieldReadFunction<any>;
  revokeCredentialFromOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  revokeCredentialFromUser?: FieldPolicy<any> | FieldReadFunction<any>;
  sendMessageReplyToRoom?: FieldPolicy<any> | FieldReadFunction<any>;
  sendMessageToCommunityLeads?: FieldPolicy<any> | FieldReadFunction<any>;
  sendMessageToOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  sendMessageToRoom?: FieldPolicy<any> | FieldReadFunction<any>;
  sendMessageToUser?: FieldPolicy<any> | FieldReadFunction<any>;
  updateActor?: FieldPolicy<any> | FieldReadFunction<any>;
  updateAnswerRelevance?: FieldPolicy<any> | FieldReadFunction<any>;
  updateCalendarEvent?: FieldPolicy<any> | FieldReadFunction<any>;
  updateCallout?: FieldPolicy<any> | FieldReadFunction<any>;
  updateCalloutPublishInfo?: FieldPolicy<any> | FieldReadFunction<any>;
  updateCalloutTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
  updateCalloutVisibility?: FieldPolicy<any> | FieldReadFunction<any>;
  updateCalloutsSortOrder?: FieldPolicy<any> | FieldReadFunction<any>;
  updateChallenge?: FieldPolicy<any> | FieldReadFunction<any>;
  updateCommunityApplicationForm?: FieldPolicy<any> | FieldReadFunction<any>;
  updateDiscussion?: FieldPolicy<any> | FieldReadFunction<any>;
  updateDocument?: FieldPolicy<any> | FieldReadFunction<any>;
  updateEcosystemModel?: FieldPolicy<any> | FieldReadFunction<any>;
  updateInnovationFlow?: FieldPolicy<any> | FieldReadFunction<any>;
  updateInnovationFlowSelectedState?: FieldPolicy<any> | FieldReadFunction<any>;
  updateInnovationFlowSingleState?: FieldPolicy<any> | FieldReadFunction<any>;
  updateInnovationFlowStatesFromTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
  updateInnovationFlowTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
  updateInnovationHub?: FieldPolicy<any> | FieldReadFunction<any>;
  updateInnovationPack?: FieldPolicy<any> | FieldReadFunction<any>;
  updateLink?: FieldPolicy<any> | FieldReadFunction<any>;
  updateOpportunity?: FieldPolicy<any> | FieldReadFunction<any>;
  updateOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  updatePost?: FieldPolicy<any> | FieldReadFunction<any>;
  updatePostTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
  updatePreferenceOnChallenge?: FieldPolicy<any> | FieldReadFunction<any>;
  updatePreferenceOnOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  updatePreferenceOnSpace?: FieldPolicy<any> | FieldReadFunction<any>;
  updatePreferenceOnUser?: FieldPolicy<any> | FieldReadFunction<any>;
  updateProfile?: FieldPolicy<any> | FieldReadFunction<any>;
  updateReference?: FieldPolicy<any> | FieldReadFunction<any>;
  updateSpace?: FieldPolicy<any> | FieldReadFunction<any>;
  updateSpacePlatformSettings?: FieldPolicy<any> | FieldReadFunction<any>;
  updateTagset?: FieldPolicy<any> | FieldReadFunction<any>;
  updateUser?: FieldPolicy<any> | FieldReadFunction<any>;
  updateUserGroup?: FieldPolicy<any> | FieldReadFunction<any>;
  updateUserPlatformSettings?: FieldPolicy<any> | FieldReadFunction<any>;
  updateVisual?: FieldPolicy<any> | FieldReadFunction<any>;
  updateWhiteboard?: FieldPolicy<any> | FieldReadFunction<any>;
  updateWhiteboardContent?: FieldPolicy<any> | FieldReadFunction<any>;
  updateWhiteboardTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
  uploadFileOnLink?: FieldPolicy<any> | FieldReadFunction<any>;
  uploadFileOnReference?: FieldPolicy<any> | FieldReadFunction<any>;
  uploadFileOnStorageBucket?: FieldPolicy<any> | FieldReadFunction<any>;
  uploadImageOnVisual?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MyJourneyResultsKeySpecifier = ('journey' | 'latestActivity' | MyJourneyResultsKeySpecifier)[];
export type MyJourneyResultsFieldPolicy = {
  journey?: FieldPolicy<any> | FieldReadFunction<any>;
  latestActivity?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type NVPKeySpecifier = ('id' | 'name' | 'value' | NVPKeySpecifier)[];
export type NVPFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  value?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type OpportunityKeySpecifier = (
  | 'account'
  | 'authorization'
  | 'collaboration'
  | 'community'
  | 'context'
  | 'id'
  | 'metrics'
  | 'nameID'
  | 'parentNameID'
  | 'profile'
  | 'storageAggregator'
  | OpportunityKeySpecifier
)[];
export type OpportunityFieldPolicy = {
  account?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  collaboration?: FieldPolicy<any> | FieldReadFunction<any>;
  community?: FieldPolicy<any> | FieldReadFunction<any>;
  context?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  metrics?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  parentNameID?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  storageAggregator?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type OpportunityCreatedKeySpecifier = ('challengeID' | 'opportunity' | OpportunityCreatedKeySpecifier)[];
export type OpportunityCreatedFieldPolicy = {
  challengeID?: FieldPolicy<any> | FieldReadFunction<any>;
  opportunity?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type OrganizationKeySpecifier = (
  | 'admins'
  | 'agent'
  | 'associates'
  | 'authorization'
  | 'contactEmail'
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
  | 'verification'
  | 'website'
  | OrganizationKeySpecifier
)[];
export type OrganizationFieldPolicy = {
  admins?: FieldPolicy<any> | FieldReadFunction<any>;
  agent?: FieldPolicy<any> | FieldReadFunction<any>;
  associates?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  contactEmail?: FieldPolicy<any> | FieldReadFunction<any>;
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
  verification?: FieldPolicy<any> | FieldReadFunction<any>;
  website?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type OrganizationVerificationKeySpecifier = (
  | 'authorization'
  | 'id'
  | 'lifecycle'
  | 'status'
  | OrganizationVerificationKeySpecifier
)[];
export type OrganizationVerificationFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  lifecycle?: FieldPolicy<any> | FieldReadFunction<any>;
  status?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'communication'
  | 'configuration'
  | 'id'
  | 'innovationHub'
  | 'innovationHubs'
  | 'library'
  | 'metadata'
  | 'storageAggregator'
  | PlatformKeySpecifier
)[];
export type PlatformFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  communication?: FieldPolicy<any> | FieldReadFunction<any>;
  configuration?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationHub?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationHubs?: FieldPolicy<any> | FieldReadFunction<any>;
  library?: FieldPolicy<any> | FieldReadFunction<any>;
  metadata?: FieldPolicy<any> | FieldReadFunction<any>;
  storageAggregator?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PlatformFeatureFlagKeySpecifier = ('enabled' | 'name' | PlatformFeatureFlagKeySpecifier)[];
export type PlatformFeatureFlagFieldPolicy = {
  enabled?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PlatformLocationsKeySpecifier = (
  | 'about'
  | 'aup'
  | 'blog'
  | 'community'
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
  | 'terms'
  | 'tips'
  | PlatformLocationsKeySpecifier
)[];
export type PlatformLocationsFieldPolicy = {
  about?: FieldPolicy<any> | FieldReadFunction<any>;
  aup?: FieldPolicy<any> | FieldReadFunction<any>;
  blog?: FieldPolicy<any> | FieldReadFunction<any>;
  community?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'type'
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
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PostTemplateKeySpecifier = (
  | 'authorization'
  | 'defaultDescription'
  | 'id'
  | 'profile'
  | 'type'
  | PostTemplateKeySpecifier
)[];
export type PostTemplateFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  defaultDescription?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PreferenceKeySpecifier = ('authorization' | 'definition' | 'id' | 'value' | PreferenceKeySpecifier)[];
export type PreferenceFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  definition?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  value?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PreferenceDefinitionKeySpecifier = (
  | 'description'
  | 'displayName'
  | 'group'
  | 'id'
  | 'type'
  | 'valueType'
  | PreferenceDefinitionKeySpecifier
)[];
export type PreferenceDefinitionFieldPolicy = {
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  group?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  valueType?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ProfileKeySpecifier = (
  | 'authorization'
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
  | 'url'
  | 'visual'
  | 'visuals'
  | ProfileKeySpecifier
)[];
export type ProfileFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'activityFeed'
  | 'activityFeedGrouped'
  | 'activityLogOnCollaboration'
  | 'adminCommunicationMembership'
  | 'adminCommunicationOrphanedUsage'
  | 'askChatGuidanceQuestion'
  | 'getSupportedVerifiedCredentialMetadata'
  | 'lookup'
  | 'me'
  | 'organization'
  | 'organizations'
  | 'organizationsPaginated'
  | 'platform'
  | 'rolesOrganization'
  | 'rolesUser'
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
  | QueryKeySpecifier
)[];
export type QueryFieldPolicy = {
  activityFeed?: FieldPolicy<any> | FieldReadFunction<any>;
  activityFeedGrouped?: FieldPolicy<any> | FieldReadFunction<any>;
  activityLogOnCollaboration?: FieldPolicy<any> | FieldReadFunction<any>;
  adminCommunicationMembership?: FieldPolicy<any> | FieldReadFunction<any>;
  adminCommunicationOrphanedUsage?: FieldPolicy<any> | FieldReadFunction<any>;
  askChatGuidanceQuestion?: FieldPolicy<any> | FieldReadFunction<any>;
  getSupportedVerifiedCredentialMetadata?: FieldPolicy<any> | FieldReadFunction<any>;
  lookup?: FieldPolicy<any> | FieldReadFunction<any>;
  me?: FieldPolicy<any> | FieldReadFunction<any>;
  organization?: FieldPolicy<any> | FieldReadFunction<any>;
  organizations?: FieldPolicy<any> | FieldReadFunction<any>;
  organizationsPaginated?: FieldPolicy<any> | FieldReadFunction<any>;
  platform?: FieldPolicy<any> | FieldReadFunction<any>;
  rolesOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  rolesUser?: FieldPolicy<any> | FieldReadFunction<any>;
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
};
export type QuestionKeySpecifier = ('id' | 'name' | 'value' | QuestionKeySpecifier)[];
export type QuestionFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  value?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type QuestionTemplateKeySpecifier = ('question' | 'required' | 'sortOrder' | QuestionTemplateKeySpecifier)[];
export type QuestionTemplateFieldPolicy = {
  question?: FieldPolicy<any> | FieldReadFunction<any>;
  required?: FieldPolicy<any> | FieldReadFunction<any>;
  sortOrder?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ReactionKeySpecifier = ('emoji' | 'id' | 'sender' | 'timestamp' | ReactionKeySpecifier)[];
export type ReactionFieldPolicy = {
  emoji?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  sender?: FieldPolicy<any> | FieldReadFunction<any>;
  timestamp?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ReferenceKeySpecifier = ('authorization' | 'description' | 'id' | 'name' | 'uri' | ReferenceKeySpecifier)[];
export type ReferenceFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  uri?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type RelationKeySpecifier = (
  | 'actorName'
  | 'actorRole'
  | 'actorType'
  | 'authorization'
  | 'description'
  | 'id'
  | 'type'
  | RelationKeySpecifier
)[];
export type RelationFieldPolicy = {
  actorName?: FieldPolicy<any> | FieldReadFunction<any>;
  actorRole?: FieldPolicy<any> | FieldReadFunction<any>;
  actorType?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type RelayPaginatedSpaceKeySpecifier = (
  | 'account'
  | 'agent'
  | 'authorization'
  | 'challenge'
  | 'challenges'
  | 'collaboration'
  | 'community'
  | 'context'
  | 'createdDate'
  | 'group'
  | 'groups'
  | 'host'
  | 'id'
  | 'metrics'
  | 'nameID'
  | 'opportunity'
  | 'preferences'
  | 'profile'
  | 'storageAggregator'
  | RelayPaginatedSpaceKeySpecifier
)[];
export type RelayPaginatedSpaceFieldPolicy = {
  account?: FieldPolicy<any> | FieldReadFunction<any>;
  agent?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  challenge?: FieldPolicy<any> | FieldReadFunction<any>;
  challenges?: FieldPolicy<any> | FieldReadFunction<any>;
  collaboration?: FieldPolicy<any> | FieldReadFunction<any>;
  community?: FieldPolicy<any> | FieldReadFunction<any>;
  context?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  group?: FieldPolicy<any> | FieldReadFunction<any>;
  groups?: FieldPolicy<any> | FieldReadFunction<any>;
  host?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  metrics?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  opportunity?: FieldPolicy<any> | FieldReadFunction<any>;
  preferences?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  storageAggregator?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type RelayPaginatedUserKeySpecifier = (
  | 'accountUpn'
  | 'agent'
  | 'authorization'
  | 'communityRooms'
  | 'directRooms'
  | 'email'
  | 'firstName'
  | 'gender'
  | 'id'
  | 'isContactable'
  | 'lastName'
  | 'nameID'
  | 'phone'
  | 'preferences'
  | 'profile'
  | 'storageAggregator'
  | RelayPaginatedUserKeySpecifier
)[];
export type RelayPaginatedUserFieldPolicy = {
  accountUpn?: FieldPolicy<any> | FieldReadFunction<any>;
  agent?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  communityRooms?: FieldPolicy<any> | FieldReadFunction<any>;
  directRooms?: FieldPolicy<any> | FieldReadFunction<any>;
  email?: FieldPolicy<any> | FieldReadFunction<any>;
  firstName?: FieldPolicy<any> | FieldReadFunction<any>;
  gender?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  isContactable?: FieldPolicy<any> | FieldReadFunction<any>;
  lastName?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  phone?: FieldPolicy<any> | FieldReadFunction<any>;
  preferences?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  storageAggregator?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type RelayPaginatedUserEdgeKeySpecifier = ('node' | RelayPaginatedUserEdgeKeySpecifier)[];
export type RelayPaginatedUserEdgeFieldPolicy = {
  node?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type RelayPaginatedUserPageInfoKeySpecifier = (
  | 'endCursor'
  | 'hasNextPage'
  | 'hasPreviousPage'
  | 'startCursor'
  | RelayPaginatedUserPageInfoKeySpecifier
)[];
export type RelayPaginatedUserPageInfoFieldPolicy = {
  endCursor?: FieldPolicy<any> | FieldReadFunction<any>;
  hasNextPage?: FieldPolicy<any> | FieldReadFunction<any>;
  hasPreviousPage?: FieldPolicy<any> | FieldReadFunction<any>;
  startCursor?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'nameID'
  | 'roles'
  | 'userGroups'
  | RolesResultCommunityKeySpecifier
)[];
export type RolesResultCommunityFieldPolicy = {
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  roles?: FieldPolicy<any> | FieldReadFunction<any>;
  userGroups?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'challenges'
  | 'displayName'
  | 'id'
  | 'nameID'
  | 'opportunities'
  | 'roles'
  | 'spaceID'
  | 'userGroups'
  | 'visibility'
  | RolesResultSpaceKeySpecifier
)[];
export type RolesResultSpaceFieldPolicy = {
  challenges?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  opportunities?: FieldPolicy<any> | FieldReadFunction<any>;
  roles?: FieldPolicy<any> | FieldReadFunction<any>;
  spaceID?: FieldPolicy<any> | FieldReadFunction<any>;
  userGroups?: FieldPolicy<any> | FieldReadFunction<any>;
  visibility?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type RoomKeySpecifier = ('authorization' | 'id' | 'messages' | 'messagesCount' | RoomKeySpecifier)[];
export type RoomFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  messages?: FieldPolicy<any> | FieldReadFunction<any>;
  messagesCount?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type RoomEventSubscriptionResultKeySpecifier = (
  | 'message'
  | 'reaction'
  | 'roomID'
  | RoomEventSubscriptionResultKeySpecifier
)[];
export type RoomEventSubscriptionResultFieldPolicy = {
  message?: FieldPolicy<any> | FieldReadFunction<any>;
  reaction?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'terms'
  | 'type'
  | SearchResultCalloutKeySpecifier
)[];
export type SearchResultCalloutFieldPolicy = {
  callout?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  score?: FieldPolicy<any> | FieldReadFunction<any>;
  terms?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SearchResultChallengeKeySpecifier = (
  | 'challenge'
  | 'id'
  | 'score'
  | 'space'
  | 'terms'
  | 'type'
  | SearchResultChallengeKeySpecifier
)[];
export type SearchResultChallengeFieldPolicy = {
  challenge?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  score?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  terms?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SearchResultOpportunityKeySpecifier = (
  | 'challenge'
  | 'id'
  | 'opportunity'
  | 'score'
  | 'space'
  | 'terms'
  | 'type'
  | SearchResultOpportunityKeySpecifier
)[];
export type SearchResultOpportunityFieldPolicy = {
  challenge?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  opportunity?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'challenge'
  | 'id'
  | 'opportunity'
  | 'post'
  | 'score'
  | 'space'
  | 'terms'
  | 'type'
  | SearchResultPostKeySpecifier
)[];
export type SearchResultPostFieldPolicy = {
  callout?: FieldPolicy<any> | FieldReadFunction<any>;
  challenge?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  opportunity?: FieldPolicy<any> | FieldReadFunction<any>;
  post?: FieldPolicy<any> | FieldReadFunction<any>;
  score?: FieldPolicy<any> | FieldReadFunction<any>;
  space?: FieldPolicy<any> | FieldReadFunction<any>;
  terms?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SearchResultSpaceKeySpecifier = (
  | 'id'
  | 'score'
  | 'space'
  | 'terms'
  | 'type'
  | SearchResultSpaceKeySpecifier
)[];
export type SearchResultSpaceFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type SentryKeySpecifier = ('enabled' | 'endpoint' | 'submitPII' | SentryKeySpecifier)[];
export type SentryFieldPolicy = {
  enabled?: FieldPolicy<any> | FieldReadFunction<any>;
  endpoint?: FieldPolicy<any> | FieldReadFunction<any>;
  submitPII?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ServiceMetadataKeySpecifier = ('name' | 'version' | ServiceMetadataKeySpecifier)[];
export type ServiceMetadataFieldPolicy = {
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  version?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SourceKeySpecifier = ('title' | 'uri' | SourceKeySpecifier)[];
export type SourceFieldPolicy = {
  title?: FieldPolicy<any> | FieldReadFunction<any>;
  uri?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SpaceKeySpecifier = (
  | 'account'
  | 'agent'
  | 'authorization'
  | 'challenge'
  | 'challenges'
  | 'collaboration'
  | 'community'
  | 'context'
  | 'createdDate'
  | 'group'
  | 'groups'
  | 'host'
  | 'id'
  | 'metrics'
  | 'nameID'
  | 'opportunity'
  | 'preferences'
  | 'profile'
  | 'storageAggregator'
  | SpaceKeySpecifier
)[];
export type SpaceFieldPolicy = {
  account?: FieldPolicy<any> | FieldReadFunction<any>;
  agent?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  challenge?: FieldPolicy<any> | FieldReadFunction<any>;
  challenges?: FieldPolicy<any> | FieldReadFunction<any>;
  collaboration?: FieldPolicy<any> | FieldReadFunction<any>;
  community?: FieldPolicy<any> | FieldReadFunction<any>;
  context?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  group?: FieldPolicy<any> | FieldReadFunction<any>;
  groups?: FieldPolicy<any> | FieldReadFunction<any>;
  host?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  metrics?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  opportunity?: FieldPolicy<any> | FieldReadFunction<any>;
  preferences?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  storageAggregator?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SpaceDefaultsKeySpecifier = (
  | 'authorization'
  | 'id'
  | 'innovationFlowTemplate'
  | SpaceDefaultsKeySpecifier
)[];
export type SpaceDefaultsFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationFlowTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type StorageAggregatorKeySpecifier = (
  | 'authorization'
  | 'directStorageBucket'
  | 'id'
  | 'parentEntity'
  | 'size'
  | 'storageAggregators'
  | 'storageBuckets'
  | StorageAggregatorKeySpecifier
)[];
export type StorageAggregatorFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  directStorageBucket?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  parentEntity?: FieldPolicy<any> | FieldReadFunction<any>;
  size?: FieldPolicy<any> | FieldReadFunction<any>;
  storageAggregators?: FieldPolicy<any> | FieldReadFunction<any>;
  storageBuckets?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type StorageAggregatorParentKeySpecifier = (
  | 'displayName'
  | 'id'
  | 'type'
  | 'url'
  | StorageAggregatorParentKeySpecifier
)[];
export type StorageAggregatorParentFieldPolicy = {
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  url?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type StorageBucketKeySpecifier = (
  | 'allowedMimeTypes'
  | 'authorization'
  | 'document'
  | 'documents'
  | 'id'
  | 'maxFileSize'
  | 'parentEntity'
  | 'size'
  | StorageBucketKeySpecifier
)[];
export type StorageBucketFieldPolicy = {
  allowedMimeTypes?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  document?: FieldPolicy<any> | FieldReadFunction<any>;
  documents?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  maxFileSize?: FieldPolicy<any> | FieldReadFunction<any>;
  parentEntity?: FieldPolicy<any> | FieldReadFunction<any>;
  size?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'challengeCreated'
  | 'communicationDiscussionUpdated'
  | 'opportunityCreated'
  | 'profileVerifiedCredential'
  | 'roomEvents'
  | SubscriptionKeySpecifier
)[];
export type SubscriptionFieldPolicy = {
  activityCreated?: FieldPolicy<any> | FieldReadFunction<any>;
  calloutPostCreated?: FieldPolicy<any> | FieldReadFunction<any>;
  challengeCreated?: FieldPolicy<any> | FieldReadFunction<any>;
  communicationDiscussionUpdated?: FieldPolicy<any> | FieldReadFunction<any>;
  opportunityCreated?: FieldPolicy<any> | FieldReadFunction<any>;
  profileVerifiedCredential?: FieldPolicy<any> | FieldReadFunction<any>;
  roomEvents?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type TagsetKeySpecifier = (
  | 'allowedValues'
  | 'authorization'
  | 'id'
  | 'name'
  | 'tags'
  | 'type'
  | TagsetKeySpecifier
)[];
export type TagsetFieldPolicy = {
  allowedValues?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  tags?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type TagsetTemplateKeySpecifier = (
  | 'allowedValues'
  | 'defaultSelectedValue'
  | 'id'
  | 'name'
  | 'type'
  | TagsetTemplateKeySpecifier
)[];
export type TagsetTemplateFieldPolicy = {
  allowedValues?: FieldPolicy<any> | FieldReadFunction<any>;
  defaultSelectedValue?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type TemplateKeySpecifier = ('challenges' | 'description' | 'name' | TemplateKeySpecifier)[];
export type TemplateFieldPolicy = {
  challenges?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type TemplatesSetKeySpecifier = (
  | 'authorization'
  | 'calloutTemplates'
  | 'id'
  | 'innovationFlowTemplate'
  | 'innovationFlowTemplates'
  | 'innovationFlowTemplatesCount'
  | 'postTemplate'
  | 'postTemplates'
  | 'postTemplatesCount'
  | 'whiteboardTemplate'
  | 'whiteboardTemplates'
  | 'whiteboardTemplatesCount'
  | TemplatesSetKeySpecifier
)[];
export type TemplatesSetFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  calloutTemplates?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationFlowTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationFlowTemplates?: FieldPolicy<any> | FieldReadFunction<any>;
  innovationFlowTemplatesCount?: FieldPolicy<any> | FieldReadFunction<any>;
  postTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
  postTemplates?: FieldPolicy<any> | FieldReadFunction<any>;
  postTemplatesCount?: FieldPolicy<any> | FieldReadFunction<any>;
  whiteboardTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
  whiteboardTemplates?: FieldPolicy<any> | FieldReadFunction<any>;
  whiteboardTemplatesCount?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type TimelineKeySpecifier = ('authorization' | 'calendar' | 'id' | TimelineKeySpecifier)[];
export type TimelineFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  calendar?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UserKeySpecifier = (
  | 'accountUpn'
  | 'agent'
  | 'authorization'
  | 'communityRooms'
  | 'directRooms'
  | 'email'
  | 'firstName'
  | 'gender'
  | 'id'
  | 'isContactable'
  | 'lastName'
  | 'nameID'
  | 'phone'
  | 'preferences'
  | 'profile'
  | 'storageAggregator'
  | UserKeySpecifier
)[];
export type UserFieldPolicy = {
  accountUpn?: FieldPolicy<any> | FieldReadFunction<any>;
  agent?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  communityRooms?: FieldPolicy<any> | FieldReadFunction<any>;
  directRooms?: FieldPolicy<any> | FieldReadFunction<any>;
  email?: FieldPolicy<any> | FieldReadFunction<any>;
  firstName?: FieldPolicy<any> | FieldReadFunction<any>;
  gender?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  isContactable?: FieldPolicy<any> | FieldReadFunction<any>;
  lastName?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  phone?: FieldPolicy<any> | FieldReadFunction<any>;
  preferences?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  storageAggregator?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UserGroupKeySpecifier = (
  | 'authorization'
  | 'id'
  | 'members'
  | 'name'
  | 'parent'
  | 'profile'
  | UserGroupKeySpecifier
)[];
export type UserGroupFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  members?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  parent?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type VisualKeySpecifier = (
  | 'allowedTypes'
  | 'alternativeText'
  | 'aspectRatio'
  | 'authorization'
  | 'id'
  | 'maxHeight'
  | 'maxWidth'
  | 'minHeight'
  | 'minWidth'
  | 'name'
  | 'uri'
  | VisualKeySpecifier
)[];
export type VisualFieldPolicy = {
  allowedTypes?: FieldPolicy<any> | FieldReadFunction<any>;
  alternativeText?: FieldPolicy<any> | FieldReadFunction<any>;
  aspectRatio?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  maxHeight?: FieldPolicy<any> | FieldReadFunction<any>;
  maxWidth?: FieldPolicy<any> | FieldReadFunction<any>;
  minHeight?: FieldPolicy<any> | FieldReadFunction<any>;
  minWidth?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type WhiteboardTemplateKeySpecifier = (
  | 'authorization'
  | 'content'
  | 'id'
  | 'profile'
  | WhiteboardTemplateKeySpecifier
)[];
export type WhiteboardTemplateFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  content?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
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
  Application?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ApplicationKeySpecifier | (() => undefined | ApplicationKeySpecifier);
    fields?: ApplicationFieldPolicy;
  };
  ApplicationForRoleResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ApplicationForRoleResultKeySpecifier | (() => undefined | ApplicationForRoleResultKeySpecifier);
    fields?: ApplicationForRoleResultFieldPolicy;
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
  CalloutPostCreated?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CalloutPostCreatedKeySpecifier | (() => undefined | CalloutPostCreatedKeySpecifier);
    fields?: CalloutPostCreatedFieldPolicy;
  };
  CalloutTemplate?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CalloutTemplateKeySpecifier | (() => undefined | CalloutTemplateKeySpecifier);
    fields?: CalloutTemplateFieldPolicy;
  };
  Challenge?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ChallengeKeySpecifier | (() => undefined | ChallengeKeySpecifier);
    fields?: ChallengeFieldPolicy;
  };
  ChallengeCreated?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ChallengeCreatedKeySpecifier | (() => undefined | ChallengeCreatedKeySpecifier);
    fields?: ChallengeCreatedFieldPolicy;
  };
  ChallengeTemplate?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ChallengeTemplateKeySpecifier | (() => undefined | ChallengeTemplateKeySpecifier);
    fields?: ChallengeTemplateFieldPolicy;
  };
  ChatGuidanceResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ChatGuidanceResultKeySpecifier | (() => undefined | ChatGuidanceResultKeySpecifier);
    fields?: ChatGuidanceResultFieldPolicy;
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
  CommunityPolicy?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CommunityPolicyKeySpecifier | (() => undefined | CommunityPolicyKeySpecifier);
    fields?: CommunityPolicyFieldPolicy;
  };
  CommunityRolePolicy?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CommunityRolePolicyKeySpecifier | (() => undefined | CommunityRolePolicyKeySpecifier);
    fields?: CommunityRolePolicyFieldPolicy;
  };
  Config?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ConfigKeySpecifier | (() => undefined | ConfigKeySpecifier);
    fields?: ConfigFieldPolicy;
  };
  Context?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ContextKeySpecifier | (() => undefined | ContextKeySpecifier);
    fields?: ContextFieldPolicy;
  };
  ContributorRoles?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ContributorRolesKeySpecifier | (() => undefined | ContributorRolesKeySpecifier);
    fields?: ContributorRolesFieldPolicy;
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
  FeedbackTemplate?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | FeedbackTemplateKeySpecifier | (() => undefined | FeedbackTemplateKeySpecifier);
    fields?: FeedbackTemplateFieldPolicy;
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
  InnovationFlowTemplate?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | InnovationFlowTemplateKeySpecifier | (() => undefined | InnovationFlowTemplateKeySpecifier);
    fields?: InnovationFlowTemplateFieldPolicy;
  };
  InnovationHub?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | InnovationHubKeySpecifier | (() => undefined | InnovationHubKeySpecifier);
    fields?: InnovationHubFieldPolicy;
  };
  InnovationPack?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | InnovationPackKeySpecifier | (() => undefined | InnovationPackKeySpecifier);
    fields?: InnovationPackFieldPolicy;
  };
  Invitation?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | InvitationKeySpecifier | (() => undefined | InvitationKeySpecifier);
    fields?: InvitationFieldPolicy;
  };
  InvitationExternal?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | InvitationExternalKeySpecifier | (() => undefined | InvitationExternalKeySpecifier);
    fields?: InvitationExternalFieldPolicy;
  };
  InvitationForRoleResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | InvitationForRoleResultKeySpecifier | (() => undefined | InvitationForRoleResultKeySpecifier);
    fields?: InvitationForRoleResultFieldPolicy;
  };
  Journey?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | JourneyKeySpecifier | (() => undefined | JourneyKeySpecifier);
    fields?: JourneyFieldPolicy;
  };
  Library?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | LibraryKeySpecifier | (() => undefined | LibraryKeySpecifier);
    fields?: LibraryFieldPolicy;
  };
  License?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | LicenseKeySpecifier | (() => undefined | LicenseKeySpecifier);
    fields?: LicenseFieldPolicy;
  };
  LicenseFeatureFlag?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | LicenseFeatureFlagKeySpecifier | (() => undefined | LicenseFeatureFlagKeySpecifier);
    fields?: LicenseFeatureFlagFieldPolicy;
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
  Metadata?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | MetadataKeySpecifier | (() => undefined | MetadataKeySpecifier);
    fields?: MetadataFieldPolicy;
  };
  Mutation?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | MutationKeySpecifier | (() => undefined | MutationKeySpecifier);
    fields?: MutationFieldPolicy;
  };
  MyJourneyResults?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | MyJourneyResultsKeySpecifier | (() => undefined | MyJourneyResultsKeySpecifier);
    fields?: MyJourneyResultsFieldPolicy;
  };
  NVP?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | NVPKeySpecifier | (() => undefined | NVPKeySpecifier);
    fields?: NVPFieldPolicy;
  };
  Opportunity?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | OpportunityKeySpecifier | (() => undefined | OpportunityKeySpecifier);
    fields?: OpportunityFieldPolicy;
  };
  OpportunityCreated?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | OpportunityCreatedKeySpecifier | (() => undefined | OpportunityCreatedKeySpecifier);
    fields?: OpportunityCreatedFieldPolicy;
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
  PlatformLocations?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PlatformLocationsKeySpecifier | (() => undefined | PlatformLocationsKeySpecifier);
    fields?: PlatformLocationsFieldPolicy;
  };
  Post?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PostKeySpecifier | (() => undefined | PostKeySpecifier);
    fields?: PostFieldPolicy;
  };
  PostTemplate?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PostTemplateKeySpecifier | (() => undefined | PostTemplateKeySpecifier);
    fields?: PostTemplateFieldPolicy;
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
  QuestionTemplate?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | QuestionTemplateKeySpecifier | (() => undefined | QuestionTemplateKeySpecifier);
    fields?: QuestionTemplateFieldPolicy;
  };
  Reaction?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ReactionKeySpecifier | (() => undefined | ReactionKeySpecifier);
    fields?: ReactionFieldPolicy;
  };
  Reference?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ReferenceKeySpecifier | (() => undefined | ReferenceKeySpecifier);
    fields?: ReferenceFieldPolicy;
  };
  Relation?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | RelationKeySpecifier | (() => undefined | RelationKeySpecifier);
    fields?: RelationFieldPolicy;
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
  RelayPaginatedUser?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | RelayPaginatedUserKeySpecifier | (() => undefined | RelayPaginatedUserKeySpecifier);
    fields?: RelayPaginatedUserFieldPolicy;
  };
  RelayPaginatedUserEdge?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | RelayPaginatedUserEdgeKeySpecifier | (() => undefined | RelayPaginatedUserEdgeKeySpecifier);
    fields?: RelayPaginatedUserEdgeFieldPolicy;
  };
  RelayPaginatedUserPageInfo?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | RelayPaginatedUserPageInfoKeySpecifier
      | (() => undefined | RelayPaginatedUserPageInfoKeySpecifier);
    fields?: RelayPaginatedUserPageInfoFieldPolicy;
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
  SearchResultChallenge?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | SearchResultChallengeKeySpecifier | (() => undefined | SearchResultChallengeKeySpecifier);
    fields?: SearchResultChallengeFieldPolicy;
  };
  SearchResultOpportunity?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | SearchResultOpportunityKeySpecifier | (() => undefined | SearchResultOpportunityKeySpecifier);
    fields?: SearchResultOpportunityFieldPolicy;
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
  Source?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | SourceKeySpecifier | (() => undefined | SourceKeySpecifier);
    fields?: SourceFieldPolicy;
  };
  Space?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | SpaceKeySpecifier | (() => undefined | SpaceKeySpecifier);
    fields?: SpaceFieldPolicy;
  };
  SpaceDefaults?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | SpaceDefaultsKeySpecifier | (() => undefined | SpaceDefaultsKeySpecifier);
    fields?: SpaceDefaultsFieldPolicy;
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
  UserGroup?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | UserGroupKeySpecifier | (() => undefined | UserGroupKeySpecifier);
    fields?: UserGroupFieldPolicy;
  };
  VerifiedCredential?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | VerifiedCredentialKeySpecifier | (() => undefined | VerifiedCredentialKeySpecifier);
    fields?: VerifiedCredentialFieldPolicy;
  };
  VerifiedCredentialClaim?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | VerifiedCredentialClaimKeySpecifier | (() => undefined | VerifiedCredentialClaimKeySpecifier);
    fields?: VerifiedCredentialClaimFieldPolicy;
  };
  Visual?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | VisualKeySpecifier | (() => undefined | VisualKeySpecifier);
    fields?: VisualFieldPolicy;
  };
  Whiteboard?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | WhiteboardKeySpecifier | (() => undefined | WhiteboardKeySpecifier);
    fields?: WhiteboardFieldPolicy;
  };
  WhiteboardTemplate?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | WhiteboardTemplateKeySpecifier | (() => undefined | WhiteboardTemplateKeySpecifier);
    fields?: WhiteboardTemplateFieldPolicy;
  };
};
export type TypedTypePolicies = StrictTypedTypePolicies & TypePolicies;
