import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useInnovationPackTransferLookupQuery,
  useInnovationPackTransferUrlResolveQuery,
  useTransferInnovationPackToAccountMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { UrlResolverResultState, UrlType } from '@/core/apollo/generated/graphql-schema';
import { useNotification } from '@/core/ui/notifications/useNotification';
import toFullUrl from '../toFullUrl';

const T_PREFIX = 'pages.admin.transferPack';

const useTransferInnovationPack = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const [packUrl, setPackUrl] = useState('');

  // Step 1: Resolve URL
  const { data: resolveData, loading: resolveLoading } = useInnovationPackTransferUrlResolveQuery({
    variables: { url: packUrl },
    skip: !packUrl,
  });

  const resolved = resolveData?.urlResolver;
  const resolvedPackId = resolved?.innovationPack?.id;

  // Step 2: Fetch pack details
  const { data: packData, loading: packLoading } = useInnovationPackTransferLookupQuery({
    variables: { packId: resolvedPackId! },
    skip: !resolvedPackId,
  });

  const pack = packData?.lookup.innovationPack;
  const currentAccountName = pack?.provider?.profile?.displayName;

  // Mutation
  const [transferMutation, { loading: transferLoading }] = useTransferInnovationPackToAccountMutation();

  // Error derivation
  const isLoading = resolveLoading || packLoading;
  const error = isLoading
    ? undefined
    : resolved?.state === UrlResolverResultState.NotFound
      ? (`${T_PREFIX}.urlNotFound` as const)
      : resolved && resolved.type !== UrlType.InnovationPacks
        ? (`${T_PREFIX}.urlNotPack` as const)
        : undefined;

  const handleResolve = (url: string) => {
    setPackUrl(toFullUrl(url));
  };

  const handleTransfer = async (targetAccountId: string) => {
    if (!pack?.id) return;
    try {
      await transferMutation({
        variables: { innovationPackID: pack.id, targetAccountID: targetAccountId },
      });
      notify(t(`${T_PREFIX}.successMessage`), 'success');
    } catch {
      notify(t(`${T_PREFIX}.errorMessage`), 'error');
    }
  };

  return {
    pack,
    currentAccountName,
    loading: isLoading,
    transferLoading,
    error,
    handleResolve,
    handleTransfer,
  };
};

export default useTransferInnovationPack;
