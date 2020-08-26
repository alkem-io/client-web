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
  allTags: Array<Tag>;
  allUsers: Array<User>;
  allChallenges: Array<Challenge>;
  allEcoverse: Array<Ecoverse>;
  allAgreements: Array<Agreement>;
  allContexts: Array<Context>;
  allDIDs: Array<Did>;
  allOrganisations: Array<Organisation>;
  allProjects: Array<Project>;
  allUserGroups: Array<UserGroup>;
  getEcoverseUnion: Array<EcoverseUnion>;
};


export type QueryGetEcoverseUnionArgs = {
  name: Scalars['String'];
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
  account: Scalars['String'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  email: Scalars['String'];
  DID: Did;
  tags: Array<Tag>;
};

export type Did = {
  __typename?: 'DID';
  id: Scalars['ID'];
  DID: Scalars['String'];
  DDO: Scalars['String'];
};

export type Challenge = {
  __typename?: 'Challenge';
  id: Scalars['ID'];
  name: Scalars['String'];
  description: Scalars['String'];
  lifecyclePhase: Scalars['String'];
  challengeLeads: UserGroup;
  context: Context;
  groups: Array<UserGroup>;
  contributors: Array<User>;
  tags: Array<Tag>;
  projects: Array<Project>;
  DID: Did;
};

export type UserGroup = {
  __typename?: 'UserGroup';
  id: Scalars['ID'];
  name: Scalars['String'];
  focalPoint: User;
  tags: Array<Tag>;
  members: Array<User>;
};

export type Context = {
  __typename?: 'Context';
  id: Scalars['ID'];
  description: Scalars['String'];
  vision: Scalars['String'];
  principles: Scalars['String'];
  referenceLinks: Scalars['String'];
  tags: Array<Tag>;
  ecoverse: Ecoverse;
  challenge: Challenge;
};

export type Ecoverse = {
  __typename?: 'Ecoverse';
  id: Scalars['ID'];
  name: Scalars['String'];
  challenges: Array<Challenge>;
  partners: Array<Organisation>;
  members: Array<UserGroup>;
  DID: Did;
  ecoverseHost: Organisation;
  context: Context;
};

export type Organisation = {
  __typename?: 'Organisation';
  id: Scalars['ID'];
  name: Scalars['String'];
  DID: Did;
  ecoverseHost: Ecoverse;
  tags: Array<Tag>;
  members: Array<User>;
};

export type Project = {
  __typename?: 'Project';
  id: Scalars['ID'];
  name: Scalars['String'];
  description: Scalars['String'];
  lifecyclePhase: Scalars['String'];
  tags: Array<Tag>;
  DID: Did;
  agreements: Array<Agreement>;
};

export type Agreement = {
  __typename?: 'Agreement';
  id: Scalars['ID'];
  name: Scalars['String'];
  description: Scalars['String'];
  tags: Array<Tag>;
};

export type EcoverseUnion = Ecoverse | Organisation | UserGroup | Challenge;

export type ChallengeListQueryVariables = Exact<{ [key: string]: never; }>;


export type ChallengeListQuery = (
  { __typename?: 'Query' }
  & { allChallenges: Array<(
    { __typename?: 'Challenge' }
    & Pick<Challenge, 'name' | 'description'>
    & { tags: Array<(
      { __typename?: 'Tag' }
      & Pick<Tag, 'name'>
    )> }
  )> }
);

export type EcoverseListQueryVariables = Exact<{ [key: string]: never; }>;


export type EcoverseListQuery = (
  { __typename?: 'Query' }
  & { allEcoverse: Array<(
    { __typename?: 'Ecoverse' }
    & Pick<Ecoverse, 'name'>
  )> }
);


export const ChallengeListDocument = gql`
    query challengeList {
  allChallenges {
    name
    description
    tags {
      name
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
export const EcoverseListDocument = gql`
    query ecoverseList {
  allEcoverse {
    name
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