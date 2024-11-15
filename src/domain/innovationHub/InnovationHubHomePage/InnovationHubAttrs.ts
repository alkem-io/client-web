import { useMemo } from 'react';
import { InnovationHubHomeInnovationHubFragment } from '@/core/apollo/generated/graphql-schema';
import { Visual } from '../../common/visual/Visual';

export interface InnovationHubAttrs {
  displayName: string;
  tagline?: string;
  description: string | undefined;
  banner: Visual | undefined;
}

const useInnovationHubAttrs = (innovationHub: InnovationHubHomeInnovationHubFragment | undefined) =>
  useMemo<InnovationHubAttrs | undefined>(() => {
    if (!innovationHub) {
      return undefined;
    }

    const {
      profile: { displayName, tagline, description, banner },
    } = innovationHub;

    return {
      displayName,
      tagline,
      description,
      banner,
    };
  }, [innovationHub]);

export default useInnovationHubAttrs;
