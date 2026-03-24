import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useConvertVcToKnowledgeBaseMutation,
  useVcConversionLookupQuery,
  useVcConversionSourceSpaceCalloutsQuery,
  useVcConversionUrlResolveQuery,
} from '@/core/apollo/generated/apollo-hooks';
import {
  UrlResolverResultState,
  UrlType,
  VirtualContributorBodyOfKnowledgeType,
} from '@/core/apollo/generated/graphql-schema';
import { useNotification } from '@/core/ui/notifications/useNotification';
import toFullUrl from '../toFullUrl';

const T_PREFIX = 'pages.admin.vcConversion';

const useVcConversion = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const [vcUrl, setVcUrl] = useState('');

  // Step 1: Resolve URL
  const { data: resolveData, loading: resolveLoading } = useVcConversionUrlResolveQuery({
    variables: { url: vcUrl },
    skip: !vcUrl,
  });

  const resolved = resolveData?.urlResolver;
  const resolvedVcId = resolved?.virtualContributor?.id;

  // Step 2: Fetch VC details
  const { data: vcData, loading: vcLoading } = useVcConversionLookupQuery({
    variables: { vcId: resolvedVcId! },
    skip: !resolvedVcId,
  });

  const vc = vcData?.lookup.virtualContributor;
  const bodyOfKnowledgeType = vc?.aiPersona?.bodyOfKnowledgeType;
  const bodyOfKnowledgeId = vc?.aiPersona?.bodyOfKnowledgeID;
  const isSpaceBased = bodyOfKnowledgeType === VirtualContributorBodyOfKnowledgeType.AlkemioSpace;
  const isAlreadyConverted = bodyOfKnowledgeType === VirtualContributorBodyOfKnowledgeType.AlkemioKnowledgeBase;

  const accountHost = vc?.account?.host;
  const accountOwnerName = accountHost
    ? 'profile' in accountHost
      ? accountHost.profile.displayName
      : undefined
    : undefined;

  // Step 3: Fetch source space callout count (only for space-based VCs)
  const { data: spaceData, loading: spaceLoading } = useVcConversionSourceSpaceCalloutsQuery({
    variables: { spaceId: bodyOfKnowledgeId! },
    skip: !isSpaceBased || !bodyOfKnowledgeId,
  });

  const sourceSpace = spaceData?.lookup.space;
  const sourceSpaceName = sourceSpace?.about.profile.displayName;
  const calloutCount = sourceSpace?.collaboration?.calloutsSet?.callouts?.length ?? 0;

  // Mutation
  const [convertMutation, { loading: convertLoading }] = useConvertVcToKnowledgeBaseMutation();

  // Error derivation
  const isLoading = resolveLoading || vcLoading;
  const error = isLoading
    ? undefined
    : resolved?.state === UrlResolverResultState.NotFound
      ? (`${T_PREFIX}.urlNotFound` as const)
      : resolved && resolved.type !== UrlType.VirtualContributor
        ? (`${T_PREFIX}.urlNotVc` as const)
        : undefined;

  const handleResolve = (url: string) => {
    setVcUrl(toFullUrl(url));
  };

  const handleConvert = async () => {
    if (!vc?.id) return;
    try {
      await convertMutation({ variables: { virtualContributorID: vc.id } });
      notify(t(`${T_PREFIX}.successMessage`), 'success');
    } catch {
      notify(t(`${T_PREFIX}.errorMessage`), 'error');
    }
  };

  return {
    vc,
    bodyOfKnowledgeType,
    isSpaceBased,
    isAlreadyConverted,
    accountOwnerName,
    sourceSpaceName,
    calloutCount,
    spaceLoading,
    loading: isLoading,
    convertLoading,
    error,
    handleResolve,
    handleConvert,
  };
};

export default useVcConversion;
