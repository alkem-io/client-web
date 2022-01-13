import React, { FC } from 'react';
import { ApolloError } from '@apollo/client';
import { ContainerProps } from '../../models/container';
import { useContributorsSearchQuery } from '../../hooks/generated/graphql';
import { useApolloErrorHandler, useUserContext } from '../../hooks';
import { OrganizationContributorFragment, UserContributorFragment } from '../../models/graphql-schema';

export interface ContributorsSearchContainerEntities {
  users: UserContributorFragment[];
  organizations: OrganizationContributorFragment[];
}

export interface ContributorsSearchContainerActions {}

export interface ContributorsSearchContainerState {
  loading: boolean;
  error?: ApolloError;
}

export interface ContributorsSearchContainerProps
  extends ContainerProps<
    ContributorsSearchContainerEntities,
    ContributorsSearchContainerActions,
    ContributorsSearchContainerState
  > {
  terms: string[];
}

const typeFilterAuth = ['user', 'organization'];
const typeFilterNonAuth = ['organization'];

const ContributorsSearchContainer: FC<ContributorsSearchContainerProps> = ({ terms, children }) => {
  const { isAuthenticated } = useUserContext();
  const handleError = useApolloErrorHandler();
  const { data, loading, error } = useContributorsSearchQuery({
    variables: {
      searchData: {
        terms,
        tagsetNames: ['skills', 'keywords'],
        typesFilter: isAuthenticated ? typeFilterAuth : typeFilterNonAuth,
      },
    },
    onError: handleError,
    fetchPolicy: 'no-cache',
    skip: !terms.length,
  });
  const results = data?.search ?? [];
  const users = results
    .filter(({ result }) => result?.__typename === 'User')
    .map(({ result }) => ({ ...result })) as UserContributorFragment[];
  const organizations = results
    .filter(({ result }) => result?.__typename === 'Organization')
    .map(({ result }) => ({ ...result })) as OrganizationContributorFragment[];

  return <>{children({ users, organizations }, { loading, error }, {})}</>;
};
export default ContributorsSearchContainer;
