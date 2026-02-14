import { useState } from 'react';
import {
  useSpaceTransferUrlResolveQuery,
  useSpaceTransferLookupQuery,
  useAccountOwnerUrlResolveQuery,
  useUserAccountLookupQuery,
  useOrganizationAccountLookupQuery,
  useTransferSpaceToAccountMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, SpaceLevel, UrlResolverResultState } from '@/core/apollo/generated/graphql-schema';
import toFullUrl from '../toFullUrl';

const useTransferSpace = () => {
  const [spaceUrl, setSpaceUrl] = useState('');
  const [accountOwnerUrl, setAccountOwnerUrl] = useState('');

  // Resolve space URL
  const { data: spaceResolveData, loading: spaceResolveLoading } = useSpaceTransferUrlResolveQuery({
    variables: { url: spaceUrl },
    skip: !spaceUrl,
  });

  const spaceResolved = spaceResolveData?.urlResolver;
  const resolvedSpaceId = spaceResolved?.space?.id;
  const resolvedSpaceLevel = spaceResolved?.space?.level;

  // Fetch space details
  const { data: spaceData, loading: spaceLoading } = useSpaceTransferLookupQuery({
    variables: { spaceId: resolvedSpaceId! },
    skip: !resolvedSpaceId,
  });

  const space = spaceData?.lookup.space;
  const hasSpaceTransferOffer = space?.account?.authorization?.myPrivileges?.includes(
    AuthorizationPrivilege.TransferResourceOffer
  );

  // Resolve account owner URL
  const { data: ownerResolveData, loading: ownerResolveLoading } = useAccountOwnerUrlResolveQuery({
    variables: { url: accountOwnerUrl },
    skip: !accountOwnerUrl,
  });

  const ownerResolved = ownerResolveData?.urlResolver;
  const resolvedUserId = ownerResolved?.userId;
  const resolvedOrganizationId = ownerResolved?.organizationId;

  // Fetch user account
  const { data: userData, loading: userLoading } = useUserAccountLookupQuery({
    variables: { userId: resolvedUserId! },
    skip: !resolvedUserId,
  });

  // Fetch organization account
  const { data: orgData, loading: orgLoading } = useOrganizationAccountLookupQuery({
    variables: { organizationId: resolvedOrganizationId! },
    skip: !resolvedOrganizationId,
  });

  const accountOwner = (() => {
    if (resolvedUserId) {
      const user = userData?.lookup.user;
      return {
        name: user?.profile.displayName,
        accountId: user?.account?.id,
        accountAuthorization: user?.account?.authorization,
        type: 'user' as const,
      };
    }
    if (resolvedOrganizationId) {
      const org = orgData?.lookup.organization;
      return {
        name: org?.profile.displayName,
        accountId: org?.account?.id,
        accountAuthorization: org?.account?.authorization,
        type: 'organization' as const,
      };
    }
    return undefined;
  })();

  const hasAccountTransferAccept = accountOwner?.accountAuthorization?.myPrivileges?.includes(
    AuthorizationPrivilege.TransferResourceAccept
  );

  const [transferSpaceMutation, { loading: transferLoading }] = useTransferSpaceToAccountMutation();

  const isLoading = spaceResolveLoading || spaceLoading;

  const spaceError =
    isLoading
      ? undefined
      : spaceResolved?.state === UrlResolverResultState.NotFound
        ? ('pages.admin.transferSpace.urlNotFound' as const)
        : spaceResolved && !resolvedSpaceId
          ? ('pages.admin.transferSpace.urlNotSpace' as const)
          : resolvedSpaceLevel !== undefined && resolvedSpaceLevel !== SpaceLevel.L0
            ? ('pages.admin.transferSpace.notL0Space' as const)
            : undefined;

  const ownerIsLoading = ownerResolveLoading || userLoading || orgLoading;

  const ownerError =
    ownerIsLoading
      ? undefined
      : ownerResolved?.state === UrlResolverResultState.NotFound
        ? ('pages.admin.transferSpace.urlNotFound' as const)
        : ownerResolved && !resolvedUserId && !resolvedOrganizationId
          ? ('pages.admin.transferSpace.urlNotUserOrOrg' as const)
          : undefined;

  const handleSpaceSubmit = (url: string) => {
    setSpaceUrl(toFullUrl(url));
  };

  const handleAccountOwnerSubmit = (url: string) => {
    setAccountOwnerUrl(toFullUrl(url));
  };

  const handleTransfer = async () => {
    if (!space?.id || !accountOwner?.accountId) return;
    const result = await transferSpaceMutation({
      variables: { spaceId: space.id, targetAccountId: accountOwner.accountId },
    });
    if (!result.data?.transferSpaceToAccount?.id) {
      throw new Error('Transfer failed');
    }
  };

  const isL0Space = resolvedSpaceLevel === SpaceLevel.L0;

  return {
    space,
    accountOwner,
    isL0Space,
    hasSpaceTransferOffer,
    hasAccountTransferAccept,
    spaceLoading: isLoading,
    ownerLoading: ownerIsLoading,
    transferLoading,
    spaceError,
    ownerError,
    handleSpaceSubmit,
    handleAccountOwnerSubmit,
    handleTransfer,
  };
};

export default useTransferSpace;
