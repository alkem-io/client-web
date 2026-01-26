import { useMemo } from 'react';
import { AuthorizationPrivilege, InnovationHubHomeInnovationHubFragment } from '@/core/apollo/generated/graphql-schema';
import { Visual } from '@/domain/common/visual/Visual';

export interface InnovationHubAttrs {
  displayName: string;
  tagline?: string;
  description: string | undefined;
  banner: Visual | undefined;
  settingsUrl: string | undefined;
}

const useInnovationHubAttrs = (innovationHub: InnovationHubHomeInnovationHubFragment | undefined) =>
  useMemo<InnovationHubAttrs | undefined>(() => {
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
      settingsUrl: canEdit ? `/hub/${nameID}/settings` : undefined,
    };
  }, [innovationHub]);

export default useInnovationHubAttrs;
