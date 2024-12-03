import { InnovationPackCardFragment } from '@/core/apollo/generated/graphql-schema';
import { useMemo } from 'react';
import { Identifiable } from '@/core/utils/Identifiable';
import { InnovationPackCardProps } from '../InnovationPackCard/InnovationPackCard';

const useInnovationPackCardProps = (
  innovationPacks: InnovationPackCardFragment[] | undefined
): (Identifiable & InnovationPackCardProps)[] | undefined => {
  return useMemo<(Identifiable & InnovationPackCardProps)[] | undefined>(
    () =>
      innovationPacks?.map(innovationPack => {
        return {
          id: innovationPack.id,
          displayName: innovationPack.profile.displayName,
          description: innovationPack.profile.description,
          tags: innovationPack.profile.tagset?.tags,
          providerDisplayName: innovationPack.provider.profile.displayName,
          providerAvatarUri: innovationPack.provider.profile.avatar?.uri,
          whiteboardTemplatesCount: innovationPack.templatesSet?.whiteboardTemplatesCount,
          postTemplatesCount: innovationPack.templatesSet?.postTemplatesCount,
          calloutTemplatesCount: innovationPack.templatesSet?.calloutTemplatesCount,
          collaborationTemplatesCount: innovationPack.templatesSet?.collaborationTemplatesCount,
          communityGuidelinesTemplatesCount: innovationPack.templatesSet?.communityGuidelinesTemplatesCount,
          innovationPackUri: innovationPack.profile.url,
        };
      }),
    [innovationPacks]
  );
};

export default useInnovationPackCardProps;
