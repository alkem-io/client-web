import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
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

export type User = {
  __typename?: 'User';
  id: Scalars['ID'];
  name: Scalars['String'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  email: Scalars['String'];
  phone: Scalars['String'];
  city: Scalars['String'];
  country: Scalars['String'];
  gender: Scalars['String'];
  /** The profile for this user */
  profile?: Maybe<Profile>;
  /** An overview of the groups this user is a memberof */
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
  /** The set of users that are associated with this organisation */
  members?: Maybe<Array<User>>;
  /** Groups of users related to an organisation. */
  groups?: Maybe<Array<UserGroup>>;
};

export type Ecoverse = {
  __typename?: 'Ecoverse';
  id: Scalars['ID'];
  name: Scalars['String'];
  /** The organisation that hosts this Ecoverse instance */
  host?: Maybe<Organisation>;
  /** The shared understanding for the Ecoverse */
  context?: Maybe<Context>;
  groups?: Maybe<Array<UserGroup>>;
  /** The set of partner organisations associated with this Ecoverse */
  organisations?: Maybe<Array<Organisation>>;
  /** The Challenges hosted by the Ecoverse */
  challenges?: Maybe<Array<Challenge>>;
  /** The set of tags for the ecoverse */
  tagset?: Maybe<Tagset>;
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
  /** Groups of users related to a challenge; each group also results in a role that is assigned to users in the group. */
  groups?: Maybe<Array<UserGroup>>;
  /** The community of users, including challenge leads, that are contributing. */
  contributors?: Maybe<Array<User>>;
  /** The maturity phase of the challenge i.e. new, being refined, ongoing etc */
  state?: Maybe<Scalars['String']>;
  /** The set of tags for the challenge */
  tagset?: Maybe<Tagset>;
  /** The set of opportunities within the context of this challenge */
  opportunities?: Maybe<Array<Opportunity>>;
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
};

export type MemberOf = {
  __typename?: 'MemberOf';
  email?: Maybe<Scalars['String']>;
  /** References to the groups the user is in at the ecoverse level */
  groups: Array<UserGroup>;
  /** References to the challenges the user is a member of */
  challenges: Array<Challenge>;
  /** References to the orgnaisaitons the user is a member of */
  organisations: Array<Organisation>;
};

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
  /** All groups at the ecoverse level */
  groups: Array<UserGroup>;
  /** All groups that have the provided tag */
  groupsWithTag: Array<UserGroup>;
  /** The user group with the specified id anywhere in the ecoverse */
  group: UserGroup;
  /** All challenges */
  challenges: Array<Challenge>;
  /** A particular challenge */
  challenge: Challenge;
  /** All organisations */
  organisations: Array<Organisation>;
  /** A particular organisation */
  organisation: Organisation;
  /** The tagset associated with this Ecoverse */
  tagset: Tagset;
};

export type QueryOpportunityArgs = {
  ID: Scalars['Float'];
};

export type QueryUserArgs = {
  ID: Scalars['String'];
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

export type Mutation = {
  __typename?: 'Mutation';
  /** Update the base user information. Note: email address cannot be updated. */
  updateUser: User;
  /** Creates a new user profile */
  createUserProfile: User;
  /** Creates a new user account */
  createUserAccount: User;
  /** Replace the set of tags in a tagset with the provided tags */
  replaceTagsOnTagset: Tagset;
  /** Add the provided tag to the tagset with the given ID */
  addTagToTagset: Tagset;
  /** Creates a new tagset with the specified name for the profile with given id */
  createTagsetOnProfile: Tagset;
  /** Creates a new reference with the specified name for the profile with given id */
  createReferenceOnProfile: Reference;
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
  /** Creates a new user group at the ecoverse level */
  createGroupOnEcoverse: UserGroup;
  /** Updates the Ecoverse with the provided data */
  updateEcoverse: Ecoverse;
  /** Creates a new user as a member of the ecoverse */
  createUser: User;
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
};

export type MutationUpdateUserArgs = {
  userData: UserInput;
  userID: Scalars['Float'];
};

export type MutationCreateUserProfileArgs = {
  userData: UserInput;
};

export type MutationCreateUserAccountArgs = {
  userData: UserInput;
};

export type MutationReplaceTagsOnTagsetArgs = {
  tags: TagsInput;
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

export type MutationCreateGroupOnEcoverseArgs = {
  groupName: Scalars['String'];
};

export type MutationUpdateEcoverseArgs = {
  ecoverseData: EcoverseInput;
};

export type MutationCreateUserArgs = {
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

export type UserInput = {
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
};

export type TagsInput = {
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
  tagset?: Maybe<TagsInput>;
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
  tagset?: Maybe<TagsInput>;
};

export type EcoverseInput = {
  /** The new name for the ecoverse */
  name?: Maybe<Scalars['String']>;
  /** Updated context for the ecoverse; will be merged with existing context */
  context?: Maybe<ContextInput>;
  /** The set of tags to apply to this ecoverse */
  tags?: Maybe<TagsInput>;
};

export type OrganisationInput = {
  /** The new name for this organisation */
  name?: Maybe<Scalars['String']>;
  /** The set of tags to apply to this ecoverse */
  tags?: Maybe<TagsInput>;
};

export type NewUserFragment = { __typename?: 'User' } & Pick<
  User,
  'id' | 'name' | 'firstName' | 'lastName' | 'email' | 'phone' | 'city' | 'country' | 'gender'
>;

export type UsersQueryVariables = Exact<{ [key: string]: never }>;

export type UsersQuery = { __typename?: 'Query' } & {
  users: Array<
    { __typename?: 'User' } & Pick<
      User,
      'id' | 'name' | 'firstName' | 'lastName' | 'email' | 'phone' | 'city' | 'country' | 'gender'
    >
  >;
};

export type CreateUserMutationVariables = Exact<{
  user: UserInput;
}>;

export type CreateUserMutation = { __typename?: 'Mutation' } & {
  createUser: { __typename?: 'User' } & Pick<
    User,
    'id' | 'name' | 'firstName' | 'lastName' | 'email' | 'phone' | 'city' | 'country' | 'gender'
  >;
};

export type UpdateUserMutationVariables = Exact<{
  user: UserInput;
  userId: Scalars['Float'];
}>;

export type UpdateUserMutation = { __typename?: 'Mutation' } & {
  updateUser: { __typename?: 'User' } & Pick<
    User,
    'id' | 'name' | 'firstName' | 'lastName' | 'phone' | 'city' | 'country' | 'gender'
  >;
};

export type EcoverseChallengeGroupsQueryVariables = Exact<{ [key: string]: never }>;

export type EcoverseChallengeGroupsQuery = { __typename?: 'Query' } & {
  groups: Array<{ __typename?: 'UserGroup' } & Pick<UserGroup, 'id' | 'name'>>;
  challenges: Array<
    { __typename?: 'Challenge' } & Pick<Challenge, 'id' | 'name'> & {
        groups?: Maybe<Array<{ __typename?: 'UserGroup' } & Pick<UserGroup, 'id' | 'name'>>>;
      }
  >;
};

export type ChallengeProfileQueryVariables = Exact<{
  id: Scalars['Float'];
}>;

export type ChallengeProfileQuery = { __typename?: 'Query' } & {
  challenge: { __typename?: 'Challenge' } & Pick<Challenge, 'id' | 'name'> & {
      context?: Maybe<
        { __typename?: 'Context' } & Pick<Context, 'tagline' | 'background' | 'vision' | 'impact' | 'who'> & {
            references?: Maybe<Array<{ __typename?: 'Reference' } & Pick<Reference, 'name' | 'uri' | 'description'>>>;
          }
      >;
      tagset?: Maybe<{ __typename?: 'Tagset' } & Pick<Tagset, 'name' | 'tags'>>;
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

export const NewUserFragmentDoc = gql`
  fragment NewUser on User {
    id
    name
    firstName
    lastName
    email
    phone
    city
    country
    gender
  }
`;
export const UsersDocument = gql`
  query users {
    users {
      id
      name
      firstName
      lastName
      email
      phone
      city
      country
      gender
    }
  }
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
export const CreateUserDocument = gql`
  mutation createUser($user: UserInput!) {
    createUser(userData: $user) {
      id
      name
      firstName
      lastName
      email
      phone
      city
      country
      gender
    }
  }
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
      id
      name
      firstName
      lastName
      phone
      city
      country
      gender
    }
  }
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
export const ChallengeProfileDocument = gql`
  query challengeProfile($id: Float!) {
    challenge(ID: $id) {
      id
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
