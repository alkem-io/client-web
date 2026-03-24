import type { InnovationPackCardFragment } from '@/core/apollo/generated/graphql-schema';
import type { Identifiable } from '@/core/utils/Identifiable';
import type { InnovationPackCardProps } from '../InnovationPackCard/InnovationPackCard';

const useInnovationPackCardProps = (
  innovationPacks: InnovationPackCardFragment[] | undefined
): (Identifiable & InnovationPackCardProps)[] | undefined => {
  return innovationPacks?.map(innovationPack => {
    return {
      id: innovationPack.id,
      displayName: innovationPack.profile.displayName,
      description: innovationPack.profile.description,
      tags: innovationPack.profile.tagset?.tags,
      providerDisplayName: innovationPack.provider?.profile?.displayName,
      providerAvatarUri: innovationPack.provider?.profile?.avatar?.uri,
      whiteboardTemplatesCount: innovationPack.templatesSet?.whiteboardTemplatesCount,
      postTemplatesCount: innovationPack.templatesSet?.postTemplatesCount,
      calloutTemplatesCount: innovationPack.templatesSet?.calloutTemplatesCount,
      spaceTemplatesCount: innovationPack.templatesSet?.spaceTemplatesCount,
      communityGuidelinesTemplatesCount: innovationPack.templatesSet?.communityGuidelinesTemplatesCount,
      innovationPackUri: innovationPack.profile.url,
    };
  });
};

export default useInnovationPackCardProps;
