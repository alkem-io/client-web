import { InnovationPackCardFragment } from '../../../../core/apollo/generated/graphql-schema';
import { useMemo } from 'react';
import { Identifiable } from '../../../../core/utils/Identifiable';
import { InnovationPackCardProps } from '../InnovationPackCard/InnovationPackCard';
import { buildInnovationPackUrl } from '../urlBuilders';

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
          providerAvatarUri: innovationPack.provider?.profile.avatar?.uri,
          whiteboardTemplatesCount: innovationPack.templates?.whiteboardTemplatesCount,
          postTemplatesCount: innovationPack.templates?.postTemplatesCount,
          innovationFlowTemplatesCount: innovationPack.templates?.innovationFlowTemplatesCount,
          innovationPackUri: buildInnovationPackUrl(innovationPack.nameID),
        };
      }),
    [innovationPacks]
  );
};

export default useInnovationPackCardProps;
