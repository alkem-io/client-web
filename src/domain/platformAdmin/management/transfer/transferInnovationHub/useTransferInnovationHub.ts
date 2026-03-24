import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useInnovationHubTransferLookupQuery,
  useInnovationHubTransferUrlResolveQuery,
  useTransferInnovationHubToAccountMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { UrlResolverResultState, UrlType } from '@/core/apollo/generated/graphql-schema';
import { useNotification } from '@/core/ui/notifications/useNotification';
import toFullUrl from '../toFullUrl';

const T_PREFIX = 'pages.admin.transferHub';

const useTransferInnovationHub = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const [hubUrl, setHubUrl] = useState('');

  // Step 1: Resolve URL
  const { data: resolveData, loading: resolveLoading } = useInnovationHubTransferUrlResolveQuery({
    variables: { url: hubUrl },
    skip: !hubUrl,
  });

  const resolved = resolveData?.urlResolver;
  const resolvedHubId = resolved?.innovationHubId;

  // Step 2: Fetch hub details
  const { data: hubData, loading: hubLoading } = useInnovationHubTransferLookupQuery({
    variables: { hubId: resolvedHubId! },
    skip: !resolvedHubId,
  });

  const hub = hubData?.lookup.innovationHub;
  const accountHost = hub?.account?.host;
  const currentAccountName = accountHost
    ? 'profile' in accountHost
      ? accountHost.profile.displayName
      : undefined
    : undefined;

  // Mutation
  const [transferMutation, { loading: transferLoading }] = useTransferInnovationHubToAccountMutation();

  // Error derivation
  const isLoading = resolveLoading || hubLoading;
  const error = isLoading
    ? undefined
    : resolved?.state === UrlResolverResultState.NotFound
      ? (`${T_PREFIX}.urlNotFound` as const)
      : resolved && resolved.type !== UrlType.InnovationHub
        ? (`${T_PREFIX}.urlNotHub` as const)
        : undefined;

  const handleResolve = (url: string) => {
    setHubUrl(toFullUrl(url));
  };

  const handleTransfer = async (targetAccountId: string) => {
    if (!hub?.id) return;
    try {
      await transferMutation({
        variables: { innovationHubID: hub.id, targetAccountID: targetAccountId },
      });
      notify(t(`${T_PREFIX}.successMessage`), 'success');
    } catch {
      notify(t(`${T_PREFIX}.errorMessage`), 'error');
    }
  };

  return {
    hub,
    currentAccountName,
    loading: isLoading,
    transferLoading,
    error,
    handleResolve,
    handleTransfer,
  };
};

export default useTransferInnovationHub;
