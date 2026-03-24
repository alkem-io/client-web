import { useMemo, useState } from 'react';
import {
  useAccountSearchOrganizationsLazyQuery,
  useAccountSearchUsersLazyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import type { FormikSelectValue } from '@/core/ui/forms/FormikAutocomplete';

type AccountSearchResult = FormikSelectValue & {
  accountId: string;
  type: 'User' | 'Organization';
};

const useAccountSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const [searchUsers, { data: usersData, loading: usersLoading }] = useAccountSearchUsersLazyQuery();
  const [searchOrgs, { data: orgsData, loading: orgsLoading }] = useAccountSearchOrganizationsLazyQuery();

  const loading = usersLoading || orgsLoading;

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.length < 2) return;

    searchUsers({ variables: { first: 20, filter: { displayName: term } } });
    searchOrgs({ variables: { first: 20, filter: { displayName: term } } });
  };

  const results: AccountSearchResult[] = useMemo(() => {
    const userResults: AccountSearchResult[] =
      usersData?.platformAdmin?.users?.users
        ?.filter(u => u.account?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.TransferResourceAccept))
        .map(u => ({
          id: u.account?.id,
          accountId: u.account?.id,
          name: `${u.profile.displayName} (User)`,
          type: 'User' as const,
        })) ?? [];

    const orgResults: AccountSearchResult[] =
      orgsData?.platformAdmin?.organizations?.organization
        ?.filter(o => o.account?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.TransferResourceAccept))
        .map(o => ({
          id: o.account?.id,
          accountId: o.account?.id,
          name: `${o.profile.displayName} (Organization)`,
          type: 'Organization' as const,
        })) ?? [];

    return [...userResults, ...orgResults];
  }, [usersData, orgsData]);

  return {
    searchTerm,
    results,
    loading,
    handleSearch,
  };
};

export default useAccountSearch;
