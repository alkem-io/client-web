import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { useSpace } from '@/domain/space/context/useSpace';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

export type SettingsScopeLevel = 'L0' | 'L1' | 'L2';

export type SettingsScope = {
  id: string;
  level: SettingsScopeLevel;
  url: string;
  roleSetId: string;
  communityId: string;
  guidelinesId: string;
  accountId: string | undefined;
  loading: boolean;
};

const toScopeLevel = (level: SpaceLevel | undefined): SettingsScopeLevel => {
  if (level === SpaceLevel.L1) return 'L1';
  if (level === SpaceLevel.L2) return 'L2';
  return 'L0';
};

/**
 * Resolves the entity IDs the settings page operates on.
 *
 * At L0 the IDs come from `SpaceContext` (the level-zero space). At L1/L2 the
 * level-zero context still resolves to the parent space's IDs, so we must read
 * the subspace fields from `SubspaceContext` instead — otherwise mutations
 * would silently target the wrong community.
 */
export function useSettingsScope(): SettingsScope {
  const { spaceLevel, loading: resolverLoading } = useUrlResolver();
  const { space, loading: spaceLoading } = useSpace();
  const { subspace, loading: subspaceLoading } = useSubSpace();

  // While the URL resolver is still loading, `spaceLevel` is undefined; falling
  // back to L0 here would expose root-space ids on L1/L2 routes and let the
  // settings page boot its tab hooks against the wrong community/role-set
  // until the resolver settles. Hold off until we know the level.
  if (resolverLoading || spaceLevel === undefined) {
    return {
      id: '',
      level: 'L0',
      url: '',
      roleSetId: '',
      communityId: '',
      guidelinesId: '',
      accountId: undefined,
      loading: true,
    };
  }

  const level = toScopeLevel(spaceLevel);

  if (level === 'L0') {
    return {
      id: space.id,
      level,
      url: space.about.profile.url ?? '',
      roleSetId: space.about.membership?.roleSetID ?? '',
      communityId: space.about.membership?.communityID ?? '',
      guidelinesId: space.about.guidelines?.id ?? '',
      accountId: space.accountId || undefined,
      loading: spaceLoading,
    };
  }

  return {
    id: subspace.id,
    level,
    url: subspace.about.profile.url,
    roleSetId: subspace.about.membership.roleSetID ?? '',
    communityId: subspace.about.membership.communityID ?? '',
    guidelinesId: subspace.about.guidelines.id,
    accountId: undefined,
    loading: subspaceLoading,
  };
}
