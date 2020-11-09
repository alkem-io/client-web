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

export type Tagset = {
  __typename?: 'Tagset';
  id: Scalars['ID'];
  name: Scalars['String'];
  tags: Array<Scalars['String']>;
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
};

export type Organisation = {
  __typename?: 'Organisation';
  id: Scalars['ID'];
  name: Scalars['String'];
  /** The set of tags for the organisation */
  tagset?: Maybe<Tagset>;
  /** Groups defined on this organisation. */
  groups?: Maybe<Array<UserGroup>>;
  /** Users that are contributing to this organisation. */
  members?: Maybe<Array<User>>;
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

export type Aspect = {
  __typename?: 'Aspect';
  id: Scalars['ID'];
  title: Scalars['String'];
  framing: Scalars['String'];
  explanation: Scalars['String'];
};

export type Project = {
  __typename?: 'Project';
  id: Scalars['ID'];
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  /** The maturity phase of the project i.e. new, being refined, committed, in-progress, closed etc */
  state?: Maybe<Scalars['String']>;
  /** The set of tags for the project */
  tagset?: Maybe<Tagset>;
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
  /** The profile for this Opportunity */
  profile?: Maybe<Profile>;
  /** The set of projects within the context of this Opportunity */
  projects?: Maybe<Array<Project>>;
  /** The set of actor groups within the context of this Opportunity */
  actorGroups?: Maybe<Array<ActorGroup>>;
  /** The set of solution aspects for this Opportunity */
  aspects?: Maybe<Array<Aspect>>;
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
  challengeLeads: Array<Organisation>;
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

export type Reference = {
  __typename?: 'Reference';
  id: Scalars['ID'];
  name: Scalars['String'];
  uri: Scalars['String'];
  description: Scalars['String'];
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

export type MemberOf = {
  __typename?: 'MemberOf';
  /** References to the groups the user is in at the ecoverse level */
  groups: Array<UserGroup>;
  /** References to the challenges the user is a member of */
  challenges: Array<Challenge>;
  /** References to the orgnaisaitons the user is a member of */
  organisations: Array<Organisation>;
};

export type AadClientConfig = {
  __typename?: 'AadClientConfig';
  /** Config for MSAL authentication library on Cherrytwist Web Client. */
  msalConfig: MsalConfig;
  /** Config for accessing the Cherrytwist API. */
  apiConfig: AadApiConfig;
  /** Scopes required for the user login. For OpenID Connect login flows, these are openid and profile + optionally offline_access if refresh tokens are utilized. */
  loginRequest: AadScope;
  /** Scopes for requesting a token. This is the Cherrytwist API app registration URI + ./default. */
  tokenRequest: AadScope;
  /** Scopes for silent token acquisition. Cherrytwist API scope + OpenID mandatory scopes. */
  silentRequest: AadScope;
  /** Is the client and server authentication enabled? */
  authEnabled: Scalars['Boolean'];
};

export type MsalConfig = {
  __typename?: 'MsalConfig';
  /** Azure Active Directory OpenID Connect endpoint configuration. */
  auth: MsalAuth;
  /** Token cache configuration.  */
  cache: MsalCache;
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

export type AadApiConfig = {
  __typename?: 'AadApiConfig';
  /** Configuration payload for the Cherrytwist API. */
  resourceScope: Scalars['String'];
};

export type AadScope = {
  __typename?: 'AadScope';
  /** OpenID Scopes. */
  scopes: Array<Scalars['String']>;
};

export type SearchResultEntry = {
  __typename?: 'SearchResultEntry';
  score: Scalars['Float'];
  /** Each search result contains either a User or UserGroup */
  result?: Maybe<SearchResult>;
};

export type SearchResult = User | UserGroup;

export type Query = {
  __typename?: 'Query';
  /** The currently logged in user */
  me: User;
  /** A particular opportunitiy, identified by the ID */
  opportunity: Opportunity;
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
  /** CT Web Client Configuration */
  clientConfig: AadClientConfig;
  /** Search the ecoverse for terms supplied */
  search: Array<SearchResultEntry>;
};

export type QueryOpportunityArgs = {
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
  /** Adds the user with the given identifier as a member of the specified challenge */
  addUserToChallenge: UserGroup;
  /** Updates the specified Opportunity with the provided data (merge) */
  updateOpportunity: Opportunity;
  /** Create a new aspect on the Opportunity identified by the ID */
  createAspect: Aspect;
  /** Create a new actor group on the Opportunity identified by the ID */
  createActorGroup: ActorGroup;
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
  /** Creates a new challenge and registers it with the ecoverse */
  createChallenge: Challenge;
  /** Creates a new organisation and registers it with the ecoverse */
  createOrganisation: Organisation;
  /** Creates a new user group for the organisation with the given id */
  createGroupOnOrganisation: UserGroup;
  /** Updates the organisation with the given data */
  updateOrganisation: Organisation;
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

export type MutationAddUserToChallengeArgs = {
  challengeID: Scalars['Float'];
  userID: Scalars['Float'];
};

export type MutationUpdateOpportunityArgs = {
  opportunityData: OpportunityInput;
  ID: Scalars['Float'];
};

export type MutationCreateAspectArgs = {
  aspectData: AspectInput;
  opportunityID: Scalars['Float'];
};

export type MutationCreateActorGroupArgs = {
  actorGroupData: ActorGroupInput;
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

export type MutationCreateGroupOnOrganisationArgs = {
  groupName: Scalars['String'];
  orgID: Scalars['Float'];
};

export type MutationUpdateOrganisationArgs = {
  organisationData: OrganisationInput;
  orgID: Scalars['Float'];
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
  tagset?: Maybe<Array<Scalars['String']>>;
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

export type AspectInput = {
  title?: Maybe<Scalars['String']>;
  framing?: Maybe<Scalars['String']>;
  explanation?: Maybe<Scalars['String']>;
};

export type ActorGroupInput = {
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};

export type ActorInput = {
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
  impact?: Maybe<Scalars['String']>;
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

export type OrganisationInput = {
  /** The new name for this organisation */
  name?: Maybe<Scalars['String']>;
  /** The set of tags to apply to this ecoverse */
  tags?: Maybe<Array<Scalars['String']>>;
};

export type UserDetailsFragment = { __typename?: 'User' } & Pick<
  User,
  'id' | 'name' | 'firstName' | 'lastName' | 'email' | 'gender'
> & {
    profile?: Maybe<
      { __typename?: 'Profile' } & Pick<Profile, 'avatar'> & {
          references?: Maybe<Array<{ __typename?: 'Reference' } & Pick<Reference, 'name' | 'uri'>>>;
          tagsets?: Maybe<Array<{ __typename?: 'Tagset' } & Pick<Tagset, 'name' | 'tags'>>>;
        }
    >;
  };

export type UsersQueryVariables = Exact<{ [key: string]: never }>;

export type UsersQuery = { __typename?: 'Query' } & { users: Array<{ __typename?: 'User' } & UserDetailsFragment> };

export type UserQueryVariables = Exact<{
  id: Scalars['String'];
}>;

export type UserQuery = { __typename?: 'Query' } & { user: { __typename?: 'User' } & UserDetailsFragment };

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

export type EcoverseChallengeGroupsQuery = { __typename?: 'Query' } & {
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

export type AddUserToGroupMutationVariables = Exact<{
  groupID: Scalars['Float'];
  userID: Scalars['Float'];
}>;

export type AddUserToGroupMutation = { __typename?: 'Mutation' } & Pick<Mutation, 'addUserToGroup'>;

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
      tagset?: Maybe<{ __typename?: 'Tagset' } & Pick<Tagset, 'name' | 'tags'>>;
      opportunities?: Maybe<Array<{ __typename?: 'Opportunity' } & Pick<Opportunity, 'id' | 'name' | 'textID'>>>;
    };
};

export type SearchQueryVariables = Exact<{
  searchData: SearchInput;
}>;

export type SearchQuery = { __typename?: 'Query' } & {
  search: Array<
    { __typename?: 'SearchResultEntry' } & Pick<SearchResultEntry, 'score'> & {
        result?: Maybe<{ __typename: 'User' } | { __typename: 'UserGroup' }>;
      }
  >;
};

export type ConfigQueryVariables = Exact<{ [key: string]: never }>;

export type ConfigQuery = { __typename?: 'Query' } & {
  clientConfig: { __typename?: 'AadClientConfig' } & Pick<AadClientConfig, 'authEnabled'> & {
      msalConfig: { __typename?: 'MsalConfig' } & {
        auth: { __typename?: 'MsalAuth' } & Pick<MsalAuth, 'authority' | 'clientId' | 'redirectUri'>;
        cache: { __typename?: 'MsalCache' } & Pick<MsalCache, 'cacheLocation' | 'storeAuthStateInCookie'>;
      };
      apiConfig: { __typename?: 'AadApiConfig' } & Pick<AadApiConfig, 'resourceScope'>;
      loginRequest: { __typename?: 'AadScope' } & Pick<AadScope, 'scopes'>;
      tokenRequest: { __typename?: 'AadScope' } & Pick<AadScope, 'scopes'>;
      silentRequest: { __typename?: 'AadScope' } & Pick<AadScope, 'scopes'>;
    };
};

export type EcoverseListQueryVariables = Exact<{ [key: string]: never }>;

export type EcoverseListQuery = { __typename?: 'Query' } & Pick<Query, 'name'> & {
    context: { __typename?: 'Context' } & Pick<Context, 'tagline'>;
    challenges: Array<{ __typename?: 'Challenge' } & Pick<Challenge, 'id' | 'name'>>;
  };

export type EcoverseNameQueryVariables = Exact<{ [key: string]: never }>;

export type EcoverseNameQuery = { __typename?: 'Query' } & Pick<Query, 'name'>;

export type ChallengesQueryVariables = Exact<{ [key: string]: never }>;

export type ChallengesQuery = { __typename?: 'Query' } & {
  challenges: Array<{ __typename?: 'Challenge' } & Pick<Challenge, 'id' | 'name' | 'textID'>>;
};

export type EcoverseDetailsQueryVariables = Exact<{ [key: string]: never }>;

export type EcoverseDetailsQuery = { __typename?: 'Query' } & Pick<Query, 'name'> & {
    context: { __typename?: 'Context' } & Pick<Context, 'tagline' | 'vision' | 'impact' | 'background'> & {
        references?: Maybe<Array<{ __typename?: 'Reference' } & Pick<Reference, 'name' | 'uri'>>>;
      };
    challenges: Array<
      { __typename?: 'Challenge' } & Pick<Challenge, 'id' | 'name' | 'textID'> & {
          context?: Maybe<
            { __typename?: 'Context' } & Pick<Context, 'tagline'> & {
                references?: Maybe<Array<{ __typename?: 'Reference' } & Pick<Reference, 'name' | 'uri'>>>;
              }
          >;
          opportunities?: Maybe<Array<{ __typename?: 'Opportunity' } & Pick<Opportunity, 'id'>>>;
        }
    >;
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

export type UserAvatarsQueryVariables = Exact<{
  ids: Array<Scalars['String']>;
}>;

export type UserAvatarsQuery = { __typename?: 'Query' } & {
  usersById: Array<{ __typename?: 'User' } & { profile?: Maybe<{ __typename?: 'Profile' } & Pick<Profile, 'avatar'>> }>;
};

export const UserDetailsFragmentDoc = gql`
  fragment UserDetails on User {
    id
    name
    firstName
    lastName
    email
    gender
    profile {
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
export const GroupMembersFragmentDoc = gql`
  fragment GroupMembers on User {
    id
    name
    firstName
    lastName
    email
  }
`;
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
    }
  }
  ${UserDetailsFragmentDoc}
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
export function useUserQuery(baseOptions?: Apollo.QueryHookOptions<UserQuery, UserQueryVariables>) {
  return Apollo.useQuery<UserQuery, UserQueryVariables>(UserDocument, baseOptions);
}
export function useUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UserQuery, UserQueryVariables>) {
  return Apollo.useLazyQuery<UserQuery, UserQueryVariables>(UserDocument, baseOptions);
}
export type UserQueryHookResult = ReturnType<typeof useUserQuery>;
export type UserLazyQueryHookResult = ReturnType<typeof useUserLazyQuery>;
export type UserQueryResult = Apollo.QueryResult<UserQuery, UserQueryVariables>;
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
  baseOptions?: Apollo.QueryHookOptions<GroupMembersQuery, GroupMembersQueryVariables>
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
      tagset {
        name
        tags
      }
      opportunities {
        id
        name
        textID
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
  baseOptions?: Apollo.QueryHookOptions<ChallengeProfileQuery, ChallengeProfileQueryVariables>
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
export const SearchDocument = gql`
  query search($searchData: SearchInput!) {
    search(searchData: $searchData) {
      score
      result {
        __typename
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
export function useSearchQuery(baseOptions?: Apollo.QueryHookOptions<SearchQuery, SearchQueryVariables>) {
  return Apollo.useQuery<SearchQuery, SearchQueryVariables>(SearchDocument, baseOptions);
}
export function useSearchLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchQuery, SearchQueryVariables>) {
  return Apollo.useLazyQuery<SearchQuery, SearchQueryVariables>(SearchDocument, baseOptions);
}
export type SearchQueryHookResult = ReturnType<typeof useSearchQuery>;
export type SearchLazyQueryHookResult = ReturnType<typeof useSearchLazyQuery>;
export type SearchQueryResult = Apollo.QueryResult<SearchQuery, SearchQueryVariables>;
export const ConfigDocument = gql`
  query config {
    clientConfig {
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
      authEnabled
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
export const ChallengesDocument = gql`
  query challenges {
    challenges {
      id
      name
      textID
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
export const EcoverseDetailsDocument = gql`
  query ecoverseDetails {
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
      opportunities {
        id
      }
    }
  }
`;

/**
 * __useEcoverseDetailsQuery__
 *
 * To run a query within a React component, call `useEcoverseDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useEcoverseDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEcoverseDetailsQuery({
 *   variables: {
 *   },
 * });
 */
export function useEcoverseDetailsQuery(
  baseOptions?: Apollo.QueryHookOptions<EcoverseDetailsQuery, EcoverseDetailsQueryVariables>
) {
  return Apollo.useQuery<EcoverseDetailsQuery, EcoverseDetailsQueryVariables>(EcoverseDetailsDocument, baseOptions);
}
export function useEcoverseDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<EcoverseDetailsQuery, EcoverseDetailsQueryVariables>
) {
  return Apollo.useLazyQuery<EcoverseDetailsQuery, EcoverseDetailsQueryVariables>(EcoverseDetailsDocument, baseOptions);
}
export type EcoverseDetailsQueryHookResult = ReturnType<typeof useEcoverseDetailsQuery>;
export type EcoverseDetailsLazyQueryHookResult = ReturnType<typeof useEcoverseDetailsLazyQuery>;
export type EcoverseDetailsQueryResult = Apollo.QueryResult<EcoverseDetailsQuery, EcoverseDetailsQueryVariables>;
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
  baseOptions?: Apollo.QueryHookOptions<ChallengeUserIdsQuery, ChallengeUserIdsQueryVariables>
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
export const UserAvatarsDocument = gql`
  query userAvatars($ids: [String!]!) {
    usersById(IDs: $ids) {
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
export function useUserAvatarsQuery(
  baseOptions?: Apollo.QueryHookOptions<UserAvatarsQuery, UserAvatarsQueryVariables>
) {
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
