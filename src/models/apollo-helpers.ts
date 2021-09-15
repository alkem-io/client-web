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
  | 'id'
  | 'lifecycle'
  | 'questions'
  | 'user'
  | ApplicationKeySpecifier
)[];
export type ApplicationFieldPolicy = {
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  lifecycle?: FieldPolicy<any> | FieldReadFunction<any>;
  questions?: FieldPolicy<any> | FieldReadFunction<any>;
  user?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ApplicationReceivedKeySpecifier = (
  | 'applicationId'
  | 'communityID'
  | 'userNameID'
  | ApplicationReceivedKeySpecifier
)[];
export type ApplicationReceivedFieldPolicy = {
  applicationId?: FieldPolicy<any> | FieldReadFunction<any>;
  communityID?: FieldPolicy<any> | FieldReadFunction<any>;
  userNameID?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type ApplicationResultEntryKeySpecifier = (
  | 'communityID'
  | 'displayName'
  | 'id'
  | 'state'
  | ApplicationResultEntryKeySpecifier
)[];
export type ApplicationResultEntryFieldPolicy = {
  communityID?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  state?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type AuthenticationConfigKeySpecifier = ('enabled' | 'providers' | AuthenticationConfigKeySpecifier)[];
export type AuthenticationConfigFieldPolicy = {
  enabled?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'verifiedCredentialRules'
  | AuthorizationKeySpecifier
)[];
export type AuthorizationFieldPolicy = {
  anonymousReadAccess?: FieldPolicy<any> | FieldReadFunction<any>;
  credentialRules?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  verifiedCredentialRules?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type AuthorizationRuleCredentialKeySpecifier = (
  | 'grantedPrivileges'
  | 'resourceID'
  | 'type'
  | AuthorizationRuleCredentialKeySpecifier
)[];
export type AuthorizationRuleCredentialFieldPolicy = {
  grantedPrivileges?: FieldPolicy<any> | FieldReadFunction<any>;
  resourceID?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CanvasKeySpecifier = ('id' | 'name' | 'value' | CanvasKeySpecifier)[];
export type CanvasFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'ecoverseID'
  | 'id'
  | 'leadOrganisations'
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
  leadOrganisations?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type CommunicationMessageReceivedKeySpecifier = (
  | 'communityId'
  | 'message'
  | 'roomId'
  | 'roomName'
  | 'userEmail'
  | CommunicationMessageReceivedKeySpecifier
)[];
export type CommunicationMessageReceivedFieldPolicy = {
  communityId?: FieldPolicy<any> | FieldReadFunction<any>;
  message?: FieldPolicy<any> | FieldReadFunction<any>;
  roomId?: FieldPolicy<any> | FieldReadFunction<any>;
  roomName?: FieldPolicy<any> | FieldReadFunction<any>;
  userEmail?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CommunicationMessageResultKeySpecifier = (
  | 'id'
  | 'message'
  | 'sender'
  | 'timestamp'
  | CommunicationMessageResultKeySpecifier
)[];
export type CommunicationMessageResultFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  message?: FieldPolicy<any> | FieldReadFunction<any>;
  sender?: FieldPolicy<any> | FieldReadFunction<any>;
  timestamp?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CommunityKeySpecifier = (
  | 'applications'
  | 'authorization'
  | 'discussionRoom'
  | 'displayName'
  | 'groups'
  | 'id'
  | 'members'
  | 'updatesRoom'
  | CommunityKeySpecifier
)[];
export type CommunityFieldPolicy = {
  applications?: FieldPolicy<any> | FieldReadFunction<any>;
  authorization?: FieldPolicy<any> | FieldReadFunction<any>;
  discussionRoom?: FieldPolicy<any> | FieldReadFunction<any>;
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  groups?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  members?: FieldPolicy<any> | FieldReadFunction<any>;
  updatesRoom?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type CommunityRoomKeySpecifier = ('id' | 'messages' | CommunityRoomKeySpecifier)[];
export type CommunityRoomFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  messages?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type DirectRoomKeySpecifier = ('id' | 'messages' | 'receiverID' | DirectRoomKeySpecifier)[];
export type DirectRoomFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  messages?: FieldPolicy<any> | FieldReadFunction<any>;
  receiverID?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'templateName'
  | LifecycleKeySpecifier
)[];
export type LifecycleFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  machineDef?: FieldPolicy<any> | FieldReadFunction<any>;
  nextEvents?: FieldPolicy<any> | FieldReadFunction<any>;
  state?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type MembershipOrganisationResultEntryChallengeKeySpecifier = (
  | 'displayName'
  | 'ecoverseID'
  | 'id'
  | 'nameID'
  | MembershipOrganisationResultEntryChallengeKeySpecifier
)[];
export type MembershipOrganisationResultEntryChallengeFieldPolicy = {
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
export type MembershipUserResultEntryOrganisationKeySpecifier = (
  | 'displayName'
  | 'id'
  | 'nameID'
  | 'organisationID'
  | 'userGroups'
  | MembershipUserResultEntryOrganisationKeySpecifier
)[];
export type MembershipUserResultEntryOrganisationFieldPolicy = {
  displayName?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  nameID?: FieldPolicy<any> | FieldReadFunction<any>;
  organisationID?: FieldPolicy<any> | FieldReadFunction<any>;
  userGroups?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MetadataKeySpecifier = ('activity' | 'services' | MetadataKeySpecifier)[];
export type MetadataFieldPolicy = {
  activity?: FieldPolicy<any> | FieldReadFunction<any>;
  services?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MutationKeySpecifier = (
  | 'assignUserAsChallengeAdmin'
  | 'assignUserAsEcoverseAdmin'
  | 'assignUserAsGlobalAdmin'
  | 'assignUserAsGlobalCommunityAdmin'
  | 'assignUserAsOrganisationAdmin'
  | 'assignUserAsOrganisationOwner'
  | 'assignUserToCommunity'
  | 'assignUserToGroup'
  | 'assignUserToOrganisation'
  | 'authorizationPolicyResetOnEcoverse'
  | 'authorizationPolicyResetOnOrganisation'
  | 'authorizationPolicyResetOnUser'
  | 'authorizeStateModificationOnChallenge'
  | 'createActor'
  | 'createActorGroup'
  | 'createApplication'
  | 'createAspect'
  | 'createChallenge'
  | 'createChildChallenge'
  | 'createEcoverse'
  | 'createGroupOnCommunity'
  | 'createGroupOnOrganisation'
  | 'createOpportunity'
  | 'createOrganisation'
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
  | 'deleteChallenge'
  | 'deleteEcoverse'
  | 'deleteOpportunity'
  | 'deleteOrganisation'
  | 'deleteProject'
  | 'deleteReference'
  | 'deleteRelation'
  | 'deleteUser'
  | 'deleteUserApplication'
  | 'deleteUserGroup'
  | 'eventOnApplication'
  | 'eventOnChallenge'
  | 'eventOnOpportunity'
  | 'eventOnProject'
  | 'grantCredentialToUser'
  | 'messageDiscussionCommunity'
  | 'messageUpdateCommunity'
  | 'messageUser'
  | 'removeDiscussionCommunity'
  | 'removeUpdateCommunity'
  | 'removeUserAsChallengeAdmin'
  | 'removeUserAsEcoverseAdmin'
  | 'removeUserAsGlobalAdmin'
  | 'removeUserAsGlobalCommunityAdmin'
  | 'removeUserAsOrganisationAdmin'
  | 'removeUserAsOrganisationOwner'
  | 'removeUserFromCommunity'
  | 'removeUserFromGroup'
  | 'removeUserFromOrganisation'
  | 'revokeCredentialFromUser'
  | 'updateActor'
  | 'updateAspect'
  | 'updateChallenge'
  | 'updateEcosystemModel'
  | 'updateEcoverse'
  | 'updateOpportunity'
  | 'updateOrganisation'
  | 'updateProfile'
  | 'updateProject'
  | 'updateUser'
  | 'updateUserGroup'
  | 'uploadAvatar'
  | MutationKeySpecifier
)[];
export type MutationFieldPolicy = {
  assignUserAsChallengeAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserAsEcoverseAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserAsGlobalAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserAsGlobalCommunityAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserAsOrganisationAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserAsOrganisationOwner?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserToCommunity?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserToGroup?: FieldPolicy<any> | FieldReadFunction<any>;
  assignUserToOrganisation?: FieldPolicy<any> | FieldReadFunction<any>;
  authorizationPolicyResetOnEcoverse?: FieldPolicy<any> | FieldReadFunction<any>;
  authorizationPolicyResetOnOrganisation?: FieldPolicy<any> | FieldReadFunction<any>;
  authorizationPolicyResetOnUser?: FieldPolicy<any> | FieldReadFunction<any>;
  authorizeStateModificationOnChallenge?: FieldPolicy<any> | FieldReadFunction<any>;
  createActor?: FieldPolicy<any> | FieldReadFunction<any>;
  createActorGroup?: FieldPolicy<any> | FieldReadFunction<any>;
  createApplication?: FieldPolicy<any> | FieldReadFunction<any>;
  createAspect?: FieldPolicy<any> | FieldReadFunction<any>;
  createChallenge?: FieldPolicy<any> | FieldReadFunction<any>;
  createChildChallenge?: FieldPolicy<any> | FieldReadFunction<any>;
  createEcoverse?: FieldPolicy<any> | FieldReadFunction<any>;
  createGroupOnCommunity?: FieldPolicy<any> | FieldReadFunction<any>;
  createGroupOnOrganisation?: FieldPolicy<any> | FieldReadFunction<any>;
  createOpportunity?: FieldPolicy<any> | FieldReadFunction<any>;
  createOrganisation?: FieldPolicy<any> | FieldReadFunction<any>;
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
  deleteChallenge?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteEcoverse?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteOpportunity?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteOrganisation?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteProject?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteReference?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteRelation?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteUser?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteUserApplication?: FieldPolicy<any> | FieldReadFunction<any>;
  deleteUserGroup?: FieldPolicy<any> | FieldReadFunction<any>;
  eventOnApplication?: FieldPolicy<any> | FieldReadFunction<any>;
  eventOnChallenge?: FieldPolicy<any> | FieldReadFunction<any>;
  eventOnOpportunity?: FieldPolicy<any> | FieldReadFunction<any>;
  eventOnProject?: FieldPolicy<any> | FieldReadFunction<any>;
  grantCredentialToUser?: FieldPolicy<any> | FieldReadFunction<any>;
  messageDiscussionCommunity?: FieldPolicy<any> | FieldReadFunction<any>;
  messageUpdateCommunity?: FieldPolicy<any> | FieldReadFunction<any>;
  messageUser?: FieldPolicy<any> | FieldReadFunction<any>;
  removeDiscussionCommunity?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUpdateCommunity?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserAsChallengeAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserAsEcoverseAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserAsGlobalAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserAsGlobalCommunityAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserAsOrganisationAdmin?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserAsOrganisationOwner?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserFromCommunity?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserFromGroup?: FieldPolicy<any> | FieldReadFunction<any>;
  removeUserFromOrganisation?: FieldPolicy<any> | FieldReadFunction<any>;
  revokeCredentialFromUser?: FieldPolicy<any> | FieldReadFunction<any>;
  updateActor?: FieldPolicy<any> | FieldReadFunction<any>;
  updateAspect?: FieldPolicy<any> | FieldReadFunction<any>;
  updateChallenge?: FieldPolicy<any> | FieldReadFunction<any>;
  updateEcosystemModel?: FieldPolicy<any> | FieldReadFunction<any>;
  updateEcoverse?: FieldPolicy<any> | FieldReadFunction<any>;
  updateOpportunity?: FieldPolicy<any> | FieldReadFunction<any>;
  updateOrganisation?: FieldPolicy<any> | FieldReadFunction<any>;
  updateProfile?: FieldPolicy<any> | FieldReadFunction<any>;
  updateProject?: FieldPolicy<any> | FieldReadFunction<any>;
  updateUser?: FieldPolicy<any> | FieldReadFunction<any>;
  updateUserGroup?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type OrganisationKeySpecifier = (
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
  | 'verified'
  | 'website'
  | OrganisationKeySpecifier
)[];
export type OrganisationFieldPolicy = {
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
  verified?: FieldPolicy<any> | FieldReadFunction<any>;
  website?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type OrganisationMembershipKeySpecifier = (
  | 'challengesLeading'
  | 'ecoversesHosting'
  | 'id'
  | OrganisationMembershipKeySpecifier
)[];
export type OrganisationMembershipFieldPolicy = {
  challengesLeading?: FieldPolicy<any> | FieldReadFunction<any>;
  ecoversesHosting?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'community'
  | 'configuration'
  | 'ecoverse'
  | 'ecoverses'
  | 'me'
  | 'meHasProfile'
  | 'membershipOrganisation'
  | 'membershipUser'
  | 'metadata'
  | 'organisation'
  | 'organisations'
  | 'search'
  | 'user'
  | 'userAuthorizationPrivileges'
  | 'users'
  | 'usersById'
  | 'usersWithAuthorizationCredential'
  | QueryKeySpecifier
)[];
export type QueryFieldPolicy = {
  community?: FieldPolicy<any> | FieldReadFunction<any>;
  configuration?: FieldPolicy<any> | FieldReadFunction<any>;
  ecoverse?: FieldPolicy<any> | FieldReadFunction<any>;
  ecoverses?: FieldPolicy<any> | FieldReadFunction<any>;
  me?: FieldPolicy<any> | FieldReadFunction<any>;
  meHasProfile?: FieldPolicy<any> | FieldReadFunction<any>;
  membershipOrganisation?: FieldPolicy<any> | FieldReadFunction<any>;
  membershipUser?: FieldPolicy<any> | FieldReadFunction<any>;
  metadata?: FieldPolicy<any> | FieldReadFunction<any>;
  organisation?: FieldPolicy<any> | FieldReadFunction<any>;
  organisations?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type QuestionTemplateKeySpecifier = ('question' | 'required' | QuestionTemplateKeySpecifier)[];
export type QuestionTemplateFieldPolicy = {
  question?: FieldPolicy<any> | FieldReadFunction<any>;
  required?: FieldPolicy<any> | FieldReadFunction<any>;
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
export type RoomInvitationReceivedKeySpecifier = ('roomId' | RoomInvitationReceivedKeySpecifier)[];
export type RoomInvitationReceivedFieldPolicy = {
  roomId?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'avatarUploaded'
  | 'messageReceived'
  | 'roomNotificationReceived'
  | SubscriptionKeySpecifier
)[];
export type SubscriptionFieldPolicy = {
  applicationReceived?: FieldPolicy<any> | FieldReadFunction<any>;
  avatarUploaded?: FieldPolicy<any> | FieldReadFunction<any>;
  messageReceived?: FieldPolicy<any> | FieldReadFunction<any>;
  roomNotificationReceived?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'users'
  | TemplateKeySpecifier
)[];
export type TemplateFieldPolicy = {
  challenges?: FieldPolicy<any> | FieldReadFunction<any>;
  description?: FieldPolicy<any> | FieldReadFunction<any>;
  ecoverses?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  opportunities?: FieldPolicy<any> | FieldReadFunction<any>;
  users?: FieldPolicy<any> | FieldReadFunction<any>;
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
  | 'organisations'
  | UserMembershipKeySpecifier
)[];
export type UserMembershipFieldPolicy = {
  applications?: FieldPolicy<any> | FieldReadFunction<any>;
  communities?: FieldPolicy<any> | FieldReadFunction<any>;
  ecoverses?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  organisations?: FieldPolicy<any> | FieldReadFunction<any>;
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
  AuthorizationRuleCredential?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | AuthorizationRuleCredentialKeySpecifier
      | (() => undefined | AuthorizationRuleCredentialKeySpecifier);
    fields?: AuthorizationRuleCredentialFieldPolicy;
  };
  Canvas?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CanvasKeySpecifier | (() => undefined | CanvasKeySpecifier);
    fields?: CanvasFieldPolicy;
  };
  Challenge?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ChallengeKeySpecifier | (() => undefined | ChallengeKeySpecifier);
    fields?: ChallengeFieldPolicy;
  };
  ChallengeTemplate?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | ChallengeTemplateKeySpecifier | (() => undefined | ChallengeTemplateKeySpecifier);
    fields?: ChallengeTemplateFieldPolicy;
  };
  CommunicationMessageReceived?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | CommunicationMessageReceivedKeySpecifier
      | (() => undefined | CommunicationMessageReceivedKeySpecifier);
    fields?: CommunicationMessageReceivedFieldPolicy;
  };
  CommunicationMessageResult?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | CommunicationMessageResultKeySpecifier
      | (() => undefined | CommunicationMessageResultKeySpecifier);
    fields?: CommunicationMessageResultFieldPolicy;
  };
  Community?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CommunityKeySpecifier | (() => undefined | CommunityKeySpecifier);
    fields?: CommunityFieldPolicy;
  };
  CommunityRoom?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | CommunityRoomKeySpecifier | (() => undefined | CommunityRoomKeySpecifier);
    fields?: CommunityRoomFieldPolicy;
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
  MembershipOrganisationResultEntryChallenge?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | MembershipOrganisationResultEntryChallengeKeySpecifier
      | (() => undefined | MembershipOrganisationResultEntryChallengeKeySpecifier);
    fields?: MembershipOrganisationResultEntryChallengeFieldPolicy;
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
  MembershipUserResultEntryOrganisation?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | MembershipUserResultEntryOrganisationKeySpecifier
      | (() => undefined | MembershipUserResultEntryOrganisationKeySpecifier);
    fields?: MembershipUserResultEntryOrganisationFieldPolicy;
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
  Organisation?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | OrganisationKeySpecifier | (() => undefined | OrganisationKeySpecifier);
    fields?: OrganisationFieldPolicy;
  };
  OrganisationMembership?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | OrganisationMembershipKeySpecifier | (() => undefined | OrganisationMembershipKeySpecifier);
    fields?: OrganisationMembershipFieldPolicy;
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
  RoomInvitationReceived?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | RoomInvitationReceivedKeySpecifier | (() => undefined | RoomInvitationReceivedKeySpecifier);
    fields?: RoomInvitationReceivedFieldPolicy;
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
