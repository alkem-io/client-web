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
  /** A decentralized identifier (DID) as per the W3C standard. */
  DID: string;
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: Date;
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: string;
  /** A decentralized identifier (DID) as per the W3C standard. */
  Markdown: string;
  /** An identifier that originates from the underlying messaging platform. */
  MessageID: string;
  /** A human readable identifier, 3 <= length <= 25. Used for URL paths in clients. Characters allowed: a-z,A-Z,0-9. */
  NameID: string;
  /** A uuid identifier. Length 36 characters. */
  UUID: string;
  /** A UUID or NameID identifier. */
  UUID_NAMEID: string;
  /** A UUID or Email identifier. */
  UUID_NAMEID_EMAIL: string;
  /** The `Upload` scalar type represents a file upload. */
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
};

export type AgentBeginVerifiedCredentialRequestOutput = {
  __typename?: 'AgentBeginVerifiedCredentialRequestOutput';
  /** The token containing the information about issuer, callback endpoint and the credentials offered */
  jwt: Scalars['String'];
  /** The QR Code Image to be offered on the client for scanning by a mobile wallet */
  qrCode: Scalars['String'];
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

export type ApplicationResultEntry = {
  __typename?: 'ApplicationResultEntry';
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
  description: Scalars['String'];
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
  type: Scalars['String'];
};

export type AspectTemplate = {
  __typename?: 'AspectTemplate';
  description: Scalars['String'];
  type: Scalars['String'];
};

export type AssignChallengeAdminInput = {
  challengeID: Scalars['UUID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type AssignCommunityMemberInput = {
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
  verifiedCredentialClaimRules?: Maybe<Array<AuthorizationPolicyRuleVerifiedCredentialClaim>>;
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

export type AuthorizationPolicyRuleVerifiedCredentialClaim = {
  __typename?: 'AuthorizationPolicyRuleVerifiedCredentialClaim';
  grantedPrivileges: Array<AuthorizationPrivilege>;
  name: Scalars['String'];
  value: Scalars['String'];
};

export enum AuthorizationPrivilege {
  CommunityApply = 'COMMUNITY_APPLY',
  CommunityJoin = 'COMMUNITY_JOIN',
  Create = 'CREATE',
  CreateAspect = 'CREATE_ASPECT',
  CreateCanvas = 'CREATE_CANVAS',
  CreateComment = 'CREATE_COMMENT',
  CreateHub = 'CREATE_HUB',
  CreateOrganization = 'CREATE_ORGANIZATION',
  Delete = 'DELETE',
  Grant = 'GRANT',
  Read = 'READ',
  ReadUsers = 'READ_USERS',
  Update = 'UPDATE',
  UpdateCanvas = 'UPDATE_CANVAS',
}

export type Canvas = {
  __typename?: 'Canvas';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The checkout out state of this Canvas. */
  checkout?: Maybe<CanvasCheckout>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** Is the Canvas a template? */
  isTemplate: Scalars['Boolean'];
  /** The name of the Canvas. */
  name: Scalars['String'];
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
  /** Checked out status of the Canvas */
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
  /** The community for the challenge. */
  community?: Maybe<Community>;
  /** The context for the challenge. */
  context?: Maybe<Context>;
  /** The display name. */
  displayName: Scalars['String'];
  hubID: Scalars['String'];
  id: Scalars['UUID'];
  /** The Organizations that are leading this Challenge. */
  leadOrganizations: Array<Organization>;
  /** The lifeycle for the Challenge. */
  lifecycle?: Maybe<Lifecycle>;
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The Opportunities for the challenge. */
  opportunities?: Maybe<Array<Opportunity>>;
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

export type ChallengeTemplate = {
  __typename?: 'ChallengeTemplate';
  /** Application templates. */
  applications?: Maybe<Array<ApplicationTemplate>>;
  /** Challenge template name. */
  name: Scalars['String'];
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

export type CommentsMessageReceived = {
  __typename?: 'CommentsMessageReceived';
  /** The identifier for the Comments on which the message was sent. */
  commentsID: Scalars['String'];
  /** The message that has been sent. */
  message: Message;
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
  /** The Communications for this Community. */
  communication?: Maybe<Communication>;
  /** The name of the Community */
  displayName: Scalars['String'];
  /** Groups of users related to a Community. */
  groups?: Maybe<Array<UserGroup>>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** All users that are contributing to this Community. */
  members?: Maybe<Array<User>>;
};

export type CommunityApplyInput = {
  communityID: Scalars['UUID'];
  questions: Array<CreateNvpInput>;
};

export type CommunityJoinInput = {
  communityID: Scalars['UUID'];
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
  /** The Aspects for this Context. */
  aspects?: Maybe<Array<Aspect>>;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** A detailed description of the current situation */
  background?: Maybe<Scalars['String']>;
  /** The Canvas entities for this Context. */
  canvases?: Maybe<Array<Canvas>>;
  /** The EcosystemModel for this Context. */
  ecosystemModel?: Maybe<EcosystemModel>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** What is the potential impact? */
  impact?: Maybe<Scalars['Markdown']>;
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

export type ContextAspectsArgs = {
  IDs?: InputMaybe<Array<Scalars['UUID_NAMEID']>>;
};

export type ContextCanvasesArgs = {
  IDs?: InputMaybe<Array<Scalars['UUID']>>;
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

export type CreateAspectOnContextInput = {
  contextID: Scalars['UUID'];
  description: Scalars['String'];
  /** The display name for the entity. */
  displayName: Scalars['String'];
  /** A readable identifier, unique within the containing scope. If not provided generate based on the displayName */
  nameID?: InputMaybe<Scalars['NameID']>;
  tags?: InputMaybe<Array<Scalars['String']>>;
  type: Scalars['String'];
};

export type CreateCanvasOnContextInput = {
  contextID: Scalars['UUID'];
  name: Scalars['String'];
  value?: InputMaybe<Scalars['String']>;
};

export type CreateChallengeOnChallengeInput = {
  challengeID: Scalars['UUID'];
  context?: InputMaybe<CreateContextInput>;
  /** The display name for the entity. */
  displayName?: InputMaybe<Scalars['String']>;
  /** Set lead Organizations for the Challenge. */
  leadOrganizations?: InputMaybe<Array<Scalars['UUID_NAMEID']>>;
  lifecycleTemplate?: InputMaybe<Scalars['String']>;
  /** A readable identifier, unique within the containing scope. */
  nameID: Scalars['NameID'];
  tags?: InputMaybe<Array<Scalars['String']>>;
};

export type CreateChallengeOnHubInput = {
  context?: InputMaybe<CreateContextInput>;
  /** The display name for the entity. */
  displayName?: InputMaybe<Scalars['String']>;
  hubID: Scalars['UUID_NAMEID'];
  /** Set lead Organizations for the Challenge. */
  leadOrganizations?: InputMaybe<Array<Scalars['UUID_NAMEID']>>;
  lifecycleTemplate?: InputMaybe<Scalars['String']>;
  /** A readable identifier, unique within the containing scope. */
  nameID: Scalars['NameID'];
  tags?: InputMaybe<Array<Scalars['String']>>;
};

export type CreateContextInput = {
  background?: InputMaybe<Scalars['Markdown']>;
  impact?: InputMaybe<Scalars['Markdown']>;
  /** Set of References for the new Context. */
  references?: InputMaybe<Array<CreateReferenceInput>>;
  tagline?: InputMaybe<Scalars['String']>;
  vision?: InputMaybe<Scalars['Markdown']>;
  who?: InputMaybe<Scalars['Markdown']>;
};

export type CreateHubInput = {
  context?: InputMaybe<CreateContextInput>;
  /** The display name for the entity. */
  displayName?: InputMaybe<Scalars['String']>;
  /** The host Organization for the hub */
  hostID: Scalars['UUID_NAMEID'];
  lifecycleTemplate?: InputMaybe<Scalars['String']>;
  /** A readable identifier, unique within the containing scope. */
  nameID: Scalars['NameID'];
  tags?: InputMaybe<Array<Scalars['String']>>;
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
  displayName?: InputMaybe<Scalars['String']>;
  lifecycleTemplate?: InputMaybe<Scalars['String']>;
  /** A readable identifier, unique within the containing scope. */
  nameID: Scalars['NameID'];
  tags?: InputMaybe<Array<Scalars['String']>>;
};

export type CreateOrganizationInput = {
  contactEmail?: InputMaybe<Scalars['String']>;
  /** The display name for the entity. */
  displayName?: InputMaybe<Scalars['String']>;
  domain?: InputMaybe<Scalars['String']>;
  legalEntityName?: InputMaybe<Scalars['String']>;
  /** A readable identifier, unique within the containing scope. */
  nameID: Scalars['NameID'];
  profileData?: InputMaybe<CreateProfileInput>;
  website?: InputMaybe<Scalars['String']>;
};

export type CreateProfileInput = {
  description?: InputMaybe<Scalars['String']>;
  referencesData?: InputMaybe<Array<CreateReferenceInput>>;
  tagsetsData?: InputMaybe<Array<CreateTagsetInput>>;
};

export type CreateProjectInput = {
  description?: InputMaybe<Scalars['String']>;
  /** The display name for the entity. */
  displayName?: InputMaybe<Scalars['String']>;
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

export type CreateRelationInput = {
  actorName: Scalars['String'];
  actorRole?: InputMaybe<Scalars['String']>;
  actorType?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  parentID: Scalars['String'];
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

export type CreateUserGroupInput = {
  /** The name of the UserGroup. Minimum length 2. */
  name: Scalars['String'];
  parentID: Scalars['UUID'];
  profileData?: InputMaybe<CreateProfileInput>;
};

export type CreateUserInput = {
  accountUpn?: InputMaybe<Scalars['String']>;
  city?: InputMaybe<Scalars['String']>;
  country?: InputMaybe<Scalars['String']>;
  /** The display name for the entity. */
  displayName?: InputMaybe<Scalars['String']>;
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

export type DeleteCanvasOnContextInput = {
  canvasID: Scalars['UUID'];
  contextID: Scalars['UUID'];
};

export type DeleteChallengeInput = {
  ID: Scalars['UUID'];
};

export type DeleteDiscussionInput = {
  ID: Scalars['UUID'];
};

export type DeleteHubInput = {
  ID: Scalars['UUID_NAMEID'];
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
  /** The Canvas for visualizing this Ecosystem Model. */
  canvas?: Maybe<Canvas>;
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
  opportunities: Array<Opportunity>;
  /** A particular Opportunity, either by its ID or nameID */
  opportunity: Opportunity;
  /** The preferences for this user */
  preferences: Array<Preference>;
  /** A particular Project, identified by the ID */
  project: Project;
  /** All projects within this hub */
  projects: Array<Project>;
  /** The set of tags for the  hub. */
  tagset?: Maybe<Tagset>;
  /** The template for this Hub. */
  template: HubTemplate;
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
  description: Scalars['String'];
  /** The type of the Aspect */
  type: Scalars['String'];
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

export type HubTemplate = {
  __typename?: 'HubTemplate';
  aspectTemplates: Array<AspectTemplate>;
};

export type Lifecycle = {
  __typename?: 'Lifecycle';
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The machine definition, describing the states, transitions etc for this Lifeycle. */
  machineDef: Scalars['JSON'];
  /** The next events of this Lifecycle. */
  nextEvents?: Maybe<Array<Scalars['String']>>;
  /** The current state of this Lifecycle. */
  state?: Maybe<Scalars['String']>;
  /** Is this lifecycle in a final state (done). */
  stateIsFinal: Scalars['Boolean'];
  /** The Lifecycle template name. */
  templateName?: Maybe<Scalars['String']>;
};

export type MembershipCommunityResultEntry = {
  __typename?: 'MembershipCommunityResultEntry';
  /** Display name of the community */
  displayName: Scalars['String'];
  /** The ID of the community the user is a member of. */
  id: Scalars['UUID'];
};

export type MembershipOrganizationInput = {
  /** The ID of the organization to retrieve the membership of. */
  organizationID: Scalars['UUID_NAMEID'];
};

export type MembershipOrganizationResultEntryChallenge = {
  __typename?: 'MembershipOrganizationResultEntryChallenge';
  /** Display name of the entity */
  displayName: Scalars['String'];
  /** The ID of the Hub hosting this Challenge. */
  hubID: Scalars['String'];
  /** A unique identifier for this membership result. */
  id: Scalars['String'];
  /** Name Identifier of the entity */
  nameID: Scalars['NameID'];
};

export type MembershipResultEntry = {
  __typename?: 'MembershipResultEntry';
  /** Display name of the entity */
  displayName: Scalars['String'];
  /** A unique identifier for this membership result. */
  id: Scalars['String'];
  /** Name Identifier of the entity */
  nameID: Scalars['NameID'];
};

export type MembershipUserInput = {
  /** The ID of the user to retrieve the membership of. */
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type MembershipUserResultEntryHub = {
  __typename?: 'MembershipUserResultEntryHub';
  /** Details of the Challenges the user is a member of */
  challenges: Array<MembershipResultEntry>;
  /** Display name of the entity */
  displayName: Scalars['String'];
  /** The Hub ID */
  hubID: Scalars['String'];
  /** A unique identifier for this membership result. */
  id: Scalars['String'];
  /** Name Identifier of the entity */
  nameID: Scalars['NameID'];
  /** Details of the Opportunities the user is a member of */
  opportunities: Array<MembershipResultEntry>;
  /** Details of the UserGroups the user is a member of */
  userGroups: Array<MembershipResultEntry>;
};

export type MembershipUserResultEntryOrganization = {
  __typename?: 'MembershipUserResultEntryOrganization';
  /** Display name of the entity */
  displayName: Scalars['String'];
  /** A unique identifier for this membership result. */
  id: Scalars['String'];
  /** Name Identifier of the entity */
  nameID: Scalars['NameID'];
  /** The Organization ID. */
  organizationID: Scalars['String'];
  /** Details of the Organizations the user is a member of */
  userGroups: Array<MembershipResultEntry>;
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
  /** Assigns a User as an Challenge Admin. */
  assignUserAsChallengeAdmin: User;
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
  /** Assigns a User as a member of the specified Community. */
  assignUserToCommunity: Community;
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
  /** Creates a new Actor in the specified ActorGroup. */
  createActor: Actor;
  /** Create a new Actor Group on the EcosystemModel. */
  createActorGroup: ActorGroup;
  /** Create a new Aspect on the Context. */
  createAspectOnContext: Aspect;
  /** Create a new Canvas on the Context. */
  createCanvasOnContext: Canvas;
  /** Creates a new Challenge within the specified Hub. */
  createChallenge: Challenge;
  /** Creates a new child challenge within the parent Challenge. */
  createChildChallenge: Challenge;
  /** Creates a new Discussion as part of this Communication. */
  createDiscussion: Discussion;
  /** Creates a new User Group in the specified Community. */
  createGroupOnCommunity: UserGroup;
  /** Creates a new User Group for the specified Organization. */
  createGroupOnOrganization: UserGroup;
  /** Creates a new Hub. */
  createHub: Hub;
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
  /** Create a new Relation on the Opportunity. */
  createRelation: Relation;
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
  /** Deletes the specified Canvas. */
  deleteCanvasOnContext: Canvas;
  /** Deletes the specified Challenge. */
  deleteChallenge: Challenge;
  /** Deletes the specified Discussion. */
  deleteDiscussion: Discussion;
  /** Deletes the specified Hub. */
  deleteHub: Hub;
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
  /** Removes an update message. */
  removeUpdate: Scalars['MessageID'];
  /** Removes a User from being an Challenge Admin. */
  removeUserAsChallengeAdmin: User;
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
  /** Removes a User as a member of the specified Community. */
  removeUserFromCommunity: Community;
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
  /** Updates the specified Canvas. */
  updateCanvas: Canvas;
  /** Updates the specified Challenge. */
  updateChallenge: Challenge;
  /** Updates the specified Discussion. */
  updateDiscussion: Discussion;
  /** Updates the specified EcosystemModel. */
  updateEcosystemModel: EcosystemModel;
  /** Updates the Hub. */
  updateHub: Hub;
  /** Updates the specified Opportunity. */
  updateOpportunity: Opportunity;
  /** Updates the specified Organization. */
  updateOrganization: Organization;
  /** Updates one of the Preferences on a Hub */
  updatePreferenceOnHub: Preference;
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

export type MutationAssignUserAsChallengeAdminArgs = {
  membershipData: AssignChallengeAdminInput;
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

export type MutationAssignUserToCommunityArgs = {
  membershipData: AssignCommunityMemberInput;
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

export type MutationCreateActorArgs = {
  actorData: CreateActorInput;
};

export type MutationCreateActorGroupArgs = {
  actorGroupData: CreateActorGroupInput;
};

export type MutationCreateAspectOnContextArgs = {
  aspectData: CreateAspectOnContextInput;
};

export type MutationCreateCanvasOnContextArgs = {
  canvasData: CreateCanvasOnContextInput;
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

export type MutationCreateGroupOnCommunityArgs = {
  groupData: CreateUserGroupInput;
};

export type MutationCreateGroupOnOrganizationArgs = {
  groupData: CreateUserGroupInput;
};

export type MutationCreateHubArgs = {
  hubData: CreateHubInput;
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

export type MutationCreateRelationArgs = {
  relationData: CreateRelationInput;
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

export type MutationDeleteCanvasOnContextArgs = {
  deleteData: DeleteCanvasOnContextInput;
};

export type MutationDeleteChallengeArgs = {
  deleteData: DeleteChallengeInput;
};

export type MutationDeleteDiscussionArgs = {
  deleteData: DeleteDiscussionInput;
};

export type MutationDeleteHubArgs = {
  deleteData: DeleteHubInput;
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

export type MutationRemoveUpdateArgs = {
  messageData: UpdatesRemoveMessageInput;
};

export type MutationRemoveUserAsChallengeAdminArgs = {
  membershipData: RemoveChallengeAdminInput;
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

export type MutationRemoveUserFromCommunityArgs = {
  membershipData: RemoveCommunityMemberInput;
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

export type MutationUpdateCanvasArgs = {
  canvasData: UpdateCanvasDirectInput;
};

export type MutationUpdateChallengeArgs = {
  challengeData: UpdateChallengeInput;
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

export type MutationUpdateOpportunityArgs = {
  opportunityData: UpdateOpportunityInput;
};

export type MutationUpdateOrganizationArgs = {
  organizationData: UpdateOrganizationInput;
};

export type MutationUpdatePreferenceOnHubArgs = {
  preferenceData: UpdateHubPreferenceInput;
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
  /** The set of Relations within the context of this Opportunity. */
  relations?: Maybe<Array<Relation>>;
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

export type OrganizationMembership = {
  __typename?: 'OrganizationMembership';
  /** Details of the Challenges the Organization is leading. */
  challengesLeading: Array<MembershipOrganizationResultEntryChallenge>;
  /** Details of Hubs the Organization is hosting. */
  hubsHosting: Array<MembershipResultEntry>;
  id: Scalars['UUID'];
};

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

export type PaginatedUser = Searchable & {
  __typename?: 'PaginatedUser';
  /** The unique personal identifier (upn) for the account associated with this user profile */
  accountUpn: Scalars['String'];
  /** The Agent representing this User. */
  agent?: Maybe<Agent>;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  city: Scalars['String'];
  /** The Community rooms this user is a member of */
  communityRooms?: Maybe<Array<CommunicationRoom>>;
  country: Scalars['String'];
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

export type PaginatedUserEdge = {
  __typename?: 'PaginatedUserEdge';
  node: PaginatedUser;
};

export type PaginatedUserPageInfo = {
  __typename?: 'PaginatedUserPageInfo';
  endCursor: Scalars['String'];
  hasNextPage: Scalars['Boolean'];
  startCursor: Scalars['String'];
};

export type Platform = {
  __typename?: 'Platform';
  /** URL to a page about the platform */
  about: Scalars['String'];
  /** The feature flags for the platform */
  featureFlags: Array<FeatureFlag>;
  /** URL to a form for providing feedback */
  feedback: Scalars['String'];
  /** URL to the privacy policy for the platform */
  privacy: Scalars['String'];
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
  /** Application templates. */
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
  MembershipApplicationsFromAnyone = 'MEMBERSHIP_APPLICATIONS_FROM_ANYONE',
  MembershipJoinHubFromAnyone = 'MEMBERSHIP_JOIN_HUB_FROM_ANYONE',
  MembershipJoinHubFromHostOrganizationMembers = 'MEMBERSHIP_JOIN_HUB_FROM_HOST_ORGANIZATION_MEMBERS',
  NotificationApplicationReceived = 'NOTIFICATION_APPLICATION_RECEIVED',
  NotificationApplicationSubmitted = 'NOTIFICATION_APPLICATION_SUBMITTED',
  NotificationCommunicationDiscussionCreated = 'NOTIFICATION_COMMUNICATION_DISCUSSION_CREATED',
  NotificationCommunicationDiscussionCreatedAdmin = 'NOTIFICATION_COMMUNICATION_DISCUSSION_CREATED_ADMIN',
  NotificationCommunicationDiscussionResponse = 'NOTIFICATION_COMMUNICATION_DISCUSSION_RESPONSE',
  NotificationCommunicationUpdates = 'NOTIFICATION_COMMUNICATION_UPDATES',
  NotificationCommunicationUpdateSentAdmin = 'NOTIFICATION_COMMUNICATION_UPDATE_SENT_ADMIN',
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
  /** A list of URLs to relevant information. */
  references?: Maybe<Array<Reference>>;
  /** A list of named tagsets, each of which has a list of tags. */
  tagsets?: Maybe<Array<Tagset>>;
};

export type ProfileCredentialVerified = {
  __typename?: 'ProfileCredentialVerified';
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
  /** The memberships for this Organization */
  membershipOrganization: OrganizationMembership;
  /** Search the hub for terms supplied */
  membershipUser: UserMembership;
  /** Alkemio Services Metadata */
  metadata: Metadata;
  /** A particular Organization */
  organization: Organization;
  /** The Organizations on this platform */
  organizations: Array<Organization>;
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
  usersPaginated: RelayStylePaginatedUser;
  /** All Users that hold credentials matching the supplied criteria. */
  usersWithAuthorizationCredential: Array<User>;
};

export type QueryAdminCommunicationMembershipArgs = {
  communicationData: CommunicationAdminMembershipInput;
};

export type QueryHubArgs = {
  ID: Scalars['UUID_NAMEID'];
};

export type QueryMembershipOrganizationArgs = {
  membershipData: MembershipOrganizationInput;
};

export type QueryMembershipUserArgs = {
  membershipData: MembershipUserInput;
};

export type QueryOrganizationArgs = {
  ID: Scalars['UUID_NAMEID'];
};

export type QueryOrganizationsArgs = {
  limit?: InputMaybe<Scalars['Float']>;
  shuffle?: InputMaybe<Scalars['Boolean']>;
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
  first?: InputMaybe<Scalars['Int']>;
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

export type RelayStylePaginatedUser = {
  __typename?: 'RelayStylePaginatedUser';
  edges?: Maybe<Array<PaginatedUserEdge>>;
  pageInfo?: Maybe<PaginatedUserPageInfo>;
};

export type RemoveChallengeAdminInput = {
  challengeID: Scalars['UUID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type RemoveCommunityMemberInput = {
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
  resourceID?: InputMaybe<Scalars['String']>;
  type: AuthorizationCredential;
  /** The user from whom the credential is being removed. */
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

export type UpdateActorInput = {
  ID: Scalars['UUID'];
  description?: InputMaybe<Scalars['String']>;
  impact?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  value?: InputMaybe<Scalars['String']>;
};

export type UpdateAspectInput = {
  ID: Scalars['UUID'];
  description?: InputMaybe<Scalars['String']>;
  /** The display name for this entity. */
  displayName?: InputMaybe<Scalars['String']>;
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** Update the set of References for the Aspect. */
  references?: InputMaybe<Array<UpdateReferenceInput>>;
  /** Update the tags on the Aspect. */
  tags?: InputMaybe<Array<Scalars['String']>>;
};

export type UpdateAspectTemplateInput = {
  description?: InputMaybe<Scalars['String']>;
  type: Scalars['String'];
};

export type UpdateCanvasDirectInput = {
  ID: Scalars['UUID'];
  isTemplate?: InputMaybe<Scalars['Boolean']>;
  name?: InputMaybe<Scalars['String']>;
  value?: InputMaybe<Scalars['String']>;
};

export type UpdateCanvasInput = {
  isTemplate?: InputMaybe<Scalars['Boolean']>;
  name?: InputMaybe<Scalars['String']>;
  value?: InputMaybe<Scalars['String']>;
};

export type UpdateChallengeInput = {
  ID: Scalars['UUID'];
  /** Update the contained Context entity. */
  context?: InputMaybe<UpdateContextInput>;
  /** The display name for this entity. */
  displayName?: InputMaybe<Scalars['String']>;
  /** Update the lead Organizations for the Challenge. */
  leadOrganizations?: InputMaybe<Array<Scalars['UUID_NAMEID']>>;
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: InputMaybe<Scalars['NameID']>;
  /** Update the tags on the Tagset. */
  tags?: InputMaybe<Array<Scalars['String']>>;
};

export type UpdateContextInput = {
  background?: InputMaybe<Scalars['Markdown']>;
  impact?: InputMaybe<Scalars['Markdown']>;
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
  /** Update the Canvas for this Ecosystem Model. */
  canvas?: InputMaybe<UpdateCanvasInput>;
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
  /** Update the template for this Hub. */
  template?: InputMaybe<UpdateHubTemplateInput>;
};

export type UpdateHubPreferenceInput = {
  /** ID of the Hub */
  hubID: Scalars['UUID_NAMEID'];
  /** Type of the user preference */
  type: HubPreferenceType;
  value: Scalars['String'];
};

export type UpdateHubTemplateInput = {
  /** The set of aspect type definitions to be supported by the Hub. */
  aspectTemplates: Array<UpdateAspectTemplateInput>;
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

export type UpdateProfileInput = {
  ID: Scalars['UUID'];
  description?: InputMaybe<Scalars['String']>;
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

export type UpdateUserGroupInput = {
  ID: Scalars['UUID'];
  name?: InputMaybe<Scalars['String']>;
  profileData?: InputMaybe<UpdateProfileInput>;
};

export type UpdateUserInput = {
  ID: Scalars['UUID_NAMEID_EMAIL'];
  accountUpn?: InputMaybe<Scalars['String']>;
  city?: InputMaybe<Scalars['String']>;
  country?: InputMaybe<Scalars['String']>;
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
  city: Scalars['String'];
  /** The Community rooms this user is a member of */
  communityRooms?: Maybe<Array<CommunicationRoom>>;
  country: Scalars['String'];
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

export type UserMembership = {
  __typename?: 'UserMembership';
  /** Open applications for this user. */
  applications?: Maybe<Array<ApplicationResultEntry>>;
  /** All the communitites the user is a part of. */
  communities: Array<MembershipCommunityResultEntry>;
  /** Details of Hubs the user is a member of, with child memberships */
  hubs: Array<MembershipUserResultEntryHub>;
  id: Scalars['UUID'];
  /** Details of the Organizations the user is a member of, with child memberships. */
  organizations: Array<MembershipUserResultEntryOrganization>;
};

export enum UserPreferenceType {
  NotificationApplicationReceived = 'NOTIFICATION_APPLICATION_RECEIVED',
  NotificationApplicationSubmitted = 'NOTIFICATION_APPLICATION_SUBMITTED',
  NotificationCommunicationDiscussionCreated = 'NOTIFICATION_COMMUNICATION_DISCUSSION_CREATED',
  NotificationCommunicationDiscussionCreatedAdmin = 'NOTIFICATION_COMMUNICATION_DISCUSSION_CREATED_ADMIN',
  NotificationCommunicationDiscussionResponse = 'NOTIFICATION_COMMUNICATION_DISCUSSION_RESPONSE',
  NotificationCommunicationUpdates = 'NOTIFICATION_COMMUNICATION_UPDATES',
  NotificationCommunicationUpdateSentAdmin = 'NOTIFICATION_COMMUNICATION_UPDATE_SENT_ADMIN',
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
  /** The challenge issuing the VC */
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

export type AdminHubFragment = {
  __typename?: 'Hub';
  id: string;
  nameID: string;
  displayName: string;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
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

export type UserCardFragment = {
  __typename?: 'User';
  id: string;
  nameID: string;
  displayName: string;
  country: string;
  city: string;
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
        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        tagsets?: Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }> | undefined;
      }
    | undefined;
};

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

export type CommunityDetailsFragment = {
  __typename?: 'Community';
  id: string;
  displayName: string;
  applications?: Array<{ __typename?: 'Application'; id: string }> | undefined;
  communication?:
    | {
        __typename?: 'Communication';
        id: string;
        authorization?:
          | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
          | undefined;
      }
    | undefined;
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
  groups?:
    | Array<{
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
      }>
    | undefined;
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
  country: string;
  city: string;
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
        avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
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
    featureFlags: Array<{ __typename?: 'FeatureFlag'; enabled: boolean; name: string }>;
  };
  sentry: { __typename?: 'Sentry'; enabled: boolean; endpoint: string; submitPII: boolean };
  template: {
    __typename?: 'Template';
    hubs: Array<{
      __typename?: 'PlatformHubTemplate';
      aspects?: Array<{ __typename?: 'HubAspectTemplate'; type: string; description: string }> | undefined;
    }>;
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
        displayName: string;
        members?: Array<{ __typename?: 'User'; id: string }> | undefined;
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
  template: {
    __typename?: 'HubTemplate';
    aspectTemplates: Array<{ __typename?: 'AspectTemplate'; description: string; type: string }>;
  };
  tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
  host?: { __typename?: 'Organization'; id: string; displayName: string; nameID: string } | undefined;
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

export type HubNameFragment = { __typename?: 'Hub'; id: string; nameID: string; displayName: string };

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

export type MyPrivilegesFragment = {
  __typename?: 'Authorization';
  myPrivileges?: Array<AuthorizationPrivilege> | undefined;
};

export type NewChallengeFragment = { __typename?: 'Challenge'; id: string; nameID: string; displayName: string };

export type NewOpportunityFragment = { __typename?: 'Opportunity'; id: string; nameID: string; displayName: string };

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
  };
  members?:
    | Array<{
        __typename?: 'User';
        id: string;
        nameID: string;
        displayName: string;
        city: string;
        country: string;
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
              avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
              tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
            }
          | undefined;
      }>
    | undefined;
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
  };
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
    references?:
      | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
      | undefined;
    tagsets?: Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }> | undefined;
  };
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

export type UserSearchResultFragment = { __typename?: 'UserGroup'; name: string; id: string };

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
  country: string;
  city: string;
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

export type UserMembershipDetailsFragment = {
  __typename?: 'UserMembership';
  hubs: Array<{
    __typename?: 'MembershipUserResultEntryHub';
    id: string;
    nameID: string;
    hubID: string;
    displayName: string;
    challenges: Array<{ __typename?: 'MembershipResultEntry'; id: string; nameID: string; displayName: string }>;
    opportunities: Array<{ __typename?: 'MembershipResultEntry'; id: string; nameID: string; displayName: string }>;
    userGroups: Array<{ __typename?: 'MembershipResultEntry'; id: string; nameID: string; displayName: string }>;
  }>;
  organizations: Array<{
    __typename?: 'MembershipUserResultEntryOrganization';
    id: string;
    nameID: string;
    displayName: string;
    userGroups: Array<{ __typename?: 'MembershipResultEntry'; id: string; nameID: string; displayName: string }>;
  }>;
  communities: Array<{ __typename?: 'MembershipCommunityResultEntry'; id: string; displayName: string }>;
  applications?:
    | Array<{
        __typename?: 'ApplicationResultEntry';
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

export type UpdatePreferenceOnUserMutationVariables = Exact<{
  input: UpdateUserPreferenceInput;
}>;

export type UpdatePreferenceOnUserMutation = {
  __typename?: 'Mutation';
  updatePreferenceOnUser: { __typename?: 'Preference'; id: string; value: string };
};

export type ApplyForCommunityMembershipMutationVariables = Exact<{
  input: CommunityApplyInput;
}>;

export type ApplyForCommunityMembershipMutation = {
  __typename?: 'Mutation';
  applyForCommunityMembership: { __typename?: 'Application'; id: string };
};

export type AssignUserToCommunityMutationVariables = Exact<{
  input: AssignCommunityMemberInput;
}>;

export type AssignUserToCommunityMutation = {
  __typename?: 'Mutation';
  assignUserToCommunity: { __typename?: 'Community'; id: string; displayName: string };
};

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

export type CreateAspectMutationVariables = Exact<{
  aspectData: CreateAspectOnContextInput;
}>;

export type CreateAspectMutation = {
  __typename?: 'Mutation';
  createAspectOnContext: {
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

export type CreateChallengeMutationVariables = Exact<{
  input: CreateChallengeOnHubInput;
}>;

export type CreateChallengeMutation = {
  __typename?: 'Mutation';
  createChallenge: { __typename?: 'Challenge'; id: string; nameID: string; displayName: string };
};

export type CreateGroupOnCommunityMutationVariables = Exact<{
  input: CreateUserGroupInput;
}>;

export type CreateGroupOnCommunityMutation = {
  __typename?: 'Mutation';
  createGroupOnCommunity: { __typename?: 'UserGroup'; id: string; name: string };
};

export type CreateGroupOnOrganizationMutationVariables = Exact<{
  input: CreateUserGroupInput;
}>;

export type CreateGroupOnOrganizationMutation = {
  __typename?: 'Mutation';
  createGroupOnOrganization: { __typename?: 'UserGroup'; id: string; name: string };
};

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

export type CreateOpportunityMutationVariables = Exact<{
  input: CreateOpportunityInput;
}>;

export type CreateOpportunityMutation = {
  __typename?: 'Mutation';
  createOpportunity: { __typename?: 'Opportunity'; id: string; nameID: string; displayName: string };
};

export type CreateOrganizationMutationVariables = Exact<{
  input: CreateOrganizationInput;
}>;

export type CreateOrganizationMutation = {
  __typename?: 'Mutation';
  createOrganization: { __typename?: 'Organization'; id: string; nameID: string; displayName: string };
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

export type CreateReferenceOnAspectMutationVariables = Exact<{
  referenceInput: CreateReferenceOnAspectInput;
}>;

export type CreateReferenceOnAspectMutation = {
  __typename?: 'Mutation';
  createReferenceOnAspect: { __typename?: 'Reference'; id: string; name: string; uri: string; description: string };
};

export type CreateReferenceOnContextMutationVariables = Exact<{
  input: CreateReferenceOnContextInput;
}>;

export type CreateReferenceOnContextMutation = {
  __typename?: 'Mutation';
  createReferenceOnContext: { __typename?: 'Reference'; id: string; name: string; uri: string; description: string };
};

export type CreateReferenceOnProfileMutationVariables = Exact<{
  input: CreateReferenceOnProfileInput;
}>;

export type CreateReferenceOnProfileMutation = {
  __typename?: 'Mutation';
  createReferenceOnProfile: { __typename?: 'Reference'; id: string; name: string; description: string; uri: string };
};

export type CreateRelationMutationVariables = Exact<{
  input: CreateRelationInput;
}>;

export type CreateRelationMutation = {
  __typename?: 'Mutation';
  createRelation: { __typename?: 'Relation'; id: string };
};

export type CreateTagsetOnProfileMutationVariables = Exact<{
  input: CreateTagsetOnProfileInput;
}>;

export type CreateTagsetOnProfileMutation = {
  __typename?: 'Mutation';
  createTagsetOnProfile: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> };
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
    country: string;
    city: string;
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
    country: string;
    city: string;
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

export type DeleteActorMutationVariables = Exact<{
  input: DeleteActorInput;
}>;

export type DeleteActorMutation = { __typename?: 'Mutation'; deleteActor: { __typename?: 'Actor'; id: string } };

export type DeleteAspectMutationVariables = Exact<{
  input: DeleteAspectInput;
}>;

export type DeleteAspectMutation = { __typename?: 'Mutation'; deleteAspect: { __typename?: 'Aspect'; id: string } };

export type DeleteChallengeMutationVariables = Exact<{
  input: DeleteChallengeInput;
}>;

export type DeleteChallengeMutation = {
  __typename?: 'Mutation';
  deleteChallenge: { __typename?: 'Challenge'; id: string; nameID: string };
};

export type DeleteDiscussionMutationVariables = Exact<{
  deleteData: DeleteDiscussionInput;
}>;

export type DeleteDiscussionMutation = {
  __typename?: 'Mutation';
  deleteDiscussion: { __typename?: 'Discussion'; id: string; title: string };
};

export type DeleteGroupMutationVariables = Exact<{
  input: DeleteUserGroupInput;
}>;

export type DeleteGroupMutation = {
  __typename?: 'Mutation';
  deleteUserGroup: { __typename?: 'UserGroup'; id: string; name: string };
};

export type DeleteHubMutationVariables = Exact<{
  input: DeleteHubInput;
}>;

export type DeleteHubMutation = {
  __typename?: 'Mutation';
  deleteHub: { __typename?: 'Hub'; id: string; nameID: string; displayName: string };
};

export type DeleteOpportunityMutationVariables = Exact<{
  input: DeleteOpportunityInput;
}>;

export type DeleteOpportunityMutation = {
  __typename?: 'Mutation';
  deleteOpportunity: { __typename?: 'Opportunity'; id: string; nameID: string };
};

export type DeleteOrganizationMutationVariables = Exact<{
  input: DeleteOrganizationInput;
}>;

export type DeleteOrganizationMutation = {
  __typename?: 'Mutation';
  deleteOrganization: { __typename?: 'Organization'; id: string };
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

export type DeleteUserMutationVariables = Exact<{
  input: DeleteUserInput;
}>;

export type DeleteUserMutation = { __typename?: 'Mutation'; deleteUser: { __typename?: 'User'; id: string } };

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

export type EventOnOpportunityMutationVariables = Exact<{
  input: OpportunityEventInput;
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

export type RemoveMessageFromDiscussionMutationVariables = Exact<{
  messageData: DiscussionRemoveMessageInput;
}>;

export type RemoveMessageFromDiscussionMutation = { __typename?: 'Mutation'; removeMessageFromDiscussion: string };

export type RemoveUserFromCommunityMutationVariables = Exact<{
  input: RemoveCommunityMemberInput;
}>;

export type RemoveUserFromCommunityMutation = {
  __typename?: 'Mutation';
  removeUserFromCommunity: {
    __typename?: 'Community';
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

export type UpdateChallengeMutationVariables = Exact<{
  input: UpdateChallengeInput;
}>;

export type UpdateChallengeMutation = {
  __typename?: 'Mutation';
  updateChallenge: { __typename?: 'Challenge'; id: string; nameID: string; displayName: string };
};

export type UpdateEcosystemModelMutationVariables = Exact<{
  ecosystemModelData: UpdateEcosystemModelInput;
}>;

export type UpdateEcosystemModelMutation = {
  __typename?: 'Mutation';
  updateEcosystemModel: {
    __typename?: 'EcosystemModel';
    id: string;
    canvas?: { __typename?: 'Canvas'; id: string; value: string } | undefined;
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

export type UpdateOpportunityMutationVariables = Exact<{
  input: UpdateOpportunityInput;
}>;

export type UpdateOpportunityMutation = {
  __typename?: 'Mutation';
  updateOpportunity: { __typename?: 'Opportunity'; id: string; displayName: string };
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
      references?:
        | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
        | undefined;
      tagsets?: Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }> | undefined;
    };
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
    country: string;
    city: string;
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

export type UploadVisualMutationVariables = Exact<{
  file: Scalars['Upload'];
  uploadData: VisualUploadImageInput;
}>;

export type UploadVisualMutation = {
  __typename?: 'Mutation';
  uploadImageOnVisual: { __typename?: 'Visual'; id: string; uri: string };
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

export type AllOpportunitiesQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
}>;

export type AllOpportunitiesQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    opportunities: Array<{ __typename?: 'Opportunity'; id: string; nameID: string }>;
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
    country: string;
    city: string;
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
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          tagsets?: Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }> | undefined;
        }
      | undefined;
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

export type ChallengeLeadOrganizationsQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  challengeID: Scalars['UUID_NAMEID'];
}>;

export type ChallengeLeadOrganizationsQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      leadOrganizations: Array<{
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
        };
      }>;
    };
  };
  organizations: Array<{
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
    };
  }>;
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
        | { __typename?: 'Community'; members?: Array<{ __typename?: 'User'; id: string }> | undefined }
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
    opportunities: Array<{
      __typename?: 'Opportunity';
      community?: { __typename?: 'Community'; id: string; displayName: string } | undefined;
    }>;
  };
};

export type AllCommunityDetailsFragment = { __typename?: 'Community'; id: string; displayName: string };

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
      displayName: string;
      community?:
        | {
            __typename?: 'Community';
            id: string;
            displayName: string;
            applications?: Array<{ __typename?: 'Application'; id: string }> | undefined;
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
            groups?:
              | Array<{
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
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

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
          applications?: Array<{ __typename?: 'Application'; id: string }> | undefined;
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
          groups?:
            | Array<{
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
              }>
            | undefined;
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
      displayName: string;
      community?:
        | {
            __typename?: 'Community';
            id: string;
            displayName: string;
            applications?: Array<{ __typename?: 'Application'; id: string }> | undefined;
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
            groups?:
              | Array<{
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
                }>
              | undefined;
          }
        | undefined;
    };
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
          members?: Array<{ __typename?: 'User'; id: string; displayName: string }> | undefined;
        }
      | undefined;
  };
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
      featureFlags: Array<{ __typename?: 'FeatureFlag'; enabled: boolean; name: string }>;
    };
    sentry: { __typename?: 'Sentry'; enabled: boolean; endpoint: string; submitPII: boolean };
    template: {
      __typename?: 'Template';
      hubs: Array<{
        __typename?: 'PlatformHubTemplate';
        aspects?: Array<{ __typename?: 'HubAspectTemplate'; type: string; description: string }> | undefined;
      }>;
    };
  };
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
          displayName: string;
          members?: Array<{ __typename?: 'User'; id: string }> | undefined;
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
    template: {
      __typename?: 'HubTemplate';
      aspectTemplates: Array<{ __typename?: 'AspectTemplate'; description: string; type: string }>;
    };
    tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
    host?: { __typename?: 'Organization'; id: string; displayName: string; nameID: string } | undefined;
  };
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
      | { __typename?: 'Community'; id: string; members?: Array<{ __typename?: 'User'; id: string }> | undefined }
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
    country: string;
    city: string;
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

export type MembershipOrganizationQueryVariables = Exact<{
  input: MembershipOrganizationInput;
}>;

export type MembershipOrganizationQuery = {
  __typename?: 'Query';
  membershipOrganization: {
    __typename?: 'OrganizationMembership';
    id: string;
    hubsHosting: Array<{ __typename?: 'MembershipResultEntry'; id: string; nameID: string; displayName: string }>;
    challengesLeading: Array<{
      __typename?: 'MembershipOrganizationResultEntryChallenge';
      id: string;
      nameID: string;
      displayName: string;
      hubID: string;
    }>;
  };
};

export type MembershipUserQueryVariables = Exact<{
  input: MembershipUserInput;
}>;

export type MembershipUserQuery = {
  __typename?: 'Query';
  membershipUser: {
    __typename?: 'UserMembership';
    id: string;
    hubs: Array<{
      __typename?: 'MembershipUserResultEntryHub';
      id: string;
      nameID: string;
      hubID: string;
      displayName: string;
      challenges: Array<{ __typename?: 'MembershipResultEntry'; id: string; nameID: string; displayName: string }>;
      opportunities: Array<{ __typename?: 'MembershipResultEntry'; id: string; nameID: string; displayName: string }>;
      userGroups: Array<{ __typename?: 'MembershipResultEntry'; id: string; nameID: string; displayName: string }>;
    }>;
    organizations: Array<{
      __typename?: 'MembershipUserResultEntryOrganization';
      id: string;
      nameID: string;
      displayName: string;
      userGroups: Array<{ __typename?: 'MembershipResultEntry'; id: string; nameID: string; displayName: string }>;
    }>;
    communities: Array<{ __typename?: 'MembershipCommunityResultEntry'; id: string; displayName: string }>;
    applications?:
      | Array<{
          __typename?: 'ApplicationResultEntry';
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
      context?:
        | {
            __typename?: 'Context';
            id: string;
            aspects?: Array<{ __typename?: 'Aspect'; id: string; displayName: string }> | undefined;
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
                  canvas?: { __typename?: 'Canvas'; id: string; name: string; value: string } | undefined;
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
      relations?:
        | Array<{
            __typename?: 'Relation';
            actorRole: string;
            actorName: string;
            actorType: string;
            description: string;
            type: string;
          }>
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
        | { __typename?: 'Community'; members?: Array<{ __typename?: 'User'; id: string }> | undefined }
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
    opportunities: Array<{
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
    }>;
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
    };
    members?:
      | Array<{
          __typename?: 'User';
          id: string;
          nameID: string;
          displayName: string;
          city: string;
          country: string;
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
                avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
              }
            | undefined;
        }>
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
      | { __typename?: 'PaginatedUser' }
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

export type UserApplicationDetailsQueryVariables = Exact<{
  input: MembershipUserInput;
}>;

export type UserApplicationDetailsQuery = {
  __typename?: 'Query';
  membershipUser: {
    __typename?: 'UserMembership';
    applications?:
      | Array<{
          __typename?: 'ApplicationResultEntry';
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

export type UserProfileApplicationsQueryVariables = Exact<{
  input: MembershipUserInput;
}>;

export type UserProfileApplicationsQuery = {
  __typename?: 'Query';
  membershipUser: {
    __typename?: 'UserMembership';
    applications?:
      | Array<{
          __typename?: 'ApplicationResultEntry';
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
    country: string;
    city: string;
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

export type UserApplicationsQueryVariables = Exact<{
  input: MembershipUserInput;
}>;

export type UserApplicationsQuery = {
  __typename?: 'Query';
  membershipUser: {
    __typename?: 'UserMembership';
    applications?:
      | Array<{
          __typename?: 'ApplicationResultEntry';
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
    city: string;
    country: string;
    profile?:
      | {
          __typename?: 'Profile';
          id: string;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
          tagsets?: Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }> | undefined;
        }
      | undefined;
  }>;
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
    country: string;
    city: string;
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
  membershipUser: {
    __typename?: 'UserMembership';
    id: string;
    hubs: Array<{
      __typename?: 'MembershipUserResultEntryHub';
      id: string;
      nameID: string;
      hubID: string;
      displayName: string;
      challenges: Array<{ __typename?: 'MembershipResultEntry'; id: string; nameID: string; displayName: string }>;
      opportunities: Array<{ __typename?: 'MembershipResultEntry'; id: string; nameID: string; displayName: string }>;
      userGroups: Array<{ __typename?: 'MembershipResultEntry'; id: string; nameID: string; displayName: string }>;
    }>;
    organizations: Array<{
      __typename?: 'MembershipUserResultEntryOrganization';
      id: string;
      nameID: string;
      displayName: string;
      userGroups: Array<{ __typename?: 'MembershipResultEntry'; id: string; nameID: string; displayName: string }>;
    }>;
    communities: Array<{ __typename?: 'MembershipCommunityResultEntry'; id: string; displayName: string }>;
    applications?:
      | Array<{
          __typename?: 'ApplicationResultEntry';
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

export type UsersQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Float']>;
  shuffle?: InputMaybe<Scalars['Boolean']>;
}>;

export type UsersQuery = {
  __typename?: 'Query';
  users: Array<{
    __typename?: 'User';
    id: string;
    nameID: string;
    displayName: string;
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    country: string;
    city: string;
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
  }>;
};

export type UsersDisplayNameQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']>;
  after?: InputMaybe<Scalars['UUID']>;
}>;

export type UsersDisplayNameQuery = {
  __typename?: 'Query';
  usersPaginated: {
    __typename?: 'RelayStylePaginatedUser';
    pageInfo?: { __typename?: 'PaginatedUserPageInfo'; endCursor: string; hasNextPage: boolean } | undefined;
    edges?:
      | Array<{
          __typename?: 'PaginatedUserEdge';
          node: { __typename?: 'PaginatedUser'; id: string; displayName: string };
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

export type ProfileVerifiedCredentialSubscriptionVariables = Exact<{ [key: string]: never }>;

export type ProfileVerifiedCredentialSubscription = {
  __typename?: 'Subscription';
  profileVerifiedCredential: { __typename?: 'ProfileCredentialVerified'; vc: string };
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
      | { __typename?: 'PaginatedUser' }
      | {
          __typename?: 'User';
          id: string;
          nameID: string;
          displayName: string;
          country: string;
          city: string;
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
  country: string;
  city: string;
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
}>;

export type HubAspectQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    context?:
      | {
          __typename?: 'Context';
          id: string;
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
            | undefined;
          aspects?:
            | Array<{
                __typename?: 'Aspect';
                id: string;
                type: string;
                displayName: string;
                description: string;
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
        }
      | undefined;
  };
};

export type ChallengeAspectQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
  challengeNameId: Scalars['UUID_NAMEID'];
  aspectNameId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeAspectQuery = {
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
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
            aspects?:
              | Array<{
                  __typename?: 'Aspect';
                  id: string;
                  type: string;
                  displayName: string;
                  description: string;
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
          }
        | undefined;
    };
  };
};

export type OpportunityAspectQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
  opportunityNameId: Scalars['UUID_NAMEID'];
  aspectNameId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityAspectQuery = {
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
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
            aspects?:
              | Array<{
                  __typename?: 'Aspect';
                  id: string;
                  type: string;
                  displayName: string;
                  description: string;
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
          }
        | undefined;
    };
  };
};

export type AspectDashboardDataFragment = {
  __typename?: 'Context';
  id: string;
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
    | undefined;
  aspects?:
    | Array<{
        __typename?: 'Aspect';
        id: string;
        type: string;
        displayName: string;
        description: string;
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
      }>
    | undefined;
};

export type AspectDashboardFragment = {
  __typename?: 'Aspect';
  id: string;
  type: string;
  displayName: string;
  description: string;
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
    tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
    references?:
      | Array<{ __typename?: 'Reference'; id: string; name: string; description: string; uri: string }>
      | undefined;
  };
};

export type HubAspectSettingsQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
  aspectNameId: Scalars['UUID_NAMEID'];
}>;

export type HubAspectSettingsQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    context?:
      | {
          __typename?: 'Context';
          id: string;
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
                  | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
                  | undefined;
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
}>;

export type ChallengeAspectSettingsQuery = {
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
                    | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
                    | undefined;
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
}>;

export type OpportunityAspectSettingsQuery = {
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
                    | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
                    | undefined;
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
  name: string;
  isTemplate: boolean;
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
};

export type CanvasSummaryFragment = { __typename?: 'Canvas'; id: string; name: string; isTemplate: boolean };

export type CanvasValueFragment = { __typename?: 'Canvas'; id: string; value: string };

export type ChechkoutDetailsFragment = {
  __typename?: 'CanvasCheckout';
  id: string;
  lockedBy: string;
  status: CanvasCheckoutStateEnum;
  lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Array<string> | undefined };
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
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
    context?:
      | {
          __typename?: 'Context';
          id: string;
          canvases?:
            | Array<{
                __typename?: 'Canvas';
                id: string;
                name: string;
                isTemplate: boolean;
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
              }>
            | undefined;
        }
      | undefined;
  };
};

export type HubCanvasValuesQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  canvasId: Scalars['UUID'];
}>;

export type HubCanvasValuesQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    context?:
      | {
          __typename?: 'Context';
          id: string;
          canvases?:
            | Array<{
                __typename?: 'Canvas';
                id: string;
                value: string;
                name: string;
                isTemplate: boolean;
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
      context?:
        | {
            __typename?: 'Context';
            id: string;
            canvases?:
              | Array<{
                  __typename?: 'Canvas';
                  id: string;
                  name: string;
                  isTemplate: boolean;
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
      context?:
        | {
            __typename?: 'Context';
            id: string;
            canvases?:
              | Array<{
                  __typename?: 'Canvas';
                  id: string;
                  value: string;
                  name: string;
                  isTemplate: boolean;
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
      context?:
        | {
            __typename?: 'Context';
            id: string;
            canvases?:
              | Array<{
                  __typename?: 'Canvas';
                  id: string;
                  name: string;
                  isTemplate: boolean;
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
      context?:
        | {
            __typename?: 'Context';
            id: string;
            canvases?:
              | Array<{
                  __typename?: 'Canvas';
                  id: string;
                  value: string;
                  name: string;
                  isTemplate: boolean;
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
                }>
              | undefined;
          }
        | undefined;
    };
  };
};

export type CreateCanvasOnContextMutationVariables = Exact<{
  input: CreateCanvasOnContextInput;
}>;

export type CreateCanvasOnContextMutation = {
  __typename?: 'Mutation';
  createCanvasOnContext: {
    __typename?: 'Canvas';
    id: string;
    name: string;
    isTemplate: boolean;
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
  };
};

export type DeleteCanvasOnContextMutationVariables = Exact<{
  input: DeleteCanvasOnContextInput;
}>;

export type DeleteCanvasOnContextMutation = {
  __typename?: 'Mutation';
  deleteCanvasOnContext: { __typename?: 'Canvas'; id: string; name: string; isTemplate: boolean };
};

export type UpdateCanvasOnContextMutationVariables = Exact<{
  input: UpdateCanvasDirectInput;
}>;

export type UpdateCanvasOnContextMutation = {
  __typename?: 'Mutation';
  updateCanvas: { __typename?: 'Canvas'; id: string; value: string; name: string; isTemplate: boolean };
};

export type CheckoutCanvasOnContextMutationVariables = Exact<{
  input: CanvasCheckoutEventInput;
}>;

export type CheckoutCanvasOnContextMutation = {
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
      | { __typename?: 'PaginatedUser' }
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
      leadOrganizations: Array<{
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
        };
      }>;
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
      community?:
        | {
            __typename?: 'Community';
            id: string;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
            members?: Array<{ __typename?: 'User'; id: string; displayName: string }> | undefined;
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
  leadOrganizations: Array<{
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
    };
  }>;
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
  community?:
    | {
        __typename?: 'Community';
        id: string;
        authorization?:
          | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
          | undefined;
        members?: Array<{ __typename?: 'User'; id: string; displayName: string }> | undefined;
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

export type ChallengesOverviewPageQueryVariables = Exact<{
  membershipData: MembershipUserInput;
}>;

export type ChallengesOverviewPageQuery = {
  __typename?: 'Query';
  membershipUser: {
    __typename?: 'UserMembership';
    hubs: Array<{
      __typename?: 'MembershipUserResultEntryHub';
      id: string;
      hubID: string;
      nameID: string;
      displayName: string;
      challenges: Array<{ __typename?: 'MembershipResultEntry'; id: string }>;
    }>;
  };
};

export type SimpleHubResultEntryFragment = {
  __typename?: 'MembershipUserResultEntryHub';
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

export type CommunityPageQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  communityId: Scalars['UUID'];
}>;

export type CommunityPageQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    community?:
      | {
          __typename?: 'Community';
          id: string;
          displayName: string;
          members?:
            | Array<{
                __typename?: 'User';
                id: string;
                nameID: string;
                displayName: string;
                country: string;
                city: string;
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
                      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                      tagsets?:
                        | Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }>
                        | undefined;
                    }
                  | undefined;
              }>
            | undefined;
        }
      | undefined;
  };
};

export type CommunityPageWithHostQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  communityId: Scalars['UUID'];
}>;

export type CommunityPageWithHostQuery = {
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
          displayName: string;
          members?:
            | Array<{
                __typename?: 'User';
                id: string;
                nameID: string;
                displayName: string;
                country: string;
                city: string;
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
                      avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
                      tagsets?:
                        | Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }>
                        | undefined;
                    }
                  | undefined;
              }>
            | undefined;
        }
      | undefined;
  };
};

export type ChallengeLeadingOrganizationsQueryVariables = Exact<{
  hubId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeLeadingOrganizationsQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      leadOrganizations: Array<{
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
      }>;
    };
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
          authorization?:
            | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
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
  };
};

export type HubContextExtraQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
}>;

export type HubContextExtraQuery = {
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
          references?:
            | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
            | undefined;
        }
      | undefined;
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
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
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
    };
  };
};

export type ChallengeContextExtraQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
  challengeNameId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeContextExtraQuery = {
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
      tagset?: { __typename?: 'Tagset'; id: string; name: string; tags: Array<string> } | undefined;
      lifecycle?: { __typename?: 'Lifecycle'; id: string; state?: string | undefined; machineDef: string } | undefined;
      context?:
        | {
            __typename?: 'Context';
            id: string;
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
            references?:
              | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
              | undefined;
          }
        | undefined;
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
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
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
    };
  };
};

export type OpportunityContextExtraQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
  opportunityNameId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityContextExtraQuery = {
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
            references?:
              | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
              | undefined;
          }
        | undefined;
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
  authorization?:
    | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
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
};

export type ContextTabExtraFragment = {
  __typename?: 'Context';
  id: string;
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
  references?:
    | Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>
    | undefined;
};

export type LifecycleContextTabFragment = {
  __typename?: 'Lifecycle';
  id: string;
  state?: string | undefined;
  machineDef: string;
};

export type ReferenceContextTabFragment = {
  __typename?: 'Reference';
  id: string;
  name: string;
  uri: string;
  description: string;
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
    host?: { __typename?: 'Organization'; id: string; displayName: string; nameID: string } | undefined;
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
    community?:
      | {
          __typename?: 'Community';
          id: string;
          members?: Array<{ __typename?: 'User'; id: string }> | undefined;
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
  host?: { __typename?: 'Organization'; id: string; displayName: string; nameID: string } | undefined;
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
  community?:
    | {
        __typename?: 'Community';
        id: string;
        members?: Array<{ __typename?: 'User'; id: string }> | undefined;
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
            references?: Array<{ __typename?: 'Reference'; id: string; name: string; uri: string }> | undefined;
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
            visuals?: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }> | undefined;
          }
        | undefined;
      projects?:
        | Array<{
            __typename?: 'Project';
            id: string;
            nameID: string;
            displayName: string;
            description?: string | undefined;
          }>
        | undefined;
      community?:
        | {
            __typename?: 'Community';
            id: string;
            authorization?:
              | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
              | undefined;
            members?: Array<{ __typename?: 'User'; id: string; nameID: string }> | undefined;
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
        references?: Array<{ __typename?: 'Reference'; id: string; name: string; uri: string }> | undefined;
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
        visuals?: Array<{ __typename?: 'Visual'; id: string; uri: string; name: string }> | undefined;
      }
    | undefined;
  projects?:
    | Array<{
        __typename?: 'Project';
        id: string;
        nameID: string;
        displayName: string;
        description?: string | undefined;
      }>
    | undefined;
  community?:
    | {
        __typename?: 'Community';
        id: string;
        authorization?:
          | { __typename?: 'Authorization'; id: string; myPrivileges?: Array<AuthorizationPrivilege> | undefined }
          | undefined;
        members?: Array<{ __typename?: 'User'; id: string; nameID: string }> | undefined;
      }
    | undefined;
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
    qrCode: string;
    jwt: string;
  };
};

export type BeginAlkemioUserCredentialOfferInteractionMutationVariables = Exact<{ [key: string]: never }>;

export type BeginAlkemioUserCredentialOfferInteractionMutation = {
  __typename?: 'Mutation';
  beginAlkemioUserVerifiedCredentialOfferInteraction: {
    __typename?: 'AgentBeginVerifiedCredentialOfferOutput';
    jwt: string;
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
    city: string;
    country: string;
    profile?:
      | {
          __typename?: 'Profile';
          id: string;
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

export type HubAspectProviderQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
  aspectNameId: Scalars['UUID_NAMEID'];
}>;

export type HubAspectProviderQuery = {
  __typename?: 'Query';
  hub: {
    __typename?: 'Hub';
    id: string;
    context?:
      | {
          __typename?: 'Context';
          id: string;
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
        }
      | undefined;
  };
};

export type ChallengeAspectProviderQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
  challengeNameId: Scalars['UUID_NAMEID'];
  aspectNameId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeAspectProviderQuery = {
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
          }
        | undefined;
    };
  };
};

export type OpportunityAspectProviderQueryVariables = Exact<{
  hubNameId: Scalars['UUID_NAMEID'];
  opportunityNameId: Scalars['UUID_NAMEID'];
  aspectNameId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityAspectProviderQuery = {
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
          }
        | undefined;
    };
  };
};

export type AspectProviderDataFragment = {
  __typename?: 'Context';
  id: string;
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
