import { useState } from 'react';
import {
  useAccountSearchOrganizationsLazyQuery,
  useAccountSearchUsersLazyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import type { FormikSelectValue } from '@/core/ui/forms/FormikAutocomplete.model';
import { AlkemioGraphqlErrorCode } from '@/main/constants/errors';

type AccountSearchResult = FormikSelectValue & {
  accountId: string;
  type: 'User' | 'Organization';
};

// client-1: the codes that mean "you may not search accounts" rather than a
// generic failure — mirrors `isExclusivelyAuthorizationError` in
// `@/core/apollo/hooks/usePermissionDeniedNotifier` (the L4 twin — keep this
// list aligned with that one if it changes).
const DENIED_ERROR_CODES: string[] = [AlkemioGraphqlErrorCode.FORBIDDEN, AlkemioGraphqlErrorCode.FORBIDDEN_POLICY];

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
    const codes = [usersError, orgsError]
      .filter(error => error !== undefined)
      .flatMap(error => error.graphQLErrors.map(graphQLError => graphQLError.extensions?.code as string));
    return codes.length > 0 && codes.every(code => DENIED_ERROR_CODES.includes(code));
  }, [usersError, orgsError]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.length < 2) return;

    searchUsers({ variables: { first: 20, filter: { displayName: term } } });
    searchOrgs({ variables: { first: 20, filter: { displayName: term } } });
  };

  // Derived each render — the React Compiler memoizes this automatically.
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

  const results: AccountSearchResult[] = [...userResults, ...orgResults];

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
