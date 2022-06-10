import { FieldPolicy, FieldReadFunction, TypePolicies, TypePolicy } from '@apollo/client/cache';
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
  | 'hubID'
  | 'id'
  | 'opportunityID'
  | 'state'
  | 'updatedDate'
  | ApplicationForRoleResultKeySpecifier
)[];
export type ApplicationForRoleResultFieldPolicy = {
  challengeID?: FieldPolicy<any> | FieldReadFunction<any>;
  communityID?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  hubID?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  opportunityID?: FieldPolicy<any> | FieldReadFunction<any>;
  state?: FieldPolicy<any> | FieldReadFunction<any>;
  updatedDate?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ApplicationTemplateKeySpecifier = ('name' | 'questions' | ApplicationTemplateKeySpecifier)[];
export type ApplicationTemplateFieldPolicy = {
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  questions?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AspectKeySpecifier = (
  | 'authorization'
  | 'banner'
  | 'bannerNarrow'
  | 'comments'
  | 'createdBy'
  | 'createdDate'
  | 'description'
  | 'displayName'
  | 'id'
  | 'nameID'
  | 'references'
  | 'tagset'
  | 'type'
  | AspectKeySpecifier
)[];
export type AspectFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  banner?: FieldPolicy<any> | FieldReadFunction<any>;
  bannerNarrow?: FieldPolicy<any> | FieldReadFunction<any>;
  comments?: FieldPolicy<any> | FieldReadFunction<any>;
  createdBy?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  references?: FieldPolicy<any> | FieldReadFunction<any>;
  tagset?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AspectTemplateKeySpecifier = (
  | 'defaultDescription'
  | 'type'
  | 'typeDescription'
  | AspectTemplateKeySpecifier
)[];
export type AspectTemplateFieldPolicy = {
  defaultDescription?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  typeDescription?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'grantedPrivileges'
  | 'inheritable'
  | 'resourceID'
  | 'type'
  | AuthorizationPolicyRuleCredentialKeySpecifier
)[];
export type AuthorizationPolicyRuleCredentialFieldPolicy = {
  grantedPrivileges?: FieldPolicy<any> | FieldReadFunction<any>;
  inheritable?: FieldPolicy<any> | FieldReadFunction<any>;
  resourceID?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AuthorizationPolicyRulePrivilegeKeySpecifier = (
  | 'grantedPrivileges'
  | 'sourcePrivilege'
  | AuthorizationPolicyRulePrivilegeKeySpecifier
)[];
export type AuthorizationPolicyRulePrivilegeFieldPolicy = {
  grantedPrivileges?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type CanvasKeySpecifier = (
  | 'authorization'
  | 'checkout'
  | 'id'
  | 'isTemplate'
  | 'name'
  | 'value'
  | CanvasKeySpecifier
)[];
export type CanvasFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  checkout?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  isTemplate?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  value?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CanvasCheckoutKeySpecifier = (
  | 'authorization'
  | 'id'
  | 'lifecycle'
  | 'lockedBy'
  | 'status'
  | CanvasCheckoutKeySpecifier
)[];
export type CanvasCheckoutFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  lifecycle?: FieldPolicy<any> | FieldReadFunction<any>;
  lockedBy?: FieldPolicy<any> | FieldReadFunction<any>;
  status?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CanvasContentUpdatedKeySpecifier = ('canvasID' | 'value' | CanvasContentUpdatedKeySpecifier)[];
export type CanvasContentUpdatedFieldPolicy = {
  canvasID?: FieldPolicy<any> | FieldReadFunction<any>;
  value?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ChallengeKeySpecifier = (
  | 'activity'
  | 'agent'
  | 'authorization'
  | 'challenges'
  | 'community'
  | 'context'
  | 'displayName'
  | 'hubID'
  | 'id'
  | 'lifecycle'
  | 'nameID'
  | 'opportunities'
  | 'preferences'
  | 'tagset'
  | ChallengeKeySpecifier
)[];
export type ChallengeFieldPolicy = {
  activity?: FieldPolicy<any> | FieldReadFunction<any>;
  agent?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  challenges?: FieldPolicy<any> | FieldReadFunction<any>;
  community?: FieldPolicy<any> | FieldReadFunction<any>;
  context?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  hubID?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  lifecycle?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  opportunities?: FieldPolicy<any> | FieldReadFunction<any>;
  preferences?: FieldPolicy<any> | FieldReadFunction<any>;
  tagset?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ChallengeTemplateKeySpecifier = ('applications' | 'feedback' | 'name' | ChallengeTemplateKeySpecifier)[];
export type ChallengeTemplateFieldPolicy = {
  applications?: FieldPolicy<any> | FieldReadFunction<any>;
  feedback?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CommentsKeySpecifier = ('authorization' | 'id' | 'messages' | CommentsKeySpecifier)[];
export type CommentsFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  messages?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CommentsMessageReceivedKeySpecifier = ('commentsID' | 'message' | CommentsMessageReceivedKeySpecifier)[];
export type CommentsMessageReceivedFieldPolicy = {
  commentsID?: FieldPolicy<any> | FieldReadFunction<any>;
  message?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CommunicationKeySpecifier = (
  | 'authorization'
  | 'discussion'
  | 'discussions'
  | 'id'
  | 'updates'
  | CommunicationKeySpecifier
)[];
export type CommunicationFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  discussion?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type CommunicationDiscussionMessageReceivedKeySpecifier = (
  | 'discussionID'
  | 'message'
  | CommunicationDiscussionMessageReceivedKeySpecifier
)[];
export type CommunicationDiscussionMessageReceivedFieldPolicy = {
  discussionID?: FieldPolicy<any> | FieldReadFunction<any>;
  message?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CommunicationRoomKeySpecifier = ('displayName' | 'id' | 'messages' | CommunicationRoomKeySpecifier)[];
export type CommunicationRoomFieldPolicy = {
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  messages?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CommunicationUpdateMessageReceivedKeySpecifier = (
  | 'message'
  | 'updatesID'
  | CommunicationUpdateMessageReceivedKeySpecifier
)[];
export type CommunicationUpdateMessageReceivedFieldPolicy = {
  message?: FieldPolicy<any> | FieldReadFunction<any>;
  updatesID?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CommunityKeySpecifier = (
  | 'applications'
  | 'authorization'
  | 'communication'
  | 'displayName'
  | 'groups'
  | 'id'
  | 'leadOrganizations'
  | 'leadUsers'
  | 'memberOrganizations'
  | 'memberUsers'
  | CommunityKeySpecifier
)[];
export type CommunityFieldPolicy = {
  applications?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  communication?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  groups?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  leadOrganizations?: FieldPolicy<any> | FieldReadFunction<any>;
  leadUsers?: FieldPolicy<any> | FieldReadFunction<any>;
  memberOrganizations?: FieldPolicy<any> | FieldReadFunction<any>;
  memberUsers?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ConfigKeySpecifier = ('authentication' | 'platform' | 'sentry' | 'template' | ConfigKeySpecifier)[];
export type ConfigFieldPolicy = {
  authentication?: FieldPolicy<any> | FieldReadFunction<any>;
  platform?: FieldPolicy<any> | FieldReadFunction<any>;
  sentry?: FieldPolicy<any> | FieldReadFunction<any>;
  template?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ContextKeySpecifier = (
  | 'aspects'
  | 'authorization'
  | 'background'
  | 'canvases'
  | 'ecosystemModel'
  | 'id'
  | 'impact'
  | 'location'
  | 'references'
  | 'tagline'
  | 'vision'
  | 'visuals'
  | 'who'
  | ContextKeySpecifier
)[];
export type ContextFieldPolicy = {
  aspects?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  background?: FieldPolicy<any> | FieldReadFunction<any>;
  canvases?: FieldPolicy<any> | FieldReadFunction<any>;
  ecosystemModel?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  impact?: FieldPolicy<any> | FieldReadFunction<any>;
  location?: FieldPolicy<any> | FieldReadFunction<any>;
  references?: FieldPolicy<any> | FieldReadFunction<any>;
  tagline?: FieldPolicy<any> | FieldReadFunction<any>;
  vision?: FieldPolicy<any> | FieldReadFunction<any>;
  visuals?: FieldPolicy<any> | FieldReadFunction<any>;
  who?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ContextAspectCreatedKeySpecifier = ('aspect' | 'contextID' | ContextAspectCreatedKeySpecifier)[];
export type ContextAspectCreatedFieldPolicy = {
  aspect?: FieldPolicy<any> | FieldReadFunction<any>;
  contextID?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ContributorRolesKeySpecifier = (
  | 'applications'
  | 'hubs'
  | 'id'
  | 'organizations'
  | ContributorRolesKeySpecifier
)[];
export type ContributorRolesFieldPolicy = {
  applications?: FieldPolicy<any> | FieldReadFunction<any>;
  hubs?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  organizations?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CredentialKeySpecifier = ('id' | 'resourceID' | 'type' | CredentialKeySpecifier)[];
export type CredentialFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'commentsCount'
  | 'createdBy'
  | 'description'
  | 'id'
  | 'messages'
  | 'timestamp'
  | 'title'
  | DiscussionKeySpecifier
)[];
export type DiscussionFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  category?: FieldPolicy<any> | FieldReadFunction<any>;
  commentsCount?: FieldPolicy<any> | FieldReadFunction<any>;
  createdBy?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  messages?: FieldPolicy<any> | FieldReadFunction<any>;
  timestamp?: FieldPolicy<any> | FieldReadFunction<any>;
  title?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type EcosystemModelKeySpecifier = (
  | 'actorGroups'
  | 'authorization'
  | 'canvas'
  | 'description'
  | 'id'
  | EcosystemModelKeySpecifier
)[];
export type EcosystemModelFieldPolicy = {
  actorGroups?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  canvas?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type FeatureFlagKeySpecifier = ('enabled' | 'name' | FeatureFlagKeySpecifier)[];
export type FeatureFlagFieldPolicy = {
  enabled?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type FeedbackTemplateKeySpecifier = ('name' | 'questions' | FeedbackTemplateKeySpecifier)[];
export type FeedbackTemplateFieldPolicy = {
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  questions?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type GroupableKeySpecifier = ('groups' | GroupableKeySpecifier)[];
export type GroupableFieldPolicy = {
  groups?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type HubKeySpecifier = (
  | 'activity'
  | 'agent'
  | 'application'
  | 'authorization'
  | 'challenge'
  | 'challenges'
  | 'community'
  | 'context'
  | 'displayName'
  | 'group'
  | 'groups'
  | 'groupsWithTag'
  | 'host'
  | 'id'
  | 'nameID'
  | 'opportunities'
  | 'opportunity'
  | 'preferences'
  | 'project'
  | 'projects'
  | 'tagset'
  | 'template'
  | HubKeySpecifier
)[];
export type HubFieldPolicy = {
  activity?: FieldPolicy<any> | FieldReadFunction<any>;
  agent?: FieldPolicy<any> | FieldReadFunction<any>;
  application?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  challenge?: FieldPolicy<any> | FieldReadFunction<any>;
  challenges?: FieldPolicy<any> | FieldReadFunction<any>;
  community?: FieldPolicy<any> | FieldReadFunction<any>;
  context?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  group?: FieldPolicy<any> | FieldReadFunction<any>;
  groups?: FieldPolicy<any> | FieldReadFunction<any>;
  groupsWithTag?: FieldPolicy<any> | FieldReadFunction<any>;
  host?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  opportunities?: FieldPolicy<any> | FieldReadFunction<any>;
  opportunity?: FieldPolicy<any> | FieldReadFunction<any>;
  preferences?: FieldPolicy<any> | FieldReadFunction<any>;
  project?: FieldPolicy<any> | FieldReadFunction<any>;
  projects?: FieldPolicy<any> | FieldReadFunction<any>;
  tagset?: FieldPolicy<any> | FieldReadFunction<any>;
  template?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type HubAspectTemplateKeySpecifier = (
  | 'defaultDescription'
  | 'type'
  | 'typeDescription'
  | HubAspectTemplateKeySpecifier
)[];
export type HubAspectTemplateFieldPolicy = {
  defaultDescription?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  typeDescription?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type HubTemplateKeySpecifier = ('aspectTemplates' | HubTemplateKeySpecifier)[];
export type HubTemplateFieldPolicy = {
  aspectTemplates?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type LocationKeySpecifier = ('city' | 'country' | 'id' | LocationKeySpecifier)[];
export type LocationFieldPolicy = {
  city?: FieldPolicy<any> | FieldReadFunction<any>;
  country?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MessageKeySpecifier = ('id' | 'message' | 'sender' | 'timestamp' | MessageKeySpecifier)[];
export type MessageFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  message?: FieldPolicy<any> | FieldReadFunction<any>;
  sender?: FieldPolicy<any> | FieldReadFunction<any>;
  timestamp?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MetadataKeySpecifier = ('activity' | 'services' | MetadataKeySpecifier)[];
export type MetadataFieldPolicy = {
  activity?: FieldPolicy<any> | FieldReadFunction<any>;
  services?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MutationKeySpecifier = (
  | 'adminCommunicationEnsureAccessToCommunications'
  | 'adminCommunicationRemoveOrphanedRoom'
  | 'adminCommunicationUpdateRoomsJoinRule'
  | 'applyForCommunityMembership'
  | 'assignOrganizationAsCommunityLead'
  | 'assignOrganizationAsCommunityMember'
  | 'assignUserAsChallengeAdmin'
  | 'assignUserAsCommunityLead'
  | 'assignUserAsCommunityMember'
  | 'assignUserAsGlobalAdmin'
  | 'assignUserAsGlobalCommunityAdmin'
  | 'assignUserAsHubAdmin'
  | 'assignUserAsOpportunityAdmin'
  | 'assignUserAsOrganizationAdmin'
  | 'assignUserAsOrganizationOwner'
  | 'assignUserToGroup'
  | 'assignUserToOrganization'
  | 'authorizationPolicyResetOnHub'
  | 'authorizationPolicyResetOnOrganization'
  | 'authorizationPolicyResetOnUser'
  | 'beginAlkemioUserVerifiedCredentialOfferInteraction'
  | 'beginCommunityMemberVerifiedCredentialOfferInteraction'
  | 'beginVerifiedCredentialRequestInteraction'
  | 'createActor'
  | 'createActorGroup'
  | 'createAspectOnContext'
  | 'createCanvasOnContext'
  | 'createChallenge'
  | 'createChildChallenge'
  | 'createDiscussion'
  | 'createFeedbackOnCommunityContext'
  | 'createGroupOnCommunity'
  | 'createGroupOnOrganization'
  | 'createHub'
  | 'createOpportunity'
  | 'createOrganization'
  | 'createProject'
  | 'createReferenceOnAspect'
  | 'createReferenceOnContext'
  | 'createReferenceOnProfile'
  | 'createRelation'
  | 'createTagsetOnProfile'
  | 'createUser'
  | 'createUserNewRegistration'
  | 'deleteActor'
  | 'deleteActorGroup'
  | 'deleteAspect'
  | 'deleteCanvasOnContext'
  | 'deleteChallenge'
  | 'deleteDiscussion'
  | 'deleteHub'
  | 'deleteOpportunity'
  | 'deleteOrganization'
  | 'deleteProject'
  | 'deleteReference'
  | 'deleteRelation'
  | 'deleteUser'
  | 'deleteUserApplication'
  | 'deleteUserGroup'
  | 'eventOnApplication'
  | 'eventOnCanvasCheckout'
  | 'eventOnChallenge'
  | 'eventOnOpportunity'
  | 'eventOnOrganizationVerification'
  | 'eventOnProject'
  | 'grantCredentialToUser'
  | 'joinCommunity'
  | 'messageUser'
  | 'removeComment'
  | 'removeMessageFromDiscussion'
  | 'removeOrganizationAsCommunityLead'
  | 'removeOrganizationAsCommunityMember'
  | 'removeUpdate'
  | 'removeUserAsChallengeAdmin'
  | 'removeUserAsCommunityLead'
  | 'removeUserAsCommunityMember'
  | 'removeUserAsGlobalAdmin'
  | 'removeUserAsGlobalCommunityAdmin'
  | 'removeUserAsHubAdmin'
  | 'removeUserAsOpportunityAdmin'
  | 'removeUserAsOrganizationAdmin'
  | 'removeUserAsOrganizationOwner'
  | 'removeUserFromGroup'
  | 'removeUserFromOrganization'
  | 'revokeCredentialFromUser'
  | 'sendComment'
  | 'sendMessageToDiscussion'
  | 'sendUpdate'
  | 'updateActor'
  | 'updateAspect'
  | 'updateCanvas'
  | 'updateChallenge'
  | 'updateDiscussion'
  | 'updateEcosystemModel'
  | 'updateHub'
  | 'updateOpportunity'
  | 'updateOrganization'
  | 'updatePreferenceOnChallenge'
  | 'updatePreferenceOnHub'
  | 'updatePreferenceOnOrganization'
  | 'updatePreferenceOnUser'
  | 'updateProfile'
  | 'updateProject'
  | 'updateUser'
  | 'updateUserGroup'
  | 'updateVisual'
  | 'uploadImageOnVisual'
  | MutationKeySpecifier
)[];
export type MutationFieldPolicy = {
  adminCommunicationEnsureAccessToCommunications?: FieldPolicy<any> | FieldReadFunction<any>;
  adminCommunicationRemoveOrphanedRoom?: FieldPolicy<any> | FieldReadFunction<any>;
  adminCommunicationUpdateRoomsJoinRule?: FieldPolicy<any> | FieldReadFunction<any>;
  applyForCommunityMembership?: FieldPolicy<any> | FieldReadFunction<any>;
  assignOrganizationAsCommunityLead?: FieldPolicy<any> | FieldReadFunction<any>;
  assignOrganizationAsCommunityMember?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserAsChallengeAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserAsCommunityLead?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserAsCommunityMember?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserAsGlobalAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserAsGlobalCommunityAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserAsHubAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserAsOpportunityAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserAsOrganizationAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserAsOrganizationOwner?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserToGroup?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserToOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  authorizationPolicyResetOnHub?: FieldPolicy<any> | FieldReadFunction<any>;
  authorizationPolicyResetOnOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  authorizationPolicyResetOnUser?: FieldPolicy<any> | FieldReadFunction<any>;
  beginAlkemioUserVerifiedCredentialOfferInteraction?: FieldPolicy<any> | FieldReadFunction<any>;
  beginCommunityMemberVerifiedCredentialOfferInteraction?: FieldPolicy<any> | FieldReadFunction<any>;
  beginVerifiedCredentialRequestInteraction?: FieldPolicy<any> | FieldReadFunction<any>;
  createActor?: FieldPolicy<any> | FieldReadFunction<any>;
  createActorGroup?: FieldPolicy<any> | FieldReadFunction<any>;
  createAspectOnContext?: FieldPolicy<any> | FieldReadFunction<any>;
  createCanvasOnContext?: FieldPolicy<any> | FieldReadFunction<any>;
  createChallenge?: FieldPolicy<any> | FieldReadFunction<any>;
  createChildChallenge?: FieldPolicy<any> | FieldReadFunction<any>;
  createDiscussion?: FieldPolicy<any> | FieldReadFunction<any>;
  createFeedbackOnCommunityContext?: FieldPolicy<any> | FieldReadFunction<any>;
  createGroupOnCommunity?: FieldPolicy<any> | FieldReadFunction<any>;
  createGroupOnOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  createHub?: FieldPolicy<any> | FieldReadFunction<any>;
  createOpportunity?: FieldPolicy<any> | FieldReadFunction<any>;
  createOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  createProject?: FieldPolicy<any> | FieldReadFunction<any>;
  createReferenceOnAspect?: FieldPolicy<any> | FieldReadFunction<any>;
  createReferenceOnContext?: FieldPolicy<any> | FieldReadFunction<any>;
  createReferenceOnProfile?: FieldPolicy<any> | FieldReadFunction<any>;
  createRelation?: FieldPolicy<any> | FieldReadFunction<any>;
  createTagsetOnProfile?: FieldPolicy<any> | FieldReadFunction<any>;
  createUser?: FieldPolicy<any> | FieldReadFunction<any>;
  createUserNewRegistration?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteActor?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteActorGroup?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteAspect?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteCanvasOnContext?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteChallenge?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteDiscussion?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteHub?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteOpportunity?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteProject?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteReference?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteRelation?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteUser?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteUserApplication?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteUserGroup?: FieldPolicy<any> | FieldReadFunction<any>;
  eventOnApplication?: FieldPolicy<any> | FieldReadFunction<any>;
  eventOnCanvasCheckout?: FieldPolicy<any> | FieldReadFunction<any>;
  eventOnChallenge?: FieldPolicy<any> | FieldReadFunction<any>;
  eventOnOpportunity?: FieldPolicy<any> | FieldReadFunction<any>;
  eventOnOrganizationVerification?: FieldPolicy<any> | FieldReadFunction<any>;
  eventOnProject?: FieldPolicy<any> | FieldReadFunction<any>;
  grantCredentialToUser?: FieldPolicy<any> | FieldReadFunction<any>;
  joinCommunity?: FieldPolicy<any> | FieldReadFunction<any>;
  messageUser?: FieldPolicy<any> | FieldReadFunction<any>;
  removeComment?: FieldPolicy<any> | FieldReadFunction<any>;
  removeMessageFromDiscussion?: FieldPolicy<any> | FieldReadFunction<any>;
  removeOrganizationAsCommunityLead?: FieldPolicy<any> | FieldReadFunction<any>;
  removeOrganizationAsCommunityMember?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUpdate?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserAsChallengeAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserAsCommunityLead?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserAsCommunityMember?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserAsGlobalAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserAsGlobalCommunityAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserAsHubAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserAsOpportunityAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserAsOrganizationAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserAsOrganizationOwner?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserFromGroup?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserFromOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  revokeCredentialFromUser?: FieldPolicy<any> | FieldReadFunction<any>;
  sendComment?: FieldPolicy<any> | FieldReadFunction<any>;
  sendMessageToDiscussion?: FieldPolicy<any> | FieldReadFunction<any>;
  sendUpdate?: FieldPolicy<any> | FieldReadFunction<any>;
  updateActor?: FieldPolicy<any> | FieldReadFunction<any>;
  updateAspect?: FieldPolicy<any> | FieldReadFunction<any>;
  updateCanvas?: FieldPolicy<any> | FieldReadFunction<any>;
  updateChallenge?: FieldPolicy<any> | FieldReadFunction<any>;
  updateDiscussion?: FieldPolicy<any> | FieldReadFunction<any>;
  updateEcosystemModel?: FieldPolicy<any> | FieldReadFunction<any>;
  updateHub?: FieldPolicy<any> | FieldReadFunction<any>;
  updateOpportunity?: FieldPolicy<any> | FieldReadFunction<any>;
  updateOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  updatePreferenceOnChallenge?: FieldPolicy<any> | FieldReadFunction<any>;
  updatePreferenceOnHub?: FieldPolicy<any> | FieldReadFunction<any>;
  updatePreferenceOnOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  updatePreferenceOnUser?: FieldPolicy<any> | FieldReadFunction<any>;
  updateProfile?: FieldPolicy<any> | FieldReadFunction<any>;
  updateProject?: FieldPolicy<any> | FieldReadFunction<any>;
  updateUser?: FieldPolicy<any> | FieldReadFunction<any>;
  updateUserGroup?: FieldPolicy<any> | FieldReadFunction<any>;
  updateVisual?: FieldPolicy<any> | FieldReadFunction<any>;
  uploadImageOnVisual?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type NVPKeySpecifier = ('id' | 'name' | 'value' | NVPKeySpecifier)[];
export type NVPFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  value?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type OpportunityKeySpecifier = (
  | 'activity'
  | 'authorization'
  | 'challenge'
  | 'community'
  | 'context'
  | 'displayName'
  | 'id'
  | 'lifecycle'
  | 'nameID'
  | 'parentId'
  | 'parentNameID'
  | 'projects'
  | 'relations'
  | 'tagset'
  | OpportunityKeySpecifier
)[];
export type OpportunityFieldPolicy = {
  activity?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  challenge?: FieldPolicy<any> | FieldReadFunction<any>;
  community?: FieldPolicy<any> | FieldReadFunction<any>;
  context?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  lifecycle?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  parentId?: FieldPolicy<any> | FieldReadFunction<any>;
  parentNameID?: FieldPolicy<any> | FieldReadFunction<any>;
  projects?: FieldPolicy<any> | FieldReadFunction<any>;
  relations?: FieldPolicy<any> | FieldReadFunction<any>;
  tagset?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type OpportunityTemplateKeySpecifier = (
  | 'actorGroups'
  | 'applications'
  | 'name'
  | 'relations'
  | OpportunityTemplateKeySpecifier
)[];
export type OpportunityTemplateFieldPolicy = {
  actorGroups?: FieldPolicy<any> | FieldReadFunction<any>;
  applications?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  relations?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type OrganizationKeySpecifier = (
  | 'activity'
  | 'agent'
  | 'authorization'
  | 'contactEmail'
  | 'displayName'
  | 'domain'
  | 'group'
  | 'groups'
  | 'id'
  | 'legalEntityName'
  | 'members'
  | 'nameID'
  | 'preferences'
  | 'profile'
  | 'verification'
  | 'website'
  | OrganizationKeySpecifier
)[];
export type OrganizationFieldPolicy = {
  activity?: FieldPolicy<any> | FieldReadFunction<any>;
  agent?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  contactEmail?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  domain?: FieldPolicy<any> | FieldReadFunction<any>;
  group?: FieldPolicy<any> | FieldReadFunction<any>;
  groups?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  legalEntityName?: FieldPolicy<any> | FieldReadFunction<any>;
  members?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  preferences?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  verification?: FieldPolicy<any> | FieldReadFunction<any>;
  website?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type OrganizationTemplateKeySpecifier = ('name' | 'tagsets' | OrganizationTemplateKeySpecifier)[];
export type OrganizationTemplateFieldPolicy = {
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  tagsets?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type PaginatedOrganizationKeySpecifier = ('organization' | 'pageInfo' | PaginatedOrganizationKeySpecifier)[];
export type PaginatedOrganizationFieldPolicy = {
  organization?: FieldPolicy<any> | FieldReadFunction<any>;
  pageInfo?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PaginatedUsersKeySpecifier = ('pageInfo' | 'users' | PaginatedUsersKeySpecifier)[];
export type PaginatedUsersFieldPolicy = {
  pageInfo?: FieldPolicy<any> | FieldReadFunction<any>;
  users?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PlatformKeySpecifier = (
  | 'about'
  | 'featureFlags'
  | 'feedback'
  | 'privacy'
  | 'security'
  | 'support'
  | 'terms'
  | PlatformKeySpecifier
)[];
export type PlatformFieldPolicy = {
  about?: FieldPolicy<any> | FieldReadFunction<any>;
  featureFlags?: FieldPolicy<any> | FieldReadFunction<any>;
  feedback?: FieldPolicy<any> | FieldReadFunction<any>;
  privacy?: FieldPolicy<any> | FieldReadFunction<any>;
  security?: FieldPolicy<any> | FieldReadFunction<any>;
  support?: FieldPolicy<any> | FieldReadFunction<any>;
  terms?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type PlatformHubTemplateKeySpecifier = ('applications' | 'aspects' | 'name' | PlatformHubTemplateKeySpecifier)[];
export type PlatformHubTemplateFieldPolicy = {
  applications?: FieldPolicy<any> | FieldReadFunction<any>;
  aspects?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'avatar'
  | 'description'
  | 'id'
  | 'location'
  | 'references'
  | 'tagsets'
  | ProfileKeySpecifier
)[];
export type ProfileFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  avatar?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  location?: FieldPolicy<any> | FieldReadFunction<any>;
  references?: FieldPolicy<any> | FieldReadFunction<any>;
  tagsets?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ProfileCredentialVerifiedKeySpecifier = ('userEmail' | 'vc' | ProfileCredentialVerifiedKeySpecifier)[];
export type ProfileCredentialVerifiedFieldPolicy = {
  userEmail?: FieldPolicy<any> | FieldReadFunction<any>;
  vc?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ProjectKeySpecifier = (
  | 'authorization'
  | 'description'
  | 'displayName'
  | 'id'
  | 'lifecycle'
  | 'nameID'
  | 'tagset'
  | ProjectKeySpecifier
)[];
export type ProjectFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  lifecycle?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  tagset?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type QueryKeySpecifier = (
  | 'adminCommunicationMembership'
  | 'adminCommunicationOrphanedUsage'
  | 'authorization'
  | 'configuration'
  | 'getSupportedVerifiedCredentialMetadata'
  | 'hub'
  | 'hubs'
  | 'me'
  | 'meHasProfile'
  | 'metadata'
  | 'organization'
  | 'organizations'
  | 'organizationsPaginated'
  | 'rolesOrganization'
  | 'rolesUser'
  | 'search'
  | 'user'
  | 'userAuthorizationPrivileges'
  | 'users'
  | 'usersById'
  | 'usersPaginated'
  | 'usersWithAuthorizationCredential'
  | QueryKeySpecifier
)[];
export type QueryFieldPolicy = {
  adminCommunicationMembership?: FieldPolicy<any> | FieldReadFunction<any>;
  adminCommunicationOrphanedUsage?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  configuration?: FieldPolicy<any> | FieldReadFunction<any>;
  getSupportedVerifiedCredentialMetadata?: FieldPolicy<any> | FieldReadFunction<any>;
  hub?: FieldPolicy<any> | FieldReadFunction<any>;
  hubs?: FieldPolicy<any> | FieldReadFunction<any>;
  me?: FieldPolicy<any> | FieldReadFunction<any>;
  meHasProfile?: FieldPolicy<any> | FieldReadFunction<any>;
  metadata?: FieldPolicy<any> | FieldReadFunction<any>;
  organization?: FieldPolicy<any> | FieldReadFunction<any>;
  organizations?: FieldPolicy<any> | FieldReadFunction<any>;
  organizationsPaginated?: FieldPolicy<any> | FieldReadFunction<any>;
  rolesOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  rolesUser?: FieldPolicy<any> | FieldReadFunction<any>;
  search?: FieldPolicy<any> | FieldReadFunction<any>;
  user?: FieldPolicy<any> | FieldReadFunction<any>;
  userAuthorizationPrivileges?: FieldPolicy<any> | FieldReadFunction<any>;
  users?: FieldPolicy<any> | FieldReadFunction<any>;
  usersById?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type RelayPaginatedUserKeySpecifier = (
  | 'accountUpn'
  | 'agent'
  | 'authorization'
  | 'communityRooms'
  | 'directRooms'
  | 'displayName'
  | 'email'
  | 'firstName'
  | 'gender'
  | 'id'
  | 'lastName'
  | 'nameID'
  | 'phone'
  | 'preferences'
  | 'profile'
  | RelayPaginatedUserKeySpecifier
)[];
export type RelayPaginatedUserFieldPolicy = {
  accountUpn?: FieldPolicy<any> | FieldReadFunction<any>;
  agent?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  communityRooms?: FieldPolicy<any> | FieldReadFunction<any>;
  directRooms?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  email?: FieldPolicy<any> | FieldReadFunction<any>;
  firstName?: FieldPolicy<any> | FieldReadFunction<any>;
  gender?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  lastName?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  phone?: FieldPolicy<any> | FieldReadFunction<any>;
  preferences?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type RolesResultKeySpecifier = (
  | 'displayName'
  | 'id'
  | 'nameID'
  | 'roles'
  | 'userGroups'
  | RolesResultKeySpecifier
)[];
export type RolesResultFieldPolicy = {
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  roles?: FieldPolicy<any> | FieldReadFunction<any>;
  userGroups?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type RolesResultHubKeySpecifier = (
  | 'challenges'
  | 'displayName'
  | 'hubID'
  | 'id'
  | 'nameID'
  | 'opportunities'
  | 'roles'
  | 'userGroups'
  | RolesResultHubKeySpecifier
)[];
export type RolesResultHubFieldPolicy = {
  challenges?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  hubID?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  opportunities?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type SearchResultEntryKeySpecifier = ('result' | 'score' | 'terms' | SearchResultEntryKeySpecifier)[];
export type SearchResultEntryFieldPolicy = {
  result?: FieldPolicy<any> | FieldReadFunction<any>;
  score?: FieldPolicy<any> | FieldReadFunction<any>;
  terms?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type SearchableKeySpecifier = ('id' | SearchableKeySpecifier)[];
export type SearchableFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type SubscriptionKeySpecifier = (
  | 'canvasContentUpdated'
  | 'communicationCommentsMessageReceived'
  | 'communicationDiscussionMessageReceived'
  | 'communicationDiscussionUpdated'
  | 'communicationUpdateMessageReceived'
  | 'contextAspectCreated'
  | 'profileVerifiedCredential'
  | SubscriptionKeySpecifier
)[];
export type SubscriptionFieldPolicy = {
  canvasContentUpdated?: FieldPolicy<any> | FieldReadFunction<any>;
  communicationCommentsMessageReceived?: FieldPolicy<any> | FieldReadFunction<any>;
  communicationDiscussionMessageReceived?: FieldPolicy<any> | FieldReadFunction<any>;
  communicationDiscussionUpdated?: FieldPolicy<any> | FieldReadFunction<any>;
  communicationUpdateMessageReceived?: FieldPolicy<any> | FieldReadFunction<any>;
  contextAspectCreated?: FieldPolicy<any> | FieldReadFunction<any>;
  profileVerifiedCredential?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type TagsetKeySpecifier = ('authorization' | 'id' | 'name' | 'tags' | TagsetKeySpecifier)[];
export type TagsetFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  tags?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type TagsetTemplateKeySpecifier = ('name' | 'placeholder' | TagsetTemplateKeySpecifier)[];
export type TagsetTemplateFieldPolicy = {
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  placeholder?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type TemplateKeySpecifier = (
  | 'challenges'
  | 'description'
  | 'hubs'
  | 'name'
  | 'opportunities'
  | 'organizations'
  | 'users'
  | TemplateKeySpecifier
)[];
export type TemplateFieldPolicy = {
  challenges?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  hubs?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  opportunities?: FieldPolicy<any> | FieldReadFunction<any>;
  organizations?: FieldPolicy<any> | FieldReadFunction<any>;
  users?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UpdatesKeySpecifier = ('authorization' | 'id' | 'messages' | UpdatesKeySpecifier)[];
export type UpdatesFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  messages?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UserKeySpecifier = (
  | 'accountUpn'
  | 'agent'
  | 'authorization'
  | 'communityRooms'
  | 'directRooms'
  | 'displayName'
  | 'email'
  | 'firstName'
  | 'gender'
  | 'id'
  | 'lastName'
  | 'nameID'
  | 'phone'
  | 'preferences'
  | 'profile'
  | UserKeySpecifier
)[];
export type UserFieldPolicy = {
  accountUpn?: FieldPolicy<any> | FieldReadFunction<any>;
  agent?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  communityRooms?: FieldPolicy<any> | FieldReadFunction<any>;
  directRooms?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  email?: FieldPolicy<any> | FieldReadFunction<any>;
  firstName?: FieldPolicy<any> | FieldReadFunction<any>;
  gender?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  lastName?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  phone?: FieldPolicy<any> | FieldReadFunction<any>;
  preferences?: FieldPolicy<any> | FieldReadFunction<any>;
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type UserTemplateKeySpecifier = ('name' | 'tagsets' | UserTemplateKeySpecifier)[];
export type UserTemplateFieldPolicy = {
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  tagsets?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type StrictTypedTypePolicies = {
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
  ApplicationTemplate?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ApplicationTemplateKeySpecifier | (() => undefined | ApplicationTemplateKeySpecifier);
    fields?: ApplicationTemplateFieldPolicy;
  };
  Aspect?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | AspectKeySpecifier | (() => undefined | AspectKeySpecifier);
    fields?: AspectFieldPolicy;
  };
  AspectTemplate?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | AspectTemplateKeySpecifier | (() => undefined | AspectTemplateKeySpecifier);
    fields?: AspectTemplateFieldPolicy;
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
  Canvas?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CanvasKeySpecifier | (() => undefined | CanvasKeySpecifier);
    fields?: CanvasFieldPolicy;
  };
  CanvasCheckout?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CanvasCheckoutKeySpecifier | (() => undefined | CanvasCheckoutKeySpecifier);
    fields?: CanvasCheckoutFieldPolicy;
  };
  CanvasContentUpdated?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CanvasContentUpdatedKeySpecifier | (() => undefined | CanvasContentUpdatedKeySpecifier);
    fields?: CanvasContentUpdatedFieldPolicy;
  };
  Challenge?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ChallengeKeySpecifier | (() => undefined | ChallengeKeySpecifier);
    fields?: ChallengeFieldPolicy;
  };
  ChallengeTemplate?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ChallengeTemplateKeySpecifier | (() => undefined | ChallengeTemplateKeySpecifier);
    fields?: ChallengeTemplateFieldPolicy;
  };
  Comments?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CommentsKeySpecifier | (() => undefined | CommentsKeySpecifier);
    fields?: CommentsFieldPolicy;
  };
  CommentsMessageReceived?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CommentsMessageReceivedKeySpecifier | (() => undefined | CommentsMessageReceivedKeySpecifier);
    fields?: CommentsMessageReceivedFieldPolicy;
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
  CommunicationDiscussionMessageReceived?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | CommunicationDiscussionMessageReceivedKeySpecifier
      | (() => undefined | CommunicationDiscussionMessageReceivedKeySpecifier);
    fields?: CommunicationDiscussionMessageReceivedFieldPolicy;
  };
  CommunicationRoom?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CommunicationRoomKeySpecifier | (() => undefined | CommunicationRoomKeySpecifier);
    fields?: CommunicationRoomFieldPolicy;
  };
  CommunicationUpdateMessageReceived?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | CommunicationUpdateMessageReceivedKeySpecifier
      | (() => undefined | CommunicationUpdateMessageReceivedKeySpecifier);
    fields?: CommunicationUpdateMessageReceivedFieldPolicy;
  };
  Community?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CommunityKeySpecifier | (() => undefined | CommunityKeySpecifier);
    fields?: CommunityFieldPolicy;
  };
  Config?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ConfigKeySpecifier | (() => undefined | ConfigKeySpecifier);
    fields?: ConfigFieldPolicy;
  };
  Context?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ContextKeySpecifier | (() => undefined | ContextKeySpecifier);
    fields?: ContextFieldPolicy;
  };
  ContextAspectCreated?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ContextAspectCreatedKeySpecifier | (() => undefined | ContextAspectCreatedKeySpecifier);
    fields?: ContextAspectCreatedFieldPolicy;
  };
  ContributorRoles?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ContributorRolesKeySpecifier | (() => undefined | ContributorRolesKeySpecifier);
    fields?: ContributorRolesFieldPolicy;
  };
  Credential?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CredentialKeySpecifier | (() => undefined | CredentialKeySpecifier);
    fields?: CredentialFieldPolicy;
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
  EcosystemModel?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | EcosystemModelKeySpecifier | (() => undefined | EcosystemModelKeySpecifier);
    fields?: EcosystemModelFieldPolicy;
  };
  FeatureFlag?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | FeatureFlagKeySpecifier | (() => undefined | FeatureFlagKeySpecifier);
    fields?: FeatureFlagFieldPolicy;
  };
  FeedbackTemplate?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | FeedbackTemplateKeySpecifier | (() => undefined | FeedbackTemplateKeySpecifier);
    fields?: FeedbackTemplateFieldPolicy;
  };
  Groupable?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | GroupableKeySpecifier | (() => undefined | GroupableKeySpecifier);
    fields?: GroupableFieldPolicy;
  };
  Hub?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | HubKeySpecifier | (() => undefined | HubKeySpecifier);
    fields?: HubFieldPolicy;
  };
  HubAspectTemplate?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | HubAspectTemplateKeySpecifier | (() => undefined | HubAspectTemplateKeySpecifier);
    fields?: HubAspectTemplateFieldPolicy;
  };
  HubTemplate?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | HubTemplateKeySpecifier | (() => undefined | HubTemplateKeySpecifier);
    fields?: HubTemplateFieldPolicy;
  };
  Lifecycle?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | LifecycleKeySpecifier | (() => undefined | LifecycleKeySpecifier);
    fields?: LifecycleFieldPolicy;
  };
  Location?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | LocationKeySpecifier | (() => undefined | LocationKeySpecifier);
    fields?: LocationFieldPolicy;
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
  NVP?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | NVPKeySpecifier | (() => undefined | NVPKeySpecifier);
    fields?: NVPFieldPolicy;
  };
  Opportunity?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | OpportunityKeySpecifier | (() => undefined | OpportunityKeySpecifier);
    fields?: OpportunityFieldPolicy;
  };
  OpportunityTemplate?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | OpportunityTemplateKeySpecifier | (() => undefined | OpportunityTemplateKeySpecifier);
    fields?: OpportunityTemplateFieldPolicy;
  };
  Organization?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | OrganizationKeySpecifier | (() => undefined | OrganizationKeySpecifier);
    fields?: OrganizationFieldPolicy;
  };
  OrganizationTemplate?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | OrganizationTemplateKeySpecifier | (() => undefined | OrganizationTemplateKeySpecifier);
    fields?: OrganizationTemplateFieldPolicy;
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
  PaginatedUsers?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PaginatedUsersKeySpecifier | (() => undefined | PaginatedUsersKeySpecifier);
    fields?: PaginatedUsersFieldPolicy;
  };
  Platform?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PlatformKeySpecifier | (() => undefined | PlatformKeySpecifier);
    fields?: PlatformFieldPolicy;
  };
  PlatformHubTemplate?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PlatformHubTemplateKeySpecifier | (() => undefined | PlatformHubTemplateKeySpecifier);
    fields?: PlatformHubTemplateFieldPolicy;
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
  Project?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ProjectKeySpecifier | (() => undefined | ProjectKeySpecifier);
    fields?: ProjectFieldPolicy;
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
  Reference?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ReferenceKeySpecifier | (() => undefined | ReferenceKeySpecifier);
    fields?: ReferenceFieldPolicy;
  };
  Relation?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | RelationKeySpecifier | (() => undefined | RelationKeySpecifier);
    fields?: RelationFieldPolicy;
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
  RolesResultHub?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | RolesResultHubKeySpecifier | (() => undefined | RolesResultHubKeySpecifier);
    fields?: RolesResultHubFieldPolicy;
  };
  RolesResultOrganization?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | RolesResultOrganizationKeySpecifier | (() => undefined | RolesResultOrganizationKeySpecifier);
    fields?: RolesResultOrganizationFieldPolicy;
  };
  SearchResultEntry?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | SearchResultEntryKeySpecifier | (() => undefined | SearchResultEntryKeySpecifier);
    fields?: SearchResultEntryFieldPolicy;
  };
  Searchable?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | SearchableKeySpecifier | (() => undefined | SearchableKeySpecifier);
    fields?: SearchableFieldPolicy;
  };
  Sentry?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | SentryKeySpecifier | (() => undefined | SentryKeySpecifier);
    fields?: SentryFieldPolicy;
  };
  ServiceMetadata?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ServiceMetadataKeySpecifier | (() => undefined | ServiceMetadataKeySpecifier);
    fields?: ServiceMetadataFieldPolicy;
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
  Template?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | TemplateKeySpecifier | (() => undefined | TemplateKeySpecifier);
    fields?: TemplateFieldPolicy;
  };
  Updates?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | UpdatesKeySpecifier | (() => undefined | UpdatesKeySpecifier);
    fields?: UpdatesFieldPolicy;
  };
  User?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | UserKeySpecifier | (() => undefined | UserKeySpecifier);
    fields?: UserFieldPolicy;
  };
  UserGroup?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | UserGroupKeySpecifier | (() => undefined | UserGroupKeySpecifier);
    fields?: UserGroupFieldPolicy;
  };
  UserTemplate?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | UserTemplateKeySpecifier | (() => undefined | UserTemplateKeySpecifier);
    fields?: UserTemplateFieldPolicy;
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
};
export type TypedTypePolicies = StrictTypedTypePolicies & TypePolicies;
