import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
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
  /** A short text based identifier, 3 <= length <= 20. Used for URL paths in clients.  */
  TextID: string;
  /** The `Upload` scalar type represents a file upload. */
  Upload: File;
};

export type AadAuthProviderConfig = {
  __typename?: 'AadAuthProviderConfig';
  /** Config for accessing the Cherrytwist API. */
  apiConfig: ApiConfig;
  /** Scopes required for the user login. For OpenID Connect login flows, these are openid and profile + optionally offline_access if refresh tokens are utilized. */
  loginRequest: Scope;
  /** Config for MSAL authentication library on Cherrytwist Web Client. */
  msalConfig: MsalConfig;
  /** Scopes for silent token acquisition. Cherrytwist API scope + OpenID mandatory scopes. */
  silentRequest: Scope;
  /** Scopes for requesting a token. This is the Cherrytwist API app registration URI + ./default. */
  tokenRequest: Scope;
};

export type Actor = {
  __typename?: 'Actor';
  /** A description of this actor */
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
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
  /** A description of this group of actors */
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type ApiConfig = {
  __typename?: 'ApiConfig';
  /** Configuration payload for the Cherrytwist API. */
  resourceScope: Scalars['String'];
};

export type Application = {
  __typename?: 'Application';
  id: Scalars['ID'];
  questions: Array<Question>;
  status: ApplicationStatus;
  user: User;
};

export enum ApplicationStatus {
  Approved = 'approved',
  New = 'new',
  Rejected = 'rejected',
}

export type ApplicationTemplate = {
  __typename?: 'ApplicationTemplate';
  /** Application template name. */
  name: Scalars['String'];
  /** Template questions. */
  questions: Array<QuestionTemplate>;
};

export type Aspect = {
  __typename?: 'Aspect';
  explanation: Scalars['String'];
  framing: Scalars['String'];
  id: Scalars['ID'];
  title: Scalars['String'];
};

export type AssignChallengeLeadInput = {
  challengeID: Scalars['String'];
  organisationID: Scalars['String'];
};

export type AssignCommunityMemberInput = {
  communityID: Scalars['Float'];
  userID: Scalars['Float'];
};

export type AssignUserGroupFocalPointInput = {
  groupID: Scalars['Float'];
  userID: Scalars['Float'];
};

export type AssignUserGroupMemberInput = {
  groupID: Scalars['Float'];
  userID: Scalars['Float'];
};

export type AuthenticationConfig = {
  __typename?: 'AuthenticationConfig';
  /** Is authentication enabled? */
  enabled: Scalars['Boolean'];
  /** Cherrytwist Authentication Providers Config. */
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

export type AuthenticationProviderConfigUnion = AadAuthProviderConfig | DemoAuthProviderConfig;

export type Challenge = {
  __typename?: 'Challenge';
  /** The community for the challenge */
  community?: Maybe<Community>;
  /** The shared understanding for the challenge */
  context?: Maybe<Context>;
  id: Scalars['ID'];
  /** The Organisations that are leading this Challenge. */
  leadOrganisations: Array<Organisation>;
  /** The name of the challenge */
  name: Scalars['String'];
  /** The set of opportunities within this challenge. */
  opportunities?: Maybe<Array<Opportunity>>;
  /** The maturity phase of the challenge i.e. new, being refined, ongoing etc */
  state?: Maybe<Scalars['String']>;
  /** The set of tags for the challenge */
  tagset?: Maybe<Tagset>;
  /** A short text identifier for this challenge */
  textID: Scalars['String'];
};

export type ChallengeTemplate = {
  __typename?: 'ChallengeTemplate';
  /** Application templates. */
  applications?: Maybe<Array<ApplicationTemplate>>;
  /** Challenge template name. */
  name: Scalars['String'];
};

export type Community = {
  __typename?: 'Community';
  /** Application available for this community. */
  applications: Array<Application>;
  /** Groups of users related to a Community. */
  groups?: Maybe<Array<UserGroup>>;
  id: Scalars['ID'];
  /** All users that are contributing to this Community. */
  members?: Maybe<Array<User>>;
  /** The name of the Community */
  name: Scalars['String'];
  /** The type of the Community */
  type: Scalars['String'];
};

export type Config = {
  __typename?: 'Config';
  /** Cherrytwist authentication configuration. */
  authentication: AuthenticationConfig;
  /** Cherrytwist template configuration. */
  template: Template;
};

export type Context = {
  __typename?: 'Context';
  /** A detailed description of the current situation */
  background?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  /** What is the potential impact? */
  impact?: Maybe<Scalars['String']>;
  /** A list of URLs to relevant information. */
  references?: Maybe<Array<Reference>>;
  /** A one line description */
  tagline?: Maybe<Scalars['String']>;
  /** The goal that is being pursued */
  vision?: Maybe<Scalars['String']>;
  /** Who should get involved in this challenge */
  who?: Maybe<Scalars['String']>;
};

export type CreateActorGroupInput = {
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  parentID: Scalars['Float'];
};

export type CreateActorInput = {
  description?: Maybe<Scalars['String']>;
  impact?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  parentID: Scalars['Float'];
  value?: Maybe<Scalars['String']>;
};

export type CreateApplicationInput = {
  parentID: Scalars['Float'];
  questions: Array<CreateNvpInput>;
  userId: Scalars['Float'];
};

export type CreateAspectInput = {
  explanation: Scalars['String'];
  framing: Scalars['String'];
  parentID: Scalars['Float'];
  title: Scalars['String'];
};

export type CreateChallengeInput = {
  context?: Maybe<CreateContextInput>;
  name: Scalars['String'];
  parentID: Scalars['Float'];
  state?: Maybe<Scalars['String']>;
  tags?: Maybe<Array<Scalars['String']>>;
  textID: Scalars['TextID'];
};

export type CreateContextInput = {
  background?: Maybe<Scalars['String']>;
  impact?: Maybe<Scalars['String']>;
  /** Set of References for the new Context. */
  references?: Maybe<Array<CreateReferenceInput>>;
  tagline?: Maybe<Scalars['String']>;
  vision?: Maybe<Scalars['String']>;
  who?: Maybe<Scalars['String']>;
};

export type CreateEcoverseInput = {
  /** Context for the Ecoverse. */
  context?: Maybe<CreateContextInput>;
  /** The host Organisation for the ecoverse */
  hostID?: Maybe<Scalars['String']>;
  /** The name for the ecoverse */
  name: Scalars['String'];
  /** The set of tags to apply to this Ecoverse */
  tags?: Maybe<Array<Scalars['String']>>;
  /** The unique text ID for the ecoverse */
  textID: Scalars['TextID'];
};

export type CreateNvpInput = {
  name: Scalars['String'];
  value: Scalars['String'];
};

export type CreateOpportunityInput = {
  context?: Maybe<CreateContextInput>;
  name: Scalars['String'];
  parentID: Scalars['String'];
  state?: Maybe<Scalars['String']>;
  tags?: Maybe<Array<Scalars['String']>>;
  textID: Scalars['TextID'];
};

export type CreateOrganisationInput = {
  /** The name for this organisation */
  name: Scalars['String'];
  profileData?: Maybe<CreateProfileInput>;
  /** The unique text based ID for this organisation */
  textID: Scalars['String'];
};

export type CreateProfileInput = {
  avatar?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  referencesData?: Maybe<Array<CreateReferenceInput>>;
  tagsetsData?: Maybe<Array<CreateTagsetInput>>;
};

export type CreateProjectInput = {
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  parentID: Scalars['Float'];
  state?: Maybe<Scalars['String']>;
  textID: Scalars['TextID'];
};

export type CreateReferenceInput = {
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  parentID?: Maybe<Scalars['Float']>;
  uri?: Maybe<Scalars['String']>;
};

export type CreateRelationInput = {
  actorName: Scalars['String'];
  actorRole?: Maybe<Scalars['String']>;
  actorType?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  parentID: Scalars['Float'];
  type: Scalars['String'];
};

export type CreateTagsetInput = {
  name: Scalars['String'];
  parentID?: Maybe<Scalars['Float']>;
  tags?: Maybe<Array<Scalars['String']>>;
};

export type CreateUserGroupInput = {
  name: Scalars['String'];
  parentID: Scalars['Float'];
  profileData?: Maybe<CreateProfileInput>;
};

export type CreateUserInput = {
  accountUpn?: Maybe<Scalars['String']>;
  city?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  email: Scalars['String'];
  firstName?: Maybe<Scalars['String']>;
  gender?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  profileData?: Maybe<CreateProfileInput>;
};

export type DeleteActorGroupInput = {
  ID: Scalars['Float'];
};

export type DeleteActorInput = {
  ID: Scalars['Float'];
};

export type DeleteApplicationInput = {
  ID: Scalars['Float'];
};

export type DeleteAspectInput = {
  ID: Scalars['Float'];
};

export type DeleteChallengeInput = {
  ID: Scalars['Float'];
};

export type DeleteOpportunityInput = {
  ID: Scalars['Float'];
};

export type DeleteOrganisationInput = {
  ID: Scalars['Float'];
};

export type DeleteProjectInput = {
  ID: Scalars['Float'];
};

export type DeleteReferenceInput = {
  ID: Scalars['Float'];
};

export type DeleteRelationInput = {
  ID: Scalars['Float'];
};

export type DeleteUserGroupInput = {
  ID: Scalars['Float'];
};

export type DeleteUserInput = {
  ID: Scalars['Float'];
};

export type DemoAuthProviderConfig = {
  __typename?: 'DemoAuthProviderConfig';
  /** Demo authentication provider issuer endpoint. */
  issuer: Scalars['String'];
  /** Demo authentication provider token endpoint. Use json payload in the form of username + password to login and obtain valid jwt token. */
  tokenEndpoint: Scalars['String'];
};

export type Ecoverse = {
  __typename?: 'Ecoverse';
  /** All applications to join */
  application: Application;
  /** A particular Challenge, either by its ID or textID */
  challenge: Challenge;
  /** The challenges for the ecoverse. */
  challenges?: Maybe<Array<Challenge>>;
  /** The community for the ecoverse. */
  community?: Maybe<Community>;
  /** The shared understanding for the Ecoverse */
  context?: Maybe<Context>;
  /** The user group with the specified id anywhere in the ecoverse */
  group: UserGroup;
  /** The User Groups on this Ecoverse */
  groups: Array<UserGroup>;
  /** All groups on this Ecoverse that have the provided tag */
  groupsWithTag: Array<UserGroup>;
  /** The organisation that hosts this Ecoverse instance */
  host?: Maybe<Organisation>;
  id: Scalars['ID'];
  name: Scalars['String'];
  /** All opportunities within the ecoverse */
  opportunities: Array<Opportunity>;
  /** A particular opportunitiy, identified by the ID or textID */
  opportunity: Opportunity;
  /** A particular Project, identified by the ID */
  project: Project;
  /** All projects within this ecoverse */
  projects: Array<Project>;
  /** The set of tags for the ecoverse */
  tagset?: Maybe<Tagset>;
  /** A short text identifier for this Ecoverse */
  textID: Scalars['String'];
};

export type EcoverseApplicationArgs = {
  ID: Scalars['Float'];
};

export type EcoverseChallengeArgs = {
  ID: Scalars['String'];
};

export type EcoverseGroupArgs = {
  ID: Scalars['String'];
};

export type EcoverseGroupsWithTagArgs = {
  tag: Scalars['String'];
};

export type EcoverseOpportunityArgs = {
  ID: Scalars['String'];
};

export type EcoverseProjectArgs = {
  ID: Scalars['String'];
};

export type EcoverseTemplate = {
  __typename?: 'EcoverseTemplate';
  /** Application templates. */
  applications?: Maybe<Array<ApplicationTemplate>>;
  /** Ecoverse template name. */
  name: Scalars['String'];
};

export type MemberOf = {
  __typename?: 'MemberOf';
  /** References to the Communities the user is a member of */
  communities: Array<Community>;
  /** References to the orgnaisaitons the user is a member of */
  organisations: Array<Organisation>;
};

export type Metadata = {
  __typename?: 'Metadata';
  /** Collection of metadata about Cherrytwist services. */
  services: Array<ServiceMetadata>;
};

export type MsalAuth = {
  __typename?: 'MsalAuth';
  /** Azure Active Directory OpenID Connect Authority. */
  authority: Scalars['String'];
  /** Cherrytwist Web Client App Registration Client Id. */
  clientId: Scalars['String'];
  /** Cherrytwist Web Client Login Redirect Uri. */
  redirectUri: Scalars['String'];
};

export type MsalCache = {
  __typename?: 'MsalCache';
  /** Cache location, e.g. localStorage.  */
  cacheLocation?: Maybe<Scalars['String']>;
  /** Is the authentication information stored in a cookie? */
  storeAuthStateInCookie?: Maybe<Scalars['Boolean']>;
};

export type MsalConfig = {
  __typename?: 'MsalConfig';
  /** Azure Active Directory OpenID Connect endpoint configuration. */
  auth: MsalAuth;
  /** Token cache configuration.  */
  cache: MsalCache;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Approve a User Application to join this Community. */
  approveApplication: Application;
  /** Assigns an organisation as a lead for the Challenge. */
  assignChallengeLead: Challenge;
  /** Assigns a User as the focal point of the specified User Group. */
  assignGroupFocalPoint?: Maybe<UserGroup>;
  /** Assigns a User as a member of the specified Community. */
  assignUserToCommunity: UserGroup;
  /** Assigns a User as a member of the specified User Group. */
  assignUserToGroup: UserGroup;
  /** Creates a new Actor in the specified ActorGroup. */
  createActor: Actor;
  /** Create a new Actor Group on the Opportunity. */
  createActorGroup: ActorGroup;
  /** Creates Application for a User to join this Community. */
  createApplication: Application;
  /** Create a new Aspect on the Opportunity. */
  createAspect: Aspect;
  /** Create a new Aspect on the Project. */
  createAspectOnProject: Aspect;
  /** Creates a new Challenge within the specified Ecoverse. */
  createChallenge: Challenge;
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
  /** Deletes the specified Actor. */
  deleteActor: Actor;
  /** Deletes the specified Actor Group, including contained Actors. */
  deleteActorGroup: ActorGroup;
  /** Deletes the specified Aspect. */
  deleteAspect: Aspect;
  /** Deletes the specified Challenge. */
  deleteChallenge: Challenge;
  /** Deletes the Opportunity. */
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
  /** Remove an organisation as a lead for the Challenge. */
  removeChallengeLead: Challenge;
  /** Removes the focal point for the specified User Group. */
  removeGroupFocalPoint?: Maybe<UserGroup>;
  /** Removes a User as a member of the specified Community. */
  removeUserFromCommunity: UserGroup;
  /** Removes the specified User from specified user group */
  removeUserFromGroup: UserGroup;
  /** Updates the specified Actor. */
  updateActor: Actor;
  /** Updates the specified Aspect. */
  updateAspect: Aspect;
  /** Updates the specified Challenge. */
  updateChallenge: Challenge;
  /** Updates the Ecoverse. */
  updateEcoverse: Ecoverse;
  /** Updates the Opportunity. */
  updateOpportunity: Opportunity;
  /** Updates the specified Organisation. */
  updateOrganisation: Organisation;
  /** Updates the specified Profile. */
  updateProfile: Profile;
  /** Updates the specified Project. */
  updateProject: Project;
  /** Update the specified Reference. */
  updateReference: Reference;
  /** Updates the Tagset. */
  updateTagset: Tagset;
  /** Updates the User. Note: email address cannot be updated. */
  updateUser: User;
  /** Updates the specified User Group. */
  updateUserGroup: UserGroup;
  /** Uploads and sets an avatar image for the specified Profile. */
  uploadAvatar: Profile;
};

export type MutationApproveApplicationArgs = {
  ID: Scalars['Float'];
};

export type MutationAssignChallengeLeadArgs = {
  assignInput: AssignChallengeLeadInput;
};

export type MutationAssignGroupFocalPointArgs = {
  membershipData: AssignUserGroupFocalPointInput;
};

export type MutationAssignUserToCommunityArgs = {
  membershipData: AssignCommunityMemberInput;
};

export type MutationAssignUserToGroupArgs = {
  membershipData: AssignUserGroupMemberInput;
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

export type MutationCreateAspectOnProjectArgs = {
  aspectData: CreateAspectInput;
};

export type MutationCreateChallengeArgs = {
  challengeData: CreateChallengeInput;
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
  referenceInput: CreateReferenceInput;
};

export type MutationCreateReferenceOnProfileArgs = {
  referenceInput: CreateReferenceInput;
};

export type MutationCreateRelationArgs = {
  relationData: CreateRelationInput;
};

export type MutationCreateTagsetOnProfileArgs = {
  tagsetData: CreateTagsetInput;
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

export type MutationRemoveChallengeLeadArgs = {
  removeData: RemoveChallengeLeadInput;
};

export type MutationRemoveGroupFocalPointArgs = {
  removeData: RemoveUserGroupFocalPoint;
};

export type MutationRemoveUserFromCommunityArgs = {
  membershipData: RemoveCommunityMemberInput;
};

export type MutationRemoveUserFromGroupArgs = {
  membershipData: RemoveUserGroupMemberInput;
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

export type MutationUpdateReferenceArgs = {
  updateData: UpdateReferenceInput;
};

export type MutationUpdateTagsetArgs = {
  tagsetData: UpdateTagsetInput;
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

export type Opportunity = {
  __typename?: 'Opportunity';
  /** The set of actor groups within the context of this Opportunity. */
  actorGroups?: Maybe<Array<ActorGroup>>;
  /** The set of aspects within the context of this Opportunity. */
  aspects?: Maybe<Array<Aspect>>;
  /** The community for the opportunity */
  community?: Maybe<Community>;
  /** The shared understanding for the opportunity */
  context?: Maybe<Context>;
  id: Scalars['ID'];
  /** The name of the Opportunity */
  name: Scalars['String'];
  /** The set of projects within the context of this Opportunity */
  projects?: Maybe<Array<Project>>;
  /** The set of relations within the context of this Opportunity. */
  relations?: Maybe<Array<Relation>>;
  /** The maturity phase of the Opportunity i.e. new, being refined, ongoing etc */
  state?: Maybe<Scalars['String']>;
  /** The set of tags for the Opportunity */
  tagset?: Maybe<Tagset>;
  /** A short text identifier for this Opportunity */
  textID: Scalars['String'];
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

export type Organisation = {
  __typename?: 'Organisation';
  /** Groups defined on this organisation. */
  groups?: Maybe<Array<UserGroup>>;
  id: Scalars['ID'];
  /** Users that are contributing to this organisation. */
  members?: Maybe<Array<User>>;
  name: Scalars['String'];
  /** The profile for this organisation. */
  profile: Profile;
  /** A short text identifier for this Organisation */
  textID: Scalars['String'];
};

export type Profile = {
  __typename?: 'Profile';
  /** A URI that points to the location of an avatar, either on a shared location or a gravatar */
  avatar?: Maybe<Scalars['String']>;
  /** A short description of the entity associated with this profile. */
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  /** A list of URLs to relevant information. */
  references?: Maybe<Array<Reference>>;
  /** A list of named tagsets, each of which has a list of tags. */
  tagsets?: Maybe<Array<Tagset>>;
};

export type Project = {
  __typename?: 'Project';
  /** The set of aspects for this Project. Note: likley to change. */
  aspects?: Maybe<Array<Aspect>>;
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name: Scalars['String'];
  /** The maturity phase of the project i.e. new, being refined, committed, in-progress, closed etc */
  state?: Maybe<Scalars['String']>;
  /** The set of tags for the project */
  tagset?: Maybe<Tagset>;
  /** A short text identifier for this Opportunity */
  textID: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  /** Cherrytwist configuration. Provides configuration to external services in the Cherrytwist ecosystem. */
  configuration: Config;
  /** An ecoverse. If no ID is specified then the first Ecoverse is returned. */
  ecoverse: Ecoverse;
  /** The currently logged in user */
  me: User;
  /** Cherrytwist Services Metadata */
  metadata: Metadata;
  /** A particular Organisation */
  organisation: Organisation;
  /** The Organisations on this platform */
  organisations: Array<Organisation>;
  /** Search the ecoverse for terms supplied */
  search: Array<SearchResultEntry>;
  /** A particular user, identified by the ID or by email */
  user: User;
  /** The users who have profiles on this platform */
  users: Array<User>;
  /** The users filtered by list of IDs. */
  usersById: Array<User>;
};

export type QueryEcoverseArgs = {
  ID?: Maybe<Scalars['Float']>;
};

export type QueryOrganisationArgs = {
  ID: Scalars['String'];
};

export type QuerySearchArgs = {
  searchData: SearchInput;
};

export type QueryUserArgs = {
  ID: Scalars['String'];
};

export type QueryUsersByIdArgs = {
  IDs: Array<Scalars['String']>;
};

export type Question = {
  __typename?: 'Question';
  id: Scalars['ID'];
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
  description: Scalars['String'];
  id: Scalars['ID'];
  name: Scalars['String'];
  uri: Scalars['String'];
};

export type Relation = {
  __typename?: 'Relation';
  actorName: Scalars['String'];
  actorRole: Scalars['String'];
  actorType: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  type: Scalars['String'];
};

export type RemoveChallengeLeadInput = {
  challengeID: Scalars['String'];
  organisationID: Scalars['String'];
};

export type RemoveCommunityMemberInput = {
  communityID: Scalars['Float'];
  userID: Scalars['Float'];
};

export type RemoveUserGroupFocalPoint = {
  groupID: Scalars['Float'];
};

export type RemoveUserGroupMemberInput = {
  groupID: Scalars['Float'];
  userID: Scalars['Float'];
};

export type Scope = {
  __typename?: 'Scope';
  /** OpenID Scopes. */
  scopes: Array<Scalars['String']>;
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

export type SearchResult = Organisation | User | UserGroup;

export type SearchResultEntry = {
  __typename?: 'SearchResultEntry';
  /** Each search result contains either a User, UserGroup or Organisation */
  result?: Maybe<SearchResult>;
  /** The score for this search result; more matches means a higher score. */
  score?: Maybe<Scalars['Float']>;
  /** The terms that were matched for this result */
  terms?: Maybe<Array<Scalars['String']>>;
};

export type ServiceMetadata = {
  __typename?: 'ServiceMetadata';
  /** Service name e.g. CT Server */
  name?: Maybe<Scalars['String']>;
  /** Version in the format {major.minor.patch} - using SemVer. */
  version?: Maybe<Scalars['String']>;
};

export type Tagset = {
  __typename?: 'Tagset';
  id: Scalars['ID'];
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
  ID: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  impact?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

export type UpdateAspectInput = {
  ID: Scalars['String'];
  explanation?: Maybe<Scalars['String']>;
  framing?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};

export type UpdateChallengeInput = {
  ID: Scalars['String'];
  context?: Maybe<UpdateContextInput>;
  name?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
  tags?: Maybe<Array<Scalars['String']>>;
};

export type UpdateContextInput = {
  background?: Maybe<Scalars['String']>;
  impact?: Maybe<Scalars['String']>;
  tagline?: Maybe<Scalars['String']>;
  vision?: Maybe<Scalars['String']>;
  who?: Maybe<Scalars['String']>;
};

export type UpdateEcoverseInput = {
  ID: Scalars['String'];
  /** Updated context for the ecoverse; will be merged with existing context */
  context?: Maybe<UpdateContextInput>;
  /** The host Organisation for the ecoverse */
  hostID?: Maybe<Scalars['String']>;
  /** The new name for the ecoverse */
  name?: Maybe<Scalars['String']>;
  /** The set of tags to apply to this ecoverse */
  tags?: Maybe<Array<Scalars['String']>>;
};

export type UpdateOpportunityInput = {
  ID: Scalars['String'];
  context?: Maybe<UpdateContextInput>;
  name?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
  tags?: Maybe<Array<Scalars['String']>>;
};

export type UpdateOrganisationInput = {
  ID: Scalars['String'];
  /** The name for this organisation */
  name?: Maybe<Scalars['String']>;
  profileData?: Maybe<UpdateProfileInput>;
};

export type UpdateProfileInput = {
  ID: Scalars['String'];
  avatar?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};

export type UpdateProjectInput = {
  ID: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  state?: Maybe<Scalars['String']>;
  textID: Scalars['String'];
};

export type UpdateReferenceInput = {
  ID: Scalars['Float'];
  description?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  uri?: Maybe<Scalars['String']>;
};

export type UpdateTagsetInput = {
  ID: Scalars['Float'];
  name?: Maybe<Scalars['String']>;
  tags?: Maybe<Array<Scalars['String']>>;
};

export type UpdateUserGroupInput = {
  ID: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  profileData?: Maybe<UpdateProfileInput>;
};

export type UpdateUserInput = {
  ID: Scalars['String'];
  accountUpn?: Maybe<Scalars['String']>;
  city?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  firstName?: Maybe<Scalars['String']>;
  gender?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  profileData?: Maybe<UpdateProfileInput>;
};

export type UploadProfileAvatarInput = {
  file: Scalars['String'];
  profileID: Scalars['String'];
};

export type User = {
  __typename?: 'User';
  /** The unique personal identifier (upn) for the account associated with this user profile */
  accountUpn: Scalars['String'];
  city: Scalars['String'];
  country: Scalars['String'];
  email: Scalars['String'];
  firstName: Scalars['String'];
  gender: Scalars['String'];
  id: Scalars['ID'];
  lastName: Scalars['String'];
  /** An overview of the groups this user is a memberof. Note: all groups are returned without members to avoid recursion. */
  memberof?: Maybe<MemberOf>;
  name: Scalars['String'];
  phone: Scalars['String'];
  /** The profile for this user */
  profile?: Maybe<Profile>;
};

export type UserGroup = {
  __typename?: 'UserGroup';
  /** The User that is the focal point of this User Group. */
  focalPoint?: Maybe<User>;
  id: Scalars['ID'];
  /** The Users that are members of this User Group. */
  members?: Maybe<Array<User>>;
  name: Scalars['String'];
  /** Containing entity for this UserGroup. */
  parent?: Maybe<UserGroupParent>;
  /** The profile for the user group */
  profile?: Maybe<Profile>;
};

export type UserGroupParent = Community | Organisation;

export type UserTemplate = {
  __typename?: 'UserTemplate';
  /** User template name. */
  name: Scalars['String'];
  /** Tagset templates. */
  tagsets?: Maybe<Array<TagsetTemplate>>;
};

export type ServerMetadataQueryVariables = Exact<{ [key: string]: never }>;

export type ServerMetadataQuery = { __typename?: 'Query' } & {
  metadata: { __typename?: 'Metadata' } & {
    services: Array<{ __typename?: 'ServiceMetadata' } & Pick<ServiceMetadata, 'name' | 'version'>>;
  };
};

export type CreateUserMutationVariables = Exact<{
  input: CreateUserInput;
}>;

export type CreateUserMutation = { __typename?: 'Mutation' } & {
  createUser: { __typename?: 'User' } & UserDetailsFragment;
};

export type UpdateUserMutationVariables = Exact<{
  input: UpdateUserInput;
}>;

export type UpdateUserMutation = { __typename?: 'Mutation' } & {
  updateUser: { __typename?: 'User' } & UserDetailsFragment;
};

export type EcoverseQueryVariables = Exact<{ [key: string]: never }>;

export type EcoverseQuery = { __typename?: 'Query' } & {
  ecoverse: { __typename?: 'Ecoverse' } & Pick<Ecoverse, 'id' | 'name'> & {
      community?: Maybe<
        { __typename?: 'Community' } & {
          groups?: Maybe<Array<{ __typename?: 'UserGroup' } & Pick<UserGroup, 'id' | 'name'>>>;
        }
      >;
      challenges?: Maybe<
        Array<
          { __typename?: 'Challenge' } & Pick<Challenge, 'id' | 'name' | 'textID'> & {
              community?: Maybe<
                { __typename?: 'Community' } & {
                  groups?: Maybe<Array<{ __typename?: 'UserGroup' } & Pick<UserGroup, 'id' | 'name'>>>;
                }
              >;
            }
        >
      >;
    };
};

export type GroupMembersFragment = { __typename?: 'User' } & Pick<
  User,
  'id' | 'name' | 'firstName' | 'lastName' | 'email'
>;

export type GroupMembersQueryVariables = Exact<{
  id: Scalars['String'];
}>;

export type GroupMembersQuery = { __typename?: 'Query' } & {
  ecoverse: { __typename?: 'Ecoverse' } & Pick<Ecoverse, 'id'> & {
      group: { __typename?: 'UserGroup' } & Pick<UserGroup, 'id' | 'name'> & {
          members?: Maybe<Array<{ __typename?: 'User' } & GroupMembersFragment>>;
        };
    };
};

export type RemoveUserFromGroupMutationVariables = Exact<{
  input: RemoveUserGroupMemberInput;
}>;

export type RemoveUserFromGroupMutation = { __typename?: 'Mutation' } & {
  removeUserFromGroup: { __typename?: 'UserGroup' } & Pick<UserGroup, 'id' | 'name'> & {
      members?: Maybe<Array<{ __typename?: 'User' } & GroupMembersFragment>>;
    };
};

export type DeleteUserMutationVariables = Exact<{
  input: DeleteUserInput;
}>;

export type DeleteUserMutation = { __typename?: 'Mutation' } & {
  deleteUser: { __typename?: 'User' } & UserDetailsFragment;
};

export type AddUserToGroupMutationVariables = Exact<{
  input: AssignUserGroupMemberInput;
}>;

export type AddUserToGroupMutation = { __typename?: 'Mutation' } & {
  assignUserToGroup: { __typename?: 'UserGroup' } & Pick<UserGroup, 'id'> & {
      members?: Maybe<Array<{ __typename?: 'User' } & GroupMembersFragment>>;
    };
};

export type EcoverseChallengesListQueryVariables = Exact<{ [key: string]: never }>;

export type EcoverseChallengesListQuery = { __typename?: 'Query' } & {
  ecoverse: { __typename?: 'Ecoverse' } & Pick<Ecoverse, 'id'> & {
      challenges?: Maybe<
        Array<
          { __typename?: 'Challenge' } & Pick<Challenge, 'id' | 'name'> & {
              community?: Maybe<{ __typename?: 'Community' } & Pick<Community, 'id' | 'name'>>;
            }
        >
      >;
    };
};

export type EcoverseGroupsListQueryVariables = Exact<{ [key: string]: never }>;

export type EcoverseGroupsListQuery = { __typename?: 'Query' } & {
  ecoverse: { __typename?: 'Ecoverse' } & Pick<Ecoverse, 'id'> & {
      groups: Array<{ __typename?: 'UserGroup' } & Pick<UserGroup, 'id' | 'name'>>;
    };
};

export type OrganizationNameQueryVariables = Exact<{
  id: Scalars['String'];
}>;

export type OrganizationNameQuery = { __typename?: 'Query' } & {
  organisation: { __typename?: 'Organisation' } & Pick<Organisation, 'name'>;
};

export type OrganizationsListQueryVariables = Exact<{ [key: string]: never }>;

export type OrganizationsListQuery = { __typename?: 'Query' } & {
  organisations: Array<{ __typename?: 'Organisation' } & Pick<Organisation, 'id' | 'name'>>;
};

export type ChallengeNameQueryVariables = Exact<{
  id: Scalars['String'];
}>;

export type ChallengeNameQuery = { __typename?: 'Query' } & {
  ecoverse: { __typename?: 'Ecoverse' } & Pick<Ecoverse, 'id'> & {
      challenge: { __typename?: 'Challenge' } & Pick<Challenge, 'id' | 'name'> & {
          community?: Maybe<{ __typename?: 'Community' } & Pick<Community, 'id' | 'name'>>;
        };
    };
};

export type ChallengeGroupsQueryVariables = Exact<{
  id: Scalars['String'];
}>;

export type ChallengeGroupsQuery = { __typename?: 'Query' } & {
  ecoverse: { __typename?: 'Ecoverse' } & Pick<Ecoverse, 'id'> & {
      challenge: { __typename?: 'Challenge' } & {
        community?: Maybe<
          { __typename?: 'Community' } & {
            groups?: Maybe<Array<{ __typename?: 'UserGroup' } & Pick<UserGroup, 'id' | 'name'>>>;
          }
        >;
      };
    };
};

export type OrganizationGroupsQueryVariables = Exact<{
  id: Scalars['String'];
}>;

export type OrganizationGroupsQuery = { __typename?: 'Query' } & {
  organisation: { __typename?: 'Organisation' } & {
    groups?: Maybe<Array<{ __typename?: 'UserGroup' } & Pick<UserGroup, 'id' | 'name'>>>;
  };
};

export type ChallengeOpportunitiesQueryVariables = Exact<{
  id: Scalars['String'];
}>;

export type ChallengeOpportunitiesQuery = { __typename?: 'Query' } & {
  ecoverse: { __typename?: 'Ecoverse' } & Pick<Ecoverse, 'id'> & {
      challenge: { __typename?: 'Challenge' } & {
        opportunities?: Maybe<Array<{ __typename?: 'Opportunity' } & Pick<Opportunity, 'id' | 'name'>>>;
      };
    };
};

export type OpportunityGroupsQueryVariables = Exact<{
  id: Scalars['String'];
}>;

export type OpportunityGroupsQuery = { __typename?: 'Query' } & {
  ecoverse: { __typename?: 'Ecoverse' } & Pick<Ecoverse, 'id'> & {
      opportunity: { __typename?: 'Opportunity' } & {
        community?: Maybe<
          { __typename?: 'Community' } & {
            groups?: Maybe<Array<{ __typename?: 'UserGroup' } & Pick<UserGroup, 'id' | 'name'>>>;
          }
        >;
      };
    };
};

export type OpportunityNameQueryVariables = Exact<{
  id: Scalars['String'];
}>;

export type OpportunityNameQuery = { __typename?: 'Query' } & {
  ecoverse: { __typename?: 'Ecoverse' } & Pick<Ecoverse, 'id'> & {
      opportunity: { __typename?: 'Opportunity' } & Pick<Opportunity, 'id' | 'name'>;
    };
};

export type TagsetsTemplateQueryVariables = Exact<{ [key: string]: never }>;

export type TagsetsTemplateQuery = { __typename?: 'Query' } & {
  configuration: { __typename?: 'Config' } & {
    template: { __typename?: 'Template' } & {
      users: Array<
        { __typename?: 'UserTemplate' } & {
          tagsets?: Maybe<Array<{ __typename?: 'TagsetTemplate' } & Pick<TagsetTemplate, 'name' | 'placeholder'>>>;
        }
      >;
    };
  };
};

export type CreateChallengeMutationVariables = Exact<{
  input: CreateChallengeInput;
}>;

export type CreateChallengeMutation = { __typename?: 'Mutation' } & {
  createChallenge: { __typename?: 'Challenge' } & NewChallengeFragment;
};

export type ChallengeProfileInfoQueryVariables = Exact<{
  id: Scalars['String'];
}>;

export type ChallengeProfileInfoQuery = { __typename?: 'Query' } & {
  ecoverse: { __typename?: 'Ecoverse' } & Pick<Ecoverse, 'id'> & {
      challenge: { __typename?: 'Challenge' } & Pick<Challenge, 'id' | 'textID' | 'name' | 'state'> & {
          context?: Maybe<{ __typename?: 'Context' } & ContextDetailsFragment>;
        };
    };
};

export type CreateOpportunityMutationVariables = Exact<{
  input: CreateOpportunityInput;
}>;

export type CreateOpportunityMutation = { __typename?: 'Mutation' } & {
  createOpportunity: { __typename?: 'Opportunity' } & NewOpportunityFragment;
};

export type UpdateOpportunityMutationVariables = Exact<{
  opportunityData: UpdateOpportunityInput;
}>;

export type UpdateOpportunityMutation = { __typename?: 'Mutation' } & {
  updateOpportunity: { __typename?: 'Opportunity' } & Pick<Opportunity, 'id' | 'name'>;
};

export type OpportunityProfileInfoQueryVariables = Exact<{
  id: Scalars['String'];
}>;

export type OpportunityProfileInfoQuery = { __typename?: 'Query' } & {
  ecoverse: { __typename?: 'Ecoverse' } & Pick<Ecoverse, 'id'> & {
      opportunity: { __typename?: 'Opportunity' } & Pick<Opportunity, 'id' | 'textID' | 'name'> & {
          context?: Maybe<{ __typename?: 'Context' } & ContextDetailsFragment>;
        };
    };
};

export type CreateOrganizationMutationVariables = Exact<{
  input: CreateOrganisationInput;
}>;

export type CreateOrganizationMutation = { __typename?: 'Mutation' } & {
  createOrganisation: { __typename?: 'Organisation' } & Pick<Organisation, 'id' | 'name'>;
};

export type UpdateOrganizationMutationVariables = Exact<{
  input: UpdateOrganisationInput;
}>;

export type UpdateOrganizationMutation = { __typename?: 'Mutation' } & {
  updateOrganisation: { __typename?: 'Organisation' } & Pick<Organisation, 'id' | 'name'>;
};

export type OrganisationProfileInfoQueryVariables = Exact<{
  id: Scalars['String'];
}>;

export type OrganisationProfileInfoQuery = { __typename?: 'Query' } & {
  organisation: { __typename?: 'Organisation' } & Pick<Organisation, 'id' | 'textID' | 'name'> & {
      profile: { __typename?: 'Profile' } & Pick<Profile, 'id' | 'avatar' | 'description'> & {
          references?: Maybe<Array<{ __typename?: 'Reference' } & Pick<Reference, 'id' | 'name' | 'uri'>>>;
          tagsets?: Maybe<Array<{ __typename?: 'Tagset' } & Pick<Tagset, 'id' | 'name' | 'tags'>>>;
        };
    };
};

export type CreateGroupOnCommunityMutationVariables = Exact<{
  input: CreateUserGroupInput;
}>;

export type CreateGroupOnCommunityMutation = { __typename?: 'Mutation' } & {
  createGroupOnCommunity: { __typename?: 'UserGroup' } & Pick<UserGroup, 'id' | 'name'>;
};

export type CreateGroupOnOrganizationMutationVariables = Exact<{
  input: CreateUserGroupInput;
}>;

export type CreateGroupOnOrganizationMutation = { __typename?: 'Mutation' } & {
  createGroupOnOrganisation: { __typename?: 'UserGroup' } & Pick<UserGroup, 'id' | 'name'>;
};

export type OrganizationDetailsQueryVariables = Exact<{
  id: Scalars['String'];
}>;

export type OrganizationDetailsQuery = { __typename?: 'Query' } & {
  organisation: { __typename?: 'Organisation' } & Pick<Organisation, 'id' | 'name'> & {
      profile: { __typename?: 'Profile' } & Pick<Profile, 'id' | 'avatar' | 'description'> & {
          references?: Maybe<Array<{ __typename?: 'Reference' } & Pick<Reference, 'name' | 'uri'>>>;
          tagsets?: Maybe<Array<{ __typename?: 'Tagset' } & Pick<Tagset, 'id' | 'name' | 'tags'>>>;
        };
      groups?: Maybe<
        Array<
          { __typename?: 'UserGroup' } & Pick<UserGroup, 'id' | 'name'> & {
              members?: Maybe<Array<{ __typename?: 'User' } & Pick<User, 'id' | 'name'>>>;
            }
        >
      >;
    };
};

export type RemoveUserGroupMutationVariables = Exact<{
  input: DeleteUserGroupInput;
}>;

export type RemoveUserGroupMutation = { __typename?: 'Mutation' } & {
  deleteUserGroup: { __typename?: 'UserGroup' } & Pick<UserGroup, 'id'>;
};

export type ChallengeProfileQueryVariables = Exact<{
  id: Scalars['String'];
}>;

export type ChallengeProfileQuery = { __typename?: 'Query' } & {
  ecoverse: { __typename?: 'Ecoverse' } & Pick<Ecoverse, 'id'> & {
      challenge: { __typename?: 'Challenge' } & Pick<Challenge, 'id' | 'textID' | 'name' | 'state'> & {
          context?: Maybe<{ __typename?: 'Context' } & ContextDetailsFragment>;
          community?: Maybe<
            { __typename?: 'Community' } & { members?: Maybe<Array<{ __typename?: 'User' } & Pick<User, 'name'>>> }
          >;
          tagset?: Maybe<{ __typename?: 'Tagset' } & Pick<Tagset, 'name' | 'tags'>>;
          opportunities?: Maybe<
            Array<
              { __typename?: 'Opportunity' } & Pick<Opportunity, 'id' | 'name' | 'state' | 'textID'> & {
                  context?: Maybe<{ __typename?: 'Context' } & ContextDetailsFragment>;
                  projects?: Maybe<
                    Array<
                      { __typename?: 'Project' } & Pick<Project, 'id' | 'textID' | 'name' | 'description' | 'state'>
                    >
                  >;
                }
            >
          >;
          leadOrganisations: Array<
            { __typename?: 'Organisation' } & Pick<Organisation, 'id' | 'name'> & {
                profile: { __typename?: 'Profile' } & Pick<Profile, 'id' | 'avatar'>;
              }
          >;
        };
    };
};

export type UpdateChallengeMutationVariables = Exact<{
  input: UpdateChallengeInput;
}>;

export type UpdateChallengeMutation = { __typename?: 'Mutation' } & {
  updateChallenge: { __typename?: 'Challenge' } & Pick<Challenge, 'id' | 'name'>;
};

export type ChallengeMembersQueryVariables = Exact<{
  challengeID: Scalars['String'];
}>;

export type ChallengeMembersQuery = { __typename?: 'Query' } & {
  ecoverse: { __typename?: 'Ecoverse' } & Pick<Ecoverse, 'id'> & {
      challenge: { __typename?: 'Challenge' } & {
        community?: Maybe<
          { __typename?: 'Community' } & {
            members?: Maybe<
              Array<{ __typename?: 'User' } & Pick<User, 'id' | 'name' | 'firstName' | 'lastName' | 'email'>>
            >;
          }
        >;
      };
    };
};

export type NewChallengeFragment = { __typename?: 'Challenge' } & Pick<Challenge, 'id' | 'name'>;

export type ChallengeCommunityQueryVariables = Exact<{
  id: Scalars['String'];
}>;

export type ChallengeCommunityQuery = { __typename?: 'Query' } & {
  ecoverse: { __typename?: 'Ecoverse' } & Pick<Ecoverse, 'id'> & {
      challenge: { __typename?: 'Challenge' } & Pick<Challenge, 'id' | 'name'> & {
          community?: Maybe<{ __typename?: 'Community' } & CommunityDetailsFragment>;
        };
    };
};

export type GroupDetailsFragment = { __typename?: 'UserGroup' } & Pick<UserGroup, 'id' | 'name'>;

export type CommunityDetailsFragment = { __typename?: 'Community' } & Pick<Community, 'id' | 'name' | 'type'> & {
    applications: Array<{ __typename?: 'Application' } & Pick<Application, 'id'>>;
    groups?: Maybe<
      Array<
        { __typename?: 'UserGroup' } & Pick<UserGroup, 'id' | 'name'> & {
            members?: Maybe<
              Array<{ __typename?: 'User' } & Pick<User, 'id' | 'name' | 'firstName' | 'lastName' | 'email'>>
            >;
          }
      >
    >;
  };

export type SearchQueryVariables = Exact<{
  searchData: SearchInput;
}>;

export type SearchQuery = { __typename?: 'Query' } & {
  search: Array<
    { __typename?: 'SearchResultEntry' } & Pick<SearchResultEntry, 'score' | 'terms'> & {
        result?: Maybe<
          | ({ __typename?: 'Organisation' } & Pick<Organisation, 'name' | 'id'>)
          | ({ __typename?: 'User' } & Pick<User, 'name' | 'id'>)
          | ({ __typename?: 'UserGroup' } & Pick<UserGroup, 'name' | 'id'>)
        >;
      }
  >;
};

export type GroupCardQueryVariables = Exact<{
  id: Scalars['String'];
}>;

export type GroupCardQuery = { __typename?: 'Query' } & {
  ecoverse: { __typename?: 'Ecoverse' } & Pick<Ecoverse, 'id'> & {
      group: { __typename: 'UserGroup' } & Pick<UserGroup, 'name'> & {
          parent?: Maybe<
            | ({ __typename: 'Community' } & Pick<Community, 'name'>)
            | ({ __typename: 'Organisation' } & Pick<Organisation, 'name'>)
          >;
          members?: Maybe<Array<{ __typename?: 'User' } & Pick<User, 'id' | 'name'>>>;
          profile?: Maybe<
            { __typename?: 'Profile' } & Pick<Profile, 'id' | 'avatar' | 'description'> & {
                references?: Maybe<Array<{ __typename?: 'Reference' } & Pick<Reference, 'name' | 'description'>>>;
                tagsets?: Maybe<Array<{ __typename?: 'Tagset' } & Pick<Tagset, 'name' | 'tags'>>>;
              }
          >;
        };
    };
};

export type OrganizationCardQueryVariables = Exact<{
  id: Scalars['String'];
}>;

export type OrganizationCardQuery = { __typename?: 'Query' } & {
  organisation: { __typename?: 'Organisation' } & Pick<Organisation, 'id' | 'name'> & {
      groups?: Maybe<Array<{ __typename?: 'UserGroup' } & Pick<UserGroup, 'name'>>>;
      members?: Maybe<Array<{ __typename?: 'User' } & Pick<User, 'id'>>>;
      profile: { __typename?: 'Profile' } & Pick<Profile, 'id' | 'description' | 'avatar'>;
    };
};

export type ConfigQueryVariables = Exact<{ [key: string]: never }>;

export type ConfigQuery = { __typename?: 'Query' } & {
  configuration: { __typename?: 'Config' } & {
    authentication: { __typename?: 'AuthenticationConfig' } & Pick<AuthenticationConfig, 'enabled'> & {
        providers: Array<
          { __typename?: 'AuthenticationProviderConfig' } & Pick<
            AuthenticationProviderConfig,
            'name' | 'label' | 'icon' | 'enabled'
          > & {
              config:
                | ({ __typename: 'AadAuthProviderConfig' } & {
                    msalConfig: { __typename?: 'MsalConfig' } & {
                      auth: { __typename?: 'MsalAuth' } & Pick<MsalAuth, 'authority' | 'clientId' | 'redirectUri'>;
                      cache: { __typename?: 'MsalCache' } & Pick<MsalCache, 'cacheLocation' | 'storeAuthStateInCookie'>;
                    };
                    apiConfig: { __typename?: 'ApiConfig' } & Pick<ApiConfig, 'resourceScope'>;
                    loginRequest: { __typename?: 'Scope' } & Pick<Scope, 'scopes'>;
                    tokenRequest: { __typename?: 'Scope' } & Pick<Scope, 'scopes'>;
                    silentRequest: { __typename?: 'Scope' } & Pick<Scope, 'scopes'>;
                  })
                | ({ __typename: 'DemoAuthProviderConfig' } & Pick<DemoAuthProviderConfig, 'issuer' | 'tokenEndpoint'>);
            }
        >;
      };
  };
};

export type ContextDetailsFragment = { __typename?: 'Context' } & Pick<
  Context,
  'id' | 'tagline' | 'background' | 'vision' | 'impact' | 'who'
> & {
    references?: Maybe<Array<{ __typename?: 'Reference' } & Pick<Reference, 'id' | 'name' | 'uri' | 'description'>>>;
  };

export type EcoverseInfoQueryVariables = Exact<{ [key: string]: never }>;

export type EcoverseInfoQuery = { __typename?: 'Query' } & {
  ecoverse: { __typename?: 'Ecoverse' } & Pick<Ecoverse, 'id' | 'textID' | 'name'> & {
      context?: Maybe<
        { __typename?: 'Context' } & Pick<Context, 'tagline' | 'vision' | 'impact' | 'background'> & {
            references?: Maybe<Array<{ __typename?: 'Reference' } & Pick<Reference, 'name' | 'uri'>>>;
          }
      >;
      community?: Maybe<{ __typename?: 'Community' } & Pick<Community, 'id' | 'name'>>;
    };
};

export type ChallengesQueryVariables = Exact<{ [key: string]: never }>;

export type ChallengesQuery = { __typename?: 'Query' } & {
  ecoverse: { __typename?: 'Ecoverse' } & Pick<Ecoverse, 'id'> & {
      challenges?: Maybe<
        Array<
          { __typename?: 'Challenge' } & Pick<Challenge, 'id' | 'name' | 'textID'> & {
              context?: Maybe<
                { __typename?: 'Context' } & Pick<Context, 'tagline'> & {
                    references?: Maybe<Array<{ __typename?: 'Reference' } & Pick<Reference, 'name' | 'uri'>>>;
                  }
              >;
            }
        >
      >;
    };
};

export type ProjectsQueryVariables = Exact<{ [key: string]: never }>;

export type ProjectsQuery = { __typename?: 'Query' } & {
  ecoverse: { __typename?: 'Ecoverse' } & Pick<Ecoverse, 'id'> & {
      projects: Array<{ __typename?: 'Project' } & Pick<Project, 'id' | 'textID' | 'name' | 'description' | 'state'>>;
    };
};

export type ProjectsChainHistoryQueryVariables = Exact<{ [key: string]: never }>;

export type ProjectsChainHistoryQuery = { __typename?: 'Query' } & {
  ecoverse: { __typename?: 'Ecoverse' } & Pick<Ecoverse, 'id'> & {
      challenges?: Maybe<
        Array<
          { __typename?: 'Challenge' } & Pick<Challenge, 'name' | 'textID'> & {
              opportunities?: Maybe<
                Array<
                  { __typename?: 'Opportunity' } & Pick<Opportunity, 'textID'> & {
                      projects?: Maybe<Array<{ __typename?: 'Project' } & Pick<Project, 'textID'>>>;
                    }
                >
              >;
            }
        >
      >;
    };
};

export type OpportunitiesQueryVariables = Exact<{ [key: string]: never }>;

export type OpportunitiesQuery = { __typename?: 'Query' } & {
  ecoverse: { __typename?: 'Ecoverse' } & Pick<Ecoverse, 'id'> & {
      opportunities: Array<{ __typename?: 'Opportunity' } & Pick<Opportunity, 'id' | 'textID'>>;
    };
};

export type EcoverseHostReferencesQueryVariables = Exact<{ [key: string]: never }>;

export type EcoverseHostReferencesQuery = { __typename?: 'Query' } & {
  ecoverse: { __typename?: 'Ecoverse' } & Pick<Ecoverse, 'id'> & {
      host?: Maybe<
        { __typename?: 'Organisation' } & {
          profile: { __typename?: 'Profile' } & Pick<Profile, 'id'> & {
              references?: Maybe<Array<{ __typename?: 'Reference' } & Pick<Reference, 'name' | 'uri'>>>;
            };
        }
      >;
    };
};

export type EcoverseCommunityQueryVariables = Exact<{ [key: string]: never }>;

export type EcoverseCommunityQuery = { __typename?: 'Query' } & {
  ecoverse: { __typename?: 'Ecoverse' } & Pick<Ecoverse, 'id'> & {
      community?: Maybe<{ __typename?: 'Community' } & CommunityDetailsFragment>;
    };
};

export type OpportunityProfileQueryVariables = Exact<{
  id: Scalars['String'];
}>;

export type OpportunityProfileQuery = { __typename?: 'Query' } & {
  ecoverse: { __typename?: 'Ecoverse' } & Pick<Ecoverse, 'id'> & {
      opportunity: { __typename?: 'Opportunity' } & Pick<Opportunity, 'id' | 'textID' | 'name' | 'state'> & {
          aspects?: Maybe<Array<{ __typename?: 'Aspect' } & Pick<Aspect, 'id' | 'title' | 'framing' | 'explanation'>>>;
          context?: Maybe<
            { __typename?: 'Context' } & Pick<
              Context,
              'id' | 'tagline' | 'background' | 'vision' | 'impact' | 'who'
            > & { references?: Maybe<Array<{ __typename?: 'Reference' } & Pick<Reference, 'id' | 'name' | 'uri'>>> }
          >;
          community?: Maybe<
            { __typename?: 'Community' } & {
              groups?: Maybe<
                Array<
                  { __typename?: 'UserGroup' } & Pick<UserGroup, 'name'> & {
                      members?: Maybe<Array<{ __typename?: 'User' } & Pick<User, 'name'>>>;
                    }
                >
              >;
            }
          >;
          relations?: Maybe<
            Array<
              { __typename?: 'Relation' } & Pick<
                Relation,
                'id' | 'actorRole' | 'actorName' | 'actorType' | 'description' | 'type'
              >
            >
          >;
          actorGroups?: Maybe<
            Array<
              { __typename?: 'ActorGroup' } & Pick<ActorGroup, 'id' | 'name' | 'description'> & {
                  actors?: Maybe<
                    Array<{ __typename?: 'Actor' } & Pick<Actor, 'id' | 'name' | 'description' | 'value' | 'impact'>>
                  >;
                }
            >
          >;
          projects?: Maybe<
            Array<{ __typename?: 'Project' } & Pick<Project, 'id' | 'textID' | 'name' | 'description' | 'state'>>
          >;
        };
    };
};

export type CreateRelationMutationVariables = Exact<{
  input: CreateRelationInput;
}>;

export type CreateRelationMutation = { __typename?: 'Mutation' } & {
  createRelation: { __typename?: 'Relation' } & Pick<Relation, 'id'>;
};

export type RelationsListQueryVariables = Exact<{
  id: Scalars['String'];
}>;

export type RelationsListQuery = { __typename?: 'Query' } & {
  ecoverse: { __typename?: 'Ecoverse' } & Pick<Ecoverse, 'id'> & {
      opportunity: { __typename?: 'Opportunity' } & {
        relations?: Maybe<
          Array<
            { __typename?: 'Relation' } & Pick<
              Relation,
              'id' | 'type' | 'actorName' | 'actorType' | 'actorRole' | 'description'
            >
          >
        >;
      };
    };
};

export type CreateActorMutationVariables = Exact<{
  input: CreateActorInput;
}>;

export type CreateActorMutation = { __typename?: 'Mutation' } & {
  createActor: { __typename?: 'Actor' } & Pick<Actor, 'name'>;
};

export type OpportunityActorGroupsQueryVariables = Exact<{
  id: Scalars['String'];
}>;

export type OpportunityActorGroupsQuery = { __typename?: 'Query' } & {
  ecoverse: { __typename?: 'Ecoverse' } & Pick<Ecoverse, 'id'> & {
      opportunity: { __typename?: 'Opportunity' } & {
        actorGroups?: Maybe<
          Array<
            { __typename?: 'ActorGroup' } & Pick<ActorGroup, 'id' | 'name' | 'description'> & {
                actors?: Maybe<
                  Array<{ __typename?: 'Actor' } & Pick<Actor, 'id' | 'name' | 'description' | 'value' | 'impact'>>
                >;
              }
          >
        >;
      };
    };
};

export type UpdateActorMutationVariables = Exact<{
  input: UpdateActorInput;
}>;

export type UpdateActorMutation = { __typename?: 'Mutation' } & {
  updateActor: { __typename?: 'Actor' } & Pick<Actor, 'id' | 'name'>;
};

export type RemoveActorMutationVariables = Exact<{
  input: DeleteActorInput;
}>;

export type RemoveActorMutation = { __typename?: 'Mutation' } & {
  deleteActor: { __typename?: 'Actor' } & Pick<Actor, 'id'>;
};

export type RemoveRelationMutationVariables = Exact<{
  input: DeleteRelationInput;
}>;

export type RemoveRelationMutation = { __typename?: 'Mutation' } & {
  deleteRelation: { __typename?: 'Relation' } & Pick<Relation, 'id'>;
};

export type QueryOpportunityRelationsQueryVariables = Exact<{
  id: Scalars['String'];
}>;

export type QueryOpportunityRelationsQuery = { __typename?: 'Query' } & {
  ecoverse: { __typename?: 'Ecoverse' } & Pick<Ecoverse, 'id'> & {
      opportunity: { __typename?: 'Opportunity' } & {
        relations?: Maybe<
          Array<
            { __typename?: 'Relation' } & Pick<
              Relation,
              'actorRole' | 'actorName' | 'actorType' | 'description' | 'type'
            >
          >
        >;
      };
    };
};

export type UpdateAspectMutationVariables = Exact<{
  input: UpdateAspectInput;
}>;

export type UpdateAspectMutation = { __typename?: 'Mutation' } & {
  updateAspect: { __typename?: 'Aspect' } & Pick<Aspect, 'id' | 'title'>;
};

export type OpportunityAspectsQueryVariables = Exact<{
  id: Scalars['String'];
}>;

export type OpportunityAspectsQuery = { __typename?: 'Query' } & {
  ecoverse: { __typename?: 'Ecoverse' } & Pick<Ecoverse, 'id'> & {
      opportunity: { __typename?: 'Opportunity' } & {
        aspects?: Maybe<Array<{ __typename?: 'Aspect' } & Pick<Aspect, 'title' | 'framing' | 'explanation'>>>;
      };
    };
};

export type RemoveAspectMutationVariables = Exact<{
  input: DeleteAspectInput;
}>;

export type RemoveAspectMutation = { __typename?: 'Mutation' } & {
  deleteAspect: { __typename?: 'Aspect' } & Pick<Aspect, 'id'>;
};

export type OpportunityTemplateQueryVariables = Exact<{ [key: string]: never }>;

export type OpportunityTemplateQuery = { __typename?: 'Query' } & {
  configuration: { __typename?: 'Config' } & {
    template: { __typename?: 'Template' } & {
      opportunities: Array<
        { __typename?: 'OpportunityTemplate' } & Pick<OpportunityTemplate, 'aspects' | 'actorGroups'>
      >;
    };
  };
};

export type CreateAspectMutationVariables = Exact<{
  input: CreateAspectInput;
}>;

export type CreateAspectMutation = { __typename?: 'Mutation' } & {
  createAspect: { __typename?: 'Aspect' } & Pick<Aspect, 'title'>;
};

export type CreateActorGroupMutationVariables = Exact<{
  input: CreateActorGroupInput;
}>;

export type CreateActorGroupMutation = { __typename?: 'Mutation' } & {
  createActorGroup: { __typename?: 'ActorGroup' } & Pick<ActorGroup, 'name'>;
};

export type RemoveReferenceMutationVariables = Exact<{
  input: DeleteReferenceInput;
}>;

export type RemoveReferenceMutation = { __typename?: 'Mutation' } & {
  deleteReference: { __typename?: 'Reference' } & Pick<Reference, 'id'>;
};

export type RemoveOpportunityMutationVariables = Exact<{
  input: DeleteOpportunityInput;
}>;

export type RemoveOpportunityMutation = { __typename?: 'Mutation' } & {
  deleteOpportunity: { __typename?: 'Opportunity' } & Pick<Opportunity, 'id'>;
};

export type NewOpportunityFragment = { __typename?: 'Opportunity' } & Pick<Opportunity, 'id' | 'name'>;

export type OpportunityCommunityQueryVariables = Exact<{
  id: Scalars['String'];
}>;

export type OpportunityCommunityQuery = { __typename?: 'Query' } & {
  ecoverse: { __typename?: 'Ecoverse' } & Pick<Ecoverse, 'id'> & {
      opportunity: { __typename?: 'Opportunity' } & Pick<Opportunity, 'id' | 'name'> & {
          community?: Maybe<{ __typename?: 'Community' } & CommunityDetailsFragment>;
        };
    };
};

export type AvatarFragment = { __typename?: 'Profile' } & Pick<Profile, 'id' | 'avatar'>;

export type UploadAvatarMutationVariables = Exact<{
  file: Scalars['Upload'];
  input: UploadProfileAvatarInput;
}>;

export type UploadAvatarMutation = { __typename?: 'Mutation' } & {
  uploadAvatar: { __typename?: 'Profile' } & AvatarFragment;
};

export type ProjectDetailsFragment = { __typename?: 'Project' } & Pick<
  Project,
  'id' | 'textID' | 'name' | 'description' | 'state'
> & {
    tagset?: Maybe<{ __typename?: 'Tagset' } & Pick<Tagset, 'name' | 'tags'>>;
    aspects?: Maybe<Array<{ __typename?: 'Aspect' } & Pick<Aspect, 'title' | 'framing' | 'explanation'>>>;
  };

export type ProjectProfileQueryVariables = Exact<{
  id: Scalars['String'];
}>;

export type ProjectProfileQuery = { __typename?: 'Query' } & {
  ecoverse: { __typename?: 'Ecoverse' } & Pick<Ecoverse, 'id'> & {
      project: { __typename?: 'Project' } & ProjectDetailsFragment;
    };
};

export type CreateProjectMutationVariables = Exact<{
  input: CreateProjectInput;
}>;

export type CreateProjectMutation = { __typename?: 'Mutation' } & {
  createProject: { __typename?: 'Project' } & ProjectDetailsFragment;
};

export type UserDetailsFragment = { __typename?: 'User' } & Pick<
  User,
  'id' | 'name' | 'firstName' | 'lastName' | 'email' | 'gender' | 'country' | 'city' | 'phone' | 'accountUpn'
> & {
    profile?: Maybe<
      { __typename?: 'Profile' } & Pick<Profile, 'id' | 'description' | 'avatar'> & {
          references?: Maybe<Array<{ __typename?: 'Reference' } & Pick<Reference, 'id' | 'name' | 'uri'>>>;
          tagsets?: Maybe<Array<{ __typename?: 'Tagset' } & Pick<Tagset, 'id' | 'name' | 'tags'>>>;
        }
    >;
  };

export type UserMembersFragment = { __typename?: 'User' } & {
  memberof?: Maybe<
    { __typename?: 'MemberOf' } & {
      communities: Array<
        { __typename?: 'Community' } & Pick<Community, 'id' | 'name' | 'type'> & {
            groups?: Maybe<Array<{ __typename?: 'UserGroup' } & Pick<UserGroup, 'name'>>>;
          }
      >;
      organisations: Array<{ __typename?: 'Organisation' } & Pick<Organisation, 'id' | 'name'>>;
    }
  >;
};

export type UsersQueryVariables = Exact<{ [key: string]: never }>;

export type UsersQuery = { __typename?: 'Query' } & { users: Array<{ __typename?: 'User' } & UserDetailsFragment> };

export type UserQueryVariables = Exact<{
  id: Scalars['String'];
}>;

export type UserQuery = { __typename?: 'Query' } & {
  user: { __typename?: 'User' } & UserDetailsFragment & UserMembersFragment;
};

export type EcoverseUserIdsQueryVariables = Exact<{ [key: string]: never }>;

export type EcoverseUserIdsQuery = { __typename?: 'Query' } & {
  users: Array<{ __typename?: 'User' } & Pick<User, 'id'>>;
};

export type ChallengeUserIdsQueryVariables = Exact<{
  id: Scalars['String'];
}>;

export type ChallengeUserIdsQuery = { __typename?: 'Query' } & {
  ecoverse: { __typename?: 'Ecoverse' } & Pick<Ecoverse, 'id'> & {
      challenge: { __typename?: 'Challenge' } & {
        community?: Maybe<
          { __typename?: 'Community' } & { members?: Maybe<Array<{ __typename?: 'User' } & Pick<User, 'id'>>> }
        >;
      };
    };
};

export type OpportunityUserIdsQueryVariables = Exact<{
  id: Scalars['String'];
}>;

export type OpportunityUserIdsQuery = { __typename?: 'Query' } & {
  ecoverse: { __typename?: 'Ecoverse' } & Pick<Ecoverse, 'id'> & {
      opportunity: { __typename?: 'Opportunity' } & {
        community?: Maybe<
          { __typename?: 'Community' } & { members?: Maybe<Array<{ __typename?: 'User' } & Pick<User, 'id'>>> }
        >;
      };
    };
};

export type UserAvatarsQueryVariables = Exact<{
  ids: Array<Scalars['String']> | Scalars['String'];
}>;

export type UserAvatarsQuery = { __typename?: 'Query' } & {
  usersById: Array<
    { __typename?: 'User' } & Pick<User, 'id' | 'name'> & {
        profile?: Maybe<{ __typename?: 'Profile' } & Pick<Profile, 'id' | 'avatar'>>;
      }
  >;
};

export type UserProfileQueryVariables = Exact<{ [key: string]: never }>;

export type UserProfileQuery = { __typename?: 'Query' } & {
  me: { __typename?: 'User' } & UserDetailsFragment & UserMembersFragment;
};

export type UserCardDataQueryVariables = Exact<{
  ids: Array<Scalars['String']> | Scalars['String'];
}>;

export type UserCardDataQuery = { __typename?: 'Query' } & {
  usersById: Array<
    { __typename: 'User' } & {
      memberof?: Maybe<
        { __typename?: 'MemberOf' } & {
          communities: Array<{ __typename?: 'Community' } & Pick<Community, 'name'>>;
          organisations: Array<{ __typename?: 'Organisation' } & Pick<Organisation, 'name'>>;
        }
      >;
    } & UserDetailsFragment
  >;
};

export type AddUserToCommunityMutationVariables = Exact<{
  membershipData: AssignCommunityMemberInput;
}>;

export type AddUserToCommunityMutation = { __typename?: 'Mutation' } & {
  assignUserToCommunity: { __typename?: 'UserGroup' } & Pick<UserGroup, 'id' | 'name'>;
};

export const GroupMembersFragmentDoc = gql`
  fragment GroupMembers on User {
    id
    name
    firstName
    lastName
    email
  }
`;
export const NewChallengeFragmentDoc = gql`
  fragment NewChallenge on Challenge {
    id
    name
  }
`;
export const GroupDetailsFragmentDoc = gql`
  fragment groupDetails on UserGroup {
    id
    name
  }
`;
export const CommunityDetailsFragmentDoc = gql`
  fragment CommunityDetails on Community {
    id
    name
    type
    applications {
      id
    }
    groups {
      id
      name
      members {
        id
        name
        firstName
        lastName
        email
      }
    }
  }
`;
export const ContextDetailsFragmentDoc = gql`
  fragment ContextDetails on Context {
    id
    tagline
    background
    vision
    impact
    who
    references {
      id
      name
      uri
      description
    }
  }
`;
export const NewOpportunityFragmentDoc = gql`
  fragment NewOpportunity on Opportunity {
    id
    name
  }
`;
export const AvatarFragmentDoc = gql`
  fragment Avatar on Profile {
    id
    avatar
  }
`;
export const ProjectDetailsFragmentDoc = gql`
  fragment ProjectDetails on Project {
    id
    textID
    name
    description
    state
    tagset {
      name
      tags
    }
    aspects {
      title
      framing
      explanation
    }
  }
`;
export const UserDetailsFragmentDoc = gql`
  fragment UserDetails on User {
    id
    name
    firstName
    lastName
    email
    gender
    country
    city
    phone
    accountUpn
    profile {
      id
      description
      avatar
      references {
        id
        name
        uri
      }
      tagsets {
        id
        name
        tags
      }
    }
  }
`;
export const UserMembersFragmentDoc = gql`
  fragment UserMembers on User {
    memberof {
      communities {
        id
        name
        type
        groups {
          name
        }
      }
      organisations {
        id
        name
      }
    }
  }
`;
export const ServerMetadataDocument = gql`
  query serverMetadata {
    metadata {
      services {
        name
        version
      }
    }
  }
`;

/**
 * __useServerMetadataQuery__
 *
 * To run a query within a React component, call `useServerMetadataQuery` and pass it any options that fit your needs.
 * When your component renders, `useServerMetadataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useServerMetadataQuery({
 *   variables: {
 *   },
 * });
 */
export function useServerMetadataQuery(
  baseOptions?: Apollo.QueryHookOptions<ServerMetadataQuery, ServerMetadataQueryVariables>
) {
  return Apollo.useQuery<ServerMetadataQuery, ServerMetadataQueryVariables>(ServerMetadataDocument, baseOptions);
}
export function useServerMetadataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<ServerMetadataQuery, ServerMetadataQueryVariables>
) {
  return Apollo.useLazyQuery<ServerMetadataQuery, ServerMetadataQueryVariables>(ServerMetadataDocument, baseOptions);
}
export type ServerMetadataQueryHookResult = ReturnType<typeof useServerMetadataQuery>;
export type ServerMetadataLazyQueryHookResult = ReturnType<typeof useServerMetadataLazyQuery>;
export type ServerMetadataQueryResult = Apollo.QueryResult<ServerMetadataQuery, ServerMetadataQueryVariables>;
export const CreateUserDocument = gql`
  mutation createUser($input: CreateUserInput!) {
    createUser(userData: $input) {
      ...UserDetails
    }
  }
  ${UserDetailsFragmentDoc}
`;
export type CreateUserMutationFn = Apollo.MutationFunction<CreateUserMutation, CreateUserMutationVariables>;

/**
 * __useCreateUserMutation__
 *
 * To run a mutation, you first call `useCreateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createUserMutation, { data, loading, error }] = useCreateUserMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateUserMutation(
  baseOptions?: Apollo.MutationHookOptions<CreateUserMutation, CreateUserMutationVariables>
) {
  return Apollo.useMutation<CreateUserMutation, CreateUserMutationVariables>(CreateUserDocument, baseOptions);
}
export type CreateUserMutationHookResult = ReturnType<typeof useCreateUserMutation>;
export type CreateUserMutationResult = Apollo.MutationResult<CreateUserMutation>;
export type CreateUserMutationOptions = Apollo.BaseMutationOptions<CreateUserMutation, CreateUserMutationVariables>;
export const UpdateUserDocument = gql`
  mutation updateUser($input: UpdateUserInput!) {
    updateUser(userData: $input) {
      ...UserDetails
    }
  }
  ${UserDetailsFragmentDoc}
`;
export type UpdateUserMutationFn = Apollo.MutationFunction<UpdateUserMutation, UpdateUserMutationVariables>;

/**
 * __useUpdateUserMutation__
 *
 * To run a mutation, you first call `useUpdateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserMutation, { data, loading, error }] = useUpdateUserMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateUserMutation(
  baseOptions?: Apollo.MutationHookOptions<UpdateUserMutation, UpdateUserMutationVariables>
) {
  return Apollo.useMutation<UpdateUserMutation, UpdateUserMutationVariables>(UpdateUserDocument, baseOptions);
}
export type UpdateUserMutationHookResult = ReturnType<typeof useUpdateUserMutation>;
export type UpdateUserMutationResult = Apollo.MutationResult<UpdateUserMutation>;
export type UpdateUserMutationOptions = Apollo.BaseMutationOptions<UpdateUserMutation, UpdateUserMutationVariables>;
export const EcoverseDocument = gql`
  query ecoverse {
    ecoverse {
      id
      name
      community {
        groups {
          id
          name
        }
      }
      challenges {
        id
        name
        textID
        community {
          groups {
            id
            name
          }
        }
      }
    }
  }
`;

/**
 * __useEcoverseQuery__
 *
 * To run a query within a React component, call `useEcoverseQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoverseQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoverseQuery({
 *   variables: {
 *   },
 * });
 */
export function useEcoverseQuery(baseOptions?: Apollo.QueryHookOptions<EcoverseQuery, EcoverseQueryVariables>) {
  return Apollo.useQuery<EcoverseQuery, EcoverseQueryVariables>(EcoverseDocument, baseOptions);
}
export function useEcoverseLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<EcoverseQuery, EcoverseQueryVariables>) {
  return Apollo.useLazyQuery<EcoverseQuery, EcoverseQueryVariables>(EcoverseDocument, baseOptions);
}
export type EcoverseQueryHookResult = ReturnType<typeof useEcoverseQuery>;
export type EcoverseLazyQueryHookResult = ReturnType<typeof useEcoverseLazyQuery>;
export type EcoverseQueryResult = Apollo.QueryResult<EcoverseQuery, EcoverseQueryVariables>;
export const GroupMembersDocument = gql`
  query groupMembers($id: String!) {
    ecoverse {
      id
      group(ID: $id) {
        id
        name
        members {
          ...GroupMembers
        }
      }
    }
  }
  ${GroupMembersFragmentDoc}
`;

/**
 * __useGroupMembersQuery__
 *
 * To run a query within a React component, call `useGroupMembersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGroupMembersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupMembersQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGroupMembersQuery(
  baseOptions: Apollo.QueryHookOptions<GroupMembersQuery, GroupMembersQueryVariables>
) {
  return Apollo.useQuery<GroupMembersQuery, GroupMembersQueryVariables>(GroupMembersDocument, baseOptions);
}
export function useGroupMembersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GroupMembersQuery, GroupMembersQueryVariables>
) {
  return Apollo.useLazyQuery<GroupMembersQuery, GroupMembersQueryVariables>(GroupMembersDocument, baseOptions);
}
export type GroupMembersQueryHookResult = ReturnType<typeof useGroupMembersQuery>;
export type GroupMembersLazyQueryHookResult = ReturnType<typeof useGroupMembersLazyQuery>;
export type GroupMembersQueryResult = Apollo.QueryResult<GroupMembersQuery, GroupMembersQueryVariables>;
export const RemoveUserFromGroupDocument = gql`
  mutation removeUserFromGroup($input: RemoveUserGroupMemberInput!) {
    removeUserFromGroup(membershipData: $input) {
      id
      name
      members {
        ...GroupMembers
      }
    }
  }
  ${GroupMembersFragmentDoc}
`;
export type RemoveUserFromGroupMutationFn = Apollo.MutationFunction<
  RemoveUserFromGroupMutation,
  RemoveUserFromGroupMutationVariables
>;

/**
 * __useRemoveUserFromGroupMutation__
 *
 * To run a mutation, you first call `useRemoveUserFromGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveUserFromGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeUserFromGroupMutation, { data, loading, error }] = useRemoveUserFromGroupMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRemoveUserFromGroupMutation(
  baseOptions?: Apollo.MutationHookOptions<RemoveUserFromGroupMutation, RemoveUserFromGroupMutationVariables>
) {
  return Apollo.useMutation<RemoveUserFromGroupMutation, RemoveUserFromGroupMutationVariables>(
    RemoveUserFromGroupDocument,
    baseOptions
  );
}
export type RemoveUserFromGroupMutationHookResult = ReturnType<typeof useRemoveUserFromGroupMutation>;
export type RemoveUserFromGroupMutationResult = Apollo.MutationResult<RemoveUserFromGroupMutation>;
export type RemoveUserFromGroupMutationOptions = Apollo.BaseMutationOptions<
  RemoveUserFromGroupMutation,
  RemoveUserFromGroupMutationVariables
>;
export const DeleteUserDocument = gql`
  mutation deleteUser($input: DeleteUserInput!) {
    deleteUser(deleteData: $input) {
      ...UserDetails
    }
  }
  ${UserDetailsFragmentDoc}
`;
export type DeleteUserMutationFn = Apollo.MutationFunction<DeleteUserMutation, DeleteUserMutationVariables>;

/**
 * __useDeleteUserMutation__
 *
 * To run a mutation, you first call `useDeleteUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteUserMutation, { data, loading, error }] = useDeleteUserMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteUserMutation(
  baseOptions?: Apollo.MutationHookOptions<DeleteUserMutation, DeleteUserMutationVariables>
) {
  return Apollo.useMutation<DeleteUserMutation, DeleteUserMutationVariables>(DeleteUserDocument, baseOptions);
}
export type DeleteUserMutationHookResult = ReturnType<typeof useDeleteUserMutation>;
export type DeleteUserMutationResult = Apollo.MutationResult<DeleteUserMutation>;
export type DeleteUserMutationOptions = Apollo.BaseMutationOptions<DeleteUserMutation, DeleteUserMutationVariables>;
export const AddUserToGroupDocument = gql`
  mutation addUserToGroup($input: AssignUserGroupMemberInput!) {
    assignUserToGroup(membershipData: $input) {
      id
      members {
        ...GroupMembers
      }
    }
  }
  ${GroupMembersFragmentDoc}
`;
export type AddUserToGroupMutationFn = Apollo.MutationFunction<AddUserToGroupMutation, AddUserToGroupMutationVariables>;

/**
 * __useAddUserToGroupMutation__
 *
 * To run a mutation, you first call `useAddUserToGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddUserToGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addUserToGroupMutation, { data, loading, error }] = useAddUserToGroupMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddUserToGroupMutation(
  baseOptions?: Apollo.MutationHookOptions<AddUserToGroupMutation, AddUserToGroupMutationVariables>
) {
  return Apollo.useMutation<AddUserToGroupMutation, AddUserToGroupMutationVariables>(
    AddUserToGroupDocument,
    baseOptions
  );
}
export type AddUserToGroupMutationHookResult = ReturnType<typeof useAddUserToGroupMutation>;
export type AddUserToGroupMutationResult = Apollo.MutationResult<AddUserToGroupMutation>;
export type AddUserToGroupMutationOptions = Apollo.BaseMutationOptions<
  AddUserToGroupMutation,
  AddUserToGroupMutationVariables
>;
export const EcoverseChallengesListDocument = gql`
  query ecoverseChallengesList {
    ecoverse {
      id
      challenges {
        id
        name
        community {
          id
          name
        }
      }
    }
  }
`;

/**
 * __useEcoverseChallengesListQuery__
 *
 * To run a query within a React component, call `useEcoverseChallengesListQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoverseChallengesListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoverseChallengesListQuery({
 *   variables: {
 *   },
 * });
 */
export function useEcoverseChallengesListQuery(
  baseOptions?: Apollo.QueryHookOptions<EcoverseChallengesListQuery, EcoverseChallengesListQueryVariables>
) {
  return Apollo.useQuery<EcoverseChallengesListQuery, EcoverseChallengesListQueryVariables>(
    EcoverseChallengesListDocument,
    baseOptions
  );
}
export function useEcoverseChallengesListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<EcoverseChallengesListQuery, EcoverseChallengesListQueryVariables>
) {
  return Apollo.useLazyQuery<EcoverseChallengesListQuery, EcoverseChallengesListQueryVariables>(
    EcoverseChallengesListDocument,
    baseOptions
  );
}
export type EcoverseChallengesListQueryHookResult = ReturnType<typeof useEcoverseChallengesListQuery>;
export type EcoverseChallengesListLazyQueryHookResult = ReturnType<typeof useEcoverseChallengesListLazyQuery>;
export type EcoverseChallengesListQueryResult = Apollo.QueryResult<
  EcoverseChallengesListQuery,
  EcoverseChallengesListQueryVariables
>;
export const EcoverseGroupsListDocument = gql`
  query ecoverseGroupsList {
    ecoverse {
      id
      groups {
        id
        name
      }
    }
  }
`;

/**
 * __useEcoverseGroupsListQuery__
 *
 * To run a query within a React component, call `useEcoverseGroupsListQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoverseGroupsListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoverseGroupsListQuery({
 *   variables: {
 *   },
 * });
 */
export function useEcoverseGroupsListQuery(
  baseOptions?: Apollo.QueryHookOptions<EcoverseGroupsListQuery, EcoverseGroupsListQueryVariables>
) {
  return Apollo.useQuery<EcoverseGroupsListQuery, EcoverseGroupsListQueryVariables>(
    EcoverseGroupsListDocument,
    baseOptions
  );
}
export function useEcoverseGroupsListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<EcoverseGroupsListQuery, EcoverseGroupsListQueryVariables>
) {
  return Apollo.useLazyQuery<EcoverseGroupsListQuery, EcoverseGroupsListQueryVariables>(
    EcoverseGroupsListDocument,
    baseOptions
  );
}
export type EcoverseGroupsListQueryHookResult = ReturnType<typeof useEcoverseGroupsListQuery>;
export type EcoverseGroupsListLazyQueryHookResult = ReturnType<typeof useEcoverseGroupsListLazyQuery>;
export type EcoverseGroupsListQueryResult = Apollo.QueryResult<
  EcoverseGroupsListQuery,
  EcoverseGroupsListQueryVariables
>;
export const OrganizationNameDocument = gql`
  query organizationName($id: String!) {
    organisation(ID: $id) {
      name
    }
  }
`;

/**
 * __useOrganizationNameQuery__
 *
 * To run a query within a React component, call `useOrganizationNameQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrganizationNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrganizationNameQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useOrganizationNameQuery(
  baseOptions: Apollo.QueryHookOptions<OrganizationNameQuery, OrganizationNameQueryVariables>
) {
  return Apollo.useQuery<OrganizationNameQuery, OrganizationNameQueryVariables>(OrganizationNameDocument, baseOptions);
}
export function useOrganizationNameLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<OrganizationNameQuery, OrganizationNameQueryVariables>
) {
  return Apollo.useLazyQuery<OrganizationNameQuery, OrganizationNameQueryVariables>(
    OrganizationNameDocument,
    baseOptions
  );
}
export type OrganizationNameQueryHookResult = ReturnType<typeof useOrganizationNameQuery>;
export type OrganizationNameLazyQueryHookResult = ReturnType<typeof useOrganizationNameLazyQuery>;
export type OrganizationNameQueryResult = Apollo.QueryResult<OrganizationNameQuery, OrganizationNameQueryVariables>;
export const OrganizationsListDocument = gql`
  query organizationsList {
    organisations {
      id
      name
    }
  }
`;

/**
 * __useOrganizationsListQuery__
 *
 * To run a query within a React component, call `useOrganizationsListQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrganizationsListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrganizationsListQuery({
 *   variables: {
 *   },
 * });
 */
export function useOrganizationsListQuery(
  baseOptions?: Apollo.QueryHookOptions<OrganizationsListQuery, OrganizationsListQueryVariables>
) {
  return Apollo.useQuery<OrganizationsListQuery, OrganizationsListQueryVariables>(
    OrganizationsListDocument,
    baseOptions
  );
}
export function useOrganizationsListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<OrganizationsListQuery, OrganizationsListQueryVariables>
) {
  return Apollo.useLazyQuery<OrganizationsListQuery, OrganizationsListQueryVariables>(
    OrganizationsListDocument,
    baseOptions
  );
}
export type OrganizationsListQueryHookResult = ReturnType<typeof useOrganizationsListQuery>;
export type OrganizationsListLazyQueryHookResult = ReturnType<typeof useOrganizationsListLazyQuery>;
export type OrganizationsListQueryResult = Apollo.QueryResult<OrganizationsListQuery, OrganizationsListQueryVariables>;
export const ChallengeNameDocument = gql`
  query challengeName($id: String!) {
    ecoverse {
      id
      challenge(ID: $id) {
        id
        name
        community {
          id
          name
        }
      }
    }
  }
`;

/**
 * __useChallengeNameQuery__
 *
 * To run a query within a React component, call `useChallengeNameQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeNameQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useChallengeNameQuery(
  baseOptions: Apollo.QueryHookOptions<ChallengeNameQuery, ChallengeNameQueryVariables>
) {
  return Apollo.useQuery<ChallengeNameQuery, ChallengeNameQueryVariables>(ChallengeNameDocument, baseOptions);
}
export function useChallengeNameLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<ChallengeNameQuery, ChallengeNameQueryVariables>
) {
  return Apollo.useLazyQuery<ChallengeNameQuery, ChallengeNameQueryVariables>(ChallengeNameDocument, baseOptions);
}
export type ChallengeNameQueryHookResult = ReturnType<typeof useChallengeNameQuery>;
export type ChallengeNameLazyQueryHookResult = ReturnType<typeof useChallengeNameLazyQuery>;
export type ChallengeNameQueryResult = Apollo.QueryResult<ChallengeNameQuery, ChallengeNameQueryVariables>;
export const ChallengeGroupsDocument = gql`
  query challengeGroups($id: String!) {
    ecoverse {
      id
      challenge(ID: $id) {
        community {
          groups {
            id
            name
          }
        }
      }
    }
  }
`;

/**
 * __useChallengeGroupsQuery__
 *
 * To run a query within a React component, call `useChallengeGroupsQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeGroupsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeGroupsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useChallengeGroupsQuery(
  baseOptions: Apollo.QueryHookOptions<ChallengeGroupsQuery, ChallengeGroupsQueryVariables>
) {
  return Apollo.useQuery<ChallengeGroupsQuery, ChallengeGroupsQueryVariables>(ChallengeGroupsDocument, baseOptions);
}
export function useChallengeGroupsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<ChallengeGroupsQuery, ChallengeGroupsQueryVariables>
) {
  return Apollo.useLazyQuery<ChallengeGroupsQuery, ChallengeGroupsQueryVariables>(ChallengeGroupsDocument, baseOptions);
}
export type ChallengeGroupsQueryHookResult = ReturnType<typeof useChallengeGroupsQuery>;
export type ChallengeGroupsLazyQueryHookResult = ReturnType<typeof useChallengeGroupsLazyQuery>;
export type ChallengeGroupsQueryResult = Apollo.QueryResult<ChallengeGroupsQuery, ChallengeGroupsQueryVariables>;
export const OrganizationGroupsDocument = gql`
  query organizationGroups($id: String!) {
    organisation(ID: $id) {
      groups {
        id
        name
      }
    }
  }
`;

/**
 * __useOrganizationGroupsQuery__
 *
 * To run a query within a React component, call `useOrganizationGroupsQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrganizationGroupsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrganizationGroupsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useOrganizationGroupsQuery(
  baseOptions: Apollo.QueryHookOptions<OrganizationGroupsQuery, OrganizationGroupsQueryVariables>
) {
  return Apollo.useQuery<OrganizationGroupsQuery, OrganizationGroupsQueryVariables>(
    OrganizationGroupsDocument,
    baseOptions
  );
}
export function useOrganizationGroupsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<OrganizationGroupsQuery, OrganizationGroupsQueryVariables>
) {
  return Apollo.useLazyQuery<OrganizationGroupsQuery, OrganizationGroupsQueryVariables>(
    OrganizationGroupsDocument,
    baseOptions
  );
}
export type OrganizationGroupsQueryHookResult = ReturnType<typeof useOrganizationGroupsQuery>;
export type OrganizationGroupsLazyQueryHookResult = ReturnType<typeof useOrganizationGroupsLazyQuery>;
export type OrganizationGroupsQueryResult = Apollo.QueryResult<
  OrganizationGroupsQuery,
  OrganizationGroupsQueryVariables
>;
export const ChallengeOpportunitiesDocument = gql`
  query challengeOpportunities($id: String!) {
    ecoverse {
      id
      challenge(ID: $id) {
        opportunities {
          id
          name
        }
      }
    }
  }
`;

/**
 * __useChallengeOpportunitiesQuery__
 *
 * To run a query within a React component, call `useChallengeOpportunitiesQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeOpportunitiesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeOpportunitiesQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useChallengeOpportunitiesQuery(
  baseOptions: Apollo.QueryHookOptions<ChallengeOpportunitiesQuery, ChallengeOpportunitiesQueryVariables>
) {
  return Apollo.useQuery<ChallengeOpportunitiesQuery, ChallengeOpportunitiesQueryVariables>(
    ChallengeOpportunitiesDocument,
    baseOptions
  );
}
export function useChallengeOpportunitiesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<ChallengeOpportunitiesQuery, ChallengeOpportunitiesQueryVariables>
) {
  return Apollo.useLazyQuery<ChallengeOpportunitiesQuery, ChallengeOpportunitiesQueryVariables>(
    ChallengeOpportunitiesDocument,
    baseOptions
  );
}
export type ChallengeOpportunitiesQueryHookResult = ReturnType<typeof useChallengeOpportunitiesQuery>;
export type ChallengeOpportunitiesLazyQueryHookResult = ReturnType<typeof useChallengeOpportunitiesLazyQuery>;
export type ChallengeOpportunitiesQueryResult = Apollo.QueryResult<
  ChallengeOpportunitiesQuery,
  ChallengeOpportunitiesQueryVariables
>;
export const OpportunityGroupsDocument = gql`
  query opportunityGroups($id: String!) {
    ecoverse {
      id
      opportunity(ID: $id) {
        community {
          groups {
            id
            name
          }
        }
      }
    }
  }
`;

/**
 * __useOpportunityGroupsQuery__
 *
 * To run a query within a React component, call `useOpportunityGroupsQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityGroupsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityGroupsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useOpportunityGroupsQuery(
  baseOptions: Apollo.QueryHookOptions<OpportunityGroupsQuery, OpportunityGroupsQueryVariables>
) {
  return Apollo.useQuery<OpportunityGroupsQuery, OpportunityGroupsQueryVariables>(
    OpportunityGroupsDocument,
    baseOptions
  );
}
export function useOpportunityGroupsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<OpportunityGroupsQuery, OpportunityGroupsQueryVariables>
) {
  return Apollo.useLazyQuery<OpportunityGroupsQuery, OpportunityGroupsQueryVariables>(
    OpportunityGroupsDocument,
    baseOptions
  );
}
export type OpportunityGroupsQueryHookResult = ReturnType<typeof useOpportunityGroupsQuery>;
export type OpportunityGroupsLazyQueryHookResult = ReturnType<typeof useOpportunityGroupsLazyQuery>;
export type OpportunityGroupsQueryResult = Apollo.QueryResult<OpportunityGroupsQuery, OpportunityGroupsQueryVariables>;
export const OpportunityNameDocument = gql`
  query opportunityName($id: String!) {
    ecoverse {
      id
      opportunity(ID: $id) {
        id
        name
      }
    }
  }
`;

/**
 * __useOpportunityNameQuery__
 *
 * To run a query within a React component, call `useOpportunityNameQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityNameQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useOpportunityNameQuery(
  baseOptions: Apollo.QueryHookOptions<OpportunityNameQuery, OpportunityNameQueryVariables>
) {
  return Apollo.useQuery<OpportunityNameQuery, OpportunityNameQueryVariables>(OpportunityNameDocument, baseOptions);
}
export function useOpportunityNameLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<OpportunityNameQuery, OpportunityNameQueryVariables>
) {
  return Apollo.useLazyQuery<OpportunityNameQuery, OpportunityNameQueryVariables>(OpportunityNameDocument, baseOptions);
}
export type OpportunityNameQueryHookResult = ReturnType<typeof useOpportunityNameQuery>;
export type OpportunityNameLazyQueryHookResult = ReturnType<typeof useOpportunityNameLazyQuery>;
export type OpportunityNameQueryResult = Apollo.QueryResult<OpportunityNameQuery, OpportunityNameQueryVariables>;
export const TagsetsTemplateDocument = gql`
  query tagsetsTemplate {
    configuration {
      template {
        users {
          tagsets {
            name
            placeholder
          }
        }
      }
    }
  }
`;

/**
 * __useTagsetsTemplateQuery__
 *
 * To run a query within a React component, call `useTagsetsTemplateQuery` and pass it any options that fit your needs.
 * When your component renders, `useTagsetsTemplateQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTagsetsTemplateQuery({
 *   variables: {
 *   },
 * });
 */
export function useTagsetsTemplateQuery(
  baseOptions?: Apollo.QueryHookOptions<TagsetsTemplateQuery, TagsetsTemplateQueryVariables>
) {
  return Apollo.useQuery<TagsetsTemplateQuery, TagsetsTemplateQueryVariables>(TagsetsTemplateDocument, baseOptions);
}
export function useTagsetsTemplateLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<TagsetsTemplateQuery, TagsetsTemplateQueryVariables>
) {
  return Apollo.useLazyQuery<TagsetsTemplateQuery, TagsetsTemplateQueryVariables>(TagsetsTemplateDocument, baseOptions);
}
export type TagsetsTemplateQueryHookResult = ReturnType<typeof useTagsetsTemplateQuery>;
export type TagsetsTemplateLazyQueryHookResult = ReturnType<typeof useTagsetsTemplateLazyQuery>;
export type TagsetsTemplateQueryResult = Apollo.QueryResult<TagsetsTemplateQuery, TagsetsTemplateQueryVariables>;
export const CreateChallengeDocument = gql`
  mutation createChallenge($input: CreateChallengeInput!) {
    createChallenge(challengeData: $input) {
      ...NewChallenge
    }
  }
  ${NewChallengeFragmentDoc}
`;
export type CreateChallengeMutationFn = Apollo.MutationFunction<
  CreateChallengeMutation,
  CreateChallengeMutationVariables
>;

/**
 * __useCreateChallengeMutation__
 *
 * To run a mutation, you first call `useCreateChallengeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateChallengeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createChallengeMutation, { data, loading, error }] = useCreateChallengeMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateChallengeMutation(
  baseOptions?: Apollo.MutationHookOptions<CreateChallengeMutation, CreateChallengeMutationVariables>
) {
  return Apollo.useMutation<CreateChallengeMutation, CreateChallengeMutationVariables>(
    CreateChallengeDocument,
    baseOptions
  );
}
export type CreateChallengeMutationHookResult = ReturnType<typeof useCreateChallengeMutation>;
export type CreateChallengeMutationResult = Apollo.MutationResult<CreateChallengeMutation>;
export type CreateChallengeMutationOptions = Apollo.BaseMutationOptions<
  CreateChallengeMutation,
  CreateChallengeMutationVariables
>;
export const ChallengeProfileInfoDocument = gql`
  query challengeProfileInfo($id: String!) {
    ecoverse {
      id
      challenge(ID: $id) {
        id
        textID
        name
        state
        context {
          ...ContextDetails
        }
      }
    }
  }
  ${ContextDetailsFragmentDoc}
`;

/**
 * __useChallengeProfileInfoQuery__
 *
 * To run a query within a React component, call `useChallengeProfileInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeProfileInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeProfileInfoQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useChallengeProfileInfoQuery(
  baseOptions: Apollo.QueryHookOptions<ChallengeProfileInfoQuery, ChallengeProfileInfoQueryVariables>
) {
  return Apollo.useQuery<ChallengeProfileInfoQuery, ChallengeProfileInfoQueryVariables>(
    ChallengeProfileInfoDocument,
    baseOptions
  );
}
export function useChallengeProfileInfoLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<ChallengeProfileInfoQuery, ChallengeProfileInfoQueryVariables>
) {
  return Apollo.useLazyQuery<ChallengeProfileInfoQuery, ChallengeProfileInfoQueryVariables>(
    ChallengeProfileInfoDocument,
    baseOptions
  );
}
export type ChallengeProfileInfoQueryHookResult = ReturnType<typeof useChallengeProfileInfoQuery>;
export type ChallengeProfileInfoLazyQueryHookResult = ReturnType<typeof useChallengeProfileInfoLazyQuery>;
export type ChallengeProfileInfoQueryResult = Apollo.QueryResult<
  ChallengeProfileInfoQuery,
  ChallengeProfileInfoQueryVariables
>;
export const CreateOpportunityDocument = gql`
  mutation createOpportunity($input: CreateOpportunityInput!) {
    createOpportunity(opportunityData: $input) {
      ...NewOpportunity
    }
  }
  ${NewOpportunityFragmentDoc}
`;
export type CreateOpportunityMutationFn = Apollo.MutationFunction<
  CreateOpportunityMutation,
  CreateOpportunityMutationVariables
>;

/**
 * __useCreateOpportunityMutation__
 *
 * To run a mutation, you first call `useCreateOpportunityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateOpportunityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createOpportunityMutation, { data, loading, error }] = useCreateOpportunityMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateOpportunityMutation(
  baseOptions?: Apollo.MutationHookOptions<CreateOpportunityMutation, CreateOpportunityMutationVariables>
) {
  return Apollo.useMutation<CreateOpportunityMutation, CreateOpportunityMutationVariables>(
    CreateOpportunityDocument,
    baseOptions
  );
}
export type CreateOpportunityMutationHookResult = ReturnType<typeof useCreateOpportunityMutation>;
export type CreateOpportunityMutationResult = Apollo.MutationResult<CreateOpportunityMutation>;
export type CreateOpportunityMutationOptions = Apollo.BaseMutationOptions<
  CreateOpportunityMutation,
  CreateOpportunityMutationVariables
>;
export const UpdateOpportunityDocument = gql`
  mutation updateOpportunity($opportunityData: UpdateOpportunityInput!) {
    updateOpportunity(opportunityData: $opportunityData) {
      id
      name
    }
  }
`;
export type UpdateOpportunityMutationFn = Apollo.MutationFunction<
  UpdateOpportunityMutation,
  UpdateOpportunityMutationVariables
>;

/**
 * __useUpdateOpportunityMutation__
 *
 * To run a mutation, you first call `useUpdateOpportunityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateOpportunityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateOpportunityMutation, { data, loading, error }] = useUpdateOpportunityMutation({
 *   variables: {
 *      opportunityData: // value for 'opportunityData'
 *   },
 * });
 */
export function useUpdateOpportunityMutation(
  baseOptions?: Apollo.MutationHookOptions<UpdateOpportunityMutation, UpdateOpportunityMutationVariables>
) {
  return Apollo.useMutation<UpdateOpportunityMutation, UpdateOpportunityMutationVariables>(
    UpdateOpportunityDocument,
    baseOptions
  );
}
export type UpdateOpportunityMutationHookResult = ReturnType<typeof useUpdateOpportunityMutation>;
export type UpdateOpportunityMutationResult = Apollo.MutationResult<UpdateOpportunityMutation>;
export type UpdateOpportunityMutationOptions = Apollo.BaseMutationOptions<
  UpdateOpportunityMutation,
  UpdateOpportunityMutationVariables
>;
export const OpportunityProfileInfoDocument = gql`
  query opportunityProfileInfo($id: String!) {
    ecoverse {
      id
      opportunity(ID: $id) {
        id
        textID
        name
        context {
          ...ContextDetails
        }
      }
    }
  }
  ${ContextDetailsFragmentDoc}
`;

/**
 * __useOpportunityProfileInfoQuery__
 *
 * To run a query within a React component, call `useOpportunityProfileInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityProfileInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityProfileInfoQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useOpportunityProfileInfoQuery(
  baseOptions: Apollo.QueryHookOptions<OpportunityProfileInfoQuery, OpportunityProfileInfoQueryVariables>
) {
  return Apollo.useQuery<OpportunityProfileInfoQuery, OpportunityProfileInfoQueryVariables>(
    OpportunityProfileInfoDocument,
    baseOptions
  );
}
export function useOpportunityProfileInfoLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<OpportunityProfileInfoQuery, OpportunityProfileInfoQueryVariables>
) {
  return Apollo.useLazyQuery<OpportunityProfileInfoQuery, OpportunityProfileInfoQueryVariables>(
    OpportunityProfileInfoDocument,
    baseOptions
  );
}
export type OpportunityProfileInfoQueryHookResult = ReturnType<typeof useOpportunityProfileInfoQuery>;
export type OpportunityProfileInfoLazyQueryHookResult = ReturnType<typeof useOpportunityProfileInfoLazyQuery>;
export type OpportunityProfileInfoQueryResult = Apollo.QueryResult<
  OpportunityProfileInfoQuery,
  OpportunityProfileInfoQueryVariables
>;
export const CreateOrganizationDocument = gql`
  mutation createOrganization($input: CreateOrganisationInput!) {
    createOrganisation(organisationData: $input) {
      id
      name
    }
  }
`;
export type CreateOrganizationMutationFn = Apollo.MutationFunction<
  CreateOrganizationMutation,
  CreateOrganizationMutationVariables
>;

/**
 * __useCreateOrganizationMutation__
 *
 * To run a mutation, you first call `useCreateOrganizationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateOrganizationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createOrganizationMutation, { data, loading, error }] = useCreateOrganizationMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateOrganizationMutation(
  baseOptions?: Apollo.MutationHookOptions<CreateOrganizationMutation, CreateOrganizationMutationVariables>
) {
  return Apollo.useMutation<CreateOrganizationMutation, CreateOrganizationMutationVariables>(
    CreateOrganizationDocument,
    baseOptions
  );
}
export type CreateOrganizationMutationHookResult = ReturnType<typeof useCreateOrganizationMutation>;
export type CreateOrganizationMutationResult = Apollo.MutationResult<CreateOrganizationMutation>;
export type CreateOrganizationMutationOptions = Apollo.BaseMutationOptions<
  CreateOrganizationMutation,
  CreateOrganizationMutationVariables
>;
export const UpdateOrganizationDocument = gql`
  mutation updateOrganization($input: UpdateOrganisationInput!) {
    updateOrganisation(organisationData: $input) {
      id
      name
    }
  }
`;
export type UpdateOrganizationMutationFn = Apollo.MutationFunction<
  UpdateOrganizationMutation,
  UpdateOrganizationMutationVariables
>;

/**
 * __useUpdateOrganizationMutation__
 *
 * To run a mutation, you first call `useUpdateOrganizationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateOrganizationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateOrganizationMutation, { data, loading, error }] = useUpdateOrganizationMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateOrganizationMutation(
  baseOptions?: Apollo.MutationHookOptions<UpdateOrganizationMutation, UpdateOrganizationMutationVariables>
) {
  return Apollo.useMutation<UpdateOrganizationMutation, UpdateOrganizationMutationVariables>(
    UpdateOrganizationDocument,
    baseOptions
  );
}
export type UpdateOrganizationMutationHookResult = ReturnType<typeof useUpdateOrganizationMutation>;
export type UpdateOrganizationMutationResult = Apollo.MutationResult<UpdateOrganizationMutation>;
export type UpdateOrganizationMutationOptions = Apollo.BaseMutationOptions<
  UpdateOrganizationMutation,
  UpdateOrganizationMutationVariables
>;
export const OrganisationProfileInfoDocument = gql`
  query organisationProfileInfo($id: String!) {
    organisation(ID: $id) {
      id
      textID
      name
      profile {
        id
        avatar
        description
        references {
          id
          name
          uri
        }
        tagsets {
          id
          name
          tags
        }
      }
    }
  }
`;

/**
 * __useOrganisationProfileInfoQuery__
 *
 * To run a query within a React component, call `useOrganisationProfileInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrganisationProfileInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrganisationProfileInfoQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useOrganisationProfileInfoQuery(
  baseOptions: Apollo.QueryHookOptions<OrganisationProfileInfoQuery, OrganisationProfileInfoQueryVariables>
) {
  return Apollo.useQuery<OrganisationProfileInfoQuery, OrganisationProfileInfoQueryVariables>(
    OrganisationProfileInfoDocument,
    baseOptions
  );
}
export function useOrganisationProfileInfoLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<OrganisationProfileInfoQuery, OrganisationProfileInfoQueryVariables>
) {
  return Apollo.useLazyQuery<OrganisationProfileInfoQuery, OrganisationProfileInfoQueryVariables>(
    OrganisationProfileInfoDocument,
    baseOptions
  );
}
export type OrganisationProfileInfoQueryHookResult = ReturnType<typeof useOrganisationProfileInfoQuery>;
export type OrganisationProfileInfoLazyQueryHookResult = ReturnType<typeof useOrganisationProfileInfoLazyQuery>;
export type OrganisationProfileInfoQueryResult = Apollo.QueryResult<
  OrganisationProfileInfoQuery,
  OrganisationProfileInfoQueryVariables
>;
export const CreateGroupOnCommunityDocument = gql`
  mutation createGroupOnCommunity($input: CreateUserGroupInput!) {
    createGroupOnCommunity(groupData: $input) {
      id
      name
    }
  }
`;
export type CreateGroupOnCommunityMutationFn = Apollo.MutationFunction<
  CreateGroupOnCommunityMutation,
  CreateGroupOnCommunityMutationVariables
>;

/**
 * __useCreateGroupOnCommunityMutation__
 *
 * To run a mutation, you first call `useCreateGroupOnCommunityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateGroupOnCommunityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createGroupOnCommunityMutation, { data, loading, error }] = useCreateGroupOnCommunityMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateGroupOnCommunityMutation(
  baseOptions?: Apollo.MutationHookOptions<CreateGroupOnCommunityMutation, CreateGroupOnCommunityMutationVariables>
) {
  return Apollo.useMutation<CreateGroupOnCommunityMutation, CreateGroupOnCommunityMutationVariables>(
    CreateGroupOnCommunityDocument,
    baseOptions
  );
}
export type CreateGroupOnCommunityMutationHookResult = ReturnType<typeof useCreateGroupOnCommunityMutation>;
export type CreateGroupOnCommunityMutationResult = Apollo.MutationResult<CreateGroupOnCommunityMutation>;
export type CreateGroupOnCommunityMutationOptions = Apollo.BaseMutationOptions<
  CreateGroupOnCommunityMutation,
  CreateGroupOnCommunityMutationVariables
>;
export const CreateGroupOnOrganizationDocument = gql`
  mutation createGroupOnOrganization($input: CreateUserGroupInput!) {
    createGroupOnOrganisation(groupData: $input) {
      id
      name
    }
  }
`;
export type CreateGroupOnOrganizationMutationFn = Apollo.MutationFunction<
  CreateGroupOnOrganizationMutation,
  CreateGroupOnOrganizationMutationVariables
>;

/**
 * __useCreateGroupOnOrganizationMutation__
 *
 * To run a mutation, you first call `useCreateGroupOnOrganizationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateGroupOnOrganizationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createGroupOnOrganizationMutation, { data, loading, error }] = useCreateGroupOnOrganizationMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateGroupOnOrganizationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateGroupOnOrganizationMutation,
    CreateGroupOnOrganizationMutationVariables
  >
) {
  return Apollo.useMutation<CreateGroupOnOrganizationMutation, CreateGroupOnOrganizationMutationVariables>(
    CreateGroupOnOrganizationDocument,
    baseOptions
  );
}
export type CreateGroupOnOrganizationMutationHookResult = ReturnType<typeof useCreateGroupOnOrganizationMutation>;
export type CreateGroupOnOrganizationMutationResult = Apollo.MutationResult<CreateGroupOnOrganizationMutation>;
export type CreateGroupOnOrganizationMutationOptions = Apollo.BaseMutationOptions<
  CreateGroupOnOrganizationMutation,
  CreateGroupOnOrganizationMutationVariables
>;
export const OrganizationDetailsDocument = gql`
  query organizationDetails($id: String!) {
    organisation(ID: $id) {
      id
      name
      profile {
        id
        avatar
        description
        references {
          name
          uri
        }
        tagsets {
          id
          name
          tags
        }
      }
      groups {
        id
        name
        members {
          id
          name
        }
      }
    }
  }
`;

/**
 * __useOrganizationDetailsQuery__
 *
 * To run a query within a React component, call `useOrganizationDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrganizationDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrganizationDetailsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useOrganizationDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<OrganizationDetailsQuery, OrganizationDetailsQueryVariables>
) {
  return Apollo.useQuery<OrganizationDetailsQuery, OrganizationDetailsQueryVariables>(
    OrganizationDetailsDocument,
    baseOptions
  );
}
export function useOrganizationDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<OrganizationDetailsQuery, OrganizationDetailsQueryVariables>
) {
  return Apollo.useLazyQuery<OrganizationDetailsQuery, OrganizationDetailsQueryVariables>(
    OrganizationDetailsDocument,
    baseOptions
  );
}
export type OrganizationDetailsQueryHookResult = ReturnType<typeof useOrganizationDetailsQuery>;
export type OrganizationDetailsLazyQueryHookResult = ReturnType<typeof useOrganizationDetailsLazyQuery>;
export type OrganizationDetailsQueryResult = Apollo.QueryResult<
  OrganizationDetailsQuery,
  OrganizationDetailsQueryVariables
>;
export const RemoveUserGroupDocument = gql`
  mutation removeUserGroup($input: DeleteUserGroupInput!) {
    deleteUserGroup(deleteData: $input) {
      id
    }
  }
`;
export type RemoveUserGroupMutationFn = Apollo.MutationFunction<
  RemoveUserGroupMutation,
  RemoveUserGroupMutationVariables
>;

/**
 * __useRemoveUserGroupMutation__
 *
 * To run a mutation, you first call `useRemoveUserGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveUserGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeUserGroupMutation, { data, loading, error }] = useRemoveUserGroupMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRemoveUserGroupMutation(
  baseOptions?: Apollo.MutationHookOptions<RemoveUserGroupMutation, RemoveUserGroupMutationVariables>
) {
  return Apollo.useMutation<RemoveUserGroupMutation, RemoveUserGroupMutationVariables>(
    RemoveUserGroupDocument,
    baseOptions
  );
}
export type RemoveUserGroupMutationHookResult = ReturnType<typeof useRemoveUserGroupMutation>;
export type RemoveUserGroupMutationResult = Apollo.MutationResult<RemoveUserGroupMutation>;
export type RemoveUserGroupMutationOptions = Apollo.BaseMutationOptions<
  RemoveUserGroupMutation,
  RemoveUserGroupMutationVariables
>;
export const ChallengeProfileDocument = gql`
  query challengeProfile($id: String!) {
    ecoverse {
      id
      challenge(ID: $id) {
        id
        textID
        name
        state
        context {
          ...ContextDetails
        }
        community {
          members {
            name
          }
        }
        tagset {
          name
          tags
        }
        opportunities {
          id
          name
          state
          textID
          context {
            ...ContextDetails
          }
          projects {
            id
            textID
            name
            description
            state
          }
        }
        leadOrganisations {
          id
          name
          profile {
            id
            avatar
          }
        }
      }
    }
  }
  ${ContextDetailsFragmentDoc}
`;

/**
 * __useChallengeProfileQuery__
 *
 * To run a query within a React component, call `useChallengeProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeProfileQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useChallengeProfileQuery(
  baseOptions: Apollo.QueryHookOptions<ChallengeProfileQuery, ChallengeProfileQueryVariables>
) {
  return Apollo.useQuery<ChallengeProfileQuery, ChallengeProfileQueryVariables>(ChallengeProfileDocument, baseOptions);
}
export function useChallengeProfileLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<ChallengeProfileQuery, ChallengeProfileQueryVariables>
) {
  return Apollo.useLazyQuery<ChallengeProfileQuery, ChallengeProfileQueryVariables>(
    ChallengeProfileDocument,
    baseOptions
  );
}
export type ChallengeProfileQueryHookResult = ReturnType<typeof useChallengeProfileQuery>;
export type ChallengeProfileLazyQueryHookResult = ReturnType<typeof useChallengeProfileLazyQuery>;
export type ChallengeProfileQueryResult = Apollo.QueryResult<ChallengeProfileQuery, ChallengeProfileQueryVariables>;
export const UpdateChallengeDocument = gql`
  mutation updateChallenge($input: UpdateChallengeInput!) {
    updateChallenge(challengeData: $input) {
      id
      name
    }
  }
`;
export type UpdateChallengeMutationFn = Apollo.MutationFunction<
  UpdateChallengeMutation,
  UpdateChallengeMutationVariables
>;

/**
 * __useUpdateChallengeMutation__
 *
 * To run a mutation, you first call `useUpdateChallengeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateChallengeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateChallengeMutation, { data, loading, error }] = useUpdateChallengeMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateChallengeMutation(
  baseOptions?: Apollo.MutationHookOptions<UpdateChallengeMutation, UpdateChallengeMutationVariables>
) {
  return Apollo.useMutation<UpdateChallengeMutation, UpdateChallengeMutationVariables>(
    UpdateChallengeDocument,
    baseOptions
  );
}
export type UpdateChallengeMutationHookResult = ReturnType<typeof useUpdateChallengeMutation>;
export type UpdateChallengeMutationResult = Apollo.MutationResult<UpdateChallengeMutation>;
export type UpdateChallengeMutationOptions = Apollo.BaseMutationOptions<
  UpdateChallengeMutation,
  UpdateChallengeMutationVariables
>;
export const ChallengeMembersDocument = gql`
  query challengeMembers($challengeID: String!) {
    ecoverse {
      id
      challenge(ID: $challengeID) {
        community {
          members {
            id
            name
            firstName
            lastName
            email
          }
        }
      }
    }
  }
`;

/**
 * __useChallengeMembersQuery__
 *
 * To run a query within a React component, call `useChallengeMembersQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeMembersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeMembersQuery({
 *   variables: {
 *      challengeID: // value for 'challengeID'
 *   },
 * });
 */
export function useChallengeMembersQuery(
  baseOptions: Apollo.QueryHookOptions<ChallengeMembersQuery, ChallengeMembersQueryVariables>
) {
  return Apollo.useQuery<ChallengeMembersQuery, ChallengeMembersQueryVariables>(ChallengeMembersDocument, baseOptions);
}
export function useChallengeMembersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<ChallengeMembersQuery, ChallengeMembersQueryVariables>
) {
  return Apollo.useLazyQuery<ChallengeMembersQuery, ChallengeMembersQueryVariables>(
    ChallengeMembersDocument,
    baseOptions
  );
}
export type ChallengeMembersQueryHookResult = ReturnType<typeof useChallengeMembersQuery>;
export type ChallengeMembersLazyQueryHookResult = ReturnType<typeof useChallengeMembersLazyQuery>;
export type ChallengeMembersQueryResult = Apollo.QueryResult<ChallengeMembersQuery, ChallengeMembersQueryVariables>;
export const ChallengeCommunityDocument = gql`
  query challengeCommunity($id: String!) {
    ecoverse {
      id
      challenge(ID: $id) {
        id
        name
        community {
          ...CommunityDetails
        }
      }
    }
  }
  ${CommunityDetailsFragmentDoc}
`;

/**
 * __useChallengeCommunityQuery__
 *
 * To run a query within a React component, call `useChallengeCommunityQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeCommunityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeCommunityQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useChallengeCommunityQuery(
  baseOptions: Apollo.QueryHookOptions<ChallengeCommunityQuery, ChallengeCommunityQueryVariables>
) {
  return Apollo.useQuery<ChallengeCommunityQuery, ChallengeCommunityQueryVariables>(
    ChallengeCommunityDocument,
    baseOptions
  );
}
export function useChallengeCommunityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<ChallengeCommunityQuery, ChallengeCommunityQueryVariables>
) {
  return Apollo.useLazyQuery<ChallengeCommunityQuery, ChallengeCommunityQueryVariables>(
    ChallengeCommunityDocument,
    baseOptions
  );
}
export type ChallengeCommunityQueryHookResult = ReturnType<typeof useChallengeCommunityQuery>;
export type ChallengeCommunityLazyQueryHookResult = ReturnType<typeof useChallengeCommunityLazyQuery>;
export type ChallengeCommunityQueryResult = Apollo.QueryResult<
  ChallengeCommunityQuery,
  ChallengeCommunityQueryVariables
>;
export const SearchDocument = gql`
  query search($searchData: SearchInput!) {
    search(searchData: $searchData) {
      score
      terms
      result {
        ... on User {
          name
          id
        }
        ... on UserGroup {
          name
          id
        }
        ... on Organisation {
          name
          id
        }
      }
    }
  }
`;

/**
 * __useSearchQuery__
 *
 * To run a query within a React component, call `useSearchQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchQuery({
 *   variables: {
 *      searchData: // value for 'searchData'
 *   },
 * });
 */
export function useSearchQuery(baseOptions: Apollo.QueryHookOptions<SearchQuery, SearchQueryVariables>) {
  return Apollo.useQuery<SearchQuery, SearchQueryVariables>(SearchDocument, baseOptions);
}
export function useSearchLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchQuery, SearchQueryVariables>) {
  return Apollo.useLazyQuery<SearchQuery, SearchQueryVariables>(SearchDocument, baseOptions);
}
export type SearchQueryHookResult = ReturnType<typeof useSearchQuery>;
export type SearchLazyQueryHookResult = ReturnType<typeof useSearchLazyQuery>;
export type SearchQueryResult = Apollo.QueryResult<SearchQuery, SearchQueryVariables>;
export const GroupCardDocument = gql`
  query groupCard($id: String!) {
    ecoverse {
      id
      group(ID: $id) {
        __typename
        name
        parent {
          __typename
          ... on Community {
            name
          }
          ... on Organisation {
            name
          }
        }
        members {
          id
          name
        }
        profile {
          id
          avatar
          description
          references {
            name
            description
          }
          tagsets {
            name
            tags
          }
        }
      }
    }
  }
`;

/**
 * __useGroupCardQuery__
 *
 * To run a query within a React component, call `useGroupCardQuery` and pass it any options that fit your needs.
 * When your component renders, `useGroupCardQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupCardQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGroupCardQuery(baseOptions: Apollo.QueryHookOptions<GroupCardQuery, GroupCardQueryVariables>) {
  return Apollo.useQuery<GroupCardQuery, GroupCardQueryVariables>(GroupCardDocument, baseOptions);
}
export function useGroupCardLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GroupCardQuery, GroupCardQueryVariables>
) {
  return Apollo.useLazyQuery<GroupCardQuery, GroupCardQueryVariables>(GroupCardDocument, baseOptions);
}
export type GroupCardQueryHookResult = ReturnType<typeof useGroupCardQuery>;
export type GroupCardLazyQueryHookResult = ReturnType<typeof useGroupCardLazyQuery>;
export type GroupCardQueryResult = Apollo.QueryResult<GroupCardQuery, GroupCardQueryVariables>;
export const OrganizationCardDocument = gql`
  query organizationCard($id: String!) {
    organisation(ID: $id) {
      id
      name
      groups {
        name
      }
      members {
        id
      }
      profile {
        id
        description
        avatar
      }
    }
  }
`;

/**
 * __useOrganizationCardQuery__
 *
 * To run a query within a React component, call `useOrganizationCardQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrganizationCardQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrganizationCardQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useOrganizationCardQuery(
  baseOptions: Apollo.QueryHookOptions<OrganizationCardQuery, OrganizationCardQueryVariables>
) {
  return Apollo.useQuery<OrganizationCardQuery, OrganizationCardQueryVariables>(OrganizationCardDocument, baseOptions);
}
export function useOrganizationCardLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<OrganizationCardQuery, OrganizationCardQueryVariables>
) {
  return Apollo.useLazyQuery<OrganizationCardQuery, OrganizationCardQueryVariables>(
    OrganizationCardDocument,
    baseOptions
  );
}
export type OrganizationCardQueryHookResult = ReturnType<typeof useOrganizationCardQuery>;
export type OrganizationCardLazyQueryHookResult = ReturnType<typeof useOrganizationCardLazyQuery>;
export type OrganizationCardQueryResult = Apollo.QueryResult<OrganizationCardQuery, OrganizationCardQueryVariables>;
export const ConfigDocument = gql`
  query config {
    configuration {
      authentication {
        enabled
        providers {
          name
          label
          icon
          enabled
          config {
            __typename
            ... on AadAuthProviderConfig {
              msalConfig {
                auth {
                  authority
                  clientId
                  redirectUri
                }
                cache {
                  cacheLocation
                  storeAuthStateInCookie
                }
              }
              apiConfig {
                resourceScope
              }
              loginRequest {
                scopes
              }
              tokenRequest {
                scopes
              }
              silentRequest {
                scopes
              }
            }
            ... on DemoAuthProviderConfig {
              issuer
              tokenEndpoint
            }
          }
        }
      }
    }
  }
`;

/**
 * __useConfigQuery__
 *
 * To run a query within a React component, call `useConfigQuery` and pass it any options that fit your needs.
 * When your component renders, `useConfigQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useConfigQuery({
 *   variables: {
 *   },
 * });
 */
export function useConfigQuery(baseOptions?: Apollo.QueryHookOptions<ConfigQuery, ConfigQueryVariables>) {
  return Apollo.useQuery<ConfigQuery, ConfigQueryVariables>(ConfigDocument, baseOptions);
}
export function useConfigLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ConfigQuery, ConfigQueryVariables>) {
  return Apollo.useLazyQuery<ConfigQuery, ConfigQueryVariables>(ConfigDocument, baseOptions);
}
export type ConfigQueryHookResult = ReturnType<typeof useConfigQuery>;
export type ConfigLazyQueryHookResult = ReturnType<typeof useConfigLazyQuery>;
export type ConfigQueryResult = Apollo.QueryResult<ConfigQuery, ConfigQueryVariables>;
export const EcoverseInfoDocument = gql`
  query ecoverseInfo {
    ecoverse {
      id
      textID
      name
      context {
        tagline
        vision
        impact
        background
        references {
          name
          uri
        }
      }
      community {
        id
        name
      }
    }
  }
`;

/**
 * __useEcoverseInfoQuery__
 *
 * To run a query within a React component, call `useEcoverseInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoverseInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoverseInfoQuery({
 *   variables: {
 *   },
 * });
 */
export function useEcoverseInfoQuery(
  baseOptions?: Apollo.QueryHookOptions<EcoverseInfoQuery, EcoverseInfoQueryVariables>
) {
  return Apollo.useQuery<EcoverseInfoQuery, EcoverseInfoQueryVariables>(EcoverseInfoDocument, baseOptions);
}
export function useEcoverseInfoLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<EcoverseInfoQuery, EcoverseInfoQueryVariables>
) {
  return Apollo.useLazyQuery<EcoverseInfoQuery, EcoverseInfoQueryVariables>(EcoverseInfoDocument, baseOptions);
}
export type EcoverseInfoQueryHookResult = ReturnType<typeof useEcoverseInfoQuery>;
export type EcoverseInfoLazyQueryHookResult = ReturnType<typeof useEcoverseInfoLazyQuery>;
export type EcoverseInfoQueryResult = Apollo.QueryResult<EcoverseInfoQuery, EcoverseInfoQueryVariables>;
export const ChallengesDocument = gql`
  query challenges {
    ecoverse {
      id
      challenges {
        id
        name
        textID
        context {
          tagline
          references {
            name
            uri
          }
        }
      }
    }
  }
`;

/**
 * __useChallengesQuery__
 *
 * To run a query within a React component, call `useChallengesQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengesQuery({
 *   variables: {
 *   },
 * });
 */
export function useChallengesQuery(baseOptions?: Apollo.QueryHookOptions<ChallengesQuery, ChallengesQueryVariables>) {
  return Apollo.useQuery<ChallengesQuery, ChallengesQueryVariables>(ChallengesDocument, baseOptions);
}
export function useChallengesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<ChallengesQuery, ChallengesQueryVariables>
) {
  return Apollo.useLazyQuery<ChallengesQuery, ChallengesQueryVariables>(ChallengesDocument, baseOptions);
}
export type ChallengesQueryHookResult = ReturnType<typeof useChallengesQuery>;
export type ChallengesLazyQueryHookResult = ReturnType<typeof useChallengesLazyQuery>;
export type ChallengesQueryResult = Apollo.QueryResult<ChallengesQuery, ChallengesQueryVariables>;
export const ProjectsDocument = gql`
  query projects {
    ecoverse {
      id
      projects {
        id
        textID
        name
        description
        state
      }
    }
  }
`;

/**
 * __useProjectsQuery__
 *
 * To run a query within a React component, call `useProjectsQuery` and pass it any options that fit your needs.
 * When your component renders, `useProjectsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProjectsQuery({
 *   variables: {
 *   },
 * });
 */
export function useProjectsQuery(baseOptions?: Apollo.QueryHookOptions<ProjectsQuery, ProjectsQueryVariables>) {
  return Apollo.useQuery<ProjectsQuery, ProjectsQueryVariables>(ProjectsDocument, baseOptions);
}
export function useProjectsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProjectsQuery, ProjectsQueryVariables>) {
  return Apollo.useLazyQuery<ProjectsQuery, ProjectsQueryVariables>(ProjectsDocument, baseOptions);
}
export type ProjectsQueryHookResult = ReturnType<typeof useProjectsQuery>;
export type ProjectsLazyQueryHookResult = ReturnType<typeof useProjectsLazyQuery>;
export type ProjectsQueryResult = Apollo.QueryResult<ProjectsQuery, ProjectsQueryVariables>;
export const ProjectsChainHistoryDocument = gql`
  query projectsChainHistory {
    ecoverse {
      id
      challenges {
        name
        textID
        opportunities {
          textID
          projects {
            textID
          }
        }
      }
    }
  }
`;

/**
 * __useProjectsChainHistoryQuery__
 *
 * To run a query within a React component, call `useProjectsChainHistoryQuery` and pass it any options that fit your needs.
 * When your component renders, `useProjectsChainHistoryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProjectsChainHistoryQuery({
 *   variables: {
 *   },
 * });
 */
export function useProjectsChainHistoryQuery(
  baseOptions?: Apollo.QueryHookOptions<ProjectsChainHistoryQuery, ProjectsChainHistoryQueryVariables>
) {
  return Apollo.useQuery<ProjectsChainHistoryQuery, ProjectsChainHistoryQueryVariables>(
    ProjectsChainHistoryDocument,
    baseOptions
  );
}
export function useProjectsChainHistoryLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<ProjectsChainHistoryQuery, ProjectsChainHistoryQueryVariables>
) {
  return Apollo.useLazyQuery<ProjectsChainHistoryQuery, ProjectsChainHistoryQueryVariables>(
    ProjectsChainHistoryDocument,
    baseOptions
  );
}
export type ProjectsChainHistoryQueryHookResult = ReturnType<typeof useProjectsChainHistoryQuery>;
export type ProjectsChainHistoryLazyQueryHookResult = ReturnType<typeof useProjectsChainHistoryLazyQuery>;
export type ProjectsChainHistoryQueryResult = Apollo.QueryResult<
  ProjectsChainHistoryQuery,
  ProjectsChainHistoryQueryVariables
>;
export const OpportunitiesDocument = gql`
  query opportunities {
    ecoverse {
      id
      opportunities {
        id
        textID
      }
    }
  }
`;

/**
 * __useOpportunitiesQuery__
 *
 * To run a query within a React component, call `useOpportunitiesQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunitiesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunitiesQuery({
 *   variables: {
 *   },
 * });
 */
export function useOpportunitiesQuery(
  baseOptions?: Apollo.QueryHookOptions<OpportunitiesQuery, OpportunitiesQueryVariables>
) {
  return Apollo.useQuery<OpportunitiesQuery, OpportunitiesQueryVariables>(OpportunitiesDocument, baseOptions);
}
export function useOpportunitiesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<OpportunitiesQuery, OpportunitiesQueryVariables>
) {
  return Apollo.useLazyQuery<OpportunitiesQuery, OpportunitiesQueryVariables>(OpportunitiesDocument, baseOptions);
}
export type OpportunitiesQueryHookResult = ReturnType<typeof useOpportunitiesQuery>;
export type OpportunitiesLazyQueryHookResult = ReturnType<typeof useOpportunitiesLazyQuery>;
export type OpportunitiesQueryResult = Apollo.QueryResult<OpportunitiesQuery, OpportunitiesQueryVariables>;
export const EcoverseHostReferencesDocument = gql`
  query ecoverseHostReferences {
    ecoverse {
      id
      host {
        profile {
          id
          references {
            name
            uri
          }
        }
      }
    }
  }
`;

/**
 * __useEcoverseHostReferencesQuery__
 *
 * To run a query within a React component, call `useEcoverseHostReferencesQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoverseHostReferencesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoverseHostReferencesQuery({
 *   variables: {
 *   },
 * });
 */
export function useEcoverseHostReferencesQuery(
  baseOptions?: Apollo.QueryHookOptions<EcoverseHostReferencesQuery, EcoverseHostReferencesQueryVariables>
) {
  return Apollo.useQuery<EcoverseHostReferencesQuery, EcoverseHostReferencesQueryVariables>(
    EcoverseHostReferencesDocument,
    baseOptions
  );
}
export function useEcoverseHostReferencesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<EcoverseHostReferencesQuery, EcoverseHostReferencesQueryVariables>
) {
  return Apollo.useLazyQuery<EcoverseHostReferencesQuery, EcoverseHostReferencesQueryVariables>(
    EcoverseHostReferencesDocument,
    baseOptions
  );
}
export type EcoverseHostReferencesQueryHookResult = ReturnType<typeof useEcoverseHostReferencesQuery>;
export type EcoverseHostReferencesLazyQueryHookResult = ReturnType<typeof useEcoverseHostReferencesLazyQuery>;
export type EcoverseHostReferencesQueryResult = Apollo.QueryResult<
  EcoverseHostReferencesQuery,
  EcoverseHostReferencesQueryVariables
>;
export const EcoverseCommunityDocument = gql`
  query ecoverseCommunity {
    ecoverse {
      id
      community {
        ...CommunityDetails
      }
    }
  }
  ${CommunityDetailsFragmentDoc}
`;

/**
 * __useEcoverseCommunityQuery__
 *
 * To run a query within a React component, call `useEcoverseCommunityQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoverseCommunityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoverseCommunityQuery({
 *   variables: {
 *   },
 * });
 */
export function useEcoverseCommunityQuery(
  baseOptions?: Apollo.QueryHookOptions<EcoverseCommunityQuery, EcoverseCommunityQueryVariables>
) {
  return Apollo.useQuery<EcoverseCommunityQuery, EcoverseCommunityQueryVariables>(
    EcoverseCommunityDocument,
    baseOptions
  );
}
export function useEcoverseCommunityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<EcoverseCommunityQuery, EcoverseCommunityQueryVariables>
) {
  return Apollo.useLazyQuery<EcoverseCommunityQuery, EcoverseCommunityQueryVariables>(
    EcoverseCommunityDocument,
    baseOptions
  );
}
export type EcoverseCommunityQueryHookResult = ReturnType<typeof useEcoverseCommunityQuery>;
export type EcoverseCommunityLazyQueryHookResult = ReturnType<typeof useEcoverseCommunityLazyQuery>;
export type EcoverseCommunityQueryResult = Apollo.QueryResult<EcoverseCommunityQuery, EcoverseCommunityQueryVariables>;
export const OpportunityProfileDocument = gql`
  query opportunityProfile($id: String!) {
    ecoverse {
      id
      opportunity(ID: $id) {
        id
        textID
        name
        state
        aspects {
          id
          title
          framing
          explanation
        }
        context {
          id
          tagline
          background
          vision
          impact
          who
          references {
            id
            name
            uri
          }
        }
        community {
          groups {
            name
            members {
              name
            }
          }
        }
        relations {
          id
          actorRole
          actorName
          actorType
          description
          type
        }
        actorGroups {
          id
          name
          description
          actors {
            id
            name
            description
            value
            impact
          }
        }
        projects {
          id
          textID
          name
          description
          state
        }
      }
    }
  }
`;

/**
 * __useOpportunityProfileQuery__
 *
 * To run a query within a React component, call `useOpportunityProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityProfileQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useOpportunityProfileQuery(
  baseOptions: Apollo.QueryHookOptions<OpportunityProfileQuery, OpportunityProfileQueryVariables>
) {
  return Apollo.useQuery<OpportunityProfileQuery, OpportunityProfileQueryVariables>(
    OpportunityProfileDocument,
    baseOptions
  );
}
export function useOpportunityProfileLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<OpportunityProfileQuery, OpportunityProfileQueryVariables>
) {
  return Apollo.useLazyQuery<OpportunityProfileQuery, OpportunityProfileQueryVariables>(
    OpportunityProfileDocument,
    baseOptions
  );
}
export type OpportunityProfileQueryHookResult = ReturnType<typeof useOpportunityProfileQuery>;
export type OpportunityProfileLazyQueryHookResult = ReturnType<typeof useOpportunityProfileLazyQuery>;
export type OpportunityProfileQueryResult = Apollo.QueryResult<
  OpportunityProfileQuery,
  OpportunityProfileQueryVariables
>;
export const CreateRelationDocument = gql`
  mutation createRelation($input: CreateRelationInput!) {
    createRelation(relationData: $input) {
      id
    }
  }
`;
export type CreateRelationMutationFn = Apollo.MutationFunction<CreateRelationMutation, CreateRelationMutationVariables>;

/**
 * __useCreateRelationMutation__
 *
 * To run a mutation, you first call `useCreateRelationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateRelationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createRelationMutation, { data, loading, error }] = useCreateRelationMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateRelationMutation(
  baseOptions?: Apollo.MutationHookOptions<CreateRelationMutation, CreateRelationMutationVariables>
) {
  return Apollo.useMutation<CreateRelationMutation, CreateRelationMutationVariables>(
    CreateRelationDocument,
    baseOptions
  );
}
export type CreateRelationMutationHookResult = ReturnType<typeof useCreateRelationMutation>;
export type CreateRelationMutationResult = Apollo.MutationResult<CreateRelationMutation>;
export type CreateRelationMutationOptions = Apollo.BaseMutationOptions<
  CreateRelationMutation,
  CreateRelationMutationVariables
>;
export const RelationsListDocument = gql`
  query relationsList($id: String!) {
    ecoverse {
      id
      opportunity(ID: $id) {
        relations {
          id
          type
          actorName
          actorType
          actorRole
          description
        }
      }
    }
  }
`;

/**
 * __useRelationsListQuery__
 *
 * To run a query within a React component, call `useRelationsListQuery` and pass it any options that fit your needs.
 * When your component renders, `useRelationsListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRelationsListQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useRelationsListQuery(
  baseOptions: Apollo.QueryHookOptions<RelationsListQuery, RelationsListQueryVariables>
) {
  return Apollo.useQuery<RelationsListQuery, RelationsListQueryVariables>(RelationsListDocument, baseOptions);
}
export function useRelationsListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<RelationsListQuery, RelationsListQueryVariables>
) {
  return Apollo.useLazyQuery<RelationsListQuery, RelationsListQueryVariables>(RelationsListDocument, baseOptions);
}
export type RelationsListQueryHookResult = ReturnType<typeof useRelationsListQuery>;
export type RelationsListLazyQueryHookResult = ReturnType<typeof useRelationsListLazyQuery>;
export type RelationsListQueryResult = Apollo.QueryResult<RelationsListQuery, RelationsListQueryVariables>;
export const CreateActorDocument = gql`
  mutation createActor($input: CreateActorInput!) {
    createActor(actorData: $input) {
      name
    }
  }
`;
export type CreateActorMutationFn = Apollo.MutationFunction<CreateActorMutation, CreateActorMutationVariables>;

/**
 * __useCreateActorMutation__
 *
 * To run a mutation, you first call `useCreateActorMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateActorMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createActorMutation, { data, loading, error }] = useCreateActorMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateActorMutation(
  baseOptions?: Apollo.MutationHookOptions<CreateActorMutation, CreateActorMutationVariables>
) {
  return Apollo.useMutation<CreateActorMutation, CreateActorMutationVariables>(CreateActorDocument, baseOptions);
}
export type CreateActorMutationHookResult = ReturnType<typeof useCreateActorMutation>;
export type CreateActorMutationResult = Apollo.MutationResult<CreateActorMutation>;
export type CreateActorMutationOptions = Apollo.BaseMutationOptions<CreateActorMutation, CreateActorMutationVariables>;
export const OpportunityActorGroupsDocument = gql`
  query opportunityActorGroups($id: String!) {
    ecoverse {
      id
      opportunity(ID: $id) {
        actorGroups {
          id
          name
          description
          actors {
            id
            name
            description
            value
            impact
          }
        }
      }
    }
  }
`;

/**
 * __useOpportunityActorGroupsQuery__
 *
 * To run a query within a React component, call `useOpportunityActorGroupsQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityActorGroupsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityActorGroupsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useOpportunityActorGroupsQuery(
  baseOptions: Apollo.QueryHookOptions<OpportunityActorGroupsQuery, OpportunityActorGroupsQueryVariables>
) {
  return Apollo.useQuery<OpportunityActorGroupsQuery, OpportunityActorGroupsQueryVariables>(
    OpportunityActorGroupsDocument,
    baseOptions
  );
}
export function useOpportunityActorGroupsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<OpportunityActorGroupsQuery, OpportunityActorGroupsQueryVariables>
) {
  return Apollo.useLazyQuery<OpportunityActorGroupsQuery, OpportunityActorGroupsQueryVariables>(
    OpportunityActorGroupsDocument,
    baseOptions
  );
}
export type OpportunityActorGroupsQueryHookResult = ReturnType<typeof useOpportunityActorGroupsQuery>;
export type OpportunityActorGroupsLazyQueryHookResult = ReturnType<typeof useOpportunityActorGroupsLazyQuery>;
export type OpportunityActorGroupsQueryResult = Apollo.QueryResult<
  OpportunityActorGroupsQuery,
  OpportunityActorGroupsQueryVariables
>;
export const UpdateActorDocument = gql`
  mutation updateActor($input: UpdateActorInput!) {
    updateActor(actorData: $input) {
      id
      name
    }
  }
`;
export type UpdateActorMutationFn = Apollo.MutationFunction<UpdateActorMutation, UpdateActorMutationVariables>;

/**
 * __useUpdateActorMutation__
 *
 * To run a mutation, you first call `useUpdateActorMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateActorMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateActorMutation, { data, loading, error }] = useUpdateActorMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateActorMutation(
  baseOptions?: Apollo.MutationHookOptions<UpdateActorMutation, UpdateActorMutationVariables>
) {
  return Apollo.useMutation<UpdateActorMutation, UpdateActorMutationVariables>(UpdateActorDocument, baseOptions);
}
export type UpdateActorMutationHookResult = ReturnType<typeof useUpdateActorMutation>;
export type UpdateActorMutationResult = Apollo.MutationResult<UpdateActorMutation>;
export type UpdateActorMutationOptions = Apollo.BaseMutationOptions<UpdateActorMutation, UpdateActorMutationVariables>;
export const RemoveActorDocument = gql`
  mutation removeActor($input: DeleteActorInput!) {
    deleteActor(deleteData: $input) {
      id
    }
  }
`;
export type RemoveActorMutationFn = Apollo.MutationFunction<RemoveActorMutation, RemoveActorMutationVariables>;

/**
 * __useRemoveActorMutation__
 *
 * To run a mutation, you first call `useRemoveActorMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveActorMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeActorMutation, { data, loading, error }] = useRemoveActorMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRemoveActorMutation(
  baseOptions?: Apollo.MutationHookOptions<RemoveActorMutation, RemoveActorMutationVariables>
) {
  return Apollo.useMutation<RemoveActorMutation, RemoveActorMutationVariables>(RemoveActorDocument, baseOptions);
}
export type RemoveActorMutationHookResult = ReturnType<typeof useRemoveActorMutation>;
export type RemoveActorMutationResult = Apollo.MutationResult<RemoveActorMutation>;
export type RemoveActorMutationOptions = Apollo.BaseMutationOptions<RemoveActorMutation, RemoveActorMutationVariables>;
export const RemoveRelationDocument = gql`
  mutation removeRelation($input: DeleteRelationInput!) {
    deleteRelation(deleteData: $input) {
      id
    }
  }
`;
export type RemoveRelationMutationFn = Apollo.MutationFunction<RemoveRelationMutation, RemoveRelationMutationVariables>;

/**
 * __useRemoveRelationMutation__
 *
 * To run a mutation, you first call `useRemoveRelationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveRelationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeRelationMutation, { data, loading, error }] = useRemoveRelationMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRemoveRelationMutation(
  baseOptions?: Apollo.MutationHookOptions<RemoveRelationMutation, RemoveRelationMutationVariables>
) {
  return Apollo.useMutation<RemoveRelationMutation, RemoveRelationMutationVariables>(
    RemoveRelationDocument,
    baseOptions
  );
}
export type RemoveRelationMutationHookResult = ReturnType<typeof useRemoveRelationMutation>;
export type RemoveRelationMutationResult = Apollo.MutationResult<RemoveRelationMutation>;
export type RemoveRelationMutationOptions = Apollo.BaseMutationOptions<
  RemoveRelationMutation,
  RemoveRelationMutationVariables
>;
export const QueryOpportunityRelationsDocument = gql`
  query queryOpportunityRelations($id: String!) {
    ecoverse {
      id
      opportunity(ID: $id) {
        relations {
          actorRole
          actorName
          actorType
          description
          type
        }
      }
    }
  }
`;

/**
 * __useQueryOpportunityRelationsQuery__
 *
 * To run a query within a React component, call `useQueryOpportunityRelationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useQueryOpportunityRelationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useQueryOpportunityRelationsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useQueryOpportunityRelationsQuery(
  baseOptions: Apollo.QueryHookOptions<QueryOpportunityRelationsQuery, QueryOpportunityRelationsQueryVariables>
) {
  return Apollo.useQuery<QueryOpportunityRelationsQuery, QueryOpportunityRelationsQueryVariables>(
    QueryOpportunityRelationsDocument,
    baseOptions
  );
}
export function useQueryOpportunityRelationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<QueryOpportunityRelationsQuery, QueryOpportunityRelationsQueryVariables>
) {
  return Apollo.useLazyQuery<QueryOpportunityRelationsQuery, QueryOpportunityRelationsQueryVariables>(
    QueryOpportunityRelationsDocument,
    baseOptions
  );
}
export type QueryOpportunityRelationsQueryHookResult = ReturnType<typeof useQueryOpportunityRelationsQuery>;
export type QueryOpportunityRelationsLazyQueryHookResult = ReturnType<typeof useQueryOpportunityRelationsLazyQuery>;
export type QueryOpportunityRelationsQueryResult = Apollo.QueryResult<
  QueryOpportunityRelationsQuery,
  QueryOpportunityRelationsQueryVariables
>;
export const UpdateAspectDocument = gql`
  mutation updateAspect($input: UpdateAspectInput!) {
    updateAspect(aspectData: $input) {
      id
      title
    }
  }
`;
export type UpdateAspectMutationFn = Apollo.MutationFunction<UpdateAspectMutation, UpdateAspectMutationVariables>;

/**
 * __useUpdateAspectMutation__
 *
 * To run a mutation, you first call `useUpdateAspectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAspectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAspectMutation, { data, loading, error }] = useUpdateAspectMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateAspectMutation(
  baseOptions?: Apollo.MutationHookOptions<UpdateAspectMutation, UpdateAspectMutationVariables>
) {
  return Apollo.useMutation<UpdateAspectMutation, UpdateAspectMutationVariables>(UpdateAspectDocument, baseOptions);
}
export type UpdateAspectMutationHookResult = ReturnType<typeof useUpdateAspectMutation>;
export type UpdateAspectMutationResult = Apollo.MutationResult<UpdateAspectMutation>;
export type UpdateAspectMutationOptions = Apollo.BaseMutationOptions<
  UpdateAspectMutation,
  UpdateAspectMutationVariables
>;
export const OpportunityAspectsDocument = gql`
  query opportunityAspects($id: String!) {
    ecoverse {
      id
      opportunity(ID: $id) {
        aspects {
          title
          framing
          explanation
        }
      }
    }
  }
`;

/**
 * __useOpportunityAspectsQuery__
 *
 * To run a query within a React component, call `useOpportunityAspectsQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityAspectsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityAspectsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useOpportunityAspectsQuery(
  baseOptions: Apollo.QueryHookOptions<OpportunityAspectsQuery, OpportunityAspectsQueryVariables>
) {
  return Apollo.useQuery<OpportunityAspectsQuery, OpportunityAspectsQueryVariables>(
    OpportunityAspectsDocument,
    baseOptions
  );
}
export function useOpportunityAspectsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<OpportunityAspectsQuery, OpportunityAspectsQueryVariables>
) {
  return Apollo.useLazyQuery<OpportunityAspectsQuery, OpportunityAspectsQueryVariables>(
    OpportunityAspectsDocument,
    baseOptions
  );
}
export type OpportunityAspectsQueryHookResult = ReturnType<typeof useOpportunityAspectsQuery>;
export type OpportunityAspectsLazyQueryHookResult = ReturnType<typeof useOpportunityAspectsLazyQuery>;
export type OpportunityAspectsQueryResult = Apollo.QueryResult<
  OpportunityAspectsQuery,
  OpportunityAspectsQueryVariables
>;
export const RemoveAspectDocument = gql`
  mutation removeAspect($input: DeleteAspectInput!) {
    deleteAspect(deleteData: $input) {
      id
    }
  }
`;
export type RemoveAspectMutationFn = Apollo.MutationFunction<RemoveAspectMutation, RemoveAspectMutationVariables>;

/**
 * __useRemoveAspectMutation__
 *
 * To run a mutation, you first call `useRemoveAspectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveAspectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeAspectMutation, { data, loading, error }] = useRemoveAspectMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRemoveAspectMutation(
  baseOptions?: Apollo.MutationHookOptions<RemoveAspectMutation, RemoveAspectMutationVariables>
) {
  return Apollo.useMutation<RemoveAspectMutation, RemoveAspectMutationVariables>(RemoveAspectDocument, baseOptions);
}
export type RemoveAspectMutationHookResult = ReturnType<typeof useRemoveAspectMutation>;
export type RemoveAspectMutationResult = Apollo.MutationResult<RemoveAspectMutation>;
export type RemoveAspectMutationOptions = Apollo.BaseMutationOptions<
  RemoveAspectMutation,
  RemoveAspectMutationVariables
>;
export const OpportunityTemplateDocument = gql`
  query opportunityTemplate {
    configuration {
      template {
        opportunities {
          aspects
          actorGroups
        }
      }
    }
  }
`;

/**
 * __useOpportunityTemplateQuery__
 *
 * To run a query within a React component, call `useOpportunityTemplateQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityTemplateQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityTemplateQuery({
 *   variables: {
 *   },
 * });
 */
export function useOpportunityTemplateQuery(
  baseOptions?: Apollo.QueryHookOptions<OpportunityTemplateQuery, OpportunityTemplateQueryVariables>
) {
  return Apollo.useQuery<OpportunityTemplateQuery, OpportunityTemplateQueryVariables>(
    OpportunityTemplateDocument,
    baseOptions
  );
}
export function useOpportunityTemplateLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<OpportunityTemplateQuery, OpportunityTemplateQueryVariables>
) {
  return Apollo.useLazyQuery<OpportunityTemplateQuery, OpportunityTemplateQueryVariables>(
    OpportunityTemplateDocument,
    baseOptions
  );
}
export type OpportunityTemplateQueryHookResult = ReturnType<typeof useOpportunityTemplateQuery>;
export type OpportunityTemplateLazyQueryHookResult = ReturnType<typeof useOpportunityTemplateLazyQuery>;
export type OpportunityTemplateQueryResult = Apollo.QueryResult<
  OpportunityTemplateQuery,
  OpportunityTemplateQueryVariables
>;
export const CreateAspectDocument = gql`
  mutation createAspect($input: CreateAspectInput!) {
    createAspect(aspectData: $input) {
      title
    }
  }
`;
export type CreateAspectMutationFn = Apollo.MutationFunction<CreateAspectMutation, CreateAspectMutationVariables>;

/**
 * __useCreateAspectMutation__
 *
 * To run a mutation, you first call `useCreateAspectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateAspectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createAspectMutation, { data, loading, error }] = useCreateAspectMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateAspectMutation(
  baseOptions?: Apollo.MutationHookOptions<CreateAspectMutation, CreateAspectMutationVariables>
) {
  return Apollo.useMutation<CreateAspectMutation, CreateAspectMutationVariables>(CreateAspectDocument, baseOptions);
}
export type CreateAspectMutationHookResult = ReturnType<typeof useCreateAspectMutation>;
export type CreateAspectMutationResult = Apollo.MutationResult<CreateAspectMutation>;
export type CreateAspectMutationOptions = Apollo.BaseMutationOptions<
  CreateAspectMutation,
  CreateAspectMutationVariables
>;
export const CreateActorGroupDocument = gql`
  mutation createActorGroup($input: CreateActorGroupInput!) {
    createActorGroup(actorGroupData: $input) {
      name
    }
  }
`;
export type CreateActorGroupMutationFn = Apollo.MutationFunction<
  CreateActorGroupMutation,
  CreateActorGroupMutationVariables
>;

/**
 * __useCreateActorGroupMutation__
 *
 * To run a mutation, you first call `useCreateActorGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateActorGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createActorGroupMutation, { data, loading, error }] = useCreateActorGroupMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateActorGroupMutation(
  baseOptions?: Apollo.MutationHookOptions<CreateActorGroupMutation, CreateActorGroupMutationVariables>
) {
  return Apollo.useMutation<CreateActorGroupMutation, CreateActorGroupMutationVariables>(
    CreateActorGroupDocument,
    baseOptions
  );
}
export type CreateActorGroupMutationHookResult = ReturnType<typeof useCreateActorGroupMutation>;
export type CreateActorGroupMutationResult = Apollo.MutationResult<CreateActorGroupMutation>;
export type CreateActorGroupMutationOptions = Apollo.BaseMutationOptions<
  CreateActorGroupMutation,
  CreateActorGroupMutationVariables
>;
export const RemoveReferenceDocument = gql`
  mutation removeReference($input: DeleteReferenceInput!) {
    deleteReference(deleteData: $input) {
      id
    }
  }
`;
export type RemoveReferenceMutationFn = Apollo.MutationFunction<
  RemoveReferenceMutation,
  RemoveReferenceMutationVariables
>;

/**
 * __useRemoveReferenceMutation__
 *
 * To run a mutation, you first call `useRemoveReferenceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveReferenceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeReferenceMutation, { data, loading, error }] = useRemoveReferenceMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRemoveReferenceMutation(
  baseOptions?: Apollo.MutationHookOptions<RemoveReferenceMutation, RemoveReferenceMutationVariables>
) {
  return Apollo.useMutation<RemoveReferenceMutation, RemoveReferenceMutationVariables>(
    RemoveReferenceDocument,
    baseOptions
  );
}
export type RemoveReferenceMutationHookResult = ReturnType<typeof useRemoveReferenceMutation>;
export type RemoveReferenceMutationResult = Apollo.MutationResult<RemoveReferenceMutation>;
export type RemoveReferenceMutationOptions = Apollo.BaseMutationOptions<
  RemoveReferenceMutation,
  RemoveReferenceMutationVariables
>;
export const RemoveOpportunityDocument = gql`
  mutation removeOpportunity($input: DeleteOpportunityInput!) {
    deleteOpportunity(deleteData: $input) {
      id
    }
  }
`;
export type RemoveOpportunityMutationFn = Apollo.MutationFunction<
  RemoveOpportunityMutation,
  RemoveOpportunityMutationVariables
>;

/**
 * __useRemoveOpportunityMutation__
 *
 * To run a mutation, you first call `useRemoveOpportunityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveOpportunityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeOpportunityMutation, { data, loading, error }] = useRemoveOpportunityMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRemoveOpportunityMutation(
  baseOptions?: Apollo.MutationHookOptions<RemoveOpportunityMutation, RemoveOpportunityMutationVariables>
) {
  return Apollo.useMutation<RemoveOpportunityMutation, RemoveOpportunityMutationVariables>(
    RemoveOpportunityDocument,
    baseOptions
  );
}
export type RemoveOpportunityMutationHookResult = ReturnType<typeof useRemoveOpportunityMutation>;
export type RemoveOpportunityMutationResult = Apollo.MutationResult<RemoveOpportunityMutation>;
export type RemoveOpportunityMutationOptions = Apollo.BaseMutationOptions<
  RemoveOpportunityMutation,
  RemoveOpportunityMutationVariables
>;
export const OpportunityCommunityDocument = gql`
  query opportunityCommunity($id: String!) {
    ecoverse {
      id
      opportunity(ID: $id) {
        id
        name
        community {
          ...CommunityDetails
        }
      }
    }
  }
  ${CommunityDetailsFragmentDoc}
`;

/**
 * __useOpportunityCommunityQuery__
 *
 * To run a query within a React component, call `useOpportunityCommunityQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityCommunityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityCommunityQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useOpportunityCommunityQuery(
  baseOptions: Apollo.QueryHookOptions<OpportunityCommunityQuery, OpportunityCommunityQueryVariables>
) {
  return Apollo.useQuery<OpportunityCommunityQuery, OpportunityCommunityQueryVariables>(
    OpportunityCommunityDocument,
    baseOptions
  );
}
export function useOpportunityCommunityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<OpportunityCommunityQuery, OpportunityCommunityQueryVariables>
) {
  return Apollo.useLazyQuery<OpportunityCommunityQuery, OpportunityCommunityQueryVariables>(
    OpportunityCommunityDocument,
    baseOptions
  );
}
export type OpportunityCommunityQueryHookResult = ReturnType<typeof useOpportunityCommunityQuery>;
export type OpportunityCommunityLazyQueryHookResult = ReturnType<typeof useOpportunityCommunityLazyQuery>;
export type OpportunityCommunityQueryResult = Apollo.QueryResult<
  OpportunityCommunityQuery,
  OpportunityCommunityQueryVariables
>;
export const UploadAvatarDocument = gql`
  mutation uploadAvatar($file: Upload!, $input: UploadProfileAvatarInput!) {
    uploadAvatar(file: $file, uploadData: $input) {
      ...Avatar
    }
  }
  ${AvatarFragmentDoc}
`;
export type UploadAvatarMutationFn = Apollo.MutationFunction<UploadAvatarMutation, UploadAvatarMutationVariables>;

/**
 * __useUploadAvatarMutation__
 *
 * To run a mutation, you first call `useUploadAvatarMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUploadAvatarMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [uploadAvatarMutation, { data, loading, error }] = useUploadAvatarMutation({
 *   variables: {
 *      file: // value for 'file'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUploadAvatarMutation(
  baseOptions?: Apollo.MutationHookOptions<UploadAvatarMutation, UploadAvatarMutationVariables>
) {
  return Apollo.useMutation<UploadAvatarMutation, UploadAvatarMutationVariables>(UploadAvatarDocument, baseOptions);
}
export type UploadAvatarMutationHookResult = ReturnType<typeof useUploadAvatarMutation>;
export type UploadAvatarMutationResult = Apollo.MutationResult<UploadAvatarMutation>;
export type UploadAvatarMutationOptions = Apollo.BaseMutationOptions<
  UploadAvatarMutation,
  UploadAvatarMutationVariables
>;
export const ProjectProfileDocument = gql`
  query projectProfile($id: String!) {
    ecoverse {
      id
      project(ID: $id) {
        ...ProjectDetails
      }
    }
  }
  ${ProjectDetailsFragmentDoc}
`;

/**
 * __useProjectProfileQuery__
 *
 * To run a query within a React component, call `useProjectProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useProjectProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProjectProfileQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useProjectProfileQuery(
  baseOptions: Apollo.QueryHookOptions<ProjectProfileQuery, ProjectProfileQueryVariables>
) {
  return Apollo.useQuery<ProjectProfileQuery, ProjectProfileQueryVariables>(ProjectProfileDocument, baseOptions);
}
export function useProjectProfileLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<ProjectProfileQuery, ProjectProfileQueryVariables>
) {
  return Apollo.useLazyQuery<ProjectProfileQuery, ProjectProfileQueryVariables>(ProjectProfileDocument, baseOptions);
}
export type ProjectProfileQueryHookResult = ReturnType<typeof useProjectProfileQuery>;
export type ProjectProfileLazyQueryHookResult = ReturnType<typeof useProjectProfileLazyQuery>;
export type ProjectProfileQueryResult = Apollo.QueryResult<ProjectProfileQuery, ProjectProfileQueryVariables>;
export const CreateProjectDocument = gql`
  mutation createProject($input: CreateProjectInput!) {
    createProject(projectData: $input) {
      ...ProjectDetails
    }
  }
  ${ProjectDetailsFragmentDoc}
`;
export type CreateProjectMutationFn = Apollo.MutationFunction<CreateProjectMutation, CreateProjectMutationVariables>;

/**
 * __useCreateProjectMutation__
 *
 * To run a mutation, you first call `useCreateProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createProjectMutation, { data, loading, error }] = useCreateProjectMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateProjectMutation(
  baseOptions?: Apollo.MutationHookOptions<CreateProjectMutation, CreateProjectMutationVariables>
) {
  return Apollo.useMutation<CreateProjectMutation, CreateProjectMutationVariables>(CreateProjectDocument, baseOptions);
}
export type CreateProjectMutationHookResult = ReturnType<typeof useCreateProjectMutation>;
export type CreateProjectMutationResult = Apollo.MutationResult<CreateProjectMutation>;
export type CreateProjectMutationOptions = Apollo.BaseMutationOptions<
  CreateProjectMutation,
  CreateProjectMutationVariables
>;
export const UsersDocument = gql`
  query users {
    users {
      ...UserDetails
    }
  }
  ${UserDetailsFragmentDoc}
`;

/**
 * __useUsersQuery__
 *
 * To run a query within a React component, call `useUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUsersQuery({
 *   variables: {
 *   },
 * });
 */
export function useUsersQuery(baseOptions?: Apollo.QueryHookOptions<UsersQuery, UsersQueryVariables>) {
  return Apollo.useQuery<UsersQuery, UsersQueryVariables>(UsersDocument, baseOptions);
}
export function useUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UsersQuery, UsersQueryVariables>) {
  return Apollo.useLazyQuery<UsersQuery, UsersQueryVariables>(UsersDocument, baseOptions);
}
export type UsersQueryHookResult = ReturnType<typeof useUsersQuery>;
export type UsersLazyQueryHookResult = ReturnType<typeof useUsersLazyQuery>;
export type UsersQueryResult = Apollo.QueryResult<UsersQuery, UsersQueryVariables>;
export const UserDocument = gql`
  query user($id: String!) {
    user(ID: $id) {
      ...UserDetails
      ...UserMembers
    }
  }
  ${UserDetailsFragmentDoc}
  ${UserMembersFragmentDoc}
`;

/**
 * __useUserQuery__
 *
 * To run a query within a React component, call `useUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useUserQuery(baseOptions: Apollo.QueryHookOptions<UserQuery, UserQueryVariables>) {
  return Apollo.useQuery<UserQuery, UserQueryVariables>(UserDocument, baseOptions);
}
export function useUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UserQuery, UserQueryVariables>) {
  return Apollo.useLazyQuery<UserQuery, UserQueryVariables>(UserDocument, baseOptions);
}
export type UserQueryHookResult = ReturnType<typeof useUserQuery>;
export type UserLazyQueryHookResult = ReturnType<typeof useUserLazyQuery>;
export type UserQueryResult = Apollo.QueryResult<UserQuery, UserQueryVariables>;
export const EcoverseUserIdsDocument = gql`
  query ecoverseUserIds {
    users {
      id
    }
  }
`;

/**
 * __useEcoverseUserIdsQuery__
 *
 * To run a query within a React component, call `useEcoverseUserIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoverseUserIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoverseUserIdsQuery({
 *   variables: {
 *   },
 * });
 */
export function useEcoverseUserIdsQuery(
  baseOptions?: Apollo.QueryHookOptions<EcoverseUserIdsQuery, EcoverseUserIdsQueryVariables>
) {
  return Apollo.useQuery<EcoverseUserIdsQuery, EcoverseUserIdsQueryVariables>(EcoverseUserIdsDocument, baseOptions);
}
export function useEcoverseUserIdsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<EcoverseUserIdsQuery, EcoverseUserIdsQueryVariables>
) {
  return Apollo.useLazyQuery<EcoverseUserIdsQuery, EcoverseUserIdsQueryVariables>(EcoverseUserIdsDocument, baseOptions);
}
export type EcoverseUserIdsQueryHookResult = ReturnType<typeof useEcoverseUserIdsQuery>;
export type EcoverseUserIdsLazyQueryHookResult = ReturnType<typeof useEcoverseUserIdsLazyQuery>;
export type EcoverseUserIdsQueryResult = Apollo.QueryResult<EcoverseUserIdsQuery, EcoverseUserIdsQueryVariables>;
export const ChallengeUserIdsDocument = gql`
  query challengeUserIds($id: String!) {
    ecoverse {
      id
      challenge(ID: $id) {
        community {
          members {
            id
          }
        }
      }
    }
  }
`;

/**
 * __useChallengeUserIdsQuery__
 *
 * To run a query within a React component, call `useChallengeUserIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeUserIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeUserIdsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useChallengeUserIdsQuery(
  baseOptions: Apollo.QueryHookOptions<ChallengeUserIdsQuery, ChallengeUserIdsQueryVariables>
) {
  return Apollo.useQuery<ChallengeUserIdsQuery, ChallengeUserIdsQueryVariables>(ChallengeUserIdsDocument, baseOptions);
}
export function useChallengeUserIdsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<ChallengeUserIdsQuery, ChallengeUserIdsQueryVariables>
) {
  return Apollo.useLazyQuery<ChallengeUserIdsQuery, ChallengeUserIdsQueryVariables>(
    ChallengeUserIdsDocument,
    baseOptions
  );
}
export type ChallengeUserIdsQueryHookResult = ReturnType<typeof useChallengeUserIdsQuery>;
export type ChallengeUserIdsLazyQueryHookResult = ReturnType<typeof useChallengeUserIdsLazyQuery>;
export type ChallengeUserIdsQueryResult = Apollo.QueryResult<ChallengeUserIdsQuery, ChallengeUserIdsQueryVariables>;
export const OpportunityUserIdsDocument = gql`
  query opportunityUserIds($id: String!) {
    ecoverse {
      id
      opportunity(ID: $id) {
        community {
          members {
            id
          }
        }
      }
    }
  }
`;

/**
 * __useOpportunityUserIdsQuery__
 *
 * To run a query within a React component, call `useOpportunityUserIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useOpportunityUserIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOpportunityUserIdsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useOpportunityUserIdsQuery(
  baseOptions: Apollo.QueryHookOptions<OpportunityUserIdsQuery, OpportunityUserIdsQueryVariables>
) {
  return Apollo.useQuery<OpportunityUserIdsQuery, OpportunityUserIdsQueryVariables>(
    OpportunityUserIdsDocument,
    baseOptions
  );
}
export function useOpportunityUserIdsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<OpportunityUserIdsQuery, OpportunityUserIdsQueryVariables>
) {
  return Apollo.useLazyQuery<OpportunityUserIdsQuery, OpportunityUserIdsQueryVariables>(
    OpportunityUserIdsDocument,
    baseOptions
  );
}
export type OpportunityUserIdsQueryHookResult = ReturnType<typeof useOpportunityUserIdsQuery>;
export type OpportunityUserIdsLazyQueryHookResult = ReturnType<typeof useOpportunityUserIdsLazyQuery>;
export type OpportunityUserIdsQueryResult = Apollo.QueryResult<
  OpportunityUserIdsQuery,
  OpportunityUserIdsQueryVariables
>;
export const UserAvatarsDocument = gql`
  query userAvatars($ids: [String!]!) {
    usersById(IDs: $ids) {
      id
      name
      profile {
        id
        avatar
      }
    }
  }
`;

/**
 * __useUserAvatarsQuery__
 *
 * To run a query within a React component, call `useUserAvatarsQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserAvatarsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserAvatarsQuery({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useUserAvatarsQuery(baseOptions: Apollo.QueryHookOptions<UserAvatarsQuery, UserAvatarsQueryVariables>) {
  return Apollo.useQuery<UserAvatarsQuery, UserAvatarsQueryVariables>(UserAvatarsDocument, baseOptions);
}
export function useUserAvatarsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<UserAvatarsQuery, UserAvatarsQueryVariables>
) {
  return Apollo.useLazyQuery<UserAvatarsQuery, UserAvatarsQueryVariables>(UserAvatarsDocument, baseOptions);
}
export type UserAvatarsQueryHookResult = ReturnType<typeof useUserAvatarsQuery>;
export type UserAvatarsLazyQueryHookResult = ReturnType<typeof useUserAvatarsLazyQuery>;
export type UserAvatarsQueryResult = Apollo.QueryResult<UserAvatarsQuery, UserAvatarsQueryVariables>;
export const UserProfileDocument = gql`
  query userProfile {
    me {
      ...UserDetails
      ...UserMembers
    }
  }
  ${UserDetailsFragmentDoc}
  ${UserMembersFragmentDoc}
`;

/**
 * __useUserProfileQuery__
 *
 * To run a query within a React component, call `useUserProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserProfileQuery({
 *   variables: {
 *   },
 * });
 */
export function useUserProfileQuery(
  baseOptions?: Apollo.QueryHookOptions<UserProfileQuery, UserProfileQueryVariables>
) {
  return Apollo.useQuery<UserProfileQuery, UserProfileQueryVariables>(UserProfileDocument, baseOptions);
}
export function useUserProfileLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<UserProfileQuery, UserProfileQueryVariables>
) {
  return Apollo.useLazyQuery<UserProfileQuery, UserProfileQueryVariables>(UserProfileDocument, baseOptions);
}
export type UserProfileQueryHookResult = ReturnType<typeof useUserProfileQuery>;
export type UserProfileLazyQueryHookResult = ReturnType<typeof useUserProfileLazyQuery>;
export type UserProfileQueryResult = Apollo.QueryResult<UserProfileQuery, UserProfileQueryVariables>;
export const UserCardDataDocument = gql`
  query userCardData($ids: [String!]!) {
    usersById(IDs: $ids) {
      __typename
      memberof {
        communities {
          name
        }
        organisations {
          name
        }
      }
      ...UserDetails
    }
  }
  ${UserDetailsFragmentDoc}
`;

/**
 * __useUserCardDataQuery__
 *
 * To run a query within a React component, call `useUserCardDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserCardDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserCardDataQuery({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useUserCardDataQuery(
  baseOptions: Apollo.QueryHookOptions<UserCardDataQuery, UserCardDataQueryVariables>
) {
  return Apollo.useQuery<UserCardDataQuery, UserCardDataQueryVariables>(UserCardDataDocument, baseOptions);
}
export function useUserCardDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<UserCardDataQuery, UserCardDataQueryVariables>
) {
  return Apollo.useLazyQuery<UserCardDataQuery, UserCardDataQueryVariables>(UserCardDataDocument, baseOptions);
}
export type UserCardDataQueryHookResult = ReturnType<typeof useUserCardDataQuery>;
export type UserCardDataLazyQueryHookResult = ReturnType<typeof useUserCardDataLazyQuery>;
export type UserCardDataQueryResult = Apollo.QueryResult<UserCardDataQuery, UserCardDataQueryVariables>;
export const AddUserToCommunityDocument = gql`
  mutation addUserToCommunity($membershipData: AssignCommunityMemberInput!) {
    assignUserToCommunity(membershipData: $membershipData) {
      id
      name
    }
  }
`;
export type AddUserToCommunityMutationFn = Apollo.MutationFunction<
  AddUserToCommunityMutation,
  AddUserToCommunityMutationVariables
>;

/**
 * __useAddUserToCommunityMutation__
 *
 * To run a mutation, you first call `useAddUserToCommunityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddUserToCommunityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addUserToCommunityMutation, { data, loading, error }] = useAddUserToCommunityMutation({
 *   variables: {
 *      membershipData: // value for 'membershipData'
 *   },
 * });
 */
export function useAddUserToCommunityMutation(
  baseOptions?: Apollo.MutationHookOptions<AddUserToCommunityMutation, AddUserToCommunityMutationVariables>
) {
  return Apollo.useMutation<AddUserToCommunityMutation, AddUserToCommunityMutationVariables>(
    AddUserToCommunityDocument,
    baseOptions
  );
}
export type AddUserToCommunityMutationHookResult = ReturnType<typeof useAddUserToCommunityMutation>;
export type AddUserToCommunityMutationResult = Apollo.MutationResult<AddUserToCommunityMutation>;
export type AddUserToCommunityMutationOptions = Apollo.BaseMutationOptions<
  AddUserToCommunityMutation,
  AddUserToCommunityMutationVariables
>;
