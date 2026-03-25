import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useTransferVirtualContributorToAccountMutation,
  useVcTransferLookupQuery,
  useVcTransferUrlResolveQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { UrlResolverResultState, UrlType } from '@/core/apollo/generated/graphql-schema';
import { useNotification } from '@/core/ui/notifications/useNotification';
import toFullUrl from '../toFullUrl';

const T_PREFIX = 'pages.admin.transferVc';

const useTransferVirtualContributor = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const [vcUrl, setVcUrl] = useState('');

  // Step 1: Resolve URL
  const { data: resolveData, loading: resolveLoading } = useVcTransferUrlResolveQuery({
    variables: { url: vcUrl },
    skip: !vcUrl,
  });

  const resolved = resolveData?.urlResolver;
  const resolvedVcId = resolved?.virtualContributor?.id;

  // Step 2: Fetch VC details
  const { data: vcData, loading: vcLoading } = useVcTransferLookupQuery({
    variables: { vcId: resolvedVcId! },
    skip: !resolvedVcId,
  });

  const vc = vcData?.lookup.virtualContributor;
  const currentAccountName = vc?.account?.host?.profile?.displayName;

  // Mutation
  const [transferMutation, { loading: transferLoading }] = useTransferVirtualContributorToAccountMutation();

  // Error derivation
  const isLoading = resolveLoading || vcLoading;
  const error = isLoading
    ? undefined
    : resolved?.state === UrlResolverResultState.NotFound
      ? (`${T_PREFIX}.urlNotFound` as const)
      : resolved?.state === UrlResolverResultState.Forbidden
        ? (`${T_PREFIX}.urlForbidden` as const)
        : resolved && resolved.type !== UrlType.VirtualContributor
          ? (`${T_PREFIX}.urlNotVc` as const)
          : undefined;

  const handleResolve = (url: string) => {
    setVcUrl(toFullUrl(url));
  };

  const handleTransfer = async (targetAccountId: string) => {
    if (!vc?.id) return;
    try {
      await transferMutation({
        variables: { virtualContributorID: vc.id, targetAccountID: targetAccountId },
      });
      notify(t(`${T_PREFIX}.successMessage`), 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : t(`${T_PREFIX}.errorMessage`);
      notify(message, 'error');
    }
  };

  return {
    vc,
    currentAccountName,
    loading: isLoading,
    transferLoading,
    error,
    handleResolve,
    handleTransfer,
  };
};

export default useTransferVirtualContributor;
