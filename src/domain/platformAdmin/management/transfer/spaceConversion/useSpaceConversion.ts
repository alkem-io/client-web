import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useConvertSpaceL1ToL0Mutation,
  useConvertSpaceL1ToL2Mutation,
  useConvertSpaceL2ToL1Mutation,
  useMoveSpaceL1ToL0Mutation,
  useMoveSpaceL1ToL2Mutation,
  useMoveSpaceL2ToL1Mutation,
  useSpaceConversionLookupQuery,
  useSpaceConversionSiblingSubspacesQuery,
  useSpaceConversionUrlResolveQuery,
  useSpaceMoveTargetL0SpacesQuery,
  useSpaceMoveTargetL1SubspacesQuery,
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
  const [movedSpaceUrl, setMovedSpaceUrl] = useState<string | undefined>(undefined);
  const [selectedTargetL0Id, setSelectedTargetL0Id] = useState('');

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

  // Move target pickers (bounded page, FR-010)
  // targetL0Spaces: for L1→L0 move — excludes current parent (levelZeroSpaceId for L1)
  // for L2→L1 and L1→L2 moves — excludes own L0 (cross-L0 only, R-4)
  const { data: targetL0Data, loading: targetL0Loading } = useSpaceMoveTargetL0SpacesQuery({
    variables: { first: 100 },
    skip: !resolvedSpaceId,
  });

  const targetL0Spaces =
    targetL0Data?.spacesPaginated.spaces.map(s => ({
      id: s.id,
      displayName: s.about.profile.displayName,
    })) ?? [];

  // L0 IDs to exclude from target picker — always exclude the source's own L0 (cross-L0 only)
  // For L1: own L0 = levelZeroSpaceId (which IS the current parent); for L2: levelZeroSpaceId
  const targetL0ExcludeIds = levelZeroSpaceId ? [levelZeroSpaceId] : [];

  // L1 subspaces of a chosen L0 (for two-stage picks: L2→L1 and L1→L2)
  const { data: targetL1Data, loading: targetL1Loading } = useSpaceMoveTargetL1SubspacesQuery({
    variables: { targetL0SpaceId: selectedTargetL0Id },
    skip: !selectedTargetL0Id,
  });

  const targetL1Subspaces =
    targetL1Data?.lookup.space?.subspaces?.map(s => ({
      id: s.id,
      displayName: s.about.profile.displayName,
    })) ?? [];

  // Conversion mutations
  const [promoteL1ToL0, { loading: promoteL1Loading }] = useConvertSpaceL1ToL0Mutation();
  const [demoteL1ToL2, { loading: demoteL1Loading }] = useConvertSpaceL1ToL2Mutation();
  const [promoteL2ToL1, { loading: promoteL2Loading }] = useConvertSpaceL2ToL1Mutation();

  // Move mutations
  const [moveL1ToL0Mut, { loading: moveL1ToL0Loading }] = useMoveSpaceL1ToL0Mutation();
  const [moveL1ToL2Mut, { loading: moveL1ToL2Loading }] = useMoveSpaceL1ToL2Mutation();
  const [moveL2ToL1Mut, { loading: moveL2ToL1Loading }] = useMoveSpaceL2ToL1Mutation();

  const mutationLoading =
    promoteL1Loading ||
    demoteL1Loading ||
    promoteL2Loading ||
    moveL1ToL0Loading ||
    moveL1ToL2Loading ||
    moveL2ToL1Loading;

  // Error derivation
  const isLoading = resolveLoading || spaceLoading;
  const error = isLoading
    ? undefined
    : resolved?.state === UrlResolverResultState.NotFound
      ? (`${T_PREFIX}.urlNotFound` as const)
      : resolved?.state === UrlResolverResultState.Forbidden
        ? (`${T_PREFIX}.urlForbidden` as const)
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
    setMovedSpaceUrl(undefined);
    setSelectedTargetL0Id('');
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

  // Move handlers

  const moveL1ToL0 = async (targetSpaceL0ID: string, autoInvite?: boolean, invitationMessage?: string) => {
    if (!resolvedSpaceId) return;
    try {
      const result = await moveL1ToL0Mut({
        variables: { spaceL1ID: resolvedSpaceId, targetSpaceL0ID, autoInvite, invitationMessage },
      });
      const url = result.data?.moveSpaceL1ToSpaceL0?.about?.profile?.url;
      setMovedSpaceUrl(url);
      notify(t(`${T_PREFIX}.successMessage`), 'success');
      setMutationCompleted(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : t(`${T_PREFIX}.errorMessage`);
      notify(message, 'error');
      throw err;
    }
  };

  const moveL1ToL2 = async (targetSpaceL1ID: string, autoInvite?: boolean, invitationMessage?: string) => {
    if (!resolvedSpaceId) return;
    try {
      const result = await moveL1ToL2Mut({
        variables: { spaceL1ID: resolvedSpaceId, targetSpaceL1ID, autoInvite, invitationMessage },
      });
      const url = result.data?.moveSpaceL1ToSpaceL2?.about?.profile?.url;
      setMovedSpaceUrl(url);
      notify(t(`${T_PREFIX}.successMessage`), 'success');
      setMutationCompleted(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : t(`${T_PREFIX}.errorMessage`);
      notify(message, 'error');
      throw err;
    }
  };

  const moveL2ToL1 = async (targetSpaceL1ID: string, autoInvite?: boolean, invitationMessage?: string) => {
    if (!resolvedSpaceId) return;
    try {
      const result = await moveL2ToL1Mut({
        variables: { spaceL2ID: resolvedSpaceId, targetSpaceL1ID, autoInvite, invitationMessage },
      });
      const url = result.data?.moveSpaceL2ToSpaceL1?.about?.profile?.url;
      setMovedSpaceUrl(url);
      notify(t(`${T_PREFIX}.successMessage`), 'success');
      setMutationCompleted(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : t(`${T_PREFIX}.errorMessage`);
      notify(message, 'error');
      throw err;
    }
  };

  return {
    space: mutationCompleted ? undefined : space,
    resolvedLevel: mutationCompleted ? undefined : resolvedLevel,
    resolvedSpaceId: mutationCompleted ? undefined : resolvedSpaceId,
    levelZeroSpaceId: mutationCompleted ? undefined : levelZeroSpaceId,
    accountOwnerName,
    communityCounts,
    siblingSubspaces,
    siblingsLoading,
    loading: isLoading,
    mutationLoading,
    error,
    movedSpaceUrl,
    // Move picker data
    targetL0Spaces,
    targetL0Loading,
    targetL0ExcludeIds,
    targetL1Subspaces,
    targetL1Loading,
    selectedTargetL0Id,
    setSelectedTargetL0Id,
    // Handlers
    handleResolve,
    handlePromoteL1ToL0,
    handleDemoteL1ToL2,
    handlePromoteL2ToL1,
    moveL1ToL0,
    moveL1ToL2,
    moveL2ToL1,
  };
};

export default useSpaceConversion;
