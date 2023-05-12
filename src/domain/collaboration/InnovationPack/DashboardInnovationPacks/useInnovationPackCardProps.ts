import { InnovationPackCardFragment } from '../../../../core/apollo/generated/graphql-schema';
import { useMemo } from 'react';
import { Identifiable } from '../../../shared/types/Identifiable';
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
          providerDisplayName: innovationPack.provider?.profile.displayName,
          providerAvatarUri: innovationPack.provider?.profile.visual?.uri,
          whiteboardTemplatesCount: innovationPack.templates?.whiteboardTemplates.length,
          postTemplatesCount: innovationPack.templates?.postTemplates.length,
          innovationFlowTemplatesCount: innovationPack.templates?.innovationFlowTemplates.length,
        };
      }),
    [innovationPacks]
  );
};

export default useInnovationPackCardProps;
