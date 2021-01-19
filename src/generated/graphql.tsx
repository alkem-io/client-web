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
};

export type AadConfig = {
  __typename?: 'AadConfig';
  /** Config for accessing the Cherrytwist API. */
  apiConfig: ApiConfig;
  /** Is the client and server authentication enabled? */
  authEnabled: Scalars['Boolean'];
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

export type ActorGroupInput = {
  description?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
};

export type ActorInput = {
  description?: Maybe<Scalars['String']>;
  impact?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

export type ApiConfig = {
  __typename?: 'ApiConfig';
  /** Configuration payload for the Cherrytwist API. */
  resourceScope: Scalars['String'];
};

export type Aspect = {
  __typename?: 'Aspect';
  explanation: Scalars['String'];
  framing: Scalars['String'];
  id: Scalars['ID'];
  title: Scalars['String'];
};

export type AspectInput = {
  explanation?: Maybe<Scalars['String']>;
  framing?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};

export type Challenge = {
  __typename?: 'Challenge';
  /** The shared understanding for the challenge */
  context?: Maybe<Context>;
  /** All users that are contributing to this challenge. */
  contributors?: Maybe<Array<User>>;
  /** Groups of users related to a challenge. */
  groups?: Maybe<Array<UserGroup>>;
  id: Scalars['ID'];
  /** The leads for the challenge. The focal point for the user group is the primary challenge lead. */
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

export type ChallengeInput = {
  context?: Maybe<ContextInput>;
  name?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
  tags?: Maybe<Array<Scalars['String']>>;
  textID?: Maybe<Scalars['String']>;
};

export type Config = {
  __typename?: 'Config';
  /** Cherrytwist Template. */
  template: Template;
  /** Cherrytwist Web Client Config. */
  webClient: WebClientConfig;
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

export type ContextInput = {
  background?: Maybe<Scalars['String']>;
  impact?: Maybe<Scalars['String']>;
  /** Set of references to _replace_ the existing references */
  references?: Maybe<Array<ReferenceInput>>;
  tagline?: Maybe<Scalars['String']>;
  vision?: Maybe<Scalars['String']>;
  who?: Maybe<Scalars['String']>;
};

export type Ecoverse = {
  __typename?: 'Ecoverse';
  /** The Challenges hosted by the Ecoverse */
  challenges?: Maybe<Array<Challenge>>;
  /** The shared understanding for the Ecoverse */
  context?: Maybe<Context>;
  /** The set of groups at the Ecoverse level */
  groups?: Maybe<Array<UserGroup>>;
  /** The organisation that hosts this Ecoverse instance */
  host?: Maybe<Organisation>;
  id: Scalars['ID'];
  name: Scalars['String'];
  /** The set of partner organisations associated with this Ecoverse */
  organisations?: Maybe<Array<Organisation>>;
  /** The set of tags for the ecoverse */
  tagset?: Maybe<Tagset>;
};

export type EcoverseInput = {
  /** Updated context for the ecoverse; will be merged with existing context */
  context?: Maybe<ContextInput>;
  /** The new name for the ecoverse */
  name?: Maybe<Scalars['String']>;
  /** The set of tags to apply to this ecoverse */
  tags?: Maybe<Array<Scalars['String']>>;
};

export type MemberOf = {
  __typename?: 'MemberOf';
  /** References to the challenges the user is a member of */
  challenges: Array<Challenge>;
  /** References to the groups the user is in at the ecoverse level */
  groups: Array<UserGroup>;
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
  /** Adds the specified organisation as a lead for the specified challenge */
  addChallengeLead: Scalars['Boolean'];
  /** Add the provided tag to the tagset with the given ID */
  addTagToTagset: Tagset;
  /** Adds the user with the given identifier as a member of the specified challenge */
  addUserToChallenge: UserGroup;
  /** Adds the user with the given identifier to the specified user group */
  addUserToGroup: Scalars['Boolean'];
  /** Adds the user with the given identifier as a member of the specified opportunity */
  addUserToOpportunity: UserGroup;
  /** Assign the user with the given ID as focal point for the given group */
  assignGroupFocalPoint?: Maybe<UserGroup>;
  /** Create a new actor on the ActorGroup with the specified ID */
  createActor: Actor;
  /** Create a new actor group on the Opportunity identified by the ID */
  createActorGroup: ActorGroup;
  /** Create a new aspect on the Opportunity identified by the ID */
  createAspect: Aspect;
  /** Create a new aspect on the Project identified by the ID */
  createAspectOnProject: Aspect;
  /** Creates a new challenge and registers it with the ecoverse */
  createChallenge: Challenge;
  /** Creates a new user group for the challenge with the given id */
  createGroupOnChallenge: UserGroup;
  /** Creates a new user group at the ecoverse level */
  createGroupOnEcoverse: UserGroup;
  /** Creates a new user group for the opportunity with the given id */
  createGroupOnOpportunity: UserGroup;
  /** Creates a new user group for the organisation with the given id */
  createGroupOnOrganisation: UserGroup;
  /** Creates a new Opportunity for the challenge with the given id */
  createOpportunityOnChallenge: Opportunity;
  /** Creates a new organisation and registers it with the ecoverse */
  createOrganisation: Organisation;
  /** Create a new Project on the Opportunity identified by the ID */
  createProject: Project;
  /** Creates a new reference with the specified name for the context with given id */
  createReferenceOnContext: Reference;
  /** Creates a new reference with the specified name for the profile with given id */
  createReferenceOnProfile: Reference;
  /** Create a new relation on the Opportunity identified by the ID */
  createRelation: Relation;
  /** Creates a new tagset with the specified name for the profile with given id */
  createTagsetOnProfile: Tagset;
  /** Creates a new user as a member of the ecoverse, including an account if enabled */
  createUser: User;
  /** Creates a new account on the identity provider for the user profile with the given ID and with the given one time password */
  createUserAccount: Scalars['Boolean'];
  /** Creates a new user as a member of the ecoverse, without an account */
  createUserProfile: User;
  /** Removes the actor  with the specified ID */
  removeActor: Scalars['Boolean'];
  /** Removes the actor group with the specified ID */
  removeActorGroup: Scalars['Boolean'];
  /** Removes the aspect with the specified ID */
  removeAspect: Scalars['Boolean'];
  /** Removes the Challenge with the specified ID */
  removeChallenge: Scalars['Boolean'];
  /** Remove the specified organisation as a lead for the specified challenge */
  removeChallengeLead: Scalars['Boolean'];
  /** Remove the focal point for the given group */
  removeGroupFocalPoint?: Maybe<UserGroup>;
  /** Removes the Opportunity with the specified ID */
  removeOpportunity: Scalars['Boolean'];
  /** Removes the Project with the specified ID */
  removeProject: Scalars['Boolean'];
  /** Removes the reference  with the specified ID */
  removeReference: Scalars['Boolean'];
  /** Removes the relation with the specified ID */
  removeRelation: Scalars['Boolean'];
  /** Removes the specified user from the ecoverse */
  removeUser: Scalars['Boolean'];
  /** Remove the user with the given identifier to the specified user group */
  removeUserFromGroup: UserGroup;
  /** Removes the user group with the specified ID */
  removeUserGroup: Scalars['Boolean'];
  /** Replace the set of tags in a tagset with the provided tags */
  replaceTagsOnTagset: Tagset;
  /** Updates the actor with the specified ID with the supplied data */
  updateActor: Actor;
  /** Updates the aspect with the specified ID */
  updateAspect: Aspect;
  /** Updates the specified Challenge with the provided data (merge) */
  updateChallenge: Challenge;
  /** Updates the Ecoverse with the provided data */
  updateEcoverse: Ecoverse;
  /** Updates the specified Opportunity with the provided data (merge) */
  updateOpportunity: Opportunity;
  /** Updates the organisation with the given data */
  updateOrganisation: Organisation;
  /** Updates the fields on the Profile, such as avatar location or description */
  updateProfile: Scalars['Boolean'];
  /** Updates the Project with the specified ID */
  updateProject: Project;
  /** Update the base user information. Note: email address cannot be updated. */
  updateUser: User;
  /** Updates the user account password */
  updateUserAccountPassword: Scalars['Boolean'];
  /** Update the user group information. */
  updateUserGroup: UserGroup;
};

export type MutationAddChallengeLeadArgs = {
  challengeID: Scalars['Float'];
  organisationID: Scalars['Float'];
};

export type MutationAddTagToTagsetArgs = {
  tag: Scalars['String'];
  tagsetID: Scalars['Float'];
};

export type MutationAddUserToChallengeArgs = {
  challengeID: Scalars['Float'];
  userID: Scalars['Float'];
};

export type MutationAddUserToGroupArgs = {
  groupID: Scalars['Float'];
  userID: Scalars['Float'];
};

export type MutationAddUserToOpportunityArgs = {
  opportunityID: Scalars['Float'];
  userID: Scalars['Float'];
};

export type MutationAssignGroupFocalPointArgs = {
  groupID: Scalars['Float'];
  userID: Scalars['Float'];
};

export type MutationCreateActorArgs = {
  actorData: ActorInput;
  actorGroupID: Scalars['Float'];
};

export type MutationCreateActorGroupArgs = {
  actorGroupData: ActorGroupInput;
  opportunityID: Scalars['Float'];
};

export type MutationCreateAspectArgs = {
  aspectData: AspectInput;
  opportunityID: Scalars['Float'];
};

export type MutationCreateAspectOnProjectArgs = {
  aspectData: AspectInput;
  projectID: Scalars['Float'];
};

export type MutationCreateChallengeArgs = {
  challengeData: ChallengeInput;
};

export type MutationCreateGroupOnChallengeArgs = {
  challengeID: Scalars['Float'];
  groupName: Scalars['String'];
};

export type MutationCreateGroupOnEcoverseArgs = {
  groupName: Scalars['String'];
};

export type MutationCreateGroupOnOpportunityArgs = {
  groupName: Scalars['String'];
  opportunityID: Scalars['Float'];
};

export type MutationCreateGroupOnOrganisationArgs = {
  groupName: Scalars['String'];
  orgID: Scalars['Float'];
};

export type MutationCreateOpportunityOnChallengeArgs = {
  challengeID: Scalars['Float'];
  opportunityData: OpportunityInput;
};

export type MutationCreateOrganisationArgs = {
  organisationData: OrganisationInput;
};

export type MutationCreateProjectArgs = {
  opportunityID: Scalars['Float'];
  projectData: ProjectInput;
};

export type MutationCreateReferenceOnContextArgs = {
  contextID: Scalars['Float'];
  referenceInput: ReferenceInput;
};

export type MutationCreateReferenceOnProfileArgs = {
  profileID: Scalars['Float'];
  referenceInput: ReferenceInput;
};

export type MutationCreateRelationArgs = {
  opportunityID: Scalars['Float'];
  relationData: RelationInput;
};

export type MutationCreateTagsetOnProfileArgs = {
  profileID: Scalars['Float'];
  tagsetName: Scalars['String'];
};

export type MutationCreateUserArgs = {
  userData: UserInput;
};

export type MutationCreateUserAccountArgs = {
  password: Scalars['String'];
  userID: Scalars['Float'];
};

export type MutationCreateUserProfileArgs = {
  userData: UserInput;
};

export type MutationRemoveActorArgs = {
  ID: Scalars['Float'];
};

export type MutationRemoveActorGroupArgs = {
  ID: Scalars['Float'];
};

export type MutationRemoveAspectArgs = {
  ID: Scalars['Float'];
};

export type MutationRemoveChallengeArgs = {
  ID: Scalars['Float'];
};

export type MutationRemoveChallengeLeadArgs = {
  challengeID: Scalars['Float'];
  organisationID: Scalars['Float'];
};

export type MutationRemoveGroupFocalPointArgs = {
  groupID: Scalars['Float'];
};

export type MutationRemoveOpportunityArgs = {
  ID: Scalars['Float'];
};

export type MutationRemoveProjectArgs = {
  ID: Scalars['Float'];
};

export type MutationRemoveReferenceArgs = {
  ID: Scalars['Float'];
};

export type MutationRemoveRelationArgs = {
  ID: Scalars['Float'];
};

export type MutationRemoveUserArgs = {
  userID: Scalars['Float'];
};

export type MutationRemoveUserFromGroupArgs = {
  groupID: Scalars['Float'];
  userID: Scalars['Float'];
};

export type MutationRemoveUserGroupArgs = {
  ID: Scalars['Float'];
};

export type MutationReplaceTagsOnTagsetArgs = {
  tags: Array<Scalars['String']>;
  tagsetID: Scalars['Float'];
};

export type MutationUpdateActorArgs = {
  actorData: ActorInput;
  ID: Scalars['Float'];
};

export type MutationUpdateAspectArgs = {
  aspectData: AspectInput;
  ID: Scalars['Float'];
};

export type MutationUpdateChallengeArgs = {
  challengeData: UpdateChallengeInput;
};

export type MutationUpdateEcoverseArgs = {
  ecoverseData: EcoverseInput;
};

export type MutationUpdateOpportunityArgs = {
  ID: Scalars['Float'];
  opportunityData: OpportunityInput;
};

export type MutationUpdateOrganisationArgs = {
  organisationData: OrganisationInput;
  orgID: Scalars['Float'];
};

export type MutationUpdateProfileArgs = {
  ID: Scalars['Float'];
  profileData: ProfileInput;
};

export type MutationUpdateProjectArgs = {
  ID: Scalars['Float'];
  projectData: ProjectInput;
};

export type MutationUpdateUserArgs = {
  userData: UserInput;
  userID: Scalars['Float'];
};

export type MutationUpdateUserGroupArgs = {
  ID: Scalars['Float'];
  userGroupData: UserGroupInput;
};

export type Opportunity = {
  __typename?: 'Opportunity';
  /** The set of actor groups within the context of this Opportunity. */
  actorGroups?: Maybe<Array<ActorGroup>>;
  /** The set of aspects within the context of this Opportunity. */
  aspects?: Maybe<Array<Aspect>>;
  /** The shared understanding for the opportunity */
  context?: Maybe<Context>;
  /** All users that are contributing to this Opportunity. */
  contributors?: Maybe<Array<User>>;
  /** Groups of users related to a Opportunity. */
  groups?: Maybe<Array<UserGroup>>;
  id: Scalars['ID'];
  /** The name of the Opportunity */
  name: Scalars['String'];
  /** The set of projects within the context of this Opportunity */
  projects?: Maybe<Array<Project>>;
  /** The set of relations within the context of this Opportunity. */
  relations?: Maybe<Array<Relation>>;
  /** The maturity phase of the Opportunity i.e. new, being refined, ongoing etc */
  state?: Maybe<Scalars['String']>;
  /** A short text identifier for this Opportunity */
  textID: Scalars['String'];
};

export type OpportunityInput = {
  context?: Maybe<ContextInput>;
  name?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
  textID?: Maybe<Scalars['String']>;
};

export type OpportunityTemplate = {
  __typename?: 'OpportunityTemplate';
  /** Template actor groups. */
  actorGroups?: Maybe<Array<Scalars['String']>>;
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
};

export type OrganisationInput = {
  /** The name for this organisation */
  name?: Maybe<Scalars['String']>;
  profileData?: Maybe<ProfileInput>;
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

export type ProfileInput = {
  avatar?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  referencesData?: Maybe<Array<ReferenceInput>>;
  tagsetsData?: Maybe<Array<TagsetInput>>;
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

export type ProjectInput = {
  description?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
  textID?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  /** A particular challenge */
  challenge: Challenge;
  /** All challenges */
  challenges: Array<Challenge>;
  /** Cherrytwist Web Client AAD Configuration */
  clientConfig: AadConfig;
  /** Cherrytwist configuration. Provides configuration to external services in the Cherrytwist ecosystem. */
  configuration: Config;
  /** The shared understanding for this ecoverse */
  context: Context;
  /** The user group with the specified id anywhere in the ecoverse */
  group: UserGroup;
  /** All groups at the ecoverse level */
  groups: Array<UserGroup>;
  /** All groups that have the provided tag */
  groupsWithTag: Array<UserGroup>;
  /** The host organisation for the ecoverse */
  host: Organisation;
  /** The currently logged in user */
  me: User;
  /** Cherrytwist Services Metadata */
  metadata: Metadata;
  /** The name for this ecoverse */
  name: Scalars['String'];
  /** All opportunities within the ecoverse */
  opportunities: Array<Opportunity>;
  /** A particular opportunitiy, identified by the ID */
  opportunity: Opportunity;
  /** A particular organisation */
  organisation: Organisation;
  /** All organisations */
  organisations: Array<Organisation>;
  /** A particular Project, identified by the ID */
  project: Project;
  /** All projects within this ecoverse */
  projects: Array<Project>;
  /** Search the ecoverse for terms supplied */
  search: Array<SearchResultEntry>;
  /** The tagset associated with this Ecoverse */
  tagset: Tagset;
  /** A particular user, identified by the ID or by email */
  user: User;
  /** The members of this this ecoverse */
  users: Array<User>;
  /** The members of this this ecoverse filtered by list of IDs. */
  usersById: Array<User>;
};

export type QueryChallengeArgs = {
  ID: Scalars['Float'];
};

export type QueryGroupArgs = {
  ID: Scalars['Float'];
};

export type QueryGroupsWithTagArgs = {
  tag: Scalars['String'];
};

export type QueryOpportunityArgs = {
  ID: Scalars['Float'];
};

export type QueryOrganisationArgs = {
  ID: Scalars['Float'];
};

export type QueryProjectArgs = {
  ID: Scalars['Float'];
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

export type Reference = {
  __typename?: 'Reference';
  description: Scalars['String'];
  id: Scalars['ID'];
  name: Scalars['String'];
  uri: Scalars['String'];
};

export type ReferenceInput = {
  description?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  uri?: Maybe<Scalars['String']>;
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

export type RelationInput = {
  actorName?: Maybe<Scalars['String']>;
  actorRole?: Maybe<Scalars['String']>;
  actorType?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
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

export type TagsetInput = {
  name?: Maybe<Scalars['String']>;
  tags?: Maybe<Array<Scalars['String']>>;
};

export type Template = {
  __typename?: 'Template';
  /** Template description. */
  description: Scalars['String'];
  /** Template name. */
  name: Scalars['String'];
  /** Opportunities template. */
  opportunities: Array<OpportunityTemplate>;
  /** Users template. */
  users: Array<UserTemplate>;
};

export type UpdateChallengeInput = {
  context?: Maybe<ContextInput>;
  ID: Scalars['Float'];
  name?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
  tags?: Maybe<Array<Scalars['String']>>;
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
  /** The last timestamp, in seconds, when this user was modified - either via creation or via update. Note: updating of profile data or group memberships does not update this field. */
  lastModified?: Maybe<Scalars['Int']>;
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
  /** The focal point for this group */
  focalPoint?: Maybe<User>;
  id: Scalars['ID'];
  /** The set of users that are members of this group */
  members?: Maybe<Array<User>>;
  name: Scalars['String'];
  /** Containing entity for this UserGroup. */
  parent?: Maybe<UserGroupParent>;
  /** The profile for the user group */
  profile?: Maybe<Profile>;
};

export type UserGroupInput = {
  name?: Maybe<Scalars['String']>;
  profileData?: Maybe<ProfileInput>;
};

export type UserGroupParent = Challenge | Ecoverse | Opportunity | Organisation;

export type UserInput = {
  aadPassword?: Maybe<Scalars['String']>;
  accountUpn?: Maybe<Scalars['String']>;
  city?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  /** Email address is required for mutations! */
  email?: Maybe<Scalars['String']>;
  firstName?: Maybe<Scalars['String']>;
  gender?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  profileData?: Maybe<ProfileInput>;
};

export type UserTemplate = {
  __typename?: 'UserTemplate';
  /** Template user name. */
  name: Scalars['String'];
  /** Template tagsets. */
  tagsets?: Maybe<Array<Scalars['String']>>;
};

export type WebClientConfig = {
  __typename?: 'WebClientConfig';
  /** Cherrytwist Client AAD config. */
  aadConfig: AadConfig;
};

export type ServerMetadataQueryVariables = Exact<{ [key: string]: never }>;

export type ServerMetadataQuery = { __typename?: 'Query' } & {
  metadata: { __typename?: 'Metadata' } & {
    services: Array<{ __typename?: 'ServiceMetadata' } & Pick<ServiceMetadata, 'name' | 'version'>>;
  };
};

export type CreateUserMutationVariables = Exact<{
  user: UserInput;
}>;

export type CreateUserMutation = { __typename?: 'Mutation' } & {
  createUser: { __typename?: 'User' } & UserDetailsFragment;
};

export type UpdateUserMutationVariables = Exact<{
  user: UserInput;
  userId: Scalars['Float'];
}>;

export type UpdateUserMutation = { __typename?: 'Mutation' } & {
  updateUser: { __typename?: 'User' } & UserDetailsFragment;
};

export type EcoverseChallengeGroupsQueryVariables = Exact<{ [key: string]: never }>;

export type EcoverseChallengeGroupsQuery = { __typename?: 'Query' } & Pick<Query, 'name'> & {
    groups: Array<{ __typename?: 'UserGroup' } & Pick<UserGroup, 'id' | 'name'>>;
    challenges: Array<
      { __typename?: 'Challenge' } & Pick<Challenge, 'id' | 'name' | 'textID'> & {
          groups?: Maybe<Array<{ __typename?: 'UserGroup' } & Pick<UserGroup, 'id' | 'name'>>>;
        }
    >;
  };

export type GroupMembersFragment = { __typename?: 'User' } & Pick<
  User,
  'id' | 'name' | 'firstName' | 'lastName' | 'email'
>;

export type GroupMembersQueryVariables = Exact<{
  id: Scalars['Float'];
}>;

export type GroupMembersQuery = { __typename?: 'Query' } & {
  group: { __typename?: 'UserGroup' } & Pick<UserGroup, 'id' | 'name'> & {
      members?: Maybe<Array<{ __typename?: 'User' } & GroupMembersFragment>>;
    };
};

export type RemoveUserFromGroupMutationVariables = Exact<{
  groupID: Scalars['Float'];
  userID: Scalars['Float'];
}>;

export type RemoveUserFromGroupMutation = { __typename?: 'Mutation' } & {
  removeUserFromGroup: { __typename?: 'UserGroup' } & Pick<UserGroup, 'id' | 'name'> & {
      members?: Maybe<Array<{ __typename?: 'User' } & GroupMembersFragment>>;
    };
};

export type RemoveUserMutationVariables = Exact<{
  userID: Scalars['Float'];
}>;

export type RemoveUserMutation = { __typename?: 'Mutation' } & Pick<Mutation, 'removeUser'>;

export type AddUserToGroupMutationVariables = Exact<{
  groupID: Scalars['Float'];
  userID: Scalars['Float'];
}>;

export type AddUserToGroupMutation = { __typename?: 'Mutation' } & Pick<Mutation, 'addUserToGroup'>;

export type EcoverseChallengesListQueryVariables = Exact<{ [key: string]: never }>;

export type EcoverseChallengesListQuery = { __typename?: 'Query' } & {
  challenges: Array<{ __typename?: 'Challenge' } & Pick<Challenge, 'id' | 'name'>>;
};

export type EcoverseGroupsListQueryVariables = Exact<{ [key: string]: never }>;

export type EcoverseGroupsListQuery = { __typename?: 'Query' } & {
  groups: Array<{ __typename?: 'UserGroup' } & Pick<UserGroup, 'id' | 'name'>>;
};

export type OrganizationNameQueryVariables = Exact<{
  id: Scalars['Float'];
}>;

export type OrganizationNameQuery = { __typename?: 'Query' } & {
  organisation: { __typename?: 'Organisation' } & Pick<Organisation, 'name'>;
};

export type OrganizationsListQueryVariables = Exact<{ [key: string]: never }>;

export type OrganizationsListQuery = { __typename?: 'Query' } & {
  organisations: Array<{ __typename?: 'Organisation' } & Pick<Organisation, 'id' | 'name'>>;
};

export type ChallengeNameQueryVariables = Exact<{
  id: Scalars['Float'];
}>;

export type ChallengeNameQuery = { __typename?: 'Query' } & {
  challenge: { __typename?: 'Challenge' } & Pick<Challenge, 'id' | 'name'>;
};

export type ChallengeGroupsQueryVariables = Exact<{
  id: Scalars['Float'];
}>;

export type ChallengeGroupsQuery = { __typename?: 'Query' } & {
  challenge: { __typename?: 'Challenge' } & {
    groups?: Maybe<Array<{ __typename?: 'UserGroup' } & Pick<UserGroup, 'id' | 'name'>>>;
  };
};

export type OrganizationGroupsQueryVariables = Exact<{
  id: Scalars['Float'];
}>;

export type OrganizationGroupsQuery = { __typename?: 'Query' } & {
  organisation: { __typename?: 'Organisation' } & {
    groups?: Maybe<Array<{ __typename?: 'UserGroup' } & Pick<UserGroup, 'id' | 'name'>>>;
  };
};

export type ChallengeOpportunitiesQueryVariables = Exact<{
  id: Scalars['Float'];
}>;

export type ChallengeOpportunitiesQuery = { __typename?: 'Query' } & {
  challenge: { __typename?: 'Challenge' } & {
    opportunities?: Maybe<Array<{ __typename?: 'Opportunity' } & Pick<Opportunity, 'id' | 'name'>>>;
  };
};

export type OpportunityGroupsQueryVariables = Exact<{
  id: Scalars['Float'];
}>;

export type OpportunityGroupsQuery = { __typename?: 'Query' } & {
  opportunity: { __typename?: 'Opportunity' } & {
    groups?: Maybe<Array<{ __typename?: 'UserGroup' } & Pick<UserGroup, 'id' | 'name'>>>;
  };
};

export type OpportunityNameQueryVariables = Exact<{
  id: Scalars['Float'];
}>;

export type OpportunityNameQuery = { __typename?: 'Query' } & {
  opportunity: { __typename?: 'Opportunity' } & Pick<Opportunity, 'id' | 'name'>;
};

export type TagsetsTemplateQueryVariables = Exact<{ [key: string]: never }>;

export type TagsetsTemplateQuery = { __typename?: 'Query' } & {
  configuration: { __typename?: 'Config' } & {
    template: { __typename?: 'Template' } & {
      users: Array<{ __typename?: 'UserTemplate' } & Pick<UserTemplate, 'tagsets'>>;
    };
  };
};

export type CreateChallengeMutationVariables = Exact<{
  challengeData: ChallengeInput;
}>;

export type CreateChallengeMutation = { __typename?: 'Mutation' } & {
  createChallenge: { __typename?: 'Challenge' } & Pick<Challenge, 'id' | 'name'>;
};

export type UpdateChallengeMutationVariables = Exact<{
  challengeData: UpdateChallengeInput;
}>;

export type UpdateChallengeMutation = { __typename?: 'Mutation' } & {
  updateChallenge: { __typename?: 'Challenge' } & Pick<Challenge, 'id' | 'name'>;
};

export type ChallengeProfileInfoQueryVariables = Exact<{
  id: Scalars['Float'];
}>;

export type ChallengeProfileInfoQuery = { __typename?: 'Query' } & {
  challenge: { __typename?: 'Challenge' } & Pick<Challenge, 'id' | 'textID' | 'name'> & {
      context?: Maybe<
        { __typename?: 'Context' } & Pick<Context, 'tagline' | 'background' | 'vision' | 'impact' | 'who'> & {
            references?: Maybe<
              Array<{ __typename?: 'Reference' } & Pick<Reference, 'id' | 'name' | 'uri' | 'description'>>
            >;
          }
      >;
    };
};

export type CreateOpportunityMutationVariables = Exact<{
  opportunityData: OpportunityInput;
  challengeID: Scalars['Float'];
}>;

export type CreateOpportunityMutation = { __typename?: 'Mutation' } & {
  createOpportunityOnChallenge: { __typename?: 'Opportunity' } & Pick<Opportunity, 'id' | 'name'>;
};

export type UpdateOpportunityMutationVariables = Exact<{
  opportunityData: OpportunityInput;
  ID: Scalars['Float'];
}>;

export type UpdateOpportunityMutation = { __typename?: 'Mutation' } & {
  updateOpportunity: { __typename?: 'Opportunity' } & Pick<Opportunity, 'id' | 'name'>;
};

export type OpportunityProfileInfoQueryVariables = Exact<{
  id: Scalars['Float'];
}>;

export type OpportunityProfileInfoQuery = { __typename?: 'Query' } & {
  opportunity: { __typename?: 'Opportunity' } & Pick<Opportunity, 'id' | 'textID' | 'name'> & {
      context?: Maybe<
        { __typename?: 'Context' } & Pick<Context, 'tagline' | 'background' | 'vision' | 'impact' | 'who'> & {
            references?: Maybe<
              Array<{ __typename?: 'Reference' } & Pick<Reference, 'id' | 'name' | 'uri' | 'description'>>
            >;
          }
      >;
    };
};

export type CreateOrganizationMutationVariables = Exact<{
  organisationData: OrganisationInput;
}>;

export type CreateOrganizationMutation = { __typename?: 'Mutation' } & {
  createOrganisation: { __typename?: 'Organisation' } & Pick<Organisation, 'id' | 'name'>;
};

export type UpdateOrganizationMutationVariables = Exact<{
  organisationData: OrganisationInput;
  orgID: Scalars['Float'];
}>;

export type UpdateOrganizationMutation = { __typename?: 'Mutation' } & {
  updateOrganisation: { __typename?: 'Organisation' } & Pick<Organisation, 'id' | 'name'>;
};

export type OrganisationProfileInfoQueryVariables = Exact<{
  id: Scalars['Float'];
}>;

export type OrganisationProfileInfoQuery = { __typename?: 'Query' } & {
  organisation: { __typename?: 'Organisation' } & Pick<Organisation, 'id' | 'name'> & {
      profile: { __typename?: 'Profile' } & Pick<Profile, 'id' | 'avatar' | 'description'> & {
          references?: Maybe<Array<{ __typename?: 'Reference' } & Pick<Reference, 'id' | 'name' | 'uri'>>>;
          tagsets?: Maybe<Array<{ __typename?: 'Tagset' } & Pick<Tagset, 'id' | 'name' | 'tags'>>>;
        };
    };
};

export type CreateGroupOnEcoverseMutationVariables = Exact<{
  groupName: Scalars['String'];
}>;

export type CreateGroupOnEcoverseMutation = { __typename?: 'Mutation' } & {
  createGroupOnEcoverse: { __typename?: 'UserGroup' } & Pick<UserGroup, 'id' | 'name'>;
};

export type CreateGroupOnChallengeMutationVariables = Exact<{
  groupName: Scalars['String'];
  challengeID: Scalars['Float'];
}>;

export type CreateGroupOnChallengeMutation = { __typename?: 'Mutation' } & {
  createGroupOnChallenge: { __typename?: 'UserGroup' } & Pick<UserGroup, 'id' | 'name'>;
};

export type CreateGroupOnOpportunityMutationVariables = Exact<{
  groupName: Scalars['String'];
  opportunityID: Scalars['Float'];
}>;

export type CreateGroupOnOpportunityMutation = { __typename?: 'Mutation' } & {
  createGroupOnOpportunity: { __typename?: 'UserGroup' } & Pick<UserGroup, 'id' | 'name'>;
};

export type CreateGroupOnOrganizationMutationVariables = Exact<{
  groupName: Scalars['String'];
  orgID: Scalars['Float'];
}>;

export type CreateGroupOnOrganizationMutation = { __typename?: 'Mutation' } & {
  createGroupOnOrganisation: { __typename?: 'UserGroup' } & Pick<UserGroup, 'id' | 'name'>;
};

export type OrganizationDetailsQueryVariables = Exact<{
  id: Scalars['Float'];
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
  groupId: Scalars['Float'];
}>;

export type RemoveUserGroupMutation = { __typename?: 'Mutation' } & Pick<Mutation, 'removeUserGroup'>;

export type ChallengeProfileQueryVariables = Exact<{
  id: Scalars['Float'];
}>;

export type ChallengeProfileQuery = { __typename?: 'Query' } & {
  challenge: { __typename?: 'Challenge' } & Pick<Challenge, 'id' | 'textID' | 'name'> & {
      context?: Maybe<
        { __typename?: 'Context' } & Pick<Context, 'tagline' | 'background' | 'vision' | 'impact' | 'who'> & {
            references?: Maybe<
              Array<{ __typename?: 'Reference' } & Pick<Reference, 'id' | 'name' | 'uri' | 'description'>>
            >;
          }
      >;
      contributors?: Maybe<Array<{ __typename?: 'User' } & Pick<User, 'name'>>>;
      tagset?: Maybe<{ __typename?: 'Tagset' } & Pick<Tagset, 'name' | 'tags'>>;
      opportunities?: Maybe<
        Array<
          { __typename?: 'Opportunity' } & Pick<Opportunity, 'id' | 'name' | 'textID'> & {
              context?: Maybe<
                { __typename?: 'Context' } & {
                  references?: Maybe<Array<{ __typename?: 'Reference' } & Pick<Reference, 'name' | 'uri'>>>;
                }
              >;
              projects?: Maybe<
                Array<{ __typename?: 'Project' } & Pick<Project, 'id' | 'textID' | 'name' | 'description' | 'state'>>
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

export type UpdateChallengeContextMutationVariables = Exact<{
  challengeData: UpdateChallengeInput;
}>;

export type UpdateChallengeContextMutation = { __typename?: 'Mutation' } & {
  updateChallenge: { __typename?: 'Challenge' } & Pick<Challenge, 'id' | 'name'>;
};

export type AddUserToChallengeMutationVariables = Exact<{
  challengeID: Scalars['Float'];
  userID: Scalars['Float'];
}>;

export type AddUserToChallengeMutation = { __typename?: 'Mutation' } & {
  addUserToChallenge: { __typename?: 'UserGroup' } & Pick<UserGroup, 'id' | 'name'>;
};

export type ChallengeMembersQueryVariables = Exact<{
  challengeID: Scalars['Float'];
}>;

export type ChallengeMembersQuery = { __typename?: 'Query' } & {
  challenge: { __typename?: 'Challenge' } & {
    contributors?: Maybe<
      Array<{ __typename?: 'User' } & Pick<User, 'id' | 'name' | 'firstName' | 'lastName' | 'email'>>
    >;
  };
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
  id: Scalars['Float'];
}>;

export type GroupCardQuery = { __typename?: 'Query' } & {
  group: { __typename: 'UserGroup' } & Pick<UserGroup, 'name'> & {
      parent?: Maybe<
        | ({ __typename: 'Challenge' } & Pick<Challenge, 'name'>)
        | ({ __typename: 'Ecoverse' } & Pick<Ecoverse, 'name'>)
        | ({ __typename: 'Opportunity' } & Pick<Opportunity, 'name'>)
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

export type OrganizationCardQueryVariables = Exact<{
  id: Scalars['Float'];
}>;

export type OrganizationCardQuery = { __typename?: 'Query' } & {
  organisation: { __typename?: 'Organisation' } & Pick<Organisation, 'id' | 'name'> & {
      groups?: Maybe<Array<{ __typename?: 'UserGroup' } & Pick<UserGroup, 'name'>>>;
      members?: Maybe<Array<{ __typename?: 'User' } & Pick<User, 'id'>>>;
      profile: { __typename?: 'Profile' } & Pick<Profile, 'id' | 'description' | 'avatar'>;
    };
};

export type EcoverseListQueryVariables = Exact<{ [key: string]: never }>;

export type EcoverseListQuery = { __typename?: 'Query' } & Pick<Query, 'name'> & {
    context: { __typename?: 'Context' } & Pick<Context, 'tagline'>;
    challenges: Array<{ __typename?: 'Challenge' } & Pick<Challenge, 'id' | 'name'>>;
  };

export type EcoverseNameQueryVariables = Exact<{ [key: string]: never }>;

export type EcoverseNameQuery = { __typename?: 'Query' } & Pick<Query, 'name'>;

export type EcoverseInfoQueryVariables = Exact<{ [key: string]: never }>;

export type EcoverseInfoQuery = { __typename?: 'Query' } & Pick<Query, 'name'> & {
    context: { __typename?: 'Context' } & Pick<Context, 'tagline' | 'vision' | 'impact' | 'background'> & {
        references?: Maybe<Array<{ __typename?: 'Reference' } & Pick<Reference, 'name' | 'uri'>>>;
      };
  };

export type ChallengesQueryVariables = Exact<{ [key: string]: never }>;

export type ChallengesQuery = { __typename?: 'Query' } & {
  challenges: Array<
    { __typename?: 'Challenge' } & Pick<Challenge, 'id' | 'name' | 'textID'> & {
        context?: Maybe<
          { __typename?: 'Context' } & Pick<Context, 'tagline'> & {
              references?: Maybe<Array<{ __typename?: 'Reference' } & Pick<Reference, 'name' | 'uri'>>>;
            }
        >;
      }
  >;
};

export type ProjectsQueryVariables = Exact<{ [key: string]: never }>;

export type ProjectsQuery = { __typename?: 'Query' } & {
  projects: Array<{ __typename?: 'Project' } & Pick<Project, 'id' | 'textID' | 'name' | 'description' | 'state'>>;
};

export type ProjectsChainHistoryQueryVariables = Exact<{ [key: string]: never }>;

export type ProjectsChainHistoryQuery = { __typename?: 'Query' } & {
  challenges: Array<
    { __typename?: 'Challenge' } & Pick<Challenge, 'name' | 'textID'> & {
        opportunities?: Maybe<
          Array<
            { __typename?: 'Opportunity' } & Pick<Opportunity, 'textID'> & {
                projects?: Maybe<Array<{ __typename?: 'Project' } & Pick<Project, 'textID'>>>;
              }
          >
        >;
      }
  >;
};

export type OpportunitiesQueryVariables = Exact<{ [key: string]: never }>;

export type OpportunitiesQuery = { __typename?: 'Query' } & {
  opportunities: Array<{ __typename?: 'Opportunity' } & Pick<Opportunity, 'id' | 'textID'>>;
};

export type EcoverseHostReferencesQueryVariables = Exact<{ [key: string]: never }>;

export type EcoverseHostReferencesQuery = { __typename?: 'Query' } & {
  host: { __typename?: 'Organisation' } & {
    profile: { __typename?: 'Profile' } & Pick<Profile, 'id'> & {
        references?: Maybe<Array<{ __typename?: 'Reference' } & Pick<Reference, 'name' | 'uri'>>>;
      };
  };
};

export type OpportunityProfileQueryVariables = Exact<{
  id: Scalars['Float'];
}>;

export type OpportunityProfileQuery = { __typename?: 'Query' } & {
  opportunity: { __typename?: 'Opportunity' } & Pick<Opportunity, 'id' | 'textID' | 'name' | 'state'> & {
      aspects?: Maybe<Array<{ __typename?: 'Aspect' } & Pick<Aspect, 'id' | 'title' | 'framing' | 'explanation'>>>;
      context?: Maybe<
        { __typename?: 'Context' } & Pick<Context, 'tagline' | 'background' | 'vision' | 'impact' | 'who'> & {
            references?: Maybe<Array<{ __typename?: 'Reference' } & Pick<Reference, 'id' | 'name' | 'uri'>>>;
          }
      >;
      groups?: Maybe<
        Array<
          { __typename?: 'UserGroup' } & Pick<UserGroup, 'name'> & {
              members?: Maybe<Array<{ __typename?: 'User' } & Pick<User, 'name'>>>;
            }
        >
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

export type CreateRelationMutationVariables = Exact<{
  opportunityId: Scalars['Float'];
  relationData: RelationInput;
}>;

export type CreateRelationMutation = { __typename?: 'Mutation' } & {
  createRelation: { __typename?: 'Relation' } & Pick<Relation, 'id'>;
};

export type RelationsListQueryVariables = Exact<{
  id: Scalars['Float'];
}>;

export type RelationsListQuery = { __typename?: 'Query' } & {
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

export type UpdateOpportunityContextMutationVariables = Exact<{
  opportunityID: Scalars['Float'];
  opportunityData: OpportunityInput;
}>;

export type UpdateOpportunityContextMutation = { __typename?: 'Mutation' } & {
  updateOpportunity: { __typename?: 'Opportunity' } & Pick<Opportunity, 'name'>;
};

export type AddUserToOpportunityMutationVariables = Exact<{
  opportunityID: Scalars['Float'];
  userID: Scalars['Float'];
}>;

export type AddUserToOpportunityMutation = { __typename?: 'Mutation' } & {
  addUserToOpportunity: { __typename?: 'UserGroup' } & Pick<UserGroup, 'name'>;
};

export type CreateActorMutationVariables = Exact<{
  actorData: ActorInput;
  actorGroupID: Scalars['Float'];
}>;

export type CreateActorMutation = { __typename?: 'Mutation' } & {
  createActor: { __typename?: 'Actor' } & Pick<Actor, 'name'>;
};

export type OpportunityActorGroupsQueryVariables = Exact<{
  id: Scalars['Float'];
}>;

export type OpportunityActorGroupsQuery = { __typename?: 'Query' } & {
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

export type UpdateActorMutationVariables = Exact<{
  actorData: ActorInput;
  ID: Scalars['Float'];
}>;

export type UpdateActorMutation = { __typename?: 'Mutation' } & {
  updateActor: { __typename?: 'Actor' } & Pick<Actor, 'name'>;
};

export type RemoveActorMutationVariables = Exact<{
  ID: Scalars['Float'];
}>;

export type RemoveActorMutation = { __typename?: 'Mutation' } & Pick<Mutation, 'removeActor'>;

export type RemoveRelationMutationVariables = Exact<{
  ID: Scalars['Float'];
}>;

export type RemoveRelationMutation = { __typename?: 'Mutation' } & Pick<Mutation, 'removeRelation'>;

export type QueryOpportunityRelationsQueryVariables = Exact<{
  id: Scalars['Float'];
}>;

export type QueryOpportunityRelationsQuery = { __typename?: 'Query' } & {
  opportunity: { __typename?: 'Opportunity' } & {
    relations?: Maybe<
      Array<
        { __typename?: 'Relation' } & Pick<Relation, 'actorRole' | 'actorName' | 'actorType' | 'description' | 'type'>
      >
    >;
  };
};

export type UpdateAspectMutationVariables = Exact<{
  aspectData: AspectInput;
  ID: Scalars['Float'];
}>;

export type UpdateAspectMutation = { __typename?: 'Mutation' } & {
  updateAspect: { __typename?: 'Aspect' } & Pick<Aspect, 'title'>;
};

export type OpportunityAspectsQueryVariables = Exact<{
  id: Scalars['Float'];
}>;

export type OpportunityAspectsQuery = { __typename?: 'Query' } & {
  opportunity: { __typename?: 'Opportunity' } & {
    aspects?: Maybe<Array<{ __typename?: 'Aspect' } & Pick<Aspect, 'title' | 'framing' | 'explanation'>>>;
  };
};

export type RemoveAspectMutationVariables = Exact<{
  ID: Scalars['Float'];
}>;

export type RemoveAspectMutation = { __typename?: 'Mutation' } & Pick<Mutation, 'removeAspect'>;

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
  aspectData: AspectInput;
  opportunityID: Scalars['Float'];
}>;

export type CreateAspectMutation = { __typename?: 'Mutation' } & {
  createAspect: { __typename?: 'Aspect' } & Pick<Aspect, 'title'>;
};

export type CreateActorGroupMutationVariables = Exact<{
  actorGroupData: ActorGroupInput;
  opportunityID: Scalars['Float'];
}>;

export type CreateActorGroupMutation = { __typename?: 'Mutation' } & {
  createActorGroup: { __typename?: 'ActorGroup' } & Pick<ActorGroup, 'name'>;
};

export type RemoveReferenceMutationVariables = Exact<{
  ID: Scalars['Float'];
}>;

export type RemoveReferenceMutation = { __typename?: 'Mutation' } & Pick<Mutation, 'removeReference'>;

export type RemoveOpportunityMutationVariables = Exact<{
  ID: Scalars['Float'];
}>;

export type RemoveOpportunityMutation = { __typename?: 'Mutation' } & Pick<Mutation, 'removeOpportunity'>;

export type ProjectDetailsFragment = { __typename?: 'Project' } & Pick<
  Project,
  'id' | 'textID' | 'name' | 'description' | 'state'
> & {
    tagset?: Maybe<{ __typename?: 'Tagset' } & Pick<Tagset, 'name' | 'tags'>>;
    aspects?: Maybe<Array<{ __typename?: 'Aspect' } & Pick<Aspect, 'title' | 'framing' | 'explanation'>>>;
  };

export type ProjectProfileQueryVariables = Exact<{
  id: Scalars['Float'];
}>;

export type ProjectProfileQuery = { __typename?: 'Query' } & {
  project: { __typename?: 'Project' } & ProjectDetailsFragment;
};

export type CreateProjectMutationVariables = Exact<{
  opportunityID: Scalars['Float'];
  project: ProjectInput;
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
          tagsets?: Maybe<Array<{ __typename?: 'Tagset' } & Pick<Tagset, 'name' | 'tags'>>>;
        }
    >;
  };

export type UserMembersFragment = { __typename?: 'User' } & {
  memberof?: Maybe<
    { __typename?: 'MemberOf' } & {
      groups: Array<{ __typename?: 'UserGroup' } & Pick<UserGroup, 'id' | 'name'>>;
      challenges: Array<{ __typename?: 'Challenge' } & Pick<Challenge, 'id' | 'name' | 'textID'>>;
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
  id: Scalars['Float'];
}>;

export type ChallengeUserIdsQuery = { __typename?: 'Query' } & {
  challenge: { __typename?: 'Challenge' } & { contributors?: Maybe<Array<{ __typename?: 'User' } & Pick<User, 'id'>>> };
};

export type OpportunityUserIdsQueryVariables = Exact<{
  id: Scalars['Float'];
}>;

export type OpportunityUserIdsQuery = { __typename?: 'Query' } & {
  opportunity: { __typename?: 'Opportunity' } & {
    groups?: Maybe<
      Array<{ __typename?: 'UserGroup' } & { members?: Maybe<Array<{ __typename?: 'User' } & Pick<User, 'id'>>> }>
    >;
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
          groups: Array<{ __typename?: 'UserGroup' } & Pick<UserGroup, 'name'>>;
          challenges: Array<{ __typename?: 'Challenge' } & Pick<Challenge, 'name'>>;
          organisations: Array<{ __typename?: 'Organisation' } & Pick<Organisation, 'name'>>;
        }
      >;
    } & UserDetailsFragment
  >;
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
        name
        tags
      }
    }
  }
`;
export const UserMembersFragmentDoc = gql`
  fragment UserMembers on User {
    memberof {
      groups {
        id
        name
      }
      challenges {
        id
        name
        textID
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
  mutation createUser($user: UserInput!) {
    createUser(userData: $user) {
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
 *      user: // value for 'user'
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
  mutation updateUser($user: UserInput!, $userId: Float!) {
    updateUser(userData: $user, userID: $userId) {
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
 *      user: // value for 'user'
 *      userId: // value for 'userId'
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
export const EcoverseChallengeGroupsDocument = gql`
  query ecoverseChallengeGroups {
    name
    groups {
      id
      name
    }
    challenges {
      id
      name
      textID
      groups {
        id
        name
      }
    }
  }
`;

/**
 * __useEcoverseChallengeGroupsQuery__
 *
 * To run a query within a React component, call `useEcoverseChallengeGroupsQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoverseChallengeGroupsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoverseChallengeGroupsQuery({
 *   variables: {
 *   },
 * });
 */
export function useEcoverseChallengeGroupsQuery(
  baseOptions?: Apollo.QueryHookOptions<EcoverseChallengeGroupsQuery, EcoverseChallengeGroupsQueryVariables>
) {
  return Apollo.useQuery<EcoverseChallengeGroupsQuery, EcoverseChallengeGroupsQueryVariables>(
    EcoverseChallengeGroupsDocument,
    baseOptions
  );
}
export function useEcoverseChallengeGroupsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<EcoverseChallengeGroupsQuery, EcoverseChallengeGroupsQueryVariables>
) {
  return Apollo.useLazyQuery<EcoverseChallengeGroupsQuery, EcoverseChallengeGroupsQueryVariables>(
    EcoverseChallengeGroupsDocument,
    baseOptions
  );
}
export type EcoverseChallengeGroupsQueryHookResult = ReturnType<typeof useEcoverseChallengeGroupsQuery>;
export type EcoverseChallengeGroupsLazyQueryHookResult = ReturnType<typeof useEcoverseChallengeGroupsLazyQuery>;
export type EcoverseChallengeGroupsQueryResult = Apollo.QueryResult<
  EcoverseChallengeGroupsQuery,
  EcoverseChallengeGroupsQueryVariables
>;
export const GroupMembersDocument = gql`
  query groupMembers($id: Float!) {
    group(ID: $id) {
      id
      name
      members {
        ...GroupMembers
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
  mutation removeUserFromGroup($groupID: Float!, $userID: Float!) {
    removeUserFromGroup(groupID: $groupID, userID: $userID) {
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
 *      groupID: // value for 'groupID'
 *      userID: // value for 'userID'
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
export const RemoveUserDocument = gql`
  mutation removeUser($userID: Float!) {
    removeUser(userID: $userID)
  }
`;
export type RemoveUserMutationFn = Apollo.MutationFunction<RemoveUserMutation, RemoveUserMutationVariables>;

/**
 * __useRemoveUserMutation__
 *
 * To run a mutation, you first call `useRemoveUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeUserMutation, { data, loading, error }] = useRemoveUserMutation({
 *   variables: {
 *      userID: // value for 'userID'
 *   },
 * });
 */
export function useRemoveUserMutation(
  baseOptions?: Apollo.MutationHookOptions<RemoveUserMutation, RemoveUserMutationVariables>
) {
  return Apollo.useMutation<RemoveUserMutation, RemoveUserMutationVariables>(RemoveUserDocument, baseOptions);
}
export type RemoveUserMutationHookResult = ReturnType<typeof useRemoveUserMutation>;
export type RemoveUserMutationResult = Apollo.MutationResult<RemoveUserMutation>;
export type RemoveUserMutationOptions = Apollo.BaseMutationOptions<RemoveUserMutation, RemoveUserMutationVariables>;
export const AddUserToGroupDocument = gql`
  mutation addUserToGroup($groupID: Float!, $userID: Float!) {
    addUserToGroup(groupID: $groupID, userID: $userID)
  }
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
 *      groupID: // value for 'groupID'
 *      userID: // value for 'userID'
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
    challenges {
      id
      name
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
    groups {
      id
      name
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
  query organizationName($id: Float!) {
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
  query challengeName($id: Float!) {
    challenge(ID: $id) {
      id
      name
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
  query challengeGroups($id: Float!) {
    challenge(ID: $id) {
      groups {
        id
        name
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
  query organizationGroups($id: Float!) {
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
  query challengeOpportunities($id: Float!) {
    challenge(ID: $id) {
      opportunities {
        id
        name
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
  query opportunityGroups($id: Float!) {
    opportunity(ID: $id) {
      groups {
        id
        name
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
  query opportunityName($id: Float!) {
    opportunity(ID: $id) {
      id
      name
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
          tagsets
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
  mutation createChallenge($challengeData: ChallengeInput!) {
    createChallenge(challengeData: $challengeData) {
      id
      name
    }
  }
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
 *      challengeData: // value for 'challengeData'
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
export const UpdateChallengeDocument = gql`
  mutation updateChallenge($challengeData: UpdateChallengeInput!) {
    updateChallenge(challengeData: $challengeData) {
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
 *      challengeData: // value for 'challengeData'
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
export const ChallengeProfileInfoDocument = gql`
  query challengeProfileInfo($id: Float!) {
    challenge(ID: $id) {
      id
      textID
      name
      context {
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
    }
  }
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
  mutation createOpportunity($opportunityData: OpportunityInput!, $challengeID: Float!) {
    createOpportunityOnChallenge(opportunityData: $opportunityData, challengeID: $challengeID) {
      id
      name
    }
  }
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
 *      opportunityData: // value for 'opportunityData'
 *      challengeID: // value for 'challengeID'
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
  mutation updateOpportunity($opportunityData: OpportunityInput!, $ID: Float!) {
    updateOpportunity(opportunityData: $opportunityData, ID: $ID) {
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
 *      ID: // value for 'ID'
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
  query opportunityProfileInfo($id: Float!) {
    opportunity(ID: $id) {
      id
      textID
      name
      context {
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
    }
  }
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
  mutation createOrganization($organisationData: OrganisationInput!) {
    createOrganisation(organisationData: $organisationData) {
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
 *      organisationData: // value for 'organisationData'
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
  mutation updateOrganization($organisationData: OrganisationInput!, $orgID: Float!) {
    updateOrganisation(organisationData: $organisationData, orgID: $orgID) {
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
 *      organisationData: // value for 'organisationData'
 *      orgID: // value for 'orgID'
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
  query organisationProfileInfo($id: Float!) {
    organisation(ID: $id) {
      id
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
export const CreateGroupOnEcoverseDocument = gql`
  mutation createGroupOnEcoverse($groupName: String!) {
    createGroupOnEcoverse(groupName: $groupName) {
      id
      name
    }
  }
`;
export type CreateGroupOnEcoverseMutationFn = Apollo.MutationFunction<
  CreateGroupOnEcoverseMutation,
  CreateGroupOnEcoverseMutationVariables
>;

/**
 * __useCreateGroupOnEcoverseMutation__
 *
 * To run a mutation, you first call `useCreateGroupOnEcoverseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateGroupOnEcoverseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createGroupOnEcoverseMutation, { data, loading, error }] = useCreateGroupOnEcoverseMutation({
 *   variables: {
 *      groupName: // value for 'groupName'
 *   },
 * });
 */
export function useCreateGroupOnEcoverseMutation(
  baseOptions?: Apollo.MutationHookOptions<CreateGroupOnEcoverseMutation, CreateGroupOnEcoverseMutationVariables>
) {
  return Apollo.useMutation<CreateGroupOnEcoverseMutation, CreateGroupOnEcoverseMutationVariables>(
    CreateGroupOnEcoverseDocument,
    baseOptions
  );
}
export type CreateGroupOnEcoverseMutationHookResult = ReturnType<typeof useCreateGroupOnEcoverseMutation>;
export type CreateGroupOnEcoverseMutationResult = Apollo.MutationResult<CreateGroupOnEcoverseMutation>;
export type CreateGroupOnEcoverseMutationOptions = Apollo.BaseMutationOptions<
  CreateGroupOnEcoverseMutation,
  CreateGroupOnEcoverseMutationVariables
>;
export const CreateGroupOnChallengeDocument = gql`
  mutation createGroupOnChallenge($groupName: String!, $challengeID: Float!) {
    createGroupOnChallenge(groupName: $groupName, challengeID: $challengeID) {
      id
      name
    }
  }
`;
export type CreateGroupOnChallengeMutationFn = Apollo.MutationFunction<
  CreateGroupOnChallengeMutation,
  CreateGroupOnChallengeMutationVariables
>;

/**
 * __useCreateGroupOnChallengeMutation__
 *
 * To run a mutation, you first call `useCreateGroupOnChallengeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateGroupOnChallengeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createGroupOnChallengeMutation, { data, loading, error }] = useCreateGroupOnChallengeMutation({
 *   variables: {
 *      groupName: // value for 'groupName'
 *      challengeID: // value for 'challengeID'
 *   },
 * });
 */
export function useCreateGroupOnChallengeMutation(
  baseOptions?: Apollo.MutationHookOptions<CreateGroupOnChallengeMutation, CreateGroupOnChallengeMutationVariables>
) {
  return Apollo.useMutation<CreateGroupOnChallengeMutation, CreateGroupOnChallengeMutationVariables>(
    CreateGroupOnChallengeDocument,
    baseOptions
  );
}
export type CreateGroupOnChallengeMutationHookResult = ReturnType<typeof useCreateGroupOnChallengeMutation>;
export type CreateGroupOnChallengeMutationResult = Apollo.MutationResult<CreateGroupOnChallengeMutation>;
export type CreateGroupOnChallengeMutationOptions = Apollo.BaseMutationOptions<
  CreateGroupOnChallengeMutation,
  CreateGroupOnChallengeMutationVariables
>;
export const CreateGroupOnOpportunityDocument = gql`
  mutation createGroupOnOpportunity($groupName: String!, $opportunityID: Float!) {
    createGroupOnOpportunity(groupName: $groupName, opportunityID: $opportunityID) {
      id
      name
    }
  }
`;
export type CreateGroupOnOpportunityMutationFn = Apollo.MutationFunction<
  CreateGroupOnOpportunityMutation,
  CreateGroupOnOpportunityMutationVariables
>;

/**
 * __useCreateGroupOnOpportunityMutation__
 *
 * To run a mutation, you first call `useCreateGroupOnOpportunityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateGroupOnOpportunityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createGroupOnOpportunityMutation, { data, loading, error }] = useCreateGroupOnOpportunityMutation({
 *   variables: {
 *      groupName: // value for 'groupName'
 *      opportunityID: // value for 'opportunityID'
 *   },
 * });
 */
export function useCreateGroupOnOpportunityMutation(
  baseOptions?: Apollo.MutationHookOptions<CreateGroupOnOpportunityMutation, CreateGroupOnOpportunityMutationVariables>
) {
  return Apollo.useMutation<CreateGroupOnOpportunityMutation, CreateGroupOnOpportunityMutationVariables>(
    CreateGroupOnOpportunityDocument,
    baseOptions
  );
}
export type CreateGroupOnOpportunityMutationHookResult = ReturnType<typeof useCreateGroupOnOpportunityMutation>;
export type CreateGroupOnOpportunityMutationResult = Apollo.MutationResult<CreateGroupOnOpportunityMutation>;
export type CreateGroupOnOpportunityMutationOptions = Apollo.BaseMutationOptions<
  CreateGroupOnOpportunityMutation,
  CreateGroupOnOpportunityMutationVariables
>;
export const CreateGroupOnOrganizationDocument = gql`
  mutation createGroupOnOrganization($groupName: String!, $orgID: Float!) {
    createGroupOnOrganisation(groupName: $groupName, orgID: $orgID) {
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
 *      groupName: // value for 'groupName'
 *      orgID: // value for 'orgID'
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
  query organizationDetails($id: Float!) {
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
  mutation removeUserGroup($groupId: Float!) {
    removeUserGroup(ID: $groupId)
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
 *      groupId: // value for 'groupId'
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
  query challengeProfile($id: Float!) {
    challenge(ID: $id) {
      id
      textID
      name
      context {
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
      contributors {
        name
      }
      tagset {
        name
        tags
      }
      opportunities {
        id
        name
        textID
        context {
          references {
            name
            uri
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
export const UpdateChallengeContextDocument = gql`
  mutation updateChallengeContext($challengeData: UpdateChallengeInput!) {
    updateChallenge(challengeData: $challengeData) {
      id
      name
    }
  }
`;
export type UpdateChallengeContextMutationFn = Apollo.MutationFunction<
  UpdateChallengeContextMutation,
  UpdateChallengeContextMutationVariables
>;

/**
 * __useUpdateChallengeContextMutation__
 *
 * To run a mutation, you first call `useUpdateChallengeContextMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateChallengeContextMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateChallengeContextMutation, { data, loading, error }] = useUpdateChallengeContextMutation({
 *   variables: {
 *      challengeData: // value for 'challengeData'
 *   },
 * });
 */
export function useUpdateChallengeContextMutation(
  baseOptions?: Apollo.MutationHookOptions<UpdateChallengeContextMutation, UpdateChallengeContextMutationVariables>
) {
  return Apollo.useMutation<UpdateChallengeContextMutation, UpdateChallengeContextMutationVariables>(
    UpdateChallengeContextDocument,
    baseOptions
  );
}
export type UpdateChallengeContextMutationHookResult = ReturnType<typeof useUpdateChallengeContextMutation>;
export type UpdateChallengeContextMutationResult = Apollo.MutationResult<UpdateChallengeContextMutation>;
export type UpdateChallengeContextMutationOptions = Apollo.BaseMutationOptions<
  UpdateChallengeContextMutation,
  UpdateChallengeContextMutationVariables
>;
export const AddUserToChallengeDocument = gql`
  mutation addUserToChallenge($challengeID: Float!, $userID: Float!) {
    addUserToChallenge(challengeID: $challengeID, userID: $userID) {
      id
      name
    }
  }
`;
export type AddUserToChallengeMutationFn = Apollo.MutationFunction<
  AddUserToChallengeMutation,
  AddUserToChallengeMutationVariables
>;

/**
 * __useAddUserToChallengeMutation__
 *
 * To run a mutation, you first call `useAddUserToChallengeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddUserToChallengeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addUserToChallengeMutation, { data, loading, error }] = useAddUserToChallengeMutation({
 *   variables: {
 *      challengeID: // value for 'challengeID'
 *      userID: // value for 'userID'
 *   },
 * });
 */
export function useAddUserToChallengeMutation(
  baseOptions?: Apollo.MutationHookOptions<AddUserToChallengeMutation, AddUserToChallengeMutationVariables>
) {
  return Apollo.useMutation<AddUserToChallengeMutation, AddUserToChallengeMutationVariables>(
    AddUserToChallengeDocument,
    baseOptions
  );
}
export type AddUserToChallengeMutationHookResult = ReturnType<typeof useAddUserToChallengeMutation>;
export type AddUserToChallengeMutationResult = Apollo.MutationResult<AddUserToChallengeMutation>;
export type AddUserToChallengeMutationOptions = Apollo.BaseMutationOptions<
  AddUserToChallengeMutation,
  AddUserToChallengeMutationVariables
>;
export const ChallengeMembersDocument = gql`
  query challengeMembers($challengeID: Float!) {
    challenge(ID: $challengeID) {
      contributors {
        id
        name
        firstName
        lastName
        email
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
  query groupCard($id: Float!) {
    group(ID: $id) {
      __typename
      name
      parent {
        __typename
        ... on Challenge {
          name
        }
        ... on Ecoverse {
          name
        }
        ... on Opportunity {
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
  query organizationCard($id: Float!) {
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
export const EcoverseListDocument = gql`
  query ecoverseList {
    name
    context {
      tagline
    }
    challenges {
      id
      name
    }
  }
`;

/**
 * __useEcoverseListQuery__
 *
 * To run a query within a React component, call `useEcoverseListQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoverseListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoverseListQuery({
 *   variables: {
 *   },
 * });
 */
export function useEcoverseListQuery(
  baseOptions?: Apollo.QueryHookOptions<EcoverseListQuery, EcoverseListQueryVariables>
) {
  return Apollo.useQuery<EcoverseListQuery, EcoverseListQueryVariables>(EcoverseListDocument, baseOptions);
}
export function useEcoverseListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<EcoverseListQuery, EcoverseListQueryVariables>
) {
  return Apollo.useLazyQuery<EcoverseListQuery, EcoverseListQueryVariables>(EcoverseListDocument, baseOptions);
}
export type EcoverseListQueryHookResult = ReturnType<typeof useEcoverseListQuery>;
export type EcoverseListLazyQueryHookResult = ReturnType<typeof useEcoverseListLazyQuery>;
export type EcoverseListQueryResult = Apollo.QueryResult<EcoverseListQuery, EcoverseListQueryVariables>;
export const EcoverseNameDocument = gql`
  query ecoverseName {
    name
  }
`;

/**
 * __useEcoverseNameQuery__
 *
 * To run a query within a React component, call `useEcoverseNameQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoverseNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoverseNameQuery({
 *   variables: {
 *   },
 * });
 */
export function useEcoverseNameQuery(
  baseOptions?: Apollo.QueryHookOptions<EcoverseNameQuery, EcoverseNameQueryVariables>
) {
  return Apollo.useQuery<EcoverseNameQuery, EcoverseNameQueryVariables>(EcoverseNameDocument, baseOptions);
}
export function useEcoverseNameLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<EcoverseNameQuery, EcoverseNameQueryVariables>
) {
  return Apollo.useLazyQuery<EcoverseNameQuery, EcoverseNameQueryVariables>(EcoverseNameDocument, baseOptions);
}
export type EcoverseNameQueryHookResult = ReturnType<typeof useEcoverseNameQuery>;
export type EcoverseNameLazyQueryHookResult = ReturnType<typeof useEcoverseNameLazyQuery>;
export type EcoverseNameQueryResult = Apollo.QueryResult<EcoverseNameQuery, EcoverseNameQueryVariables>;
export const EcoverseInfoDocument = gql`
  query ecoverseInfo {
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
    projects {
      id
      textID
      name
      description
      state
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
    opportunities {
      id
      textID
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
export const OpportunityProfileDocument = gql`
  query opportunityProfile($id: Float!) {
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
      groups {
        name
        members {
          name
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
  mutation createRelation($opportunityId: Float!, $relationData: RelationInput!) {
    createRelation(opportunityID: $opportunityId, relationData: $relationData) {
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
 *      opportunityId: // value for 'opportunityId'
 *      relationData: // value for 'relationData'
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
  query relationsList($id: Float!) {
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
export const UpdateOpportunityContextDocument = gql`
  mutation updateOpportunityContext($opportunityID: Float!, $opportunityData: OpportunityInput!) {
    updateOpportunity(ID: $opportunityID, opportunityData: $opportunityData) {
      name
    }
  }
`;
export type UpdateOpportunityContextMutationFn = Apollo.MutationFunction<
  UpdateOpportunityContextMutation,
  UpdateOpportunityContextMutationVariables
>;

/**
 * __useUpdateOpportunityContextMutation__
 *
 * To run a mutation, you first call `useUpdateOpportunityContextMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateOpportunityContextMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateOpportunityContextMutation, { data, loading, error }] = useUpdateOpportunityContextMutation({
 *   variables: {
 *      opportunityID: // value for 'opportunityID'
 *      opportunityData: // value for 'opportunityData'
 *   },
 * });
 */
export function useUpdateOpportunityContextMutation(
  baseOptions?: Apollo.MutationHookOptions<UpdateOpportunityContextMutation, UpdateOpportunityContextMutationVariables>
) {
  return Apollo.useMutation<UpdateOpportunityContextMutation, UpdateOpportunityContextMutationVariables>(
    UpdateOpportunityContextDocument,
    baseOptions
  );
}
export type UpdateOpportunityContextMutationHookResult = ReturnType<typeof useUpdateOpportunityContextMutation>;
export type UpdateOpportunityContextMutationResult = Apollo.MutationResult<UpdateOpportunityContextMutation>;
export type UpdateOpportunityContextMutationOptions = Apollo.BaseMutationOptions<
  UpdateOpportunityContextMutation,
  UpdateOpportunityContextMutationVariables
>;
export const AddUserToOpportunityDocument = gql`
  mutation addUserToOpportunity($opportunityID: Float!, $userID: Float!) {
    addUserToOpportunity(opportunityID: $opportunityID, userID: $userID) {
      name
    }
  }
`;
export type AddUserToOpportunityMutationFn = Apollo.MutationFunction<
  AddUserToOpportunityMutation,
  AddUserToOpportunityMutationVariables
>;

/**
 * __useAddUserToOpportunityMutation__
 *
 * To run a mutation, you first call `useAddUserToOpportunityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddUserToOpportunityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addUserToOpportunityMutation, { data, loading, error }] = useAddUserToOpportunityMutation({
 *   variables: {
 *      opportunityID: // value for 'opportunityID'
 *      userID: // value for 'userID'
 *   },
 * });
 */
export function useAddUserToOpportunityMutation(
  baseOptions?: Apollo.MutationHookOptions<AddUserToOpportunityMutation, AddUserToOpportunityMutationVariables>
) {
  return Apollo.useMutation<AddUserToOpportunityMutation, AddUserToOpportunityMutationVariables>(
    AddUserToOpportunityDocument,
    baseOptions
  );
}
export type AddUserToOpportunityMutationHookResult = ReturnType<typeof useAddUserToOpportunityMutation>;
export type AddUserToOpportunityMutationResult = Apollo.MutationResult<AddUserToOpportunityMutation>;
export type AddUserToOpportunityMutationOptions = Apollo.BaseMutationOptions<
  AddUserToOpportunityMutation,
  AddUserToOpportunityMutationVariables
>;
export const CreateActorDocument = gql`
  mutation createActor($actorData: ActorInput!, $actorGroupID: Float!) {
    createActor(actorData: $actorData, actorGroupID: $actorGroupID) {
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
 *      actorData: // value for 'actorData'
 *      actorGroupID: // value for 'actorGroupID'
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
  query opportunityActorGroups($id: Float!) {
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
  mutation updateActor($actorData: ActorInput!, $ID: Float!) {
    updateActor(actorData: $actorData, ID: $ID) {
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
 *      actorData: // value for 'actorData'
 *      ID: // value for 'ID'
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
  mutation removeActor($ID: Float!) {
    removeActor(ID: $ID)
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
 *      ID: // value for 'ID'
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
  mutation removeRelation($ID: Float!) {
    removeRelation(ID: $ID)
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
 *      ID: // value for 'ID'
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
  query queryOpportunityRelations($id: Float!) {
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
  mutation updateAspect($aspectData: AspectInput!, $ID: Float!) {
    updateAspect(aspectData: $aspectData, ID: $ID) {
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
 *      aspectData: // value for 'aspectData'
 *      ID: // value for 'ID'
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
  query opportunityAspects($id: Float!) {
    opportunity(ID: $id) {
      aspects {
        title
        framing
        explanation
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
  mutation removeAspect($ID: Float!) {
    removeAspect(ID: $ID)
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
 *      ID: // value for 'ID'
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
  mutation createAspect($aspectData: AspectInput!, $opportunityID: Float!) {
    createAspect(aspectData: $aspectData, opportunityID: $opportunityID) {
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
 *      aspectData: // value for 'aspectData'
 *      opportunityID: // value for 'opportunityID'
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
  mutation createActorGroup($actorGroupData: ActorGroupInput!, $opportunityID: Float!) {
    createActorGroup(actorGroupData: $actorGroupData, opportunityID: $opportunityID) {
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
 *      actorGroupData: // value for 'actorGroupData'
 *      opportunityID: // value for 'opportunityID'
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
  mutation removeReference($ID: Float!) {
    removeReference(ID: $ID)
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
 *      ID: // value for 'ID'
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
  mutation removeOpportunity($ID: Float!) {
    removeOpportunity(ID: $ID)
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
 *      ID: // value for 'ID'
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
export const ProjectProfileDocument = gql`
  query projectProfile($id: Float!) {
    project(ID: $id) {
      ...ProjectDetails
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
  mutation createProject($opportunityID: Float!, $project: ProjectInput!) {
    createProject(opportunityID: $opportunityID, projectData: $project) {
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
 *      opportunityID: // value for 'opportunityID'
 *      project: // value for 'project'
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
  query challengeUserIds($id: Float!) {
    challenge(ID: $id) {
      contributors {
        id
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
  query opportunityUserIds($id: Float!) {
    opportunity(ID: $id) {
      groups {
        members {
          id
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
        groups {
          name
        }
        challenges {
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
