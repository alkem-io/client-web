export type Maybe<T> = T | undefined;
export type InputMaybe<T> = T | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DID: string;
  DateTime: Date;
  JSON: string;
  LifecycleDefinition: string;
  Markdown: string;
  MessageID: string;
  NameID: string;
  UUID: string;
  UUID_NAMEID: string;
  UUID_NAMEID_EMAIL: string;
  Upload: File;
};

export type Actor = {
  __typename?: 'Actor';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** A description of this actor */
  description?: Maybe<Scalars['String']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The change / effort required of this actor */
  impact?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  /** A value derived by this actor */
  value?: Maybe<Scalars['String']>;
};

export type ActorGroup = {
  __typename?: 'ActorGroup';
  /** The set of actors in this actor group */
  actors?: Maybe<Array<Actor>>;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** A description of this group of actors */
  description?: Maybe<Scalars['String']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  name: Scalars['String'];
};

export type Agent = {
  __typename?: 'Agent';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The Credentials held by this Agent. */
  credentials?: Maybe<Array<Credential>>;
  /** The Decentralized Identifier (DID) for this Agent. */
  did?: Maybe<Scalars['DID']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The Verfied Credentials for this Agent. */
  verifiedCredentials?: Maybe<Array<VerifiedCredential>>;
};

export type AgentBeginVerifiedCredentialOfferOutput = {
  __typename?: 'AgentBeginVerifiedCredentialOfferOutput';
  /** The token containing the information about issuer, callback endpoint and the credentials offered */
  jwt: Scalars['String'];
  /** The QR Code Image to be offered on the client for scanning by a mobile wallet */
  qrCodeImg: Scalars['String'];
};

export type AgentBeginVerifiedCredentialRequestOutput = {
  __typename?: 'AgentBeginVerifiedCredentialRequestOutput';
  /** The token containing the information about issuer, callback endpoint and the credentials offered */
  jwt: Scalars['String'];
  /** The QR Code Image to be offered on the client for scanning by a mobile wallet */
  qrCodeImg: Scalars['String'];
};

export type Application = {
  __typename?: 'Application';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  createdDate: Scalars['DateTime'];
  /** The ID of the entity */
  id: Scalars['UUID'];
  lifecycle: Lifecycle;
  /** The Questions for this application. */
  questions: Array<Question>;
  updatedDate: Scalars['DateTime'];
  /** The User for this Application. */
  user: User;
};

export type ApplicationEventInput = {
  applicationID: Scalars['UUID'];
  eventName: Scalars['String'];
};

export type ApplicationForRoleResult = {
  __typename?: 'ApplicationForRoleResult';
  /** ID for the Challenge being applied to, if any. Or the Challenge containing the Opportunity being applied to. */
  challengeID?: Maybe<Scalars['UUID']>;
  /** ID for the community */
  communityID: Scalars['UUID'];
  /** Date of creation */
  createdDate: Scalars['DateTime'];
  /** Display name of the community */
  displayName: Scalars['String'];
  /** ID for the ultimate containing Hub */
  hubID: Scalars['UUID'];
  /** ID for the application */
  id: Scalars['UUID'];
  /** ID for the Opportunity being applied to, if any. */
  opportunityID?: Maybe<Scalars['UUID']>;
  /** The current state of the application. */
  state: Scalars['String'];
  /** Date of last update */
  updatedDate: Scalars['DateTime'];
};

export type ApplicationTemplate = {
  __typename?: 'ApplicationTemplate';
  /** Application template name. */
  name: Scalars['String'];
  /** Template questions. */
  questions: Array<QuestionTemplate>;
};

export type Aspect = {
  __typename?: 'Aspect';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The banner Visual for this Aspect. */
  banner?: Maybe<Visual>;
  /** The narrow banner visual for this Aspect. */
  bannerNarrow?: Maybe<Visual>;
  /** The comments for this Aspect. */
  comments?: Maybe<Comments>;
  /** The id of the user that created this Aspect */
  createdBy: Scalars['UUID'];
  createdDate: Scalars['DateTime'];
  /** The description of this aspect */
  description: Scalars['Markdown'];
  /** The display name. */
  displayName: Scalars['String'];
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The References for this Aspect. */
  references?: Maybe<Array<Reference>>;
  /** The set of tags for the Aspect */
  tagset?: Maybe<Tagset>;
  /** The aspect type, e.g. knowledge, idea, stakeholder persona etc. */
  type: Scalars['String'];
};

export type AspectCommentsMessageReceived = {
  __typename?: 'AspectCommentsMessageReceived';
  /** The identifier for the Aspect. */
  aspectID: Scalars['String'];
  /** The message that has been sent. */
  message: Message;
};

export type AspectTemplate = {
  __typename?: 'AspectTemplate';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The default description to show to users filling our a new instance. */
  defaultDescription: Scalars['Markdown'];
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The meta information for this Template */
  info: TemplateInfo;
  /** The type for this Aspect. */
  type: Scalars['String'];
};

export type AssignChallengeAdminInput = {
  challengeID: Scalars['UUID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type AssignCommunityLeadOrganizationInput = {
  communityID: Scalars['UUID'];
  organizationID: Scalars['UUID_NAMEID'];
};

export type AssignCommunityLeadUserInput = {
  communityID: Scalars['UUID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type AssignCommunityMemberOrganizationInput = {
  communityID: Scalars['UUID'];
  organizationID: Scalars['UUID_NAMEID'];
};

export type AssignCommunityMemberUserInput = {
  communityID: Scalars['UUID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type AssignGlobalAdminInput = {
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type AssignGlobalCommunityAdminInput = {
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type AssignHubAdminInput = {
  hubID: Scalars['UUID_NAMEID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type AssignOpportunityAdminInput = {
  opportunityID: Scalars['UUID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type AssignOrganizationAdminInput = {
  organizationID: Scalars['UUID_NAMEID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type AssignOrganizationMemberInput = {
  organizationID: Scalars['UUID_NAMEID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type AssignOrganizationOwnerInput = {
  organizationID: Scalars['UUID_NAMEID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type AssignUserGroupMemberInput = {
  groupID: Scalars['UUID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type AuthenticationConfig = {
  __typename?: 'AuthenticationConfig';
  /** Alkemio Authentication Providers Config. */
  providers: Array<AuthenticationProviderConfig>;
};

export type AuthenticationProviderConfig = {
  __typename?: 'AuthenticationProviderConfig';
  /** Configuration of the authenticaiton provider */
  config: AuthenticationProviderConfigUnion;
  /** Is the authentication provider enabled? */
  enabled: Scalars['Boolean'];
  /** CDN location of an icon of the authentication provider login button. */
  icon: Scalars['String'];
  /** Label of the authentication provider. */
  label: Scalars['String'];
  /** Name of the authentication provider. */
  name: Scalars['String'];
};

export type AuthenticationProviderConfigUnion = OryConfig;

export type Authorization = {
  __typename?: 'Authorization';
  anonymousReadAccess: Scalars['Boolean'];
  /** The set of credential rules that are contained by this Authorization Policy. */
  credentialRules?: Maybe<Array<AuthorizationPolicyRuleCredential>>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The privileges granted to the current user based on this Authorization Policy. */
  myPrivileges?: Maybe<Array<AuthorizationPrivilege>>;
  /** The set of privilege rules that are contained by this Authorization Policy. */
  privilegeRules?: Maybe<Array<AuthorizationPolicyRulePrivilege>>;
  /** The set of verified credential rules that are contained by this Authorization Policy. */
  verifiedCredentialRules?: Maybe<Array<AuthorizationPolicyRuleVerifiedCredential>>;
};

export enum AuthorizationCredential {
  ChallengeAdmin = 'CHALLENGE_ADMIN',
  ChallengeLead = 'CHALLENGE_LEAD',
  ChallengeMember = 'CHALLENGE_MEMBER',
  GlobalAdmin = 'GLOBAL_ADMIN',
  GlobalAdminCommunity = 'GLOBAL_ADMIN_COMMUNITY',
  GlobalRegistered = 'GLOBAL_REGISTERED',
  HubAdmin = 'HUB_ADMIN',
  HubHost = 'HUB_HOST',
  HubMember = 'HUB_MEMBER',
  OpportunityAdmin = 'OPPORTUNITY_ADMIN',
  OpportunityLead = 'OPPORTUNITY_LEAD',
  OpportunityMember = 'OPPORTUNITY_MEMBER',
  OrganizationAdmin = 'ORGANIZATION_ADMIN',
  OrganizationMember = 'ORGANIZATION_MEMBER',
  OrganizationOwner = 'ORGANIZATION_OWNER',
  UserGroupMember = 'USER_GROUP_MEMBER',
  UserSelfManagement = 'USER_SELF_MANAGEMENT',
}

export type AuthorizationPolicyRuleCredential = {
  __typename?: 'AuthorizationPolicyRuleCredential';
  grantedPrivileges: Array<AuthorizationPrivilege>;
  inheritable: Scalars['Boolean'];
  resourceID: Scalars['String'];
  type: Scalars['String'];
};

export type AuthorizationPolicyRulePrivilege = {
  __typename?: 'AuthorizationPolicyRulePrivilege';
  grantedPrivileges: Array<AuthorizationPrivilege>;
  sourcePrivilege: Scalars['String'];
};

export type AuthorizationPolicyRuleVerifiedCredential = {
  __typename?: 'AuthorizationPolicyRuleVerifiedCredential';
  claimRule: Scalars['String'];
  credentialName: Scalars['String'];
  grantedPrivileges: Array<AuthorizationPrivilege>;
};

export enum AuthorizationPrivilege {
  CommunityApply = 'COMMUNITY_APPLY',
  CommunityContextReview = 'COMMUNITY_CONTEXT_REVIEW',
  CommunityJoin = 'COMMUNITY_JOIN',
  Create = 'CREATE',
  CreateAspect = 'CREATE_ASPECT',
  CreateCallout = 'CREATE_CALLOUT',
  CreateCanvas = 'CREATE_CANVAS',
  CreateComment = 'CREATE_COMMENT',
  CreateHub = 'CREATE_HUB',
  CreateOrganization = 'CREATE_ORGANIZATION',
  CreateRelation = 'CREATE_RELATION',
  Delete = 'DELETE',
  Grant = 'GRANT',
  Read = 'READ',
  ReadUsers = 'READ_USERS',
  Update = 'UPDATE',
  UpdateCanvas = 'UPDATE_CANVAS',
  UpdateInnovationFlow = 'UPDATE_INNOVATION_FLOW',
}

export type Callout = {
  __typename?: 'Callout';
  /** The Aspects associated with this Callout. */
  aspects?: Maybe<Array<Aspect>>;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The Canvases associated with this Callout. */
  canvases?: Maybe<Array<Canvas>>;
  /** The description of this Callout */
  description: Scalars['Markdown'];
  /** The Discussion object for this Callout. */
  discussion?: Maybe<Discussion>;
  /** The display name. */
  displayName: Scalars['String'];
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** State of the Callout. */
  state: CalloutState;
  /** The Callout type, e.g. Card, Canvas, Discussion */
  type: CalloutType;
  /** Visibility of the Callout. */
  visibility: CalloutVisibility;
};

export type CalloutAspectsArgs = {
  IDs?: InputMaybe<Array<Scalars['UUID_NAMEID']>>;
  limit?: InputMaybe<Scalars['Float']>;
  shuffle?: InputMaybe<Scalars['Boolean']>;
};

export type CalloutCanvasesArgs = {
  IDs?: InputMaybe<Array<Scalars['UUID']>>;
  limit?: InputMaybe<Scalars['Float']>;
  shuffle?: InputMaybe<Scalars['Boolean']>;
};

export type CalloutAspectCreated = {
  __typename?: 'CalloutAspectCreated';
  /** The aspect that has been created. */
  aspect: Aspect;
  /** The identifier for the Callout on which the aspect was created. */
  calloutID: Scalars['String'];
};

export enum CalloutState {
  Archived = 'ARCHIVED',
  Closed = 'CLOSED',
  Open = 'OPEN',
}

export enum CalloutType {
  Canvas = 'CANVAS',
  Card = 'CARD',
  Discussion = 'DISCUSSION',
}

export enum CalloutVisibility {
  Draft = 'DRAFT',
  Published = 'PUBLISHED',
}

export type Canvas = {
  __typename?: 'Canvas';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The checkout out state of this Canvas. */
  checkout?: Maybe<CanvasCheckout>;
  /** The id of the user that created this Canvas */
  createdBy: Scalars['UUID'];
  createdDate: Scalars['DateTime'];
  /** The display name. */
  displayName: Scalars['String'];
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The preview image for the Canvas. */
  preview?: Maybe<Visual>;
  /** The JSON representation of the Canvas. */
  value: Scalars['JSON'];
};

export type CanvasCheckout = {
  __typename?: 'CanvasCheckout';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  lifecycle: Lifecycle;
  /** The id of the user that has checked the entity out. */
  lockedBy: Scalars['UUID'];
  /** The checkout out state of this Canvas. */
  status: CanvasCheckoutStateEnum;
};

export type CanvasCheckoutEventInput = {
  canvasCheckoutID: Scalars['UUID'];
  eventName: Scalars['String'];
};

export enum CanvasCheckoutStateEnum {
  Available = 'AVAILABLE',
  CheckedOut = 'CHECKED_OUT',
}

export type CanvasContentUpdated = {
  __typename?: 'CanvasContentUpdated';
  /** The identifier for the Canvas. */
  canvasID: Scalars['String'];
  /** The updated content. */
  value: Scalars['String'];
};

export type CanvasTemplate = {
  __typename?: 'CanvasTemplate';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The meta information for this Template */
  info: TemplateInfo;
  /** The JSON representation of the Canvas. */
  value: Scalars['JSON'];
};

export type Challenge = Searchable & {
  __typename?: 'Challenge';
  /** The activity within this Challenge. */
  activity?: Maybe<Array<Nvp>>;
  /** The Agent representing this Challenge. */
  agent?: Maybe<Agent>;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The set of child Challenges within this challenge. */
  challenges?: Maybe<Array<Challenge>>;
  /** The collaboration for the challenge. */
  collaboration?: Maybe<Collaboration>;
  /** The community for the challenge. */
  community?: Maybe<Community>;
  /** The context for the challenge. */
  context?: Maybe<Context>;
  /** The display name. */
  displayName: Scalars['String'];
  hubID: Scalars['String'];
  id: Scalars['UUID'];
  /** The lifeycle for the Challenge. */
  lifecycle?: Maybe<Lifecycle>;
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The Opportunities for the challenge. */
  opportunities?: Maybe<Array<Opportunity>>;
  /** The preferences for this Challenge */
  preferences: Array<Preference>;
  /** The set of tags for the challenge */
  tagset?: Maybe<Tagset>;
};

export type ChallengeOpportunitiesArgs = {
  limit?: InputMaybe<Scalars['Float']>;
  shuffle?: InputMaybe<Scalars['Boolean']>;
};

export type ChallengeEventInput = {
  ID: Scalars['UUID'];
  eventName: Scalars['String'];
};

export enum ChallengePreferenceType {
  MembershipApplyChallengeFromHubMembers = 'MEMBERSHIP_APPLY_CHALLENGE_FROM_HUB_MEMBERS',
  MembershipFeedbackOnChallengeContext = 'MEMBERSHIP_FEEDBACK_ON_CHALLENGE_CONTEXT',
  MembershipJoinChallengeFromHubMembers = 'MEMBERSHIP_JOIN_CHALLENGE_FROM_HUB_MEMBERS',
}

export type ChallengeTemplate = {
  __typename?: 'ChallengeTemplate';
  /** Application templates. */
  applications?: Maybe<Array<ApplicationTemplate>>;
  /** Feedback templates. */
  feedback?: Maybe<Array<FeedbackTemplate>>;
  /** Challenge template name. */
  name: Scalars['String'];
};

export type Collaboration = {
  __typename?: 'Collaboration';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** List of callouts */
  callouts?: Maybe<Array<Callout>>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** List of relations */
  relations?: Maybe<Array<Relation>>;
};

export type CollaborationCalloutsArgs = {
  IDs?: InputMaybe<Array<Scalars['UUID_NAMEID']>>;
  limit?: InputMaybe<Scalars['Float']>;
  shuffle?: InputMaybe<Scalars['Boolean']>;
};

export type Comments = {
  __typename?: 'Comments';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Messages in this Comments. */
  messages?: Maybe<Array<Message>>;
};

export type CommentsRemoveMessageInput = {
  /** The Comments the message is being removed from. */
  commentsID: Scalars['UUID'];
  /** The message id that should be removed */
  messageID: Scalars['String'];
};

export type CommentsSendMessageInput = {
  /** The Comments the message is being sent to */
  commentsID: Scalars['UUID'];
  /** The message being sent */
  message: Scalars['String'];
};

export type Communication = {
  __typename?: 'Communication';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** A particular Discussions active in this Communication. */
  discussion?: Maybe<Discussion>;
  /** The Discussions active in this Communication. */
  discussions?: Maybe<Array<Discussion>>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Updates for this Communication. */
  updates?: Maybe<Updates>;
};

export type CommunicationDiscussionArgs = {
  ID: Scalars['String'];
};

export type CommunicationAdminEnsureAccessInput = {
  communityID: Scalars['UUID'];
};

export type CommunicationAdminMembershipInput = {
  communityID: Scalars['UUID'];
};

export type CommunicationAdminMembershipResult = {
  __typename?: 'CommunicationAdminMembershipResult';
  /** Display name of the result */
  displayName: Scalars['String'];
  /** A unique identifier for this comunication room membership result. */
  id: Scalars['String'];
  /** Rooms in this Communication */
  rooms: Array<CommunicationAdminRoomMembershipResult>;
};

export type CommunicationAdminOrphanedUsageResult = {
  __typename?: 'CommunicationAdminOrphanedUsageResult';
  /** Rooms in the Communication platform that are not used */
  rooms: Array<CommunicationAdminRoomResult>;
};

export type CommunicationAdminRemoveOrphanedRoomInput = {
  roomID: Scalars['String'];
};

export type CommunicationAdminRoomMembershipResult = {
  __typename?: 'CommunicationAdminRoomMembershipResult';
  /** Display name of the entity */
  displayName: Scalars['String'];
  /** Members of the room that are not members of the Community. */
  extraMembers: Array<Scalars['String']>;
  /** A unique identifier for this membership result. */
  id: Scalars['String'];
  /** The access mode for the room. */
  joinRule: Scalars['String'];
  /** Name of the room */
  members: Array<Scalars['String']>;
  /** Members of the community that are missing from the room */
  missingMembers: Array<Scalars['String']>;
  /** The matrix room ID */
  roomID: Scalars['String'];
};

export type CommunicationAdminRoomResult = {
  __typename?: 'CommunicationAdminRoomResult';
  /** Display name of the result */
  displayName: Scalars['String'];
  /** The identifier for the orphaned room. */
  id: Scalars['String'];
  /** The members of the orphaned room */
  members: Array<Scalars['String']>;
};

export type CommunicationAdminUpdateRoomsJoinRuleInput = {
  isPublic: Scalars['Boolean'];
};

export type CommunicationCreateDiscussionInput = {
  /** The category for the Discussion */
  category: DiscussionCategory;
  /** The identifier for the Communication entity the Discussion is being created on. */
  communicationID: Scalars['UUID'];
  /** The description for the Discussion */
  description?: InputMaybe<Scalars['String']>;
  /** The title for the Discussion */
  title: Scalars['String'];
};

export type CommunicationDiscussionMessageReceived = {
  __typename?: 'CommunicationDiscussionMessageReceived';
  /** The identifier for the Discussion on which the message was sent. */
  discussionID: Scalars['String'];
  /** The message that has been sent. */
  message: Message;
};

export type CommunicationRoom = {
  __typename?: 'CommunicationRoom';
  /** The display name of the room */
  displayName: Scalars['String'];
  /** The identifier of the room */
  id: Scalars['String'];
  /** The messages that have been sent to the Room. */
  messages: Array<Message>;
};

export type CommunicationUpdateMessageReceived = {
  __typename?: 'CommunicationUpdateMessageReceived';
  /** The message that has been sent. */
  message: Message;
  /** The identifier for the Updates on which the message was sent. */
  updatesID: Scalars['String'];
};

export type Community = Groupable & {
  __typename?: 'Community';
  /** Application available for this community. */
  applications?: Maybe<Array<Application>>;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** All member users excluding the current lead users in this Community. */
  availableLeadUsers?: Maybe<PaginatedUsers>;
  /** All available users that are potential Community members. */
  availableMemberUsers?: Maybe<PaginatedUsers>;
  /** The Communications for this Community. */
  communication?: Maybe<Communication>;
  /** The name of the Community */
  displayName: Scalars['String'];
  /** Groups of users related to a Community. */
  groups?: Maybe<Array<UserGroup>>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** All Organizations that are leads in this Community. */
  leadOrganizations?: Maybe<Array<Organization>>;
  /** All users that are leads in this Community. */
  leadUsers?: Maybe<Array<User>>;
  /** All Organizations that are contributing to this Community. */
  memberOrganizations?: Maybe<Array<Organization>>;
  /** All users that are contributing to this Community. */
  memberUsers?: Maybe<Array<User>>;
  /** The policy that defines the roles for this Community. */
  policy?: Maybe<CommunityPolicy>;
};

export type CommunityAvailableLeadUsersArgs = {
  after?: InputMaybe<Scalars['UUID']>;
  before?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<UserFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type CommunityAvailableMemberUsersArgs = {
  after?: InputMaybe<Scalars['UUID']>;
  before?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<UserFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type CommunityApplyInput = {
  communityID: Scalars['UUID'];
  questions: Array<CreateNvpInput>;
};

export type CommunityJoinInput = {
  communityID: Scalars['UUID'];
};

export type CommunityPolicy = {
  __typename?: 'CommunityPolicy';
  lead: CommunityPolicyRole;
  member: CommunityPolicyRole;
};

export type CommunityPolicyRole = {
  __typename?: 'CommunityPolicyRole';
  /** The CredentialDefinition that is associated with this role */
  credential: CredentialDefinition;
  /** Maximum number of Organizations in this role */
  maxOrg: Scalars['Float'];
  /** Maximum number of Users in this role */
  maxUser: Scalars['Float'];
  /** Minimun number of Organizations in this role */
  minOrg: Scalars['Float'];
  /** Minimum number of Users in this role */
  minUser: Scalars['Float'];
};

export type Config = {
  __typename?: 'Config';
  /** Authentication configuration. */
  authentication: AuthenticationConfig;
  /** Platform related resources. */
  platform: Platform;
  /** Sentry (client monitoring) related configuration. */
  sentry: Sentry;
  /** Alkemio template configuration. */
  template: Template;
};

export type Context = {
  __typename?: 'Context';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** A detailed description of the current situation */
  background?: Maybe<Scalars['String']>;
  /** The EcosystemModel for this Context. */
  ecosystemModel?: Maybe<EcosystemModel>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** What is the potential impact? */
  impact?: Maybe<Scalars['Markdown']>;
  /** Location of this entity */
  location?: Maybe<Location>;
  /** The References for this Context. */
  references?: Maybe<Array<Reference>>;
  /** A one line description */
  tagline?: Maybe<Scalars['String']>;
  /** The goal that is being pursued */
  vision?: Maybe<Scalars['Markdown']>;
  /** The Visual assets for this Context. */
  visuals?: Maybe<Array<Visual>>;
  /** Who should get involved in this challenge */
  who?: Maybe<Scalars['String']>;
};

export type ContributorRoles = {
  __typename?: 'ContributorRoles';
  /** Open applications for this contributor. */
  applications?: Maybe<Array<ApplicationForRoleResult>>;
  /** Details of Hubs the User or Organization is a member of, with child memberships */
  hubs: Array<RolesResultHub>;
  id: Scalars['UUID'];
  /** Details of the Organizations the User is a member of, with child memberships. */
  organizations: Array<RolesResultOrganization>;
};

export type ConvertChallengeToHubInput = {
  /** The Challenge to be promoted to be a new Hub. Note: the original Challenge will no longer exist after the conversion.  */
  challengeID: Scalars['UUID_NAMEID'];
};

export type ConvertOpportunityToChallengeInput = {
  /** The Opportunity to be promoted to be a new Challenge. Note: the original Opportunity will no longer exist after the conversion.  */
  opportunityID: Scalars['UUID_NAMEID'];
};

export type CreateActorGroupInput = {
  description?: InputMaybe<Scalars['String']>;
  ecosystemModelID: Scalars['UUID'];
  name: Scalars['String'];
};

export type CreateActorInput = {
  actorGroupID: Scalars['UUID'];
  description?: InputMaybe<Scalars['String']>;
  impact?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  value?: InputMaybe<Scalars['String']>;
};

export type CreateAspectOnCalloutInput = {
  calloutID: Scalars['UUID'];
  description: Scalars['Markdown'];
  /** The display name for the entity. */
  displayName: Scalars['String'];
  /** A readable identifier, unique within the containing scope. */
  nameID?: InputMaybe<Scalars['NameID']>;
  tags?: InputMaybe<Array<Scalars['String']>>;
  type: Scalars['String'];
};

export type CreateAspectTemplateOnTemplatesSetInput = {
  /** The default description to be pre-filled when users create Aspects based on this template. */
  defaultDescription: Scalars['Markdown'];
  /** The meta information for this Template. */
  info: CreateTemplateInfoInput;
  templatesSetID: Scalars['UUID'];
  /** The type of Aspects created from this Template. */
  type: Scalars['String'];
};

export type CreateCalloutOnCollaborationInput = {
  collaborationID: Scalars['UUID'];
  /** Callout description. */
  description: Scalars['Markdown'];
  /** The display name for the entity. */
  displayName: Scalars['String'];
  /** A readable identifier, unique within the containing scope. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** State of the callout. */
  state?: InputMaybe<CalloutState>;
  /** Callout type. */
  type: CalloutType;
  /** Visibility of the Callout. */
  visibility: CalloutVisibility;
};

export type CreateCanvasOnCalloutInput = {
  calloutID: Scalars['UUID'];
  /** The display name for the entity. */
  displayName: Scalars['String'];
  /** A readable identifier, unique within the containing scope. If not provided it will be generated based on the displayName. */
  nameID?: InputMaybe<Scalars['NameID']>;
  value?: InputMaybe<Scalars['String']>;
};

export type CreateCanvasTemplateOnTemplatesSetInput = {
  /** Use the specified Canvas as the initial value for this CanvasTempplate */
  canvasID?: InputMaybe<Scalars['UUID']>;
  /** The meta information for this Template. */
  info: CreateTemplateInfoInput;
  templatesSetID: Scalars['UUID'];
  value?: InputMaybe<Scalars['JSON']>;
};

export type CreateChallengeOnChallengeInput = {
  challengeID: Scalars['UUID'];
  context?: InputMaybe<CreateContextInput>;
  /** The display name for the entity. */
  displayName: Scalars['String'];
  /** The Innovation Flow template to use for the Challenge. */
  innovationFlowTemplateID: Scalars['UUID'];
  /** Set lead Organizations for the Challenge. */
  leadOrganizations?: InputMaybe<Array<Scalars['UUID_NAMEID']>>;
  /** A readable identifier, unique within the containing scope. */
  nameID: Scalars['NameID'];
  tags?: InputMaybe<Array<Scalars['String']>>;
};

export type CreateChallengeOnHubInput = {
  context?: InputMaybe<CreateContextInput>;
  /** The display name for the entity. */
  displayName: Scalars['String'];
  hubID: Scalars['UUID_NAMEID'];
  /** The Innovation Flow template to use for the Challenge. */
  innovationFlowTemplateID: Scalars['UUID'];
  /** Set lead Organizations for the Challenge. */
  leadOrganizations?: InputMaybe<Array<Scalars['UUID_NAMEID']>>;
  /** A readable identifier, unique within the containing scope. */
  nameID: Scalars['NameID'];
  tags?: InputMaybe<Array<Scalars['String']>>;
};

export type CreateContextInput = {
  background?: InputMaybe<Scalars['Markdown']>;
  impact?: InputMaybe<Scalars['Markdown']>;
  location?: InputMaybe<CreateLocationInput>;
  /** Set of References for the new Context. */
  references?: InputMaybe<Array<CreateReferenceInput>>;
  tagline?: InputMaybe<Scalars['String']>;
  vision?: InputMaybe<Scalars['Markdown']>;
  who?: InputMaybe<Scalars['Markdown']>;
};

export type CreateFeedbackOnCommunityContextInput = {
  communityID: Scalars['UUID'];
  questions: Array<CreateNvpInput>;
};

export type CreateHubInput = {
  context?: InputMaybe<CreateContextInput>;
  /** The display name for the entity. */
  displayName: Scalars['String'];
  /** The host Organization for the hub */
  hostID: Scalars['UUID_NAMEID'];
  /** A readable identifier, unique within the containing scope. */
  nameID: Scalars['NameID'];
  tags?: InputMaybe<Array<Scalars['String']>>;
};

export type CreateLifecycleTemplateOnTemplatesSetInput = {
  /** The XState definition for this LifecycleTemplate. */
  definition: Scalars['LifecycleDefinition'];
  /** The meta information for this Template. */
  info: CreateTemplateInfoInput;
  templatesSetID: Scalars['UUID'];
  /** The type of the Lifecycles that this Template supports. */
  type: LifecycleType;
};

export type CreateLocationInput = {
  city?: InputMaybe<Scalars['String']>;
  country?: InputMaybe<Scalars['String']>;
};

export type CreateNvpInput = {
  name: Scalars['String'];
  sortOrder: Scalars['Float'];
  value: Scalars['String'];
};

export type CreateOpportunityInput = {
  challengeID: Scalars['UUID'];
  context?: InputMaybe<CreateContextInput>;
  /** The display name for the entity. */
  displayName: Scalars['String'];
  /** The Innovation Flow template to use for the Opportunity. */
  innovationFlowTemplateID: Scalars['UUID'];
  /** A readable identifier, unique within the containing scope. */
  nameID: Scalars['NameID'];
  tags?: InputMaybe<Array<Scalars['String']>>;
};

export type CreateOrganizationInput = {
  contactEmail?: InputMaybe<Scalars['String']>;
  /** The display name for the entity. */
  displayName: Scalars['String'];
  domain?: InputMaybe<Scalars['String']>;
  legalEntityName?: InputMaybe<Scalars['String']>;
  /** A readable identifier, unique within the containing scope. */
  nameID: Scalars['NameID'];
  profileData?: InputMaybe<CreateProfileInput>;
  website?: InputMaybe<Scalars['String']>;
};

export type CreateProfileInput = {
  description?: InputMaybe<Scalars['String']>;
  location?: InputMaybe<CreateLocationInput>;
  referencesData?: InputMaybe<Array<CreateReferenceInput>>;
  tagsetsData?: InputMaybe<Array<CreateTagsetInput>>;
};

export type CreateProjectInput = {
  description?: InputMaybe<Scalars['String']>;
  /** The display name for the entity. */
  displayName: Scalars['String'];
  /** A readable identifier, unique within the containing scope. */
  nameID: Scalars['NameID'];
  opportunityID: Scalars['UUID_NAMEID'];
};

export type CreateReferenceInput = {
  description?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  uri?: InputMaybe<Scalars['String']>;
};

export type CreateReferenceOnAspectInput = {
  aspectID: Scalars['UUID'];
  description?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  uri?: InputMaybe<Scalars['String']>;
};

export type CreateReferenceOnContextInput = {
  contextID: Scalars['UUID'];
  description?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  uri?: InputMaybe<Scalars['String']>;
};

export type CreateReferenceOnProfileInput = {
  description?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  profileID: Scalars['UUID'];
  uri?: InputMaybe<Scalars['String']>;
};

export type CreateRelationOnCollaborationInput = {
  actorName: Scalars['String'];
  actorRole?: InputMaybe<Scalars['String']>;
  actorType?: InputMaybe<Scalars['String']>;
  collaborationID: Scalars['UUID'];
  description?: InputMaybe<Scalars['String']>;
  type: Scalars['String'];
};

export type CreateTagsetInput = {
  name: Scalars['String'];
  tags?: InputMaybe<Array<Scalars['String']>>;
};

export type CreateTagsetOnProfileInput = {
  name: Scalars['String'];
  profileID?: InputMaybe<Scalars['UUID']>;
  tags?: InputMaybe<Array<Scalars['String']>>;
};

export type CreateTemplateInfoInput = {
  description: Scalars['Markdown'];
  tags?: InputMaybe<Array<Scalars['String']>>;
  title: Scalars['String'];
};

export type CreateUserGroupInput = {
  /** The name of the UserGroup. Minimum length 2. */
  name: Scalars['String'];
  parentID: Scalars['UUID'];
  profileData?: InputMaybe<CreateProfileInput>;
};

export type CreateUserInput = {
  accountUpn?: InputMaybe<Scalars['String']>;
  /** The display name for the entity. */
  displayName: Scalars['String'];
  email: Scalars['String'];
  firstName?: InputMaybe<Scalars['String']>;
  gender?: InputMaybe<Scalars['String']>;
  lastName?: InputMaybe<Scalars['String']>;
  /** A readable identifier, unique within the containing scope. */
  nameID: Scalars['NameID'];
  phone?: InputMaybe<Scalars['String']>;
  profileData?: InputMaybe<CreateProfileInput>;
};

export type Credential = {
  __typename?: 'Credential';
  /** The ID of the entity */
  id: Scalars['UUID'];
  resourceID: Scalars['String'];
  type: AuthorizationCredential;
};

export type CredentialDefinition = {
  __typename?: 'CredentialDefinition';
  /** The resourceID for this CredentialDefinition */
  resourceID: Scalars['String'];
  /** The type for this CredentialDefinition */
  type: Scalars['String'];
};

export type CredentialMetadataOutput = {
  __typename?: 'CredentialMetadataOutput';
  /** A json description of what the claim contains and schema validation definition */
  context: Scalars['String'];
  /** The purpose of the credential */
  description: Scalars['String'];
  /** The display name of the credential */
  name: Scalars['String'];
  /** The schema that the credential will be validated against */
  schema: Scalars['String'];
  /** The credential types that are associated with this credential */
  types: Array<Scalars['String']>;
  /** System recognized unique type for the credential */
  uniqueType: Scalars['String'];
};

export type DeleteActorGroupInput = {
  ID: Scalars['UUID'];
};

export type DeleteActorInput = {
  ID: Scalars['UUID'];
};

export type DeleteApplicationInput = {
  ID: Scalars['UUID'];
};

export type DeleteAspectInput = {
  ID: Scalars['UUID'];
};

export type DeleteAspectTemplateInput = {
  ID: Scalars['UUID'];
};

export type DeleteCalloutInput = {
  ID: Scalars['UUID'];
};

export type DeleteCanvasInput = {
  ID: Scalars['UUID'];
};

export type DeleteCanvasTemplateInput = {
  ID: Scalars['UUID'];
};

export type DeleteChallengeInput = {
  ID: Scalars['UUID'];
};

export type DeleteCollaborationInput = {
  ID: Scalars['UUID'];
};

export type DeleteDiscussionInput = {
  ID: Scalars['UUID'];
};

export type DeleteHubInput = {
  ID: Scalars['UUID_NAMEID'];
};

export type DeleteLifecycleTemplateInput = {
  ID: Scalars['UUID'];
};

export type DeleteOpportunityInput = {
  ID: Scalars['UUID'];
};

export type DeleteOrganizationInput = {
  ID: Scalars['UUID_NAMEID'];
};

export type DeleteProjectInput = {
  ID: Scalars['UUID'];
};

export type DeleteReferenceInput = {
  ID: Scalars['UUID'];
};

export type DeleteRelationInput = {
  ID: Scalars['String'];
};

export type DeleteUserGroupInput = {
  ID: Scalars['UUID'];
};

export type DeleteUserInput = {
  ID: Scalars['UUID_NAMEID_EMAIL'];
};

export type DirectRoom = {
  __typename?: 'DirectRoom';
  /** The display name of the room */
  displayName: Scalars['String'];
  /** The identifier of the direct room */
  id: Scalars['String'];
  /** The messages that have been sent to the Direct Room. */
  messages: Array<Message>;
  /** The recepient userID */
  receiverID?: Maybe<Scalars['String']>;
};

export type Discussion = {
  __typename?: 'Discussion';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The category assigned to this Discussion. */
  category: DiscussionCategory;
  /** The number of comments. */
  commentsCount: Scalars['Float'];
  /** The id of the user that created this discussion */
  createdBy: Scalars['UUID'];
  /** The description of this Discussion. */
  description: Scalars['String'];
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Messages for this Discussion. */
  messages?: Maybe<Array<Message>>;
  /** The timestamp for the creation of this Discussion. */
  timestamp?: Maybe<Scalars['Float']>;
  /** The title of the Discussion. */
  title: Scalars['String'];
};

export enum DiscussionCategory {
  General = 'GENERAL',
  Ideas = 'IDEAS',
  Questions = 'QUESTIONS',
  Sharing = 'SHARING',
}

export type DiscussionRemoveMessageInput = {
  /** The Discussion to remove a message from. */
  discussionID: Scalars['UUID'];
  /** The message id that should be removed */
  messageID: Scalars['MessageID'];
};

export type DiscussionSendMessageInput = {
  /** The Discussion the message is being sent to */
  discussionID: Scalars['UUID'];
  /** The message being sent */
  message: Scalars['String'];
};

export type EcosystemModel = {
  __typename?: 'EcosystemModel';
  /** A list of ActorGroups */
  actorGroups?: Maybe<Array<ActorGroup>>;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** Overview of this ecosystem model. */
  description?: Maybe<Scalars['String']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
};

export type FeatureFlag = {
  __typename?: 'FeatureFlag';
  /** Whether the feature flag is enabled / disabled. */
  enabled: Scalars['Boolean'];
  /** The name of the feature flag */
  name: Scalars['String'];
};

export type FeedbackTemplate = {
  __typename?: 'FeedbackTemplate';
  /** Feedback template name. */
  name: Scalars['String'];
  /** Template questions. */
  questions: Array<QuestionTemplate>;
};

export type GrantAuthorizationCredentialInput = {
  /** The resource to which this credential is tied. */
  resourceID?: InputMaybe<Scalars['UUID']>;
  type: AuthorizationCredential;
  /** The user to whom the credential is being granted. */
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type Groupable = {
  /** The groups contained by this entity. */
  groups?: Maybe<Array<UserGroup>>;
};

export type Hub = {
  __typename?: 'Hub';
  /** The activity within this Hub. */
  activity?: Maybe<Array<Nvp>>;
  /** The Agent representing this Hub. */
  agent?: Maybe<Agent>;
  /** A particular User Application within this Hub. */
  application: Application;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** A particular Challenge, either by its ID or nameID */
  challenge: Challenge;
  /** The challenges for the hub. */
  challenges?: Maybe<Array<Challenge>>;
  /** The collaboration for the Hub. */
  collaboration?: Maybe<Collaboration>;
  /** Get a Community within the Hub. Defaults to the Community for the Hub itself. */
  community?: Maybe<Community>;
  /** The context for the hub. */
  context?: Maybe<Context>;
  /** The display name. */
  displayName: Scalars['String'];
  /** The user group with the specified id anywhere in the hub */
  group: UserGroup;
  /** The User Groups on this Hub */
  groups: Array<UserGroup>;
  /** All groups on this Hub that have the provided tag */
  groupsWithTag: Array<UserGroup>;
  /** The Hub host. */
  host?: Maybe<Organization>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** All opportunities within the hub */
  opportunities?: Maybe<Array<Opportunity>>;
  /** A particular Opportunity, either by its ID or nameID */
  opportunity: Opportunity;
  /** The preferences for this Hub */
  preferences?: Maybe<Array<Preference>>;
  /** A particular Project, identified by the ID */
  project: Project;
  /** All projects within this hub */
  projects: Array<Project>;
  /** The set of tags for the  hub. */
  tagset?: Maybe<Tagset>;
  /** The templates in use by this Hub */
  templates?: Maybe<TemplatesSet>;
};

export type HubApplicationArgs = {
  ID: Scalars['UUID'];
};

export type HubChallengeArgs = {
  ID: Scalars['UUID_NAMEID'];
};

export type HubChallengesArgs = {
  limit?: InputMaybe<Scalars['Float']>;
  shuffle?: InputMaybe<Scalars['Boolean']>;
};

export type HubCommunityArgs = {
  ID?: InputMaybe<Scalars['UUID']>;
};

export type HubGroupArgs = {
  ID: Scalars['UUID'];
};

export type HubGroupsWithTagArgs = {
  tag: Scalars['String'];
};

export type HubOpportunityArgs = {
  ID: Scalars['UUID_NAMEID'];
};

export type HubProjectArgs = {
  ID: Scalars['UUID_NAMEID'];
};

export type HubAspectTemplate = {
  __typename?: 'HubAspectTemplate';
  /** A default description for this Aspect. */
  defaultDescription: Scalars['String'];
  /** The type of the Aspect */
  type: Scalars['String'];
  /** A description for this Aspect type. */
  typeDescription: Scalars['String'];
};

export type HubAuthorizationResetInput = {
  /** The identifier of the Hub whose Authorization Policy should be reset. */
  hubID: Scalars['UUID_NAMEID'];
};

export enum HubPreferenceType {
  AuthorizationAnonymousReadAccess = 'AUTHORIZATION_ANONYMOUS_READ_ACCESS',
  MembershipApplicationsFromAnyone = 'MEMBERSHIP_APPLICATIONS_FROM_ANYONE',
  MembershipJoinHubFromAnyone = 'MEMBERSHIP_JOIN_HUB_FROM_ANYONE',
  MembershipJoinHubFromHostOrganizationMembers = 'MEMBERSHIP_JOIN_HUB_FROM_HOST_ORGANIZATION_MEMBERS',
}

export type Lifecycle = {
  __typename?: 'Lifecycle';
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The machine definition, describing the states, transitions etc for this Lifeycle. */
  machineDef: Scalars['LifecycleDefinition'];
  /** The next events of this Lifecycle. */
  nextEvents?: Maybe<Array<Scalars['String']>>;
  /** The current state of this Lifecycle. */
  state?: Maybe<Scalars['String']>;
  /** Is this lifecycle in a final state (done). */
  stateIsFinal: Scalars['Boolean'];
  /** The Lifecycle template name. */
  templateName?: Maybe<Scalars['String']>;
};

export type LifecycleTemplate = {
  __typename?: 'LifecycleTemplate';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The XState definition for this LifecycleTemplate. */
  definition: Scalars['LifecycleDefinition'];
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The meta information for this Template */
  info: TemplateInfo;
  /** The type for this LifecycleTemplate. */
  type: LifecycleType;
};

export enum LifecycleType {
  Challenge = 'CHALLENGE',
  Opportunity = 'OPPORTUNITY',
}

export type Location = {
  __typename?: 'Location';
  city: Scalars['String'];
  country: Scalars['String'];
  /** The ID of the entity */
  id: Scalars['UUID'];
};

/** A message that was sent either as an Update or as part of a Discussion. */
export type Message = {
  __typename?: 'Message';
  /** The id for the message event. */
  id: Scalars['MessageID'];
  /** The message being sent */
  message: Scalars['Markdown'];
  /** The sender user ID */
  sender: Scalars['UUID'];
  /** The server timestamp in UTC */
  timestamp: Scalars['Float'];
};

export type Metadata = {
  __typename?: 'Metadata';
  /** Metrics about the activity on the platform */
  activity: Array<Nvp>;
  /** Collection of metadata about Alkemio services. */
  services: Array<ServiceMetadata>;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Ensure all community members are registered for communications. */
  adminCommunicationEnsureAccessToCommunications: Scalars['Boolean'];
  /** Remove an orphaned room from messaging platform. */
  adminCommunicationRemoveOrphanedRoom: Scalars['Boolean'];
  /** Allow updating the rule for joining rooms: public or invite. */
  adminCommunicationUpdateRoomsJoinRule: Scalars['Boolean'];
  /** Apply to join the specified Community as a member. */
  applyForCommunityMembership: Application;
  /** Assigns an Organization as a Lead of the specified Community. */
  assignOrganizationAsCommunityLead: Community;
  /** Assigns an Organization as a member of the specified Community. */
  assignOrganizationAsCommunityMember: Community;
  /** Assigns a User as an Challenge Admin. */
  assignUserAsChallengeAdmin: User;
  /** Assigns a User as a lead of the specified Community. */
  assignUserAsCommunityLead: Community;
  /** Assigns a User as a member of the specified Community. */
  assignUserAsCommunityMember: Community;
  /** Assigns a User as a Global Admin. */
  assignUserAsGlobalAdmin: User;
  /** Assigns a User as a Global Community Admin. */
  assignUserAsGlobalCommunityAdmin: User;
  /** Assigns a User as an Hub Admin. */
  assignUserAsHubAdmin: User;
  /** Assigns a User as an Opportunity Admin. */
  assignUserAsOpportunityAdmin: User;
  /** Assigns a User as an Organization Admin. */
  assignUserAsOrganizationAdmin: User;
  /** Assigns a User as an Organization Owner. */
  assignUserAsOrganizationOwner: User;
  /** Assigns a User as a member of the specified User Group. */
  assignUserToGroup: UserGroup;
  /** Assigns a User as a member of the specified Organization. */
  assignUserToOrganization: Organization;
  /** Reset the Authorization Policy on the specified Hub. */
  authorizationPolicyResetOnHub: Hub;
  /** Reset the Authorization Policy on the specified Organization. */
  authorizationPolicyResetOnOrganization: Organization;
  /** Reset the Authorization policy on the specified User. */
  authorizationPolicyResetOnUser: User;
  /** Generate Alkemio user credential offer */
  beginAlkemioUserVerifiedCredentialOfferInteraction: AgentBeginVerifiedCredentialOfferOutput;
  /** Generate community member credential offer */
  beginCommunityMemberVerifiedCredentialOfferInteraction: AgentBeginVerifiedCredentialOfferOutput;
  /** Generate verified credential share request */
  beginVerifiedCredentialRequestInteraction: AgentBeginVerifiedCredentialRequestOutput;
  /** Creates a new Hub by converting an existing Challenge. */
  convertChallengeToHub: Hub;
  /** Creates a new Challenge by converting an existing Opportunity. */
  convertOpportunityToChallenge: Challenge;
  /** Creates a new Actor in the specified ActorGroup. */
  createActor: Actor;
  /** Create a new Actor Group on the EcosystemModel. */
  createActorGroup: ActorGroup;
  /** Create a new Aspect on the Callout. */
  createAspectOnCallout: Aspect;
  /** Creates a new AspectTemplate on the specified TemplatesSet. */
  createAspectTemplate: AspectTemplate;
  /** Create a new Callout on the Collaboration. */
  createCalloutOnCollaboration: Callout;
  /** Create a new Canvas on the Callout. */
  createCanvasOnCallout: Canvas;
  /** Creates a new CanvasTemplate on the specified TemplatesSet. */
  createCanvasTemplate: CanvasTemplate;
  /** Creates a new Challenge within the specified Hub. */
  createChallenge: Challenge;
  /** Creates a new child challenge within the parent Challenge. */
  createChildChallenge: Challenge;
  /** Creates a new Discussion as part of this Communication. */
  createDiscussion: Discussion;
  /** Creates feedback on community context from users having COMMUNITY_CONTEXT_REVIEW privilege */
  createFeedbackOnCommunityContext: Scalars['Boolean'];
  /** Creates a new User Group in the specified Community. */
  createGroupOnCommunity: UserGroup;
  /** Creates a new User Group for the specified Organization. */
  createGroupOnOrganization: UserGroup;
  /** Creates a new Hub. */
  createHub: Hub;
  /** Creates a new LifecycleTemplate on the specified TemplatesSet. */
  createLifecycleTemplate: LifecycleTemplate;
  /** Creates a new Opportunity within the parent Challenge. */
  createOpportunity: Opportunity;
  /** Creates a new Organization on the platform. */
  createOrganization: Organization;
  /** Create a new Project on the Opportunity */
  createProject: Project;
  /** Creates a new Reference on the specified Aspect. */
  createReferenceOnAspect: Reference;
  /** Creates a new Reference on the specified Context. */
  createReferenceOnContext: Reference;
  /** Creates a new Reference on the specified Profile. */
  createReferenceOnProfile: Reference;
  /** Create a new Relation on the Collaboration. */
  createRelationOnCollaboration: Relation;
  /** Creates a new Tagset on the specified Profile */
  createTagsetOnProfile: Tagset;
  /** Creates a new User on the platform. */
  createUser: User;
  /** Creates a new User profile on the platform for a user that has a valid Authentication session. */
  createUserNewRegistration: User;
  /** Deletes the specified Actor. */
  deleteActor: Actor;
  /** Deletes the specified Actor Group, including contained Actors. */
  deleteActorGroup: ActorGroup;
  /** Deletes the specified Aspect. */
  deleteAspect: Aspect;
  /** Deletes the specified AspectTemplate. */
  deleteAspectTemplate: AspectTemplate;
  /** Delete a Callout. */
  deleteCallout: Callout;
  /** Updates the specified Canvas. */
  deleteCanvas: Canvas;
  /** Deletes the specified CanvasTemplate. */
  deleteCanvasTemplate: CanvasTemplate;
  /** Deletes the specified Challenge. */
  deleteChallenge: Challenge;
  /** Delete Collaboration. */
  deleteCollaboration: Collaboration;
  /** Deletes the specified Discussion. */
  deleteDiscussion: Discussion;
  /** Deletes the specified Hub. */
  deleteHub: Hub;
  /** Deletes the specified LifecycleTemplate. */
  deleteLifecycleTemplate: LifecycleTemplate;
  /** Deletes the specified Opportunity. */
  deleteOpportunity: Opportunity;
  /** Deletes the specified Organization. */
  deleteOrganization: Organization;
  /** Deletes the specified Project. */
  deleteProject: Project;
  /** Deletes the specified Reference. */
  deleteReference: Reference;
  /** Deletes the specified Relation. */
  deleteRelation: Relation;
  /** Deletes the specified User. */
  deleteUser: User;
  /** Removes the specified User Application. */
  deleteUserApplication: Application;
  /** Deletes the specified User Group. */
  deleteUserGroup: UserGroup;
  /** Trigger an event on the Application. */
  eventOnApplication: Application;
  /** Trigger an event on the Organization Verification. */
  eventOnCanvasCheckout: CanvasCheckout;
  /** Trigger an event on the Challenge. */
  eventOnChallenge: Challenge;
  /** Trigger an event on the Opportunity. */
  eventOnOpportunity: Opportunity;
  /** Trigger an event on the Organization Verification. */
  eventOnOrganizationVerification: OrganizationVerification;
  /** Trigger an event on the Project. */
  eventOnProject: Project;
  /** Grants an authorization credential to a User. */
  grantCredentialToUser: User;
  /** Join the specified Community as a member, without going through an approval process. */
  joinCommunity: Community;
  /** Sends a message on the specified User`s behalf and returns the room id */
  messageUser: Scalars['String'];
  /** Removes a comment message. */
  removeComment: Scalars['MessageID'];
  /** Removes a message from the specified Discussion. */
  removeMessageFromDiscussion: Scalars['MessageID'];
  /** Removes an Organization as a Lead of the specified Community. */
  removeOrganizationAsCommunityLead: Community;
  /** Removes an Organization as a member of the specified Community. */
  removeOrganizationAsCommunityMember: Community;
  /** Removes an update message. */
  removeUpdate: Scalars['MessageID'];
  /** Removes a User from being an Challenge Admin. */
  removeUserAsChallengeAdmin: User;
  /** Removes a User as a member of the specified Community. */
  removeUserAsCommunityLead: Community;
  /** Removes a User as a member of the specified Community. */
  removeUserAsCommunityMember: Community;
  /** Removes a User from being a Global Admin. */
  removeUserAsGlobalAdmin: User;
  /** Removes a User from being a Global Community Admin. */
  removeUserAsGlobalCommunityAdmin: User;
  /** Removes a User from being an Hub Admin. */
  removeUserAsHubAdmin: User;
  /** Removes a User from being an Opportunity Admin. */
  removeUserAsOpportunityAdmin: User;
  /** Removes a User from being an Organization Admin. */
  removeUserAsOrganizationAdmin: User;
  /** Removes a User from being an Organization Owner. */
  removeUserAsOrganizationOwner: User;
  /** Removes the specified User from specified user group */
  removeUserFromGroup: UserGroup;
  /** Removes a User as a member of the specified Organization. */
  removeUserFromOrganization: Organization;
  /** Removes an authorization credential from a User. */
  revokeCredentialFromUser: User;
  /** Sends an comment message. Returns the id of the new Update message. */
  sendComment: Message;
  /** Sends a message to the specified Discussion.  */
  sendMessageToDiscussion: Message;
  /** Sends an update message. Returns the id of the new Update message. */
  sendUpdate: Message;
  /** Updates the specified Actor. */
  updateActor: Actor;
  /** Updates the specified Aspect. */
  updateAspect: Aspect;
  /** Updates the specified AspectTemplate. */
  updateAspectTemplate: AspectTemplate;
  /** Update a Callout. */
  updateCallout: Callout;
  /** Updates the specified Canvas. */
  updateCanvas: Canvas;
  /** Updates the specified CanvasTemplate. */
  updateCanvasTemplate: CanvasTemplate;
  /** Updates the specified Challenge. */
  updateChallenge: Challenge;
  /** Updates the Innovation Flow on the specified Challenge. */
  updateChallengeInnovationFlow: Challenge;
  /** Updates the specified Discussion. */
  updateDiscussion: Discussion;
  /** Updates the specified EcosystemModel. */
  updateEcosystemModel: EcosystemModel;
  /** Updates the Hub. */
  updateHub: Hub;
  /** Updates the specified LifecycleTemplate. */
  updateLifecycleTemplate: LifecycleTemplate;
  /** Updates the specified Opportunity. */
  updateOpportunity: Opportunity;
  /** Updates the Innovation Flow on the specified Opportunity. */
  updateOpportunityInnovationFlow: Opportunity;
  /** Updates the specified Organization. */
  updateOrganization: Organization;
  /** Updates one of the Preferences on a Challenge */
  updatePreferenceOnChallenge: Preference;
  /** Updates one of the Preferences on a Hub */
  updatePreferenceOnHub: Preference;
  /** Updates one of the Preferences on an Organization */
  updatePreferenceOnOrganization: Preference;
  /** Updates one of the Preferences on a Hub */
  updatePreferenceOnUser: Preference;
  /** Updates the specified Profile. */
  updateProfile: Profile;
  /** Updates the specified Project. */
  updateProject: Project;
  /** Updates the User. */
  updateUser: User;
  /** Updates the specified User Group. */
  updateUserGroup: UserGroup;
  /** Updates the image URI for the specified Visual. */
  updateVisual: Visual;
  /** Uploads and sets an image for the specified Visual. */
  uploadImageOnVisual: Visual;
};

export type MutationAdminCommunicationEnsureAccessToCommunicationsArgs = {
  communicationData: CommunicationAdminEnsureAccessInput;
};

export type MutationAdminCommunicationRemoveOrphanedRoomArgs = {
  orphanedRoomData: CommunicationAdminRemoveOrphanedRoomInput;
};

export type MutationAdminCommunicationUpdateRoomsJoinRuleArgs = {
  changeRoomAccessData: CommunicationAdminUpdateRoomsJoinRuleInput;
};

export type MutationApplyForCommunityMembershipArgs = {
  applicationData: CommunityApplyInput;
};

export type MutationAssignOrganizationAsCommunityLeadArgs = {
  leadershipData: AssignCommunityLeadOrganizationInput;
};

export type MutationAssignOrganizationAsCommunityMemberArgs = {
  membershipData: AssignCommunityMemberOrganizationInput;
};

export type MutationAssignUserAsChallengeAdminArgs = {
  membershipData: AssignChallengeAdminInput;
};

export type MutationAssignUserAsCommunityLeadArgs = {
  leadershipData: AssignCommunityLeadUserInput;
};

export type MutationAssignUserAsCommunityMemberArgs = {
  membershipData: AssignCommunityMemberUserInput;
};

export type MutationAssignUserAsGlobalAdminArgs = {
  membershipData: AssignGlobalAdminInput;
};

export type MutationAssignUserAsGlobalCommunityAdminArgs = {
  membershipData: AssignGlobalCommunityAdminInput;
};

export type MutationAssignUserAsHubAdminArgs = {
  membershipData: AssignHubAdminInput;
};

export type MutationAssignUserAsOpportunityAdminArgs = {
  membershipData: AssignOpportunityAdminInput;
};

export type MutationAssignUserAsOrganizationAdminArgs = {
  membershipData: AssignOrganizationAdminInput;
};

export type MutationAssignUserAsOrganizationOwnerArgs = {
  membershipData: AssignOrganizationOwnerInput;
};

export type MutationAssignUserToGroupArgs = {
  membershipData: AssignUserGroupMemberInput;
};

export type MutationAssignUserToOrganizationArgs = {
  membershipData: AssignOrganizationMemberInput;
};

export type MutationAuthorizationPolicyResetOnHubArgs = {
  authorizationResetData: HubAuthorizationResetInput;
};

export type MutationAuthorizationPolicyResetOnOrganizationArgs = {
  authorizationResetData: OrganizationAuthorizationResetInput;
};

export type MutationAuthorizationPolicyResetOnUserArgs = {
  authorizationResetData: UserAuthorizationResetInput;
};

export type MutationBeginCommunityMemberVerifiedCredentialOfferInteractionArgs = {
  communityID: Scalars['String'];
};

export type MutationBeginVerifiedCredentialRequestInteractionArgs = {
  types: Array<Scalars['String']>;
};

export type MutationConvertChallengeToHubArgs = {
  convertData: ConvertChallengeToHubInput;
};

export type MutationConvertOpportunityToChallengeArgs = {
  convertData: ConvertOpportunityToChallengeInput;
};

export type MutationCreateActorArgs = {
  actorData: CreateActorInput;
};

export type MutationCreateActorGroupArgs = {
  actorGroupData: CreateActorGroupInput;
};

export type MutationCreateAspectOnCalloutArgs = {
  aspectData: CreateAspectOnCalloutInput;
};

export type MutationCreateAspectTemplateArgs = {
  aspectTemplateInput: CreateAspectTemplateOnTemplatesSetInput;
};

export type MutationCreateCalloutOnCollaborationArgs = {
  calloutData: CreateCalloutOnCollaborationInput;
};

export type MutationCreateCanvasOnCalloutArgs = {
  canvasData: CreateCanvasOnCalloutInput;
};

export type MutationCreateCanvasTemplateArgs = {
  canvasTemplateInput: CreateCanvasTemplateOnTemplatesSetInput;
};

export type MutationCreateChallengeArgs = {
  challengeData: CreateChallengeOnHubInput;
};

export type MutationCreateChildChallengeArgs = {
  challengeData: CreateChallengeOnChallengeInput;
};

export type MutationCreateDiscussionArgs = {
  createData: CommunicationCreateDiscussionInput;
};

export type MutationCreateFeedbackOnCommunityContextArgs = {
  feedbackData: CreateFeedbackOnCommunityContextInput;
};

export type MutationCreateGroupOnCommunityArgs = {
  groupData: CreateUserGroupInput;
};

export type MutationCreateGroupOnOrganizationArgs = {
  groupData: CreateUserGroupInput;
};

export type MutationCreateHubArgs = {
  hubData: CreateHubInput;
};

export type MutationCreateLifecycleTemplateArgs = {
  lifecycleTemplateInput: CreateLifecycleTemplateOnTemplatesSetInput;
};

export type MutationCreateOpportunityArgs = {
  opportunityData: CreateOpportunityInput;
};

export type MutationCreateOrganizationArgs = {
  organizationData: CreateOrganizationInput;
};

export type MutationCreateProjectArgs = {
  projectData: CreateProjectInput;
};

export type MutationCreateReferenceOnAspectArgs = {
  referenceData: CreateReferenceOnAspectInput;
};

export type MutationCreateReferenceOnContextArgs = {
  referenceInput: CreateReferenceOnContextInput;
};

export type MutationCreateReferenceOnProfileArgs = {
  referenceInput: CreateReferenceOnProfileInput;
};

export type MutationCreateRelationOnCollaborationArgs = {
  relationData: CreateRelationOnCollaborationInput;
};

export type MutationCreateTagsetOnProfileArgs = {
  tagsetData: CreateTagsetOnProfileInput;
};

export type MutationCreateUserArgs = {
  userData: CreateUserInput;
};

export type MutationDeleteActorArgs = {
  deleteData: DeleteActorInput;
};

export type MutationDeleteActorGroupArgs = {
  deleteData: DeleteActorGroupInput;
};

export type MutationDeleteAspectArgs = {
  deleteData: DeleteAspectInput;
};

export type MutationDeleteAspectTemplateArgs = {
  deleteData: DeleteAspectTemplateInput;
};

export type MutationDeleteCalloutArgs = {
  deleteData: DeleteCalloutInput;
};

export type MutationDeleteCanvasArgs = {
  canvasData: DeleteCanvasInput;
};

export type MutationDeleteCanvasTemplateArgs = {
  deleteData: DeleteCanvasTemplateInput;
};

export type MutationDeleteChallengeArgs = {
  deleteData: DeleteChallengeInput;
};

export type MutationDeleteCollaborationArgs = {
  deleteData: DeleteCollaborationInput;
};

export type MutationDeleteDiscussionArgs = {
  deleteData: DeleteDiscussionInput;
};

export type MutationDeleteHubArgs = {
  deleteData: DeleteHubInput;
};

export type MutationDeleteLifecycleTemplateArgs = {
  deleteData: DeleteLifecycleTemplateInput;
};

export type MutationDeleteOpportunityArgs = {
  deleteData: DeleteOpportunityInput;
};

export type MutationDeleteOrganizationArgs = {
  deleteData: DeleteOrganizationInput;
};

export type MutationDeleteProjectArgs = {
  deleteData: DeleteProjectInput;
};

export type MutationDeleteReferenceArgs = {
  deleteData: DeleteReferenceInput;
};

export type MutationDeleteRelationArgs = {
  deleteData: DeleteRelationInput;
};

export type MutationDeleteUserArgs = {
  deleteData: DeleteUserInput;
};

export type MutationDeleteUserApplicationArgs = {
  deleteData: DeleteApplicationInput;
};

export type MutationDeleteUserGroupArgs = {
  deleteData: DeleteUserGroupInput;
};

export type MutationEventOnApplicationArgs = {
  applicationEventData: ApplicationEventInput;
};

export type MutationEventOnCanvasCheckoutArgs = {
  canvasCheckoutEventData: CanvasCheckoutEventInput;
};

export type MutationEventOnChallengeArgs = {
  challengeEventData: ChallengeEventInput;
};

export type MutationEventOnOpportunityArgs = {
  opportunityEventData: OpportunityEventInput;
};

export type MutationEventOnOrganizationVerificationArgs = {
  organizationVerificationEventData: OrganizationVerificationEventInput;
};

export type MutationEventOnProjectArgs = {
  projectEventData: ProjectEventInput;
};

export type MutationGrantCredentialToUserArgs = {
  grantCredentialData: GrantAuthorizationCredentialInput;
};

export type MutationJoinCommunityArgs = {
  joinCommunityData: CommunityJoinInput;
};

export type MutationMessageUserArgs = {
  messageData: UserSendMessageInput;
};

export type MutationRemoveCommentArgs = {
  messageData: CommentsRemoveMessageInput;
};

export type MutationRemoveMessageFromDiscussionArgs = {
  messageData: DiscussionRemoveMessageInput;
};

export type MutationRemoveOrganizationAsCommunityLeadArgs = {
  leadershipData: RemoveCommunityLeadOrganizationInput;
};

export type MutationRemoveOrganizationAsCommunityMemberArgs = {
  membershipData: RemoveCommunityMemberOrganizationInput;
};

export type MutationRemoveUpdateArgs = {
  messageData: UpdatesRemoveMessageInput;
};

export type MutationRemoveUserAsChallengeAdminArgs = {
  membershipData: RemoveChallengeAdminInput;
};

export type MutationRemoveUserAsCommunityLeadArgs = {
  leadershipData: RemoveCommunityLeadUserInput;
};

export type MutationRemoveUserAsCommunityMemberArgs = {
  membershipData: RemoveCommunityMemberUserInput;
};

export type MutationRemoveUserAsGlobalAdminArgs = {
  membershipData: RemoveGlobalAdminInput;
};

export type MutationRemoveUserAsGlobalCommunityAdminArgs = {
  membershipData: RemoveGlobalCommunityAdminInput;
};

export type MutationRemoveUserAsHubAdminArgs = {
  membershipData: RemoveHubAdminInput;
};

export type MutationRemoveUserAsOpportunityAdminArgs = {
  membershipData: RemoveOpportunityAdminInput;
};

export type MutationRemoveUserAsOrganizationAdminArgs = {
  membershipData: RemoveOrganizationAdminInput;
};

export type MutationRemoveUserAsOrganizationOwnerArgs = {
  membershipData: RemoveOrganizationOwnerInput;
};

export type MutationRemoveUserFromGroupArgs = {
  membershipData: RemoveUserGroupMemberInput;
};

export type MutationRemoveUserFromOrganizationArgs = {
  membershipData: RemoveOrganizationMemberInput;
};

export type MutationRevokeCredentialFromUserArgs = {
  revokeCredentialData: RevokeAuthorizationCredentialInput;
};

export type MutationSendCommentArgs = {
  messageData: CommentsSendMessageInput;
};

export type MutationSendMessageToDiscussionArgs = {
  messageData: DiscussionSendMessageInput;
};

export type MutationSendUpdateArgs = {
  messageData: UpdatesSendMessageInput;
};

export type MutationUpdateActorArgs = {
  actorData: UpdateActorInput;
};

export type MutationUpdateAspectArgs = {
  aspectData: UpdateAspectInput;
};

export type MutationUpdateAspectTemplateArgs = {
  aspectTemplateInput: UpdateAspectTemplateInput;
};

export type MutationUpdateCalloutArgs = {
  calloutData: UpdateCalloutInput;
};

export type MutationUpdateCanvasArgs = {
  canvasData: UpdateCanvasDirectInput;
};

export type MutationUpdateCanvasTemplateArgs = {
  canvasTemplateInput: UpdateCanvasTemplateInput;
};

export type MutationUpdateChallengeArgs = {
  challengeData: UpdateChallengeInput;
};

export type MutationUpdateChallengeInnovationFlowArgs = {
  challengeData: UpdateChallengeInnovationFlowInput;
};

export type MutationUpdateDiscussionArgs = {
  updateData: UpdateDiscussionInput;
};

export type MutationUpdateEcosystemModelArgs = {
  ecosystemModelData: UpdateEcosystemModelInput;
};

export type MutationUpdateHubArgs = {
  hubData: UpdateHubInput;
};

export type MutationUpdateLifecycleTemplateArgs = {
  lifecycleTemplateInput: UpdateLifecycleTemplateInput;
};

export type MutationUpdateOpportunityArgs = {
  opportunityData: UpdateOpportunityInput;
};

export type MutationUpdateOpportunityInnovationFlowArgs = {
  opportunityData: UpdateOpportunityInnovationFlowInput;
};

export type MutationUpdateOrganizationArgs = {
  organizationData: UpdateOrganizationInput;
};

export type MutationUpdatePreferenceOnChallengeArgs = {
  preferenceData: UpdateChallengePreferenceInput;
};

export type MutationUpdatePreferenceOnHubArgs = {
  preferenceData: UpdateHubPreferenceInput;
};

export type MutationUpdatePreferenceOnOrganizationArgs = {
  preferenceData: UpdateOrganizationPreferenceInput;
};

export type MutationUpdatePreferenceOnUserArgs = {
  preferenceData: UpdateUserPreferenceInput;
};

export type MutationUpdateProfileArgs = {
  profileData: UpdateProfileInput;
};

export type MutationUpdateProjectArgs = {
  projectData: UpdateProjectInput;
};

export type MutationUpdateUserArgs = {
  userData: UpdateUserInput;
};

export type MutationUpdateUserGroupArgs = {
  userGroupData: UpdateUserGroupInput;
};

export type MutationUpdateVisualArgs = {
  updateData: UpdateVisualInput;
};

export type MutationUploadImageOnVisualArgs = {
  file: Scalars['Upload'];
  uploadData: VisualUploadImageInput;
};

export type Nvp = {
  __typename?: 'NVP';
  /** The ID of the entity */
  id: Scalars['UUID'];
  name: Scalars['String'];
  value: Scalars['String'];
};

export type Opportunity = Searchable & {
  __typename?: 'Opportunity';
  /** The activity within this Opportunity. */
  activity?: Maybe<Array<Nvp>>;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The parent Challenge of the Opportunity */
  challenge?: Maybe<Challenge>;
  /** The collaboration for the Opportunity. */
  collaboration?: Maybe<Collaboration>;
  /** The community for the Opportunity. */
  community?: Maybe<Community>;
  /** The context for the Opportunity. */
  context?: Maybe<Context>;
  /** The display name. */
  displayName: Scalars['String'];
  id: Scalars['UUID'];
  /** The lifeycle for the Opportunity. */
  lifecycle?: Maybe<Lifecycle>;
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The parent entity (challenge) ID. */
  parentId?: Maybe<Scalars['String']>;
  /** The parent entity name (challenge) ID. */
  parentNameID?: Maybe<Scalars['String']>;
  /** The set of projects within the context of this Opportunity */
  projects?: Maybe<Array<Project>>;
  /** The set of tags for the challenge */
  tagset?: Maybe<Tagset>;
};

export type OpportunityEventInput = {
  ID: Scalars['UUID'];
  eventName: Scalars['String'];
};

export type OpportunityTemplate = {
  __typename?: 'OpportunityTemplate';
  /** Template actor groups. */
  actorGroups?: Maybe<Array<Scalars['String']>>;
  /** Application templates. */
  applications?: Maybe<Array<ApplicationTemplate>>;
  /** Template opportunity name. */
  name: Scalars['String'];
  /** Template relations. */
  relations?: Maybe<Array<Scalars['String']>>;
};

export type Organization = Groupable &
  Searchable & {
    __typename?: 'Organization';
    /** The activity within this Organization. */
    activity?: Maybe<Array<Nvp>>;
    /** The Agent representing this User. */
    agent?: Maybe<Agent>;
    /** The authorization rules for the entity */
    authorization?: Maybe<Authorization>;
    /** Organization contact email */
    contactEmail?: Maybe<Scalars['String']>;
    /** The display name. */
    displayName: Scalars['String'];
    /** Domain name; what is verified, eg. alkem.io */
    domain?: Maybe<Scalars['String']>;
    /** Group defined on this organization. */
    group?: Maybe<UserGroup>;
    /** Groups defined on this organization. */
    groups?: Maybe<Array<UserGroup>>;
    id: Scalars['UUID'];
    /** Legal name - required if hosting an Hub */
    legalEntityName?: Maybe<Scalars['String']>;
    /** All users that are members of this Organization. */
    members?: Maybe<Array<User>>;
    /** A name identifier of the entity, unique within a given scope. */
    nameID: Scalars['NameID'];
    /** The preferences for this Organization */
    preferences: Array<Preference>;
    /** The profile for this organization. */
    profile: Profile;
    verification: OrganizationVerification;
    /** Organization website */
    website?: Maybe<Scalars['String']>;
  };

export type OrganizationGroupArgs = {
  ID: Scalars['UUID'];
};

export type OrganizationAuthorizationResetInput = {
  /** The identifier of the Organization whose Authorization Policy should be reset. */
  organizationID: Scalars['UUID_NAMEID_EMAIL'];
};

export type OrganizationFilterInput = {
  contactEmail?: InputMaybe<Scalars['String']>;
  displayName?: InputMaybe<Scalars['String']>;
  domain?: InputMaybe<Scalars['String']>;
  nameID?: InputMaybe<Scalars['String']>;
  website?: InputMaybe<Scalars['String']>;
};

export enum OrganizationPreferenceType {
  AuthorizationOrganizationMatchDomain = 'AUTHORIZATION_ORGANIZATION_MATCH_DOMAIN',
}

export type OrganizationTemplate = {
  __typename?: 'OrganizationTemplate';
  /** Organization template name. */
  name: Scalars['String'];
  /** Tagset templates. */
  tagsets?: Maybe<Array<TagsetTemplate>>;
};

export type OrganizationVerification = {
  __typename?: 'OrganizationVerification';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  lifecycle: Lifecycle;
  /** Organization verification type */
  status: OrganizationVerificationEnum;
};

export enum OrganizationVerificationEnum {
  NotVerified = 'NOT_VERIFIED',
  VerifiedManualAttestation = 'VERIFIED_MANUAL_ATTESTATION',
}

export type OrganizationVerificationEventInput = {
  eventName: Scalars['String'];
  organizationVerificationID: Scalars['UUID'];
};

export type OryConfig = {
  __typename?: 'OryConfig';
  /** Ory Issuer. */
  issuer: Scalars['String'];
  /** Ory Kratos Public Base URL. Used by all Kratos Public Clients. */
  kratosPublicBaseURL: Scalars['String'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  /** The last cursor of the page result */
  endCursor?: Maybe<Scalars['String']>;
  /** Indicate whether more items exist after the returned ones */
  hasNextPage: Scalars['Boolean'];
  /** Indicate whether more items exist before the returned ones */
  hasPreviousPage: Scalars['Boolean'];
  /** The first cursor of the page result */
  startCursor?: Maybe<Scalars['String']>;
};

export type PaginatedOrganization = {
  __typename?: 'PaginatedOrganization';
  organization: Array<Organization>;
  pageInfo: PageInfo;
};

export type PaginatedUsers = {
  __typename?: 'PaginatedUsers';
  pageInfo: PageInfo;
  users: Array<User>;
};

export type Platform = {
  __typename?: 'Platform';
  /** URL to a page about the platform */
  about: Scalars['String'];
  /** The feature flags for the platform */
  featureFlags: Array<FeatureFlag>;
  /** URL to a form for providing feedback */
  feedback: Scalars['String'];
  /** URL for the link Foundation in the HomePage of the application */
  foundation: Scalars['String'];
  /** URL for the link Impact in the HomePage of the application */
  impact: Scalars['String'];
  /** URL for the link Opensource in the HomePage of the application */
  opensource: Scalars['String'];
  /** URL to the privacy policy for the platform */
  privacy: Scalars['String'];
  /** URL where users can get information about previouse releases */
  releases: Scalars['String'];
  /** URL to the security policy for the platform */
  security: Scalars['String'];
  /** URL where users can get support for the platform */
  support: Scalars['String'];
  /** URL to the terms of usage for the platform */
  terms: Scalars['String'];
};

export type PlatformHubTemplate = {
  __typename?: 'PlatformHubTemplate';
  /** Application templates. */
  applications?: Maybe<Array<ApplicationTemplate>>;
  /** Hub aspect templates. */
  aspects?: Maybe<Array<HubAspectTemplate>>;
  /** Hub template name. */
  name: Scalars['String'];
};

export type Preference = {
  __typename?: 'Preference';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The definition for the Preference */
  definition: PreferenceDefinition;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Value of the preference */
  value: Scalars['String'];
};

export type PreferenceDefinition = {
  __typename?: 'PreferenceDefinition';
  /** Preference description */
  description: Scalars['String'];
  /** The name */
  displayName: Scalars['String'];
  /** The group for the preference within the containing entity type. */
  group: Scalars['String'];
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The type of the Preference, specific to the Entity it is on. */
  type: PreferenceType;
  /** Preference value type */
  valueType: PreferenceValueType;
};

export enum PreferenceType {
  AuthorizationAnonymousReadAccess = 'AUTHORIZATION_ANONYMOUS_READ_ACCESS',
  AuthorizationOrganizationMatchDomain = 'AUTHORIZATION_ORGANIZATION_MATCH_DOMAIN',
  MembershipApplicationsFromAnyone = 'MEMBERSHIP_APPLICATIONS_FROM_ANYONE',
  MembershipApplyChallengeFromHubMembers = 'MEMBERSHIP_APPLY_CHALLENGE_FROM_HUB_MEMBERS',
  MembershipFeedbackOnChallengeContext = 'MEMBERSHIP_FEEDBACK_ON_CHALLENGE_CONTEXT',
  MembershipJoinChallengeFromHubMembers = 'MEMBERSHIP_JOIN_CHALLENGE_FROM_HUB_MEMBERS',
  MembershipJoinHubFromAnyone = 'MEMBERSHIP_JOIN_HUB_FROM_ANYONE',
  MembershipJoinHubFromHostOrganizationMembers = 'MEMBERSHIP_JOIN_HUB_FROM_HOST_ORGANIZATION_MEMBERS',
  NotificationApplicationReceived = 'NOTIFICATION_APPLICATION_RECEIVED',
  NotificationApplicationSubmitted = 'NOTIFICATION_APPLICATION_SUBMITTED',
  NotificationAspectCommentCreated = 'NOTIFICATION_ASPECT_COMMENT_CREATED',
  NotificationAspectCreated = 'NOTIFICATION_ASPECT_CREATED',
  NotificationAspectCreatedAdmin = 'NOTIFICATION_ASPECT_CREATED_ADMIN',
  NotificationCalloutPublished = 'NOTIFICATION_CALLOUT_PUBLISHED',
  NotificationCommunicationDiscussionCreated = 'NOTIFICATION_COMMUNICATION_DISCUSSION_CREATED',
  NotificationCommunicationDiscussionCreatedAdmin = 'NOTIFICATION_COMMUNICATION_DISCUSSION_CREATED_ADMIN',
  NotificationCommunicationDiscussionResponse = 'NOTIFICATION_COMMUNICATION_DISCUSSION_RESPONSE',
  NotificationCommunicationUpdates = 'NOTIFICATION_COMMUNICATION_UPDATES',
  NotificationCommunicationUpdateSentAdmin = 'NOTIFICATION_COMMUNICATION_UPDATE_SENT_ADMIN',
  NotificationCommunityCollaborationInterestAdmin = 'NOTIFICATION_COMMUNITY_COLLABORATION_INTEREST_ADMIN',
  NotificationCommunityCollaborationInterestUser = 'NOTIFICATION_COMMUNITY_COLLABORATION_INTEREST_USER',
  NotificationCommunityNewMember = 'NOTIFICATION_COMMUNITY_NEW_MEMBER',
  NotificationCommunityNewMemberAdmin = 'NOTIFICATION_COMMUNITY_NEW_MEMBER_ADMIN',
  NotificationCommunityReviewSubmitted = 'NOTIFICATION_COMMUNITY_REVIEW_SUBMITTED',
  NotificationCommunityReviewSubmittedAdmin = 'NOTIFICATION_COMMUNITY_REVIEW_SUBMITTED_ADMIN',
  NotificationUserSignUp = 'NOTIFICATION_USER_SIGN_UP',
}

export enum PreferenceValueType {
  Boolean = 'BOOLEAN',
  Float = 'FLOAT',
  Int = 'INT',
  String = 'STRING',
}

export type Profile = {
  __typename?: 'Profile';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The Visual avatar for this Profile. */
  avatar?: Maybe<Visual>;
  /** A short description of the entity associated with this profile. */
  description?: Maybe<Scalars['String']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The location for this Profile. */
  location?: Maybe<Location>;
  /** A list of URLs to relevant information. */
  references?: Maybe<Array<Reference>>;
  /** A list of named tagsets, each of which has a list of tags. */
  tagsets?: Maybe<Array<Tagset>>;
};

export type ProfileCredentialVerified = {
  __typename?: 'ProfileCredentialVerified';
  /** The email */
  userEmail: Scalars['String'];
  /** The vc. */
  vc: Scalars['String'];
};

export type Project = {
  __typename?: 'Project';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  description?: Maybe<Scalars['String']>;
  /** The display name. */
  displayName: Scalars['String'];
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The maturity phase of the project i.e. new, being refined, committed, in-progress, closed etc */
  lifecycle?: Maybe<Lifecycle>;
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The set of tags for the project */
  tagset?: Maybe<Tagset>;
};

export type ProjectEventInput = {
  /** The ID of the entity to which the event is sent */
  ID: Scalars['String'];
  /** The name of the event. Simple text and matching an event in the Lifecycle definition. */
  eventName: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  /** All Users that are members of a given room */
  adminCommunicationMembership: CommunicationAdminMembershipResult;
  /** Usage of the messaging platform that are not tied to the domain model. */
  adminCommunicationOrphanedUsage: CommunicationAdminOrphanedUsageResult;
  /** The authorization policy for the platform */
  authorization: Authorization;
  /** Alkemio configuration. Provides configuration to external services in the Alkemio ecosystem. */
  configuration: Config;
  /** Get supported credential metadata */
  getSupportedVerifiedCredentialMetadata: Array<CredentialMetadataOutput>;
  /** An hub. If no ID is specified then the first Hub is returned. */
  hub: Hub;
  /** The Hubs on this platform */
  hubs: Array<Hub>;
  /** The currently logged in user */
  me: User;
  /** Check if the currently logged in user has a User profile */
  meHasProfile: Scalars['Boolean'];
  /** Alkemio Services Metadata */
  metadata: Metadata;
  /** A particular Organization */
  organization: Organization;
  /** The Organizations on this platform */
  organizations: Array<Organization>;
  /** The Organizations on this platform in paginated format */
  organizationsPaginated: PaginatedOrganization;
  /** The roles that the specified Organization has. */
  rolesOrganization: ContributorRoles;
  /** The roles that that the specified User has. */
  rolesUser: ContributorRoles;
  /** Search the hub for terms supplied */
  search: Array<SearchResultEntry>;
  /** A particular user, identified by the ID or by email */
  user: User;
  /** Privileges assigned to a User (based on held credentials) given an Authorization defnition. */
  userAuthorizationPrivileges: Array<AuthorizationPrivilege>;
  /** The users who have profiles on this platform */
  users: Array<User>;
  /** The users filtered by list of IDs. */
  usersById: Array<User>;
  /** The users who have profiles on this platform */
  usersPaginated: PaginatedUsers;
  /** All Users that hold credentials matching the supplied criteria. */
  usersWithAuthorizationCredential: Array<User>;
};

export type QueryAdminCommunicationMembershipArgs = {
  communicationData: CommunicationAdminMembershipInput;
};

export type QueryHubArgs = {
  ID: Scalars['UUID_NAMEID'];
};

export type QueryOrganizationArgs = {
  ID: Scalars['UUID_NAMEID'];
};

export type QueryOrganizationsArgs = {
  limit?: InputMaybe<Scalars['Float']>;
  shuffle?: InputMaybe<Scalars['Boolean']>;
};

export type QueryOrganizationsPaginatedArgs = {
  after?: InputMaybe<Scalars['UUID']>;
  before?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<OrganizationFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type QueryRolesOrganizationArgs = {
  rolesData: RolesOrganizationInput;
};

export type QueryRolesUserArgs = {
  rolesData: RolesUserInput;
};

export type QuerySearchArgs = {
  searchData: SearchInput;
};

export type QueryUserArgs = {
  ID: Scalars['UUID_NAMEID_EMAIL'];
};

export type QueryUserAuthorizationPrivilegesArgs = {
  userAuthorizationPrivilegesData: UserAuthorizationPrivilegesInput;
};

export type QueryUsersArgs = {
  limit?: InputMaybe<Scalars['Float']>;
  shuffle?: InputMaybe<Scalars['Boolean']>;
};

export type QueryUsersByIdArgs = {
  IDs: Array<Scalars['UUID_NAMEID_EMAIL']>;
};

export type QueryUsersPaginatedArgs = {
  after?: InputMaybe<Scalars['UUID']>;
  before?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<UserFilterInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type QueryUsersWithAuthorizationCredentialArgs = {
  credentialsCriteriaData: UsersWithAuthorizationCredentialInput;
};

export type Question = {
  __typename?: 'Question';
  /** The ID of the entity */
  id: Scalars['UUID'];
  name: Scalars['String'];
  value: Scalars['String'];
};

export type QuestionTemplate = {
  __typename?: 'QuestionTemplate';
  /** Question template. */
  question: Scalars['String'];
  /** Is question required? */
  required: Scalars['Boolean'];
  /** Sorting order for the question. Lower is first. */
  sortOrder?: Maybe<Scalars['Float']>;
};

export type Reference = {
  __typename?: 'Reference';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  description: Scalars['String'];
  /** The ID of the entity */
  id: Scalars['UUID'];
  name: Scalars['String'];
  uri: Scalars['String'];
};

export type Relation = {
  __typename?: 'Relation';
  actorName: Scalars['String'];
  actorRole: Scalars['String'];
  actorType: Scalars['String'];
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  description: Scalars['String'];
  /** The ID of the entity */
  id: Scalars['UUID'];
  type: Scalars['String'];
};

export type RelayPaginatedUser = Searchable & {
  __typename?: 'RelayPaginatedUser';
  /** The unique personal identifier (upn) for the account associated with this user profile */
  accountUpn: Scalars['String'];
  /** The Agent representing this User. */
  agent?: Maybe<Agent>;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The Community rooms this user is a member of */
  communityRooms?: Maybe<Array<CommunicationRoom>>;
  /** The direct rooms this user is a member of */
  directRooms?: Maybe<Array<DirectRoom>>;
  /** The display name. */
  displayName: Scalars['String'];
  /** The email address for this User. */
  email: Scalars['String'];
  firstName: Scalars['String'];
  gender: Scalars['String'];
  id: Scalars['UUID'];
  lastName: Scalars['String'];
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The phone number for this User. */
  phone: Scalars['String'];
  /** The preferences for this user */
  preferences: Array<Preference>;
  /** The Profile for this User. */
  profile?: Maybe<Profile>;
};

export type RelayPaginatedUserEdge = {
  __typename?: 'RelayPaginatedUserEdge';
  node: RelayPaginatedUser;
};

export type RelayPaginatedUserPageInfo = {
  __typename?: 'RelayPaginatedUserPageInfo';
  /** The last cursor of the page result */
  endCursor?: Maybe<Scalars['String']>;
  /** Indicate whether more items exist after the returned ones */
  hasNextPage: Scalars['Boolean'];
  /** Indicate whether more items exist before the returned ones */
  hasPreviousPage: Scalars['Boolean'];
  /** The first cursor of the page result */
  startCursor?: Maybe<Scalars['String']>;
};

export type RemoveChallengeAdminInput = {
  challengeID: Scalars['UUID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type RemoveCommunityLeadOrganizationInput = {
  communityID: Scalars['UUID'];
  organizationID: Scalars['UUID_NAMEID'];
};

export type RemoveCommunityLeadUserInput = {
  communityID: Scalars['UUID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type RemoveCommunityMemberOrganizationInput = {
  communityID: Scalars['UUID'];
  organizationID: Scalars['UUID_NAMEID'];
};

export type RemoveCommunityMemberUserInput = {
  communityID: Scalars['UUID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type RemoveGlobalAdminInput = {
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type RemoveGlobalCommunityAdminInput = {
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type RemoveHubAdminInput = {
  hubID: Scalars['UUID_NAMEID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type RemoveOpportunityAdminInput = {
  opportunityID: Scalars['UUID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type RemoveOrganizationAdminInput = {
  organizationID: Scalars['UUID_NAMEID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type RemoveOrganizationMemberInput = {
  organizationID: Scalars['UUID_NAMEID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type RemoveOrganizationOwnerInput = {
  organizationID: Scalars['UUID_NAMEID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type RemoveUserGroupMemberInput = {
  groupID: Scalars['UUID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type RevokeAuthorizationCredentialInput = {
  /** The resource to which access is being removed. */
  resourceID: Scalars['String'];
  type: AuthorizationCredential;
  /** The user from whom the credential is being removed. */
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type RolesOrganizationInput = {
  /** The ID of the organization to retrieve the roles of. */
  organizationID: Scalars['UUID_NAMEID'];
};

export type RolesResult = {
  __typename?: 'RolesResult';
  /** Display name of the entity */
  displayName: Scalars['String'];
  /** A unique identifier for this membership result. */
  id: Scalars['String'];
  /** Name Identifier of the entity */
  nameID: Scalars['NameID'];
  /** The roles held by the contributor */
  roles: Array<Scalars['String']>;
};

export type RolesResultCommunity = {
  __typename?: 'RolesResultCommunity';
  /** Display name of the entity */
  displayName: Scalars['String'];
  /** A unique identifier for this membership result. */
  id: Scalars['String'];
  /** Name Identifier of the entity */
  nameID: Scalars['NameID'];
  /** The roles held by the contributor */
  roles: Array<Scalars['String']>;
  /** Details of the Groups in the Organizations the user is a member of */
  userGroups: Array<RolesResult>;
};

export type RolesResultHub = {
  __typename?: 'RolesResultHub';
  /** Details of the Challenges the user is a member of */
  challenges: Array<RolesResultCommunity>;
  /** Display name of the entity */
  displayName: Scalars['String'];
  /** The Hub ID */
  hubID: Scalars['String'];
  /** A unique identifier for this membership result. */
  id: Scalars['String'];
  /** Name Identifier of the entity */
  nameID: Scalars['NameID'];
  /** Details of the Opportunities the Contributor is a member of */
  opportunities: Array<RolesResultCommunity>;
  /** The roles held by the contributor */
  roles: Array<Scalars['String']>;
  /** Details of the Groups in the Organizations the user is a member of */
  userGroups: Array<RolesResult>;
};

export type RolesResultOrganization = {
  __typename?: 'RolesResultOrganization';
  /** Display name of the entity */
  displayName: Scalars['String'];
  /** A unique identifier for this membership result. */
  id: Scalars['String'];
  /** Name Identifier of the entity */
  nameID: Scalars['NameID'];
  /** The Organization ID. */
  organizationID: Scalars['String'];
  /** The roles held by the contributor */
  roles: Array<Scalars['String']>;
  /** Details of the Groups in the Organizations the user is a member of */
  userGroups: Array<RolesResult>;
};

export type RolesUserInput = {
  /** The ID of the user to retrieve the roles of. */
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type SearchInput = {
  /** Restrict the search to only the specified challenges. Default is all Challenges. */
  challengesFilter?: InputMaybe<Array<Scalars['Float']>>;
  /** Expand the search to includes Tagsets with the provided names. Max 2. */
  tagsetNames?: InputMaybe<Array<Scalars['String']>>;
  /** The terms to be searched for within this Hub. Max 5. */
  terms: Array<Scalars['String']>;
  /** Restrict the search to only the specified entity types. Values allowed: user, group, organization, Default is all. */
  typesFilter?: InputMaybe<Array<Scalars['String']>>;
};

export type SearchResultEntry = {
  __typename?: 'SearchResultEntry';
  /** Each search result contains either a User, UserGroup or Organization */
  result?: Maybe<Searchable>;
  /** The score for this search result; more matches means a higher score. */
  score?: Maybe<Scalars['Float']>;
  /** The terms that were matched for this result */
  terms?: Maybe<Array<Scalars['String']>>;
};

export type Searchable = {
  id: Scalars['UUID'];
};

export type Sentry = {
  __typename?: 'Sentry';
  /** Flag indicating if the client should use Sentry for monitoring. */
  enabled: Scalars['Boolean'];
  /** URL to the Sentry endpoint. */
  endpoint: Scalars['String'];
  /** Flag indicating if PII should be submitted on Sentry events. */
  submitPII: Scalars['Boolean'];
};

export type ServiceMetadata = {
  __typename?: 'ServiceMetadata';
  /** Service name e.g. CT Server */
  name?: Maybe<Scalars['String']>;
  /** Version in the format {major.minor.patch} - using SemVer. */
  version?: Maybe<Scalars['String']>;
};

export type Subscription = {
  __typename?: 'Subscription';
  /** Receive new comment on Aspect */
  aspectCommentsMessageReceived: AspectCommentsMessageReceived;
  /** Receive new Update messages on Communities the currently authenticated User is a member of. */
  calloutAspectCreated: CalloutAspectCreated;
  /** Receive updated content of a canvas */
  canvasContentUpdated: CanvasContentUpdated;
  /** Receive new Discussion messages */
  communicationDiscussionMessageReceived: CommunicationDiscussionMessageReceived;
  /** Receive updates on Discussions */
  communicationDiscussionUpdated: Discussion;
  /** Receive new Update messages on Communities the currently authenticated User is a member of. */
  communicationUpdateMessageReceived: CommunicationUpdateMessageReceived;
  /** Received on verified credentials change */
  profileVerifiedCredential: ProfileCredentialVerified;
};

export type SubscriptionAspectCommentsMessageReceivedArgs = {
  aspectID: Scalars['UUID'];
};

export type SubscriptionCalloutAspectCreatedArgs = {
  calloutID: Scalars['UUID'];
};

export type SubscriptionCanvasContentUpdatedArgs = {
  canvasIDs?: InputMaybe<Array<Scalars['UUID']>>;
};

export type SubscriptionCommunicationDiscussionMessageReceivedArgs = {
  discussionID: Scalars['UUID'];
};

export type SubscriptionCommunicationDiscussionUpdatedArgs = {
  communicationID: Scalars['UUID'];
};

export type SubscriptionCommunicationUpdateMessageReceivedArgs = {
  updatesIDs?: InputMaybe<Array<Scalars['UUID']>>;
};

export type Tagset = {
  __typename?: 'Tagset';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  name: Scalars['String'];
  tags: Array<Scalars['String']>;
};

export type TagsetTemplate = {
  __typename?: 'TagsetTemplate';
  /** Tagset template name. */
  name: Scalars['String'];
  /** Tagset placeholder */
  placeholder?: Maybe<Scalars['String']>;
};

export type Template = {
  __typename?: 'Template';
  /** Challenge templates. */
  challenges: Array<ChallengeTemplate>;
  /** Template description. */
  description: Scalars['String'];
  /** Hub templates. */
  hubs: Array<PlatformHubTemplate>;
  /** Template name. */
  name: Scalars['String'];
  /** Opportunity templates. */
  opportunities: Array<OpportunityTemplate>;
  /** Challenge templates. */
  organizations: Array<OrganizationTemplate>;
  /** User templates. */
  users: Array<UserTemplate>;
};

export type TemplateInfo = {
  __typename?: 'TemplateInfo';
  /** The description for this Template. */
  description: Scalars['Markdown'];
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The tags set on this Template. */
  tagset?: Maybe<Tagset>;
  /** The title for this Template. */
  title: Scalars['String'];
  /** The image associated with this Template`. */
  visual?: Maybe<Visual>;
};

export type TemplatesSet = {
  __typename?: 'TemplatesSet';
  /** A single AspectTemplate */
  aspectTemplate?: Maybe<AspectTemplate>;
  /** The AspectTemplates in this TemplatesSet. */
  aspectTemplates: Array<AspectTemplate>;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** A single AspectTemplate */
  canvasTemplate?: Maybe<CanvasTemplate>;
  /** The CanvasTemplates in this TemplatesSet. */
  canvasTemplates: Array<CanvasTemplate>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** A single AspectTemplate */
  lifecycleTemplate?: Maybe<LifecycleTemplate>;
  /** The LifecycleTemplates in this TemplatesSet. */
  lifecycleTemplates: Array<LifecycleTemplate>;
};

export type TemplatesSetAspectTemplateArgs = {
  ID: Scalars['UUID'];
};

export type TemplatesSetCanvasTemplateArgs = {
  ID: Scalars['UUID'];
};

export type TemplatesSetLifecycleTemplateArgs = {
  ID: Scalars['UUID'];
};

export type UpdateActorInput = {
  ID: Scalars['UUID'];
  description?: InputMaybe<Scalars['String']>;
  impact?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  value?: InputMaybe<Scalars['String']>;
};

export type UpdateAspectInput = {
  ID: Scalars['UUID'];
  description?: InputMaybe<Scalars['Markdown']>;
  /** The display name for this entity. */
  displayName?: InputMaybe<Scalars['String']>;
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** Update the set of References for the Aspect. */
  references?: InputMaybe<Array<UpdateReferenceInput>>;
  /** Update the tags on the Aspect. */
  tags?: InputMaybe<Array<Scalars['String']>>;
  type?: InputMaybe<Scalars['String']>;
};

export type UpdateAspectTemplateInput = {
  ID: Scalars['UUID'];
  /** The default description to be pre-filled when users create Aspects based on this template. */
  defaultDescription?: InputMaybe<Scalars['Markdown']>;
  /** The meta information for this Template. */
  info?: InputMaybe<UpdateTemplateInfoInput>;
  /** The type of Aspects created from this Template. */
  type?: InputMaybe<Scalars['String']>;
};

export type UpdateCalloutInput = {
  ID: Scalars['UUID'];
  /** Callout description. */
  description?: InputMaybe<Scalars['Markdown']>;
  /** The display name for this entity. */
  displayName?: InputMaybe<Scalars['String']>;
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** State of the callout. */
  state?: InputMaybe<CalloutState>;
  /** Callout type. */
  type?: InputMaybe<CalloutType>;
  /** Visibility of the Callout. */
  visibility?: InputMaybe<CalloutVisibility>;
};

export type UpdateCanvasDirectInput = {
  ID: Scalars['UUID'];
  /** The display name for this entity. */
  displayName?: InputMaybe<Scalars['String']>;
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
  value?: InputMaybe<Scalars['String']>;
};

export type UpdateCanvasTemplateInput = {
  ID: Scalars['UUID'];
  /** The meta information for this Template. */
  info?: InputMaybe<UpdateTemplateInfoInput>;
  value?: InputMaybe<Scalars['JSON']>;
};

export type UpdateChallengeInnovationFlowInput = {
  /** ID of the Challenge */
  challengeID: Scalars['UUID'];
  /** The Innovation Flow template to use for the Challenge. */
  innovationFlowTemplateID: Scalars['UUID'];
};

export type UpdateChallengeInput = {
  ID: Scalars['UUID'];
  /** Update the contained Context entity. */
  context?: InputMaybe<UpdateContextInput>;
  /** The display name for this entity. */
  displayName?: InputMaybe<Scalars['String']>;
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** Update the tags on the Tagset. */
  tags?: InputMaybe<Array<Scalars['String']>>;
};

export type UpdateChallengePreferenceInput = {
  /** ID of the Challenge */
  challengeID: Scalars['UUID'];
  /** Type of the challenge preference */
  type: ChallengePreferenceType;
  value: Scalars['String'];
};

export type UpdateContextInput = {
  background?: InputMaybe<Scalars['Markdown']>;
  impact?: InputMaybe<Scalars['Markdown']>;
  location?: InputMaybe<UpdateLocationInput>;
  /** Update the set of References for the Context. */
  references?: InputMaybe<Array<UpdateReferenceInput>>;
  tagline?: InputMaybe<Scalars['String']>;
  vision?: InputMaybe<Scalars['Markdown']>;
  who?: InputMaybe<Scalars['Markdown']>;
};

export type UpdateDiscussionInput = {
  ID: Scalars['UUID'];
  /** The category for the Discussion */
  category?: InputMaybe<DiscussionCategory>;
  /** The description for the Discussion */
  description?: InputMaybe<Scalars['String']>;
  title?: InputMaybe<Scalars['String']>;
};

export type UpdateEcosystemModelInput = {
  ID: Scalars['UUID'];
  description?: InputMaybe<Scalars['String']>;
};

export type UpdateHubInput = {
  /** The ID or NameID of the Hub. */
  ID: Scalars['UUID_NAMEID'];
  /** Update the contained Context entity. */
  context?: InputMaybe<UpdateContextInput>;
  /** The display name for this entity. */
  displayName?: InputMaybe<Scalars['String']>;
  /** Update the host Organization for the Hub. */
  hostID?: InputMaybe<Scalars['UUID_NAMEID']>;
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** Update the tags on the Tagset. */
  tags?: InputMaybe<Array<Scalars['String']>>;
};

export type UpdateHubPreferenceInput = {
  /** ID of the Hub */
  hubID: Scalars['UUID_NAMEID'];
  /** Type of the user preference */
  type: HubPreferenceType;
  value: Scalars['String'];
};

export type UpdateLifecycleTemplateInput = {
  ID: Scalars['UUID'];
  /** The XState definition for this LifecycleTemplate. */
  definition?: InputMaybe<Scalars['LifecycleDefinition']>;
  /** The meta information for this Template. */
  info?: InputMaybe<UpdateTemplateInfoInput>;
};

export type UpdateLocationInput = {
  city?: InputMaybe<Scalars['String']>;
  country?: InputMaybe<Scalars['String']>;
};

export type UpdateOpportunityInnovationFlowInput = {
  /** The Innovation Flow template to use for the Opportunity. */
  innovationFlowTemplateID: Scalars['UUID'];
  /** ID of the Opportunity */
  opportunityID: Scalars['UUID'];
};

export type UpdateOpportunityInput = {
  ID: Scalars['UUID'];
  /** Update the contained Context entity. */
  context?: InputMaybe<UpdateContextInput>;
  /** The display name for this entity. */
  displayName?: InputMaybe<Scalars['String']>;
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** Update the tags on the Tagset. */
  tags?: InputMaybe<Array<Scalars['String']>>;
};

export type UpdateOrganizationInput = {
  /** The ID or NameID of the Organization to update. */
  ID: Scalars['UUID_NAMEID'];
  contactEmail?: InputMaybe<Scalars['String']>;
  /** The display name for this entity. */
  displayName?: InputMaybe<Scalars['String']>;
  domain?: InputMaybe<Scalars['String']>;
  legalEntityName?: InputMaybe<Scalars['String']>;
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
  profileData?: InputMaybe<UpdateProfileInput>;
  website?: InputMaybe<Scalars['String']>;
};

export type UpdateOrganizationPreferenceInput = {
  /** ID of the Organization */
  organizationID: Scalars['UUID_NAMEID'];
  /** Type of the organization preference */
  type: OrganizationPreferenceType;
  value: Scalars['String'];
};

export type UpdateProfileInput = {
  ID: Scalars['UUID'];
  description?: InputMaybe<Scalars['String']>;
  location?: InputMaybe<UpdateLocationInput>;
  references?: InputMaybe<Array<UpdateReferenceInput>>;
  tagsets?: InputMaybe<Array<UpdateTagsetInput>>;
};

export type UpdateProjectInput = {
  ID: Scalars['UUID'];
  description?: InputMaybe<Scalars['String']>;
  /** The display name for this entity. */
  displayName?: InputMaybe<Scalars['String']>;
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
};

export type UpdateReferenceInput = {
  ID: Scalars['UUID'];
  description?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  uri?: InputMaybe<Scalars['String']>;
};

export type UpdateTagsetInput = {
  ID: Scalars['UUID'];
  name?: InputMaybe<Scalars['String']>;
  tags?: InputMaybe<Array<Scalars['String']>>;
};

export type UpdateTemplateInfoInput = {
  description?: InputMaybe<Scalars['Markdown']>;
  tags?: InputMaybe<Array<Scalars['String']>>;
  title?: InputMaybe<Scalars['String']>;
};

export type UpdateUserGroupInput = {
  ID: Scalars['UUID'];
  name?: InputMaybe<Scalars['String']>;
  profileData?: InputMaybe<UpdateProfileInput>;
};

export type UpdateUserInput = {
  ID: Scalars['UUID_NAMEID_EMAIL'];
  accountUpn?: InputMaybe<Scalars['String']>;
  /** The display name for this entity. */
  displayName?: InputMaybe<Scalars['String']>;
  firstName?: InputMaybe<Scalars['String']>;
  gender?: InputMaybe<Scalars['String']>;
  lastName?: InputMaybe<Scalars['String']>;
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
  phone?: InputMaybe<Scalars['String']>;
  profileData?: InputMaybe<UpdateProfileInput>;
  /** Set this user profile as being used as a service account or not. */
  serviceProfile?: InputMaybe<Scalars['Boolean']>;
};

export type UpdateUserPreferenceInput = {
  /** Type of the user preference */
  type: UserPreferenceType;
  /** ID of the User */
  userID: Scalars['UUID_NAMEID_EMAIL'];
  value: Scalars['String'];
};

export type UpdateVisualInput = {
  uri: Scalars['String'];
  visualID: Scalars['String'];
};

export type Updates = {
  __typename?: 'Updates';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Messages in this Updates. */
  messages?: Maybe<Array<Message>>;
};

export type UpdatesRemoveMessageInput = {
  /** The message id that should be removed */
  messageID: Scalars['String'];
  /** The Updates the message is being removed from. */
  updatesID: Scalars['UUID'];
};

export type UpdatesSendMessageInput = {
  /** The message being sent */
  message: Scalars['String'];
  /** The Updates the message is being sent to */
  updatesID: Scalars['UUID'];
};

export type User = Searchable & {
  __typename?: 'User';
  /** The unique personal identifier (upn) for the account associated with this user profile */
  accountUpn: Scalars['String'];
  /** The Agent representing this User. */
  agent?: Maybe<Agent>;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The Community rooms this user is a member of */
  communityRooms?: Maybe<Array<CommunicationRoom>>;
  /** The direct rooms this user is a member of */
  directRooms?: Maybe<Array<DirectRoom>>;
  /** The display name. */
  displayName: Scalars['String'];
  /** The email address for this User. */
  email: Scalars['String'];
  firstName: Scalars['String'];
  gender: Scalars['String'];
  id: Scalars['UUID'];
  lastName: Scalars['String'];
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The phone number for this User. */
  phone: Scalars['String'];
  /** The preferences for this user */
  preferences: Array<Preference>;
  /** The Profile for this User. */
  profile?: Maybe<Profile>;
};

export type UserAuthorizationPrivilegesInput = {
  /** The authorization definition to evaluate the user credentials against. */
  authorizationID: Scalars['UUID'];
  /** The user to evaluate privileges granted based on held credentials. */
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type UserAuthorizationResetInput = {
  /** The identifier of the User whose Authorization Policy should be reset. */
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type UserFilterInput = {
  email?: InputMaybe<Scalars['String']>;
  firstName?: InputMaybe<Scalars['String']>;
  lastName?: InputMaybe<Scalars['String']>;
};

export type UserGroup = Searchable & {
  __typename?: 'UserGroup';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  id: Scalars['UUID'];
  /** The Users that are members of this User Group. */
  members?: Maybe<Array<User>>;
  name: Scalars['String'];
  /** Containing entity for this UserGroup. */
  parent?: Maybe<Groupable>;
  /** The profile for the user group */
  profile?: Maybe<Profile>;
};

export enum UserPreferenceType {
  NotificationApplicationReceived = 'NOTIFICATION_APPLICATION_RECEIVED',
  NotificationApplicationSubmitted = 'NOTIFICATION_APPLICATION_SUBMITTED',
  NotificationAspectCommentCreated = 'NOTIFICATION_ASPECT_COMMENT_CREATED',
  NotificationAspectCreated = 'NOTIFICATION_ASPECT_CREATED',
  NotificationAspectCreatedAdmin = 'NOTIFICATION_ASPECT_CREATED_ADMIN',
  NotificationCalloutPublished = 'NOTIFICATION_CALLOUT_PUBLISHED',
  NotificationCommunicationDiscussionCreated = 'NOTIFICATION_COMMUNICATION_DISCUSSION_CREATED',
  NotificationCommunicationDiscussionCreatedAdmin = 'NOTIFICATION_COMMUNICATION_DISCUSSION_CREATED_ADMIN',
  NotificationCommunicationDiscussionResponse = 'NOTIFICATION_COMMUNICATION_DISCUSSION_RESPONSE',
  NotificationCommunicationUpdates = 'NOTIFICATION_COMMUNICATION_UPDATES',
  NotificationCommunicationUpdateSentAdmin = 'NOTIFICATION_COMMUNICATION_UPDATE_SENT_ADMIN',
  NotificationCommunityCollaborationInterestAdmin = 'NOTIFICATION_COMMUNITY_COLLABORATION_INTEREST_ADMIN',
  NotificationCommunityCollaborationInterestUser = 'NOTIFICATION_COMMUNITY_COLLABORATION_INTEREST_USER',
  NotificationCommunityNewMember = 'NOTIFICATION_COMMUNITY_NEW_MEMBER',
  NotificationCommunityNewMemberAdmin = 'NOTIFICATION_COMMUNITY_NEW_MEMBER_ADMIN',
  NotificationCommunityReviewSubmitted = 'NOTIFICATION_COMMUNITY_REVIEW_SUBMITTED',
  NotificationCommunityReviewSubmittedAdmin = 'NOTIFICATION_COMMUNITY_REVIEW_SUBMITTED_ADMIN',
  NotificationUserSignUp = 'NOTIFICATION_USER_SIGN_UP',
}

export type UserSendMessageInput = {
  /** The message being sent */
  message: Scalars['String'];
  /** The user a message is being sent to */
  receivingUserID: Scalars['String'];
};

export type UserTemplate = {
  __typename?: 'UserTemplate';
  /** User template name. */
  name: Scalars['String'];
  /** Tagset templates. */
  tagsets?: Maybe<Array<TagsetTemplate>>;
};

export type UsersWithAuthorizationCredentialInput = {
  /** The resource to which a credential needs to be bound. */
  resourceID?: InputMaybe<Scalars['UUID']>;
  /** The type of credential. */
  type: AuthorizationCredential;
};

export type VerifiedCredential = {
  __typename?: 'VerifiedCredential';
  /** The time at which the credential is no longer valid */
  claims: Array<VerifiedCredentialClaim>;
  /** JSON for the context in the credential */
  context: Scalars['JSON'];
  /** The time at which the credential is no longer valid */
  expires: Scalars['String'];
  /** The time at which the credential was issued */
  issued: Scalars['String'];
  /** The party issuing the VC */
  issuer: Scalars['String'];
  /** The name of the VC */
  name: Scalars['String'];
  /** The type of VC */
  type: Scalars['String'];
};

export type VerifiedCredentialClaim = {
  __typename?: 'VerifiedCredentialClaim';
  /** The name of the claim */
  name: Scalars['JSON'];
  /** The value for the claim */
  value: Scalars['JSON'];
};

export type Visual = {
  __typename?: 'Visual';
  allowedTypes: Array<Scalars['String']>;
  /** Aspect ratio width / height. */
  aspectRatio: Scalars['Float'];
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Maximum height resolution. */
  maxHeight: Scalars['Float'];
  /** Maximum width resolution. */
  maxWidth: Scalars['Float'];
  /** Minimum height resolution. */
  minHeight: Scalars['Float'];
  /** Minimum width resolution. */
  minWidth: Scalars['Float'];
  name: Scalars['String'];
  uri: Scalars['String'];
};

export type VisualUploadImageInput = {
  visualID: Scalars['String'];
};

export type ProjectDetailsFragment = {
  __typename?: 'Project';
  id: string;
  nameID: string;
  displayName: string;
  description?: string | undefined;
  lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined } | undefined;
  tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
};

export type ReferenceDetailsFragment = {
  __typename?: 'Reference';
  id: string;
  name: string;
  uri: string;
  description: string;
};

export type VisualFullFragment = {
  __typename?: 'Visual';
  id: string;
  uri: string;
  name: string;
  allowedTypes: Array<string>;
  aspectRatio: number;
  maxHeight: number;
  maxWidth: number;
  minHeight: number;
  minWidth: number;
};

export type VisualUriFragment = { __typename?: 'Visual'; id: string; uri: string; name: string };

export type CreateActorMutationVariables = Exact<{
  input: CreateActorInput;
}>;

export type CreateActorMutation = {
  __typename?: 'Mutation';
  createActor: { __typename?: 'Actor'; id: string; name: string };
};

export type CreateActorGroupMutationVariables = Exact<{
  input: CreateActorGroupInput;
}>;

export type CreateActorGroupMutation = {
  __typename?: 'Mutation';
  createActorGroup: { __typename?: 'ActorGroup'; id: string; name: string };
};

export type CreateProjectMutationVariables = Exact<{
  input: CreateProjectInput;
}>;

export type CreateProjectMutation = {
  __typename?: 'Mutation';
  createProject: {
    __typename?: 'Project';
    id: string;
    nameID: string;
    displayName: string;
    description?: string | undefined;
    lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined } | undefined;
    tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
  };
};

export type CreateReferenceOnProfileMutationVariables = Exact<{
  input: CreateReferenceOnProfileInput;
}>;

export type CreateReferenceOnProfileMutation = {
  __typename?: 'Mutation';
  createReferenceOnProfile: { __typename?: 'Reference'; id: string; name: string; description: string; uri: string };
};

export type CreateRelationMutationVariables = Exact<{
  input: CreateRelationOnCollaborationInput;
}>;

export type CreateRelationMutation = {
  __typename?: 'Mutation';
  createRelationOnCollaboration: { __typename?: 'Relation'; id: string };
};

export type CreateTagsetOnProfileMutationVariables = Exact<{
  input: CreateTagsetOnProfileInput;
}>;

export type CreateTagsetOnProfileMutation = {
  __typename?: 'Mutation';
  createTagsetOnProfile: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> };
};

export type DeleteActorMutationVariables = Exact<{
  input: DeleteActorInput;
}>;

export type DeleteActorMutation = { __typename?: 'Mutation'; deleteActor: { __typename?: 'Actor'; id: string } };

export type DeleteDiscussionMutationVariables = Exact<{
  deleteData: DeleteDiscussionInput;
}>;

export type DeleteDiscussionMutation = {
  __typename?: 'Mutation';
  deleteDiscussion: { __typename?: 'Discussion'; id: string; title: string };
};

export type DeleteReferenceMutationVariables = Exact<{
  input: DeleteReferenceInput;
}>;

export type DeleteReferenceMutation = {
  __typename?: 'Mutation';
  deleteReference: { __typename?: 'Reference'; id: string };
};

export type DeleteRelationMutationVariables = Exact<{
  input: DeleteRelationInput;
}>;

export type DeleteRelationMutation = {
  __typename?: 'Mutation';
  deleteRelation: { __typename?: 'Relation'; id: string };
};

export type RemoveMessageFromDiscussionMutationVariables = Exact<{
  messageData: DiscussionRemoveMessageInput;
}>;

export type RemoveMessageFromDiscussionMutation = { __typename?: 'Mutation'; removeMessageFromDiscussion: string };

export type UpdateActorMutationVariables = Exact<{
  input: UpdateActorInput;
}>;

export type UpdateActorMutation = {
  __typename?: 'Mutation';
  updateActor: {
    __typename?: 'Actor';
    id: string;
    name: string;
    description?: string | undefined;
    impact?: string | undefined;
    value?: string | undefined;
  };
};

export type UploadVisualMutationVariables = Exact<{
  file: Scalars['Upload'];
  uploadData: VisualUploadImageInput;
}>;

export type UploadVisualMutation = {
  __typename?: 'Mutation';
  uploadImageOnVisual: { __typename?: 'Visual'; id: string; uri: string };
};

export type GlobalActivityQueryVariables = Exact<{ [key: string]: never }>;

export type GlobalActivityQuery = {
  __typename?: 'Query';
  metadata: { __typename?: 'Metadata'; activity: Array<{ __typename?: 'NVP'; name: string; value: string }> };
};

export type GroupMembersQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  groupId: Scalars['UUID'];
}>;

export type GroupMembersQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    group: {
      __typename?: 'UserGroup';
      id: string;
      name: string;
      members?:
        | Array<{
            __typename?: 'User';
            id: string;
            displayName: string;
            firstName: string;
            lastName: string;
            email: string;
          }>
        | undefined;
    };
  };
};

export type MeQueryVariables = Exact<{ [key: string]: never }>;

export type MeQuery = {
  __typename?: 'Query';
  me: {
    __typename?: 'User';
    id: string;
    nameID: string;
    displayName: string;
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    phone: string;
    accountUpn: string;
    agent?:
      | {
          __typename?: 'Agent';
          id: string;
          did?: string | undefined;
          credentials?:
            | Array<{ __typename?: 'Credential'; type: AuthorizationCredential; resourceID: string; id: string }>
            | undefined;
        }
      | undefined;
    profile?:
      | {
          __typename?: 'Profile';
          id: string;
          description?: string | undefined;
          location?: { __typename?: 'Location'; country: string; city: string } | undefined;
          avatar?:
            | {
                __typename?: 'Visual';
                id: string;
                uri: string;
                name: string;
                allowedTypes: Array<string>;
                aspectRatio: number;
                maxHeight: number;
                maxWidth: number;
                minHeight: number;
                minWidth: number;
              }
            | undefined;
          references?:
            | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
            | undefined;
          tagsets?: Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }> | undefined;
        }
      | undefined;
  };
};

export type MeHasProfileQueryVariables = Exact<{ [key: string]: never }>;

export type MeHasProfileQuery = { __typename?: 'Query'; meHasProfile: boolean };

export type ProjectProfileQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  projectId: Scalars['UUID_NAMEID'];
}>;

export type ProjectProfileQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    project: {
      __typename?: 'Project';
      id: string;
      nameID: string;
      displayName: string;
      description?: string | undefined;
      lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined } | undefined;
      tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
    };
  };
};

export type ProjectsQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type ProjectsQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    projects: Array<{
      __typename?: 'Project';
      id: string;
      nameID: string;
      displayName: string;
      description?: string | undefined;
      lifecycle?: { __typename?: 'Lifecycle'; state?: string | undefined } | undefined;
    }>;
  };
};

export type ProjectsChainHistoryQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type ProjectsChainHistoryQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    challenges?:
      | Array<{
          __typename?: 'Challenge';
          displayName: string;
          nameID: string;
          opportunities?:
            | Array<{
                __typename?: 'Opportunity';
                nameID: string;
                projects?: Array<{ __typename?: 'Project'; nameID: string }> | undefined;
              }>
            | undefined;
        }>
      | undefined;
  };
};

export type RelationsQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type RelationsQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            relations?:
              | Array<{
                  __typename?: 'Relation';
                  id: string;
                  type: string;
                  actorName: string;
                  actorType: string;
                  actorRole: string;
                  description: string;
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type SearchQueryVariables = Exact<{
  searchData: SearchInput;
}>;

export type SearchQuery = {
  __typename?: 'Query';
  search: Array<{
    __typename?: 'SearchResultEntry';
    score?: number | undefined;
    terms?: Array<string> | undefined;
    result?:
      | {
          __typename?: 'Challenge';
          id: string;
          displayName: string;
          nameID: string;
          hubID: string;
          activity?: Array<{ __typename?: 'NVP'; name: string; value: string }> | undefined;
          context?:
            | {
                __typename?: 'Context';
                id: string;
                tagline?: string | undefined;
                visuals?: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }> | undefined;
              }
            | undefined;
          tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
        }
      | {
          __typename?: 'Opportunity';
          id: string;
          displayName: string;
          nameID: string;
          activity?: Array<{ __typename?: 'NVP'; name: string; value: string }> | undefined;
          context?:
            | {
                __typename?: 'Context';
                id: string;
                tagline?: string | undefined;
                visuals?: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }> | undefined;
              }
            | undefined;
          tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
          challenge?:
            | { __typename?: 'Challenge'; id: string; nameID: string; displayName: string; hubID: string }
            | undefined;
        }
      | {
          __typename?: 'Organization';
          id: string;
          displayName: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
            tagsets?: Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }> | undefined;
          };
        }
      | { __typename?: 'RelayPaginatedUser' }
      | { __typename?: 'User'; displayName: string; id: string }
      | { __typename?: 'UserGroup'; name: string; id: string }
      | undefined;
  }>;
};

export type ServerMetadataQueryVariables = Exact<{ [key: string]: never }>;

export type ServerMetadataQuery = {
  __typename?: 'Query';
  metadata: {
    __typename?: 'Metadata';
    activity: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }>;
    services: Array<{ __typename?: 'ServiceMetadata'; name?: string | undefined; version?: string | undefined }>;
  };
};

export type TagsetsTemplateQueryVariables = Exact<{ [key: string]: never }>;

export type TagsetsTemplateQuery = {
  __typename?: 'Query';
  configuration: {
    __typename?: 'Config';
    template: {
      __typename?: 'Template';
      users: Array<{
        __typename?: 'UserTemplate';
        tagsets?: Array<{ __typename?: 'TagsetTemplate'; name: string; placeholder?: string | undefined }> | undefined;
      }>;
      organizations: Array<{
        __typename?: 'OrganizationTemplate';
        tagsets?: Array<{ __typename?: 'TagsetTemplate'; name: string; placeholder?: string | undefined }> | undefined;
      }>;
    };
  };
};

export type ProfileVerifiedCredentialSubscriptionVariables = Exact<{ [key: string]: never }>;

export type ProfileVerifiedCredentialSubscription = {
  __typename?: 'Subscription';
  profileVerifiedCredential: { __typename?: 'ProfileCredentialVerified'; vc: string };
};

export type HubAspectVisualsQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
  aspectNameId: Scalars['UUID_NAMEID'];
}>;

export type HubAspectVisualsQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    collaboration?:
      | {
          __typename?: 'Collaboration';
          id: string;
          callouts?:
            | Array<{
                __typename?: 'Callout';
                id: string;
                type: CalloutType;
                aspects?:
                  | Array<{
                      __typename?: 'Aspect';
                      id: string;
                      nameID: string;
                      bannerNarrow?:
                        | {
                            __typename?: 'Visual';
                            id: string;
                            uri: string;
                            name: string;
                            allowedTypes: Array<string>;
                            aspectRatio: number;
                            maxHeight: number;
                            maxWidth: number;
                            minHeight: number;
                            minWidth: number;
                          }
                        | undefined;
                    }>
                  | undefined;
              }>
            | undefined;
        }
      | undefined;
  };
};

export type ChallengeAspectVisualsQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
  challengeNameId: Scalars['UUID_NAMEID'];
  aspectNameId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeAspectVisualsQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  type: CalloutType;
                  aspects?:
                    | Array<{
                        __typename?: 'Aspect';
                        id: string;
                        nameID: string;
                        bannerNarrow?:
                          | {
                              __typename?: 'Visual';
                              id: string;
                              uri: string;
                              name: string;
                              allowedTypes: Array<string>;
                              aspectRatio: number;
                              maxHeight: number;
                              maxWidth: number;
                              minHeight: number;
                              minWidth: number;
                            }
                          | undefined;
                      }>
                    | undefined;
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type OpportunityAspectVisualsQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
  opportunityNameId: Scalars['UUID_NAMEID'];
  aspectNameId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityAspectVisualsQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  type: CalloutType;
                  aspects?:
                    | Array<{
                        __typename?: 'Aspect';
                        id: string;
                        nameID: string;
                        bannerNarrow?:
                          | {
                              __typename?: 'Visual';
                              id: string;
                              uri: string;
                              name: string;
                              allowedTypes: Array<string>;
                              aspectRatio: number;
                              maxHeight: number;
                              maxWidth: number;
                              minHeight: number;
                              minWidth: number;
                            }
                          | undefined;
                      }>
                    | undefined;
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type AspectVisualsFragment = {
  __typename?: 'Aspect';
  id: string;
  nameID: string;
  bannerNarrow?:
    | {
        __typename?: 'Visual';
        id: string;
        uri: string;
        name: string;
        allowedTypes: Array<string>;
        aspectRatio: number;
        maxHeight: number;
        maxWidth: number;
        minHeight: number;
        minWidth: number;
      }
    | undefined;
};

export type ConfigurationFragment = {
  __typename?: 'Config';
  authentication: {
    __typename?: 'AuthenticationConfig';
    providers: Array<{
      __typename?: 'AuthenticationProviderConfig';
      name: string;
      label: string;
      icon: string;
      enabled: boolean;
      config: { __typename: 'OryConfig'; kratosPublicBaseURL: string; issuer: string };
    }>;
  };
  platform: {
    __typename?: 'Platform';
    about: string;
    feedback: string;
    privacy: string;
    security: string;
    support: string;
    terms: string;
    impact: string;
    foundation: string;
    opensource: string;
    releases: string;
    featureFlags: Array<{ __typename?: 'FeatureFlag'; enabled: boolean; name: string }>;
  };
  sentry: { __typename?: 'Sentry'; enabled: boolean; endpoint: string; submitPII: boolean };
};

export type ConfigurationQueryVariables = Exact<{ [key: string]: never }>;

export type ConfigurationQuery = {
  __typename?: 'Query';
  configuration: {
    __typename?: 'Config';
    authentication: {
      __typename?: 'AuthenticationConfig';
      providers: Array<{
        __typename?: 'AuthenticationProviderConfig';
        name: string;
        label: string;
        icon: string;
        enabled: boolean;
        config: { __typename: 'OryConfig'; kratosPublicBaseURL: string; issuer: string };
      }>;
    };
    platform: {
      __typename?: 'Platform';
      about: string;
      feedback: string;
      privacy: string;
      security: string;
      support: string;
      terms: string;
      impact: string;
      foundation: string;
      opensource: string;
      releases: string;
      featureFlags: Array<{ __typename?: 'FeatureFlag'; enabled: boolean; name: string }>;
    };
    sentry: { __typename?: 'Sentry'; enabled: boolean; endpoint: string; submitPII: boolean };
  };
};

export type HubContributionDetailsQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type HubContributionDetailsQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    nameID: string;
    displayName: string;
    tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
    context?:
      | {
          __typename?: 'Context';
          id: string;
          visuals?: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }> | undefined;
        }
      | undefined;
    community?: { __typename?: 'Community'; id: string } | undefined;
  };
};

export type ChallengeContributionDetailsQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeContributionDetailsQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    nameID: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      nameID: string;
      displayName: string;
      tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
      context?:
        | {
            __typename?: 'Context';
            id: string;
            visuals?: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }> | undefined;
          }
        | undefined;
      community?: { __typename?: 'Community'; id: string } | undefined;
    };
  };
};

export type OpportunityContributionDetailsQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityContributionDetailsQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    nameID: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      nameID: string;
      displayName: string;
      parentId?: string | undefined;
      parentNameID?: string | undefined;
      tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
      context?:
        | {
            __typename?: 'Context';
            id: string;
            visuals?: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }> | undefined;
          }
        | undefined;
      community?: { __typename?: 'Community'; id: string } | undefined;
    };
  };
};

export type ContributorsSearchQueryVariables = Exact<{
  searchData: SearchInput;
}>;

export type ContributorsSearchQuery = {
  __typename?: 'Query';
  search: Array<{
    __typename?: 'SearchResultEntry';
    result?:
      | { __typename?: 'Challenge' }
      | { __typename?: 'Opportunity' }
      | {
          __typename?: 'Organization';
          id: string;
          displayName: string;
          nameID: string;
          activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
          orgProfile: {
            __typename?: 'Profile';
            id: string;
            description?: string | undefined;
            avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          };
          verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
        }
      | { __typename?: 'RelayPaginatedUser' }
      | {
          __typename?: 'User';
          id: string;
          nameID: string;
          displayName: string;
          agent?:
            | {
                __typename?: 'Agent';
                id: string;
                credentials?:
                  | Array<{ __typename?: 'Credential'; id: string; type: AuthorizationCredential; resourceID: string }>
                  | undefined;
              }
            | undefined;
          userProfile?:
            | {
                __typename?: 'Profile';
                id: string;
                location?: { __typename?: 'Location'; city: string; country: string } | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                tagsets?: Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }> | undefined;
              }
            | undefined;
        }
      | { __typename?: 'UserGroup' }
      | undefined;
  }>;
};

export type OrganizationContributorFragment = {
  __typename?: 'Organization';
  id: string;
  displayName: string;
  nameID: string;
  activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
  orgProfile: {
    __typename?: 'Profile';
    id: string;
    description?: string | undefined;
    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
  };
  verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
};

export type UserContributorFragment = {
  __typename?: 'User';
  id: string;
  nameID: string;
  displayName: string;
  agent?:
    | {
        __typename?: 'Agent';
        id: string;
        credentials?:
          | Array<{ __typename?: 'Credential'; id: string; type: AuthorizationCredential; resourceID: string }>
          | undefined;
      }
    | undefined;
  userProfile?:
    | {
        __typename?: 'Profile';
        id: string;
        location?: { __typename?: 'Location'; city: string; country: string } | undefined;
        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        tagsets?: Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }> | undefined;
      }
    | undefined;
};

export type CommunityUserPrivilegesQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
  communityId: Scalars['UUID'];
}>;

export type CommunityUserPrivilegesQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    hubCommunity?:
      | {
          __typename?: 'Community';
          id: string;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
        }
      | undefined;
    community?:
      | {
          __typename?: 'Community';
          id: string;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
        }
      | undefined;
  };
};

export type JoinCommunityMutationVariables = Exact<{
  joiningData: CommunityJoinInput;
}>;

export type JoinCommunityMutation = {
  __typename?: 'Mutation';
  joinCommunity: { __typename?: 'Community'; id: string };
};

export type HubAspectQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
  aspectNameId: Scalars['UUID_NAMEID'];
  calloutNameId: Scalars['UUID_NAMEID'];
}>;

export type HubAspectQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    collaboration?:
      | {
          __typename?: 'Collaboration';
          id: string;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          callouts?:
            | Array<{
                __typename?: 'Callout';
                id: string;
                type: CalloutType;
                aspects?:
                  | Array<{
                      __typename?: 'Aspect';
                      id: string;
                      nameID: string;
                      type: string;
                      displayName: string;
                      description: string;
                      createdBy: string;
                      createdDate: Date;
                      banner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                      tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
                      references?:
                        | Array<{
                            __typename?: 'Reference';
                            id: string;
                            name: string;
                            uri: string;
                            description: string;
                          }>
                        | undefined;
                      comments?:
                        | {
                            __typename?: 'Comments';
                            id: string;
                            authorization?:
                              | {
                                  __typename?: 'Authorization';
                                  id: string;
                                  myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                                }
                              | undefined;
                            messages?:
                              | Array<{
                                  __typename?: 'Message';
                                  id: string;
                                  message: string;
                                  sender: string;
                                  timestamp: number;
                                }>
                              | undefined;
                          }
                        | undefined;
                    }>
                  | undefined;
              }>
            | undefined;
        }
      | undefined;
  };
};

export type ChallengeAspectQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
  challengeNameId: Scalars['UUID_NAMEID'];
  aspectNameId: Scalars['UUID_NAMEID'];
  calloutNameId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeAspectQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  type: CalloutType;
                  aspects?:
                    | Array<{
                        __typename?: 'Aspect';
                        id: string;
                        nameID: string;
                        type: string;
                        displayName: string;
                        description: string;
                        createdBy: string;
                        createdDate: Date;
                        banner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                        tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
                        references?:
                          | Array<{
                              __typename?: 'Reference';
                              id: string;
                              name: string;
                              uri: string;
                              description: string;
                            }>
                          | undefined;
                        comments?:
                          | {
                              __typename?: 'Comments';
                              id: string;
                              authorization?:
                                | {
                                    __typename?: 'Authorization';
                                    id: string;
                                    myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                                  }
                                | undefined;
                              messages?:
                                | Array<{
                                    __typename?: 'Message';
                                    id: string;
                                    message: string;
                                    sender: string;
                                    timestamp: number;
                                  }>
                                | undefined;
                            }
                          | undefined;
                      }>
                    | undefined;
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type OpportunityAspectQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
  opportunityNameId: Scalars['UUID_NAMEID'];
  aspectNameId: Scalars['UUID_NAMEID'];
  calloutNameId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityAspectQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  type: CalloutType;
                  aspects?:
                    | Array<{
                        __typename?: 'Aspect';
                        id: string;
                        nameID: string;
                        type: string;
                        displayName: string;
                        description: string;
                        createdBy: string;
                        createdDate: Date;
                        banner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                        tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
                        references?:
                          | Array<{
                              __typename?: 'Reference';
                              id: string;
                              name: string;
                              uri: string;
                              description: string;
                            }>
                          | undefined;
                        comments?:
                          | {
                              __typename?: 'Comments';
                              id: string;
                              authorization?:
                                | {
                                    __typename?: 'Authorization';
                                    id: string;
                                    myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                                  }
                                | undefined;
                              messages?:
                                | Array<{
                                    __typename?: 'Message';
                                    id: string;
                                    message: string;
                                    sender: string;
                                    timestamp: number;
                                  }>
                                | undefined;
                            }
                          | undefined;
                      }>
                    | undefined;
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type AspectDashboardDataFragment = {
  __typename?: 'Collaboration';
  id: string;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
  callouts?:
    | Array<{
        __typename?: 'Callout';
        id: string;
        type: CalloutType;
        aspects?:
          | Array<{
              __typename?: 'Aspect';
              id: string;
              nameID: string;
              type: string;
              displayName: string;
              description: string;
              createdBy: string;
              createdDate: Date;
              banner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
              references?:
                | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
                | undefined;
              comments?:
                | {
                    __typename?: 'Comments';
                    id: string;
                    authorization?:
                      | {
                          __typename?: 'Authorization';
                          id: string;
                          myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                        }
                      | undefined;
                    messages?:
                      | Array<{
                          __typename?: 'Message';
                          id: string;
                          message: string;
                          sender: string;
                          timestamp: number;
                        }>
                      | undefined;
                  }
                | undefined;
            }>
          | undefined;
      }>
    | undefined;
};

export type AspectDashboardFragment = {
  __typename?: 'Aspect';
  id: string;
  nameID: string;
  type: string;
  displayName: string;
  description: string;
  createdBy: string;
  createdDate: Date;
  banner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
  tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
  references?:
    | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
    | undefined;
  comments?:
    | {
        __typename?: 'Comments';
        id: string;
        authorization?:
          | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
          | undefined;
        messages?:
          | Array<{ __typename?: 'Message'; id: string; message: string; sender: string; timestamp: number }>
          | undefined;
      }
    | undefined;
};

export type AspectMessageFragment = {
  __typename?: 'Message';
  id: string;
  message: string;
  sender: string;
  timestamp: number;
};

export type AspectCreatorQueryVariables = Exact<{
  userId: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type AspectCreatorQuery = {
  __typename?: 'Query';
  user: {
    __typename?: 'User';
    id: string;
    displayName: string;
    profile?:
      | { __typename?: 'Profile'; id: string; avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined }
      | undefined;
  };
};

export type UpdateAspectMutationVariables = Exact<{
  input: UpdateAspectInput;
}>;

export type UpdateAspectMutation = {
  __typename?: 'Mutation';
  updateAspect: {
    __typename?: 'Aspect';
    id: string;
    description: string;
    displayName: string;
    type: string;
    tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
    references?:
      | Array<{ __typename?: 'Reference'; id: string; name: string; description: string; uri: string }>
      | undefined;
  };
};

export type HubAspectSettingsQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
  aspectNameId: Scalars['UUID_NAMEID'];
  calloutNameId: Scalars['UUID_NAMEID'];
}>;

export type HubAspectSettingsQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    collaboration?:
      | {
          __typename?: 'Collaboration';
          id: string;
          callouts?:
            | Array<{
                __typename?: 'Callout';
                id: string;
                type: CalloutType;
                aspects?:
                  | Array<{
                      __typename?: 'Aspect';
                      id: string;
                      nameID: string;
                      displayName: string;
                      description: string;
                      type: string;
                      authorization?:
                        | {
                            __typename?: 'Authorization';
                            id: string;
                            myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                          }
                        | undefined;
                      banner?:
                        | {
                            __typename?: 'Visual';
                            id: string;
                            uri: string;
                            name: string;
                            allowedTypes: Array<string>;
                            aspectRatio: number;
                            maxHeight: number;
                            maxWidth: number;
                            minHeight: number;
                            minWidth: number;
                          }
                        | undefined;
                      bannerNarrow?:
                        | {
                            __typename?: 'Visual';
                            id: string;
                            uri: string;
                            name: string;
                            allowedTypes: Array<string>;
                            aspectRatio: number;
                            maxHeight: number;
                            maxWidth: number;
                            minHeight: number;
                            minWidth: number;
                          }
                        | undefined;
                      tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
                      references?:
                        | Array<{
                            __typename?: 'Reference';
                            id: string;
                            name: string;
                            uri: string;
                            description: string;
                          }>
                        | undefined;
                    }>
                  | undefined;
                aspectNames?: Array<{ __typename?: 'Aspect'; id: string; displayName: string }> | undefined;
              }>
            | undefined;
        }
      | undefined;
  };
};

export type ChallengeAspectSettingsQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
  challengeNameId: Scalars['UUID_NAMEID'];
  aspectNameId: Scalars['UUID_NAMEID'];
  calloutNameId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeAspectSettingsQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  type: CalloutType;
                  aspects?:
                    | Array<{
                        __typename?: 'Aspect';
                        id: string;
                        nameID: string;
                        displayName: string;
                        description: string;
                        type: string;
                        authorization?:
                          | {
                              __typename?: 'Authorization';
                              id: string;
                              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                            }
                          | undefined;
                        banner?:
                          | {
                              __typename?: 'Visual';
                              id: string;
                              uri: string;
                              name: string;
                              allowedTypes: Array<string>;
                              aspectRatio: number;
                              maxHeight: number;
                              maxWidth: number;
                              minHeight: number;
                              minWidth: number;
                            }
                          | undefined;
                        bannerNarrow?:
                          | {
                              __typename?: 'Visual';
                              id: string;
                              uri: string;
                              name: string;
                              allowedTypes: Array<string>;
                              aspectRatio: number;
                              maxHeight: number;
                              maxWidth: number;
                              minHeight: number;
                              minWidth: number;
                            }
                          | undefined;
                        tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
                        references?:
                          | Array<{
                              __typename?: 'Reference';
                              id: string;
                              name: string;
                              uri: string;
                              description: string;
                            }>
                          | undefined;
                      }>
                    | undefined;
                  aspectNames?: Array<{ __typename?: 'Aspect'; id: string; displayName: string }> | undefined;
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type OpportunityAspectSettingsQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
  opportunityNameId: Scalars['UUID_NAMEID'];
  aspectNameId: Scalars['UUID_NAMEID'];
  calloutNameId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityAspectSettingsQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  type: CalloutType;
                  aspects?:
                    | Array<{
                        __typename?: 'Aspect';
                        id: string;
                        nameID: string;
                        displayName: string;
                        description: string;
                        type: string;
                        authorization?:
                          | {
                              __typename?: 'Authorization';
                              id: string;
                              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                            }
                          | undefined;
                        banner?:
                          | {
                              __typename?: 'Visual';
                              id: string;
                              uri: string;
                              name: string;
                              allowedTypes: Array<string>;
                              aspectRatio: number;
                              maxHeight: number;
                              maxWidth: number;
                              minHeight: number;
                              minWidth: number;
                            }
                          | undefined;
                        bannerNarrow?:
                          | {
                              __typename?: 'Visual';
                              id: string;
                              uri: string;
                              name: string;
                              allowedTypes: Array<string>;
                              aspectRatio: number;
                              maxHeight: number;
                              maxWidth: number;
                              minHeight: number;
                              minWidth: number;
                            }
                          | undefined;
                        tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
                        references?:
                          | Array<{
                              __typename?: 'Reference';
                              id: string;
                              name: string;
                              uri: string;
                              description: string;
                            }>
                          | undefined;
                      }>
                    | undefined;
                  aspectNames?: Array<{ __typename?: 'Aspect'; id: string; displayName: string }> | undefined;
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type AspectSettingsFragment = {
  __typename?: 'Aspect';
  id: string;
  nameID: string;
  displayName: string;
  description: string;
  type: string;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
  banner?:
    | {
        __typename?: 'Visual';
        id: string;
        uri: string;
        name: string;
        allowedTypes: Array<string>;
        aspectRatio: number;
        maxHeight: number;
        maxWidth: number;
        minHeight: number;
        minWidth: number;
      }
    | undefined;
  bannerNarrow?:
    | {
        __typename?: 'Visual';
        id: string;
        uri: string;
        name: string;
        allowedTypes: Array<string>;
        aspectRatio: number;
        maxHeight: number;
        maxWidth: number;
        minHeight: number;
        minWidth: number;
      }
    | undefined;
  tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
  references?:
    | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
    | undefined;
};

export type CanvasDetailsFragment = {
  __typename?: 'Canvas';
  id: string;
  nameID: string;
  displayName: string;
  authorization?:
    | {
        __typename?: 'Authorization';
        id: string;
        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
        anonymousReadAccess: boolean;
      }
    | undefined;
  checkout?:
    | {
        __typename?: 'CanvasCheckout';
        id: string;
        lockedBy: string;
        status: CanvasCheckoutStateEnum;
        lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
        authorization?:
          | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
          | undefined;
      }
    | undefined;
  preview?:
    | {
        __typename?: 'Visual';
        id: string;
        uri: string;
        name: string;
        allowedTypes: Array<string>;
        aspectRatio: number;
        maxHeight: number;
        maxWidth: number;
        minHeight: number;
        minWidth: number;
      }
    | undefined;
};

export type CanvasSummaryFragment = { __typename?: 'Canvas'; id: string; nameID: string; displayName: string };

export type CanvasValueFragment = { __typename?: 'Canvas'; id: string; value: string };

export type CheckoutDetailsFragment = {
  __typename?: 'CanvasCheckout';
  id: string;
  lockedBy: string;
  status: CanvasCheckoutStateEnum;
  lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
};

export type CanvasTemplatesQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type CanvasTemplatesQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    templates?:
      | {
          __typename?: 'TemplatesSet';
          id: string;
          canvasTemplates: Array<{
            __typename?: 'CanvasTemplate';
            id: string;
            value: string;
            info: { __typename?: 'TemplateInfo'; title: string; description: string };
          }>;
        }
      | undefined;
  };
};

export type CreateCanvasCanvasTemplateFragment = {
  __typename?: 'CanvasTemplate';
  id: string;
  value: string;
  info: { __typename?: 'TemplateInfo'; title: string; description: string };
};

export type CollaborationWithCanvasDetailsFragment = {
  __typename?: 'Collaboration';
  id: string;
  callouts?:
    | Array<{
        __typename?: 'Callout';
        id: string;
        nameID: string;
        type: CalloutType;
        authorization?:
          | {
              __typename?: 'Authorization';
              id: string;
              anonymousReadAccess: boolean;
              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
            }
          | undefined;
        canvases?:
          | Array<{
              __typename?: 'Canvas';
              id: string;
              nameID: string;
              displayName: string;
              authorization?:
                | {
                    __typename?: 'Authorization';
                    id: string;
                    myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                    anonymousReadAccess: boolean;
                  }
                | undefined;
              checkout?:
                | {
                    __typename?: 'CanvasCheckout';
                    id: string;
                    lockedBy: string;
                    status: CanvasCheckoutStateEnum;
                    lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
                    authorization?:
                      | {
                          __typename?: 'Authorization';
                          id: string;
                          myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                        }
                      | undefined;
                  }
                | undefined;
              preview?:
                | {
                    __typename?: 'Visual';
                    id: string;
                    uri: string;
                    name: string;
                    allowedTypes: Array<string>;
                    aspectRatio: number;
                    maxHeight: number;
                    maxWidth: number;
                    minHeight: number;
                    minWidth: number;
                  }
                | undefined;
            }>
          | undefined;
      }>
    | undefined;
};

export type HubCanvasesQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type HubCanvasesQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    collaboration?:
      | {
          __typename?: 'Collaboration';
          id: string;
          callouts?:
            | Array<{
                __typename?: 'Callout';
                id: string;
                nameID: string;
                type: CalloutType;
                authorization?:
                  | {
                      __typename?: 'Authorization';
                      id: string;
                      anonymousReadAccess: boolean;
                      myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                    }
                  | undefined;
                canvases?:
                  | Array<{
                      __typename?: 'Canvas';
                      id: string;
                      nameID: string;
                      displayName: string;
                      authorization?:
                        | {
                            __typename?: 'Authorization';
                            id: string;
                            myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                            anonymousReadAccess: boolean;
                          }
                        | undefined;
                      checkout?:
                        | {
                            __typename?: 'CanvasCheckout';
                            id: string;
                            lockedBy: string;
                            status: CanvasCheckoutStateEnum;
                            lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
                            authorization?:
                              | {
                                  __typename?: 'Authorization';
                                  id: string;
                                  myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                                }
                              | undefined;
                          }
                        | undefined;
                      preview?:
                        | {
                            __typename?: 'Visual';
                            id: string;
                            uri: string;
                            name: string;
                            allowedTypes: Array<string>;
                            aspectRatio: number;
                            maxHeight: number;
                            maxWidth: number;
                            minHeight: number;
                            minWidth: number;
                          }
                        | undefined;
                    }>
                  | undefined;
              }>
            | undefined;
        }
      | undefined;
  };
};

export type HubCanvasValuesQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  calloutId: Scalars['UUID_NAMEID'];
  canvasId: Scalars['UUID'];
}>;

export type HubCanvasValuesQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    collaboration?:
      | {
          __typename?: 'Collaboration';
          id: string;
          callouts?:
            | Array<{
                __typename?: 'Callout';
                id: string;
                type: CalloutType;
                authorization?:
                  | {
                      __typename?: 'Authorization';
                      id: string;
                      myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                    }
                  | undefined;
                canvases?:
                  | Array<{
                      __typename?: 'Canvas';
                      id: string;
                      value: string;
                      nameID: string;
                      displayName: string;
                      authorization?:
                        | {
                            __typename?: 'Authorization';
                            id: string;
                            myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                            anonymousReadAccess: boolean;
                          }
                        | undefined;
                      checkout?:
                        | {
                            __typename?: 'CanvasCheckout';
                            id: string;
                            lockedBy: string;
                            status: CanvasCheckoutStateEnum;
                            lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
                            authorization?:
                              | {
                                  __typename?: 'Authorization';
                                  id: string;
                                  myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                                }
                              | undefined;
                          }
                        | undefined;
                      preview?:
                        | {
                            __typename?: 'Visual';
                            id: string;
                            uri: string;
                            name: string;
                            allowedTypes: Array<string>;
                            aspectRatio: number;
                            maxHeight: number;
                            maxWidth: number;
                            minHeight: number;
                            minWidth: number;
                          }
                        | undefined;
                    }>
                  | undefined;
              }>
            | undefined;
        }
      | undefined;
  };
};

export type ChallengeCanvasesQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeCanvasesQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  nameID: string;
                  type: CalloutType;
                  authorization?:
                    | {
                        __typename?: 'Authorization';
                        id: string;
                        anonymousReadAccess: boolean;
                        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                      }
                    | undefined;
                  canvases?:
                    | Array<{
                        __typename?: 'Canvas';
                        id: string;
                        nameID: string;
                        displayName: string;
                        authorization?:
                          | {
                              __typename?: 'Authorization';
                              id: string;
                              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                              anonymousReadAccess: boolean;
                            }
                          | undefined;
                        checkout?:
                          | {
                              __typename?: 'CanvasCheckout';
                              id: string;
                              lockedBy: string;
                              status: CanvasCheckoutStateEnum;
                              lifecycle: {
                                __typename?: 'Lifecycle';
                                id: string;
                                nextEvents?: Array<string> | undefined;
                              };
                              authorization?:
                                | {
                                    __typename?: 'Authorization';
                                    id: string;
                                    myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                                  }
                                | undefined;
                            }
                          | undefined;
                        preview?:
                          | {
                              __typename?: 'Visual';
                              id: string;
                              uri: string;
                              name: string;
                              allowedTypes: Array<string>;
                              aspectRatio: number;
                              maxHeight: number;
                              maxWidth: number;
                              minHeight: number;
                              minWidth: number;
                            }
                          | undefined;
                      }>
                    | undefined;
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type ChallengeCanvasValuesQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
  calloutId: Scalars['UUID_NAMEID'];
  canvasId: Scalars['UUID'];
}>;

export type ChallengeCanvasValuesQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  type: CalloutType;
                  authorization?:
                    | {
                        __typename?: 'Authorization';
                        id: string;
                        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                      }
                    | undefined;
                  canvases?:
                    | Array<{
                        __typename?: 'Canvas';
                        id: string;
                        value: string;
                        nameID: string;
                        displayName: string;
                        authorization?:
                          | {
                              __typename?: 'Authorization';
                              id: string;
                              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                              anonymousReadAccess: boolean;
                            }
                          | undefined;
                        checkout?:
                          | {
                              __typename?: 'CanvasCheckout';
                              id: string;
                              lockedBy: string;
                              status: CanvasCheckoutStateEnum;
                              lifecycle: {
                                __typename?: 'Lifecycle';
                                id: string;
                                nextEvents?: Array<string> | undefined;
                              };
                              authorization?:
                                | {
                                    __typename?: 'Authorization';
                                    id: string;
                                    myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                                  }
                                | undefined;
                            }
                          | undefined;
                        preview?:
                          | {
                              __typename?: 'Visual';
                              id: string;
                              uri: string;
                              name: string;
                              allowedTypes: Array<string>;
                              aspectRatio: number;
                              maxHeight: number;
                              maxWidth: number;
                              minHeight: number;
                              minWidth: number;
                            }
                          | undefined;
                      }>
                    | undefined;
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type OpportunityCanvasesQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityCanvasesQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  nameID: string;
                  type: CalloutType;
                  authorization?:
                    | {
                        __typename?: 'Authorization';
                        id: string;
                        anonymousReadAccess: boolean;
                        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                      }
                    | undefined;
                  canvases?:
                    | Array<{
                        __typename?: 'Canvas';
                        id: string;
                        nameID: string;
                        displayName: string;
                        authorization?:
                          | {
                              __typename?: 'Authorization';
                              id: string;
                              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                              anonymousReadAccess: boolean;
                            }
                          | undefined;
                        checkout?:
                          | {
                              __typename?: 'CanvasCheckout';
                              id: string;
                              lockedBy: string;
                              status: CanvasCheckoutStateEnum;
                              lifecycle: {
                                __typename?: 'Lifecycle';
                                id: string;
                                nextEvents?: Array<string> | undefined;
                              };
                              authorization?:
                                | {
                                    __typename?: 'Authorization';
                                    id: string;
                                    myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                                  }
                                | undefined;
                            }
                          | undefined;
                        preview?:
                          | {
                              __typename?: 'Visual';
                              id: string;
                              uri: string;
                              name: string;
                              allowedTypes: Array<string>;
                              aspectRatio: number;
                              maxHeight: number;
                              maxWidth: number;
                              minHeight: number;
                              minWidth: number;
                            }
                          | undefined;
                      }>
                    | undefined;
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type OpportunityCanvasValuesQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
  calloutId: Scalars['UUID_NAMEID'];
  canvasId: Scalars['UUID'];
}>;

export type OpportunityCanvasValuesQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  type: CalloutType;
                  authorization?:
                    | {
                        __typename?: 'Authorization';
                        id: string;
                        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                      }
                    | undefined;
                  canvases?:
                    | Array<{
                        __typename?: 'Canvas';
                        id: string;
                        value: string;
                        nameID: string;
                        displayName: string;
                        authorization?:
                          | {
                              __typename?: 'Authorization';
                              id: string;
                              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                              anonymousReadAccess: boolean;
                            }
                          | undefined;
                        checkout?:
                          | {
                              __typename?: 'CanvasCheckout';
                              id: string;
                              lockedBy: string;
                              status: CanvasCheckoutStateEnum;
                              lifecycle: {
                                __typename?: 'Lifecycle';
                                id: string;
                                nextEvents?: Array<string> | undefined;
                              };
                              authorization?:
                                | {
                                    __typename?: 'Authorization';
                                    id: string;
                                    myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                                  }
                                | undefined;
                            }
                          | undefined;
                        preview?:
                          | {
                              __typename?: 'Visual';
                              id: string;
                              uri: string;
                              name: string;
                              allowedTypes: Array<string>;
                              aspectRatio: number;
                              maxHeight: number;
                              maxWidth: number;
                              minHeight: number;
                              minWidth: number;
                            }
                          | undefined;
                      }>
                    | undefined;
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type CreateCanvasOnCalloutMutationVariables = Exact<{
  input: CreateCanvasOnCalloutInput;
}>;

export type CreateCanvasOnCalloutMutation = {
  __typename?: 'Mutation';
  createCanvasOnCallout: {
    __typename?: 'Canvas';
    id: string;
    nameID: string;
    displayName: string;
    authorization?:
      | {
          __typename?: 'Authorization';
          id: string;
          myPrivileges?: Array<AuthorizationPrivilege> | undefined;
          anonymousReadAccess: boolean;
        }
      | undefined;
    checkout?:
      | {
          __typename?: 'CanvasCheckout';
          id: string;
          lockedBy: string;
          status: CanvasCheckoutStateEnum;
          lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
        }
      | undefined;
    preview?:
      | {
          __typename?: 'Visual';
          id: string;
          uri: string;
          name: string;
          allowedTypes: Array<string>;
          aspectRatio: number;
          maxHeight: number;
          maxWidth: number;
          minHeight: number;
          minWidth: number;
        }
      | undefined;
  };
};

export type DeleteCanvasMutationVariables = Exact<{
  input: DeleteCanvasInput;
}>;

export type DeleteCanvasMutation = {
  __typename?: 'Mutation';
  deleteCanvas: { __typename?: 'Canvas'; id: string; nameID: string; displayName: string };
};

export type UpdateCanvasMutationVariables = Exact<{
  input: UpdateCanvasDirectInput;
}>;

export type UpdateCanvasMutation = {
  __typename?: 'Mutation';
  updateCanvas: { __typename?: 'Canvas'; id: string; value: string; displayName: string };
};

export type CheckoutCanvasMutationVariables = Exact<{
  input: CanvasCheckoutEventInput;
}>;

export type CheckoutCanvasMutation = {
  __typename?: 'Mutation';
  eventOnCanvasCheckout: {
    __typename?: 'CanvasCheckout';
    id: string;
    lockedBy: string;
    status: CanvasCheckoutStateEnum;
    lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
  };
};

export type CanvasContentUpdatedSubscriptionVariables = Exact<{ [key: string]: never }>;

export type CanvasContentUpdatedSubscription = {
  __typename?: 'Subscription';
  canvasContentUpdated: { __typename?: 'CanvasContentUpdated'; canvasID: string; value: string };
};

export type ChallengeExplorerSearchQueryVariables = Exact<{
  searchData: SearchInput;
}>;

export type ChallengeExplorerSearchQuery = {
  __typename?: 'Query';
  search: Array<{
    __typename?: 'SearchResultEntry';
    result?:
      | {
          __typename?: 'Challenge';
          id: string;
          displayName: string;
          nameID: string;
          hubID: string;
          activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
          context?:
            | {
                __typename?: 'Context';
                id: string;
                visuals?: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }> | undefined;
              }
            | undefined;
          tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
        }
      | { __typename?: 'Opportunity' }
      | { __typename?: 'Organization' }
      | { __typename?: 'RelayPaginatedUser' }
      | { __typename?: 'User' }
      | { __typename?: 'UserGroup' }
      | undefined;
  }>;
};

export type ChallengeExplorerSearchResultFragment = {
  __typename?: 'Challenge';
  id: string;
  displayName: string;
  nameID: string;
  hubID: string;
  activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
  context?:
    | {
        __typename?: 'Context';
        id: string;
        visuals?: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }> | undefined;
      }
    | undefined;
  tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
};

export type SimpleHubQueryVariables = Exact<{
  ID: Scalars['UUID_NAMEID'];
}>;

export type SimpleHubQuery = {
  __typename?: 'Query';
  hub: { __typename?: 'Hub'; id: string; nameID: string; displayName: string };
};

export type SimpleHubFragment = { __typename?: 'Hub'; id: string; nameID: string; displayName: string };

export type ChallengeExplorerSearchEnricherQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeExplorerSearchEnricherQuery = {
  __typename?: 'Query';
  hub: { __typename?: 'Hub'; id: string; nameID: string; displayName: string };
};

export type ChallengePageQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengePageQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      nameID: string;
      displayName: string;
      activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
      lifecycle?:
        | {
            __typename?: 'Lifecycle';
            id: string;
            machineDef: string;
            state?: string | undefined;
            nextEvents?: Array<string> | undefined;
            stateIsFinal: boolean;
          }
        | undefined;
      context?:
        | {
            __typename?: 'Context';
            id: string;
            tagline?: string | undefined;
            vision?: string | undefined;
            authorization?:
              | {
                  __typename?: 'Authorization';
                  id: string;
                  myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                  anonymousReadAccess: boolean;
                }
              | undefined;
            visuals?:
              | Array<{
                  __typename?: 'Visual';
                  id: string;
                  uri: string;
                  name: string;
                  allowedTypes: Array<string>;
                  aspectRatio: number;
                  maxHeight: number;
                  maxWidth: number;
                  minHeight: number;
                  minWidth: number;
                }>
              | undefined;
          }
        | undefined;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  nameID: string;
                  type: CalloutType;
                  visibility: CalloutVisibility;
                  aspects?:
                    | Array<{
                        __typename?: 'Aspect';
                        id: string;
                        nameID: string;
                        displayName: string;
                        type: string;
                        description: string;
                        banner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                        bannerNarrow?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                        tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
                      }>
                    | undefined;
                  canvases?:
                    | Array<{
                        __typename?: 'Canvas';
                        id: string;
                        nameID: string;
                        displayName: string;
                        authorization?:
                          | {
                              __typename?: 'Authorization';
                              id: string;
                              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                              anonymousReadAccess: boolean;
                            }
                          | undefined;
                        checkout?:
                          | {
                              __typename?: 'CanvasCheckout';
                              id: string;
                              lockedBy: string;
                              status: CanvasCheckoutStateEnum;
                              lifecycle: {
                                __typename?: 'Lifecycle';
                                id: string;
                                nextEvents?: Array<string> | undefined;
                              };
                              authorization?:
                                | {
                                    __typename?: 'Authorization';
                                    id: string;
                                    myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                                  }
                                | undefined;
                            }
                          | undefined;
                        preview?:
                          | {
                              __typename?: 'Visual';
                              id: string;
                              uri: string;
                              name: string;
                              allowedTypes: Array<string>;
                              aspectRatio: number;
                              maxHeight: number;
                              maxWidth: number;
                              minHeight: number;
                              minWidth: number;
                            }
                          | undefined;
                      }>
                    | undefined;
                }>
              | undefined;
          }
        | undefined;
      community?:
        | {
            __typename?: 'Community';
            id: string;
            leadUsers?:
              | Array<{
                  __typename?: 'User';
                  id: string;
                  displayName: string;
                  nameID: string;
                  profile?:
                    | {
                        __typename?: 'Profile';
                        id: string;
                        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                        location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
                        tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
                      }
                    | undefined;
                }>
              | undefined;
            memberUsers?:
              | Array<{
                  __typename?: 'User';
                  id: string;
                  displayName: string;
                  nameID: string;
                  profile?:
                    | {
                        __typename?: 'Profile';
                        id: string;
                        location?: { __typename?: 'Location'; city: string; country: string } | undefined;
                        avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                        tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
                      }
                    | undefined;
                }>
              | undefined;
            leadOrganizations?:
              | Array<{
                  __typename?: 'Organization';
                  id: string;
                  displayName: string;
                  nameID: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    description?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  };
                  verification: {
                    __typename?: 'OrganizationVerification';
                    id: string;
                    status: OrganizationVerificationEnum;
                  };
                  activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
                }>
              | undefined;
            memberOrganizations?:
              | Array<{
                  __typename?: 'Organization';
                  id: string;
                  displayName: string;
                  nameID: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  };
                }>
              | undefined;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
          }
        | undefined;
      tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
      opportunities?:
        | Array<{
            __typename?: 'Opportunity';
            id: string;
            nameID: string;
            displayName: string;
            activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
            lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined } | undefined;
            context?:
              | {
                  __typename?: 'Context';
                  id: string;
                  tagline?: string | undefined;
                  background?: string | undefined;
                  vision?: string | undefined;
                  impact?: string | undefined;
                  who?: string | undefined;
                  location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
                  references?:
                    | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
                    | undefined;
                  visuals?:
                    | Array<{
                        __typename?: 'Visual';
                        id: string;
                        uri: string;
                        name: string;
                        allowedTypes: Array<string>;
                        aspectRatio: number;
                        maxHeight: number;
                        maxWidth: number;
                        minHeight: number;
                        minWidth: number;
                      }>
                    | undefined;
                  authorization?:
                    | {
                        __typename?: 'Authorization';
                        id: string;
                        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                        anonymousReadAccess: boolean;
                      }
                    | undefined;
                }
              | undefined;
            projects?:
              | Array<{
                  __typename?: 'Project';
                  id: string;
                  nameID: string;
                  displayName: string;
                  description?: string | undefined;
                  lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined } | undefined;
                }>
              | undefined;
            tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
          }>
        | undefined;
    };
  };
};

export type ChallengeProfileFragment = {
  __typename?: 'Challenge';
  id: string;
  nameID: string;
  displayName: string;
  activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
  lifecycle?:
    | {
        __typename?: 'Lifecycle';
        id: string;
        machineDef: string;
        state?: string | undefined;
        nextEvents?: Array<string> | undefined;
        stateIsFinal: boolean;
      }
    | undefined;
  context?:
    | {
        __typename?: 'Context';
        id: string;
        tagline?: string | undefined;
        vision?: string | undefined;
        authorization?:
          | {
              __typename?: 'Authorization';
              id: string;
              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
              anonymousReadAccess: boolean;
            }
          | undefined;
        visuals?:
          | Array<{
              __typename?: 'Visual';
              id: string;
              uri: string;
              name: string;
              allowedTypes: Array<string>;
              aspectRatio: number;
              maxHeight: number;
              maxWidth: number;
              minHeight: number;
              minWidth: number;
            }>
          | undefined;
      }
    | undefined;
  collaboration?:
    | {
        __typename?: 'Collaboration';
        id: string;
        callouts?:
          | Array<{
              __typename?: 'Callout';
              id: string;
              nameID: string;
              type: CalloutType;
              visibility: CalloutVisibility;
              aspects?:
                | Array<{
                    __typename?: 'Aspect';
                    id: string;
                    nameID: string;
                    displayName: string;
                    type: string;
                    description: string;
                    banner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    bannerNarrow?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
                  }>
                | undefined;
              canvases?:
                | Array<{
                    __typename?: 'Canvas';
                    id: string;
                    nameID: string;
                    displayName: string;
                    authorization?:
                      | {
                          __typename?: 'Authorization';
                          id: string;
                          myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                          anonymousReadAccess: boolean;
                        }
                      | undefined;
                    checkout?:
                      | {
                          __typename?: 'CanvasCheckout';
                          id: string;
                          lockedBy: string;
                          status: CanvasCheckoutStateEnum;
                          lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
                          authorization?:
                            | {
                                __typename?: 'Authorization';
                                id: string;
                                myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                              }
                            | undefined;
                        }
                      | undefined;
                    preview?:
                      | {
                          __typename?: 'Visual';
                          id: string;
                          uri: string;
                          name: string;
                          allowedTypes: Array<string>;
                          aspectRatio: number;
                          maxHeight: number;
                          maxWidth: number;
                          minHeight: number;
                          minWidth: number;
                        }
                      | undefined;
                  }>
                | undefined;
            }>
          | undefined;
      }
    | undefined;
  community?:
    | {
        __typename?: 'Community';
        id: string;
        leadUsers?:
          | Array<{
              __typename?: 'User';
              id: string;
              displayName: string;
              nameID: string;
              profile?:
                | {
                    __typename?: 'Profile';
                    id: string;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
                    tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
                  }
                | undefined;
            }>
          | undefined;
        memberUsers?:
          | Array<{
              __typename?: 'User';
              id: string;
              displayName: string;
              nameID: string;
              profile?:
                | {
                    __typename?: 'Profile';
                    id: string;
                    location?: { __typename?: 'Location'; city: string; country: string } | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                    tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
                  }
                | undefined;
            }>
          | undefined;
        leadOrganizations?:
          | Array<{
              __typename?: 'Organization';
              id: string;
              displayName: string;
              nameID: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                description?: string | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
              verification: {
                __typename?: 'OrganizationVerification';
                id: string;
                status: OrganizationVerificationEnum;
              };
              activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
            }>
          | undefined;
        memberOrganizations?:
          | Array<{
              __typename?: 'Organization';
              id: string;
              displayName: string;
              nameID: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
            }>
          | undefined;
        authorization?:
          | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
          | undefined;
      }
    | undefined;
  tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
  opportunities?:
    | Array<{
        __typename?: 'Opportunity';
        id: string;
        nameID: string;
        displayName: string;
        activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
        lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined } | undefined;
        context?:
          | {
              __typename?: 'Context';
              id: string;
              tagline?: string | undefined;
              background?: string | undefined;
              vision?: string | undefined;
              impact?: string | undefined;
              who?: string | undefined;
              location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
              references?:
                | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
                | undefined;
              visuals?:
                | Array<{
                    __typename?: 'Visual';
                    id: string;
                    uri: string;
                    name: string;
                    allowedTypes: Array<string>;
                    aspectRatio: number;
                    maxHeight: number;
                    maxWidth: number;
                    minHeight: number;
                    minWidth: number;
                  }>
                | undefined;
              authorization?:
                | {
                    __typename?: 'Authorization';
                    id: string;
                    myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                    anonymousReadAccess: boolean;
                  }
                | undefined;
            }
          | undefined;
        projects?:
          | Array<{
              __typename?: 'Project';
              id: string;
              nameID: string;
              displayName: string;
              description?: string | undefined;
              lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined } | undefined;
            }>
          | undefined;
        tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
      }>
    | undefined;
};

export type ChallengeDashboardReferencesQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeDashboardReferencesQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      context?:
        | {
            __typename?: 'Context';
            id: string;
            references?:
              | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type ChallengesOverviewPageQueryVariables = Exact<{
  rolesData: RolesUserInput;
}>;

export type ChallengesOverviewPageQuery = {
  __typename?: 'Query';
  rolesUser: {
    __typename?: 'ContributorRoles';
    hubs: Array<{
      __typename?: 'RolesResultHub';
      id: string;
      roles: Array<string>;
      hubID: string;
      nameID: string;
      displayName: string;
      challenges: Array<{ __typename?: 'RolesResultCommunity'; id: string; roles: Array<string> }>;
    }>;
  };
};

export type SimpleHubResultEntryFragment = {
  __typename?: 'RolesResultHub';
  hubID: string;
  nameID: string;
  displayName: string;
};

export type CommunityUpdatesQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  communityId: Scalars['UUID'];
}>;

export type CommunityUpdatesQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    community?:
      | {
          __typename?: 'Community';
          id: string;
          displayName: string;
          communication?:
            | {
                __typename?: 'Communication';
                id: string;
                updates?:
                  | {
                      __typename?: 'Updates';
                      id: string;
                      messages?:
                        | Array<{
                            __typename?: 'Message';
                            id: string;
                            sender: string;
                            message: string;
                            timestamp: number;
                          }>
                        | undefined;
                    }
                  | undefined;
              }
            | undefined;
        }
      | undefined;
  };
};

export type SendUpdateMutationVariables = Exact<{
  msgData: UpdatesSendMessageInput;
}>;

export type SendUpdateMutation = {
  __typename?: 'Mutation';
  sendUpdate: { __typename?: 'Message'; id: string; sender: string; message: string; timestamp: number };
};

export type RemoveUpdateCommunityMutationVariables = Exact<{
  msgData: UpdatesRemoveMessageInput;
}>;

export type RemoveUpdateCommunityMutation = { __typename?: 'Mutation'; removeUpdate: string };

export type CommunicationUpdateMessageReceivedSubscriptionVariables = Exact<{ [key: string]: never }>;

export type CommunicationUpdateMessageReceivedSubscription = {
  __typename?: 'Subscription';
  communicationUpdateMessageReceived: {
    __typename?: 'CommunicationUpdateMessageReceived';
    updatesID: string;
    message: { __typename?: 'Message'; id: string; sender: string; message: string; timestamp: number };
  };
};

export type HubContextQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
}>;

export type HubContextQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    nameID: string;
    displayName: string;
    tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
    context?:
      | {
          __typename?: 'Context';
          id: string;
          tagline?: string | undefined;
          background?: string | undefined;
          vision?: string | undefined;
          impact?: string | undefined;
          who?: string | undefined;
          location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
          visuals?:
            | Array<{
                __typename?: 'Visual';
                id: string;
                uri: string;
                name: string;
                allowedTypes: Array<string>;
                aspectRatio: number;
                maxHeight: number;
                maxWidth: number;
                minHeight: number;
                minWidth: number;
              }>
            | undefined;
        }
      | undefined;
    activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
  };
};

export type ChallengeContextQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
  challengeNameId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeContextQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    nameID: string;
    displayName: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      nameID: string;
      displayName: string;
      authorization?:
        | { __typename?: 'Authorization'; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
      tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
      lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined; machineDef: string } | undefined;
      context?:
        | {
            __typename?: 'Context';
            id: string;
            tagline?: string | undefined;
            background?: string | undefined;
            vision?: string | undefined;
            impact?: string | undefined;
            who?: string | undefined;
            location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
            visuals?:
              | Array<{
                  __typename?: 'Visual';
                  id: string;
                  uri: string;
                  name: string;
                  allowedTypes: Array<string>;
                  aspectRatio: number;
                  maxHeight: number;
                  maxWidth: number;
                  minHeight: number;
                  minWidth: number;
                }>
              | undefined;
          }
        | undefined;
      activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
    };
  };
};

export type OpportunityContextQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
  opportunityNameId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityContextQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    nameID: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      nameID: string;
      displayName: string;
      tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
      lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined; machineDef: string } | undefined;
      context?:
        | {
            __typename?: 'Context';
            id: string;
            tagline?: string | undefined;
            background?: string | undefined;
            vision?: string | undefined;
            impact?: string | undefined;
            who?: string | undefined;
            location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
            visuals?:
              | Array<{
                  __typename?: 'Visual';
                  id: string;
                  uri: string;
                  name: string;
                  allowedTypes: Array<string>;
                  aspectRatio: number;
                  maxHeight: number;
                  maxWidth: number;
                  minHeight: number;
                  minWidth: number;
                }>
              | undefined;
          }
        | undefined;
      activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
    };
  };
};

export type ContextTabFragment = {
  __typename?: 'Context';
  id: string;
  tagline?: string | undefined;
  background?: string | undefined;
  vision?: string | undefined;
  impact?: string | undefined;
  who?: string | undefined;
  location?: { __typename?: 'Location'; id: string; city: string; country: string } | undefined;
  visuals?:
    | Array<{
        __typename?: 'Visual';
        id: string;
        uri: string;
        name: string;
        allowedTypes: Array<string>;
        aspectRatio: number;
        maxHeight: number;
        maxWidth: number;
        minHeight: number;
        minWidth: number;
      }>
    | undefined;
};

export type LifecycleContextTabFragment = {
  __typename?: 'Lifecycle';
  id: string;
  state?: string | undefined;
  machineDef: string;
};

export type ActivityItemFragment = { __typename?: 'NVP'; id: string; name: string; value: string };

export type CommunityFeedbackTemplatesQueryVariables = Exact<{ [key: string]: never }>;

export type CommunityFeedbackTemplatesQuery = {
  __typename?: 'Query';
  configuration: {
    __typename?: 'Config';
    template: {
      __typename?: 'Template';
      challenges: Array<{
        __typename?: 'ChallengeTemplate';
        feedback?:
          | Array<{
              __typename?: 'FeedbackTemplate';
              name: string;
              questions: Array<{
                __typename?: 'QuestionTemplate';
                question: string;
                required: boolean;
                sortOrder?: number | undefined;
              }>;
            }>
          | undefined;
      }>;
    };
  };
};

export type CreateFeedbackOnCommunityContextMutationVariables = Exact<{
  feedbackData: CreateFeedbackOnCommunityContextInput;
}>;

export type CreateFeedbackOnCommunityContextMutation = {
  __typename?: 'Mutation';
  createFeedbackOnCommunityContext: boolean;
};

export type DiscussionDetailsFragment = {
  __typename?: 'Discussion';
  id: string;
  title: string;
  description: string;
  createdBy: string;
  timestamp?: number | undefined;
  category: DiscussionCategory;
  commentsCount: number;
  authorization?:
    | { __typename?: 'Authorization'; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
};

export type DiscussionDetailsNoAuthFragment = {
  __typename?: 'Discussion';
  id: string;
  title: string;
  description: string;
  createdBy: string;
  timestamp?: number | undefined;
  category: DiscussionCategory;
  commentsCount: number;
};

export type CommunityDiscussionQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  communityId: Scalars['UUID'];
  discussionId: Scalars['String'];
}>;

export type CommunityDiscussionQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    community?:
      | {
          __typename?: 'Community';
          id: string;
          communication?:
            | {
                __typename?: 'Communication';
                id: string;
                authorization?:
                  | { __typename?: 'Authorization'; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
                  | undefined;
                discussion?:
                  | {
                      __typename?: 'Discussion';
                      id: string;
                      title: string;
                      description: string;
                      createdBy: string;
                      timestamp?: number | undefined;
                      category: DiscussionCategory;
                      commentsCount: number;
                      messages?:
                        | Array<{
                            __typename?: 'Message';
                            id: string;
                            sender: string;
                            message: string;
                            timestamp: number;
                          }>
                        | undefined;
                      authorization?:
                        | { __typename?: 'Authorization'; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
                        | undefined;
                    }
                  | undefined;
              }
            | undefined;
        }
      | undefined;
  };
};

export type CommunityDiscussionListQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  communityId: Scalars['UUID'];
}>;

export type CommunityDiscussionListQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    community?:
      | {
          __typename?: 'Community';
          id: string;
          communication?:
            | {
                __typename?: 'Communication';
                id: string;
                authorization?:
                  | { __typename?: 'Authorization'; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
                  | undefined;
                discussions?:
                  | Array<{
                      __typename?: 'Discussion';
                      id: string;
                      title: string;
                      description: string;
                      createdBy: string;
                      timestamp?: number | undefined;
                      category: DiscussionCategory;
                      commentsCount: number;
                    }>
                  | undefined;
              }
            | undefined;
        }
      | undefined;
  };
};

export type PostDiscussionCommentMutationVariables = Exact<{
  input: DiscussionSendMessageInput;
}>;

export type PostDiscussionCommentMutation = {
  __typename?: 'Mutation';
  sendMessageToDiscussion: { __typename?: 'Message'; id: string; sender: string; message: string; timestamp: number };
};

export type CreateDiscussionMutationVariables = Exact<{
  input: CommunicationCreateDiscussionInput;
}>;

export type CreateDiscussionMutation = {
  __typename?: 'Mutation';
  createDiscussion: {
    __typename?: 'Discussion';
    id: string;
    title: string;
    description: string;
    createdBy: string;
    timestamp?: number | undefined;
    category: DiscussionCategory;
    commentsCount: number;
    authorization?:
      | { __typename?: 'Authorization'; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
  };
};

export type CommunicationDiscussionMessageReceivedSubscriptionVariables = Exact<{
  discussionID: Scalars['UUID'];
}>;

export type CommunicationDiscussionMessageReceivedSubscription = {
  __typename?: 'Subscription';
  communicationDiscussionMessageReceived: {
    __typename?: 'CommunicationDiscussionMessageReceived';
    discussionID: string;
    message: { __typename?: 'Message'; id: string; sender: string; message: string; timestamp: number };
  };
};

export type CommunicationDiscussionUpdatedSubscriptionVariables = Exact<{
  communicationID: Scalars['UUID'];
}>;

export type CommunicationDiscussionUpdatedSubscription = {
  __typename?: 'Subscription';
  communicationDiscussionUpdated: {
    __typename?: 'Discussion';
    id: string;
    title: string;
    description: string;
    createdBy: string;
    timestamp?: number | undefined;
    category: DiscussionCategory;
    commentsCount: number;
  };
};

export type HubPageQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type HubPageQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    nameID: string;
    displayName: string;
    activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
    authorization?:
      | {
          __typename?: 'Authorization';
          id: string;
          anonymousReadAccess: boolean;
          myPrivileges?: Array<AuthorizationPrivilege> | undefined;
        }
      | undefined;
    host?:
      | {
          __typename?: 'Organization';
          id: string;
          displayName: string;
          nameID: string;
          profile: {
            __typename?: 'Profile';
            id: string;
            description?: string | undefined;
            avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          };
          verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
          activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
        }
      | undefined;
    context?:
      | {
          __typename?: 'Context';
          id: string;
          tagline?: string | undefined;
          vision?: string | undefined;
          visuals?: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }> | undefined;
          authorization?:
            | {
                __typename?: 'Authorization';
                id: string;
                anonymousReadAccess: boolean;
                myPrivileges?: Array<AuthorizationPrivilege> | undefined;
              }
            | undefined;
        }
      | undefined;
    collaboration?:
      | {
          __typename?: 'Collaboration';
          id: string;
          callouts?:
            | Array<{
                __typename?: 'Callout';
                id: string;
                nameID: string;
                type: CalloutType;
                visibility: CalloutVisibility;
                aspects?:
                  | Array<{
                      __typename?: 'Aspect';
                      id: string;
                      nameID: string;
                      displayName: string;
                      type: string;
                      description: string;
                      banner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                      bannerNarrow?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                      tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
                    }>
                  | undefined;
                canvases?:
                  | Array<{
                      __typename?: 'Canvas';
                      id: string;
                      nameID: string;
                      displayName: string;
                      authorization?:
                        | {
                            __typename?: 'Authorization';
                            id: string;
                            myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                            anonymousReadAccess: boolean;
                          }
                        | undefined;
                      checkout?:
                        | {
                            __typename?: 'CanvasCheckout';
                            id: string;
                            lockedBy: string;
                            status: CanvasCheckoutStateEnum;
                            lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
                            authorization?:
                              | {
                                  __typename?: 'Authorization';
                                  id: string;
                                  myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                                }
                              | undefined;
                          }
                        | undefined;
                      preview?:
                        | {
                            __typename?: 'Visual';
                            id: string;
                            uri: string;
                            name: string;
                            allowedTypes: Array<string>;
                            aspectRatio: number;
                            maxHeight: number;
                            maxWidth: number;
                            minHeight: number;
                            minWidth: number;
                          }
                        | undefined;
                    }>
                  | undefined;
              }>
            | undefined;
        }
      | undefined;
    community?:
      | {
          __typename?: 'Community';
          id: string;
          leadUsers?:
            | Array<{
                __typename?: 'User';
                id: string;
                displayName: string;
                nameID: string;
                profile?:
                  | {
                      __typename?: 'Profile';
                      id: string;
                      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                      location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
                      tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
                    }
                  | undefined;
              }>
            | undefined;
          memberUsers?:
            | Array<{
                __typename?: 'User';
                id: string;
                displayName: string;
                nameID: string;
                profile?:
                  | {
                      __typename?: 'Profile';
                      id: string;
                      location?: { __typename?: 'Location'; city: string; country: string } | undefined;
                      avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                      tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
                    }
                  | undefined;
              }>
            | undefined;
          leadOrganizations?:
            | Array<{
                __typename?: 'Organization';
                id: string;
                displayName: string;
                nameID: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  description?: string | undefined;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                };
                verification: {
                  __typename?: 'OrganizationVerification';
                  id: string;
                  status: OrganizationVerificationEnum;
                };
                activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
              }>
            | undefined;
          memberOrganizations?:
            | Array<{
                __typename?: 'Organization';
                id: string;
                displayName: string;
                nameID: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                };
              }>
            | undefined;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
        }
      | undefined;
    challenges?:
      | Array<{
          __typename?: 'Challenge';
          id: string;
          displayName: string;
          nameID: string;
          activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
          context?:
            | {
                __typename?: 'Context';
                id: string;
                tagline?: string | undefined;
                visuals?: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }> | undefined;
              }
            | undefined;
          tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
        }>
      | undefined;
    tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
  };
};

export type HubDashboardReferencesQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type HubDashboardReferencesQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    context?:
      | {
          __typename?: 'Context';
          id: string;
          references?:
            | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
            | undefined;
        }
      | undefined;
  };
};

export type HubPageFragment = {
  __typename?: 'Hub';
  id: string;
  nameID: string;
  displayName: string;
  activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
  authorization?:
    | {
        __typename?: 'Authorization';
        id: string;
        anonymousReadAccess: boolean;
        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
      }
    | undefined;
  host?:
    | {
        __typename?: 'Organization';
        id: string;
        displayName: string;
        nameID: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          description?: string | undefined;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        };
        verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
        activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
      }
    | undefined;
  context?:
    | {
        __typename?: 'Context';
        id: string;
        tagline?: string | undefined;
        vision?: string | undefined;
        visuals?: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }> | undefined;
        authorization?:
          | {
              __typename?: 'Authorization';
              id: string;
              anonymousReadAccess: boolean;
              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
            }
          | undefined;
      }
    | undefined;
  collaboration?:
    | {
        __typename?: 'Collaboration';
        id: string;
        callouts?:
          | Array<{
              __typename?: 'Callout';
              id: string;
              nameID: string;
              type: CalloutType;
              visibility: CalloutVisibility;
              aspects?:
                | Array<{
                    __typename?: 'Aspect';
                    id: string;
                    nameID: string;
                    displayName: string;
                    type: string;
                    description: string;
                    banner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    bannerNarrow?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
                  }>
                | undefined;
              canvases?:
                | Array<{
                    __typename?: 'Canvas';
                    id: string;
                    nameID: string;
                    displayName: string;
                    authorization?:
                      | {
                          __typename?: 'Authorization';
                          id: string;
                          myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                          anonymousReadAccess: boolean;
                        }
                      | undefined;
                    checkout?:
                      | {
                          __typename?: 'CanvasCheckout';
                          id: string;
                          lockedBy: string;
                          status: CanvasCheckoutStateEnum;
                          lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
                          authorization?:
                            | {
                                __typename?: 'Authorization';
                                id: string;
                                myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                              }
                            | undefined;
                        }
                      | undefined;
                    preview?:
                      | {
                          __typename?: 'Visual';
                          id: string;
                          uri: string;
                          name: string;
                          allowedTypes: Array<string>;
                          aspectRatio: number;
                          maxHeight: number;
                          maxWidth: number;
                          minHeight: number;
                          minWidth: number;
                        }
                      | undefined;
                  }>
                | undefined;
            }>
          | undefined;
      }
    | undefined;
  community?:
    | {
        __typename?: 'Community';
        id: string;
        leadUsers?:
          | Array<{
              __typename?: 'User';
              id: string;
              displayName: string;
              nameID: string;
              profile?:
                | {
                    __typename?: 'Profile';
                    id: string;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
                    tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
                  }
                | undefined;
            }>
          | undefined;
        memberUsers?:
          | Array<{
              __typename?: 'User';
              id: string;
              displayName: string;
              nameID: string;
              profile?:
                | {
                    __typename?: 'Profile';
                    id: string;
                    location?: { __typename?: 'Location'; city: string; country: string } | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                    tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
                  }
                | undefined;
            }>
          | undefined;
        leadOrganizations?:
          | Array<{
              __typename?: 'Organization';
              id: string;
              displayName: string;
              nameID: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                description?: string | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
              verification: {
                __typename?: 'OrganizationVerification';
                id: string;
                status: OrganizationVerificationEnum;
              };
              activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
            }>
          | undefined;
        memberOrganizations?:
          | Array<{
              __typename?: 'Organization';
              id: string;
              displayName: string;
              nameID: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
            }>
          | undefined;
        authorization?:
          | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
          | undefined;
      }
    | undefined;
  challenges?:
    | Array<{
        __typename?: 'Challenge';
        id: string;
        displayName: string;
        nameID: string;
        activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
        context?:
          | {
              __typename?: 'Context';
              id: string;
              tagline?: string | undefined;
              visuals?: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }> | undefined;
            }
          | undefined;
        tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
      }>
    | undefined;
  tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
};

export type AssignUserAsOpportunityAdminMutationVariables = Exact<{
  input: AssignOpportunityAdminInput;
}>;

export type AssignUserAsOpportunityAdminMutation = {
  __typename?: 'Mutation';
  assignUserAsOpportunityAdmin: { __typename?: 'User'; id: string; displayName: string };
};

export type RemoveUserAsOpportunityAdminMutationVariables = Exact<{
  input: RemoveOpportunityAdminInput;
}>;

export type RemoveUserAsOpportunityAdminMutation = {
  __typename?: 'Mutation';
  removeUserAsOpportunityAdmin: { __typename?: 'User'; id: string; displayName: string };
};

export type OpportunityPageQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityPageQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      nameID: string;
      displayName: string;
      tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
      activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
      lifecycle?:
        | {
            __typename?: 'Lifecycle';
            id: string;
            machineDef: string;
            state?: string | undefined;
            nextEvents?: Array<string> | undefined;
            stateIsFinal: boolean;
          }
        | undefined;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            relations?:
              | Array<{
                  __typename?: 'Relation';
                  id: string;
                  type: string;
                  actorRole: string;
                  actorName: string;
                  actorType: string;
                  description: string;
                }>
              | undefined;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  nameID: string;
                  type: CalloutType;
                  visibility: CalloutVisibility;
                  aspects?:
                    | Array<{
                        __typename?: 'Aspect';
                        id: string;
                        nameID: string;
                        displayName: string;
                        type: string;
                        description: string;
                        banner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                        bannerNarrow?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                        tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
                      }>
                    | undefined;
                  canvases?:
                    | Array<{
                        __typename?: 'Canvas';
                        id: string;
                        nameID: string;
                        displayName: string;
                        authorization?:
                          | {
                              __typename?: 'Authorization';
                              id: string;
                              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                              anonymousReadAccess: boolean;
                            }
                          | undefined;
                        checkout?:
                          | {
                              __typename?: 'CanvasCheckout';
                              id: string;
                              lockedBy: string;
                              status: CanvasCheckoutStateEnum;
                              lifecycle: {
                                __typename?: 'Lifecycle';
                                id: string;
                                nextEvents?: Array<string> | undefined;
                              };
                              authorization?:
                                | {
                                    __typename?: 'Authorization';
                                    id: string;
                                    myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                                  }
                                | undefined;
                            }
                          | undefined;
                        preview?:
                          | {
                              __typename?: 'Visual';
                              id: string;
                              uri: string;
                              name: string;
                              allowedTypes: Array<string>;
                              aspectRatio: number;
                              maxHeight: number;
                              maxWidth: number;
                              minHeight: number;
                              minWidth: number;
                            }
                          | undefined;
                      }>
                    | undefined;
                }>
              | undefined;
          }
        | undefined;
      context?:
        | {
            __typename?: 'Context';
            id: string;
            tagline?: string | undefined;
            vision?: string | undefined;
            authorization?:
              | {
                  __typename?: 'Authorization';
                  id: string;
                  anonymousReadAccess: boolean;
                  myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                }
              | undefined;
            references?:
              | Array<{ __typename?: 'Reference'; id: string; name: string; description: string; uri: string }>
              | undefined;
            visuals?: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }> | undefined;
          }
        | undefined;
      community?:
        | {
            __typename?: 'Community';
            id: string;
            leadUsers?:
              | Array<{
                  __typename?: 'User';
                  id: string;
                  displayName: string;
                  nameID: string;
                  profile?:
                    | {
                        __typename?: 'Profile';
                        id: string;
                        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                        location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
                        tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
                      }
                    | undefined;
                }>
              | undefined;
            memberUsers?:
              | Array<{
                  __typename?: 'User';
                  id: string;
                  displayName: string;
                  nameID: string;
                  profile?:
                    | {
                        __typename?: 'Profile';
                        id: string;
                        location?: { __typename?: 'Location'; city: string; country: string } | undefined;
                        avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                        tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
                      }
                    | undefined;
                }>
              | undefined;
            leadOrganizations?:
              | Array<{
                  __typename?: 'Organization';
                  id: string;
                  displayName: string;
                  nameID: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    description?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  };
                  verification: {
                    __typename?: 'OrganizationVerification';
                    id: string;
                    status: OrganizationVerificationEnum;
                  };
                  activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
                }>
              | undefined;
            memberOrganizations?:
              | Array<{
                  __typename?: 'Organization';
                  id: string;
                  displayName: string;
                  nameID: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  };
                }>
              | undefined;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
          }
        | undefined;
    };
  };
};

export type OpportunityPageFragment = {
  __typename?: 'Opportunity';
  id: string;
  nameID: string;
  displayName: string;
  tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
  activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
  lifecycle?:
    | {
        __typename?: 'Lifecycle';
        id: string;
        machineDef: string;
        state?: string | undefined;
        nextEvents?: Array<string> | undefined;
        stateIsFinal: boolean;
      }
    | undefined;
  collaboration?:
    | {
        __typename?: 'Collaboration';
        id: string;
        relations?:
          | Array<{
              __typename?: 'Relation';
              id: string;
              type: string;
              actorRole: string;
              actorName: string;
              actorType: string;
              description: string;
            }>
          | undefined;
        callouts?:
          | Array<{
              __typename?: 'Callout';
              id: string;
              nameID: string;
              type: CalloutType;
              visibility: CalloutVisibility;
              aspects?:
                | Array<{
                    __typename?: 'Aspect';
                    id: string;
                    nameID: string;
                    displayName: string;
                    type: string;
                    description: string;
                    banner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    bannerNarrow?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
                  }>
                | undefined;
              canvases?:
                | Array<{
                    __typename?: 'Canvas';
                    id: string;
                    nameID: string;
                    displayName: string;
                    authorization?:
                      | {
                          __typename?: 'Authorization';
                          id: string;
                          myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                          anonymousReadAccess: boolean;
                        }
                      | undefined;
                    checkout?:
                      | {
                          __typename?: 'CanvasCheckout';
                          id: string;
                          lockedBy: string;
                          status: CanvasCheckoutStateEnum;
                          lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
                          authorization?:
                            | {
                                __typename?: 'Authorization';
                                id: string;
                                myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                              }
                            | undefined;
                        }
                      | undefined;
                    preview?:
                      | {
                          __typename?: 'Visual';
                          id: string;
                          uri: string;
                          name: string;
                          allowedTypes: Array<string>;
                          aspectRatio: number;
                          maxHeight: number;
                          maxWidth: number;
                          minHeight: number;
                          minWidth: number;
                        }
                      | undefined;
                  }>
                | undefined;
            }>
          | undefined;
      }
    | undefined;
  context?:
    | {
        __typename?: 'Context';
        id: string;
        tagline?: string | undefined;
        vision?: string | undefined;
        authorization?:
          | {
              __typename?: 'Authorization';
              id: string;
              anonymousReadAccess: boolean;
              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
            }
          | undefined;
        references?:
          | Array<{ __typename?: 'Reference'; id: string; name: string; description: string; uri: string }>
          | undefined;
        visuals?: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }> | undefined;
      }
    | undefined;
  community?:
    | {
        __typename?: 'Community';
        id: string;
        leadUsers?:
          | Array<{
              __typename?: 'User';
              id: string;
              displayName: string;
              nameID: string;
              profile?:
                | {
                    __typename?: 'Profile';
                    id: string;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
                    tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
                  }
                | undefined;
            }>
          | undefined;
        memberUsers?:
          | Array<{
              __typename?: 'User';
              id: string;
              displayName: string;
              nameID: string;
              profile?:
                | {
                    __typename?: 'Profile';
                    id: string;
                    location?: { __typename?: 'Location'; city: string; country: string } | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
                    tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
                  }
                | undefined;
            }>
          | undefined;
        leadOrganizations?:
          | Array<{
              __typename?: 'Organization';
              id: string;
              displayName: string;
              nameID: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                description?: string | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
              verification: {
                __typename?: 'OrganizationVerification';
                id: string;
                status: OrganizationVerificationEnum;
              };
              activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
            }>
          | undefined;
        memberOrganizations?:
          | Array<{
              __typename?: 'Organization';
              id: string;
              displayName: string;
              nameID: string;
              profile: {
                __typename?: 'Profile';
                id: string;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              };
            }>
          | undefined;
        authorization?:
          | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
          | undefined;
      }
    | undefined;
};

export type OpportunityPageRelationsFragment = {
  __typename?: 'Relation';
  id: string;
  type: string;
  actorRole: string;
  actorName: string;
  actorType: string;
  description: string;
};

export type EventOnOpportunityMutationVariables = Exact<{
  opportunityId: Scalars['UUID'];
  eventName: Scalars['String'];
}>;

export type EventOnOpportunityMutation = {
  __typename?: 'Mutation';
  eventOnOpportunity: {
    __typename?: 'Opportunity';
    id: string;
    lifecycle?:
      | { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined; state?: string | undefined }
      | undefined;
  };
};

export type AssignUserToOrganizationMutationVariables = Exact<{
  input: AssignOrganizationMemberInput;
}>;

export type AssignUserToOrganizationMutation = {
  __typename?: 'Mutation';
  assignUserToOrganization: { __typename?: 'Organization'; id: string; displayName: string };
};

export type RemoveUserFromOrganizationMutationVariables = Exact<{
  input: RemoveOrganizationMemberInput;
}>;

export type RemoveUserFromOrganizationMutation = {
  __typename?: 'Mutation';
  removeUserFromOrganization: { __typename?: 'Organization'; id: string; displayName: string };
};

export type AssignUserAsOrganizationAdminMutationVariables = Exact<{
  input: AssignOrganizationAdminInput;
}>;

export type AssignUserAsOrganizationAdminMutation = {
  __typename?: 'Mutation';
  assignUserAsOrganizationAdmin: { __typename?: 'User'; id: string; displayName: string };
};

export type RemoveUserAsOrganizationAdminMutationVariables = Exact<{
  input: RemoveOrganizationAdminInput;
}>;

export type RemoveUserAsOrganizationAdminMutation = {
  __typename?: 'Mutation';
  removeUserAsOrganizationAdmin: { __typename?: 'User'; id: string; displayName: string };
};

export type OrganizationMembersQueryVariables = Exact<{
  id: Scalars['UUID_NAMEID'];
}>;

export type OrganizationMembersQuery = {
  __typename?: 'Query';
  organization: {
    __typename?: 'Organization';
    id: string;
    members?:
      | Array<{
          __typename?: 'User';
          id: string;
          displayName: string;
          firstName: string;
          lastName: string;
          email: string;
        }>
      | undefined;
  };
};

export type ChallengePreferencesQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengePreferencesQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      preferences: Array<{
        __typename?: 'Preference';
        id: string;
        value: string;
        definition: {
          __typename?: 'PreferenceDefinition';
          id: string;
          description: string;
          displayName: string;
          group: string;
          type: PreferenceType;
          valueType: PreferenceValueType;
        };
      }>;
    };
  };
};

export type UpdatePreferenceOnChallengeMutationVariables = Exact<{
  preferenceData: UpdateChallengePreferenceInput;
}>;

export type UpdatePreferenceOnChallengeMutation = {
  __typename?: 'Mutation';
  updatePreferenceOnChallenge: { __typename?: 'Preference'; id: string; value: string };
};

export type OrganizationPreferencesQueryVariables = Exact<{
  orgId: Scalars['UUID_NAMEID'];
}>;

export type OrganizationPreferencesQuery = {
  __typename?: 'Query';
  organization: {
    __typename?: 'Organization';
    id: string;
    preferences: Array<{
      __typename?: 'Preference';
      id: string;
      value: string;
      definition: {
        __typename?: 'PreferenceDefinition';
        id: string;
        description: string;
        displayName: string;
        group: string;
        type: PreferenceType;
        valueType: PreferenceValueType;
      };
    }>;
  };
};

export type UpdatePreferenceOnOrganizationMutationVariables = Exact<{
  preferenceData: UpdateOrganizationPreferenceInput;
}>;

export type UpdatePreferenceOnOrganizationMutation = {
  __typename?: 'Mutation';
  updatePreferenceOnOrganization: { __typename?: 'Preference'; id: string; value: string };
};

export type GetSupportedCredentialMetadataQueryVariables = Exact<{ [key: string]: never }>;

export type GetSupportedCredentialMetadataQuery = {
  __typename?: 'Query';
  getSupportedVerifiedCredentialMetadata: Array<{
    __typename?: 'CredentialMetadataOutput';
    name: string;
    description: string;
    schema: string;
    types: Array<string>;
    uniqueType: string;
    context: string;
  }>;
};

export type BeginCredentialRequestInteractionMutationVariables = Exact<{
  types: Array<Scalars['String']> | Scalars['String'];
}>;

export type BeginCredentialRequestInteractionMutation = {
  __typename?: 'Mutation';
  beginVerifiedCredentialRequestInteraction: {
    __typename?: 'AgentBeginVerifiedCredentialRequestOutput';
    qrCodeImg: string;
    jwt: string;
  };
};

export type BeginAlkemioUserCredentialOfferInteractionMutationVariables = Exact<{ [key: string]: never }>;

export type BeginAlkemioUserCredentialOfferInteractionMutation = {
  __typename?: 'Mutation';
  beginAlkemioUserVerifiedCredentialOfferInteraction: {
    __typename?: 'AgentBeginVerifiedCredentialOfferOutput';
    jwt: string;
    qrCodeImg: string;
  };
};

export type BeginCommunityMemberCredentialOfferInteractionMutationVariables = Exact<{
  communityID: Scalars['String'];
}>;

export type BeginCommunityMemberCredentialOfferInteractionMutation = {
  __typename?: 'Mutation';
  beginCommunityMemberVerifiedCredentialOfferInteraction: {
    __typename?: 'AgentBeginVerifiedCredentialOfferOutput';
    jwt: string;
    qrCodeImg: string;
  };
};

export type UserAgentSsiFragment = {
  __typename?: 'User';
  id: string;
  nameID: string;
  agent?:
    | {
        __typename?: 'Agent';
        id: string;
        did?: string | undefined;
        credentials?:
          | Array<{ __typename?: 'Credential'; id: string; resourceID: string; type: AuthorizationCredential }>
          | undefined;
        verifiedCredentials?:
          | Array<{
              __typename?: 'VerifiedCredential';
              context: string;
              issued: string;
              expires: string;
              issuer: string;
              name: string;
              type: string;
              claims: Array<{ __typename?: 'VerifiedCredentialClaim'; name: string; value: string }>;
            }>
          | undefined;
      }
    | undefined;
};

export type UserSsiQueryVariables = Exact<{ [key: string]: never }>;

export type UserSsiQuery = {
  __typename?: 'Query';
  me: {
    __typename?: 'User';
    id: string;
    nameID: string;
    agent?:
      | {
          __typename?: 'Agent';
          id: string;
          did?: string | undefined;
          credentials?:
            | Array<{ __typename?: 'Credential'; id: string; resourceID: string; type: AuthorizationCredential }>
            | undefined;
          verifiedCredentials?:
            | Array<{
                __typename?: 'VerifiedCredential';
                context: string;
                issued: string;
                expires: string;
                issuer: string;
                name: string;
                type: string;
                claims: Array<{ __typename?: 'VerifiedCredentialClaim'; name: string; value: string }>;
              }>
            | undefined;
        }
      | undefined;
  };
};

export type UserCardsContainerQueryVariables = Exact<{
  ids: Array<Scalars['UUID_NAMEID_EMAIL']> | Scalars['UUID_NAMEID_EMAIL'];
}>;

export type UserCardsContainerQuery = {
  __typename?: 'Query';
  usersById: Array<{
    __typename?: 'User';
    id: string;
    nameID: string;
    displayName: string;
    profile?:
      | {
          __typename?: 'Profile';
          id: string;
          location?: { __typename?: 'Location'; city: string; country: string } | undefined;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          tagsets?: Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }> | undefined;
        }
      | undefined;
    agent?:
      | {
          __typename?: 'Agent';
          id: string;
          credentials?:
            | Array<{ __typename?: 'Credential'; id: string; resourceID: string; type: AuthorizationCredential }>
            | undefined;
        }
      | undefined;
  }>;
};

export type MyPrivilegesFragment = {
  __typename?: 'Authorization';
  myPrivileges?: Array<AuthorizationPrivilege> | undefined;
};

export type AssignUserAsChallengeAdminMutationVariables = Exact<{
  input: AssignChallengeAdminInput;
}>;

export type AssignUserAsChallengeAdminMutation = {
  __typename?: 'Mutation';
  assignUserAsChallengeAdmin: { __typename?: 'User'; id: string; displayName: string };
};

export type AssignUserAsGlobalAdminMutationVariables = Exact<{
  input: AssignGlobalAdminInput;
}>;

export type AssignUserAsGlobalAdminMutation = {
  __typename?: 'Mutation';
  assignUserAsGlobalAdmin: { __typename?: 'User'; id: string; displayName: string };
};

export type AssignUserAsGlobalCommunityAdminMutationVariables = Exact<{
  input: AssignGlobalCommunityAdminInput;
}>;

export type AssignUserAsGlobalCommunityAdminMutation = {
  __typename?: 'Mutation';
  assignUserAsGlobalCommunityAdmin: { __typename?: 'User'; id: string; displayName: string };
};

export type AssignUserAsHubAdminMutationVariables = Exact<{
  input: AssignHubAdminInput;
}>;

export type AssignUserAsHubAdminMutation = {
  __typename?: 'Mutation';
  assignUserAsHubAdmin: { __typename?: 'User'; id: string; displayName: string };
};

export type AssignUserAsOrganizationOwnerMutationVariables = Exact<{
  input: AssignOrganizationOwnerInput;
}>;

export type AssignUserAsOrganizationOwnerMutation = {
  __typename?: 'Mutation';
  assignUserAsOrganizationOwner: { __typename?: 'User'; id: string; displayName: string };
};

export type RemoveUserAsChallengeAdminMutationVariables = Exact<{
  input: RemoveChallengeAdminInput;
}>;

export type RemoveUserAsChallengeAdminMutation = {
  __typename?: 'Mutation';
  removeUserAsChallengeAdmin: { __typename?: 'User'; id: string; displayName: string };
};

export type RemoveUserAsGlobalAdminMutationVariables = Exact<{
  input: RemoveGlobalAdminInput;
}>;

export type RemoveUserAsGlobalAdminMutation = {
  __typename?: 'Mutation';
  removeUserAsGlobalAdmin: { __typename?: 'User'; id: string; displayName: string };
};

export type RemoveUserAsGlobalCommunityAdminMutationVariables = Exact<{
  input: RemoveGlobalCommunityAdminInput;
}>;

export type RemoveUserAsGlobalCommunityAdminMutation = {
  __typename?: 'Mutation';
  removeUserAsGlobalCommunityAdmin: { __typename?: 'User'; id: string; displayName: string };
};

export type RemoveUserAsHubAdminMutationVariables = Exact<{
  input: RemoveHubAdminInput;
}>;

export type RemoveUserAsHubAdminMutation = {
  __typename?: 'Mutation';
  removeUserAsHubAdmin: { __typename?: 'User'; id: string; displayName: string };
};

export type RemoveUserAsOrganizationOwnerMutationVariables = Exact<{
  input: RemoveOrganizationOwnerInput;
}>;

export type RemoveUserAsOrganizationOwnerMutation = {
  __typename?: 'Mutation';
  removeUserAsOrganizationOwner: { __typename?: 'User'; id: string; displayName: string };
};

export type ChallengeApplicationsQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeApplicationsQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      community?:
        | {
            __typename?: 'Community';
            id: string;
            applications?:
              | Array<{
                  __typename?: 'Application';
                  id: string;
                  createdDate: Date;
                  updatedDate: Date;
                  lifecycle: {
                    __typename?: 'Lifecycle';
                    id: string;
                    state?: string | undefined;
                    nextEvents?: Array<string> | undefined;
                  };
                  user: {
                    __typename?: 'User';
                    id: string;
                    displayName: string;
                    email: string;
                    profile?:
                      | {
                          __typename?: 'Profile';
                          id: string;
                          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                        }
                      | undefined;
                  };
                  questions: Array<{ __typename?: 'Question'; id: string; name: string; value: string }>;
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type HubAvailableLeadUsersQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<UserFilterInput>;
}>;

export type HubAvailableLeadUsersQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    community?:
      | {
          __typename?: 'Community';
          id: string;
          availableLeadUsers?:
            | {
                __typename?: 'PaginatedUsers';
                users: Array<{ __typename?: 'User'; id: string; displayName: string; email: string }>;
                pageInfo: {
                  __typename?: 'PageInfo';
                  startCursor?: string | undefined;
                  endCursor?: string | undefined;
                  hasNextPage: boolean;
                };
              }
            | undefined;
        }
      | undefined;
  };
};

export type HubAvailableMemberUsersQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<UserFilterInput>;
}>;

export type HubAvailableMemberUsersQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    community?:
      | {
          __typename?: 'Community';
          id: string;
          availableMemberUsers?:
            | {
                __typename?: 'PaginatedUsers';
                users: Array<{ __typename?: 'User'; id: string; displayName: string; email: string }>;
                pageInfo: {
                  __typename?: 'PageInfo';
                  startCursor?: string | undefined;
                  endCursor?: string | undefined;
                  hasNextPage: boolean;
                };
              }
            | undefined;
        }
      | undefined;
  };
};

export type ChallengeAvailableLeadUsersQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<UserFilterInput>;
}>;

export type ChallengeAvailableLeadUsersQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    challenge: {
      __typename?: 'Challenge';
      community?:
        | {
            __typename?: 'Community';
            id: string;
            availableLeadUsers?:
              | {
                  __typename?: 'PaginatedUsers';
                  users: Array<{ __typename?: 'User'; id: string; displayName: string; email: string }>;
                  pageInfo: {
                    __typename?: 'PageInfo';
                    startCursor?: string | undefined;
                    endCursor?: string | undefined;
                    hasNextPage: boolean;
                  };
                }
              | undefined;
          }
        | undefined;
    };
  };
};

export type ChallengeAvailableMemberUsersQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<UserFilterInput>;
}>;

export type ChallengeAvailableMemberUsersQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    challenge: {
      __typename?: 'Challenge';
      community?:
        | {
            __typename?: 'Community';
            id: string;
            availableMemberUsers?:
              | {
                  __typename?: 'PaginatedUsers';
                  users: Array<{ __typename?: 'User'; id: string; displayName: string; email: string }>;
                  pageInfo: {
                    __typename?: 'PageInfo';
                    startCursor?: string | undefined;
                    endCursor?: string | undefined;
                    hasNextPage: boolean;
                  };
                }
              | undefined;
          }
        | undefined;
    };
  };
};

export type OpportunityAvailableLeadUsersQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<UserFilterInput>;
}>;

export type OpportunityAvailableLeadUsersQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    opportunity: {
      __typename?: 'Opportunity';
      community?:
        | {
            __typename?: 'Community';
            id: string;
            availableLeadUsers?:
              | {
                  __typename?: 'PaginatedUsers';
                  users: Array<{ __typename?: 'User'; id: string; displayName: string; email: string }>;
                  pageInfo: {
                    __typename?: 'PageInfo';
                    startCursor?: string | undefined;
                    endCursor?: string | undefined;
                    hasNextPage: boolean;
                  };
                }
              | undefined;
          }
        | undefined;
    };
  };
};

export type OpportunityAvailableMemberUsersQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<UserFilterInput>;
}>;

export type OpportunityAvailableMemberUsersQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    opportunity: {
      __typename?: 'Opportunity';
      community?:
        | {
            __typename?: 'Community';
            id: string;
            availableMemberUsers?:
              | {
                  __typename?: 'PaginatedUsers';
                  users: Array<{ __typename?: 'User'; id: string; displayName: string; email: string }>;
                  pageInfo: {
                    __typename?: 'PageInfo';
                    startCursor?: string | undefined;
                    endCursor?: string | undefined;
                    hasNextPage: boolean;
                  };
                }
              | undefined;
          }
        | undefined;
    };
  };
};

export type CommunityAvailableLeadUsersFragment = {
  __typename?: 'Community';
  id: string;
  availableLeadUsers?:
    | {
        __typename?: 'PaginatedUsers';
        users: Array<{ __typename?: 'User'; id: string; displayName: string; email: string }>;
        pageInfo: {
          __typename?: 'PageInfo';
          startCursor?: string | undefined;
          endCursor?: string | undefined;
          hasNextPage: boolean;
        };
      }
    | undefined;
};

export type CommunityAvailableMemberUsersFragment = {
  __typename?: 'Community';
  id: string;
  availableMemberUsers?:
    | {
        __typename?: 'PaginatedUsers';
        users: Array<{ __typename?: 'User'; id: string; displayName: string; email: string }>;
        pageInfo: {
          __typename?: 'PageInfo';
          startCursor?: string | undefined;
          endCursor?: string | undefined;
          hasNextPage: boolean;
        };
      }
    | undefined;
};

export type AvailableUserFragment = { __typename?: 'User'; id: string; displayName: string; email: string };

export type HubApplicationsQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type HubApplicationsQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    community?:
      | {
          __typename?: 'Community';
          id: string;
          applications?:
            | Array<{
                __typename?: 'Application';
                id: string;
                createdDate: Date;
                updatedDate: Date;
                lifecycle: {
                  __typename?: 'Lifecycle';
                  id: string;
                  state?: string | undefined;
                  nextEvents?: Array<string> | undefined;
                };
                user: {
                  __typename?: 'User';
                  id: string;
                  displayName: string;
                  email: string;
                  profile?:
                    | {
                        __typename?: 'Profile';
                        id: string;
                        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                      }
                    | undefined;
                };
                questions: Array<{ __typename?: 'Question'; id: string; name: string; value: string }>;
              }>
            | undefined;
        }
      | undefined;
  };
};

export type AdminGlobalOrganizationsListQueryVariables = Exact<{
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<OrganizationFilterInput>;
}>;

export type AdminGlobalOrganizationsListQuery = {
  __typename?: 'Query';
  organizationsPaginated: {
    __typename?: 'PaginatedOrganization';
    organization: Array<{ __typename?: 'Organization'; id: string; nameID: string; displayName: string }>;
    pageInfo: {
      __typename?: 'PageInfo';
      startCursor?: string | undefined;
      endCursor?: string | undefined;
      hasNextPage: boolean;
    };
  };
};

export type UpdateAspectTemplateMutationVariables = Exact<{
  templateId: Scalars['UUID'];
  defaultDescription?: InputMaybe<Scalars['Markdown']>;
  info?: InputMaybe<UpdateTemplateInfoInput>;
  type?: InputMaybe<Scalars['String']>;
}>;

export type UpdateAspectTemplateMutation = {
  __typename?: 'Mutation';
  updateAspectTemplate: { __typename?: 'AspectTemplate'; id: string };
};

export type CreateAspectTemplateMutationVariables = Exact<{
  templatesSetId: Scalars['UUID'];
  defaultDescription: Scalars['Markdown'];
  info: CreateTemplateInfoInput;
  type: Scalars['String'];
}>;

export type CreateAspectTemplateMutation = {
  __typename?: 'Mutation';
  createAspectTemplate: { __typename?: 'AspectTemplate'; id: string };
};

export type DeleteAspectTemplateMutationVariables = Exact<{
  templateId: Scalars['UUID'];
}>;

export type DeleteAspectTemplateMutation = {
  __typename?: 'Mutation';
  deleteAspectTemplate: { __typename?: 'AspectTemplate'; id: string };
};

export type UpdateCanvasTemplateMutationVariables = Exact<{
  templateId: Scalars['UUID'];
  value?: InputMaybe<Scalars['JSON']>;
  info?: InputMaybe<UpdateTemplateInfoInput>;
}>;

export type UpdateCanvasTemplateMutation = {
  __typename?: 'Mutation';
  updateCanvasTemplate: { __typename?: 'CanvasTemplate'; id: string };
};

export type CreateCanvasTemplateMutationVariables = Exact<{
  templatesSetId: Scalars['UUID'];
  value: Scalars['JSON'];
  info: CreateTemplateInfoInput;
}>;

export type CreateCanvasTemplateMutation = {
  __typename?: 'Mutation';
  createCanvasTemplate: { __typename?: 'CanvasTemplate'; id: string };
};

export type DeleteCanvasTemplateMutationVariables = Exact<{
  templateId: Scalars['UUID'];
}>;

export type DeleteCanvasTemplateMutation = {
  __typename?: 'Mutation';
  deleteCanvasTemplate: { __typename?: 'CanvasTemplate'; id: string };
};

export type HubTemplatesQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type HubTemplatesQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    templates?:
      | {
          __typename?: 'TemplatesSet';
          id: string;
          aspectTemplates: Array<{
            __typename?: 'AspectTemplate';
            id: string;
            defaultDescription: string;
            type: string;
            info: {
              __typename?: 'TemplateInfo';
              id: string;
              title: string;
              description: string;
              tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
              visual?:
                | {
                    __typename?: 'Visual';
                    id: string;
                    uri: string;
                    name: string;
                    allowedTypes: Array<string>;
                    aspectRatio: number;
                    maxHeight: number;
                    maxWidth: number;
                    minHeight: number;
                    minWidth: number;
                  }
                | undefined;
            };
          }>;
          canvasTemplates: Array<{
            __typename?: 'CanvasTemplate';
            id: string;
            value: string;
            info: {
              __typename?: 'TemplateInfo';
              id: string;
              title: string;
              description: string;
              tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
              visual?:
                | {
                    __typename?: 'Visual';
                    id: string;
                    uri: string;
                    name: string;
                    allowedTypes: Array<string>;
                    aspectRatio: number;
                    maxHeight: number;
                    maxWidth: number;
                    minHeight: number;
                    minWidth: number;
                  }
                | undefined;
            };
          }>;
          lifecycleTemplates: Array<{
            __typename?: 'LifecycleTemplate';
            id: string;
            definition: string;
            type: LifecycleType;
            info: {
              __typename?: 'TemplateInfo';
              id: string;
              title: string;
              description: string;
              tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
              visual?:
                | {
                    __typename?: 'Visual';
                    id: string;
                    uri: string;
                    name: string;
                    allowedTypes: Array<string>;
                    aspectRatio: number;
                    maxHeight: number;
                    maxWidth: number;
                    minHeight: number;
                    minWidth: number;
                  }
                | undefined;
            };
          }>;
        }
      | undefined;
  };
};

export type AdminLifecycleTemplateFragment = {
  __typename?: 'LifecycleTemplate';
  id: string;
  definition: string;
  type: LifecycleType;
  info: {
    __typename?: 'TemplateInfo';
    id: string;
    title: string;
    description: string;
    tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
    visual?:
      | {
          __typename?: 'Visual';
          id: string;
          uri: string;
          name: string;
          allowedTypes: Array<string>;
          aspectRatio: number;
          maxHeight: number;
          maxWidth: number;
          minHeight: number;
          minWidth: number;
        }
      | undefined;
  };
};

export type AdminAspectTemplateFragment = {
  __typename?: 'AspectTemplate';
  id: string;
  defaultDescription: string;
  type: string;
  info: {
    __typename?: 'TemplateInfo';
    id: string;
    title: string;
    description: string;
    tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
    visual?:
      | {
          __typename?: 'Visual';
          id: string;
          uri: string;
          name: string;
          allowedTypes: Array<string>;
          aspectRatio: number;
          maxHeight: number;
          maxWidth: number;
          minHeight: number;
          minWidth: number;
        }
      | undefined;
  };
};

export type AdminCanvasTemplateFragment = {
  __typename?: 'CanvasTemplate';
  id: string;
  value: string;
  info: {
    __typename?: 'TemplateInfo';
    id: string;
    title: string;
    description: string;
    tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
    visual?:
      | {
          __typename?: 'Visual';
          id: string;
          uri: string;
          name: string;
          allowedTypes: Array<string>;
          aspectRatio: number;
          maxHeight: number;
          maxWidth: number;
          minHeight: number;
          minWidth: number;
        }
      | undefined;
  };
};

export type TemplateInfoFragment = {
  __typename?: 'TemplateInfo';
  id: string;
  title: string;
  description: string;
  tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
  visual?:
    | {
        __typename?: 'Visual';
        id: string;
        uri: string;
        name: string;
        allowedTypes: Array<string>;
        aspectRatio: number;
        maxHeight: number;
        maxWidth: number;
        minHeight: number;
        minWidth: number;
      }
    | undefined;
};

export type UpdateInnovationTemplateMutationVariables = Exact<{
  templateId: Scalars['UUID'];
  info?: InputMaybe<UpdateTemplateInfoInput>;
  definition: Scalars['LifecycleDefinition'];
}>;

export type UpdateInnovationTemplateMutation = {
  __typename?: 'Mutation';
  updateLifecycleTemplate: { __typename?: 'LifecycleTemplate'; id: string };
};

export type CreateInnovationTemplateMutationVariables = Exact<{
  templatesSetId: Scalars['UUID'];
  info: CreateTemplateInfoInput;
  definition: Scalars['LifecycleDefinition'];
  type: LifecycleType;
}>;

export type CreateInnovationTemplateMutation = {
  __typename?: 'Mutation';
  createLifecycleTemplate: { __typename?: 'LifecycleTemplate'; id: string };
};

export type DeleteInnovationTemplateMutationVariables = Exact<{
  templateId: Scalars['UUID'];
}>;

export type DeleteInnovationTemplateMutation = {
  __typename?: 'Mutation';
  deleteLifecycleTemplate: { __typename?: 'LifecycleTemplate'; id: string };
};

export type ApplicationInfoFragment = {
  __typename?: 'Application';
  id: string;
  createdDate: Date;
  updatedDate: Date;
  lifecycle: {
    __typename?: 'Lifecycle';
    id: string;
    state?: string | undefined;
    nextEvents?: Array<string> | undefined;
  };
  user: {
    __typename?: 'User';
    id: string;
    displayName: string;
    email: string;
    profile?:
      | {
          __typename?: 'Profile';
          id: string;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        }
      | undefined;
  };
  questions: Array<{ __typename?: 'Question'; id: string; name: string; value: string }>;
};

export type ApplyForCommunityMembershipMutationVariables = Exact<{
  input: CommunityApplyInput;
}>;

export type ApplyForCommunityMembershipMutation = {
  __typename?: 'Mutation';
  applyForCommunityMembership: { __typename?: 'Application'; id: string };
};

export type DeleteUserApplicationMutationVariables = Exact<{
  input: DeleteApplicationInput;
}>;

export type DeleteUserApplicationMutation = {
  __typename?: 'Mutation';
  deleteUserApplication: { __typename?: 'Application'; id: string };
};

export type EventOnApplicationMutationVariables = Exact<{
  input: ApplicationEventInput;
}>;

export type EventOnApplicationMutation = {
  __typename?: 'Mutation';
  eventOnApplication: {
    __typename?: 'Application';
    id: string;
    lifecycle: {
      __typename?: 'Lifecycle';
      id: string;
      nextEvents?: Array<string> | undefined;
      state?: string | undefined;
    };
  };
};

export type EventOnChallengeMutationVariables = Exact<{
  input: ChallengeEventInput;
}>;

export type EventOnChallengeMutation = {
  __typename?: 'Mutation';
  eventOnChallenge: {
    __typename?: 'Challenge';
    id: string;
    lifecycle?:
      | { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined; state?: string | undefined }
      | undefined;
  };
};

export type ApplicationByHubQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  appId: Scalars['UUID'];
}>;

export type ApplicationByHubQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    application: {
      __typename?: 'Application';
      id: string;
      createdDate: Date;
      updatedDate: Date;
      questions: Array<{ __typename?: 'Question'; id: string; name: string; value: string }>;
    };
  };
};

export type ChallengeApplicationQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeApplicationQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      displayName: string;
      context?:
        | {
            __typename?: 'Context';
            id: string;
            tagline?: string | undefined;
            background?: string | undefined;
            vision?: string | undefined;
            impact?: string | undefined;
            who?: string | undefined;
            location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
            references?:
              | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
              | undefined;
            visuals?:
              | Array<{
                  __typename?: 'Visual';
                  id: string;
                  uri: string;
                  name: string;
                  allowedTypes: Array<string>;
                  aspectRatio: number;
                  maxHeight: number;
                  maxWidth: number;
                  minHeight: number;
                  minWidth: number;
                }>
              | undefined;
            authorization?:
              | {
                  __typename?: 'Authorization';
                  id: string;
                  myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                  anonymousReadAccess: boolean;
                }
              | undefined;
          }
        | undefined;
      community?: { __typename?: 'Community'; id: string } | undefined;
    };
  };
};

export type HubApplicationQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type HubApplicationQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    displayName: string;
    context?:
      | {
          __typename?: 'Context';
          tagline?: string | undefined;
          visuals?: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }> | undefined;
        }
      | undefined;
    community?: { __typename?: 'Community'; id: string; displayName: string } | undefined;
  };
};

export type HubNameIdQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type HubNameIdQuery = { __typename?: 'Query'; hub: { __typename?: 'Hub'; id: string; nameID: string } };

export type ChallengeNameIdQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeNameIdQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    nameID: string;
    challenge: { __typename?: 'Challenge'; id: string; nameID: string };
  };
};

export type OpportunityNameIdQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityNameIdQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    nameID: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      nameID: string;
      challenge?: { __typename?: 'Challenge'; id: string; nameID: string } | undefined;
    };
  };
};

export type HubAspectProviderQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
  aspectNameId: Scalars['UUID_NAMEID'];
  calloutNameId: Scalars['UUID_NAMEID'];
}>;

export type HubAspectProviderQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    collaboration?:
      | {
          __typename?: 'Collaboration';
          id: string;
          callouts?:
            | Array<{
                __typename?: 'Callout';
                id: string;
                type: CalloutType;
                aspects?:
                  | Array<{
                      __typename?: 'Aspect';
                      id: string;
                      nameID: string;
                      displayName: string;
                      authorization?:
                        | {
                            __typename?: 'Authorization';
                            id: string;
                            myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                          }
                        | undefined;
                    }>
                  | undefined;
              }>
            | undefined;
        }
      | undefined;
  };
};

export type ChallengeAspectProviderQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
  challengeNameId: Scalars['UUID_NAMEID'];
  aspectNameId: Scalars['UUID_NAMEID'];
  calloutNameId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeAspectProviderQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  type: CalloutType;
                  aspects?:
                    | Array<{
                        __typename?: 'Aspect';
                        id: string;
                        nameID: string;
                        displayName: string;
                        authorization?:
                          | {
                              __typename?: 'Authorization';
                              id: string;
                              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                            }
                          | undefined;
                      }>
                    | undefined;
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type OpportunityAspectProviderQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
  opportunityNameId: Scalars['UUID_NAMEID'];
  aspectNameId: Scalars['UUID_NAMEID'];
  calloutNameId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityAspectProviderQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  type: CalloutType;
                  aspects?:
                    | Array<{
                        __typename?: 'Aspect';
                        id: string;
                        nameID: string;
                        displayName: string;
                        authorization?:
                          | {
                              __typename?: 'Authorization';
                              id: string;
                              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                            }
                          | undefined;
                      }>
                    | undefined;
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type AspectProviderDataFragment = {
  __typename?: 'Collaboration';
  id: string;
  callouts?:
    | Array<{
        __typename?: 'Callout';
        id: string;
        type: CalloutType;
        aspects?:
          | Array<{
              __typename?: 'Aspect';
              id: string;
              nameID: string;
              displayName: string;
              authorization?:
                | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
                | undefined;
            }>
          | undefined;
      }>
    | undefined;
};

export type AspectProvidedFragment = {
  __typename?: 'Aspect';
  id: string;
  nameID: string;
  displayName: string;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
};

export type CalloutAspectInfoFragment = {
  __typename?: 'Collaboration';
  id: string;
  callouts?:
    | Array<{
        __typename?: 'Callout';
        id: string;
        nameID: string;
        type: CalloutType;
        aspects?: Array<{ __typename?: 'Aspect'; id: string; nameID: string }> | undefined;
      }>
    | undefined;
};

export type PostCommentInAspectMutationVariables = Exact<{
  messageData: CommentsSendMessageInput;
}>;

export type PostCommentInAspectMutation = {
  __typename?: 'Mutation';
  sendComment: { __typename?: 'Message'; id: string; message: string; sender: string; timestamp: number };
};

export type RemoveCommentFromAspectMutationVariables = Exact<{
  messageData: CommentsRemoveMessageInput;
}>;

export type RemoveCommentFromAspectMutation = { __typename?: 'Mutation'; removeComment: string };

export type AspectCardFragment = {
  __typename?: 'Aspect';
  id: string;
  nameID: string;
  displayName: string;
  type: string;
  description: string;
  banner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
  bannerNarrow?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
  tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
};

export type ContributeTabAspectFragment = {
  __typename?: 'Aspect';
  id: string;
  nameID: string;
  displayName: string;
  type: string;
  description: string;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
  banner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
  bannerNarrow?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
  tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
};

export type CreateAspectMutationVariables = Exact<{
  aspectData: CreateAspectOnCalloutInput;
}>;

export type CreateAspectMutation = {
  __typename?: 'Mutation';
  createAspectOnCallout: {
    __typename?: 'Aspect';
    id: string;
    nameID: string;
    displayName: string;
    description: string;
    type: string;
    tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
    banner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    bannerNarrow?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
  };
};

export type CreateReferenceOnAspectMutationVariables = Exact<{
  referenceInput: CreateReferenceOnAspectInput;
}>;

export type CreateReferenceOnAspectMutation = {
  __typename?: 'Mutation';
  createReferenceOnAspect: { __typename?: 'Reference'; id: string; name: string; uri: string; description: string };
};

export type DeleteAspectMutationVariables = Exact<{
  input: DeleteAspectInput;
}>;

export type DeleteAspectMutation = { __typename?: 'Mutation'; deleteAspect: { __typename?: 'Aspect'; id: string } };

export type AspectCommentsMessageReceivedSubscriptionVariables = Exact<{
  aspectID: Scalars['UUID'];
}>;

export type AspectCommentsMessageReceivedSubscription = {
  __typename?: 'Subscription';
  aspectCommentsMessageReceived: {
    __typename?: 'AspectCommentsMessageReceived';
    message: { __typename?: 'Message'; id: string; message: string; sender: string; timestamp: number };
  };
};

export type HubCalloutsQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
}>;

export type HubCalloutsQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    collaboration?:
      | {
          __typename?: 'Collaboration';
          id: string;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          callouts?:
            | Array<{
                __typename?: 'Callout';
                id: string;
                nameID: string;
                type: CalloutType;
                displayName: string;
                description: string;
                state: CalloutState;
                visibility: CalloutVisibility;
                aspects?:
                  | Array<{
                      __typename?: 'Aspect';
                      id: string;
                      nameID: string;
                      displayName: string;
                      type: string;
                      description: string;
                      authorization?:
                        | {
                            __typename?: 'Authorization';
                            id: string;
                            myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                          }
                        | undefined;
                      banner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                      bannerNarrow?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                      tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
                    }>
                  | undefined;
                canvases?:
                  | Array<{
                      __typename?: 'Canvas';
                      id: string;
                      nameID: string;
                      displayName: string;
                      authorization?:
                        | {
                            __typename?: 'Authorization';
                            id: string;
                            myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                            anonymousReadAccess: boolean;
                          }
                        | undefined;
                      checkout?:
                        | {
                            __typename?: 'CanvasCheckout';
                            id: string;
                            lockedBy: string;
                            status: CanvasCheckoutStateEnum;
                            lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
                            authorization?:
                              | {
                                  __typename?: 'Authorization';
                                  id: string;
                                  myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                                }
                              | undefined;
                          }
                        | undefined;
                      preview?:
                        | {
                            __typename?: 'Visual';
                            id: string;
                            uri: string;
                            name: string;
                            allowedTypes: Array<string>;
                            aspectRatio: number;
                            maxHeight: number;
                            maxWidth: number;
                            minHeight: number;
                            minWidth: number;
                          }
                        | undefined;
                    }>
                  | undefined;
                authorization?:
                  | {
                      __typename?: 'Authorization';
                      id: string;
                      myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                    }
                  | undefined;
              }>
            | undefined;
        }
      | undefined;
  };
};

export type ChallengeCalloutsQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
  challengeNameId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeCalloutsQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  nameID: string;
                  type: CalloutType;
                  displayName: string;
                  description: string;
                  state: CalloutState;
                  visibility: CalloutVisibility;
                  aspects?:
                    | Array<{
                        __typename?: 'Aspect';
                        id: string;
                        nameID: string;
                        displayName: string;
                        type: string;
                        description: string;
                        authorization?:
                          | {
                              __typename?: 'Authorization';
                              id: string;
                              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                            }
                          | undefined;
                        banner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                        bannerNarrow?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                        tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
                      }>
                    | undefined;
                  canvases?:
                    | Array<{
                        __typename?: 'Canvas';
                        id: string;
                        nameID: string;
                        displayName: string;
                        authorization?:
                          | {
                              __typename?: 'Authorization';
                              id: string;
                              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                              anonymousReadAccess: boolean;
                            }
                          | undefined;
                        checkout?:
                          | {
                              __typename?: 'CanvasCheckout';
                              id: string;
                              lockedBy: string;
                              status: CanvasCheckoutStateEnum;
                              lifecycle: {
                                __typename?: 'Lifecycle';
                                id: string;
                                nextEvents?: Array<string> | undefined;
                              };
                              authorization?:
                                | {
                                    __typename?: 'Authorization';
                                    id: string;
                                    myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                                  }
                                | undefined;
                            }
                          | undefined;
                        preview?:
                          | {
                              __typename?: 'Visual';
                              id: string;
                              uri: string;
                              name: string;
                              allowedTypes: Array<string>;
                              aspectRatio: number;
                              maxHeight: number;
                              maxWidth: number;
                              minHeight: number;
                              minWidth: number;
                            }
                          | undefined;
                      }>
                    | undefined;
                  authorization?:
                    | {
                        __typename?: 'Authorization';
                        id: string;
                        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                      }
                    | undefined;
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type OpportunityCalloutsQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
  opportunityNameId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityCalloutsQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  nameID: string;
                  type: CalloutType;
                  displayName: string;
                  description: string;
                  state: CalloutState;
                  visibility: CalloutVisibility;
                  aspects?:
                    | Array<{
                        __typename?: 'Aspect';
                        id: string;
                        nameID: string;
                        displayName: string;
                        type: string;
                        description: string;
                        authorization?:
                          | {
                              __typename?: 'Authorization';
                              id: string;
                              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                            }
                          | undefined;
                        banner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                        bannerNarrow?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                        tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
                      }>
                    | undefined;
                  canvases?:
                    | Array<{
                        __typename?: 'Canvas';
                        id: string;
                        nameID: string;
                        displayName: string;
                        authorization?:
                          | {
                              __typename?: 'Authorization';
                              id: string;
                              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                              anonymousReadAccess: boolean;
                            }
                          | undefined;
                        checkout?:
                          | {
                              __typename?: 'CanvasCheckout';
                              id: string;
                              lockedBy: string;
                              status: CanvasCheckoutStateEnum;
                              lifecycle: {
                                __typename?: 'Lifecycle';
                                id: string;
                                nextEvents?: Array<string> | undefined;
                              };
                              authorization?:
                                | {
                                    __typename?: 'Authorization';
                                    id: string;
                                    myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                                  }
                                | undefined;
                            }
                          | undefined;
                        preview?:
                          | {
                              __typename?: 'Visual';
                              id: string;
                              uri: string;
                              name: string;
                              allowedTypes: Array<string>;
                              aspectRatio: number;
                              maxHeight: number;
                              maxWidth: number;
                              minHeight: number;
                              minWidth: number;
                            }
                          | undefined;
                      }>
                    | undefined;
                  authorization?:
                    | {
                        __typename?: 'Authorization';
                        id: string;
                        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                      }
                    | undefined;
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type HubCalloutQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
  calloutId: Scalars['UUID_NAMEID'];
}>;

export type HubCalloutQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    collaboration?:
      | {
          __typename?: 'Collaboration';
          id: string;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          callouts?:
            | Array<{
                __typename?: 'Callout';
                id: string;
                nameID: string;
                type: CalloutType;
                displayName: string;
                description: string;
                state: CalloutState;
                visibility: CalloutVisibility;
                aspects?:
                  | Array<{
                      __typename?: 'Aspect';
                      id: string;
                      nameID: string;
                      displayName: string;
                      type: string;
                      description: string;
                      authorization?:
                        | {
                            __typename?: 'Authorization';
                            id: string;
                            myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                          }
                        | undefined;
                      banner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                      bannerNarrow?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                      tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
                    }>
                  | undefined;
                canvases?:
                  | Array<{
                      __typename?: 'Canvas';
                      id: string;
                      nameID: string;
                      displayName: string;
                      authorization?:
                        | {
                            __typename?: 'Authorization';
                            id: string;
                            myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                            anonymousReadAccess: boolean;
                          }
                        | undefined;
                      checkout?:
                        | {
                            __typename?: 'CanvasCheckout';
                            id: string;
                            lockedBy: string;
                            status: CanvasCheckoutStateEnum;
                            lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
                            authorization?:
                              | {
                                  __typename?: 'Authorization';
                                  id: string;
                                  myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                                }
                              | undefined;
                          }
                        | undefined;
                      preview?:
                        | {
                            __typename?: 'Visual';
                            id: string;
                            uri: string;
                            name: string;
                            allowedTypes: Array<string>;
                            aspectRatio: number;
                            maxHeight: number;
                            maxWidth: number;
                            minHeight: number;
                            minWidth: number;
                          }
                        | undefined;
                    }>
                  | undefined;
                authorization?:
                  | {
                      __typename?: 'Authorization';
                      id: string;
                      myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                    }
                  | undefined;
              }>
            | undefined;
        }
      | undefined;
  };
};

export type ChallengeCalloutQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
  challengeNameId: Scalars['UUID_NAMEID'];
  calloutId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeCalloutQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  nameID: string;
                  type: CalloutType;
                  displayName: string;
                  description: string;
                  state: CalloutState;
                  visibility: CalloutVisibility;
                  aspects?:
                    | Array<{
                        __typename?: 'Aspect';
                        id: string;
                        nameID: string;
                        displayName: string;
                        type: string;
                        description: string;
                        authorization?:
                          | {
                              __typename?: 'Authorization';
                              id: string;
                              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                            }
                          | undefined;
                        banner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                        bannerNarrow?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                        tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
                      }>
                    | undefined;
                  canvases?:
                    | Array<{
                        __typename?: 'Canvas';
                        id: string;
                        nameID: string;
                        displayName: string;
                        authorization?:
                          | {
                              __typename?: 'Authorization';
                              id: string;
                              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                              anonymousReadAccess: boolean;
                            }
                          | undefined;
                        checkout?:
                          | {
                              __typename?: 'CanvasCheckout';
                              id: string;
                              lockedBy: string;
                              status: CanvasCheckoutStateEnum;
                              lifecycle: {
                                __typename?: 'Lifecycle';
                                id: string;
                                nextEvents?: Array<string> | undefined;
                              };
                              authorization?:
                                | {
                                    __typename?: 'Authorization';
                                    id: string;
                                    myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                                  }
                                | undefined;
                            }
                          | undefined;
                        preview?:
                          | {
                              __typename?: 'Visual';
                              id: string;
                              uri: string;
                              name: string;
                              allowedTypes: Array<string>;
                              aspectRatio: number;
                              maxHeight: number;
                              maxWidth: number;
                              minHeight: number;
                              minWidth: number;
                            }
                          | undefined;
                      }>
                    | undefined;
                  authorization?:
                    | {
                        __typename?: 'Authorization';
                        id: string;
                        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                      }
                    | undefined;
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type OpportunityCalloutQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
  opportunityNameId: Scalars['UUID_NAMEID'];
  calloutId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityCalloutQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  nameID: string;
                  type: CalloutType;
                  displayName: string;
                  description: string;
                  state: CalloutState;
                  visibility: CalloutVisibility;
                  aspects?:
                    | Array<{
                        __typename?: 'Aspect';
                        id: string;
                        nameID: string;
                        displayName: string;
                        type: string;
                        description: string;
                        authorization?:
                          | {
                              __typename?: 'Authorization';
                              id: string;
                              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                            }
                          | undefined;
                        banner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                        bannerNarrow?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                        tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
                      }>
                    | undefined;
                  canvases?:
                    | Array<{
                        __typename?: 'Canvas';
                        id: string;
                        nameID: string;
                        displayName: string;
                        authorization?:
                          | {
                              __typename?: 'Authorization';
                              id: string;
                              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                              anonymousReadAccess: boolean;
                            }
                          | undefined;
                        checkout?:
                          | {
                              __typename?: 'CanvasCheckout';
                              id: string;
                              lockedBy: string;
                              status: CanvasCheckoutStateEnum;
                              lifecycle: {
                                __typename?: 'Lifecycle';
                                id: string;
                                nextEvents?: Array<string> | undefined;
                              };
                              authorization?:
                                | {
                                    __typename?: 'Authorization';
                                    id: string;
                                    myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                                  }
                                | undefined;
                            }
                          | undefined;
                        preview?:
                          | {
                              __typename?: 'Visual';
                              id: string;
                              uri: string;
                              name: string;
                              allowedTypes: Array<string>;
                              aspectRatio: number;
                              maxHeight: number;
                              maxWidth: number;
                              minHeight: number;
                              minWidth: number;
                            }
                          | undefined;
                      }>
                    | undefined;
                  authorization?:
                    | {
                        __typename?: 'Authorization';
                        id: string;
                        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                      }
                    | undefined;
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type PrivilegesOnCollaborationFragment = {
  __typename?: 'Collaboration';
  id: string;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
};

export type PrivilegesOnHubCollaborationQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
}>;

export type PrivilegesOnHubCollaborationQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    collaboration?:
      | {
          __typename?: 'Collaboration';
          id: string;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
        }
      | undefined;
  };
};

export type PrivilegesOnChallengeCollaborationQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
  challengeNameId: Scalars['UUID_NAMEID'];
}>;

export type PrivilegesOnChallengeCollaborationQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
          }
        | undefined;
    };
  };
};

export type PrivilegesOnOpportunityCollaborationQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
  opportunityNameId: Scalars['UUID_NAMEID'];
}>;

export type PrivilegesOnOpportunityCollaborationQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
          }
        | undefined;
    };
  };
};

export type CreateAspectFromContributeTabMutationVariables = Exact<{
  aspectData: CreateAspectOnCalloutInput;
}>;

export type CreateAspectFromContributeTabMutation = {
  __typename?: 'Mutation';
  createAspectOnCallout: {
    __typename?: 'Aspect';
    id: string;
    nameID: string;
    displayName: string;
    description: string;
    type: string;
    tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
    banner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    bannerNarrow?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
  };
};

export type CalloutFragment = {
  __typename?: 'Callout';
  id: string;
  nameID: string;
  type: CalloutType;
  displayName: string;
  description: string;
  state: CalloutState;
  visibility: CalloutVisibility;
  aspects?:
    | Array<{
        __typename?: 'Aspect';
        id: string;
        nameID: string;
        displayName: string;
        type: string;
        description: string;
        authorization?:
          | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
          | undefined;
        banner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        bannerNarrow?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
      }>
    | undefined;
  canvases?:
    | Array<{
        __typename?: 'Canvas';
        id: string;
        nameID: string;
        displayName: string;
        authorization?:
          | {
              __typename?: 'Authorization';
              id: string;
              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
              anonymousReadAccess: boolean;
            }
          | undefined;
        checkout?:
          | {
              __typename?: 'CanvasCheckout';
              id: string;
              lockedBy: string;
              status: CanvasCheckoutStateEnum;
              lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
              authorization?:
                | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
                | undefined;
            }
          | undefined;
        preview?:
          | {
              __typename?: 'Visual';
              id: string;
              uri: string;
              name: string;
              allowedTypes: Array<string>;
              aspectRatio: number;
              maxHeight: number;
              maxWidth: number;
              minHeight: number;
              minWidth: number;
            }
          | undefined;
      }>
    | undefined;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
};

export type AspectTemplatesOnCalloutCreationQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type AspectTemplatesOnCalloutCreationQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    templates?:
      | {
          __typename?: 'TemplatesSet';
          id: string;
          aspectTemplates: Array<{
            __typename?: 'AspectTemplate';
            id: string;
            info: { __typename?: 'TemplateInfo'; id: string; title: string };
          }>;
        }
      | undefined;
  };
};

export type CanvasTemplatesOnCalloutCreationQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type CanvasTemplatesOnCalloutCreationQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    templates?:
      | {
          __typename?: 'TemplatesSet';
          id: string;
          canvasTemplates: Array<{
            __typename?: 'CanvasTemplate';
            id: string;
            info: { __typename?: 'TemplateInfo'; id: string; title: string };
          }>;
        }
      | undefined;
  };
};

export type TemplateTitleFragment = { __typename?: 'TemplateInfo'; id: string; title: string };

export type AspectTemplateValueQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  id: Scalars['UUID'];
}>;

export type AspectTemplateValueQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    templates?:
      | {
          __typename?: 'TemplatesSet';
          id: string;
          aspectTemplate?:
            | {
                __typename?: 'AspectTemplate';
                id: string;
                type: string;
                defaultDescription: string;
                info: {
                  __typename?: 'TemplateInfo';
                  id: string;
                  description: string;
                  tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                };
              }
            | undefined;
        }
      | undefined;
  };
};

export type CanvasTemplateValueQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  id: Scalars['UUID'];
}>;

export type CanvasTemplateValueQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    templates?:
      | {
          __typename?: 'TemplatesSet';
          id: string;
          canvasTemplate?: { __typename?: 'CanvasTemplate'; id: string; value: string } | undefined;
        }
      | undefined;
  };
};

export type CreateCalloutMutationVariables = Exact<{
  calloutData: CreateCalloutOnCollaborationInput;
}>;

export type CreateCalloutMutation = {
  __typename?: 'Mutation';
  createCalloutOnCollaboration: {
    __typename?: 'Callout';
    id: string;
    nameID: string;
    type: CalloutType;
    displayName: string;
    description: string;
    state: CalloutState;
    visibility: CalloutVisibility;
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
    canvases?: Array<{ __typename?: 'Canvas'; id: string }> | undefined;
    aspects?: Array<{ __typename?: 'Aspect'; id: string }> | undefined;
  };
};

export type HubCollaborationIdQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type HubCollaborationIdQuery = {
  __typename?: 'Query';
  hub: { __typename?: 'Hub'; id: string; collaboration?: { __typename?: 'Collaboration'; id: string } | undefined };
};

export type ChallengeCollaborationIdQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeCollaborationIdQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      collaboration?: { __typename?: 'Collaboration'; id: string } | undefined;
    };
  };
};

export type OpportunityCollaborationIdQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityCollaborationIdQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      collaboration?: { __typename?: 'Collaboration'; id: string } | undefined;
    };
  };
};

export type UpdateCalloutMutationVariables = Exact<{
  calloutData: UpdateCalloutInput;
}>;

export type UpdateCalloutMutation = {
  __typename?: 'Mutation';
  updateCallout: {
    __typename?: 'Callout';
    id: string;
    description: string;
    displayName: string;
    state: CalloutState;
    type: CalloutType;
    visibility: CalloutVisibility;
  };
};

export type DeleteCalloutMutationVariables = Exact<{
  calloutId: Scalars['UUID'];
}>;

export type DeleteCalloutMutation = { __typename?: 'Mutation'; deleteCallout: { __typename?: 'Callout'; id: string } };

export type ChallengeCardFragment = {
  __typename?: 'Challenge';
  id: string;
  displayName: string;
  nameID: string;
  activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
  context?:
    | {
        __typename?: 'Context';
        id: string;
        tagline?: string | undefined;
        visuals?: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }> | undefined;
      }
    | undefined;
  tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
};

export type ChallengeInfoFragment = {
  __typename?: 'Challenge';
  id: string;
  displayName: string;
  nameID: string;
  community?:
    | {
        __typename?: 'Community';
        id: string;
        authorization?:
          | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
          | undefined;
      }
    | undefined;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
  context?:
    | {
        __typename?: 'Context';
        id: string;
        tagline?: string | undefined;
        authorization?:
          | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
          | undefined;
        references?: Array<{ __typename?: 'Reference'; id: string; name: string; uri: string }> | undefined;
        visuals?:
          | Array<{
              __typename?: 'Visual';
              id: string;
              uri: string;
              name: string;
              allowedTypes: Array<string>;
              aspectRatio: number;
              maxHeight: number;
              maxWidth: number;
              minHeight: number;
              minWidth: number;
            }>
          | undefined;
      }
    | undefined;
};

export type ChallengeSearchResultFragment = {
  __typename?: 'Challenge';
  id: string;
  displayName: string;
  nameID: string;
  hubID: string;
  activity?: Array<{ __typename?: 'NVP'; name: string; value: string }> | undefined;
  context?:
    | {
        __typename?: 'Context';
        id: string;
        tagline?: string | undefined;
        visuals?: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }> | undefined;
      }
    | undefined;
  tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
};

export type NewChallengeFragment = { __typename?: 'Challenge'; id: string; nameID: string; displayName: string };

export type CreateChallengeMutationVariables = Exact<{
  input: CreateChallengeOnHubInput;
}>;

export type CreateChallengeMutation = {
  __typename?: 'Mutation';
  createChallenge: { __typename?: 'Challenge'; id: string; nameID: string; displayName: string };
};

export type DeleteChallengeMutationVariables = Exact<{
  input: DeleteChallengeInput;
}>;

export type DeleteChallengeMutation = {
  __typename?: 'Mutation';
  deleteChallenge: { __typename?: 'Challenge'; id: string; nameID: string };
};

export type UpdateChallengeMutationVariables = Exact<{
  input: UpdateChallengeInput;
}>;

export type UpdateChallengeMutation = {
  __typename?: 'Mutation';
  updateChallenge: { __typename?: 'Challenge'; id: string; nameID: string; displayName: string };
};

export type ChallengeActivityQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeActivityQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      activity?: Array<{ __typename?: 'NVP'; name: string; value: string }> | undefined;
    };
  };
};

export type ChallengeApplicationTemplateQueryVariables = Exact<{ [key: string]: never }>;

export type ChallengeApplicationTemplateQuery = {
  __typename?: 'Query';
  configuration: {
    __typename?: 'Config';
    template: {
      __typename?: 'Template';
      challenges: Array<{
        __typename?: 'ChallengeTemplate';
        name: string;
        applications?:
          | Array<{
              __typename?: 'ApplicationTemplate';
              name: string;
              questions: Array<{
                __typename?: 'QuestionTemplate';
                required: boolean;
                question: string;
                sortOrder?: number | undefined;
              }>;
            }>
          | undefined;
      }>;
    };
  };
};

export type ChallengeCardQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeCardQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    nameID: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      displayName: string;
      nameID: string;
      activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
      context?:
        | {
            __typename?: 'Context';
            id: string;
            tagline?: string | undefined;
            visuals?: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }> | undefined;
          }
        | undefined;
      tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
    };
  };
};

export type ChallengeCardsQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeCardsQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    challenges?:
      | Array<{
          __typename?: 'Challenge';
          id: string;
          displayName: string;
          nameID: string;
          activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
          context?:
            | {
                __typename?: 'Context';
                id: string;
                tagline?: string | undefined;
                visuals?: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }> | undefined;
              }
            | undefined;
          tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
        }>
      | undefined;
  };
};

export type ChallengeGroupsQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeGroupsQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      community?:
        | {
            __typename?: 'Community';
            groups?: Array<{ __typename?: 'UserGroup'; id: string; name: string }> | undefined;
          }
        | undefined;
    };
  };
};

export type ChallengeInfoQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeInfoQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    nameID: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      displayName: string;
      nameID: string;
      community?:
        | {
            __typename?: 'Community';
            id: string;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
          }
        | undefined;
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
      context?:
        | {
            __typename?: 'Context';
            id: string;
            tagline?: string | undefined;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
            references?: Array<{ __typename?: 'Reference'; id: string; name: string; uri: string }> | undefined;
            visuals?:
              | Array<{
                  __typename?: 'Visual';
                  id: string;
                  uri: string;
                  name: string;
                  allowedTypes: Array<string>;
                  aspectRatio: number;
                  maxHeight: number;
                  maxWidth: number;
                  minHeight: number;
                  minWidth: number;
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type ChallengeLifecycleQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeLifecycleQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      lifecycle?:
        | {
            __typename?: 'Lifecycle';
            id: string;
            machineDef: string;
            state?: string | undefined;
            nextEvents?: Array<string> | undefined;
            stateIsFinal: boolean;
          }
        | undefined;
    };
  };
};

export type ChallengeMembersQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  challengeID: Scalars['UUID_NAMEID'];
}>;

export type ChallengeMembersQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      community?:
        | {
            __typename?: 'Community';
            memberUsers?:
              | Array<{
                  __typename?: 'User';
                  id: string;
                  displayName: string;
                  firstName: string;
                  lastName: string;
                  email: string;
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type ChallengeNameQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeNameQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      displayName: string;
      community?: { __typename?: 'Community'; id: string; displayName: string } | undefined;
    };
  };
};

export type ChallengeProfileInfoQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeProfileInfoQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      nameID: string;
      displayName: string;
      tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
      lifecycle?: { __typename?: 'Lifecycle'; state?: string | undefined } | undefined;
      context?:
        | {
            __typename?: 'Context';
            id: string;
            tagline?: string | undefined;
            background?: string | undefined;
            vision?: string | undefined;
            impact?: string | undefined;
            who?: string | undefined;
            visuals?:
              | Array<{
                  __typename?: 'Visual';
                  id: string;
                  uri: string;
                  name: string;
                  allowedTypes: Array<string>;
                  aspectRatio: number;
                  maxHeight: number;
                  maxWidth: number;
                  minHeight: number;
                  minWidth: number;
                }>
              | undefined;
            location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
            references?:
              | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
              | undefined;
            authorization?:
              | {
                  __typename?: 'Authorization';
                  id: string;
                  myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                  anonymousReadAccess: boolean;
                }
              | undefined;
          }
        | undefined;
    };
  };
};

export type ChallengeUserIdsQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeUserIdsQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      community?:
        | { __typename?: 'Community'; memberUsers?: Array<{ __typename?: 'User'; id: string }> | undefined }
        | undefined;
    };
  };
};

export type ChallengesQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type ChallengesQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    challenges?:
      | Array<{
          __typename?: 'Challenge';
          id: string;
          displayName: string;
          nameID: string;
          context?:
            | {
                __typename?: 'Context';
                id: string;
                tagline?: string | undefined;
                references?: Array<{ __typename?: 'Reference'; name: string; uri: string }> | undefined;
                visuals?: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }> | undefined;
              }
            | undefined;
        }>
      | undefined;
  };
};

export type AspectsOnCalloutFragment = {
  __typename?: 'Callout';
  id: string;
  aspects?:
    | Array<{
        __typename?: 'Aspect';
        id: string;
        nameID: string;
        displayName: string;
        type: string;
        description: string;
        authorization?:
          | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
          | undefined;
        banner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        bannerNarrow?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
      }>
    | undefined;
};

export type CalloutAspectCreatedSubscriptionVariables = Exact<{
  calloutID: Scalars['UUID'];
}>;

export type CalloutAspectCreatedSubscription = {
  __typename?: 'Subscription';
  calloutAspectCreated: {
    __typename?: 'CalloutAspectCreated';
    aspect: {
      __typename?: 'Aspect';
      id: string;
      nameID: string;
      displayName: string;
      type: string;
      description: string;
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
      banner?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      bannerNarrow?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
    };
  };
};

export type AuthorDetailsQueryVariables = Exact<{
  ids: Array<Scalars['UUID_NAMEID_EMAIL']> | Scalars['UUID_NAMEID_EMAIL'];
}>;

export type AuthorDetailsQuery = {
  __typename?: 'Query';
  usersById: Array<{
    __typename?: 'User';
    id: string;
    nameID: string;
    displayName: string;
    firstName: string;
    lastName: string;
    profile?:
      | {
          __typename?: 'Profile';
          id: string;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        }
      | undefined;
  }>;
};

export type ChallengeCommunityQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeCommunityQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      community?:
        | {
            __typename?: 'Community';
            id: string;
            displayName: string;
            communication?:
              | {
                  __typename?: 'Communication';
                  id: string;
                  authorization?:
                    | {
                        __typename?: 'Authorization';
                        id: string;
                        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                      }
                    | undefined;
                }
              | undefined;
          }
        | undefined;
    };
  };
};

export type CommunityDetailsFragment = {
  __typename?: 'Community';
  id: string;
  displayName: string;
  communication?:
    | {
        __typename?: 'Communication';
        id: string;
        authorization?:
          | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
          | undefined;
      }
    | undefined;
};

export type HubCommunityQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type HubCommunityQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    community?:
      | {
          __typename?: 'Community';
          id: string;
          displayName: string;
          communication?:
            | {
                __typename?: 'Communication';
                id: string;
                authorization?:
                  | {
                      __typename?: 'Authorization';
                      id: string;
                      myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                    }
                  | undefined;
              }
            | undefined;
        }
      | undefined;
  };
};

export type OpportunityCommunityQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityCommunityQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      community?:
        | {
            __typename?: 'Community';
            id: string;
            displayName: string;
            communication?:
              | {
                  __typename?: 'Communication';
                  id: string;
                  authorization?:
                    | {
                        __typename?: 'Authorization';
                        id: string;
                        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                      }
                    | undefined;
                }
              | undefined;
          }
        | undefined;
    };
  };
};

export type HubCommunityContributorsQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type HubCommunityContributorsQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    host?:
      | {
          __typename?: 'Organization';
          id: string;
          nameID: string;
          displayName: string;
          activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
          profile: {
            __typename?: 'Profile';
            id: string;
            description?: string | undefined;
            avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          };
          verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
        }
      | undefined;
    community?:
      | {
          __typename?: 'Community';
          id: string;
          leadUsers?:
            | Array<{
                __typename?: 'User';
                id: string;
                nameID: string;
                displayName: string;
                agent?:
                  | {
                      __typename?: 'Agent';
                      id: string;
                      credentials?:
                        | Array<{
                            __typename?: 'Credential';
                            id: string;
                            type: AuthorizationCredential;
                            resourceID: string;
                          }>
                        | undefined;
                    }
                  | undefined;
                profile?:
                  | {
                      __typename?: 'Profile';
                      id: string;
                      location?: { __typename?: 'Location'; country: string; city: string } | undefined;
                      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                      tagsets?:
                        | Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }>
                        | undefined;
                    }
                  | undefined;
              }>
            | undefined;
          memberUsers?:
            | Array<{
                __typename?: 'User';
                id: string;
                nameID: string;
                displayName: string;
                agent?:
                  | {
                      __typename?: 'Agent';
                      id: string;
                      credentials?:
                        | Array<{
                            __typename?: 'Credential';
                            id: string;
                            type: AuthorizationCredential;
                            resourceID: string;
                          }>
                        | undefined;
                    }
                  | undefined;
                profile?:
                  | {
                      __typename?: 'Profile';
                      id: string;
                      location?: { __typename?: 'Location'; country: string; city: string } | undefined;
                      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                      tagsets?:
                        | Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }>
                        | undefined;
                    }
                  | undefined;
              }>
            | undefined;
          memberOrganizations?:
            | Array<{
                __typename?: 'Organization';
                id: string;
                nameID: string;
                displayName: string;
                activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  description?: string | undefined;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                };
                verification: {
                  __typename?: 'OrganizationVerification';
                  id: string;
                  status: OrganizationVerificationEnum;
                };
              }>
            | undefined;
        }
      | undefined;
  };
};

export type ChallengeCommunityContributorsQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeCommunityContributorsQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      community?:
        | {
            __typename?: 'Community';
            id: string;
            leadUsers?:
              | Array<{
                  __typename?: 'User';
                  id: string;
                  nameID: string;
                  displayName: string;
                  agent?:
                    | {
                        __typename?: 'Agent';
                        id: string;
                        credentials?:
                          | Array<{
                              __typename?: 'Credential';
                              id: string;
                              type: AuthorizationCredential;
                              resourceID: string;
                            }>
                          | undefined;
                      }
                    | undefined;
                  profile?:
                    | {
                        __typename?: 'Profile';
                        id: string;
                        location?: { __typename?: 'Location'; country: string; city: string } | undefined;
                        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                        tagsets?:
                          | Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }>
                          | undefined;
                      }
                    | undefined;
                }>
              | undefined;
            memberUsers?:
              | Array<{
                  __typename?: 'User';
                  id: string;
                  nameID: string;
                  displayName: string;
                  agent?:
                    | {
                        __typename?: 'Agent';
                        id: string;
                        credentials?:
                          | Array<{
                              __typename?: 'Credential';
                              id: string;
                              type: AuthorizationCredential;
                              resourceID: string;
                            }>
                          | undefined;
                      }
                    | undefined;
                  profile?:
                    | {
                        __typename?: 'Profile';
                        id: string;
                        location?: { __typename?: 'Location'; country: string; city: string } | undefined;
                        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                        tagsets?:
                          | Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }>
                          | undefined;
                      }
                    | undefined;
                }>
              | undefined;
            leadOrganizations?:
              | Array<{
                  __typename?: 'Organization';
                  id: string;
                  nameID: string;
                  displayName: string;
                  activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    description?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  };
                  verification: {
                    __typename?: 'OrganizationVerification';
                    id: string;
                    status: OrganizationVerificationEnum;
                  };
                }>
              | undefined;
            memberOrganizations?:
              | Array<{
                  __typename?: 'Organization';
                  id: string;
                  nameID: string;
                  displayName: string;
                  activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    description?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  };
                  verification: {
                    __typename?: 'OrganizationVerification';
                    id: string;
                    status: OrganizationVerificationEnum;
                  };
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type OpportunityCommunityContributorsQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityCommunityContributorsQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      community?:
        | {
            __typename?: 'Community';
            id: string;
            leadUsers?:
              | Array<{
                  __typename?: 'User';
                  id: string;
                  nameID: string;
                  displayName: string;
                  agent?:
                    | {
                        __typename?: 'Agent';
                        id: string;
                        credentials?:
                          | Array<{
                              __typename?: 'Credential';
                              id: string;
                              type: AuthorizationCredential;
                              resourceID: string;
                            }>
                          | undefined;
                      }
                    | undefined;
                  profile?:
                    | {
                        __typename?: 'Profile';
                        id: string;
                        location?: { __typename?: 'Location'; country: string; city: string } | undefined;
                        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                        tagsets?:
                          | Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }>
                          | undefined;
                      }
                    | undefined;
                }>
              | undefined;
            memberUsers?:
              | Array<{
                  __typename?: 'User';
                  id: string;
                  nameID: string;
                  displayName: string;
                  agent?:
                    | {
                        __typename?: 'Agent';
                        id: string;
                        credentials?:
                          | Array<{
                              __typename?: 'Credential';
                              id: string;
                              type: AuthorizationCredential;
                              resourceID: string;
                            }>
                          | undefined;
                      }
                    | undefined;
                  profile?:
                    | {
                        __typename?: 'Profile';
                        id: string;
                        location?: { __typename?: 'Location'; country: string; city: string } | undefined;
                        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                        tagsets?:
                          | Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }>
                          | undefined;
                      }
                    | undefined;
                }>
              | undefined;
            leadOrganizations?:
              | Array<{
                  __typename?: 'Organization';
                  id: string;
                  nameID: string;
                  displayName: string;
                  activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    description?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  };
                  verification: {
                    __typename?: 'OrganizationVerification';
                    id: string;
                    status: OrganizationVerificationEnum;
                  };
                }>
              | undefined;
            memberOrganizations?:
              | Array<{
                  __typename?: 'Organization';
                  id: string;
                  nameID: string;
                  displayName: string;
                  activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    description?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  };
                  verification: {
                    __typename?: 'OrganizationVerification';
                    id: string;
                    status: OrganizationVerificationEnum;
                  };
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type CommunityMembersFragment = {
  __typename?: 'Community';
  leadUsers?:
    | Array<{
        __typename?: 'User';
        id: string;
        nameID: string;
        displayName: string;
        agent?:
          | {
              __typename?: 'Agent';
              id: string;
              credentials?:
                | Array<{ __typename?: 'Credential'; id: string; type: AuthorizationCredential; resourceID: string }>
                | undefined;
            }
          | undefined;
        profile?:
          | {
              __typename?: 'Profile';
              id: string;
              location?: { __typename?: 'Location'; country: string; city: string } | undefined;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              tagsets?: Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }> | undefined;
            }
          | undefined;
      }>
    | undefined;
  memberUsers?:
    | Array<{
        __typename?: 'User';
        id: string;
        nameID: string;
        displayName: string;
        agent?:
          | {
              __typename?: 'Agent';
              id: string;
              credentials?:
                | Array<{ __typename?: 'Credential'; id: string; type: AuthorizationCredential; resourceID: string }>
                | undefined;
            }
          | undefined;
        profile?:
          | {
              __typename?: 'Profile';
              id: string;
              location?: { __typename?: 'Location'; country: string; city: string } | undefined;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              tagsets?: Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }> | undefined;
            }
          | undefined;
      }>
    | undefined;
  leadOrganizations?:
    | Array<{
        __typename?: 'Organization';
        id: string;
        nameID: string;
        displayName: string;
        activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
        profile: {
          __typename?: 'Profile';
          id: string;
          description?: string | undefined;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        };
        verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
      }>
    | undefined;
  memberOrganizations?:
    | Array<{
        __typename?: 'Organization';
        id: string;
        nameID: string;
        displayName: string;
        activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
        profile: {
          __typename?: 'Profile';
          id: string;
          description?: string | undefined;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        };
        verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
      }>
    | undefined;
};

export type EntityDashboardCommunityFragment = {
  __typename?: 'Community';
  id: string;
  leadUsers?:
    | Array<{
        __typename?: 'User';
        id: string;
        displayName: string;
        nameID: string;
        profile?:
          | {
              __typename?: 'Profile';
              id: string;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
              tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
            }
          | undefined;
      }>
    | undefined;
  memberUsers?:
    | Array<{
        __typename?: 'User';
        id: string;
        displayName: string;
        nameID: string;
        profile?:
          | {
              __typename?: 'Profile';
              id: string;
              location?: { __typename?: 'Location'; city: string; country: string } | undefined;
              avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
              tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
            }
          | undefined;
      }>
    | undefined;
  leadOrganizations?:
    | Array<{
        __typename?: 'Organization';
        id: string;
        displayName: string;
        nameID: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          description?: string | undefined;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        };
        verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
        activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
      }>
    | undefined;
  memberOrganizations?:
    | Array<{
        __typename?: 'Organization';
        id: string;
        displayName: string;
        nameID: string;
        profile: {
          __typename?: 'Profile';
          id: string;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        };
      }>
    | undefined;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
};

export type DashboardContributingUserFragment = {
  __typename?: 'User';
  id: string;
  displayName: string;
  nameID: string;
  profile?:
    | {
        __typename?: 'Profile';
        id: string;
        location?: { __typename?: 'Location'; city: string; country: string } | undefined;
        avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
        tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
      }
    | undefined;
};

export type DashboardContributingOrganizationFragment = {
  __typename?: 'Organization';
  id: string;
  displayName: string;
  nameID: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
  };
};

export type DashboardLeadUserFragment = {
  __typename?: 'User';
  id: string;
  displayName: string;
  nameID: string;
  profile?:
    | {
        __typename?: 'Profile';
        id: string;
        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
        tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
      }
    | undefined;
};

export type ContributingUsersQueryVariables = Exact<{ [key: string]: never }>;

export type ContributingUsersQuery = {
  __typename?: 'Query';
  usersPaginated: {
    __typename?: 'PaginatedUsers';
    users: Array<{
      __typename?: 'User';
      id: string;
      displayName: string;
      nameID: string;
      profile?:
        | {
            __typename?: 'Profile';
            id: string;
            location?: { __typename?: 'Location'; city: string; country: string } | undefined;
            avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
            tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
          }
        | undefined;
    }>;
    pageInfo: { __typename?: 'PageInfo'; endCursor?: string | undefined; hasNextPage: boolean };
  };
};

export type CommunityMessagesFragment = {
  __typename?: 'Community';
  id: string;
  communication?:
    | {
        __typename?: 'Communication';
        id: string;
        updates?:
          | {
              __typename?: 'Updates';
              id: string;
              messages?:
                | Array<{ __typename?: 'Message'; id: string; sender: string; message: string; timestamp: number }>
                | undefined;
            }
          | undefined;
      }
    | undefined;
};

export type MessageDetailsFragment = {
  __typename?: 'Message';
  id: string;
  sender: string;
  message: string;
  timestamp: number;
};

export type CommunityPageMembersFragment = {
  __typename?: 'User';
  id: string;
  nameID: string;
  displayName: string;
  email: string;
  agent?:
    | {
        __typename?: 'Agent';
        id: string;
        credentials?:
          | Array<{ __typename?: 'Credential'; id: string; type: AuthorizationCredential; resourceID: string }>
          | undefined;
      }
    | undefined;
  profile?:
    | {
        __typename?: 'Profile';
        id: string;
        description?: string | undefined;
        location?: { __typename?: 'Location'; country: string; city: string } | undefined;
        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
      }
    | undefined;
};

export type CreateGroupOnCommunityMutationVariables = Exact<{
  input: CreateUserGroupInput;
}>;

export type CreateGroupOnCommunityMutation = {
  __typename?: 'Mutation';
  createGroupOnCommunity: { __typename?: 'UserGroup'; id: string; name: string };
};

export type AllCommunitiesQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type AllCommunitiesQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    community?: { __typename?: 'Community'; id: string; displayName: string } | undefined;
    challenges?:
      | Array<{
          __typename?: 'Challenge';
          community?: { __typename?: 'Community'; id: string; displayName: string } | undefined;
        }>
      | undefined;
    opportunities?:
      | Array<{
          __typename?: 'Opportunity';
          community?: { __typename?: 'Community'; id: string; displayName: string } | undefined;
        }>
      | undefined;
  };
};

export type AllCommunityDetailsFragment = { __typename?: 'Community'; id: string; displayName: string };

export type ChallengesWithCommunityQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type ChallengesWithCommunityQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    challenges?:
      | Array<{
          __typename?: 'Challenge';
          id: string;
          nameID: string;
          displayName: string;
          community?: { __typename?: 'Community'; id: string; displayName: string } | undefined;
        }>
      | undefined;
  };
};

export type CommunityGroupsQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  communityId: Scalars['UUID'];
}>;

export type CommunityGroupsQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    community?:
      | {
          __typename?: 'Community';
          id: string;
          displayName: string;
          groups?: Array<{ __typename?: 'UserGroup'; id: string; name: string }> | undefined;
        }
      | undefined;
  };
};

export type CommunityMembersQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  communityId: Scalars['UUID'];
}>;

export type CommunityMembersQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    community?:
      | {
          __typename?: 'Community';
          id: string;
          memberUsers?: Array<{ __typename?: 'User'; id: string; displayName: string }> | undefined;
        }
      | undefined;
  };
};

export type CommunityMessagesQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  communityId: Scalars['UUID'];
}>;

export type CommunityMessagesQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    community?:
      | {
          __typename?: 'Community';
          id: string;
          communication?:
            | {
                __typename?: 'Communication';
                id: string;
                updates?:
                  | {
                      __typename?: 'Updates';
                      id: string;
                      messages?:
                        | Array<{
                            __typename?: 'Message';
                            id: string;
                            sender: string;
                            message: string;
                            timestamp: number;
                          }>
                        | undefined;
                    }
                  | undefined;
              }
            | undefined;
        }
      | undefined;
  };
};

export type AvailableUsersQueryVariables = Exact<{
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<UserFilterInput>;
}>;

export type AvailableUsersQuery = {
  __typename?: 'Query';
  usersPaginated: {
    __typename?: 'PaginatedUsers';
    users: Array<{ __typename?: 'User'; id: string; displayName: string }>;
    pageInfo: { __typename?: 'PageInfo'; endCursor?: string | undefined; hasNextPage: boolean };
  };
};

export type BasicOrganizationDetailsFragment = {
  __typename?: 'Organization';
  id: string;
  displayName: string;
  nameID: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
  };
};

export type CommunityMemberUserFragment = {
  __typename?: 'User';
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type AllOrganizationsQueryVariables = Exact<{
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<OrganizationFilterInput>;
}>;

export type AllOrganizationsQuery = {
  __typename?: 'Query';
  organizationsPaginated: {
    __typename?: 'PaginatedOrganization';
    organization: Array<{
      __typename?: 'Organization';
      id: string;
      displayName: string;
      nameID: string;
      profile: {
        __typename?: 'Profile';
        id: string;
        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      };
    }>;
    pageInfo: {
      __typename?: 'PageInfo';
      startCursor?: string | undefined;
      endCursor?: string | undefined;
      hasNextPage: boolean;
    };
  };
};

export type ChallengeCommunityMembersQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeCommunityMembersQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      community?:
        | {
            __typename?: 'Community';
            id: string;
            memberUsers?:
              | Array<{
                  __typename?: 'User';
                  id: string;
                  displayName: string;
                  firstName: string;
                  lastName: string;
                  email: string;
                }>
              | undefined;
            leadUsers?:
              | Array<{
                  __typename?: 'User';
                  id: string;
                  displayName: string;
                  firstName: string;
                  lastName: string;
                  email: string;
                }>
              | undefined;
            memberOrganizations?:
              | Array<{
                  __typename?: 'Organization';
                  id: string;
                  displayName: string;
                  nameID: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    description?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
                    location?: { __typename?: 'Location'; country: string; city: string } | undefined;
                  };
                }>
              | undefined;
            leadOrganizations?:
              | Array<{
                  __typename?: 'Organization';
                  id: string;
                  displayName: string;
                  nameID: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    description?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
                    location?: { __typename?: 'Location'; country: string; city: string } | undefined;
                  };
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type HubCommunityMembersQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type HubCommunityMembersQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    community?:
      | {
          __typename?: 'Community';
          id: string;
          memberUsers?:
            | Array<{
                __typename?: 'User';
                id: string;
                displayName: string;
                firstName: string;
                lastName: string;
                email: string;
              }>
            | undefined;
          leadUsers?:
            | Array<{
                __typename?: 'User';
                id: string;
                displayName: string;
                firstName: string;
                lastName: string;
                email: string;
              }>
            | undefined;
          memberOrganizations?:
            | Array<{
                __typename?: 'Organization';
                id: string;
                displayName: string;
                nameID: string;
                profile: {
                  __typename?: 'Profile';
                  id: string;
                  description?: string | undefined;
                  avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                  tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
                  location?: { __typename?: 'Location'; country: string; city: string } | undefined;
                };
              }>
            | undefined;
        }
      | undefined;
  };
};

export type AssignUserAsCommunityMemberMutationVariables = Exact<{
  communityId: Scalars['UUID'];
  memberId: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type AssignUserAsCommunityMemberMutation = {
  __typename?: 'Mutation';
  assignUserAsCommunityMember: { __typename?: 'Community'; id: string; displayName: string };
};

export type AssignUserAsCommunityLeadMutationVariables = Exact<{
  communityId: Scalars['UUID'];
  memberId: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type AssignUserAsCommunityLeadMutation = {
  __typename?: 'Mutation';
  assignUserAsCommunityLead: { __typename?: 'Community'; id: string };
};

export type RemoveUserAsCommunityMemberMutationVariables = Exact<{
  communityId: Scalars['UUID'];
  memberId: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type RemoveUserAsCommunityMemberMutation = {
  __typename?: 'Mutation';
  removeUserAsCommunityMember: { __typename?: 'Community'; id: string };
};

export type RemoveUserAsCommunityLeadMutationVariables = Exact<{
  communityId: Scalars['UUID'];
  memberId: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type RemoveUserAsCommunityLeadMutation = {
  __typename?: 'Mutation';
  removeUserAsCommunityLead: { __typename?: 'Community'; id: string };
};

export type AssignOrganizationAsCommunityMemberMutationVariables = Exact<{
  communityId: Scalars['UUID'];
  memberId: Scalars['UUID_NAMEID'];
}>;

export type AssignOrganizationAsCommunityMemberMutation = {
  __typename?: 'Mutation';
  assignOrganizationAsCommunityMember: { __typename?: 'Community'; id: string };
};

export type AssignOrganizationAsCommunityLeadMutationVariables = Exact<{
  communityId: Scalars['UUID'];
  memberId: Scalars['UUID_NAMEID'];
}>;

export type AssignOrganizationAsCommunityLeadMutation = {
  __typename?: 'Mutation';
  assignOrganizationAsCommunityLead: { __typename?: 'Community'; id: string };
};

export type RemoveOrganizationAsCommunityMemberMutationVariables = Exact<{
  communityId: Scalars['UUID'];
  memberId: Scalars['UUID_NAMEID'];
}>;

export type RemoveOrganizationAsCommunityMemberMutation = {
  __typename?: 'Mutation';
  removeOrganizationAsCommunityMember: { __typename?: 'Community'; id: string };
};

export type RemoveOrganizationAsCommunityLeadMutationVariables = Exact<{
  communityId: Scalars['UUID'];
  memberId: Scalars['UUID_NAMEID'];
}>;

export type RemoveOrganizationAsCommunityLeadMutation = {
  __typename?: 'Mutation';
  removeOrganizationAsCommunityLead: { __typename?: 'Community'; id: string };
};

export type OpportunityCommunityMembersQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityCommunityMembersQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      community?:
        | {
            __typename?: 'Community';
            id: string;
            memberUsers?:
              | Array<{
                  __typename?: 'User';
                  id: string;
                  displayName: string;
                  firstName: string;
                  lastName: string;
                  email: string;
                }>
              | undefined;
            leadUsers?:
              | Array<{
                  __typename?: 'User';
                  id: string;
                  displayName: string;
                  firstName: string;
                  lastName: string;
                  email: string;
                }>
              | undefined;
            memberOrganizations?:
              | Array<{
                  __typename?: 'Organization';
                  id: string;
                  displayName: string;
                  nameID: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    description?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
                    location?: { __typename?: 'Location'; country: string; city: string } | undefined;
                  };
                }>
              | undefined;
            leadOrganizations?:
              | Array<{
                  __typename?: 'Organization';
                  id: string;
                  displayName: string;
                  nameID: string;
                  profile: {
                    __typename?: 'Profile';
                    id: string;
                    description?: string | undefined;
                    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                    tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
                    location?: { __typename?: 'Location'; country: string; city: string } | undefined;
                  };
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type ContextDetailsFragment = {
  __typename?: 'Context';
  id: string;
  tagline?: string | undefined;
  background?: string | undefined;
  vision?: string | undefined;
  impact?: string | undefined;
  who?: string | undefined;
  location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
  references?:
    | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
    | undefined;
  visuals?:
    | Array<{
        __typename?: 'Visual';
        id: string;
        uri: string;
        name: string;
        allowedTypes: Array<string>;
        aspectRatio: number;
        maxHeight: number;
        maxWidth: number;
        minHeight: number;
        minWidth: number;
      }>
    | undefined;
  authorization?:
    | {
        __typename?: 'Authorization';
        id: string;
        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
        anonymousReadAccess: boolean;
      }
    | undefined;
};

export type ContextDetailsProviderFragment = {
  __typename?: 'Context';
  id: string;
  tagline?: string | undefined;
  background?: string | undefined;
  vision?: string | undefined;
  impact?: string | undefined;
  who?: string | undefined;
  visuals?: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }> | undefined;
};

export type CreateReferenceOnContextMutationVariables = Exact<{
  input: CreateReferenceOnContextInput;
}>;

export type CreateReferenceOnContextMutation = {
  __typename?: 'Mutation';
  createReferenceOnContext: { __typename?: 'Reference'; id: string; name: string; uri: string; description: string };
};

export type HubProviderQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type HubProviderQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    nameID: string;
    displayName: string;
    authorization?:
      | {
          __typename?: 'Authorization';
          id: string;
          myPrivileges?: Array<AuthorizationPrivilege> | undefined;
          anonymousReadAccess: boolean;
        }
      | undefined;
    community?:
      | {
          __typename?: 'Community';
          id: string;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
        }
      | undefined;
    context?:
      | {
          __typename?: 'Context';
          id: string;
          tagline?: string | undefined;
          background?: string | undefined;
          vision?: string | undefined;
          impact?: string | undefined;
          who?: string | undefined;
          authorization?:
            | {
                __typename?: 'Authorization';
                id: string;
                myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                anonymousReadAccess: boolean;
              }
            | undefined;
          location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
          references?:
            | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
            | undefined;
          visuals?:
            | Array<{
                __typename?: 'Visual';
                id: string;
                uri: string;
                name: string;
                allowedTypes: Array<string>;
                aspectRatio: number;
                maxHeight: number;
                maxWidth: number;
                minHeight: number;
                minWidth: number;
              }>
            | undefined;
        }
      | undefined;
    templates?:
      | {
          __typename?: 'TemplatesSet';
          id: string;
          aspectTemplates: Array<{
            __typename?: 'AspectTemplate';
            id: string;
            defaultDescription: string;
            type: string;
            info: { __typename?: 'TemplateInfo'; id: string; title: string; description: string };
          }>;
          canvasTemplates: Array<{
            __typename?: 'CanvasTemplate';
            id: string;
            value: string;
            info: { __typename?: 'TemplateInfo'; id: string; title: string; description: string };
          }>;
          lifecycleTemplates: Array<{
            __typename?: 'LifecycleTemplate';
            id: string;
            definition: string;
            type: LifecycleType;
            info: { __typename?: 'TemplateInfo'; id: string; title: string; description: string };
          }>;
        }
      | undefined;
    tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
    host?: { __typename?: 'Organization'; id: string; displayName: string; nameID: string } | undefined;
  };
};

export type HubInfoFragment = {
  __typename?: 'Hub';
  id: string;
  nameID: string;
  displayName: string;
  authorization?:
    | {
        __typename?: 'Authorization';
        id: string;
        myPrivileges?: Array<AuthorizationPrivilege> | undefined;
        anonymousReadAccess: boolean;
      }
    | undefined;
  community?:
    | {
        __typename?: 'Community';
        id: string;
        authorization?:
          | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
          | undefined;
      }
    | undefined;
  context?:
    | {
        __typename?: 'Context';
        id: string;
        tagline?: string | undefined;
        background?: string | undefined;
        vision?: string | undefined;
        impact?: string | undefined;
        who?: string | undefined;
        authorization?:
          | {
              __typename?: 'Authorization';
              id: string;
              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
              anonymousReadAccess: boolean;
            }
          | undefined;
        location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
        references?:
          | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
          | undefined;
        visuals?:
          | Array<{
              __typename?: 'Visual';
              id: string;
              uri: string;
              name: string;
              allowedTypes: Array<string>;
              aspectRatio: number;
              maxHeight: number;
              maxWidth: number;
              minHeight: number;
              minWidth: number;
            }>
          | undefined;
      }
    | undefined;
  templates?:
    | {
        __typename?: 'TemplatesSet';
        id: string;
        aspectTemplates: Array<{
          __typename?: 'AspectTemplate';
          id: string;
          defaultDescription: string;
          type: string;
          info: { __typename?: 'TemplateInfo'; id: string; title: string; description: string };
        }>;
        canvasTemplates: Array<{
          __typename?: 'CanvasTemplate';
          id: string;
          value: string;
          info: { __typename?: 'TemplateInfo'; id: string; title: string; description: string };
        }>;
        lifecycleTemplates: Array<{
          __typename?: 'LifecycleTemplate';
          id: string;
          definition: string;
          type: LifecycleType;
          info: { __typename?: 'TemplateInfo'; id: string; title: string; description: string };
        }>;
      }
    | undefined;
  tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
  host?: { __typename?: 'Organization'; id: string; displayName: string; nameID: string } | undefined;
};

export type AdminHubFragment = {
  __typename?: 'Hub';
  id: string;
  nameID: string;
  displayName: string;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
};

export type HubDetailsFragment = {
  __typename?: 'Hub';
  id: string;
  nameID: string;
  displayName: string;
  tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
  authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
  host?: { __typename?: 'Organization'; id: string; displayName: string; nameID: string } | undefined;
  context?:
    | {
        __typename?: 'Context';
        id: string;
        tagline?: string | undefined;
        background?: string | undefined;
        vision?: string | undefined;
        impact?: string | undefined;
        who?: string | undefined;
        location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
        references?:
          | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
          | undefined;
        visuals?:
          | Array<{
              __typename?: 'Visual';
              id: string;
              uri: string;
              name: string;
              allowedTypes: Array<string>;
              aspectRatio: number;
              maxHeight: number;
              maxWidth: number;
              minHeight: number;
              minWidth: number;
            }>
          | undefined;
        authorization?:
          | {
              __typename?: 'Authorization';
              id: string;
              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
              anonymousReadAccess: boolean;
            }
          | undefined;
      }
    | undefined;
};

export type HubDetailsProviderFragment = {
  __typename?: 'Hub';
  id: string;
  nameID: string;
  displayName: string;
  authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
  activity?: Array<{ __typename?: 'NVP'; name: string; value: string }> | undefined;
  community?: { __typename?: 'Community'; id: string } | undefined;
  tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
  context?:
    | {
        __typename?: 'Context';
        id: string;
        tagline?: string | undefined;
        background?: string | undefined;
        vision?: string | undefined;
        impact?: string | undefined;
        who?: string | undefined;
        visuals?: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }> | undefined;
      }
    | undefined;
};

export type HubNameFragment = { __typename?: 'Hub'; id: string; nameID: string; displayName: string };

export type CreateHubMutationVariables = Exact<{
  input: CreateHubInput;
}>;

export type CreateHubMutation = {
  __typename?: 'Mutation';
  createHub: {
    __typename?: 'Hub';
    id: string;
    nameID: string;
    displayName: string;
    tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
    authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
    host?: { __typename?: 'Organization'; id: string; displayName: string; nameID: string } | undefined;
    context?:
      | {
          __typename?: 'Context';
          id: string;
          tagline?: string | undefined;
          background?: string | undefined;
          vision?: string | undefined;
          impact?: string | undefined;
          who?: string | undefined;
          location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
          references?:
            | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
            | undefined;
          visuals?:
            | Array<{
                __typename?: 'Visual';
                id: string;
                uri: string;
                name: string;
                allowedTypes: Array<string>;
                aspectRatio: number;
                maxHeight: number;
                maxWidth: number;
                minHeight: number;
                minWidth: number;
              }>
            | undefined;
          authorization?:
            | {
                __typename?: 'Authorization';
                id: string;
                myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                anonymousReadAccess: boolean;
              }
            | undefined;
        }
      | undefined;
  };
};

export type DeleteHubMutationVariables = Exact<{
  input: DeleteHubInput;
}>;

export type DeleteHubMutation = {
  __typename?: 'Mutation';
  deleteHub: { __typename?: 'Hub'; id: string; nameID: string; displayName: string };
};

export type UpdateHubMutationVariables = Exact<{
  input: UpdateHubInput;
}>;

export type UpdateHubMutation = {
  __typename?: 'Mutation';
  updateHub: {
    __typename?: 'Hub';
    id: string;
    nameID: string;
    displayName: string;
    tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
    authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
    host?: { __typename?: 'Organization'; id: string; displayName: string; nameID: string } | undefined;
    context?:
      | {
          __typename?: 'Context';
          id: string;
          tagline?: string | undefined;
          background?: string | undefined;
          vision?: string | undefined;
          impact?: string | undefined;
          who?: string | undefined;
          location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
          references?:
            | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
            | undefined;
          visuals?:
            | Array<{
                __typename?: 'Visual';
                id: string;
                uri: string;
                name: string;
                allowedTypes: Array<string>;
                aspectRatio: number;
                maxHeight: number;
                maxWidth: number;
                minHeight: number;
                minWidth: number;
              }>
            | undefined;
          authorization?:
            | {
                __typename?: 'Authorization';
                id: string;
                myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                anonymousReadAccess: boolean;
              }
            | undefined;
        }
      | undefined;
  };
};

export type AdminHubsListQueryVariables = Exact<{ [key: string]: never }>;

export type AdminHubsListQuery = {
  __typename?: 'Query';
  hubs: Array<{
    __typename?: 'Hub';
    id: string;
    nameID: string;
    displayName: string;
    authorization?:
      | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
      | undefined;
  }>;
};

export type HubActivityQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type HubActivityQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    activity?: Array<{ __typename?: 'NVP'; name: string; value: string }> | undefined;
  };
};

export type HubApplicationTemplateQueryVariables = Exact<{ [key: string]: never }>;

export type HubApplicationTemplateQuery = {
  __typename?: 'Query';
  configuration: {
    __typename?: 'Config';
    template: {
      __typename?: 'Template';
      hubs: Array<{
        __typename?: 'PlatformHubTemplate';
        name: string;
        applications?:
          | Array<{
              __typename?: 'ApplicationTemplate';
              name: string;
              questions: Array<{
                __typename?: 'QuestionTemplate';
                required: boolean;
                question: string;
                sortOrder?: number | undefined;
              }>;
            }>
          | undefined;
      }>;
    };
  };
};

export type HubCardQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type HubCardQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    nameID: string;
    displayName: string;
    authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
    activity?: Array<{ __typename?: 'NVP'; name: string; value: string }> | undefined;
    community?: { __typename?: 'Community'; id: string } | undefined;
    tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
    context?:
      | {
          __typename?: 'Context';
          id: string;
          tagline?: string | undefined;
          background?: string | undefined;
          vision?: string | undefined;
          impact?: string | undefined;
          who?: string | undefined;
          visuals?: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }> | undefined;
        }
      | undefined;
  };
};

export type HubGroupQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  groupId: Scalars['UUID'];
}>;

export type HubGroupQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    group: {
      __typename?: 'UserGroup';
      id: string;
      name: string;
      profile?:
        | {
            __typename?: 'Profile';
            id: string;
            description?: string | undefined;
            avatar?:
              | {
                  __typename?: 'Visual';
                  id: string;
                  uri: string;
                  name: string;
                  allowedTypes: Array<string>;
                  aspectRatio: number;
                  maxHeight: number;
                  maxWidth: number;
                  minHeight: number;
                  minWidth: number;
                }
              | undefined;
            references?:
              | Array<{ __typename?: 'Reference'; id: string; uri: string; name: string; description: string }>
              | undefined;
            tagsets?: Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }> | undefined;
          }
        | undefined;
    };
  };
};

export type HubGroupsListQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type HubGroupsListQuery = {
  __typename?: 'Query';
  hub: { __typename?: 'Hub'; id: string; groups: Array<{ __typename?: 'UserGroup'; id: string; name: string }> };
};

export type HubHostReferencesQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type HubHostReferencesQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    host?:
      | {
          __typename?: 'Organization';
          profile: {
            __typename?: 'Profile';
            id: string;
            references?: Array<{ __typename?: 'Reference'; name: string; uri: string }> | undefined;
          };
        }
      | undefined;
  };
};

export type HubLifecycleTemplatesQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type HubLifecycleTemplatesQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    templates?:
      | {
          __typename?: 'TemplatesSet';
          id: string;
          lifecycleTemplates: Array<{
            __typename?: 'LifecycleTemplate';
            definition: string;
            id: string;
            type: LifecycleType;
            info: { __typename?: 'TemplateInfo'; id: string; title: string };
          }>;
        }
      | undefined;
  };
};

export type HubMembersQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type HubMembersQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    community?:
      | {
          __typename?: 'Community';
          id: string;
          memberUsers?:
            | Array<{
                __typename?: 'User';
                id: string;
                displayName: string;
                firstName: string;
                lastName: string;
                email: string;
              }>
            | undefined;
        }
      | undefined;
  };
};

export type HubNameQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type HubNameQuery = {
  __typename?: 'Query';
  hub: { __typename?: 'Hub'; id: string; nameID: string; displayName: string };
};

export type HubUserIdsQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type HubUserIdsQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    community?:
      | { __typename?: 'Community'; id: string; memberUsers?: Array<{ __typename?: 'User'; id: string }> | undefined }
      | undefined;
  };
};

export type HubVisualQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type HubVisualQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    context?:
      | {
          __typename?: 'Context';
          visuals?: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }> | undefined;
        }
      | undefined;
  };
};

export type HubsQueryVariables = Exact<{ [key: string]: never }>;

export type HubsQuery = {
  __typename?: 'Query';
  hubs: Array<{
    __typename?: 'Hub';
    id: string;
    nameID: string;
    displayName: string;
    authorization?: { __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean } | undefined;
    activity?: Array<{ __typename?: 'NVP'; name: string; value: string }> | undefined;
    community?: { __typename?: 'Community'; id: string } | undefined;
    tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
    context?:
      | {
          __typename?: 'Context';
          id: string;
          tagline?: string | undefined;
          background?: string | undefined;
          vision?: string | undefined;
          impact?: string | undefined;
          who?: string | undefined;
          visuals?: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }> | undefined;
        }
      | undefined;
  }>;
};

export type OpportunityProviderQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityProviderQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    nameID: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      nameID: string;
      displayName: string;
      authorization?:
        | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
        | undefined;
      context?:
        | {
            __typename?: 'Context';
            id: string;
            tagline?: string | undefined;
            authorization?:
              | {
                  __typename?: 'Authorization';
                  id: string;
                  myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                  anonymousReadAccess: boolean;
                }
              | undefined;
            visuals?:
              | Array<{
                  __typename?: 'Visual';
                  id: string;
                  uri: string;
                  name: string;
                  allowedTypes: Array<string>;
                  aspectRatio: number;
                  maxHeight: number;
                  maxWidth: number;
                  minHeight: number;
                  minWidth: number;
                }>
              | undefined;
            location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
          }
        | undefined;
      community?:
        | {
            __typename?: 'Community';
            id: string;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
          }
        | undefined;
    };
  };
};

export type OpportunityProviderFragment = {
  __typename?: 'Opportunity';
  id: string;
  nameID: string;
  displayName: string;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
  context?:
    | {
        __typename?: 'Context';
        id: string;
        tagline?: string | undefined;
        authorization?:
          | {
              __typename?: 'Authorization';
              id: string;
              myPrivileges?: Array<AuthorizationPrivilege> | undefined;
              anonymousReadAccess: boolean;
            }
          | undefined;
        visuals?:
          | Array<{
              __typename?: 'Visual';
              id: string;
              uri: string;
              name: string;
              allowedTypes: Array<string>;
              aspectRatio: number;
              maxHeight: number;
              maxWidth: number;
              minHeight: number;
              minWidth: number;
            }>
          | undefined;
        location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
      }
    | undefined;
  community?:
    | {
        __typename?: 'Community';
        id: string;
        authorization?:
          | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
          | undefined;
      }
    | undefined;
};

export type NewOpportunityFragment = { __typename?: 'Opportunity'; id: string; nameID: string; displayName: string };

export type OpportunitySearchResultFragment = {
  __typename?: 'Opportunity';
  id: string;
  displayName: string;
  nameID: string;
  activity?: Array<{ __typename?: 'NVP'; name: string; value: string }> | undefined;
  context?:
    | {
        __typename?: 'Context';
        id: string;
        tagline?: string | undefined;
        visuals?: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }> | undefined;
      }
    | undefined;
  tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
  challenge?: { __typename?: 'Challenge'; id: string; nameID: string; displayName: string; hubID: string } | undefined;
};

export type CreateOpportunityMutationVariables = Exact<{
  input: CreateOpportunityInput;
}>;

export type CreateOpportunityMutation = {
  __typename?: 'Mutation';
  createOpportunity: { __typename?: 'Opportunity'; id: string; nameID: string; displayName: string };
};

export type DeleteOpportunityMutationVariables = Exact<{
  input: DeleteOpportunityInput;
}>;

export type DeleteOpportunityMutation = {
  __typename?: 'Mutation';
  deleteOpportunity: { __typename?: 'Opportunity'; id: string; nameID: string };
};

export type UpdateOpportunityMutationVariables = Exact<{
  input: UpdateOpportunityInput;
}>;

export type UpdateOpportunityMutation = {
  __typename?: 'Mutation';
  updateOpportunity: { __typename?: 'Opportunity'; id: string; displayName: string };
};

export type AllOpportunitiesQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type AllOpportunitiesQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    opportunities?: Array<{ __typename?: 'Opportunity'; id: string; nameID: string }> | undefined;
  };
};

export type OpportunitiesQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type OpportunitiesQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      opportunities?:
        | Array<{ __typename?: 'Opportunity'; id: string; nameID: string; displayName: string }>
        | undefined;
    };
  };
};

export type OpportunityActivityQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityActivityQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      activity?: Array<{ __typename?: 'NVP'; name: string; value: string }> | undefined;
    };
  };
};

export type OpportunityActorGroupsQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityActorGroupsQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      context?:
        | {
            __typename?: 'Context';
            id: string;
            ecosystemModel?:
              | {
                  __typename?: 'EcosystemModel';
                  id: string;
                  actorGroups?:
                    | Array<{
                        __typename?: 'ActorGroup';
                        id: string;
                        name: string;
                        description?: string | undefined;
                        actors?:
                          | Array<{
                              __typename?: 'Actor';
                              id: string;
                              name: string;
                              description?: string | undefined;
                              value?: string | undefined;
                              impact?: string | undefined;
                            }>
                          | undefined;
                      }>
                    | undefined;
                }
              | undefined;
          }
        | undefined;
    };
  };
};

export type OpportunityAspectsOldQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityAspectsOldQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            callouts?:
              | Array<{
                  __typename?: 'Callout';
                  id: string;
                  aspects?: Array<{ __typename?: 'Aspect'; id: string; displayName: string }> | undefined;
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type OpportunityEcosystemDetailsQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityEcosystemDetailsQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      context?:
        | {
            __typename?: 'Context';
            ecosystemModel?:
              | {
                  __typename?: 'EcosystemModel';
                  id: string;
                  actorGroups?:
                    | Array<{
                        __typename?: 'ActorGroup';
                        id: string;
                        name: string;
                        description?: string | undefined;
                        actors?:
                          | Array<{
                              __typename?: 'Actor';
                              id: string;
                              name: string;
                              description?: string | undefined;
                              value?: string | undefined;
                              impact?: string | undefined;
                            }>
                          | undefined;
                      }>
                    | undefined;
                }
              | undefined;
          }
        | undefined;
    };
  };
};

export type OpportunityGroupsQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityGroupsQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      community?:
        | {
            __typename?: 'Community';
            groups?: Array<{ __typename?: 'UserGroup'; id: string; name: string }> | undefined;
          }
        | undefined;
    };
  };
};

export type OpportunityLifecycleQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityLifecycleQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      lifecycle?:
        | {
            __typename?: 'Lifecycle';
            id: string;
            machineDef: string;
            state?: string | undefined;
            nextEvents?: Array<string> | undefined;
            stateIsFinal: boolean;
          }
        | undefined;
    };
  };
};

export type OpportunityNameQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityNameQuery = {
  __typename?: 'Query';
  hub: { __typename?: 'Hub'; id: string; opportunity: { __typename?: 'Opportunity'; id: string; displayName: string } };
};

export type OpportunityProfileInfoQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityProfileInfoQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      nameID: string;
      displayName: string;
      tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
      context?:
        | {
            __typename?: 'Context';
            id: string;
            tagline?: string | undefined;
            background?: string | undefined;
            vision?: string | undefined;
            impact?: string | undefined;
            who?: string | undefined;
            location?: { __typename?: 'Location'; id: string; country: string; city: string } | undefined;
            references?:
              | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
              | undefined;
            visuals?:
              | Array<{
                  __typename?: 'Visual';
                  id: string;
                  uri: string;
                  name: string;
                  allowedTypes: Array<string>;
                  aspectRatio: number;
                  maxHeight: number;
                  maxWidth: number;
                  minHeight: number;
                  minWidth: number;
                }>
              | undefined;
            authorization?:
              | {
                  __typename?: 'Authorization';
                  id: string;
                  myPrivileges?: Array<AuthorizationPrivilege> | undefined;
                  anonymousReadAccess: boolean;
                }
              | undefined;
          }
        | undefined;
    };
  };
};

export type OpportunityRelationsQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityRelationsQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      collaboration?:
        | {
            __typename?: 'Collaboration';
            id: string;
            relations?:
              | Array<{
                  __typename?: 'Relation';
                  id: string;
                  actorRole: string;
                  actorName: string;
                  actorType: string;
                  description: string;
                  type: string;
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type OpportunityUserIdsQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityUserIdsQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      community?:
        | { __typename?: 'Community'; memberUsers?: Array<{ __typename?: 'User'; id: string }> | undefined }
        | undefined;
    };
  };
};

export type OpportunityWithActivityQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityWithActivityQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    opportunities?:
      | Array<{
          __typename?: 'Opportunity';
          id: string;
          displayName: string;
          nameID: string;
          activity?: Array<{ __typename?: 'NVP'; name: string; value: string }> | undefined;
          context?:
            | {
                __typename?: 'Context';
                tagline?: string | undefined;
                visuals?: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }> | undefined;
              }
            | undefined;
          tagset?: { __typename?: 'Tagset'; name: string; tags: Array<string> } | undefined;
        }>
      | undefined;
  };
};

export type AssociatedOrganizationQueryVariables = Exact<{
  organizationId: Scalars['UUID_NAMEID'];
}>;

export type AssociatedOrganizationQuery = {
  __typename?: 'Query';
  organization: {
    __typename?: 'Organization';
    id: string;
    displayName: string;
    nameID: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      description?: string | undefined;
      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    };
    verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
    activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
  };
};

export type AssociatedOrganizationDetailsFragment = {
  __typename?: 'Organization';
  id: string;
  displayName: string;
  nameID: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    description?: string | undefined;
    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
  };
  verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
  activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
};

export type OrganizationCardFragment = {
  __typename?: 'Organization';
  id: string;
  nameID: string;
  displayName: string;
  activity?: Array<{ __typename?: 'NVP'; id: string; name: string; value: string }> | undefined;
  profile: {
    __typename?: 'Profile';
    id: string;
    description?: string | undefined;
    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
  };
  verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
};

export type OrganizationSearchResultFragment = {
  __typename?: 'Organization';
  id: string;
  displayName: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    tagsets?: Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }> | undefined;
  };
};

export type OrganizationDetailsFragment = {
  __typename?: 'Organization';
  id: string;
  displayName: string;
  nameID: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    description?: string | undefined;
    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
    location?: { __typename?: 'Location'; country: string; city: string } | undefined;
  };
};

export type OrganizationInfoFragment = {
  __typename?: 'Organization';
  id: string;
  nameID: string;
  displayName: string;
  contactEmail?: string | undefined;
  domain?: string | undefined;
  website?: string | undefined;
  verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
  profile: {
    __typename?: 'Profile';
    id: string;
    description?: string | undefined;
    avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    tagsets?: Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }> | undefined;
    references?: Array<{ __typename?: 'Reference'; id: string; name: string; uri: string }> | undefined;
    location?: { __typename?: 'Location'; country: string; city: string } | undefined;
  };
  members?:
    | Array<{
        __typename?: 'User';
        id: string;
        nameID: string;
        displayName: string;
        agent?:
          | {
              __typename?: 'Agent';
              id: string;
              credentials?:
                | Array<{ __typename?: 'Credential'; id: string; type: AuthorizationCredential; resourceID: string }>
                | undefined;
            }
          | undefined;
        profile?:
          | {
              __typename?: 'Profile';
              id: string;
              location?: { __typename?: 'Location'; country: string; city: string } | undefined;
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
            }
          | undefined;
      }>
    | undefined;
};

export type OrganizationProfileInfoFragment = {
  __typename?: 'Organization';
  id: string;
  nameID: string;
  displayName: string;
  contactEmail?: string | undefined;
  domain?: string | undefined;
  legalEntityName?: string | undefined;
  website?: string | undefined;
  verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
  profile: {
    __typename?: 'Profile';
    id: string;
    description?: string | undefined;
    avatar?:
      | {
          __typename?: 'Visual';
          id: string;
          uri: string;
          name: string;
          allowedTypes: Array<string>;
          aspectRatio: number;
          maxHeight: number;
          maxWidth: number;
          minHeight: number;
          minWidth: number;
        }
      | undefined;
    location?: { __typename?: 'Location'; country: string; city: string } | undefined;
    references?:
      | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
      | undefined;
    tagsets?: Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }> | undefined;
  };
};

export type CreateGroupOnOrganizationMutationVariables = Exact<{
  input: CreateUserGroupInput;
}>;

export type CreateGroupOnOrganizationMutation = {
  __typename?: 'Mutation';
  createGroupOnOrganization: { __typename?: 'UserGroup'; id: string; name: string };
};

export type CreateOrganizationMutationVariables = Exact<{
  input: CreateOrganizationInput;
}>;

export type CreateOrganizationMutation = {
  __typename?: 'Mutation';
  createOrganization: { __typename?: 'Organization'; id: string; nameID: string; displayName: string };
};

export type DeleteOrganizationMutationVariables = Exact<{
  input: DeleteOrganizationInput;
}>;

export type DeleteOrganizationMutation = {
  __typename?: 'Mutation';
  deleteOrganization: { __typename?: 'Organization'; id: string };
};

export type UpdateOrganizationMutationVariables = Exact<{
  input: UpdateOrganizationInput;
}>;

export type UpdateOrganizationMutation = {
  __typename?: 'Mutation';
  updateOrganization: {
    __typename?: 'Organization';
    id: string;
    nameID: string;
    displayName: string;
    contactEmail?: string | undefined;
    domain?: string | undefined;
    legalEntityName?: string | undefined;
    website?: string | undefined;
    verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
    profile: {
      __typename?: 'Profile';
      id: string;
      description?: string | undefined;
      avatar?:
        | {
            __typename?: 'Visual';
            id: string;
            uri: string;
            name: string;
            allowedTypes: Array<string>;
            aspectRatio: number;
            maxHeight: number;
            maxWidth: number;
            minHeight: number;
            minWidth: number;
          }
        | undefined;
      location?: { __typename?: 'Location'; country: string; city: string } | undefined;
      references?:
        | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
        | undefined;
      tagsets?: Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }> | undefined;
    };
  };
};

export type OrganizationGroupQueryVariables = Exact<{
  organizationId: Scalars['UUID_NAMEID'];
  groupId: Scalars['UUID'];
}>;

export type OrganizationGroupQuery = {
  __typename?: 'Query';
  organization: {
    __typename?: 'Organization';
    id: string;
    members?:
      | Array<{
          __typename?: 'User';
          id: string;
          displayName: string;
          firstName: string;
          lastName: string;
          email: string;
        }>
      | undefined;
    group?:
      | {
          __typename?: 'UserGroup';
          id: string;
          name: string;
          profile?:
            | {
                __typename?: 'Profile';
                id: string;
                description?: string | undefined;
                avatar?:
                  | {
                      __typename?: 'Visual';
                      id: string;
                      uri: string;
                      name: string;
                      allowedTypes: Array<string>;
                      aspectRatio: number;
                      maxHeight: number;
                      maxWidth: number;
                      minHeight: number;
                      minWidth: number;
                    }
                  | undefined;
                references?:
                  | Array<{ __typename?: 'Reference'; id: string; uri: string; name: string; description: string }>
                  | undefined;
                tagsets?: Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }> | undefined;
              }
            | undefined;
        }
      | undefined;
  };
};

export type OrganizationDetailsQueryVariables = Exact<{
  id: Scalars['UUID_NAMEID'];
}>;

export type OrganizationDetailsQuery = {
  __typename?: 'Query';
  organization: {
    __typename?: 'Organization';
    id: string;
    displayName: string;
    nameID: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      description?: string | undefined;
      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      references?: Array<{ __typename?: 'Reference'; name: string; uri: string }> | undefined;
      tagsets?: Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }> | undefined;
    };
    groups?:
      | Array<{
          __typename?: 'UserGroup';
          id: string;
          name: string;
          members?: Array<{ __typename?: 'User'; id: string; displayName: string }> | undefined;
        }>
      | undefined;
  };
};

export type OrganizationGroupsQueryVariables = Exact<{
  id: Scalars['UUID_NAMEID'];
}>;

export type OrganizationGroupsQuery = {
  __typename?: 'Query';
  organization: {
    __typename?: 'Organization';
    id: string;
    groups?: Array<{ __typename?: 'UserGroup'; id: string; name: string }> | undefined;
  };
};

export type OrganizationInfoQueryVariables = Exact<{
  organizationId: Scalars['UUID_NAMEID'];
}>;

export type OrganizationInfoQuery = {
  __typename?: 'Query';
  organization: {
    __typename?: 'Organization';
    id: string;
    nameID: string;
    displayName: string;
    contactEmail?: string | undefined;
    domain?: string | undefined;
    website?: string | undefined;
    verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
    profile: {
      __typename?: 'Profile';
      id: string;
      description?: string | undefined;
      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
      tagsets?: Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }> | undefined;
      references?: Array<{ __typename?: 'Reference'; id: string; name: string; uri: string }> | undefined;
      location?: { __typename?: 'Location'; country: string; city: string } | undefined;
    };
    members?:
      | Array<{
          __typename?: 'User';
          id: string;
          nameID: string;
          displayName: string;
          agent?:
            | {
                __typename?: 'Agent';
                id: string;
                credentials?:
                  | Array<{ __typename?: 'Credential'; id: string; type: AuthorizationCredential; resourceID: string }>
                  | undefined;
              }
            | undefined;
          profile?:
            | {
                __typename?: 'Profile';
                id: string;
                location?: { __typename?: 'Location'; country: string; city: string } | undefined;
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
              }
            | undefined;
        }>
      | undefined;
  };
};

export type OrganizationNameQueryVariables = Exact<{
  id: Scalars['UUID_NAMEID'];
}>;

export type OrganizationNameQuery = {
  __typename?: 'Query';
  organization: { __typename?: 'Organization'; id: string; displayName: string };
};

export type OrganizationProfileInfoQueryVariables = Exact<{
  id: Scalars['UUID_NAMEID'];
}>;

export type OrganizationProfileInfoQuery = {
  __typename?: 'Query';
  organization: {
    __typename?: 'Organization';
    id: string;
    nameID: string;
    displayName: string;
    contactEmail?: string | undefined;
    domain?: string | undefined;
    legalEntityName?: string | undefined;
    website?: string | undefined;
    verification: { __typename?: 'OrganizationVerification'; id: string; status: OrganizationVerificationEnum };
    profile: {
      __typename?: 'Profile';
      id: string;
      description?: string | undefined;
      avatar?:
        | {
            __typename?: 'Visual';
            id: string;
            uri: string;
            name: string;
            allowedTypes: Array<string>;
            aspectRatio: number;
            maxHeight: number;
            maxWidth: number;
            minHeight: number;
            minWidth: number;
          }
        | undefined;
      location?: { __typename?: 'Location'; country: string; city: string } | undefined;
      references?:
        | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
        | undefined;
      tagsets?: Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }> | undefined;
    };
  };
};

export type OrganizationsListQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Float']>;
  shuffle?: InputMaybe<Scalars['Boolean']>;
}>;

export type OrganizationsListQuery = {
  __typename?: 'Query';
  organizations: Array<{
    __typename?: 'Organization';
    id: string;
    nameID: string;
    displayName: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
    };
  }>;
};

export type RolesOrganizationQueryVariables = Exact<{
  input: RolesOrganizationInput;
}>;

export type RolesOrganizationQuery = {
  __typename?: 'Query';
  rolesOrganization: {
    __typename?: 'ContributorRoles';
    id: string;
    hubs: Array<{
      __typename?: 'RolesResultHub';
      nameID: string;
      id: string;
      roles: Array<string>;
      displayName: string;
      challenges: Array<{
        __typename?: 'RolesResultCommunity';
        nameID: string;
        id: string;
        displayName: string;
        roles: Array<string>;
      }>;
    }>;
  };
};

export type PageInfoFragment = {
  __typename?: 'PageInfo';
  startCursor?: string | undefined;
  endCursor?: string | undefined;
  hasNextPage: boolean;
};

export type UserCardFragment = {
  __typename?: 'User';
  id: string;
  nameID: string;
  displayName: string;
  agent?:
    | {
        __typename?: 'Agent';
        id: string;
        credentials?:
          | Array<{ __typename?: 'Credential'; id: string; type: AuthorizationCredential; resourceID: string }>
          | undefined;
      }
    | undefined;
  profile?:
    | {
        __typename?: 'Profile';
        id: string;
        location?: { __typename?: 'Location'; country: string; city: string } | undefined;
        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        tagsets?: Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }> | undefined;
      }
    | undefined;
};

export type GroupDetailsFragment = { __typename?: 'UserGroup'; id: string; name: string };

export type GroupInfoFragment = {
  __typename?: 'UserGroup';
  id: string;
  name: string;
  profile?:
    | {
        __typename?: 'Profile';
        id: string;
        description?: string | undefined;
        avatar?:
          | {
              __typename?: 'Visual';
              id: string;
              uri: string;
              name: string;
              allowedTypes: Array<string>;
              aspectRatio: number;
              maxHeight: number;
              maxWidth: number;
              minHeight: number;
              minWidth: number;
            }
          | undefined;
        references?:
          | Array<{ __typename?: 'Reference'; id: string; uri: string; name: string; description: string }>
          | undefined;
        tagsets?: Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }> | undefined;
      }
    | undefined;
};

export type GroupMembersFragment = {
  __typename?: 'User';
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type UserAgentFragment = {
  __typename?: 'User';
  agent?:
    | {
        __typename?: 'Agent';
        id: string;
        did?: string | undefined;
        credentials?:
          | Array<{ __typename?: 'Credential'; id: string; resourceID: string; type: AuthorizationCredential }>
          | undefined;
      }
    | undefined;
};

export type UserDetailsFragment = {
  __typename?: 'User';
  id: string;
  nameID: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  phone: string;
  accountUpn: string;
  agent?:
    | {
        __typename?: 'Agent';
        credentials?:
          | Array<{ __typename?: 'Credential'; type: AuthorizationCredential; resourceID: string }>
          | undefined;
      }
    | undefined;
  profile?:
    | {
        __typename?: 'Profile';
        id: string;
        description?: string | undefined;
        location?: { __typename?: 'Location'; country: string; city: string } | undefined;
        avatar?:
          | {
              __typename?: 'Visual';
              id: string;
              uri: string;
              name: string;
              allowedTypes: Array<string>;
              aspectRatio: number;
              maxHeight: number;
              maxWidth: number;
              minHeight: number;
              minWidth: number;
            }
          | undefined;
        references?:
          | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
          | undefined;
        tagsets?: Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }> | undefined;
      }
    | undefined;
};

export type UserDisplayNameFragment = { __typename?: 'User'; id: string; displayName: string };

export type UserRolesDetailsFragment = {
  __typename?: 'ContributorRoles';
  hubs: Array<{
    __typename?: 'RolesResultHub';
    id: string;
    nameID: string;
    hubID: string;
    displayName: string;
    roles: Array<string>;
    challenges: Array<{
      __typename?: 'RolesResultCommunity';
      id: string;
      nameID: string;
      displayName: string;
      roles: Array<string>;
    }>;
    opportunities: Array<{
      __typename?: 'RolesResultCommunity';
      id: string;
      nameID: string;
      displayName: string;
      roles: Array<string>;
    }>;
    userGroups: Array<{ __typename?: 'RolesResult'; id: string; nameID: string; displayName: string }>;
  }>;
  organizations: Array<{
    __typename?: 'RolesResultOrganization';
    id: string;
    nameID: string;
    displayName: string;
    roles: Array<string>;
    userGroups: Array<{ __typename?: 'RolesResult'; id: string; nameID: string; displayName: string }>;
  }>;
  applications?:
    | Array<{
        __typename?: 'ApplicationForRoleResult';
        id: string;
        communityID: string;
        displayName: string;
        state: string;
        hubID: string;
        challengeID?: string | undefined;
        opportunityID?: string | undefined;
      }>
    | undefined;
};

export type UserSearchResultFragment = { __typename?: 'UserGroup'; name: string; id: string };

export type AssignUserToGroupMutationVariables = Exact<{
  input: AssignUserGroupMemberInput;
}>;

export type AssignUserToGroupMutation = {
  __typename?: 'Mutation';
  assignUserToGroup: {
    __typename?: 'UserGroup';
    id: string;
    members?:
      | Array<{
          __typename?: 'User';
          id: string;
          displayName: string;
          firstName: string;
          lastName: string;
          email: string;
        }>
      | undefined;
  };
};

export type CreateUserMutationVariables = Exact<{
  input: CreateUserInput;
}>;

export type CreateUserMutation = {
  __typename?: 'Mutation';
  createUser: {
    __typename?: 'User';
    id: string;
    nameID: string;
    displayName: string;
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    phone: string;
    accountUpn: string;
    agent?:
      | {
          __typename?: 'Agent';
          credentials?:
            | Array<{ __typename?: 'Credential'; type: AuthorizationCredential; resourceID: string }>
            | undefined;
        }
      | undefined;
    profile?:
      | {
          __typename?: 'Profile';
          id: string;
          description?: string | undefined;
          location?: { __typename?: 'Location'; country: string; city: string } | undefined;
          avatar?:
            | {
                __typename?: 'Visual';
                id: string;
                uri: string;
                name: string;
                allowedTypes: Array<string>;
                aspectRatio: number;
                maxHeight: number;
                maxWidth: number;
                minHeight: number;
                minWidth: number;
              }
            | undefined;
          references?:
            | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
            | undefined;
          tagsets?: Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }> | undefined;
        }
      | undefined;
  };
};

export type CreateUserNewRegistrationMutationVariables = Exact<{ [key: string]: never }>;

export type CreateUserNewRegistrationMutation = {
  __typename?: 'Mutation';
  createUserNewRegistration: {
    __typename?: 'User';
    id: string;
    nameID: string;
    displayName: string;
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    phone: string;
    accountUpn: string;
    agent?:
      | {
          __typename?: 'Agent';
          credentials?:
            | Array<{ __typename?: 'Credential'; type: AuthorizationCredential; resourceID: string }>
            | undefined;
        }
      | undefined;
    profile?:
      | {
          __typename?: 'Profile';
          id: string;
          description?: string | undefined;
          location?: { __typename?: 'Location'; country: string; city: string } | undefined;
          avatar?:
            | {
                __typename?: 'Visual';
                id: string;
                uri: string;
                name: string;
                allowedTypes: Array<string>;
                aspectRatio: number;
                maxHeight: number;
                maxWidth: number;
                minHeight: number;
                minWidth: number;
              }
            | undefined;
          references?:
            | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
            | undefined;
          tagsets?: Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }> | undefined;
        }
      | undefined;
  };
};

export type DeleteGroupMutationVariables = Exact<{
  input: DeleteUserGroupInput;
}>;

export type DeleteGroupMutation = {
  __typename?: 'Mutation';
  deleteUserGroup: { __typename?: 'UserGroup'; id: string; name: string };
};

export type DeleteUserMutationVariables = Exact<{
  input: DeleteUserInput;
}>;

export type DeleteUserMutation = { __typename?: 'Mutation'; deleteUser: { __typename?: 'User'; id: string } };

export type RemoveUserFromGroupMutationVariables = Exact<{
  input: RemoveUserGroupMemberInput;
}>;

export type RemoveUserFromGroupMutation = {
  __typename?: 'Mutation';
  removeUserFromGroup: {
    __typename?: 'UserGroup';
    id: string;
    name: string;
    members?:
      | Array<{
          __typename?: 'User';
          id: string;
          displayName: string;
          firstName: string;
          lastName: string;
          email: string;
        }>
      | undefined;
  };
};

export type UpdateGroupMutationVariables = Exact<{
  input: UpdateUserGroupInput;
}>;

export type UpdateGroupMutation = {
  __typename?: 'Mutation';
  updateUserGroup: {
    __typename?: 'UserGroup';
    id: string;
    name: string;
    profile?:
      | {
          __typename?: 'Profile';
          id: string;
          description?: string | undefined;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          references?: Array<{ __typename?: 'Reference'; uri: string; name: string; description: string }> | undefined;
          tagsets?: Array<{ __typename?: 'Tagset'; name: string; tags: Array<string> }> | undefined;
        }
      | undefined;
  };
};

export type UpdateUserMutationVariables = Exact<{
  input: UpdateUserInput;
}>;

export type UpdateUserMutation = {
  __typename?: 'Mutation';
  updateUser: {
    __typename?: 'User';
    id: string;
    nameID: string;
    displayName: string;
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    phone: string;
    accountUpn: string;
    agent?:
      | {
          __typename?: 'Agent';
          credentials?:
            | Array<{ __typename?: 'Credential'; type: AuthorizationCredential; resourceID: string }>
            | undefined;
        }
      | undefined;
    profile?:
      | {
          __typename?: 'Profile';
          id: string;
          description?: string | undefined;
          location?: { __typename?: 'Location'; country: string; city: string } | undefined;
          avatar?:
            | {
                __typename?: 'Visual';
                id: string;
                uri: string;
                name: string;
                allowedTypes: Array<string>;
                aspectRatio: number;
                maxHeight: number;
                maxWidth: number;
                minHeight: number;
                minWidth: number;
              }
            | undefined;
          references?:
            | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
            | undefined;
          tagsets?: Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }> | undefined;
        }
      | undefined;
  };
};

export type UpdatePreferenceOnUserMutationVariables = Exact<{
  input: UpdateUserPreferenceInput;
}>;

export type UpdatePreferenceOnUserMutation = {
  __typename?: 'Mutation';
  updatePreferenceOnUser: { __typename?: 'Preference'; id: string; value: string };
};

export type RolesUserQueryVariables = Exact<{
  input: RolesUserInput;
}>;

export type RolesUserQuery = {
  __typename?: 'Query';
  rolesUser: {
    __typename?: 'ContributorRoles';
    id: string;
    hubs: Array<{
      __typename?: 'RolesResultHub';
      id: string;
      nameID: string;
      hubID: string;
      displayName: string;
      roles: Array<string>;
      challenges: Array<{
        __typename?: 'RolesResultCommunity';
        id: string;
        nameID: string;
        displayName: string;
        roles: Array<string>;
      }>;
      opportunities: Array<{
        __typename?: 'RolesResultCommunity';
        id: string;
        nameID: string;
        displayName: string;
        roles: Array<string>;
      }>;
      userGroups: Array<{ __typename?: 'RolesResult'; id: string; nameID: string; displayName: string }>;
    }>;
    organizations: Array<{
      __typename?: 'RolesResultOrganization';
      id: string;
      nameID: string;
      displayName: string;
      roles: Array<string>;
      userGroups: Array<{ __typename?: 'RolesResult'; id: string; nameID: string; displayName: string }>;
    }>;
    applications?:
      | Array<{
          __typename?: 'ApplicationForRoleResult';
          id: string;
          communityID: string;
          displayName: string;
          state: string;
          hubID: string;
          challengeID?: string | undefined;
          opportunityID?: string | undefined;
        }>
      | undefined;
  };
};

export type UserQueryVariables = Exact<{
  id: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type UserQuery = {
  __typename?: 'Query';
  user: {
    __typename?: 'User';
    id: string;
    nameID: string;
    displayName: string;
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    phone: string;
    accountUpn: string;
    agent?:
      | {
          __typename?: 'Agent';
          id: string;
          did?: string | undefined;
          credentials?:
            | Array<{ __typename?: 'Credential'; type: AuthorizationCredential; resourceID: string; id: string }>
            | undefined;
        }
      | undefined;
    profile?:
      | {
          __typename?: 'Profile';
          id: string;
          description?: string | undefined;
          location?: { __typename?: 'Location'; country: string; city: string } | undefined;
          avatar?:
            | {
                __typename?: 'Visual';
                id: string;
                uri: string;
                name: string;
                allowedTypes: Array<string>;
                aspectRatio: number;
                maxHeight: number;
                maxWidth: number;
                minHeight: number;
                minWidth: number;
              }
            | undefined;
          references?:
            | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
            | undefined;
          tagsets?: Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }> | undefined;
        }
      | undefined;
  };
};

export type UserApplicationDetailsQueryVariables = Exact<{
  input: RolesUserInput;
}>;

export type UserApplicationDetailsQuery = {
  __typename?: 'Query';
  rolesUser: {
    __typename?: 'ContributorRoles';
    applications?:
      | Array<{
          __typename?: 'ApplicationForRoleResult';
          id: string;
          state: string;
          displayName: string;
          hubID: string;
          challengeID?: string | undefined;
          opportunityID?: string | undefined;
        }>
      | undefined;
  };
};

export type UserApplicationsQueryVariables = Exact<{
  input: RolesUserInput;
}>;

export type UserApplicationsQuery = {
  __typename?: 'Query';
  rolesUser: {
    __typename?: 'ContributorRoles';
    applications?:
      | Array<{
          __typename?: 'ApplicationForRoleResult';
          id: string;
          state: string;
          communityID: string;
          displayName: string;
          createdDate: Date;
          hubID: string;
          challengeID?: string | undefined;
          opportunityID?: string | undefined;
        }>
      | undefined;
  };
};

export type UserAvatarsQueryVariables = Exact<{
  ids: Array<Scalars['UUID_NAMEID_EMAIL']> | Scalars['UUID_NAMEID_EMAIL'];
}>;

export type UserAvatarsQuery = {
  __typename?: 'Query';
  usersById: Array<{
    __typename?: 'User';
    id: string;
    nameID: string;
    displayName: string;
    profile?:
      | {
          __typename?: 'Profile';
          id: string;
          location?: { __typename?: 'Location'; country: string; city: string } | undefined;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          tagsets?: Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }> | undefined;
        }
      | undefined;
  }>;
};

export type UserCardQueryVariables = Exact<{
  id: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type UserCardQuery = {
  __typename?: 'Query';
  user: {
    __typename?: 'User';
    id: string;
    nameID: string;
    displayName: string;
    agent?:
      | {
          __typename?: 'Agent';
          id: string;
          credentials?:
            | Array<{ __typename?: 'Credential'; id: string; type: AuthorizationCredential; resourceID: string }>
            | undefined;
        }
      | undefined;
    profile?:
      | {
          __typename?: 'Profile';
          id: string;
          location?: { __typename?: 'Location'; country: string; city: string } | undefined;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          tagsets?: Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }> | undefined;
        }
      | undefined;
  };
};

export type UserNotificationsPreferencesQueryVariables = Exact<{
  userId: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type UserNotificationsPreferencesQuery = {
  __typename?: 'Query';
  user: {
    __typename?: 'User';
    id: string;
    preferences: Array<{
      __typename?: 'Preference';
      id: string;
      value: string;
      definition: {
        __typename?: 'PreferenceDefinition';
        id: string;
        description: string;
        displayName: string;
        group: string;
        type: PreferenceType;
        valueType: PreferenceValueType;
      };
    }>;
  };
};

export type UserProfileQueryVariables = Exact<{
  input: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type UserProfileQuery = {
  __typename?: 'Query';
  user: {
    __typename?: 'User';
    id: string;
    nameID: string;
    displayName: string;
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    phone: string;
    accountUpn: string;
    agent?:
      | {
          __typename?: 'Agent';
          id: string;
          did?: string | undefined;
          credentials?:
            | Array<{ __typename?: 'Credential'; type: AuthorizationCredential; resourceID: string; id: string }>
            | undefined;
        }
      | undefined;
    profile?:
      | {
          __typename?: 'Profile';
          id: string;
          description?: string | undefined;
          location?: { __typename?: 'Location'; country: string; city: string } | undefined;
          avatar?:
            | {
                __typename?: 'Visual';
                id: string;
                uri: string;
                name: string;
                allowedTypes: Array<string>;
                aspectRatio: number;
                maxHeight: number;
                maxWidth: number;
                minHeight: number;
                minWidth: number;
              }
            | undefined;
          references?:
            | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
            | undefined;
          tagsets?: Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }> | undefined;
        }
      | undefined;
  };
  rolesUser: {
    __typename?: 'ContributorRoles';
    id: string;
    hubs: Array<{
      __typename?: 'RolesResultHub';
      id: string;
      nameID: string;
      hubID: string;
      displayName: string;
      roles: Array<string>;
      challenges: Array<{
        __typename?: 'RolesResultCommunity';
        id: string;
        nameID: string;
        displayName: string;
        roles: Array<string>;
      }>;
      opportunities: Array<{
        __typename?: 'RolesResultCommunity';
        id: string;
        nameID: string;
        displayName: string;
        roles: Array<string>;
      }>;
      userGroups: Array<{ __typename?: 'RolesResult'; id: string; nameID: string; displayName: string }>;
    }>;
    organizations: Array<{
      __typename?: 'RolesResultOrganization';
      id: string;
      nameID: string;
      displayName: string;
      roles: Array<string>;
      userGroups: Array<{ __typename?: 'RolesResult'; id: string; nameID: string; displayName: string }>;
    }>;
    applications?:
      | Array<{
          __typename?: 'ApplicationForRoleResult';
          id: string;
          communityID: string;
          displayName: string;
          state: string;
          hubID: string;
          challengeID?: string | undefined;
          opportunityID?: string | undefined;
        }>
      | undefined;
  };
  authorization: { __typename?: 'Authorization'; myPrivileges?: Array<AuthorizationPrivilege> | undefined };
};

export type UserProfileApplicationsQueryVariables = Exact<{
  input: RolesUserInput;
}>;

export type UserProfileApplicationsQuery = {
  __typename?: 'Query';
  rolesUser: {
    __typename?: 'ContributorRoles';
    applications?:
      | Array<{
          __typename?: 'ApplicationForRoleResult';
          id: string;
          state: string;
          displayName: string;
          hubID: string;
          challengeID?: string | undefined;
          opportunityID?: string | undefined;
        }>
      | undefined;
  };
};

export type UsersWithCredentialsQueryVariables = Exact<{
  input: UsersWithAuthorizationCredentialInput;
}>;

export type UsersWithCredentialsQuery = {
  __typename?: 'Query';
  usersWithAuthorizationCredential: Array<{
    __typename?: 'User';
    id: string;
    displayName: string;
    firstName: string;
    lastName: string;
    email: string;
    profile?:
      | {
          __typename?: 'Profile';
          id: string;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        }
      | undefined;
  }>;
};

export type UsersWithCredentialsSimpleListQueryVariables = Exact<{
  input: UsersWithAuthorizationCredentialInput;
}>;

export type UsersWithCredentialsSimpleListQuery = {
  __typename?: 'Query';
  usersWithAuthorizationCredential: Array<{
    __typename?: 'User';
    id: string;
    displayName: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
};

export type UserListQueryVariables = Exact<{
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['UUID']>;
  filter?: InputMaybe<UserFilterInput>;
}>;

export type UserListQuery = {
  __typename?: 'Query';
  usersPaginated: {
    __typename?: 'PaginatedUsers';
    users: Array<{ __typename?: 'User'; id: string; nameID: string; displayName: string; email: string }>;
    pageInfo: { __typename?: 'PageInfo'; endCursor?: string | undefined; hasNextPage: boolean };
  };
};

export type HubPreferencesQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
}>;

export type HubPreferencesQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    preferences?:
      | Array<{
          __typename?: 'Preference';
          id: string;
          value: string;
          definition: {
            __typename?: 'PreferenceDefinition';
            id: string;
            description: string;
            displayName: string;
            group: string;
            type: PreferenceType;
            valueType: PreferenceValueType;
          };
        }>
      | undefined;
  };
};

export type UpdatePreferenceOnHubMutationVariables = Exact<{
  preferenceData: UpdateHubPreferenceInput;
}>;

export type UpdatePreferenceOnHubMutation = {
  __typename?: 'Mutation';
  updatePreferenceOnHub: { __typename?: 'Preference'; id: string; value: string };
};
