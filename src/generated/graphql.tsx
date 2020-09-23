import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Query = {
  __typename?: 'Query';
  /** The name for this ecoverse */
  name: Scalars['String'];
  /** The name for this ecoverse */
  members: Array<UserGroup>;
  /** The name for this ecoverse */
  challengeMembers: Array<UserGroup>;
  /** The host organisation for the ecoverse */
  host: Organisation;
  /** The shared understanding for this ecoverse */
  context: Context;
  /** A particular user */
  user: User;
  /** The set of users associated with this ecoverse */
  users: Array<User>;
  /** A particualr user group */
  userGroup: UserGroup;
  /** All groups of users */
  userGroups: Array<UserGroup>;
  /** All organisations */
  organisations: Array<Organisation>;
  /** A particular challenge */
  challenge: Challenge;
  /** All challenges */
  challenges: Array<Challenge>;
  /** All tags associated with this Ecoverse */
  tags: Array<Tag>;
};


export type QueryChallengeMembersArgs = {
  ID: Scalars['Float'];
};


export type QueryUserArgs = {
  ID: Scalars['String'];
};


export type QueryUserGroupArgs = {
  ID: Scalars['String'];
};


export type QueryChallengeArgs = {
  ID: Scalars['String'];
};

export type UserGroup = {
  __typename?: 'UserGroup';
  id: Scalars['ID'];
  name: Scalars['String'];
  /** The set of users that are members of this group */
  members?: Maybe<Array<User>>;
  /** The focal point for this group */
  focalPoint?: Maybe<User>;
  /** The set of tags for this group e.g. Team, Nature etc. */
  tags?: Maybe<Array<Tag>>;
};

export type User = {
  __typename?: 'User';
  id: Scalars['ID'];
  name: Scalars['String'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  email: Scalars['String'];
  tags?: Maybe<Array<Tag>>;
};

export type Tag = {
  __typename?: 'Tag';
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type Organisation = {
  __typename?: 'Organisation';
  id: Scalars['ID'];
  name: Scalars['String'];
  /** The set of tags applied to this organisation. */
  tags?: Maybe<Array<Tag>>;
  /** The set of users that are associated with this organisation */
  members?: Maybe<Array<User>>;
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

export type Challenge = {
  __typename?: 'Challenge';
  id: Scalars['ID'];
  /** The name of the challenge */
  name: Scalars['String'];
  /** The shared understanding for the challenge */
  context?: Maybe<Context>;
  /** The leads for the challenge. The focal point for the user group is the primary challenge lead. */
  challengeLeads: Array<Organisation>;
  /** Groups of users related to a challenge; each group also results in a role that is assigned to users in the group. */
  groups?: Maybe<Array<UserGroup>>;
  /** The community of users, including challenge leads, that are contributing. */
  contributors?: Maybe<Array<User>>;
  /** The maturity phase of the challenge i.e. new, being refined, ongoing etc */
  lifecyclePhase?: Maybe<Scalars['String']>;
  /** The set of tags to label the challenge */
  tags?: Maybe<Array<Tag>>;
  /** The set of projects within the context of this challenge */
  projects?: Maybe<Array<Project>>;
};

export type Project = {
  __typename?: 'Project';
  id: Scalars['ID'];
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  /** The maturity phase of the project i.e. new, being refined, committed, in-progress, closed etc */
  lifecyclePhase?: Maybe<Scalars['String']>;
  /** The set of tags for this Project */
  tags?: Maybe<Array<Tag>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createContext: Context;
  createUser: User;
  createUserGroup: UserGroup;
  createOrganisation: Organisation;
  createChallenge: Challenge;
  createTag: Tag;
  updateEcoverse: Ecoverse;
  updateUser: User;
  updateUserGroup: UserGroup;
  updateOrganisation: Organisation;
  updateChallenge: Challenge;
  updateContext: Context;
};


export type MutationCreateContextArgs = {
  contextData: ContextInput;
};


export type MutationCreateUserArgs = {
  userData: UserInput;
};


export type MutationCreateUserGroupArgs = {
  userGroupData: UserGroupInput;
};


export type MutationCreateOrganisationArgs = {
  organisationData: OrganisationInput;
};


export type MutationCreateChallengeArgs = {
  challengeData: ChallengeInput;
};


export type MutationCreateTagArgs = {
  tagData: TagInput;
};


export type MutationUpdateEcoverseArgs = {
  ecoverseData: UpdateEcoverseInput;
};


export type MutationUpdateUserArgs = {
  userData: UpdateRootUserInput;
};


export type MutationUpdateUserGroupArgs = {
  userGroupData: UpdateRootUserGroupInput;
};


export type MutationUpdateOrganisationArgs = {
  organisationData: UpdateRootOrganisationInput;
};


export type MutationUpdateChallengeArgs = {
  challengeData: UpdateRootChallengeInput;
};


export type MutationUpdateContextArgs = {
  contextData: UpdateRootContextInput;
};

export type ContextInput = {
  name?: Maybe<Scalars['String']>;
  background?: Maybe<Scalars['String']>;
  lifecyclePhase?: Maybe<Scalars['String']>;
  vision?: Maybe<Scalars['String']>;
  tagline?: Maybe<Scalars['String']>;
  who?: Maybe<Scalars['String']>;
  impact?: Maybe<Scalars['String']>;
  references?: Maybe<Array<ReferenceInput>>;
  tags?: Maybe<Array<TagInput>>;
};

export type ReferenceInput = {
  name?: Maybe<Scalars['String']>;
  uri?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};

export type TagInput = {
  name?: Maybe<Scalars['String']>;
};

export type UserInput = {
  name?: Maybe<Scalars['String']>;
  account?: Maybe<Scalars['String']>;
  firstName?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  tags?: Maybe<Array<TagInput>>;
};

export type UserGroupInput = {
  name?: Maybe<Scalars['String']>;
  focalPoint?: Maybe<UserInput>;
  members?: Maybe<Array<UserInput>>;
  tags?: Maybe<Array<TagInput>>;
};

export type OrganisationInput = {
  name?: Maybe<Scalars['String']>;
  members?: Maybe<Array<UserInput>>;
  tags?: Maybe<Array<TagInput>>;
};

export type ChallengeInput = {
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  lifecyclePhase?: Maybe<Scalars['String']>;
  tags?: Maybe<Array<TagInput>>;
  context?: Maybe<ContextInput>;
  groups?: Maybe<Array<UserGroupInput>>;
};

export type Ecoverse = {
  __typename?: 'Ecoverse';
  id: Scalars['ID'];
  name: Scalars['String'];
  /** The organisation that hosts this Ecoverse instance */
  ecoverseHost?: Maybe<Organisation>;
  /** The shared understanding for the Ecoverse */
  context?: Maybe<Context>;
  groups?: Maybe<Array<UserGroup>>;
  /** The set of partner organisations associated with this Ecoverse */
  partners?: Maybe<Array<Organisation>>;
  /** The Challenges hosted by the Ecoverse */
  challenges?: Maybe<Array<Challenge>>;
  /** Set of restricted tags that are used within this ecoverse */
  tags?: Maybe<Array<Tag>>;
};

export type UpdateEcoverseInput = {
  name?: Maybe<Scalars['String']>;
  challenges?: Maybe<Array<UpdateNestedChallengeInput>>;
  partners?: Maybe<Array<UpdateNestedOrganisationInput>>;
  members?: Maybe<Array<UpdateNestedUserInput>>;
  groups?: Maybe<Array<UpdateNestedUserGroupInput>>;
  context?: Maybe<UpdateNestedContextInput>;
  tags?: Maybe<Array<UpdateNestedTagInput>>;
};

export type UpdateNestedChallengeInput = {
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  lifecyclePhase?: Maybe<Scalars['String']>;
  tags?: Maybe<Array<UpdateNestedTagInput>>;
  context?: Maybe<UpdateNestedContextInput>;
  groups?: Maybe<Array<UpdateNestedUserGroupInput>>;
  id?: Maybe<Scalars['Float']>;
};

export type UpdateNestedTagInput = {
  name?: Maybe<Scalars['String']>;
  id: Scalars['Float'];
};

export type UpdateNestedContextInput = {
  name?: Maybe<Scalars['String']>;
  background?: Maybe<Scalars['String']>;
  lifecyclePhase?: Maybe<Scalars['String']>;
  vision?: Maybe<Scalars['String']>;
  tagline?: Maybe<Scalars['String']>;
  who?: Maybe<Scalars['String']>;
  impact?: Maybe<Scalars['String']>;
  references?: Maybe<Array<UpdateReferenceInput>>;
  tags?: Maybe<Array<UpdateNestedTagInput>>;
  id?: Maybe<Scalars['Float']>;
};

export type UpdateReferenceInput = {
  name?: Maybe<Scalars['String']>;
  uri?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  id: Scalars['Float'];
};

export type UpdateNestedUserGroupInput = {
  name?: Maybe<Scalars['String']>;
  focalPoint?: Maybe<UpdateNestedUserInput>;
  members?: Maybe<Array<UpdateNestedUserInput>>;
  tags?: Maybe<Array<UpdateNestedTagInput>>;
  id?: Maybe<Scalars['Float']>;
};

export type UpdateNestedUserInput = {
  name?: Maybe<Scalars['String']>;
  account?: Maybe<Scalars['String']>;
  firstName?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  tags?: Maybe<Array<UpdateNestedTagInput>>;
  id?: Maybe<Scalars['Float']>;
};

export type UpdateNestedOrganisationInput = {
  name?: Maybe<Scalars['String']>;
  members?: Maybe<Array<UpdateNestedUserInput>>;
  tags?: Maybe<Array<UpdateNestedTagInput>>;
  id?: Maybe<Scalars['Float']>;
};

export type UpdateRootUserInput = {
  name?: Maybe<Scalars['String']>;
  account?: Maybe<Scalars['String']>;
  firstName?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  tags?: Maybe<Array<UpdateNestedTagInput>>;
  id: Scalars['Float'];
};

export type UpdateRootUserGroupInput = {
  name?: Maybe<Scalars['String']>;
  focalPoint?: Maybe<UpdateNestedUserInput>;
  members?: Maybe<Array<UpdateNestedUserInput>>;
  tags?: Maybe<Array<UpdateNestedTagInput>>;
  id: Scalars['Float'];
};

export type UpdateRootOrganisationInput = {
  name?: Maybe<Scalars['String']>;
  members?: Maybe<Array<UpdateNestedUserInput>>;
  tags?: Maybe<Array<UpdateNestedTagInput>>;
  id: Scalars['Float'];
};

export type UpdateRootChallengeInput = {
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  lifecyclePhase?: Maybe<Scalars['String']>;
  tags?: Maybe<Array<UpdateNestedTagInput>>;
  context?: Maybe<UpdateNestedContextInput>;
  groups?: Maybe<Array<UpdateNestedUserGroupInput>>;
  id: Scalars['Float'];
};

export type UpdateRootContextInput = {
  name?: Maybe<Scalars['String']>;
  background?: Maybe<Scalars['String']>;
  lifecyclePhase?: Maybe<Scalars['String']>;
  vision?: Maybe<Scalars['String']>;
  tagline?: Maybe<Scalars['String']>;
  who?: Maybe<Scalars['String']>;
  impact?: Maybe<Scalars['String']>;
  references?: Maybe<Array<UpdateReferenceInput>>;
  tags?: Maybe<Array<UpdateNestedTagInput>>;
  id: Scalars['Float'];
};

export type ChallengeListQueryVariables = Exact<{ [key: string]: never; }>;


export type ChallengeListQuery = (
  { __typename?: 'Query' }
  & { challenges: Array<(
    { __typename?: 'Challenge' }
    & Pick<Challenge, 'id' | 'name'>
    & { context?: Maybe<(
      { __typename?: 'Context' }
      & Pick<Context, 'tagline'>
    )> }
  )> }
);

export type ChallengeProfileQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type ChallengeProfileQuery = (
  { __typename?: 'Query' }
  & { challenge: (
    { __typename?: 'Challenge' }
    & Pick<Challenge, 'id' | 'name'>
    & { context?: Maybe<(
      { __typename?: 'Context' }
      & Pick<Context, 'tagline' | 'background' | 'vision' | 'impact' | 'who'>
      & { references?: Maybe<Array<(
        { __typename?: 'Reference' }
        & Pick<Reference, 'name' | 'uri' | 'description'>
      )>> }
    )>, tags?: Maybe<Array<(
      { __typename?: 'Tag' }
      & Pick<Tag, 'name'>
    )>> }
  ) }
);

export type EcoverseListQueryVariables = Exact<{ [key: string]: never; }>;


export type EcoverseListQuery = (
  { __typename?: 'Query' }
  & Pick<Query, 'name'>
  & { context: (
    { __typename?: 'Context' }
    & Pick<Context, 'tagline'>
  ) }
);


export const ChallengeListDocument = gql`
    query challengeList {
  challenges {
    id
    name
    context {
      tagline
    }
  }
}
    `;

/**
 * __useChallengeListQuery__
 *
 * To run a query within a React component, call `useChallengeListQuery` and pass it any options that fit your needs.
 * When your component renders, `useChallengeListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChallengeListQuery({
 *   variables: {
 *   },
 * });
 */
export function useChallengeListQuery(baseOptions?: Apollo.QueryHookOptions<ChallengeListQuery, ChallengeListQueryVariables>) {
        return Apollo.useQuery<ChallengeListQuery, ChallengeListQueryVariables>(ChallengeListDocument, baseOptions);
      }
export function useChallengeListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ChallengeListQuery, ChallengeListQueryVariables>) {
          return Apollo.useLazyQuery<ChallengeListQuery, ChallengeListQueryVariables>(ChallengeListDocument, baseOptions);
        }
export type ChallengeListQueryHookResult = ReturnType<typeof useChallengeListQuery>;
export type ChallengeListLazyQueryHookResult = ReturnType<typeof useChallengeListLazyQuery>;
export type ChallengeListQueryResult = Apollo.QueryResult<ChallengeListQuery, ChallengeListQueryVariables>;
export const ChallengeProfileDocument = gql`
    query challengeProfile($id: String!) {
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
    tags {
      name
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
export function useChallengeProfileQuery(baseOptions?: Apollo.QueryHookOptions<ChallengeProfileQuery, ChallengeProfileQueryVariables>) {
        return Apollo.useQuery<ChallengeProfileQuery, ChallengeProfileQueryVariables>(ChallengeProfileDocument, baseOptions);
      }
export function useChallengeProfileLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ChallengeProfileQuery, ChallengeProfileQueryVariables>) {
          return Apollo.useLazyQuery<ChallengeProfileQuery, ChallengeProfileQueryVariables>(ChallengeProfileDocument, baseOptions);
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
export function useEcoverseListQuery(baseOptions?: Apollo.QueryHookOptions<EcoverseListQuery, EcoverseListQueryVariables>) {
        return Apollo.useQuery<EcoverseListQuery, EcoverseListQueryVariables>(EcoverseListDocument, baseOptions);
      }
export function useEcoverseListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<EcoverseListQuery, EcoverseListQueryVariables>) {
          return Apollo.useLazyQuery<EcoverseListQuery, EcoverseListQueryVariables>(EcoverseListDocument, baseOptions);
        }
export type EcoverseListQueryHookResult = ReturnType<typeof useEcoverseListQuery>;
export type EcoverseListLazyQueryHookResult = ReturnType<typeof useEcoverseListLazyQuery>;
export type EcoverseListQueryResult = Apollo.QueryResult<EcoverseListQuery, EcoverseListQueryVariables>;