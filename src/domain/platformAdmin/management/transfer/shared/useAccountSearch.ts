import { useMemo, useState } from 'react';
import {
  useAccountSearchOrganizationsLazyQuery,
  useAccountSearchUsersLazyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { isNotAvailableError } from '@/core/apollo/hooks/useApolloErrorHandler';
import type { FormikSelectValue } from '@/core/ui/forms/FormikAutocomplete.model';

type AccountSearchResult = FormikSelectValue & {
  accountId: string;
  type: 'User' | 'Organization';
};

const useAccountSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const [searchUsers, { data: usersData, loading: usersLoading, called: usersCalled, error: usersError }] =
    useAccountSearchUsersLazyQuery();
  const [searchOrgs, { data: orgsData, loading: orgsLoading, called: orgsCalled, error: orgsError }] =
    useAccountSearchOrganizationsLazyQuery();

  const loading = usersLoading || orgsLoading;

  // client-1: denied only when EVERY error the two queries reported is an
  // authorization code — a genuinely mixed/other failure is not "denied",
  // it's a normal search failure the global error handler already covers.
  const denied = useMemo(() => {
    const graphQLErrors = [usersError, orgsError]
      .filter(error => error !== undefined)
      .flatMap(error => error.graphQLErrors);
    return graphQLErrors.length > 0 && graphQLErrors.every(isNotAvailableError);
  }, [usersError, orgsError]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.length < 2) return;

    searchUsers({ variables: { first: 20, filter: { displayName: term } } });
    searchOrgs({ variables: { first: 20, filter: { displayName: term } } });
  };

  const results: AccountSearchResult[] = useMemo(() => {
    const userResults: AccountSearchResult[] =
      usersData?.platformAdmin?.users?.users
        ?.filter(
          u =>
            u.account?.id &&
            u.account.authorization?.myPrivileges?.includes(AuthorizationPrivilege.TransferResourceAccept)
        )
        .map(u => ({
          id: u.account!.id,
          accountId: u.account!.id,
          name: `${u.profile?.displayName} (User)`,
          type: 'User' as const,
        })) ?? [];

    const orgResults: AccountSearchResult[] =
      orgsData?.platformAdmin?.organizations?.organization
        ?.filter(
          o =>
            o.account?.id &&
            o.account.authorization?.myPrivileges?.includes(AuthorizationPrivilege.TransferResourceAccept)
        )
        .map(o => ({
          id: o.account!.id,
          accountId: o.account!.id,
          name: `${o.profile?.displayName} (Organization)`,
          type: 'Organization' as const,
        })) ?? [];

    return [...userResults, ...orgResults];
  }, [usersData, orgsData]);

  const hasSearched = usersCalled || orgsCalled;

  return {
    searchTerm,
    results,
    loading,
    hasSearched,
    denied,
    handleSearch,
  };
};

export default useAccountSearch;
