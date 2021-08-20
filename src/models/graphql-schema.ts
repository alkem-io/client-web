export type Maybe<T> = T | undefined;
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
  /** A human readable identifier, 3 <= length <= 25. Used for URL paths in clients. Characters allowed: a-z,A-Z,0-9. */
  NameID: string;
  /** A uuid identifier. Length 36 charachters. */
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

export type Application = {
  __typename?: 'Application';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  lifecycle: Lifecycle;
  questions: Array<Question>;
  user: User;
};

export type ApplicationEventInput = {
  applicationID: Scalars['UUID'];
  eventName: Scalars['String'];
};

export type ApplicationResultEntry = {
  __typename?: 'ApplicationResultEntry';
  /** ID for the community */
  communityID: Scalars['UUID'];
  /** Display name of the community */
  displayName: Scalars['String'];
  /** ID for the application */
  id: Scalars['UUID'];
  /** The current state of the application. */
  state: Scalars['String'];
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
  explanation: Scalars['String'];
  framing: Scalars['String'];
  /** The ID of the entity */
  id: Scalars['UUID'];
  title: Scalars['String'];
};

export type AssignChallengeAdminInput = {
  challengeID: Scalars['UUID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type AssignCommunityMemberInput = {
  communityID: Scalars['UUID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type AssignEcoverseAdminInput = {
  ecoverseID: Scalars['UUID_NAMEID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type AssignOrganisationAdminInput = {
  organisationID: Scalars['UUID_NAMEID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type AssignOrganisationMemberInput = {
  organisationID: Scalars['UUID_NAMEID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type AssignUserGroupMemberInput = {
  groupID: Scalars['UUID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type AuthenticationConfig = {
  __typename?: 'AuthenticationConfig';
  /** Is authentication enabled? */
  enabled: Scalars['Boolean'];
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
  credentialRules?: Maybe<Array<AuthorizationRuleCredential>>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** The set of verified credential rules that are contained by this Authorization Policy. */
  verifiedCredentialRules?: Maybe<Array<AuthorizationRuleCredential>>;
};

export enum AuthorizationCredential {
  ChallengeAdmin = 'ChallengeAdmin',
  ChallengeLead = 'ChallengeLead',
  ChallengeMember = 'ChallengeMember',
  EcoverseAdmin = 'EcoverseAdmin',
  EcoverseHost = 'EcoverseHost',
  EcoverseMember = 'EcoverseMember',
  GlobalAdmin = 'GlobalAdmin',
  GlobalAdminCommunity = 'GlobalAdminCommunity',
  GlobalRegistered = 'GlobalRegistered',
  OpportunityMember = 'OpportunityMember',
  OrganisationAdmin = 'OrganisationAdmin',
  OrganisationMember = 'OrganisationMember',
  UserGroupMember = 'UserGroupMember',
  UserSelfManagement = 'UserSelfManagement',
}

export enum AuthorizationPrivilege {
  Create = 'CREATE',
  Delete = 'DELETE',
  Grant = 'GRANT',
  Read = 'READ',
  Update = 'UPDATE',
}

export type AuthorizationRuleCredential = {
  __typename?: 'AuthorizationRuleCredential';
  grantedPrivileges: Array<Scalars['String']>;
  resourceID: Scalars['String'];
  type: Scalars['String'];
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
  ecoverseID: Scalars['String'];
  id: Scalars['UUID'];
  /** The Organisations that are leading this Challenge. */
  leadOrganisations: Array<Organisation>;
  /** The lifeycle for the Challenge. */
  lifecycle?: Maybe<Lifecycle>;
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** The Opportunities for the challenge. */
  opportunities?: Maybe<Array<Opportunity>>;
  /** The set of tags for the challenge */
  tagset?: Maybe<Tagset>;
};

export type ChallengeAuthorizeStateModificationInput = {
  /** The challenge whose state can be udpated. */
  challengeID: Scalars['UUID'];
  /** The user who is being authorized to update the Challenge state. */
  userID: Scalars['UUID_NAMEID_EMAIL'];
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

export type CommunicationMessageReceived = {
  __typename?: 'CommunicationMessageReceived';
  /** The update message that has been sent. */
  message: CommunicationMessageResult;
  /** The identifier of the room */
  roomId: Scalars['String'];
};

export type CommunicationMessageResult = {
  __typename?: 'CommunicationMessageResult';
  /** The id for the message event (Matrix) */
  id: Scalars['String'];
  /** The message being sent */
  message: Scalars['String'];
  /** The sender email */
  sender: Scalars['String'];
  /** The server timestamp in UTC */
  timestamp: Scalars['Float'];
};

export type Community = Groupable & {
  __typename?: 'Community';
  /** Application available for this community. */
  applications: Array<Application>;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** Room with messages for this community. */
  discussionRoom: CommunityRoom;
  /** The name of the Community */
  displayName: Scalars['String'];
  /** Groups of users related to a Community. */
  groups?: Maybe<Array<UserGroup>>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** All users that are contributing to this Community. */
  members?: Maybe<Array<User>>;
  /** Room with messages for this community. */
  updatesRoom: CommunityRoom;
};

export type CommunityRoom = {
  __typename?: 'CommunityRoom';
  /** The identifier of the room */
  id: Scalars['String'];
  /** The messages that have been sent to the Room. */
  messages: Array<CommunicationMessageResult>;
};

export type CommunitySendMessageInput = {
  /** The community the message is being sent to */
  communityID: Scalars['String'];
  /** The message being sent */
  message: Scalars['String'];
};

export type Config = {
  __typename?: 'Config';
  /** Authentication configuration. */
  authentication: AuthenticationConfig;
  /** Platform related resources. */
  platform: Platform;
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
  /** The EcosystemModel for this Context. */
  ecosystemModel?: Maybe<EcosystemModel>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** What is the potential impact? */
  impact?: Maybe<Scalars['Markdown']>;
  /** A list of URLs to relevant information. */
  references?: Maybe<Array<Reference>>;
  /** A one line description */
  tagline?: Maybe<Scalars['String']>;
  /** The goal that is being pursued */
  vision?: Maybe<Scalars['Markdown']>;
  /** The Visual assets for this Context. */
  visual?: Maybe<Visual>;
  /** Who should get involved in this challenge */
  who?: Maybe<Scalars['String']>;
};

export type CreateActorGroupInput = {
  description?: Maybe<Scalars['String']>;
  ecosystemModelID: Scalars['UUID'];
  name: Scalars['String'];
};

export type CreateActorInput = {
  actorGroupID: Scalars['UUID'];
  description?: Maybe<Scalars['String']>;
  impact?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  value?: Maybe<Scalars['String']>;
};

export type CreateApplicationInput = {
  parentID: Scalars['UUID'];
  questions: Array<CreateNvpInput>;
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type CreateAspectInput = {
  explanation: Scalars['String'];
  framing: Scalars['String'];
  parentID: Scalars['UUID'];
  title: Scalars['String'];
};

export type CreateChallengeOnChallengeInput = {
  challengeID: Scalars['UUID'];
  context?: Maybe<CreateContextInput>;
  /** The display name for the entity. */
  displayName?: Maybe<Scalars['String']>;
  /** Set lead Organisations for the Challenge. */
  leadOrganisations?: Maybe<Array<Scalars['UUID_NAMEID']>>;
  lifecycleTemplate?: Maybe<Scalars['String']>;
  /** A readable identifier, unique within the containing scope. */
  nameID: Scalars['NameID'];
  tags?: Maybe<Array<Scalars['String']>>;
};

export type CreateChallengeOnEcoverseInput = {
  context?: Maybe<CreateContextInput>;
  /** The display name for the entity. */
  displayName?: Maybe<Scalars['String']>;
  ecoverseID: Scalars['UUID_NAMEID'];
  /** Set lead Organisations for the Challenge. */
  leadOrganisations?: Maybe<Array<Scalars['UUID_NAMEID']>>;
  lifecycleTemplate?: Maybe<Scalars['String']>;
  /** A readable identifier, unique within the containing scope. */
  nameID: Scalars['NameID'];
  tags?: Maybe<Array<Scalars['String']>>;
};

export type CreateContextInput = {
  background?: Maybe<Scalars['Markdown']>;
  impact?: Maybe<Scalars['Markdown']>;
  /** Set of References for the new Context. */
  references?: Maybe<Array<CreateReferenceInput>>;
  tagline?: Maybe<Scalars['String']>;
  vision?: Maybe<Scalars['Markdown']>;
  /** The Visual assets for the new Context. */
  visual?: Maybe<CreateVisualInput>;
  who?: Maybe<Scalars['Markdown']>;
};

export type CreateEcoverseInput = {
  context?: Maybe<CreateContextInput>;
  /** The display name for the entity. */
  displayName?: Maybe<Scalars['String']>;
  /** The host Organisation for the ecoverse */
  hostID: Scalars['UUID_NAMEID'];
  lifecycleTemplate?: Maybe<Scalars['String']>;
  /** A readable identifier, unique within the containing scope. */
  nameID: Scalars['NameID'];
  tags?: Maybe<Array<Scalars['String']>>;
};

export type CreateNvpInput = {
  name: Scalars['String'];
  value: Scalars['String'];
};

export type CreateOpportunityInput = {
  challengeID: Scalars['UUID'];
  context?: Maybe<CreateContextInput>;
  /** The display name for the entity. */
  displayName?: Maybe<Scalars['String']>;
  lifecycleTemplate?: Maybe<Scalars['String']>;
  /** A readable identifier, unique within the containing scope. */
  nameID: Scalars['NameID'];
  tags?: Maybe<Array<Scalars['String']>>;
};

export type CreateOrganisationInput = {
  /** The display name for the entity. */
  displayName?: Maybe<Scalars['String']>;
  /** A readable identifier, unique within the containing scope. */
  nameID: Scalars['NameID'];
  profileData?: Maybe<CreateProfileInput>;
};

export type CreateProfileInput = {
  avatar?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  referencesData?: Maybe<Array<CreateReferenceInput>>;
  tagsetsData?: Maybe<Array<CreateTagsetInput>>;
};

export type CreateProjectInput = {
  description?: Maybe<Scalars['String']>;
  /** The display name for the entity. */
  displayName?: Maybe<Scalars['String']>;
  /** A readable identifier, unique within the containing scope. */
  nameID: Scalars['NameID'];
  opportunityID: Scalars['UUID_NAMEID'];
};

export type CreateReferenceInput = {
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  uri?: Maybe<Scalars['String']>;
};

export type CreateReferenceOnContextInput = {
  contextID: Scalars['UUID'];
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  uri?: Maybe<Scalars['String']>;
};

export type CreateReferenceOnProfileInput = {
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  profileID: Scalars['UUID'];
  uri?: Maybe<Scalars['String']>;
};

export type CreateRelationInput = {
  actorName: Scalars['String'];
  actorRole?: Maybe<Scalars['String']>;
  actorType?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  parentID: Scalars['String'];
  type: Scalars['String'];
};

export type CreateTagsetInput = {
  name: Scalars['String'];
  tags?: Maybe<Array<Scalars['String']>>;
};

export type CreateTagsetOnProfileInput = {
  name: Scalars['String'];
  profileID?: Maybe<Scalars['UUID']>;
  tags?: Maybe<Array<Scalars['String']>>;
};

export type CreateUserGroupInput = {
  /** The name of the UserGroup. Minimum length 2. */
  name: Scalars['String'];
  parentID: Scalars['UUID'];
  profileData?: Maybe<CreateProfileInput>;
};

export type CreateUserInput = {
  accountUpn?: Maybe<Scalars['String']>;
  city?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  /** The display name for the entity. */
  displayName?: Maybe<Scalars['String']>;
  email: Scalars['String'];
  firstName?: Maybe<Scalars['String']>;
  gender?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  /** A readable identifier, unique within the containing scope. */
  nameID: Scalars['NameID'];
  phone?: Maybe<Scalars['String']>;
  profileData?: Maybe<CreateProfileInput>;
};

export type CreateVisualInput = {
  avatar: Scalars['String'];
  background?: Maybe<Scalars['String']>;
  banner?: Maybe<Scalars['String']>;
};

export type Credential = {
  __typename?: 'Credential';
  /** The ID of the entity */
  id: Scalars['UUID'];
  resourceID: Scalars['String'];
  type: AuthorizationCredential;
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

export type DeleteChallengeInput = {
  ID: Scalars['UUID'];
};

export type DeleteEcoverseInput = {
  ID: Scalars['UUID_NAMEID'];
};

export type DeleteOpportunityInput = {
  ID: Scalars['UUID'];
};

export type DeleteOrganisationInput = {
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
  /** The identifier of the room */
  id: Scalars['String'];
  /** The messages that have been sent to the Room. */
  messages: Array<CommunicationMessageResult>;
  /** The recepient userID */
  receiverID?: Maybe<Scalars['String']>;
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

export type Ecoverse = {
  __typename?: 'Ecoverse';
  /** The activity within this Ecoverse. */
  activity?: Maybe<Array<Nvp>>;
  /** The Agent representing this Ecoverse. */
  agent?: Maybe<Agent>;
  /** All applications to join */
  application: Application;
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** A particular Challenge, either by its ID or nameID */
  challenge: Challenge;
  /** The challenges for the ecoverse. */
  challenges?: Maybe<Array<Challenge>>;
  /** The community for the ecoverse. */
  community?: Maybe<Community>;
  /** The context for the ecoverse. */
  context?: Maybe<Context>;
  /** The display name. */
  displayName: Scalars['String'];
  /** The user group with the specified id anywhere in the ecoverse */
  group: UserGroup;
  /** The User Groups on this Ecoverse */
  groups: Array<UserGroup>;
  /** All groups on this Ecoverse that have the provided tag */
  groupsWithTag: Array<UserGroup>;
  /** The Ecoverse host. */
  host?: Maybe<Organisation>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** A name identifier of the entity, unique within a given scope. */
  nameID: Scalars['NameID'];
  /** All opportunities within the ecoverse */
  opportunities: Array<Opportunity>;
  /** A particular Opportunity, either by its ID or nameID */
  opportunity: Opportunity;
  /** A particular Project, identified by the ID */
  project: Project;
  /** All projects within this ecoverse */
  projects: Array<Project>;
  /** The set of tags for the  ecoverse. */
  tagset?: Maybe<Tagset>;
};

export type EcoverseApplicationArgs = {
  ID: Scalars['UUID'];
};

export type EcoverseChallengeArgs = {
  ID: Scalars['UUID_NAMEID'];
};

export type EcoverseGroupArgs = {
  ID: Scalars['UUID'];
};

export type EcoverseGroupsWithTagArgs = {
  tag: Scalars['String'];
};

export type EcoverseOpportunityArgs = {
  ID: Scalars['UUID_NAMEID'];
};

export type EcoverseProjectArgs = {
  ID: Scalars['UUID_NAMEID'];
};

export type EcoverseAuthorizationResetInput = {
  /** The identifier of the Ecoverse whose Authorization Policy should be reset. */
  ecoverseID: Scalars['UUID_NAMEID'];
};

export type EcoverseTemplate = {
  __typename?: 'EcoverseTemplate';
  /** Application templates. */
  applications?: Maybe<Array<ApplicationTemplate>>;
  /** Ecoverse template name. */
  name: Scalars['String'];
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
  resourceID?: Maybe<Scalars['UUID']>;
  type: AuthorizationCredential;
  /** The user to whom the credential is being granted. */
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type Groupable = {
  /** The groups contained by this entity. */
  groups?: Maybe<Array<UserGroup>>;
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
  /** The Lifecycle template name. */
  templateName?: Maybe<Scalars['String']>;
};

export type MembershipOrganisationInput = {
  /** The ID of the organisation to retrieve the membership of. */
  organisationID: Scalars['UUID_NAMEID'];
};

export type MembershipResultEntry = {
  __typename?: 'MembershipResultEntry';
  /** Display name of the entity */
  displayName: Scalars['String'];
  /** The ID of the entry the user is a member of. */
  id: Scalars['UUID'];
  /** Name Identifier of the entity */
  nameID: Scalars['NameID'];
};

export type MembershipUserInput = {
  /** The ID of the user to retrieve the membership of. */
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type MembershipUserResultEntryEcoverse = {
  __typename?: 'MembershipUserResultEntryEcoverse';
  /** Details of the Challenges the user is a member of */
  challenges: Array<MembershipResultEntry>;
  /** Display name of the entity */
  displayName: Scalars['String'];
  /** The ID of the entry the user is a member of. */
  id: Scalars['UUID'];
  /** Name Identifier of the entity */
  nameID: Scalars['NameID'];
  /** Details of the Opportunities the user is a member of */
  opportunities: Array<MembershipResultEntry>;
  /** Details of the UserGroups the user is a member of */
  userGroups: Array<MembershipResultEntry>;
};

export type MembershipUserResultEntryOrganisation = {
  __typename?: 'MembershipUserResultEntryOrganisation';
  /** Display name of the entity */
  displayName: Scalars['String'];
  /** The ID of the entry the user is a member of. */
  id: Scalars['UUID'];
  /** Name Identifier of the entity */
  nameID: Scalars['NameID'];
  /** Details of the Organisations the user is a member of */
  userGroups: Array<MembershipResultEntry>;
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
  /** Assigns a User as an Challenge Admin. */
  assignUserAsChallengeAdmin: User;
  /** Assigns a User as an Ecoverse Admin. */
  assignUserAsEcoverseAdmin: User;
  /** Assigns a User as an Organisation Admin. */
  assignUserAsOrganisationAdmin: User;
  /** Assigns a User as a member of the specified Community. */
  assignUserToCommunity: Community;
  /** Assigns a User as a member of the specified User Group. */
  assignUserToGroup: UserGroup;
  /** Assigns a User as a member of the specified Organisation. */
  assignUserToOrganisation: Organisation;
  /** Reset the Authorization Policy on the specified Ecoverse. */
  authorizationPolicyResetOnEcoverse: Ecoverse;
  /** Reset the Authorization Policy on the specified Organisation. */
  authorizationPolicyResetOnOrganisation: Organisation;
  /** Reset the Authorization policy on the specified User. */
  authorizationPolicyResetOnUser: User;
  /** Authorizes a User to be able to modify the state on the specified Challenge. */
  authorizeStateModificationOnChallenge: User;
  /** Creates a new Actor in the specified ActorGroup. */
  createActor: Actor;
  /** Create a new Actor Group on the EcosystemModel. */
  createActorGroup: ActorGroup;
  /** Creates Application for a User to join this Community. */
  createApplication: Application;
  /** Create a new Aspect on the Opportunity. */
  createAspect: Aspect;
  /** Creates a new Challenge within the specified Ecoverse. */
  createChallenge: Challenge;
  /** Creates a new child challenge within the parent Challenge. */
  createChildChallenge: Challenge;
  /** Creates a new Ecoverse. */
  createEcoverse: Ecoverse;
  /** Creates a new User Group in the specified Community. */
  createGroupOnCommunity: UserGroup;
  /** Creates a new User Group for the specified Organisation. */
  createGroupOnOrganisation: UserGroup;
  /** Creates a new Opportunity within the parent Challenge. */
  createOpportunity: Opportunity;
  /** Creates a new Organisation on the platform. */
  createOrganisation: Organisation;
  /** Create a new Project on the Opportunity */
  createProject: Project;
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
  /** Deletes the specified Challenge. */
  deleteChallenge: Challenge;
  /** Deletes the specified Ecoverse. */
  deleteEcoverse: Ecoverse;
  /** Deletes the specified Opportunity. */
  deleteOpportunity: Opportunity;
  /** Deletes the specified Organisation. */
  deleteOrganisation: Organisation;
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
  /** Trigger an event on the Challenge. */
  eventOnChallenge: Challenge;
  /** Trigger an event on the Opportunity. */
  eventOnOpportunity: Opportunity;
  /** Trigger an event on the Project. */
  eventOnProject: Project;
  /** Grants an authorization credential to a User. */
  grantCredentialToUser: User;
  /** Sends an update message on the specified community */
  messageDiscussionCommunity: Scalars['String'];
  /** Sends an update message on the specified community */
  messageUpdateCommunity: Scalars['String'];
  /** Sends a message on the specified User`s behalf and returns the room id */
  messageUser: Scalars['String'];
  /** Removes a User from being an Challenge Admin. */
  removeUserAsChallengeAdmin: User;
  /** Removes a User from being an Ecoverse Admin. */
  removeUserAsEcoverseAdmin: User;
  /** Removes a User from being an Organisation Admin. */
  removeUserAsOrganisationAdmin: User;
  /** Removes a User as a member of the specified Community. */
  removeUserFromCommunity: Community;
  /** Removes the specified User from specified user group */
  removeUserFromGroup: UserGroup;
  /** Removes a User as a member of the specified Organisation. */
  removeUserFromOrganisation: Organisation;
  /** Removes an authorization credential from a User. */
  revokeCredentialFromUser: User;
  /** Updates the specified Actor. */
  updateActor: Actor;
  /** Updates the specified Aspect. */
  updateAspect: Aspect;
  /** Updates the specified Challenge. */
  updateChallenge: Challenge;
  /** Updates the Ecoverse. */
  updateEcoverse: Ecoverse;
  /** Updates the specified Opportunity. */
  updateOpportunity: Opportunity;
  /** Updates the specified Organisation. */
  updateOrganisation: Organisation;
  /** Updates the specified Profile. */
  updateProfile: Profile;
  /** Updates the specified Project. */
  updateProject: Project;
  /** Updates the User. */
  updateUser: User;
  /** Updates the specified User Group. */
  updateUserGroup: UserGroup;
  /** Uploads and sets an avatar image for the specified Profile. */
  uploadAvatar: Profile;
};

export type MutationAssignUserAsChallengeAdminArgs = {
  membershipData: AssignChallengeAdminInput;
};

export type MutationAssignUserAsEcoverseAdminArgs = {
  membershipData: AssignEcoverseAdminInput;
};

export type MutationAssignUserAsOrganisationAdminArgs = {
  membershipData: AssignOrganisationAdminInput;
};

export type MutationAssignUserToCommunityArgs = {
  membershipData: AssignCommunityMemberInput;
};

export type MutationAssignUserToGroupArgs = {
  membershipData: AssignUserGroupMemberInput;
};

export type MutationAssignUserToOrganisationArgs = {
  membershipData: AssignOrganisationMemberInput;
};

export type MutationAuthorizationPolicyResetOnEcoverseArgs = {
  authorizationResetData: EcoverseAuthorizationResetInput;
};

export type MutationAuthorizationPolicyResetOnOrganisationArgs = {
  authorizationResetData: OrganisationAuthorizationResetInput;
};

export type MutationAuthorizationPolicyResetOnUserArgs = {
  authorizationResetData: UserAuthorizationResetInput;
};

export type MutationAuthorizeStateModificationOnChallengeArgs = {
  grantStateModificationVC: ChallengeAuthorizeStateModificationInput;
};

export type MutationCreateActorArgs = {
  actorData: CreateActorInput;
};

export type MutationCreateActorGroupArgs = {
  actorGroupData: CreateActorGroupInput;
};

export type MutationCreateApplicationArgs = {
  applicationData: CreateApplicationInput;
};

export type MutationCreateAspectArgs = {
  aspectData: CreateAspectInput;
};

export type MutationCreateChallengeArgs = {
  challengeData: CreateChallengeOnEcoverseInput;
};

export type MutationCreateChildChallengeArgs = {
  challengeData: CreateChallengeOnChallengeInput;
};

export type MutationCreateEcoverseArgs = {
  ecoverseData: CreateEcoverseInput;
};

export type MutationCreateGroupOnCommunityArgs = {
  groupData: CreateUserGroupInput;
};

export type MutationCreateGroupOnOrganisationArgs = {
  groupData: CreateUserGroupInput;
};

export type MutationCreateOpportunityArgs = {
  opportunityData: CreateOpportunityInput;
};

export type MutationCreateOrganisationArgs = {
  organisationData: CreateOrganisationInput;
};

export type MutationCreateProjectArgs = {
  projectData: CreateProjectInput;
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

export type MutationDeleteChallengeArgs = {
  deleteData: DeleteChallengeInput;
};

export type MutationDeleteEcoverseArgs = {
  deleteData: DeleteEcoverseInput;
};

export type MutationDeleteOpportunityArgs = {
  deleteData: DeleteOpportunityInput;
};

export type MutationDeleteOrganisationArgs = {
  deleteData: DeleteOrganisationInput;
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

export type MutationEventOnChallengeArgs = {
  challengeEventData: ChallengeEventInput;
};

export type MutationEventOnOpportunityArgs = {
  opportunityEventData: OpportunityEventInput;
};

export type MutationEventOnProjectArgs = {
  projectEventData: ProjectEventInput;
};

export type MutationGrantCredentialToUserArgs = {
  grantCredentialData: GrantAuthorizationCredentialInput;
};

export type MutationMessageDiscussionCommunityArgs = {
  msgData: CommunitySendMessageInput;
};

export type MutationMessageUpdateCommunityArgs = {
  msgData: CommunitySendMessageInput;
};

export type MutationMessageUserArgs = {
  msgData: UserSendMessageInput;
};

export type MutationRemoveUserAsChallengeAdminArgs = {
  membershipData: RemoveChallengeAdminInput;
};

export type MutationRemoveUserAsEcoverseAdminArgs = {
  membershipData: RemoveEcoverseAdminInput;
};

export type MutationRemoveUserAsOrganisationAdminArgs = {
  membershipData: RemoveOrganisationAdminInput;
};

export type MutationRemoveUserFromCommunityArgs = {
  membershipData: RemoveCommunityMemberInput;
};

export type MutationRemoveUserFromGroupArgs = {
  membershipData: RemoveUserGroupMemberInput;
};

export type MutationRemoveUserFromOrganisationArgs = {
  membershipData: RemoveOrganisationMemberInput;
};

export type MutationRevokeCredentialFromUserArgs = {
  revokeCredentialData: RevokeAuthorizationCredentialInput;
};

export type MutationUpdateActorArgs = {
  actorData: UpdateActorInput;
};

export type MutationUpdateAspectArgs = {
  aspectData: UpdateAspectInput;
};

export type MutationUpdateChallengeArgs = {
  challengeData: UpdateChallengeInput;
};

export type MutationUpdateEcoverseArgs = {
  ecoverseData: UpdateEcoverseInput;
};

export type MutationUpdateOpportunityArgs = {
  opportunityData: UpdateOpportunityInput;
};

export type MutationUpdateOrganisationArgs = {
  organisationData: UpdateOrganisationInput;
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

export type MutationUploadAvatarArgs = {
  file: Scalars['Upload'];
  uploadData: UploadProfileAvatarInput;
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
  /** Template aspects. */
  aspects?: Maybe<Array<Scalars['String']>>;
  /** Template opportunity name. */
  name: Scalars['String'];
  /** Template relations. */
  relations?: Maybe<Array<Scalars['String']>>;
};

export type Organisation = Groupable &
  Searchable & {
    __typename?: 'Organisation';
    /** The Agent representing this User. */
    agent?: Maybe<Agent>;
    /** The authorization rules for the entity */
    authorization?: Maybe<Authorization>;
    /** The display name. */
    displayName: Scalars['String'];
    /** Group defined on this organisation. */
    group?: Maybe<UserGroup>;
    /** Groups defined on this organisation. */
    groups?: Maybe<Array<UserGroup>>;
    id: Scalars['UUID'];
    /** All users that are members of this Organisation. */
    members?: Maybe<Array<User>>;
    /** A name identifier of the entity, unique within a given scope. */
    nameID: Scalars['NameID'];
    /** The profile for this organisation. */
    profile: Profile;
  };

export type OrganisationGroupArgs = {
  ID: Scalars['UUID'];
};

export type OrganisationAuthorizationResetInput = {
  /** The identifier of the Organisation whose Authorization Policy should be reset. */
  organisationID: Scalars['UUID_NAMEID_EMAIL'];
};

export type OrganisationMembership = {
  __typename?: 'OrganisationMembership';
  /** Details of the Challenges the Organisation is leading. */
  challengesLeading: Array<MembershipResultEntry>;
  /** Details of Ecoverses the Organisation is hosting. */
  ecoversesHosting: Array<MembershipResultEntry>;
};

export type OryConfig = {
  __typename?: 'OryConfig';
  /** Ory Issuer. */
  issuer: Scalars['String'];
  /** Ory Kratos Public Base URL. Used by all Kratos Public Clients. */
  kratosPublicBaseURL: Scalars['String'];
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

export type Profile = {
  __typename?: 'Profile';
  /** The authorization rules for the entity */
  authorization?: Maybe<Authorization>;
  /** A URI that points to the location of an avatar, either on a shared location or a gravatar */
  avatar?: Maybe<Scalars['String']>;
  /** A short description of the entity associated with this profile. */
  description?: Maybe<Scalars['String']>;
  /** The ID of the entity */
  id: Scalars['UUID'];
  /** A list of URLs to relevant information. */
  references?: Maybe<Array<Reference>>;
  /** A list of named tagsets, each of which has a list of tags. */
  tagsets?: Maybe<Array<Tagset>>;
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
  /** A community. A valid community ID needs to be specified. */
  community: Community;
  /** Alkemio configuration. Provides configuration to external services in the Alkemio ecosystem. */
  configuration: Config;
  /** An ecoverse. If no ID is specified then the first Ecoverse is returned. */
  ecoverse: Ecoverse;
  /** The Ecoverses on this platform */
  ecoverses: Array<Ecoverse>;
  /** The currently logged in user */
  me: User;
  /** Check if the currently logged in user has a User profile */
  meHasProfile: Scalars['Boolean'];
  /** The memberships for this Organisation */
  membershipOrganisation: OrganisationMembership;
  /** Search the ecoverse for terms supplied */
  membershipUser: UserMembership;
  /** Alkemio Services Metadata */
  metadata: Metadata;
  /** A particular Organisation */
  organisation: Organisation;
  /** The Organisations on this platform */
  organisations: Array<Organisation>;
  /** Search the ecoverse for terms supplied */
  search: Array<SearchResultEntry>;
  /** A particular user, identified by the ID or by email */
  user: User;
  /** Privileges assigned to a User (based on held credentials) given an Authorization defnition. */
  userAuthorizationPrivileges: Array<AuthorizationPrivilege>;
  /** The users who have profiles on this platform */
  users: Array<User>;
  /** The users filtered by list of IDs. */
  usersById: Array<User>;
  /** All Users that hold credentials matching the supplied criteria. */
  usersWithAuthorizationCredential: Array<User>;
};

export type QueryCommunityArgs = {
  ID: Scalars['UUID'];
};

export type QueryEcoverseArgs = {
  ID: Scalars['UUID_NAMEID'];
};

export type QueryMembershipOrganisationArgs = {
  membershipData: MembershipOrganisationInput;
};

export type QueryMembershipUserArgs = {
  membershipData: MembershipUserInput;
};

export type QueryOrganisationArgs = {
  ID: Scalars['UUID_NAMEID'];
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

export type QueryUsersByIdArgs = {
  IDs: Array<Scalars['UUID_NAMEID_EMAIL']>;
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

export type RemoveChallengeAdminInput = {
  challengeID: Scalars['UUID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type RemoveCommunityMemberInput = {
  communityID: Scalars['UUID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type RemoveEcoverseAdminInput = {
  ecoverseID: Scalars['UUID_NAMEID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type RemoveOrganisationAdminInput = {
  organisationID: Scalars['UUID_NAMEID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type RemoveOrganisationMemberInput = {
  organisationID: Scalars['UUID_NAMEID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type RemoveUserGroupMemberInput = {
  groupID: Scalars['UUID'];
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type RevokeAuthorizationCredentialInput = {
  /** The resource to which access is being removed. */
  resourceID?: Maybe<Scalars['String']>;
  type: AuthorizationCredential;
  /** The user from whom the credential is being removed. */
  userID: Scalars['UUID_NAMEID_EMAIL'];
};

export type RoomInvitationReceived = {
  __typename?: 'RoomInvitationReceived';
  /** The roomId that the user has been added to */
  roomId?: Maybe<Scalars['String']>;
};

export type SearchInput = {
  /** Restrict the search to only the specified challenges. Default is all Challenges. */
  challengesFilter?: Maybe<Array<Scalars['Float']>>;
  /** Expand the search to includes Tagsets with the provided names. Max 2. */
  tagsetNames?: Maybe<Array<Scalars['String']>>;
  /** The terms to be searched for within this Ecoverse. Max 5. */
  terms: Array<Scalars['String']>;
  /** Restrict the search to only the specified entity types. Values allowed: user, group, organisation, Default is all. */
  typesFilter?: Maybe<Array<Scalars['String']>>;
};

export type SearchResultEntry = {
  __typename?: 'SearchResultEntry';
  /** Each search result contains either a User, UserGroup or Organisation */
  result?: Maybe<Searchable>;
  /** The score for this search result; more matches means a higher score. */
  score?: Maybe<Scalars['Float']>;
  /** The terms that were matched for this result */
  terms?: Maybe<Array<Scalars['String']>>;
};

export type Searchable = {
  id: Scalars['UUID'];
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
  avatarUploaded: Profile;
  messageReceived: CommunicationMessageReceived;
  roomNotificationReceived: RoomInvitationReceived;
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
  /** Ecoverse templates. */
  ecoverses: Array<EcoverseTemplate>;
  /** Template name. */
  name: Scalars['String'];
  /** Opportunity templates. */
  opportunities: Array<OpportunityTemplate>;
  /** User templates. */
  users: Array<UserTemplate>;
};

export type UpdateActorInput = {
  ID: Scalars['UUID'];
  description?: Maybe<Scalars['String']>;
  impact?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

export type UpdateAspectInput = {
  ID: Scalars['UUID'];
  explanation?: Maybe<Scalars['String']>;
  framing?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};

export type UpdateAuthorizationPolicyInput = {
  anonymousReadAccess: Scalars['Boolean'];
};

export type UpdateChallengeInput = {
  ID: Scalars['UUID'];
  /** Update the contained Context entity. */
  context?: Maybe<UpdateContextInput>;
  /** The display name for this entity. */
  displayName?: Maybe<Scalars['String']>;
  /** Update the lead Organisations for the Challenge. */
  leadOrganisations?: Maybe<Array<Scalars['UUID_NAMEID']>>;
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: Maybe<Scalars['NameID']>;
  /** Update the tags on the Tagset. */
  tags?: Maybe<Array<Scalars['String']>>;
};

export type UpdateContextInput = {
  background?: Maybe<Scalars['Markdown']>;
  impact?: Maybe<Scalars['Markdown']>;
  /** Update the set of References for the Context. */
  references?: Maybe<Array<UpdateReferenceInput>>;
  tagline?: Maybe<Scalars['String']>;
  vision?: Maybe<Scalars['Markdown']>;
  /** Update the Visual assets for the new Context. */
  visual?: Maybe<UpdateVisualInput>;
  who?: Maybe<Scalars['Markdown']>;
};

export type UpdateEcoverseInput = {
  /** The ID or NameID of the Ecoverse. */
  ID: Scalars['UUID_NAMEID'];
  /** Update anonymous visibility for the Ecoverse. */
  authorizationPolicy?: Maybe<UpdateAuthorizationPolicyInput>;
  /** Update the contained Context entity. */
  context?: Maybe<UpdateContextInput>;
  /** The display name for this entity. */
  displayName?: Maybe<Scalars['String']>;
  /** Update the host Organisation for the Ecoverse. */
  hostID?: Maybe<Scalars['UUID_NAMEID']>;
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: Maybe<Scalars['NameID']>;
  /** Update the tags on the Tagset. */
  tags?: Maybe<Array<Scalars['String']>>;
};

export type UpdateOpportunityInput = {
  ID: Scalars['UUID'];
  /** Update the contained Context entity. */
  context?: Maybe<UpdateContextInput>;
  /** The display name for this entity. */
  displayName?: Maybe<Scalars['String']>;
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: Maybe<Scalars['NameID']>;
  /** Update the tags on the Tagset. */
  tags?: Maybe<Array<Scalars['String']>>;
};

export type UpdateOrganisationInput = {
  /** The ID or NameID of the Organisation to update. */
  ID: Scalars['UUID_NAMEID'];
  /** The display name for this entity. */
  displayName?: Maybe<Scalars['String']>;
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: Maybe<Scalars['NameID']>;
  profileData?: Maybe<UpdateProfileInput>;
};

export type UpdateProfileInput = {
  ID: Scalars['UUID'];
  avatar?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  references?: Maybe<Array<UpdateReferenceInput>>;
  tagsets?: Maybe<Array<UpdateTagsetInput>>;
};

export type UpdateProjectInput = {
  ID: Scalars['UUID'];
  description?: Maybe<Scalars['String']>;
  /** The display name for this entity. */
  displayName?: Maybe<Scalars['String']>;
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: Maybe<Scalars['NameID']>;
};

export type UpdateReferenceInput = {
  ID: Scalars['UUID'];
  description?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  uri?: Maybe<Scalars['String']>;
};

export type UpdateTagsetInput = {
  ID: Scalars['UUID'];
  name?: Maybe<Scalars['String']>;
  tags?: Maybe<Array<Scalars['String']>>;
};

export type UpdateUserGroupInput = {
  ID: Scalars['UUID'];
  name?: Maybe<Scalars['String']>;
  profileData?: Maybe<UpdateProfileInput>;
};

export type UpdateUserInput = {
  ID: Scalars['UUID_NAMEID_EMAIL'];
  accountUpn?: Maybe<Scalars['String']>;
  city?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  /** The display name for this entity. */
  displayName?: Maybe<Scalars['String']>;
  firstName?: Maybe<Scalars['String']>;
  gender?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  /** A display identifier, unique within the containing scope. Note: updating the nameID will affect URL on the client. */
  nameID?: Maybe<Scalars['NameID']>;
  phone?: Maybe<Scalars['String']>;
  profileData?: Maybe<UpdateProfileInput>;
};

export type UpdateVisualInput = {
  avatar?: Maybe<Scalars['String']>;
  background?: Maybe<Scalars['String']>;
  banner?: Maybe<Scalars['String']>;
};

export type UploadProfileAvatarInput = {
  file: Scalars['String'];
  profileID: Scalars['String'];
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
  communityRooms?: Maybe<Array<CommunityRoom>>;
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
  /** The profile for this User */
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
  /** Details of Ecoverses the user is a member of, with child memberships */
  ecoverses: Array<MembershipUserResultEntryEcoverse>;
  /** Details of the Organisations the user is a member of, with child memberships. */
  organisations: Array<MembershipUserResultEntryOrganisation>;
};

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
  resourceID?: Maybe<Scalars['UUID']>;
  /** The type of credential. */
  type: AuthorizationCredential;
};

export type VerifiedCredential = {
  __typename?: 'VerifiedCredential';
  /** JSON for the claim in the credential */
  claim: Scalars['JSON'];
  /** The time at which the credential was issued */
  issued: Scalars['DateTime'];
  /** The challenge issuing the VC */
  issuer: Scalars['String'];
  /** The type of VC */
  type: Scalars['String'];
};

export type Visual = {
  __typename?: 'Visual';
  /** The avatar (logo) to be used. */
  avatar: Scalars['String'];
  /** The background image to be used, for example when displaying previews. */
  background: Scalars['String'];
  /** The banner to be shown at the top of the page. */
  banner: Scalars['String'];
  /** The ID of the entity */
  id: Scalars['UUID'];
};

export type ApplicationInfoFragment = {
  __typename?: 'Application';
  id: string;
  lifecycle: { __typename?: 'Lifecycle'; id: string; state?: Maybe<string>; nextEvents?: Maybe<Array<string>> };
  user: {
    __typename?: 'User';
    id: string;
    displayName: string;
    email: string;
    profile?: Maybe<{ __typename?: 'Profile'; id: string; avatar?: Maybe<string> }>;
  };
  questions: Array<{ __typename?: 'Question'; id: string; name: string; value: string }>;
};

export type CommunityDetailsFragment = {
  __typename?: 'Community';
  id: string;
  displayName: string;
  applications: Array<{ __typename?: 'Application'; id: string }>;
  members?: Maybe<Array<{ __typename?: 'User' } & GroupMembersFragment>>;
  groups?: Maybe<
    Array<{
      __typename?: 'UserGroup';
      id: string;
      name: string;
      members?: Maybe<Array<{ __typename?: 'User' } & GroupMembersFragment>>;
    }>
  >;
};

export type CommunityMessagesFragment = {
  __typename?: 'Community';
  id: string;
  updatesRoom: {
    __typename?: 'CommunityRoom';
    id: string;
    messages: Array<{ __typename?: 'CommunicationMessageResult' } & MessageDetailsFragment>;
  };
  discussionRoom: {
    __typename?: 'CommunityRoom';
    id: string;
    messages: Array<{ __typename?: 'CommunicationMessageResult' } & MessageDetailsFragment>;
  };
};

export type MessageDetailsFragment = {
  __typename?: 'CommunicationMessageResult';
  id: string;
  sender: string;
  message: string;
  timestamp: number;
};

export type ConfigurationFragment = {
  __typename?: 'Config';
  authentication: {
    __typename?: 'AuthenticationConfig';
    enabled: boolean;
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
};

export type ContextDetailsFragment = {
  __typename?: 'Context';
  id: string;
  tagline?: Maybe<string>;
  background?: Maybe<string>;
  vision?: Maybe<string>;
  impact?: Maybe<string>;
  who?: Maybe<string>;
  references?: Maybe<Array<{ __typename?: 'Reference'; id: string; name: string; uri: string; description: string }>>;
  visual?: Maybe<{ __typename?: 'Visual' } & ContextVisualFragment>;
};

export type ContextVisualFragment = {
  __typename?: 'Visual';
  id: string;
  avatar: string;
  background: string;
  banner: string;
};

export type EcoverseDetailsFragment = {
  __typename?: 'Ecoverse';
  id: string;
  nameID: string;
  displayName: string;
  tagset?: Maybe<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }>;
  authorization?: Maybe<{ __typename?: 'Authorization'; id: string; anonymousReadAccess: boolean }>;
  host?: Maybe<{ __typename?: 'Organisation'; id: string; displayName: string }>;
  context?: Maybe<{ __typename?: 'Context' } & ContextDetailsFragment>;
};

export type EcoverseNameFragment = { __typename?: 'Ecoverse'; id: string; nameID: string; displayName: string };

export type GroupDetailsFragment = { __typename?: 'UserGroup'; id: string; name: string };

export type GroupInfoFragment = {
  __typename?: 'UserGroup';
  id: string;
  name: string;
  profile?: Maybe<{
    __typename?: 'Profile';
    id: string;
    avatar?: Maybe<string>;
    description?: Maybe<string>;
    references?: Maybe<Array<{ __typename?: 'Reference'; id: string; uri: string; name: string; description: string }>>;
    tagsets?: Maybe<Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }>>;
  }>;
};

export type GroupMembersFragment = {
  __typename?: 'User';
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type NewChallengeFragment = { __typename?: 'Challenge'; id: string; nameID: string; displayName: string };

export type NewOpportunityFragment = { __typename?: 'Opportunity'; id: string; nameID: string; displayName: string };

export type OrganisationDetailsFragment = {
  __typename?: 'Organisation';
  id: string;
  displayName: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    avatar?: Maybe<string>;
    tagsets?: Maybe<Array<{ __typename?: 'Tagset'; tags: Array<string> }>>;
  };
};

export type OrganizationProfileInfoFragment = {
  __typename?: 'Organisation';
  id: string;
  nameID: string;
  displayName: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    avatar?: Maybe<string>;
    description?: Maybe<string>;
    references?: Maybe<Array<{ __typename?: 'Reference'; id: string; name: string; uri: string }>>;
    tagsets?: Maybe<Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }>>;
  };
};

export type ProjectDetailsFragment = {
  __typename?: 'Project';
  id: string;
  nameID: string;
  displayName: string;
  description?: Maybe<string>;
  lifecycle?: Maybe<{ __typename?: 'Lifecycle'; state?: Maybe<string> }>;
  tagset?: Maybe<{ __typename?: 'Tagset'; name: string; tags: Array<string> }>;
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
  ecoverseID: string;
  activity?: Maybe<Array<{ __typename?: 'NVP'; name: string; value: string }>>;
  context?: Maybe<{
    __typename?: 'Context';
    id: string;
    tagline?: Maybe<string>;
    visual?: Maybe<{ __typename?: 'Visual'; id: string; avatar: string; background: string }>;
  }>;
  tagset?: Maybe<{ __typename?: 'Tagset'; id: string; tags: Array<string> }>;
};

export type OpportunitySearchResultFragment = {
  __typename?: 'Opportunity';
  id: string;
  displayName: string;
  nameID: string;
  activity?: Maybe<Array<{ __typename?: 'NVP'; name: string; value: string }>>;
  context?: Maybe<{
    __typename?: 'Context';
    id: string;
    tagline?: Maybe<string>;
    visual?: Maybe<{ __typename?: 'Visual'; id: string; avatar: string; background: string }>;
  }>;
  tagset?: Maybe<{ __typename?: 'Tagset'; id: string; tags: Array<string> }>;
  challenge?: Maybe<{ __typename?: 'Challenge'; id: string; nameID: string; displayName: string; ecoverseID: string }>;
};

export type OrganisationSearchResultFragment = {
  __typename?: 'Organisation';
  id: string;
  displayName: string;
  profile: {
    __typename?: 'Profile';
    id: string;
    avatar?: Maybe<string>;
    tagsets?: Maybe<Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }>>;
  };
};

export type UserSearchResultFragment = { __typename?: 'UserGroup'; name: string; id: string };

export type UserAgentFragment = {
  __typename?: 'User';
  agent?: Maybe<{
    __typename?: 'Agent';
    id: string;
    did?: Maybe<string>;
    credentials?: Maybe<
      Array<{ __typename?: 'Credential'; id: string; resourceID: string; type: AuthorizationCredential }>
    >;
  }>;
};

export type UserDetailsFragment = {
  __typename?: 'User';
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  country: string;
  city: string;
  phone: string;
  accountUpn: string;
  agent?: Maybe<{
    __typename?: 'Agent';
    credentials?: Maybe<Array<{ __typename?: 'Credential'; type: AuthorizationCredential; resourceID: string }>>;
  }>;
  profile?: Maybe<{
    __typename?: 'Profile';
    id: string;
    description?: Maybe<string>;
    avatar?: Maybe<string>;
    references?: Maybe<Array<{ __typename?: 'Reference'; id: string; name: string; uri: string }>>;
    tagsets?: Maybe<Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }>>;
  }>;
};

export type UserMembershipDetailsFragment = {
  __typename?: 'UserMembership';
  ecoverses: Array<{
    __typename?: 'MembershipUserResultEntryEcoverse';
    id: string;
    nameID: string;
    displayName: string;
    challenges: Array<{ __typename?: 'MembershipResultEntry'; id: string; nameID: string; displayName: string }>;
    opportunities: Array<{ __typename?: 'MembershipResultEntry'; id: string; nameID: string; displayName: string }>;
    userGroups: Array<{ __typename?: 'MembershipResultEntry'; id: string; nameID: string; displayName: string }>;
  }>;
  organisations: Array<{
    __typename?: 'MembershipUserResultEntryOrganisation';
    id: string;
    nameID: string;
    displayName: string;
    userGroups: Array<{ __typename?: 'MembershipResultEntry'; id: string; nameID: string; displayName: string }>;
  }>;
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
    members?: Maybe<Array<{ __typename?: 'User' } & GroupMembersFragment>>;
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

export type CreateApplicationMutationVariables = Exact<{
  input: CreateApplicationInput;
}>;

export type CreateApplicationMutation = {
  __typename?: 'Mutation';
  createApplication: { __typename?: 'Application'; id: string };
};

export type CreateAspectMutationVariables = Exact<{
  input: CreateAspectInput;
}>;

export type CreateAspectMutation = {
  __typename?: 'Mutation';
  createAspect: { __typename?: 'Aspect'; id: string; title: string };
};

export type CreateChallengeMutationVariables = Exact<{
  input: CreateChallengeOnEcoverseInput;
}>;

export type CreateChallengeMutation = {
  __typename?: 'Mutation';
  createChallenge: { __typename?: 'Challenge' } & NewChallengeFragment;
};

export type CreateEcoverseMutationVariables = Exact<{
  input: CreateEcoverseInput;
}>;

export type CreateEcoverseMutation = {
  __typename?: 'Mutation';
  createEcoverse: { __typename?: 'Ecoverse' } & EcoverseDetailsFragment;
};

export type CreateGroupOnCommunityMutationVariables = Exact<{
  input: CreateUserGroupInput;
}>;

export type CreateGroupOnCommunityMutation = {
  __typename?: 'Mutation';
  createGroupOnCommunity: { __typename?: 'UserGroup' } & GroupDetailsFragment;
};

export type CreateGroupOnOrganizationMutationVariables = Exact<{
  input: CreateUserGroupInput;
}>;

export type CreateGroupOnOrganizationMutation = {
  __typename?: 'Mutation';
  createGroupOnOrganisation: { __typename?: 'UserGroup'; id: string; name: string };
};

export type CreateOpportunityMutationVariables = Exact<{
  input: CreateOpportunityInput;
}>;

export type CreateOpportunityMutation = {
  __typename?: 'Mutation';
  createOpportunity: { __typename?: 'Opportunity' } & NewOpportunityFragment;
};

export type CreateOrganizationMutationVariables = Exact<{
  input: CreateOrganisationInput;
}>;

export type CreateOrganizationMutation = {
  __typename?: 'Mutation';
  createOrganisation: { __typename?: 'Organisation'; id: string; nameID: string; displayName: string };
};

export type CreateProjectMutationVariables = Exact<{
  input: CreateProjectInput;
}>;

export type CreateProjectMutation = {
  __typename?: 'Mutation';
  createProject: { __typename?: 'Project' } & ProjectDetailsFragment;
};

export type CreateReferenceOnContextMutationVariables = Exact<{
  input: CreateReferenceOnContextInput;
}>;

export type CreateReferenceOnContextMutation = {
  __typename?: 'Mutation';
  createReferenceOnContext: { __typename?: 'Reference' } & ReferenceDetailsFragment;
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

export type CreateUserMutation = { __typename?: 'Mutation'; createUser: { __typename?: 'User' } & UserDetailsFragment };

export type CreateUserNewRegistrationMutationVariables = Exact<{ [key: string]: never }>;

export type CreateUserNewRegistrationMutation = {
  __typename?: 'Mutation';
  createUserNewRegistration: { __typename?: 'User' } & UserDetailsFragment;
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

export type DeleteEcoverseMutationVariables = Exact<{
  input: DeleteEcoverseInput;
}>;

export type DeleteEcoverseMutation = {
  __typename?: 'Mutation';
  deleteEcoverse: { __typename?: 'Ecoverse'; id: string; nameID: string };
};

export type DeleteGroupMutationVariables = Exact<{
  input: DeleteUserGroupInput;
}>;

export type DeleteGroupMutation = {
  __typename?: 'Mutation';
  deleteUserGroup: { __typename?: 'UserGroup'; id: string; name: string };
};

export type DeleteOpportunityMutationVariables = Exact<{
  input: DeleteOpportunityInput;
}>;

export type DeleteOpportunityMutation = {
  __typename?: 'Mutation';
  deleteOpportunity: { __typename?: 'Opportunity'; id: string; nameID: string };
};

export type DeleteOrganizationMutationVariables = Exact<{
  input: DeleteOrganisationInput;
}>;

export type DeleteOrganizationMutation = {
  __typename?: 'Mutation';
  deleteOrganisation: { __typename?: 'Organisation'; id: string };
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
    lifecycle: { __typename?: 'Lifecycle'; id: string; nextEvents?: Maybe<Array<string>>; state?: Maybe<string> };
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
    lifecycle?: Maybe<{
      __typename?: 'Lifecycle';
      id: string;
      nextEvents?: Maybe<Array<string>>;
      state?: Maybe<string>;
    }>;
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
    lifecycle?: Maybe<{
      __typename?: 'Lifecycle';
      id: string;
      nextEvents?: Maybe<Array<string>>;
      state?: Maybe<string>;
    }>;
  };
};

export type GrantCredentialsMutationVariables = Exact<{
  input: GrantAuthorizationCredentialInput;
}>;

export type GrantCredentialsMutation = {
  __typename?: 'Mutation';
  grantCredentialToUser: { __typename?: 'User'; id: string; displayName: string } & UserAgentFragment;
};

export type AssignUserAsChallengeAdminMutationVariables = Exact<{
  input: AssignChallengeAdminInput;
}>;

export type AssignUserAsChallengeAdminMutation = {
  __typename?: 'Mutation';
  assignUserAsChallengeAdmin: { __typename?: 'User'; id: string; displayName: string };
};

export type AssignUserAsEcoverseAdminMutationVariables = Exact<{
  input: AssignEcoverseAdminInput;
}>;

export type AssignUserAsEcoverseAdminMutation = {
  __typename?: 'Mutation';
  assignUserAsEcoverseAdmin: { __typename?: 'User'; id: string; displayName: string };
};

export type RemoveUserAsChallengeAdminMutationVariables = Exact<{
  input: RemoveChallengeAdminInput;
}>;

export type RemoveUserAsChallengeAdminMutation = {
  __typename?: 'Mutation';
  removeUserAsChallengeAdmin: { __typename?: 'User'; id: string; displayName: string };
};

export type RemoveUserAsEcoverseAdminMutationVariables = Exact<{
  input: RemoveEcoverseAdminInput;
}>;

export type RemoveUserAsEcoverseAdminMutation = {
  __typename?: 'Mutation';
  removeUserAsEcoverseAdmin: { __typename?: 'User'; id: string; displayName: string };
};

export type RemoveUserFromCommunityMutationVariables = Exact<{
  input: RemoveCommunityMemberInput;
}>;

export type RemoveUserFromCommunityMutation = {
  __typename?: 'Mutation';
  removeUserFromCommunity: {
    __typename?: 'Community';
    id: string;
    members?: Maybe<Array<{ __typename?: 'User' } & GroupMembersFragment>>;
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
    members?: Maybe<Array<{ __typename?: 'User' } & GroupMembersFragment>>;
  };
};

export type RevokeCredentialsMutationVariables = Exact<{
  input: RevokeAuthorizationCredentialInput;
}>;

export type RevokeCredentialsMutation = {
  __typename?: 'Mutation';
  revokeCredentialFromUser: { __typename?: 'User'; id: string; displayName: string } & UserAgentFragment;
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
    description?: Maybe<string>;
    impact?: Maybe<string>;
    value?: Maybe<string>;
  };
};

export type UpdateAspectMutationVariables = Exact<{
  input: UpdateAspectInput;
}>;

export type UpdateAspectMutation = {
  __typename?: 'Mutation';
  updateAspect: { __typename?: 'Aspect'; id: string; title: string; explanation: string; framing: string };
};

export type UpdateChallengeMutationVariables = Exact<{
  input: UpdateChallengeInput;
}>;

export type UpdateChallengeMutation = {
  __typename?: 'Mutation';
  updateChallenge: { __typename?: 'Challenge'; id: string; nameID: string; displayName: string };
};

export type UpdateEcoverseMutationVariables = Exact<{
  input: UpdateEcoverseInput;
}>;

export type UpdateEcoverseMutation = {
  __typename?: 'Mutation';
  updateEcoverse: { __typename?: 'Ecoverse' } & EcoverseDetailsFragment;
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
    profile?: Maybe<{
      __typename?: 'Profile';
      id: string;
      avatar?: Maybe<string>;
      description?: Maybe<string>;
      references?: Maybe<Array<{ __typename?: 'Reference'; uri: string; name: string; description: string }>>;
      tagsets?: Maybe<Array<{ __typename?: 'Tagset'; name: string; tags: Array<string> }>>;
    }>;
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
  input: UpdateOrganisationInput;
}>;

export type UpdateOrganizationMutation = {
  __typename?: 'Mutation';
  updateOrganisation: { __typename?: 'Organisation' } & OrganizationProfileInfoFragment;
};

export type UpdateUserMutationVariables = Exact<{
  input: UpdateUserInput;
}>;

export type UpdateUserMutation = { __typename?: 'Mutation'; updateUser: { __typename?: 'User' } & UserDetailsFragment };

export type UploadAvatarMutationVariables = Exact<{
  file: Scalars['Upload'];
  input: UploadProfileAvatarInput;
}>;

export type UploadAvatarMutation = {
  __typename?: 'Mutation';
  uploadAvatar: { __typename?: 'Profile'; id: string; avatar?: Maybe<string> };
};

export type AllOpportunitiesQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
}>;

export type AllOpportunitiesQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    opportunities: Array<{ __typename?: 'Opportunity'; id: string; nameID: string }>;
  };
};

export type ChallengeApplicationQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeApplicationQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      displayName: string;
      context?: Maybe<{ __typename?: 'Context' } & ContextDetailsFragment>;
      community?: Maybe<{ __typename?: 'Community' } & CommunityDetailsFragment>;
    };
  };
};

export type ChallengeApplicationsQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeApplicationsQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      community?: Maybe<{
        __typename?: 'Community';
        id: string;
        applications: Array<{ __typename?: 'Application' } & ApplicationInfoFragment>;
      }>;
    };
  };
};

export type EcoverseApplicationQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
}>;

export type EcoverseApplicationQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    displayName: string;
    context?: Maybe<{ __typename?: 'Context' } & ContextDetailsFragment>;
    community?: Maybe<{ __typename?: 'Community'; id: string; displayName: string }>;
  };
};

export type EcoverseApplicationsQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
}>;

export type EcoverseApplicationsQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    community?: Maybe<{
      __typename?: 'Community';
      id: string;
      applications: Array<{ __typename?: 'Application' } & ApplicationInfoFragment>;
    }>;
  };
};

export type UserCardQueryVariables = Exact<{
  id: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type UserCardQuery = { __typename?: 'Query'; user: { __typename: 'User' } & UserDetailsFragment };

export type ChallengeActivityQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeActivityQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      activity?: Maybe<Array<{ __typename?: 'NVP'; name: string; value: string }>>;
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
        applications?: Maybe<
          Array<{
            __typename?: 'ApplicationTemplate';
            name: string;
            questions: Array<{ __typename?: 'QuestionTemplate'; required: boolean; question: string }>;
          }>
        >;
      }>;
    };
  };
};

export type ChallengeGroupsQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeGroupsQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      community?: Maybe<{
        __typename?: 'Community';
        groups?: Maybe<Array<{ __typename?: 'UserGroup'; id: string; name: string }>>;
      }>;
    };
  };
};

export type ChallengeLeadOrganisationsQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
  challengeID: Scalars['UUID_NAMEID'];
}>;

export type ChallengeLeadOrganisationsQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      leadOrganisations: Array<{ __typename?: 'Organisation' } & OrganisationDetailsFragment>;
    };
  };
  organisations: Array<{ __typename?: 'Organisation' } & OrganisationDetailsFragment>;
};

export type ChallengeLifecycleQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeLifecycleQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      lifecycle?: Maybe<{
        __typename?: 'Lifecycle';
        id: string;
        machineDef: string;
        state?: Maybe<string>;
        nextEvents?: Maybe<Array<string>>;
      }>;
    };
  };
};

export type ChallengeMembersQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
  challengeID: Scalars['UUID_NAMEID'];
}>;

export type ChallengeMembersQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      community?: Maybe<{
        __typename?: 'Community';
        members?: Maybe<
          Array<{
            __typename?: 'User';
            id: string;
            displayName: string;
            firstName: string;
            lastName: string;
            email: string;
          }>
        >;
      }>;
    };
  };
};

export type ChallengeNameQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeNameQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      displayName: string;
      community?: Maybe<{ __typename?: 'Community'; id: string; displayName: string }>;
    };
  };
};

export type ChallengeProfileQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeProfileQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      nameID: string;
      displayName: string;
      lifecycle?: Maybe<{ __typename?: 'Lifecycle'; state?: Maybe<string> }>;
      context?: Maybe<{ __typename?: 'Context' } & ContextDetailsFragment>;
      community?: Maybe<{
        __typename?: 'Community';
        members?: Maybe<Array<{ __typename?: 'User'; displayName: string }>>;
      }>;
      tagset?: Maybe<{ __typename?: 'Tagset'; name: string; tags: Array<string> }>;
      opportunities?: Maybe<
        Array<{
          __typename?: 'Opportunity';
          id: string;
          displayName: string;
          nameID: string;
          lifecycle?: Maybe<{ __typename?: 'Lifecycle'; state?: Maybe<string> }>;
          context?: Maybe<{ __typename?: 'Context' } & ContextDetailsFragment>;
          projects?: Maybe<
            Array<{
              __typename?: 'Project';
              id: string;
              nameID: string;
              displayName: string;
              description?: Maybe<string>;
              lifecycle?: Maybe<{ __typename?: 'Lifecycle'; state?: Maybe<string> }>;
            }>
          >;
          tagset?: Maybe<{ __typename?: 'Tagset'; name: string; tags: Array<string> }>;
        }>
      >;
      leadOrganisations: Array<{
        __typename?: 'Organisation';
        id: string;
        displayName: string;
        profile: { __typename?: 'Profile'; id: string; avatar?: Maybe<string> };
      }>;
    };
  };
};

export type ChallengeProfileInfoQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeProfileInfoQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      nameID: string;
      displayName: string;
      tagset?: Maybe<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }>;
      lifecycle?: Maybe<{ __typename?: 'Lifecycle'; state?: Maybe<string> }>;
      context?: Maybe<{ __typename?: 'Context' } & ContextDetailsFragment>;
    };
  };
};

export type ChallengeUserIdsQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeUserIdsQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      community?: Maybe<{ __typename?: 'Community'; members?: Maybe<Array<{ __typename?: 'User'; id: string }>> }>;
    };
  };
};

export type ChallengesQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
}>;

export type ChallengesQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    challenges?: Maybe<
      Array<{
        __typename?: 'Challenge';
        id: string;
        displayName: string;
        nameID: string;
        context?: Maybe<{
          __typename?: 'Context';
          id: string;
          tagline?: Maybe<string>;
          references?: Maybe<Array<{ __typename?: 'Reference'; name: string; uri: string }>>;
          visual?: Maybe<{ __typename?: 'Visual' } & ContextVisualFragment>;
        }>;
      }>
    >;
  };
};

export type ChallengesWithActivityQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
}>;

export type ChallengesWithActivityQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    challenges?: Maybe<
      Array<{
        __typename?: 'Challenge';
        id: string;
        displayName: string;
        nameID: string;
        activity?: Maybe<Array<{ __typename?: 'NVP'; name: string; value: string }>>;
        context?: Maybe<{
          __typename?: 'Context';
          id: string;
          tagline?: Maybe<string>;
          visual?: Maybe<{ __typename?: 'Visual'; background: string }>;
        }>;
        tagset?: Maybe<{ __typename?: 'Tagset'; name: string; tags: Array<string> }>;
      }>
    >;
  };
};

export type AllCommunitiesQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
}>;

export type AllCommunitiesQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    community?: Maybe<{ __typename?: 'Community' } & AllCommunityDetailsFragment>;
    challenges?: Maybe<
      Array<{ __typename?: 'Challenge'; community?: Maybe<{ __typename?: 'Community' } & AllCommunityDetailsFragment> }>
    >;
    opportunities: Array<{
      __typename?: 'Opportunity';
      community?: Maybe<{ __typename?: 'Community' } & AllCommunityDetailsFragment>;
    }>;
  };
};

export type AllCommunityDetailsFragment = { __typename?: 'Community'; id: string; displayName: string };

export type ChallengeCommunityQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeCommunityQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      displayName: string;
      community?: Maybe<{ __typename?: 'Community' } & CommunityDetailsFragment>;
    };
  };
};

export type ChallengesWithCommunityQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
}>;

export type ChallengesWithCommunityQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    challenges?: Maybe<
      Array<{
        __typename?: 'Challenge';
        id: string;
        nameID: string;
        displayName: string;
        community?: Maybe<{ __typename?: 'Community'; id: string; displayName: string }>;
      }>
    >;
  };
};

export type EcoverseCommunityQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
}>;

export type EcoverseCommunityQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    community?: Maybe<{ __typename?: 'Community' } & CommunityDetailsFragment>;
  };
};

export type ChallengeCommunityMessagesQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type ChallengeCommunityMessagesQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      community?: Maybe<{ __typename?: 'Community' } & CommunityMessagesFragment>;
    };
  };
};

export type EcoversCommunityMessagesQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
}>;

export type EcoversCommunityMessagesQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    nameID: string;
    community?: Maybe<{ __typename?: 'Community' } & CommunityMessagesFragment>;
  };
};

export type OpportunityCommunityMessagesQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityCommunityMessagesQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      community?: Maybe<{ __typename?: 'Community' } & CommunityMessagesFragment>;
    };
  };
};

export type OpportunityCommunityQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityCommunityQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      displayName: string;
      community?: Maybe<{ __typename?: 'Community' } & CommunityDetailsFragment>;
    };
  };
};

export type ConfigurationQueryVariables = Exact<{ [key: string]: never }>;

export type ConfigurationQuery = {
  __typename?: 'Query';
  configuration: { __typename?: 'Config' } & ConfigurationFragment;
};

export type EcoverseActivityQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
}>;

export type EcoverseActivityQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    activity?: Maybe<Array<{ __typename?: 'NVP'; name: string; value: string }>>;
  };
};

export type EcoverseApplicationTemplateQueryVariables = Exact<{ [key: string]: never }>;

export type EcoverseApplicationTemplateQuery = {
  __typename?: 'Query';
  configuration: {
    __typename?: 'Config';
    template: {
      __typename?: 'Template';
      ecoverses: Array<{
        __typename?: 'EcoverseTemplate';
        name: string;
        applications?: Maybe<
          Array<{
            __typename?: 'ApplicationTemplate';
            name: string;
            questions: Array<{ __typename?: 'QuestionTemplate'; required: boolean; question: string }>;
          }>
        >;
      }>;
    };
  };
};

export type EcoverseGroupQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
  groupId: Scalars['UUID'];
}>;

export type EcoverseGroupQuery = {
  __typename?: 'Query';
  ecoverse: { __typename?: 'Ecoverse'; id: string; group: { __typename?: 'UserGroup' } & GroupInfoFragment };
};

export type EcoverseGroupsListQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
}>;

export type EcoverseGroupsListQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    groups: Array<{ __typename?: 'UserGroup'; id: string; name: string }>;
  };
};

export type EcoverseHostReferencesQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
}>;

export type EcoverseHostReferencesQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    host?: Maybe<{
      __typename?: 'Organisation';
      profile: {
        __typename?: 'Profile';
        id: string;
        references?: Maybe<Array<{ __typename?: 'Reference'; name: string; uri: string }>>;
      };
    }>;
  };
};

export type EcoverseInfoQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
}>;

export type EcoverseInfoQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    community?: Maybe<{ __typename?: 'Community'; id: string; displayName: string }>;
  } & EcoverseDetailsFragment;
};

export type EcoverseMembersQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
}>;

export type EcoverseMembersQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    community?: Maybe<{
      __typename?: 'Community';
      id: string;
      members?: Maybe<
        Array<{
          __typename?: 'User';
          id: string;
          displayName: string;
          firstName: string;
          lastName: string;
          email: string;
        }>
      >;
    }>;
  };
};

export type EcoverseNameQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
}>;

export type EcoverseNameQuery = { __typename?: 'Query'; ecoverse: { __typename?: 'Ecoverse' } & EcoverseNameFragment };

export type EcoverseUserIdsQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
}>;

export type EcoverseUserIdsQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    community?: Maybe<{
      __typename?: 'Community';
      id: string;
      members?: Maybe<Array<{ __typename?: 'User'; id: string }>>;
    }>;
  };
};

export type EcoverseVisualQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
}>;

export type EcoverseVisualQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    context?: Maybe<{ __typename?: 'Context'; visual?: Maybe<{ __typename?: 'Visual' } & ContextVisualFragment> }>;
  };
};

export type EcoversesQueryVariables = Exact<{ [key: string]: never }>;

export type EcoversesQuery = {
  __typename?: 'Query';
  ecoverses: Array<{ __typename?: 'Ecoverse' } & EcoverseDetailsFragment>;
};

export type EcoversesWithActivityQueryVariables = Exact<{ [key: string]: never }>;

export type EcoversesWithActivityQuery = {
  __typename?: 'Query';
  ecoverses: Array<{
    __typename?: 'Ecoverse';
    id: string;
    displayName: string;
    nameID: string;
    authorization?: Maybe<{ __typename?: 'Authorization'; anonymousReadAccess: boolean }>;
    activity?: Maybe<Array<{ __typename?: 'NVP'; name: string; value: string }>>;
    context?: Maybe<{
      __typename?: 'Context';
      tagline?: Maybe<string>;
      visual?: Maybe<{ __typename?: 'Visual'; background: string }>;
    }>;
    tagset?: Maybe<{ __typename?: 'Tagset'; name: string; tags: Array<string> }>;
  }>;
};

export type GlobalActivityQueryVariables = Exact<{ [key: string]: never }>;

export type GlobalActivityQuery = {
  __typename?: 'Query';
  metadata: { __typename?: 'Metadata'; activity: Array<{ __typename?: 'NVP'; name: string; value: string }> };
};

export type GroupMembersQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
  groupId: Scalars['UUID'];
}>;

export type GroupMembersQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    group: {
      __typename?: 'UserGroup';
      id: string;
      name: string;
      members?: Maybe<Array<{ __typename?: 'User' } & GroupMembersFragment>>;
    };
  };
};

export type MeQueryVariables = Exact<{ [key: string]: never }>;

export type MeQuery = { __typename?: 'Query'; me: { __typename?: 'User' } & UserDetailsFragment & UserAgentFragment };

export type MeHasProfileQueryVariables = Exact<{ [key: string]: never }>;

export type MeHasProfileQuery = { __typename?: 'Query'; meHasProfile: boolean };

export type MembershipOrganisationQueryVariables = Exact<{
  input: MembershipOrganisationInput;
}>;

export type MembershipOrganisationQuery = {
  __typename?: 'Query';
  membershipOrganisation: {
    __typename?: 'OrganisationMembership';
    ecoversesHosting: Array<{ __typename?: 'MembershipResultEntry'; id: string; nameID: string; displayName: string }>;
    challengesLeading: Array<{ __typename?: 'MembershipResultEntry'; id: string; nameID: string; displayName: string }>;
  };
};

export type MembershipUserQueryVariables = Exact<{
  input: MembershipUserInput;
}>;

export type MembershipUserQuery = {
  __typename?: 'Query';
  membershipUser: { __typename?: 'UserMembership' } & UserMembershipDetailsFragment;
};

export type OpportunitiesQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
  challengeId: Scalars['UUID_NAMEID'];
}>;

export type OpportunitiesQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    challenge: {
      __typename?: 'Challenge';
      id: string;
      opportunities?: Maybe<Array<{ __typename?: 'Opportunity'; id: string; nameID: string; displayName: string }>>;
    };
  };
};

export type OpportunityActivityQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityActivityQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      activity?: Maybe<Array<{ __typename?: 'NVP'; name: string; value: string }>>;
    };
  };
};

export type OpportunityActorGroupsQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityActorGroupsQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      context?: Maybe<{
        __typename?: 'Context';
        ecosystemModel?: Maybe<{
          __typename?: 'EcosystemModel';
          id: string;
          actorGroups?: Maybe<
            Array<{
              __typename?: 'ActorGroup';
              id: string;
              name: string;
              description?: Maybe<string>;
              actors?: Maybe<
                Array<{
                  __typename?: 'Actor';
                  id: string;
                  name: string;
                  description?: Maybe<string>;
                  value?: Maybe<string>;
                  impact?: Maybe<string>;
                }>
              >;
            }>
          >;
        }>;
      }>;
    };
  };
};

export type OpportunityAspectsQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityAspectsQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      context?: Maybe<{
        __typename?: 'Context';
        aspects?: Maybe<Array<{ __typename?: 'Aspect'; title: string; framing: string; explanation: string }>>;
      }>;
    };
  };
};

export type OpportunityGroupsQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityGroupsQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      community?: Maybe<{
        __typename?: 'Community';
        groups?: Maybe<Array<{ __typename?: 'UserGroup'; id: string; name: string }>>;
      }>;
    };
  };
};

export type OpportunityLifecycleQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityLifecycleQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      lifecycle?: Maybe<{
        __typename?: 'Lifecycle';
        id: string;
        machineDef: string;
        state?: Maybe<string>;
        nextEvents?: Maybe<Array<string>>;
      }>;
    };
  };
};

export type OpportunityNameQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityNameQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    opportunity: { __typename?: 'Opportunity'; id: string; displayName: string };
  };
};

export type OpportunityProfileQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityProfileQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      nameID: string;
      displayName: string;
      lifecycle?: Maybe<{ __typename?: 'Lifecycle'; state?: Maybe<string> }>;
      context?: Maybe<
        {
          __typename?: 'Context';
          aspects?: Maybe<
            Array<{ __typename?: 'Aspect'; id: string; title: string; framing: string; explanation: string }>
          >;
          ecosystemModel?: Maybe<{
            __typename?: 'EcosystemModel';
            id: string;
            actorGroups?: Maybe<
              Array<{
                __typename?: 'ActorGroup';
                id: string;
                name: string;
                description?: Maybe<string>;
                actors?: Maybe<
                  Array<{
                    __typename?: 'Actor';
                    id: string;
                    name: string;
                    description?: Maybe<string>;
                    value?: Maybe<string>;
                    impact?: Maybe<string>;
                  }>
                >;
              }>
            >;
          }>;
        } & ContextDetailsFragment
      >;
      community?: Maybe<{
        __typename?: 'Community';
        members?: Maybe<Array<{ __typename?: 'User'; displayName: string }>>;
      }>;
      tagset?: Maybe<{ __typename?: 'Tagset'; name: string; tags: Array<string> }>;
      projects?: Maybe<Array<{ __typename?: 'Project' } & ProjectDetailsFragment>>;
      relations?: Maybe<
        Array<{
          __typename?: 'Relation';
          id: string;
          type: string;
          actorRole: string;
          actorName: string;
          actorType: string;
          description: string;
        }>
      >;
      activity?: Maybe<Array<{ __typename?: 'NVP'; name: string; value: string }>>;
    };
  };
};

export type OpportunityProfileInfoQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityProfileInfoQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      id: string;
      nameID: string;
      displayName: string;
      tagset?: Maybe<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }>;
      context?: Maybe<{ __typename?: 'Context' } & ContextDetailsFragment>;
    };
  };
};

export type OpportunityRelationsQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityRelationsQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      relations?: Maybe<
        Array<{
          __typename?: 'Relation';
          actorRole: string;
          actorName: string;
          actorType: string;
          description: string;
          type: string;
        }>
      >;
    };
  };
};

export type OpportunityTemplateQueryVariables = Exact<{ [key: string]: never }>;

export type OpportunityTemplateQuery = {
  __typename?: 'Query';
  configuration: {
    __typename?: 'Config';
    template: {
      __typename?: 'Template';
      opportunities: Array<{
        __typename?: 'OpportunityTemplate';
        aspects?: Maybe<Array<string>>;
        actorGroups?: Maybe<Array<string>>;
      }>;
    };
  };
};

export type OpportunityUserIdsQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityUserIdsQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      community?: Maybe<{ __typename?: 'Community'; members?: Maybe<Array<{ __typename?: 'User'; id: string }>> }>;
    };
  };
};

export type OpportunityWithActivityQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
}>;

export type OpportunityWithActivityQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    opportunities: Array<{
      __typename?: 'Opportunity';
      id: string;
      displayName: string;
      nameID: string;
      activity?: Maybe<Array<{ __typename?: 'NVP'; name: string; value: string }>>;
      context?: Maybe<{
        __typename?: 'Context';
        tagline?: Maybe<string>;
        visual?: Maybe<{ __typename?: 'Visual'; background: string }>;
      }>;
      tagset?: Maybe<{ __typename?: 'Tagset'; name: string; tags: Array<string> }>;
    }>;
  };
};

export type OrganisationGroupQueryVariables = Exact<{
  organisationId: Scalars['UUID_NAMEID'];
  groupId: Scalars['UUID'];
}>;

export type OrganisationGroupQuery = {
  __typename?: 'Query';
  organisation: {
    __typename?: 'Organisation';
    id: string;
    members?: Maybe<Array<{ __typename?: 'User' } & GroupMembersFragment>>;
    group?: Maybe<{ __typename?: 'UserGroup' } & GroupInfoFragment>;
  };
};

export type OrganizationDetailsQueryVariables = Exact<{
  id: Scalars['UUID_NAMEID'];
}>;

export type OrganizationDetailsQuery = {
  __typename?: 'Query';
  organisation: {
    __typename?: 'Organisation';
    id: string;
    displayName: string;
    profile: {
      __typename?: 'Profile';
      id: string;
      avatar?: Maybe<string>;
      description?: Maybe<string>;
      references?: Maybe<Array<{ __typename?: 'Reference'; name: string; uri: string }>>;
      tagsets?: Maybe<Array<{ __typename?: 'Tagset'; id: string; name: string; tags: Array<string> }>>;
    };
    groups?: Maybe<
      Array<{
        __typename?: 'UserGroup';
        id: string;
        name: string;
        members?: Maybe<Array<{ __typename?: 'User'; id: string; displayName: string }>>;
      }>
    >;
  };
};

export type OrganizationGroupsQueryVariables = Exact<{
  id: Scalars['UUID_NAMEID'];
}>;

export type OrganizationGroupsQuery = {
  __typename?: 'Query';
  organisation: {
    __typename?: 'Organisation';
    id: string;
    groups?: Maybe<Array<{ __typename?: 'UserGroup'; id: string; name: string }>>;
  };
};

export type OrganizationNameQueryVariables = Exact<{
  id: Scalars['UUID_NAMEID'];
}>;

export type OrganizationNameQuery = {
  __typename?: 'Query';
  organisation: { __typename?: 'Organisation'; id: string; displayName: string };
};

export type OrganizationProfileInfoQueryVariables = Exact<{
  id: Scalars['UUID_NAMEID'];
}>;

export type OrganizationProfileInfoQuery = {
  __typename?: 'Query';
  organisation: { __typename?: 'Organisation' } & OrganizationProfileInfoFragment;
};

export type OrganizationsListQueryVariables = Exact<{ [key: string]: never }>;

export type OrganizationsListQuery = {
  __typename?: 'Query';
  organisations: Array<{ __typename?: 'Organisation'; id: string; displayName: string }>;
};

export type ProjectProfileQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
  projectId: Scalars['UUID_NAMEID'];
}>;

export type ProjectProfileQuery = {
  __typename?: 'Query';
  ecoverse: { __typename?: 'Ecoverse'; id: string; project: { __typename?: 'Project' } & ProjectDetailsFragment };
};

export type ProjectsQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
}>;

export type ProjectsQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    projects: Array<{
      __typename?: 'Project';
      id: string;
      nameID: string;
      displayName: string;
      description?: Maybe<string>;
      lifecycle?: Maybe<{ __typename?: 'Lifecycle'; state?: Maybe<string> }>;
    }>;
  };
};

export type ProjectsChainHistoryQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
}>;

export type ProjectsChainHistoryQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    challenges?: Maybe<
      Array<{
        __typename?: 'Challenge';
        displayName: string;
        nameID: string;
        opportunities?: Maybe<
          Array<{
            __typename?: 'Opportunity';
            nameID: string;
            projects?: Maybe<Array<{ __typename?: 'Project'; nameID: string }>>;
          }>
        >;
      }>
    >;
  };
};

export type RelationsQueryVariables = Exact<{
  ecoverseId: Scalars['UUID_NAMEID'];
  opportunityId: Scalars['UUID_NAMEID'];
}>;

export type RelationsQuery = {
  __typename?: 'Query';
  ecoverse: {
    __typename?: 'Ecoverse';
    id: string;
    opportunity: {
      __typename?: 'Opportunity';
      relations?: Maybe<
        Array<{
          __typename?: 'Relation';
          id: string;
          type: string;
          actorName: string;
          actorType: string;
          actorRole: string;
          description: string;
        }>
      >;
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
    score?: Maybe<number>;
    terms?: Maybe<Array<string>>;
    result?: Maybe<
      | ({ __typename?: 'Challenge' } & ChallengeSearchResultFragment)
      | ({ __typename?: 'Opportunity' } & OpportunitySearchResultFragment)
      | ({ __typename?: 'Organisation' } & OrganisationSearchResultFragment)
      | { __typename?: 'User'; displayName: string; id: string }
      | ({ __typename?: 'UserGroup' } & UserSearchResultFragment)
    >;
  }>;
};

export type ServerMetadataQueryVariables = Exact<{ [key: string]: never }>;

export type ServerMetadataQuery = {
  __typename?: 'Query';
  metadata: {
    __typename?: 'Metadata';
    services: Array<{ __typename?: 'ServiceMetadata'; name?: Maybe<string>; version?: Maybe<string> }>;
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
        tagsets?: Maybe<Array<{ __typename?: 'TagsetTemplate'; name: string; placeholder?: Maybe<string> }>>;
      }>;
    };
  };
};

export type UserQueryVariables = Exact<{
  id: Scalars['UUID_NAMEID_EMAIL'];
}>;

export type UserQuery = {
  __typename?: 'Query';
  user: { __typename?: 'User' } & UserDetailsFragment & UserAgentFragment;
};

export type UserApplicationsQueryVariables = Exact<{
  input: MembershipUserInput;
}>;

export type UserApplicationsQuery = {
  __typename?: 'Query';
  membershipUser: {
    __typename?: 'UserMembership';
    applications?: Maybe<
      Array<{
        __typename?: 'ApplicationResultEntry';
        id: string;
        state: string;
        communityID: string;
        displayName: string;
      }>
    >;
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
    displayName: string;
    profile?: Maybe<{ __typename?: 'Profile'; id: string; avatar?: Maybe<string> }>;
  }>;
};

export type UsersQueryVariables = Exact<{ [key: string]: never }>;

export type UsersQuery = { __typename?: 'Query'; users: Array<{ __typename?: 'User' } & UserDetailsFragment> };

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
  }>;
};

export type CommunityUpdatesQueryVariables = Exact<{
  communityId: Scalars['UUID'];
}>;

export type CommunityUpdatesQuery = {
  __typename?: 'Query';
  community: {
    __typename?: 'Community';
    id: string;
    displayName: string;
    updatesRoom: {
      __typename?: 'CommunityRoom';
      id: string;
      messages: Array<{
        __typename?: 'CommunicationMessageResult';
        id: string;
        message: string;
        sender: string;
        timestamp: number;
      }>;
    };
  };
};

export type SendCommunityUpdateMutationVariables = Exact<{
  msgData: CommunitySendMessageInput;
}>;

export type SendCommunityUpdateMutation = { __typename?: 'Mutation'; messageUpdateCommunity: string };

export type AssignUserToOrganisationMutationVariables = Exact<{
  input: AssignOrganisationMemberInput;
}>;

export type AssignUserToOrganisationMutation = {
  __typename?: 'Mutation';
  assignUserToOrganisation: { __typename?: 'Organisation'; id: string; displayName: string };
};

export type RemoveUserFromOrganisationMutationVariables = Exact<{
  input: RemoveOrganisationMemberInput;
}>;

export type RemoveUserFromOrganisationMutation = {
  __typename?: 'Mutation';
  removeUserFromOrganisation: { __typename?: 'Organisation'; id: string; displayName: string };
};

export type AssignUserAsOrganisationAdminMutationVariables = Exact<{
  input: AssignOrganisationAdminInput;
}>;

export type AssignUserAsOrganisationAdminMutation = {
  __typename?: 'Mutation';
  assignUserAsOrganisationAdmin: { __typename?: 'User'; id: string; displayName: string };
};

export type RemoveUserAsOrganisationAdminMutationVariables = Exact<{
  input: RemoveOrganisationAdminInput;
}>;

export type RemoveUserAsOrganisationAdminMutation = {
  __typename?: 'Mutation';
  removeUserAsOrganisationAdmin: { __typename?: 'User'; id: string; displayName: string };
};

export type OrganisationMembersQueryVariables = Exact<{
  id: Scalars['UUID_NAMEID'];
}>;

export type OrganisationMembersQuery = {
  __typename?: 'Query';
  organisation: {
    __typename?: 'Organisation';
    id: string;
    members?: Maybe<Array<{ __typename?: 'User' } & GroupMembersFragment>>;
  };
};
