import {
  AuthorizationPrivilege,
  type InnovationHubHomeInnovationHubFragment,
} from '@/core/apollo/generated/graphql-schema';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';

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
