import gql from 'graphql-tag';
import * as React from 'react';
import * as ApolloReactCommon from '@apollo/react-common';
import * as ApolloReactComponents from '@apollo/react-components';
import * as ApolloReactHoc from '@apollo/react-hoc';
import * as ApolloReactHooks from '@apollo/react-hooks';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
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


export type QueryUserArgs = {
  ID: Scalars['String'];
};


export type QueryUserGroupArgs = {
  ID: Scalars['String'];
};


export type QueryChallengeArgs = {
  ID: Scalars['String'];
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

export type Tag = {
  __typename?: 'Tag';
  id: Scalars['ID'];
  name: Scalars['String'];
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

export type ContextInput = {
  name: Scalars['String'];
  background?: Maybe<Scalars['String']>;
  vision?: Maybe<Scalars['String']>;
  tagline?: Maybe<Scalars['String']>;
  who?: Maybe<Scalars['String']>;
  impact?: Maybe<Scalars['String']>;
  referenceLinks?: Maybe<Array<ReferenceInput>>;
  tags?: Maybe<Array<TagInput>>;
};

export type ReferenceInput = {
  name: Scalars['String'];
  uri: Scalars['String'];
  description: Scalars['String'];
};

export type TagInput = {
  name: Scalars['String'];
};

export type UserInput = {
  name: Scalars['String'];
  account?: Maybe<Scalars['String']>;
  firstName?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  email: Scalars['String'];
  tags?: Maybe<Array<TagInput>>;
};

export type UserGroupInput = {
  name: Scalars['String'];
  focalPoint?: Maybe<UserInput>;
  members?: Maybe<Array<UserInput>>;
  tags?: Maybe<Array<TagInput>>;
};

export type OrganisationInput = {
  name: Scalars['String'];
  members?: Maybe<Array<UserInput>>;
  tags?: Maybe<Array<TagInput>>;
};

export type ChallengeInput = {
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  lifecyclePhase?: Maybe<Scalars['String']>;
  tags?: Maybe<Array<TagInput>>;
  context?: Maybe<ContextInput>;
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
export type ChallengeListComponentProps = Omit<ApolloReactComponents.QueryComponentOptions<ChallengeListQuery, ChallengeListQueryVariables>, 'query'>;

    export const ChallengeListComponent = (props: ChallengeListComponentProps) => (
      <ApolloReactComponents.Query<ChallengeListQuery, ChallengeListQueryVariables> query={ChallengeListDocument} {...props} />
    );
    
export type ChallengeListProps<TChildProps = {}, TDataName extends string = 'data'> = {
      [key in TDataName]: ApolloReactHoc.DataValue<ChallengeListQuery, ChallengeListQueryVariables>
    } & TChildProps;
export function withChallengeList<TProps, TChildProps = {}, TDataName extends string = 'data'>(operationOptions?: ApolloReactHoc.OperationOption<
  TProps,
  ChallengeListQuery,
  ChallengeListQueryVariables,
  ChallengeListProps<TChildProps, TDataName>>) {
    return ApolloReactHoc.withQuery<TProps, ChallengeListQuery, ChallengeListQueryVariables, ChallengeListProps<TChildProps, TDataName>>(ChallengeListDocument, {
      alias: 'challengeList',
      ...operationOptions
    });
};

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
export function useChallengeListQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<ChallengeListQuery, ChallengeListQueryVariables>) {
        return ApolloReactHooks.useQuery<ChallengeListQuery, ChallengeListQueryVariables>(ChallengeListDocument, baseOptions);
      }
export function useChallengeListLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<ChallengeListQuery, ChallengeListQueryVariables>) {
          return ApolloReactHooks.useLazyQuery<ChallengeListQuery, ChallengeListQueryVariables>(ChallengeListDocument, baseOptions);
        }
export type ChallengeListQueryHookResult = ReturnType<typeof useChallengeListQuery>;
export type ChallengeListLazyQueryHookResult = ReturnType<typeof useChallengeListLazyQuery>;
export type ChallengeListQueryResult = ApolloReactCommon.QueryResult<ChallengeListQuery, ChallengeListQueryVariables>;
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
export type ChallengeProfileComponentProps = Omit<ApolloReactComponents.QueryComponentOptions<ChallengeProfileQuery, ChallengeProfileQueryVariables>, 'query'> & ({ variables: ChallengeProfileQueryVariables; skip?: boolean; } | { skip: boolean; });

    export const ChallengeProfileComponent = (props: ChallengeProfileComponentProps) => (
      <ApolloReactComponents.Query<ChallengeProfileQuery, ChallengeProfileQueryVariables> query={ChallengeProfileDocument} {...props} />
    );
    
export type ChallengeProfileProps<TChildProps = {}, TDataName extends string = 'data'> = {
      [key in TDataName]: ApolloReactHoc.DataValue<ChallengeProfileQuery, ChallengeProfileQueryVariables>
    } & TChildProps;
export function withChallengeProfile<TProps, TChildProps = {}, TDataName extends string = 'data'>(operationOptions?: ApolloReactHoc.OperationOption<
  TProps,
  ChallengeProfileQuery,
  ChallengeProfileQueryVariables,
  ChallengeProfileProps<TChildProps, TDataName>>) {
    return ApolloReactHoc.withQuery<TProps, ChallengeProfileQuery, ChallengeProfileQueryVariables, ChallengeProfileProps<TChildProps, TDataName>>(ChallengeProfileDocument, {
      alias: 'challengeProfile',
      ...operationOptions
    });
};

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
export function useChallengeProfileQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<ChallengeProfileQuery, ChallengeProfileQueryVariables>) {
        return ApolloReactHooks.useQuery<ChallengeProfileQuery, ChallengeProfileQueryVariables>(ChallengeProfileDocument, baseOptions);
      }
export function useChallengeProfileLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<ChallengeProfileQuery, ChallengeProfileQueryVariables>) {
          return ApolloReactHooks.useLazyQuery<ChallengeProfileQuery, ChallengeProfileQueryVariables>(ChallengeProfileDocument, baseOptions);
        }
export type ChallengeProfileQueryHookResult = ReturnType<typeof useChallengeProfileQuery>;
export type ChallengeProfileLazyQueryHookResult = ReturnType<typeof useChallengeProfileLazyQuery>;
export type ChallengeProfileQueryResult = ApolloReactCommon.QueryResult<ChallengeProfileQuery, ChallengeProfileQueryVariables>;
export const EcoverseListDocument = gql`
    query ecoverseList {
  name
  context {
    tagline
  }
}
    `;
export type EcoverseListComponentProps = Omit<ApolloReactComponents.QueryComponentOptions<EcoverseListQuery, EcoverseListQueryVariables>, 'query'>;

    export const EcoverseListComponent = (props: EcoverseListComponentProps) => (
      <ApolloReactComponents.Query<EcoverseListQuery, EcoverseListQueryVariables> query={EcoverseListDocument} {...props} />
    );
    
export type EcoverseListProps<TChildProps = {}, TDataName extends string = 'data'> = {
      [key in TDataName]: ApolloReactHoc.DataValue<EcoverseListQuery, EcoverseListQueryVariables>
    } & TChildProps;
export function withEcoverseList<TProps, TChildProps = {}, TDataName extends string = 'data'>(operationOptions?: ApolloReactHoc.OperationOption<
  TProps,
  EcoverseListQuery,
  EcoverseListQueryVariables,
  EcoverseListProps<TChildProps, TDataName>>) {
    return ApolloReactHoc.withQuery<TProps, EcoverseListQuery, EcoverseListQueryVariables, EcoverseListProps<TChildProps, TDataName>>(EcoverseListDocument, {
      alias: 'ecoverseList',
      ...operationOptions
    });
};

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
export function useEcoverseListQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<EcoverseListQuery, EcoverseListQueryVariables>) {
        return ApolloReactHooks.useQuery<EcoverseListQuery, EcoverseListQueryVariables>(EcoverseListDocument, baseOptions);
      }
export function useEcoverseListLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<EcoverseListQuery, EcoverseListQueryVariables>) {
          return ApolloReactHooks.useLazyQuery<EcoverseListQuery, EcoverseListQueryVariables>(EcoverseListDocument, baseOptions);
        }
export type EcoverseListQueryHookResult = ReturnType<typeof useEcoverseListQuery>;
export type EcoverseListLazyQueryHookResult = ReturnType<typeof useEcoverseListLazyQuery>;
export type EcoverseListQueryResult = ApolloReactCommon.QueryResult<EcoverseListQuery, EcoverseListQueryVariables>;