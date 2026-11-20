import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useSpaceTransferLookupQuery,
  useSpaceTransferUrlResolveQuery,
  useTransferSpaceToAccountMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, SpaceLevel, UrlResolverResultState } from '@/core/apollo/generated/graphql-schema';
import { useNotification } from '@/core/ui/notifications/useNotification';
import useAccountOwnerByUrl from '../shared/useAccountOwnerByUrl';
import toFullUrl from '../toFullUrl';

const useTransferSpace = () => {
  const { t } = useTranslation('crd-common');
  const notify = useNotification();
  const [spaceUrl, setSpaceUrl] = useState('');
  const [mutationCompleted, setMutationCompleted] = useState(false);

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

  // Resolve account owner URL — extracted into a shared hook (client-1) so
  // `AccountTargetTransfer` can reuse the same URL → owner resolution as a
  // fallback when the account search is denied.
  const {
    accountOwner,
    ownerError,
    ownerLoading: ownerIsLoading,
    submit: handleAccountOwnerSubmit,
  } = useAccountOwnerByUrl();

  const hasAccountTransferAccept = accountOwner?.accountAuthorization?.myPrivileges?.includes(
    AuthorizationPrivilege.TransferResourceAccept
  );

  const [transferSpaceMutation, { loading: transferLoading }] = useTransferSpaceToAccountMutation();

  const isLoading = spaceResolveLoading || spaceLoading;

  const spaceError = isLoading
    ? undefined
    : spaceResolved?.state === UrlResolverResultState.NotFound
      ? ('pages.admin.transferSpace.urlNotFound' as const)
      : spaceResolved && !resolvedSpaceId
        ? ('pages.admin.transferSpace.urlNotSpace' as const)
        : resolvedSpaceLevel !== undefined && resolvedSpaceLevel !== SpaceLevel.L0
          ? ('pages.admin.transferSpace.notL0Space' as const)
          : undefined;

  const handleSpaceSubmit = (url: string) => {
    setMutationCompleted(false);
    setSpaceUrl(toFullUrl(url));
  };

  const handleOwnerSubmit = (url: string) => {
    setMutationCompleted(false);
    handleAccountOwnerSubmit(url);
  };

  // client-1: never throws — a rejected mutation (e.g. FORBIDDEN_POLICY) is
  // surfaced as a notification, not an unhandled promise rejection, since the
  // page has nowhere to render a thrown error for this hook.
  const handleTransfer = async () => {
    if (!space?.id || !accountOwner?.accountId) return;
    try {
      const result = await transferSpaceMutation({
        variables: { spaceId: space.id, targetAccountId: accountOwner.accountId },
      });
      if (!result.data?.transferSpaceToAccount?.id) {
        throw new Error('Transfer failed');
      }
      setMutationCompleted(true);
      notify(t('pages.admin.transferSpace.successMessage'), 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : t('pages.admin.transferSpace.errorMessage');
      notify(message, 'error');
    }
  };

  const isL0Space = resolvedSpaceLevel === SpaceLevel.L0;

  return {
    space: mutationCompleted ? undefined : space,
    accountOwner: mutationCompleted ? undefined : accountOwner,
    isL0Space,
    hasSpaceTransferOffer,
    hasAccountTransferAccept,
    spaceLoading: isLoading,
    ownerLoading: ownerIsLoading,
    transferLoading,
    spaceError,
    ownerError,
    handleSpaceSubmit,
    handleAccountOwnerSubmit: handleOwnerSubmit,
    handleTransfer,
  };
};

export default useTransferSpace;
