import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useConvertSpaceL1ToL0Mutation,
  useConvertSpaceL1ToL2Mutation,
  useConvertSpaceL2ToL1Mutation,
  useSpaceConversionLookupQuery,
  useSpaceConversionSiblingSubspacesQuery,
  useSpaceConversionUrlResolveQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { SpaceLevel, UrlResolverResultState } from '@/core/apollo/generated/graphql-schema';
import { useNotification } from '@/core/ui/notifications/useNotification';
import toFullUrl from '../toFullUrl';

const T_PREFIX = 'pages.admin.spaceConversion';

const useSpaceConversion = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const [spaceUrl, setSpaceUrl] = useState('');
  const [mutationCompleted, setMutationCompleted] = useState(false);

  // Step 1: Resolve URL
  const { data: resolveData, loading: resolveLoading } = useSpaceConversionUrlResolveQuery({
    variables: { url: spaceUrl },
    skip: !spaceUrl,
  });

  const resolved = resolveData?.urlResolver;
  const resolvedSpaceId = resolved?.space?.id;
  const resolvedLevel = resolved?.space?.level;
  const levelZeroSpaceId = resolved?.space?.levelZeroSpaceID;

  // Step 2: Fetch space details
  const { data: spaceData, loading: spaceLoading } = useSpaceConversionLookupQuery({
    variables: { spaceId: resolvedSpaceId! },
    skip: !resolvedSpaceId,
  });

  const space = spaceData?.lookup.space;

  // Step 3: Fetch sibling L1 subspaces (only needed for L1→L2 demotion)
  const isL1 = resolvedLevel === SpaceLevel.L1;
  const { data: siblingsData, loading: siblingsLoading } = useSpaceConversionSiblingSubspacesQuery({
    variables: { levelZeroSpaceId: levelZeroSpaceId! },
    skip: !isL1 || !levelZeroSpaceId,
  });

  const siblingSubspaces =
    siblingsData?.lookup.space?.subspaces
      ?.filter(s => s.id !== resolvedSpaceId)
      .map(s => ({ id: s.id, name: s.about.profile.displayName })) ?? [];

  // Mutations
  const [promoteL1ToL0, { loading: promoteL1Loading }] = useConvertSpaceL1ToL0Mutation();
  const [demoteL1ToL2, { loading: demoteL1Loading }] = useConvertSpaceL1ToL2Mutation();
  const [promoteL2ToL1, { loading: promoteL2Loading }] = useConvertSpaceL2ToL1Mutation();

  const mutationLoading = promoteL1Loading || demoteL1Loading || promoteL2Loading;

  // Error derivation
  const isLoading = resolveLoading || spaceLoading;
  const error = isLoading
    ? undefined
    : resolved?.state === UrlResolverResultState.NotFound
      ? (`${T_PREFIX}.urlNotFound` as const)
      : resolved && !resolvedSpaceId
        ? (`${T_PREFIX}.urlNotSpace` as const)
        : undefined;

  // Community counts for L1→L2 warning
  const roleSet = space?.community?.roleSet;
  const communityCounts = roleSet
    ? {
        memberUsers: roleSet.memberUsers?.length ?? 0,
        leadUsers: roleSet.leadUsers?.length ?? 0,
        memberOrganizations: roleSet.memberOrganizations?.length ?? 0,
        leadOrganizations: roleSet.leadOrganizations?.length ?? 0,
        virtualContributors: roleSet.virtualContributorsInRole?.length ?? 0,
      }
    : undefined;

  // Account owner display name
  const accountOwnerName = space?.account?.host?.profile?.displayName;

  const handleResolve = (url: string) => {
    setMutationCompleted(false);
    setSpaceUrl(toFullUrl(url));
  };

  const handlePromoteL1ToL0 = async () => {
    if (!resolvedSpaceId) return;
    try {
      await promoteL1ToL0({ variables: { spaceL1ID: resolvedSpaceId } });
      notify(t(`${T_PREFIX}.successMessage`), 'success');
      setMutationCompleted(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : t(`${T_PREFIX}.errorMessage`);
      notify(message, 'error');
    }
  };

  const handleDemoteL1ToL2 = async (parentSpaceL1ID: string) => {
    if (!resolvedSpaceId) return;
    try {
      await demoteL1ToL2({ variables: { spaceL1ID: resolvedSpaceId, parentSpaceL1ID } });
      notify(t(`${T_PREFIX}.successMessage`), 'success');
      setMutationCompleted(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : t(`${T_PREFIX}.errorMessage`);
      notify(message, 'error');
    }
  };

  const handlePromoteL2ToL1 = async () => {
    if (!resolvedSpaceId) return;
    try {
      await promoteL2ToL1({ variables: { spaceL2ID: resolvedSpaceId } });
      notify(t(`${T_PREFIX}.successMessage`), 'success');
      setMutationCompleted(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : t(`${T_PREFIX}.errorMessage`);
      notify(message, 'error');
    }
  };

  return {
    space: mutationCompleted ? undefined : space,
    resolvedLevel: mutationCompleted ? undefined : resolvedLevel,
    accountOwnerName,
    communityCounts,
    siblingSubspaces,
    siblingsLoading,
    loading: isLoading,
    mutationLoading,
    error,
    handleResolve,
    handlePromoteL1ToL0,
    handleDemoteL1ToL2,
    handlePromoteL2ToL1,
  };
};

export default useSpaceConversion;
