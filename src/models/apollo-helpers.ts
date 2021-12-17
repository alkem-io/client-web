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
export type ApplicationReceivedKeySpecifier = (
  | 'applicationID'
  | 'communityID'
  | 'userID'
  | ApplicationReceivedKeySpecifier
)[];
export type ApplicationReceivedFieldPolicy = {
  applicationID?: FieldPolicy<any> | FieldReadFunction<any>;
  communityID?: FieldPolicy<any> | FieldReadFunction<any>;
  userID?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ApplicationResultEntryKeySpecifier = (
  | 'challengeID'
  | 'communityID'
  | 'createdDate'
  | 'displayName'
  | 'ecoverseID'
  | 'id'
  | 'opportunityID'
  | 'state'
  | 'updatedDate'
  | ApplicationResultEntryKeySpecifier
)[];
export type ApplicationResultEntryFieldPolicy = {
  challengeID?: FieldPolicy<any> | FieldReadFunction<any>;
  communityID?: FieldPolicy<any> | FieldReadFunction<any>;
  createdDate?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  ecoverseID?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type AspectKeySpecifier = ('authorization' | 'explanation' | 'framing' | 'id' | 'title' | AspectKeySpecifier)[];
export type AspectFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  explanation?: FieldPolicy<any> | FieldReadFunction<any>;
  framing?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  title?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'verifiedCredentialRules'
  | AuthorizationKeySpecifier
)[];
export type AuthorizationFieldPolicy = {
  anonymousReadAccess?: FieldPolicy<any> | FieldReadFunction<any>;
  credentialRules?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  myPrivileges?: FieldPolicy<any> | FieldReadFunction<any>;
  verifiedCredentialRules?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AuthorizationPolicyRuleCredentialKeySpecifier = (
  | 'grantedPrivileges'
  | 'resourceID'
  | 'type'
  | AuthorizationPolicyRuleCredentialKeySpecifier
)[];
export type AuthorizationPolicyRuleCredentialFieldPolicy = {
  grantedPrivileges?: FieldPolicy<any> | FieldReadFunction<any>;
  resourceID?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type ChallengeKeySpecifier = (
  | 'activity'
  | 'agent'
  | 'authorization'
  | 'challenges'
  | 'community'
  | 'context'
  | 'displayName'
  | 'ecoverseID'
  | 'id'
  | 'leadOrganizations'
  | 'lifecycle'
  | 'nameID'
  | 'opportunities'
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
  ecoverseID?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  leadOrganizations?: FieldPolicy<any> | FieldReadFunction<any>;
  lifecycle?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  opportunities?: FieldPolicy<any> | FieldReadFunction<any>;
  tagset?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ChallengeTemplateKeySpecifier = ('applications' | 'name' | ChallengeTemplateKeySpecifier)[];
export type ChallengeTemplateFieldPolicy = {
  applications?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'members'
  | 'missingMembers'
  | 'roomID'
  | CommunicationAdminRoomMembershipResultKeySpecifier
)[];
export type CommunicationAdminRoomMembershipResultFieldPolicy = {
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  extraMembers?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'members'
  | CommunityKeySpecifier
)[];
export type CommunityFieldPolicy = {
  applications?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  communication?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  groups?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  members?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'references'
  | 'tagline'
  | 'vision'
  | 'visual'
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
  references?: FieldPolicy<any> | FieldReadFunction<any>;
  tagline?: FieldPolicy<any> | FieldReadFunction<any>;
  vision?: FieldPolicy<any> | FieldReadFunction<any>;
  visual?: FieldPolicy<any> | FieldReadFunction<any>;
  who?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CredentialKeySpecifier = ('id' | 'resourceID' | 'type' | CredentialKeySpecifier)[];
export type CredentialFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  resourceID?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type EcoverseKeySpecifier = (
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
  | 'project'
  | 'projects'
  | 'tagset'
  | EcoverseKeySpecifier
)[];
export type EcoverseFieldPolicy = {
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
  project?: FieldPolicy<any> | FieldReadFunction<any>;
  projects?: FieldPolicy<any> | FieldReadFunction<any>;
  tagset?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type EcoverseTemplateKeySpecifier = ('applications' | 'name' | EcoverseTemplateKeySpecifier)[];
export type EcoverseTemplateFieldPolicy = {
  applications?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type FeatureFlagKeySpecifier = ('enabled' | 'name' | FeatureFlagKeySpecifier)[];
export type FeatureFlagFieldPolicy = {
  enabled?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type GroupableKeySpecifier = ('groups' | GroupableKeySpecifier)[];
export type GroupableFieldPolicy = {
  groups?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type MembershipCommunityResultEntryKeySpecifier = (
  | 'displayName'
  | 'id'
  | MembershipCommunityResultEntryKeySpecifier
)[];
export type MembershipCommunityResultEntryFieldPolicy = {
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MembershipOrganizationResultEntryChallengeKeySpecifier = (
  | 'displayName'
  | 'ecoverseID'
  | 'id'
  | 'nameID'
  | MembershipOrganizationResultEntryChallengeKeySpecifier
)[];
export type MembershipOrganizationResultEntryChallengeFieldPolicy = {
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  ecoverseID?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MembershipResultEntryKeySpecifier = ('displayName' | 'id' | 'nameID' | MembershipResultEntryKeySpecifier)[];
export type MembershipResultEntryFieldPolicy = {
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MembershipUserResultEntryEcoverseKeySpecifier = (
  | 'challenges'
  | 'displayName'
  | 'ecoverseID'
  | 'id'
  | 'nameID'
  | 'opportunities'
  | 'userGroups'
  | MembershipUserResultEntryEcoverseKeySpecifier
)[];
export type MembershipUserResultEntryEcoverseFieldPolicy = {
  challenges?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  ecoverseID?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  opportunities?: FieldPolicy<any> | FieldReadFunction<any>;
  userGroups?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MembershipUserResultEntryOrganizationKeySpecifier = (
  | 'displayName'
  | 'id'
  | 'nameID'
  | 'organizationID'
  | 'userGroups'
  | MembershipUserResultEntryOrganizationKeySpecifier
)[];
export type MembershipUserResultEntryOrganizationFieldPolicy = {
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  organizationID?: FieldPolicy<any> | FieldReadFunction<any>;
  userGroups?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'assignUserAsChallengeAdmin'
  | 'assignUserAsEcoverseAdmin'
  | 'assignUserAsGlobalAdmin'
  | 'assignUserAsGlobalCommunityAdmin'
  | 'assignUserAsOpportunityAdmin'
  | 'assignUserAsOrganizationAdmin'
  | 'assignUserAsOrganizationOwner'
  | 'assignUserToCommunity'
  | 'assignUserToGroup'
  | 'assignUserToOrganization'
  | 'authorizationPolicyResetOnEcoverse'
  | 'authorizationPolicyResetOnOrganization'
  | 'authorizationPolicyResetOnUser'
  | 'authorizeStateModificationOnChallenge'
  | 'createActor'
  | 'createActorGroup'
  | 'createApplication'
  | 'createAspect'
  | 'createCanvasOnContext'
  | 'createChallenge'
  | 'createChildChallenge'
  | 'createDiscussion'
  | 'createEcoverse'
  | 'createGroupOnCommunity'
  | 'createGroupOnOrganization'
  | 'createOpportunity'
  | 'createOrganization'
  | 'createProject'
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
  | 'deleteEcoverse'
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
  | 'messageUser'
  | 'removeMessageFromDiscussion'
  | 'removeUpdate'
  | 'removeUserAsChallengeAdmin'
  | 'removeUserAsEcoverseAdmin'
  | 'removeUserAsGlobalAdmin'
  | 'removeUserAsGlobalCommunityAdmin'
  | 'removeUserAsOpportunityAdmin'
  | 'removeUserAsOrganizationAdmin'
  | 'removeUserAsOrganizationOwner'
  | 'removeUserFromCommunity'
  | 'removeUserFromGroup'
  | 'removeUserFromOrganization'
  | 'revokeCredentialFromUser'
  | 'sendMessageToDiscussion'
  | 'sendUpdate'
  | 'updateActor'
  | 'updateAspect'
  | 'updateCanvas'
  | 'updateChallenge'
  | 'updateDiscussion'
  | 'updateEcosystemModel'
  | 'updateEcoverse'
  | 'updateOpportunity'
  | 'updateOrganization'
  | 'updateProfile'
  | 'updateProject'
  | 'updateUser'
  | 'updateUserGroup'
  | 'updateUserPreference'
  | 'uploadAvatar'
  | MutationKeySpecifier
)[];
export type MutationFieldPolicy = {
  adminCommunicationEnsureAccessToCommunications?: FieldPolicy<any> | FieldReadFunction<any>;
  adminCommunicationRemoveOrphanedRoom?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserAsChallengeAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserAsEcoverseAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserAsGlobalAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserAsGlobalCommunityAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserAsOpportunityAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserAsOrganizationAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserAsOrganizationOwner?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserToCommunity?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserToGroup?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserToOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  authorizationPolicyResetOnEcoverse?: FieldPolicy<any> | FieldReadFunction<any>;
  authorizationPolicyResetOnOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  authorizationPolicyResetOnUser?: FieldPolicy<any> | FieldReadFunction<any>;
  authorizeStateModificationOnChallenge?: FieldPolicy<any> | FieldReadFunction<any>;
  createActor?: FieldPolicy<any> | FieldReadFunction<any>;
  createActorGroup?: FieldPolicy<any> | FieldReadFunction<any>;
  createApplication?: FieldPolicy<any> | FieldReadFunction<any>;
  createAspect?: FieldPolicy<any> | FieldReadFunction<any>;
  createCanvasOnContext?: FieldPolicy<any> | FieldReadFunction<any>;
  createChallenge?: FieldPolicy<any> | FieldReadFunction<any>;
  createChildChallenge?: FieldPolicy<any> | FieldReadFunction<any>;
  createDiscussion?: FieldPolicy<any> | FieldReadFunction<any>;
  createEcoverse?: FieldPolicy<any> | FieldReadFunction<any>;
  createGroupOnCommunity?: FieldPolicy<any> | FieldReadFunction<any>;
  createGroupOnOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  createOpportunity?: FieldPolicy<any> | FieldReadFunction<any>;
  createOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  createProject?: FieldPolicy<any> | FieldReadFunction<any>;
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
  deleteEcoverse?: FieldPolicy<any> | FieldReadFunction<any>;
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
  messageUser?: FieldPolicy<any> | FieldReadFunction<any>;
  removeMessageFromDiscussion?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUpdate?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserAsChallengeAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserAsEcoverseAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserAsGlobalAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserAsGlobalCommunityAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserAsOpportunityAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserAsOrganizationAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserAsOrganizationOwner?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserFromCommunity?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserFromGroup?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserFromOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  revokeCredentialFromUser?: FieldPolicy<any> | FieldReadFunction<any>;
  sendMessageToDiscussion?: FieldPolicy<any> | FieldReadFunction<any>;
  sendUpdate?: FieldPolicy<any> | FieldReadFunction<any>;
  updateActor?: FieldPolicy<any> | FieldReadFunction<any>;
  updateAspect?: FieldPolicy<any> | FieldReadFunction<any>;
  updateCanvas?: FieldPolicy<any> | FieldReadFunction<any>;
  updateChallenge?: FieldPolicy<any> | FieldReadFunction<any>;
  updateDiscussion?: FieldPolicy<any> | FieldReadFunction<any>;
  updateEcosystemModel?: FieldPolicy<any> | FieldReadFunction<any>;
  updateEcoverse?: FieldPolicy<any> | FieldReadFunction<any>;
  updateOpportunity?: FieldPolicy<any> | FieldReadFunction<any>;
  updateOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  updateProfile?: FieldPolicy<any> | FieldReadFunction<any>;
  updateProject?: FieldPolicy<any> | FieldReadFunction<any>;
  updateUser?: FieldPolicy<any> | FieldReadFunction<any>;
  updateUserGroup?: FieldPolicy<any> | FieldReadFunction<any>;
  updateUserPreference?: FieldPolicy<any> | FieldReadFunction<any>;
  uploadAvatar?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'aspects'
  | 'name'
  | 'relations'
  | OpportunityTemplateKeySpecifier
)[];
export type OpportunityTemplateFieldPolicy = {
  actorGroups?: FieldPolicy<any> | FieldReadFunction<any>;
  applications?: FieldPolicy<any> | FieldReadFunction<any>;
  aspects?: FieldPolicy<any> | FieldReadFunction<any>;
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
  profile?: FieldPolicy<any> | FieldReadFunction<any>;
  verification?: FieldPolicy<any> | FieldReadFunction<any>;
  website?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type OrganizationMembershipKeySpecifier = (
  | 'challengesLeading'
  | 'ecoversesHosting'
  | 'id'
  | OrganizationMembershipKeySpecifier
)[];
export type OrganizationMembershipFieldPolicy = {
  challengesLeading?: FieldPolicy<any> | FieldReadFunction<any>;
  ecoversesHosting?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type ProfileKeySpecifier = (
  | 'authorization'
  | 'avatar'
  | 'description'
  | 'id'
  | 'references'
  | 'tagsets'
  | ProfileKeySpecifier
)[];
export type ProfileFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  avatar?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  references?: FieldPolicy<any> | FieldReadFunction<any>;
  tagsets?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'configuration'
  | 'ecoverse'
  | 'ecoverses'
  | 'me'
  | 'meHasProfile'
  | 'membershipOrganization'
  | 'membershipUser'
  | 'metadata'
  | 'organization'
  | 'organizations'
  | 'search'
  | 'user'
  | 'userAuthorizationPrivileges'
  | 'users'
  | 'usersById'
  | 'usersWithAuthorizationCredential'
  | QueryKeySpecifier
)[];
export type QueryFieldPolicy = {
  adminCommunicationMembership?: FieldPolicy<any> | FieldReadFunction<any>;
  adminCommunicationOrphanedUsage?: FieldPolicy<any> | FieldReadFunction<any>;
  configuration?: FieldPolicy<any> | FieldReadFunction<any>;
  ecoverse?: FieldPolicy<any> | FieldReadFunction<any>;
  ecoverses?: FieldPolicy<any> | FieldReadFunction<any>;
  me?: FieldPolicy<any> | FieldReadFunction<any>;
  meHasProfile?: FieldPolicy<any> | FieldReadFunction<any>;
  membershipOrganization?: FieldPolicy<any> | FieldReadFunction<any>;
  membershipUser?: FieldPolicy<any> | FieldReadFunction<any>;
  metadata?: FieldPolicy<any> | FieldReadFunction<any>;
  organization?: FieldPolicy<any> | FieldReadFunction<any>;
  organizations?: FieldPolicy<any> | FieldReadFunction<any>;
  search?: FieldPolicy<any> | FieldReadFunction<any>;
  user?: FieldPolicy<any> | FieldReadFunction<any>;
  userAuthorizationPrivileges?: FieldPolicy<any> | FieldReadFunction<any>;
  users?: FieldPolicy<any> | FieldReadFunction<any>;
  usersById?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'applicationReceived'
  | 'communicationDiscussionMessageReceived'
  | 'communicationUpdateMessageReceived'
  | SubscriptionKeySpecifier
)[];
export type SubscriptionFieldPolicy = {
  applicationReceived?: FieldPolicy<any> | FieldReadFunction<any>;
  communicationDiscussionMessageReceived?: FieldPolicy<any> | FieldReadFunction<any>;
  communicationUpdateMessageReceived?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'ecoverses'
  | 'name'
  | 'opportunities'
  | 'organizations'
  | 'users'
  | TemplateKeySpecifier
)[];
export type TemplateFieldPolicy = {
  challenges?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  ecoverses?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'city'
  | 'communityRooms'
  | 'country'
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
  city?: FieldPolicy<any> | FieldReadFunction<any>;
  communityRooms?: FieldPolicy<any> | FieldReadFunction<any>;
  country?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type UserMembershipKeySpecifier = (
  | 'applications'
  | 'communities'
  | 'ecoverses'
  | 'id'
  | 'organizations'
  | UserMembershipKeySpecifier
)[];
export type UserMembershipFieldPolicy = {
  applications?: FieldPolicy<any> | FieldReadFunction<any>;
  communities?: FieldPolicy<any> | FieldReadFunction<any>;
  ecoverses?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  organizations?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UserPreferenceKeySpecifier = (
  | 'authorization'
  | 'definition'
  | 'id'
  | 'value'
  | UserPreferenceKeySpecifier
)[];
export type UserPreferenceFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  definition?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  value?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UserPreferenceDefinitionKeySpecifier = (
  | 'description'
  | 'displayName'
  | 'group'
  | 'id'
  | 'type'
  | 'valueType'
  | UserPreferenceDefinitionKeySpecifier
)[];
export type UserPreferenceDefinitionFieldPolicy = {
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  group?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
  valueType?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UserTemplateKeySpecifier = ('name' | 'tagsets' | UserTemplateKeySpecifier)[];
export type UserTemplateFieldPolicy = {
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  tagsets?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type VerifiedCredentialKeySpecifier = (
  | 'claim'
  | 'issued'
  | 'issuer'
  | 'type'
  | VerifiedCredentialKeySpecifier
)[];
export type VerifiedCredentialFieldPolicy = {
  claim?: FieldPolicy<any> | FieldReadFunction<any>;
  issued?: FieldPolicy<any> | FieldReadFunction<any>;
  issuer?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type VisualKeySpecifier = ('avatar' | 'background' | 'banner' | 'id' | VisualKeySpecifier)[];
export type VisualFieldPolicy = {
  avatar?: FieldPolicy<any> | FieldReadFunction<any>;
  background?: FieldPolicy<any> | FieldReadFunction<any>;
  banner?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
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
  Application?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ApplicationKeySpecifier | (() => undefined | ApplicationKeySpecifier);
    fields?: ApplicationFieldPolicy;
  };
  ApplicationReceived?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ApplicationReceivedKeySpecifier | (() => undefined | ApplicationReceivedKeySpecifier);
    fields?: ApplicationReceivedFieldPolicy;
  };
  ApplicationResultEntry?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ApplicationResultEntryKeySpecifier | (() => undefined | ApplicationResultEntryKeySpecifier);
    fields?: ApplicationResultEntryFieldPolicy;
  };
  ApplicationTemplate?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ApplicationTemplateKeySpecifier | (() => undefined | ApplicationTemplateKeySpecifier);
    fields?: ApplicationTemplateFieldPolicy;
  };
  Aspect?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | AspectKeySpecifier | (() => undefined | AspectKeySpecifier);
    fields?: AspectFieldPolicy;
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
  Canvas?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CanvasKeySpecifier | (() => undefined | CanvasKeySpecifier);
    fields?: CanvasFieldPolicy;
  };
  CanvasCheckout?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CanvasCheckoutKeySpecifier | (() => undefined | CanvasCheckoutKeySpecifier);
    fields?: CanvasCheckoutFieldPolicy;
  };
  Challenge?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ChallengeKeySpecifier | (() => undefined | ChallengeKeySpecifier);
    fields?: ChallengeFieldPolicy;
  };
  ChallengeTemplate?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ChallengeTemplateKeySpecifier | (() => undefined | ChallengeTemplateKeySpecifier);
    fields?: ChallengeTemplateFieldPolicy;
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
  Credential?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CredentialKeySpecifier | (() => undefined | CredentialKeySpecifier);
    fields?: CredentialFieldPolicy;
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
  Ecoverse?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | EcoverseKeySpecifier | (() => undefined | EcoverseKeySpecifier);
    fields?: EcoverseFieldPolicy;
  };
  EcoverseTemplate?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | EcoverseTemplateKeySpecifier | (() => undefined | EcoverseTemplateKeySpecifier);
    fields?: EcoverseTemplateFieldPolicy;
  };
  FeatureFlag?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | FeatureFlagKeySpecifier | (() => undefined | FeatureFlagKeySpecifier);
    fields?: FeatureFlagFieldPolicy;
  };
  Groupable?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | GroupableKeySpecifier | (() => undefined | GroupableKeySpecifier);
    fields?: GroupableFieldPolicy;
  };
  Lifecycle?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | LifecycleKeySpecifier | (() => undefined | LifecycleKeySpecifier);
    fields?: LifecycleFieldPolicy;
  };
  MembershipCommunityResultEntry?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | MembershipCommunityResultEntryKeySpecifier
      | (() => undefined | MembershipCommunityResultEntryKeySpecifier);
    fields?: MembershipCommunityResultEntryFieldPolicy;
  };
  MembershipOrganizationResultEntryChallenge?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | MembershipOrganizationResultEntryChallengeKeySpecifier
      | (() => undefined | MembershipOrganizationResultEntryChallengeKeySpecifier);
    fields?: MembershipOrganizationResultEntryChallengeFieldPolicy;
  };
  MembershipResultEntry?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | MembershipResultEntryKeySpecifier | (() => undefined | MembershipResultEntryKeySpecifier);
    fields?: MembershipResultEntryFieldPolicy;
  };
  MembershipUserResultEntryEcoverse?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | MembershipUserResultEntryEcoverseKeySpecifier
      | (() => undefined | MembershipUserResultEntryEcoverseKeySpecifier);
    fields?: MembershipUserResultEntryEcoverseFieldPolicy;
  };
  MembershipUserResultEntryOrganization?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | MembershipUserResultEntryOrganizationKeySpecifier
      | (() => undefined | MembershipUserResultEntryOrganizationKeySpecifier);
    fields?: MembershipUserResultEntryOrganizationFieldPolicy;
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
  OrganizationMembership?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | OrganizationMembershipKeySpecifier | (() => undefined | OrganizationMembershipKeySpecifier);
    fields?: OrganizationMembershipFieldPolicy;
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
  Platform?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | PlatformKeySpecifier | (() => undefined | PlatformKeySpecifier);
    fields?: PlatformFieldPolicy;
  };
  Profile?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ProfileKeySpecifier | (() => undefined | ProfileKeySpecifier);
    fields?: ProfileFieldPolicy;
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
  UserMembership?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | UserMembershipKeySpecifier | (() => undefined | UserMembershipKeySpecifier);
    fields?: UserMembershipFieldPolicy;
  };
  UserPreference?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | UserPreferenceKeySpecifier | (() => undefined | UserPreferenceKeySpecifier);
    fields?: UserPreferenceFieldPolicy;
  };
  UserPreferenceDefinition?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | UserPreferenceDefinitionKeySpecifier | (() => undefined | UserPreferenceDefinitionKeySpecifier);
    fields?: UserPreferenceDefinitionFieldPolicy;
  };
  UserTemplate?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | UserTemplateKeySpecifier | (() => undefined | UserTemplateKeySpecifier);
    fields?: UserTemplateFieldPolicy;
  };
  VerifiedCredential?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | VerifiedCredentialKeySpecifier | (() => undefined | VerifiedCredentialKeySpecifier);
    fields?: VerifiedCredentialFieldPolicy;
  };
  Visual?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | VisualKeySpecifier | (() => undefined | VisualKeySpecifier);
    fields?: VisualFieldPolicy;
  };
};
export type TypedTypePolicies = StrictTypedTypePolicies & TypePolicies;
