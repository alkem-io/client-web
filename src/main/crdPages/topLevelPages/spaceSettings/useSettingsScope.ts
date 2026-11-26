import { NotFoundError } from '@/core/40XErrorHandler/40XErrors';
import { useSpacePageShellQuery } from '@/core/apollo/generated-v2/apollo-hooks';
import { shellSpace } from '@/domain/space/context/spacePageShellMapper';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

export type SettingsScopeLevel = 'L0' | 'L1' | 'L2';

export type SettingsScope = {
  id: string;
  level: SettingsScopeLevel;
  url: string;
  /** The membership resource: the space itself (no role-set wrapper natively; "wrapper-ids" → Space.id). */
  roleSetId: string;
  /** The space itself (no community wrapper natively; "wrapper-ids" → Space.id). */
  communityId: string;
  /** The space itself: its guidelines are `Space.guidelines` ("wrapper-ids" → Space.id). */
  guidelinesId: string;
  accountId: string | undefined;
  displayName: string;
  tagline: string | undefined;
  /** `SpaceCan.update` — undefined until the space is read. */
  canUpdate: boolean | undefined;
  /** `SpaceCan.createSubspace` (023 FR-018). */
  canCreateSubspace: boolean;
  /** `SpaceCan.saveAsTemplate` (A16.6). */
  canSaveAsTemplate: boolean;
  loading: boolean;
};

const toScopeLevel = (depth: number): SettingsScopeLevel => (depth === 1 ? 'L1' : depth === 2 ? 'L2' : 'L0');

/**
 * Resolves the space the settings page operates on — the space the URL resolves to, at any depth — from one native
 * read (SpacePageShell, the same read SpaceContext makes for the level-zero space).
 */
export function useSettingsScope(): SettingsScope {
  const { spaceId, loading: resolverLoading } = useUrlResolver();
  const id = spaceId ?? '';
  const { data, loading, error } = useSpacePageShellQuery({ variables: { id }, skip: resolverLoading || !id });
  if (id && error) throw error;

  const space = resolverLoading ? undefined : shellSpace(data?.node, id);
  if (id && !resolverLoading && !loading && data && !space) throw new NotFoundError();
  if (!space) {
    return {
      id: '',
      level: 'L0',
      url: '',
      roleSetId: '',
      communityId: '',
      guidelinesId: '',
      accountId: undefined,
      displayName: '',
      tagline: undefined,
      canUpdate: undefined,
      canCreateSubspace: false,
      canSaveAsTemplate: false,
      loading: resolverLoading || loading || !!id,
    };
  }

  const level = toScopeLevel(space.depth);
  return {
    id: space.id,
    level,
    url: space.url ?? '',
    roleSetId: space.id,
    communityId: space.id,
    guidelinesId: space.id,
    // The account section of pickers is the top-level space's hosting account, as before (L1/L2 have none).
    accountId: level === 'L0' ? (space.host?.account?.id ?? undefined) : undefined,
    displayName: space.about.displayName,
    tagline: space.about.tagline ?? undefined,
    canUpdate: space.can.update,
    canCreateSubspace: space.can.createSubspace,
    canSaveAsTemplate: space.can.saveAsTemplate,
    loading: false,
  };
}
