import { useState } from 'react';
import {
  useAccountOwnerUrlResolveQuery,
  useOrganizationAccountLookupQuery,
  useUserAccountLookupQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { UrlResolverResultState } from '@/core/apollo/generated/graphql-schema';
import toFullUrl from '../toFullUrl';

export type AccountOwner = {
  name: string | undefined;
  accountId: string | undefined;
  accountAuthorization: { myPrivileges?: string[] | null } | null | undefined;
  type: 'user' | 'organization';
};

/**
 * client-1: resolves an account owner (user or organization) from a
 * URL — extracted out of `useTransferSpace` so the same URL → owner
 * resolution can be reused by `AccountTargetTransfer`'s search-denied
 * fallback (client-1). Behaviour is unchanged from the original inline
 * logic in `useTransferSpace.ts:39-85`.
 */
const useAccountOwnerByUrl = () => {
  const [accountOwnerUrl, setAccountOwnerUrl] = useState('');

  const { data: ownerResolveData, loading: ownerResolveLoading } = useAccountOwnerUrlResolveQuery({
    variables: { url: accountOwnerUrl },
    skip: !accountOwnerUrl,
  });

  const ownerResolved = ownerResolveData?.urlResolver;
  const resolvedUserId = ownerResolved?.userId;
  const resolvedOrganizationId = ownerResolved?.organizationId;

  const { data: userData, loading: userLoading } = useUserAccountLookupQuery({
    variables: { userId: resolvedUserId! },
    skip: !resolvedUserId,
  });

  const { data: orgData, loading: orgLoading } = useOrganizationAccountLookupQuery({
    variables: { organizationId: resolvedOrganizationId! },
    skip: !resolvedOrganizationId,
  });

  const accountOwner: AccountOwner | undefined = (() => {
    if (resolvedUserId) {
      const user = userData?.lookup.user;
      return {
        name: user?.profile?.displayName,
        accountId: user?.account?.id,
        accountAuthorization: user?.account?.authorization,
        type: 'user' as const,
      };
    }
    if (resolvedOrganizationId) {
      const org = orgData?.lookup.organization;
      return {
        name: org?.profile?.displayName,
        accountId: org?.account?.id,
        accountAuthorization: org?.account?.authorization,
        type: 'organization' as const,
      };
    }
    return undefined;
  })();

  const ownerLoading = ownerResolveLoading || userLoading || orgLoading;

  const ownerError = ownerLoading
    ? undefined
    : ownerResolved?.state === UrlResolverResultState.NotFound
      ? ('pages.admin.transferSpace.urlNotFound' as const)
      : ownerResolved && !resolvedUserId && !resolvedOrganizationId
        ? ('pages.admin.transferSpace.urlNotUserOrOrg' as const)
        : // client-1: the URL resolved to a real user/organization, but that
          // owner has no accessible account (e.g. the operator lacks the
          // privilege to see it) — distinct from "not found"/"not a
          // user-or-org", so it gets its own, more accurate message.
          accountOwner && !accountOwner.accountId
          ? ('pages.admin.transferSpace.accountNotAccessible' as const)
          : undefined;

  const submit = (url: string) => {
    setAccountOwnerUrl(toFullUrl(url));
  };

  return { accountOwner, ownerError, ownerLoading, submit };
};

export default useAccountOwnerByUrl;
