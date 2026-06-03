import {
  AuthorizationPrivilege,
  type InnovationHubHomeInnovationHubFragment,
  type InnovationHubType,
  type SpaceVisibility,
} from '@/core/apollo/generated/graphql-schema';
import type { Visual } from '@/domain/common/visual/Visual';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';

export interface InnovationHubAttrs {
  displayName: string;
  tagline?: string;
  description: string | undefined;
  banner: Visual | undefined;
  settingsUrl: string | undefined;
  /** Hub filter shape — used by the home page to show only the hub's Spaces. */
  type: InnovationHubType;
  /** Ordered Space ids for a `LIST` hub (empty for a `VISIBILITY` hub). */
  spaceListFilterIds: string[];
  /** The visibility a `VISIBILITY` hub displays (undefined for a `LIST` hub). */
  spaceVisibilityFilter: SpaceVisibility | undefined;
}

const useInnovationHubAttrs = (innovationHub: InnovationHubHomeInnovationHubFragment | undefined) =>
  (() => {
    if (!innovationHub) {
      return undefined;
    }

    const {
      nameID,
      profile: { displayName, tagline, description, banner },
      authorization,
    } = innovationHub;

    const canEdit = authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false;

    return {
      displayName,
      tagline,
      description,
      banner,
      settingsUrl: canEdit ? buildSettingsUrl(`/hub/${nameID}`) : undefined,
      type: innovationHub.type,
      spaceListFilterIds: innovationHub.spaceListFilter?.map(s => s.id) ?? [],
      spaceVisibilityFilter: innovationHub.spaceVisibilityFilter ?? undefined,
    };
  })();

export default useInnovationHubAttrs;
