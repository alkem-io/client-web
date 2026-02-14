import { useState } from 'react';
import {
  useSpaceTransferUrlResolveQuery,
  useSpaceTransferLookupQuery,
  useAccountOwnerUrlResolveQuery,
  useUserAccountLookupQuery,
  useOrganizationAccountLookupQuery,
  useTransferSpaceToAccountMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, SpaceLevel, UrlResolverResultState, UrlType } from '@/core/apollo/generated/graphql-schema';

const toFullUrl = (input: string): string => {
  try {
    new URL(input);
    return input;
  } catch {
    const path = input.startsWith('/') ? input : `/${input}`;
    return `${globalThis.location.origin}${path}`;
  }
};

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

  const accountOwner = resolvedUserId
    ? { name: userData?.lookup.user?.profile.displayName, accountId: userData?.lookup.user?.account?.id, accountAuthorization: userData?.lookup.user?.account?.authorization, type: 'user' as const }
    : resolvedOrganizationId
      ? { name: orgData?.lookup.organization?.profile.displayName, accountId: orgData?.lookup.organization?.account?.id, accountAuthorization: orgData?.lookup.organization?.account?.authorization, type: 'organization' as const }
      : undefined;

  const hasAccountTransferAccept = accountOwner?.accountAuthorization?.myPrivileges?.includes(
    AuthorizationPrivilege.TransferResourceAccept
  );

  const [transferSpaceMutation, { loading: transferLoading }] = useTransferSpaceToAccountMutation();

  const spaceError =
    spaceResolved?.state === UrlResolverResultState.NotFound
      ? ('pages.admin.transferSpace.urlNotFound' as const)
      : spaceResolved && !resolvedSpaceId
        ? ('pages.admin.transferSpace.urlNotSpace' as const)
        : resolvedSpaceLevel !== undefined && resolvedSpaceLevel !== SpaceLevel.L0
          ? ('pages.admin.transferSpace.notL0Space' as const)
          : undefined;

  const ownerError =
    ownerResolved?.state === UrlResolverResultState.NotFound
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
    await transferSpaceMutation({
      variables: { spaceId: space.id, targetAccountId: accountOwner.accountId },
    });
  };

  const isL0Space = resolvedSpaceLevel === SpaceLevel.L0;

  return {
    space,
    accountOwner,
    isL0Space,
    hasSpaceTransferOffer,
    hasAccountTransferAccept,
    spaceLoading: spaceResolveLoading || spaceLoading,
    ownerLoading: ownerResolveLoading || userLoading || orgLoading,
    transferLoading,
    spaceError,
    ownerError,
    handleSpaceSubmit,
    handleAccountOwnerSubmit,
    handleTransfer,
  };
};

export default useTransferSpace;
