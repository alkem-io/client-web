import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Context = {
  __typename?: 'Context';
  id: Scalars['ID'];
  /** A one line description */
  tagline?: Maybe<Scalars['String']>;
  /** A detailed description of the current situation */
  background?: Maybe<Scalars['String']>;
  /** The goal that is being pursued */
  vision?: Maybe<Scalars['String']>;
  /** What is the potential impact? */
  impact?: Maybe<Scalars['String']>;
  /** Who should get involved in this challenge */
  who?: Maybe<Scalars['String']>;
  /** A list of URLs to relevant information. */
  references?: Maybe<Array<Reference>>;
};

export type Tagset = {
  __typename?: 'Tagset';
  id: Scalars['ID'];
  name: Scalars['String'];
  tags: Array<Scalars['String']>;
};

export type Profile = {
  __typename?: 'Profile';
  id: Scalars['ID'];
  /** A list of URLs to relevant information. */
  references?: Maybe<Array<Reference>>;
  /** A list of named tagsets, each of which has a list of tags. */
  tagsets?: Maybe<Array<Tagset>>;
  /** A URI that points to the location of an avatar, either on a shared location or a gravatar */
  avatar?: Maybe<Scalars['String']>;
  /** A short description of the entity associated with this profile. */
  description?: Maybe<Scalars['String']>;
};

export type Reference = {
  __typename?: 'Reference';
  id: Scalars['ID'];
  name: Scalars['String'];
  uri: Scalars['String'];
  description: Scalars['String'];
};

export type Template = {
  __typename?: 'Template';
  id: Scalars['ID'];
  name: Scalars['String'];
  description: Scalars['String'];
  /** The set of user types that are available within this template */
  users?: Maybe<Array<User>>;
};

export type User = {
  __typename?: 'User';
  id: Scalars['ID'];
  name: Scalars['String'];
  /** The unique personal identifier (upn) for the account associated with this user profile */
  accountUpn: Scalars['String'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  email: Scalars['String'];
  phone: Scalars['String'];
  city: Scalars['String'];
  country: Scalars['String'];
  gender: Scalars['String'];
  /** The profile for this user */
  profile?: Maybe<Profile>;
  /** The last timestamp, in seconds, when this user was modified - either via creation or via update. Note: updating of profile data or group memberships does not update this field. */
  lastModified?: Maybe<Scalars['Int']>;
  /** An overview of the groups this user is a memberof. Note: all groups are returned without members to avoid recursion. */
  memberof?: Maybe<MemberOf>;
};

export type Actor = {
  __typename?: 'Actor';
  id: Scalars['ID'];
  name: Scalars['String'];
  /** A description of this actor */
  description?: Maybe<Scalars['String']>;
  /** A value derived by this actor */
  value?: Maybe<Scalars['String']>;
  /** The change / effort required of this actor */
  impact?: Maybe<Scalars['String']>;
};

export type ActorGroup = {
  __typename?: 'ActorGroup';
  id: Scalars['ID'];
  name: Scalars['String'];
  /** A description of this group of actors */
  description?: Maybe<Scalars['String']>;
  /** The set of actors in this actor group */
  actors?: Maybe<Array<Actor>>;
};

export type Project = {
  __typename?: 'Project';
  id: Scalars['ID'];
  /** A short text identifier for this Opportunity */
  textID: Scalars['String'];
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  /** The maturity phase of the project i.e. new, being refined, committed, in-progress, closed etc */
  state?: Maybe<Scalars['String']>;
  /** The set of tags for the project */
  tagset?: Maybe<Tagset>;
  /** The set of aspects for this Project. Note: likley to change. */
  aspects?: Maybe<Array<Aspect>>;
};

export type Aspect = {
  __typename?: 'Aspect';
  id: Scalars['ID'];
  title: Scalars['String'];
  framing: Scalars['String'];
  explanation: Scalars['String'];
};

export type Relation = {
  __typename?: 'Relation';
  id: Scalars['ID'];
  type: Scalars['String'];
  actorName: Scalars['String'];
  actorType: Scalars['String'];
  actorRole: Scalars['String'];
  description: Scalars['String'];
};

export type Opportunity = {
  __typename?: 'Opportunity';
  id: Scalars['ID'];
  /** The name of the Opportunity */
  name: Scalars['String'];
  /** A short text identifier for this Opportunity */
  textID: Scalars['String'];
  /** The maturity phase of the Opportunity i.e. new, being refined, ongoing etc */
  state?: Maybe<Scalars['String']>;
  /** The shared understanding for the opportunity */
  context?: Maybe<Context>;
  /** The set of projects within the context of this Opportunity */
  projects?: Maybe<Array<Project>>;
  /** Groups of users related to a Opportunity. */
  groups?: Maybe<Array<UserGroup>>;
  /** All users that are contributing to this Opportunity. */
  contributors?: Maybe<Array<User>>;
  /** The set of actor groups within the context of this Opportunity. */
  actorGroups?: Maybe<Array<ActorGroup>>;
  /** The set of aspects within the context of this Opportunity. */
  aspects?: Maybe<Array<Aspect>>;
  /** The set of relations within the context of this Opportunity. */
  relations?: Maybe<Array<Relation>>;
};

export type UserGroup = {
  __typename?: 'UserGroup';
  id: Scalars['ID'];
  name: Scalars['String'];
  /** The set of users that are members of this group */
  members?: Maybe<Array<User>>;
  /** The focal point for this group */
  focalPoint?: Maybe<User>;
  /** The profile for the user group */
  profile?: Maybe<Profile>;
  /** Containing entity for this UserGroup. */
  parent?: Maybe<UserGroupParent>;
};

export type UserGroupParent = Ecoverse | Challenge | Opportunity | Organisation;

export type Organisation = {
  __typename?: 'Organisation';
  id: Scalars['ID'];
  name: Scalars['String'];
  /** Groups defined on this organisation. */
  groups?: Maybe<Array<UserGroup>>;
  /** Users that are contributing to this organisation. */
  members?: Maybe<Array<User>>;
  /** The profile for this organisation. */
  profile: Profile;
};

export type Ecoverse = {
  __typename?: 'Ecoverse';
  id: Scalars['ID'];
  name: Scalars['String'];
  /** The organisation that hosts this Ecoverse instance */
  host?: Maybe<Organisation>;
  /** The shared understanding for the Ecoverse */
  context?: Maybe<Context>;
  /** The set of groups at the Ecoverse level */
  groups?: Maybe<Array<UserGroup>>;
  /** The set of partner organisations associated with this Ecoverse */
  organisations?: Maybe<Array<Organisation>>;
  /** The Challenges hosted by the Ecoverse */
  challenges?: Maybe<Array<Challenge>>;
  /** The set of templates registered with this Ecoverse */
  templates?: Maybe<Array<Template>>;
  /** The set of tags for the ecoverse */
  tagset?: Maybe<Tagset>;
};

export type Challenge = {
  __typename?: 'Challenge';
  id: Scalars['ID'];
  /** The name of the challenge */
  name: Scalars['String'];
  /** A short text identifier for this challenge */
  textID: Scalars['String'];
  /** The shared understanding for the challenge */
  context?: Maybe<Context>;
  /** The leads for the challenge. The focal point for the user group is the primary challenge lead. */
  leadOrganisations: Array<Organisation>;
  /** The maturity phase of the challenge i.e. new, being refined, ongoing etc */
  state?: Maybe<Scalars['String']>;
  /** The set of tags for the challenge */
  tagset?: Maybe<Tagset>;
  /** Groups of users related to a challenge. */
  groups?: Maybe<Array<UserGroup>>;
  /** The set of opportunities within this challenge. */
  opportunities?: Maybe<Array<Opportunity>>;
  /** All users that are contributing to this challenge. */
  contributors?: Maybe<Array<User>>;
};

export type MemberOf = {
  __typename?: 'MemberOf';
  /** References to the groups the user is in at the ecoverse level */
  groups: Array<UserGroup>;
  /** References to the challenges the user is a member of */
  challenges: Array<Challenge>;
  /** References to the orgnaisaitons the user is a member of */
  organisations: Array<Organisation>;
};

export type SearchResultEntry = {
  __typename?: 'SearchResultEntry';
  /** The score for this search result; more matches means a higher score. */
  score?: Maybe<Scalars['Float']>;
  /** The terms that were matched for this result */
  terms?: Maybe<Array<Scalars['String']>>;
  /** Each search result contains either a User or UserGroup */
  result?: Maybe<SearchResult>;
};

export type SearchResult = User | UserGroup;

export type ApiConfig = {
  __typename?: 'ApiConfig';
  /** Configuration payload for the Cherrytwist API. */
  resourceScope: Scalars['String'];
};

export type MsalAuth = {
  __typename?: 'MsalAuth';
  /** Cherrytwist Web Client App Registration Client Id. */
  clientId: Scalars['String'];
  /** Azure Active Directory OpenID Connect Authority. */
  authority: Scalars['String'];
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

export type Scope = {
  __typename?: 'Scope';
  /** OpenID Scopes. */
  scopes: Array<Scalars['String']>;
};

export type AadConfig = {
  __typename?: 'AadConfig';
  /** Config for MSAL authentication library on Cherrytwist Web Client. */
  msalConfig: MsalConfig;
  /** Config for accessing the Cherrytwist API. */
  apiConfig: ApiConfig;
  /** Scopes required for the user login. For OpenID Connect login flows, these are openid and profile + optionally offline_access if refresh tokens are utilized. */
  loginRequest: Scope;
  /** Scopes for requesting a token. This is the Cherrytwist API app registration URI + ./default. */
  tokenRequest: Scope;
  /** Scopes for silent token acquisition. Cherrytwist API scope + OpenID mandatory scopes. */
  silentRequest: Scope;
  /** Is the client and server authentication enabled? */
  authEnabled: Scalars['Boolean'];
};

export type OpportunityTemplate = {
  __typename?: 'OpportunityTemplate';
  /** Template opportunity name. */
  name: Scalars['String'];
  /** Template actor groups. */
  actorGroups?: Maybe<Array<Scalars['String']>>;
  /** Template aspects. */
  aspects?: Maybe<Array<Scalars['String']>>;
  /** Template relations. */
  relations?: Maybe<Array<Scalars['String']>>;
};

export type UserTemplate = {
  __typename?: 'UserTemplate';
  /** Template user name. */
  name: Scalars['String'];
  /** Template tagsets. */
  tagsets?: Maybe<Array<Scalars['String']>>;
};

export type UxTemplate = {
  __typename?: 'UxTemplate';
  /** Template name. */
  name: Scalars['String'];
  /** Template description. */
  description: Scalars['String'];
  /** Users template. */
  users: Array<UserTemplate>;
  /** Opportunities template. */
  opportunities: Array<OpportunityTemplate>;
};

export type ClientMetadata = {
  __typename?: 'ClientMetadata';
  /** Cherrytwist Client UX template. */
  template: UxTemplate;
  /** Cherrytwist Client AAD config. */
  aadConfig: AadConfig;
};

export type ServerMetadata = {
  __typename?: 'ServerMetadata';
  /** Cherrytwist Server version in the format {major.minor.patch} - using SemVer. */
  version: Scalars['String'];
};

export type Metadata = {
  __typename?: 'Metadata';
  /** Cherrytwist API Server Metadata. */
  serverMetadata: ServerMetadata;
  /** Cherrytwist Web Client Metadata. */
  clientMetadata: ClientMetadata;
};

export type Query = {
  __typename?: 'Query';
  /** The currently logged in user */
  me: User;
  /** All opportunities within the ecoverse */
  opportunities: Array<Opportunity>;
  /** A particular opportunitiy, identified by the ID */
  opportunity: Opportunity;
  /** All projects within this ecoverse */
  projects: Array<Project>;
  /** A particular Project, identified by the ID */
  project: Project;
  /** The name for this ecoverse */
  name: Scalars['String'];
  /** The host organisation for the ecoverse */
  host: Organisation;
  /** The shared understanding for this ecoverse */
  context: Context;
  /** The members of this this ecoverse */
  users: Array<User>;
  /** A particular user, identified by the ID or by email */
  user: User;
  /** The members of this this ecoverse filtered by list of IDs. */
  usersById: Array<User>;
  /** All groups at the ecoverse level */
  groups: Array<UserGroup>;
  /** All groups that have the provided tag */
  groupsWithTag: Array<UserGroup>;
  /** The user group with the specified id anywhere in the ecoverse */
  group: UserGroup;
  /** All challenges */
  challenges: Array<Challenge>;
  /** All templates */
  templates: Array<Template>;
  /** A particular challenge */
  challenge: Challenge;
  /** All organisations */
  organisations: Array<Organisation>;
  /** A particular organisation */
  organisation: Organisation;
  /** The tagset associated with this Ecoverse */
  tagset: Tagset;
  /** Search the ecoverse for terms supplied */
  search: Array<SearchResultEntry>;
  /** CT Web Client Configuration */
  clientConfig: AadConfig;
  /** CT Web Client Configuration */
  metadata: Metadata;
};

export type QueryOpportunityArgs = {
  ID: Scalars['Float'];
};

export type QueryProjectArgs = {
  ID: Scalars['Float'];
};

export type QueryUserArgs = {
  ID: Scalars['String'];
};

export type QueryUsersByIdArgs = {
  IDs: Array<Scalars['String']>;
};

export type QueryGroupsWithTagArgs = {
  tag: Scalars['String'];
};

export type QueryGroupArgs = {
  ID: Scalars['Float'];
};

export type QueryChallengeArgs = {
  ID: Scalars['Float'];
};

export type QueryOrganisationArgs = {
  ID: Scalars['Float'];
};

export type QuerySearchArgs = {
  searchData: SearchInput;
};

export type SearchInput = {
  /** The terms to be searched for within this Ecoverse. Max 5. */
  terms: Array<Scalars['String']>;
  /** Expand the search to includes Tagsets with the provided names. Max 2. */
  tagsetNames?: Maybe<Array<Scalars['String']>>;
  /** Restrict the search to only the specified entity types. Values allowed: user, group. Default is both. */
  typesFilter?: Maybe<Array<Scalars['String']>>;
  /** Restrict the search to only the specified challenges. Default is all Challenges. */
  challengesFilter?: Maybe<Array<Scalars['Float']>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Update the base user information. Note: email address cannot be updated. */
  updateUser: User;
  /** Removes the reference  with the specified ID */
  removeReference: Scalars['Boolean'];
  /** Replace the set of tags in a tagset with the provided tags */
  replaceTagsOnTagset: Tagset;
  /** Add the provided tag to the tagset with the given ID */
  addTagToTagset: Tagset;
  /** Creates a new tagset with the specified name for the profile with given id */
  createTagsetOnProfile: Tagset;
  /** Creates a new reference with the specified name for the profile with given id */
  createReferenceOnProfile: Reference;
  /** Updates the fields on the Profile, such as avatar location or description */
  updateProfile: Scalars['Boolean'];
  /** Adds the user with the given identifier to the specified user group */
  addUserToGroup: Scalars['Boolean'];
  /** Remove the user with the given identifier to the specified user group */
  removeUserFromGroup: UserGroup;
  /** Assign the user with the given ID as focal point for the given group */
  assignGroupFocalPoint?: Maybe<UserGroup>;
  /** Remove the focal point for the given group */
  removeGroupFocalPoint?: Maybe<UserGroup>;
  /** Creates a new user group for the challenge with the given id */
  createGroupOnChallenge: UserGroup;
  /** Creates a new Opportunity for the challenge with the given id */
  createOpportunityOnChallenge: Opportunity;
  /** Updates the specified Challenge with the provided data (merge) */
  updateChallenge: Challenge;
  /** Removes the Challenge with the specified ID */
  removeChallenge: Scalars['Boolean'];
  /** Adds the user with the given identifier as a member of the specified challenge */
  addUserToChallenge: UserGroup;
  /** Adds the user with the given identifier as a member of the specified opportunity */
  addUserToOpportunity: UserGroup;
  /** Adds the specified organisation as a lead for the specified challenge */
  addChallengeLead: Scalars['Boolean'];
  /** Remove the specified organisation as a lead for the specified challenge */
  removeChallengeLead: Scalars['Boolean'];
  /** Creates a new reference with the specified name for the context with given id */
  createReferenceOnContext: Reference;
  /** Updates the specified Opportunity with the provided data (merge) */
  updateOpportunity: Opportunity;
  /** Removes the Opportunity with the specified ID */
  removeOpportunity: Scalars['Boolean'];
  /** Create a new Project on the Opportunity identified by the ID */
  createProject: Project;
  /** Create a new aspect on the Opportunity identified by the ID */
  createAspect: Aspect;
  /** Create a new actor group on the Opportunity identified by the ID */
  createActorGroup: ActorGroup;
  /** Create a new relation on the Opportunity identified by the ID */
  createRelation: Relation;
  /** Creates a new user group for the opportunity with the given id */
  createGroupOnOpportunity: UserGroup;
  /** Removes the aspect with the specified ID */
  removeAspect: Scalars['Boolean'];
  /** Updates the aspect with the specified ID */
  updateAspect: Aspect;
  /** Removes the actor  with the specified ID */
  removeActor: Scalars['Boolean'];
  /** Updates the actor with the specified ID with the supplied data */
  updateActor: Actor;
  /** Create a new actor on the ActorGroup with the specified ID */
  createActor: Actor;
  /** Removes the actor group with the specified ID */
  removeActorGroup: Scalars['Boolean'];
  /** Removes the relation with the specified ID */
  removeRelation: Scalars['Boolean'];
  /** Removes the Project with the specified ID */
  removeProject: Scalars['Boolean'];
  /** Updates the Project with the specified ID */
  updateProject: Project;
  /** Create a new aspect on the Project identified by the ID */
  createAspectOnProject: Aspect;
  /** Creates a new user group for the organisation with the given id */
  createGroupOnOrganisation: UserGroup;
  /** Updates the organisation with the given data */
  updateOrganisation: Organisation;
  /** Creates a new user group at the ecoverse level */
  createGroupOnEcoverse: UserGroup;
  /** Updates the Ecoverse with the provided data */
  updateEcoverse: Ecoverse;
  /** Creates a new user as a member of the ecoverse, including an account if enabled */
  createUser: User;
  /** Creates a new template for the population of entities within tis ecoverse */
  createTemplate: Template;
  /** Creates a new user as a member of the ecoverse, without an account */
  createUserProfile: User;
  /** Removes the specified user from the ecoverse */
  removeUser: Scalars['Boolean'];
  /** Updates the user account password */
  updateUserAccountPassword: Scalars['Boolean'];
  /** Creates a new challenge and registers it with the ecoverse */
  createChallenge: Challenge;
  /** Creates a new organisation and registers it with the ecoverse */
  createOrganisation: Organisation;
  /** Creates a new account on the identity provider for the user profile with the given ID and with the given one time password */
  createUserAccount: Scalars['Boolean'];
};

export type MutationUpdateUserArgs = {
  userData: UserInput;
  userID: Scalars['Float'];
};

export type MutationRemoveReferenceArgs = {
  ID: Scalars['Float'];
};

export type MutationReplaceTagsOnTagsetArgs = {
  tags: Array<Scalars['String']>;
  tagsetID: Scalars['Float'];
};

export type MutationAddTagToTagsetArgs = {
  tag: Scalars['String'];
  tagsetID: Scalars['Float'];
};

export type MutationCreateTagsetOnProfileArgs = {
  tagsetName: Scalars['String'];
  profileID: Scalars['Float'];
};

export type MutationCreateReferenceOnProfileArgs = {
  referenceInput: ReferenceInput;
  profileID: Scalars['Float'];
};

export type MutationUpdateProfileArgs = {
  profileData: ProfileInput;
  ID: Scalars['Float'];
};

export type MutationAddUserToGroupArgs = {
  groupID: Scalars['Float'];
  userID: Scalars['Float'];
};

export type MutationRemoveUserFromGroupArgs = {
  groupID: Scalars['Float'];
  userID: Scalars['Float'];
};

export type MutationAssignGroupFocalPointArgs = {
  groupID: Scalars['Float'];
  userID: Scalars['Float'];
};

export type MutationRemoveGroupFocalPointArgs = {
  groupID: Scalars['Float'];
};

export type MutationCreateGroupOnChallengeArgs = {
  groupName: Scalars['String'];
  challengeID: Scalars['Float'];
};

export type MutationCreateOpportunityOnChallengeArgs = {
  opportunityData: OpportunityInput;
  challengeID: Scalars['Float'];
};

export type MutationUpdateChallengeArgs = {
  challengeData: ChallengeInput;
  challengeID: Scalars['Float'];
};

export type MutationRemoveChallengeArgs = {
  ID: Scalars['Float'];
};

export type MutationAddUserToChallengeArgs = {
  challengeID: Scalars['Float'];
  userID: Scalars['Float'];
};

export type MutationAddUserToOpportunityArgs = {
  opportunityID: Scalars['Float'];
  userID: Scalars['Float'];
};

export type MutationAddChallengeLeadArgs = {
  challengeID: Scalars['Float'];
  organisationID: Scalars['Float'];
};

export type MutationRemoveChallengeLeadArgs = {
  challengeID: Scalars['Float'];
  organisationID: Scalars['Float'];
};

export type MutationCreateReferenceOnContextArgs = {
  referenceInput: ReferenceInput;
  contextID: Scalars['Float'];
};

export type MutationUpdateOpportunityArgs = {
  opportunityData: OpportunityInput;
  ID: Scalars['Float'];
};

export type MutationRemoveOpportunityArgs = {
  ID: Scalars['Float'];
};

export type MutationCreateProjectArgs = {
  projectData: ProjectInput;
  opportunityID: Scalars['Float'];
};

export type MutationCreateAspectArgs = {
  aspectData: AspectInput;
  opportunityID: Scalars['Float'];
};

export type MutationCreateActorGroupArgs = {
  actorGroupData: ActorGroupInput;
  opportunityID: Scalars['Float'];
};

export type MutationCreateRelationArgs = {
  relationData: RelationInput;
  opportunityID: Scalars['Float'];
};

export type MutationCreateGroupOnOpportunityArgs = {
  groupName: Scalars['String'];
  opportunityID: Scalars['Float'];
};

export type MutationRemoveAspectArgs = {
  ID: Scalars['Float'];
};

export type MutationUpdateAspectArgs = {
  aspectData: AspectInput;
  ID: Scalars['Float'];
};

export type MutationRemoveActorArgs = {
  ID: Scalars['Float'];
};

export type MutationUpdateActorArgs = {
  actorData: ActorInput;
  ID: Scalars['Float'];
};

export type MutationCreateActorArgs = {
  actorData: ActorInput;
  actorGroupID: Scalars['Float'];
};

export type MutationRemoveActorGroupArgs = {
  ID: Scalars['Float'];
};

export type MutationRemoveRelationArgs = {
  ID: Scalars['Float'];
};

export type MutationRemoveProjectArgs = {
  ID: Scalars['Float'];
};

export type MutationUpdateProjectArgs = {
  projectData: ProjectInput;
  ID: Scalars['Float'];
};

export type MutationCreateAspectOnProjectArgs = {
  aspectData: AspectInput;
  projectID: Scalars['Float'];
};

export type MutationCreateGroupOnOrganisationArgs = {
  groupName: Scalars['String'];
  orgID: Scalars['Float'];
};

export type MutationUpdateOrganisationArgs = {
  organisationData: OrganisationInput;
  orgID: Scalars['Float'];
};

export type MutationCreateGroupOnEcoverseArgs = {
  groupName: Scalars['String'];
};

export type MutationUpdateEcoverseArgs = {
  ecoverseData: EcoverseInput;
};

export type MutationCreateUserArgs = {
  userData: UserInput;
};

export type MutationCreateTemplateArgs = {
  templateData: TemplateInput;
};

export type MutationCreateUserProfileArgs = {
  userData: UserInput;
};

export type MutationRemoveUserArgs = {
  userID: Scalars['Float'];
};

export type MutationCreateChallengeArgs = {
  challengeData: ChallengeInput;
};

export type MutationCreateOrganisationArgs = {
  organisationData: OrganisationInput;
};

export type MutationCreateUserAccountArgs = {
  password: Scalars['String'];
  userID: Scalars['Float'];
};

export type UserInput = {
  accountUpn?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  firstName?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  /** Email address is required for creating a new user */
  email?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  city?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  gender?: Maybe<Scalars['String']>;
  aadPassword?: Maybe<Scalars['String']>;
  profileData?: Maybe<ProfileInput>;
};

export type ProfileInput = {
  avatar?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  tagsetsData?: Maybe<Array<TagsetInput>>;
  referencesData?: Maybe<Array<ReferenceInput>>;
};

export type TagsetInput = {
  name?: Maybe<Scalars['String']>;
  tags?: Maybe<Array<Scalars['String']>>;
};

export type ReferenceInput = {
  name?: Maybe<Scalars['String']>;
  uri?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};

export type OpportunityInput = {
  name?: Maybe<Scalars['String']>;
  textID?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
  context?: Maybe<ContextInput>;
};

export type ContextInput = {
  background?: Maybe<Scalars['String']>;
  vision?: Maybe<Scalars['String']>;
  tagline?: Maybe<Scalars['String']>;
  who?: Maybe<Scalars['String']>;
  impact?: Maybe<Scalars['String']>;
  /** Set of references to _replace_ the existing references */
  references?: Maybe<Array<ReferenceInput>>;
};

export type ChallengeInput = {
  name?: Maybe<Scalars['String']>;
  textID?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
  context?: Maybe<ContextInput>;
  tags?: Maybe<Array<Scalars['String']>>;
};

export type ProjectInput = {
  name?: Maybe<Scalars['String']>;
  textID?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
};

export type AspectInput = {
  title?: Maybe<Scalars['String']>;
  framing?: Maybe<Scalars['String']>;
  explanation?: Maybe<Scalars['String']>;
};

export type ActorGroupInput = {
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};

export type RelationInput = {
  type?: Maybe<Scalars['String']>;
  actorName?: Maybe<Scalars['String']>;
  actorType?: Maybe<Scalars['String']>;
  actorRole?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};

export type ActorInput = {
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
  impact?: Maybe<Scalars['String']>;
};

export type OrganisationInput = {
  /** The name for this organisation */
  name?: Maybe<Scalars['String']>;
};

export type EcoverseInput = {
  /** The new name for the ecoverse */
  name?: Maybe<Scalars['String']>;
  /** Updated context for the ecoverse; will be merged with existing context */
  context?: Maybe<ContextInput>;
  /** The set of tags to apply to this ecoverse */
  tags?: Maybe<Array<Scalars['String']>>;
};

export type TemplateInput = {
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
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

export type ChallengeNameQueryVariables = Exact<{
  id: Scalars['Float'];
}>;

export type ChallengeNameQuery = { __typename?: 'Query' } & {
  challenge: { __typename?: 'Challenge' } & Pick<Challenge, 'name'>;
};

export type ChallengeGroupsQueryVariables = Exact<{
  id: Scalars['Float'];
}>;

export type ChallengeGroupsQuery = { __typename?: 'Query' } & {
  challenge: { __typename?: 'Challenge' } & {
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
  opportunity: { __typename?: 'Opportunity' } & Pick<Opportunity, 'name'>;
};

export type ChallengeProfileQueryVariables = Exact<{
  id: Scalars['Float'];
}>;

export type ChallengeProfileQuery = { __typename?: 'Query' } & {
  challenge: { __typename?: 'Challenge' } & Pick<Challenge, 'id' | 'textID' | 'name'> & {
      context?: Maybe<
        { __typename?: 'Context' } & Pick<Context, 'tagline' | 'background' | 'vision' | 'impact' | 'who'> & {
            references?: Maybe<Array<{ __typename?: 'Reference' } & Pick<Reference, 'name' | 'uri' | 'description'>>>;
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
        { __typename?: 'Organisation' } & Pick<Organisation, 'name'> & {
            profile: { __typename?: 'Profile' } & Pick<Profile, 'avatar'>;
          }
      >;
    };
};

export type UpdateChallengeContextMutationVariables = Exact<{
  challengeID: Scalars['Float'];
  challengeData: ChallengeInput;
}>;

export type UpdateChallengeContextMutation = { __typename?: 'Mutation' } & {
  updateChallenge: { __typename?: 'Challenge' } & Pick<Challenge, 'name'>;
};

export type AddUserToChallengeMutationVariables = Exact<{
  challengeID: Scalars['Float'];
  userID: Scalars['Float'];
}>;

export type AddUserToChallengeMutation = { __typename?: 'Mutation' } & {
  addUserToChallenge: { __typename?: 'UserGroup' } & Pick<UserGroup, 'name'>;
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
        | ({ __typename: 'Ecoverse' } & Pick<Ecoverse, 'name'>)
        | ({ __typename: 'Challenge' } & Pick<Challenge, 'name'>)
        | ({ __typename: 'Opportunity' } & Pick<Opportunity, 'name'>)
        | ({ __typename: 'Organisation' } & Pick<Organisation, 'name'>)
      >;
      members?: Maybe<Array<{ __typename?: 'User' } & Pick<User, 'id' | 'name'>>>;
      profile?: Maybe<
        { __typename?: 'Profile' } & Pick<Profile, 'avatar' | 'description'> & {
            references?: Maybe<Array<{ __typename?: 'Reference' } & Pick<Reference, 'name' | 'description'>>>;
            tagsets?: Maybe<Array<{ __typename?: 'Tagset' } & Pick<Tagset, 'name' | 'tags'>>>;
          }
      >;
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
    profile: { __typename?: 'Profile' } & {
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
            references?: Maybe<Array<{ __typename?: 'Reference' } & Pick<Reference, 'name' | 'uri'>>>;
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

export type AspectsTemplateListQueryVariables = Exact<{ [key: string]: never }>;

export type AspectsTemplateListQuery = { __typename?: 'Query' } & {
  metadata: { __typename?: 'Metadata' } & {
    clientMetadata: { __typename?: 'ClientMetadata' } & {
      template: { __typename?: 'UxTemplate' } & {
        opportunities: Array<{ __typename?: 'OpportunityTemplate' } & Pick<OpportunityTemplate, 'aspects'>>;
      };
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
      { __typename?: 'Profile' } & Pick<Profile, 'description' | 'avatar'> & {
          references?: Maybe<Array<{ __typename?: 'Reference' } & Pick<Reference, 'name' | 'uri'>>>;
          tagsets?: Maybe<Array<{ __typename?: 'Tagset' } & Pick<Tagset, 'name' | 'tags'>>>;
        }
    >;
  };

export type UserMembersFragment = { __typename?: 'User' } & {
  memberof?: Maybe<
    { __typename?: 'MemberOf' } & {
      groups: Array<{ __typename?: 'UserGroup' } & Pick<UserGroup, 'id' | 'name'>>;
      challenges: Array<{ __typename?: 'Challenge' } & Pick<Challenge, 'id' | 'name' | 'textID'>>;
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
  ids: Array<Scalars['String']>;
}>;

export type UserAvatarsQuery = { __typename?: 'Query' } & {
  usersById: Array<
    { __typename?: 'User' } & Pick<User, 'name'> & {
        profile?: Maybe<{ __typename?: 'Profile' } & Pick<Profile, 'avatar'>>;
      }
  >;
};

export type UserProfileQueryVariables = Exact<{ [key: string]: never }>;

export type UserProfileQuery = { __typename?: 'Query' } & {
  me: { __typename?: 'User' } & UserDetailsFragment & UserMembersFragment;
};

export type UserCardDataQueryVariables = Exact<{
  ids: Array<Scalars['String']>;
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
      description
      avatar
      references {
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
    }
  }
`;
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
export const ChallengeNameDocument = gql`
  query challengeName($id: Float!) {
    challenge(ID: $id) {
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
        name
        profile {
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
  mutation updateChallengeContext($challengeID: Float!, $challengeData: ChallengeInput!) {
    updateChallenge(challengeID: $challengeID, challengeData: $challengeData) {
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
 *      challengeID: // value for 'challengeID'
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
export const AspectsTemplateListDocument = gql`
  query aspectsTemplateList {
    metadata {
      clientMetadata {
        template {
          opportunities {
            aspects
          }
        }
      }
    }
  }
`;

/**
 * __useAspectsTemplateListQuery__
 *
 * To run a query within a React component, call `useAspectsTemplateListQuery` and pass it any options that fit your needs.
 * When your component renders, `useAspectsTemplateListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAspectsTemplateListQuery({
 *   variables: {
 *   },
 * });
 */
export function useAspectsTemplateListQuery(
  baseOptions?: Apollo.QueryHookOptions<AspectsTemplateListQuery, AspectsTemplateListQueryVariables>
) {
  return Apollo.useQuery<AspectsTemplateListQuery, AspectsTemplateListQueryVariables>(
    AspectsTemplateListDocument,
    baseOptions
  );
}
export function useAspectsTemplateListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<AspectsTemplateListQuery, AspectsTemplateListQueryVariables>
) {
  return Apollo.useLazyQuery<AspectsTemplateListQuery, AspectsTemplateListQueryVariables>(
    AspectsTemplateListDocument,
    baseOptions
  );
}
export type AspectsTemplateListQueryHookResult = ReturnType<typeof useAspectsTemplateListQuery>;
export type AspectsTemplateListLazyQueryHookResult = ReturnType<typeof useAspectsTemplateListLazyQuery>;
export type AspectsTemplateListQueryResult = Apollo.QueryResult<
  AspectsTemplateListQuery,
  AspectsTemplateListQueryVariables
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
      name
      profile {
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
