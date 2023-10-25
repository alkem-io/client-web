import { InnovationPackCardFragment } from '../../../../core/apollo/generated/graphql-schema';
import { useMemo } from 'react';
import { Identifiable } from '../../../../core/utils/Identifiable';
import { LibraryTemplateCardProps } from './LibraryTemplateCard';
import { compact, sortBy } from 'lodash';
import { TemplateType } from '../InnovationPackProfilePage/InnovationPackProfilePage';
import { postTemplateMapper } from '../../post/PostTemplateCard/PostTemplate';
import { whiteboardTemplateMapper } from '../../whiteboard/WhiteboardTemplateCard/WhiteboardTemplate';
import { innovationFlowTemplateMapper } from '../../InnovationFlow/InnovationFlowTemplateCard/InnovationFlowTemplate';

const useLibraryTemplateCardProps = (
  innovationPacks: InnovationPackCardFragment[] | undefined
): (Identifiable & LibraryTemplateCardProps)[] | undefined => {
  return useMemo<(Identifiable & LibraryTemplateCardProps)[] | undefined>(
    () =>
      sortBy(
        innovationPacks?.flatMap(innovationPack => {
          return compact([
            ...(innovationPack.templates?.postTemplates ?? []).map<Identifiable & LibraryTemplateCardProps>(
              template => ({
                templateType: TemplateType.PostTemplate,
                ...postTemplateMapper(template, innovationPack.provider?.profile, innovationPack),
              })
            ),
            ...(innovationPack.templates?.whiteboardTemplates ?? []).map<Identifiable & LibraryTemplateCardProps>(
              template => ({
                templateType: TemplateType.WhiteboardTemplate,
                ...whiteboardTemplateMapper(template, innovationPack.provider?.profile, innovationPack),
              })
            ),
            ...(innovationPack.templates?.innovationFlowTemplates ?? []).map<Identifiable & LibraryTemplateCardProps>(
              template => ({
                templateType: TemplateType.InnovationFlowTemplate,
                ...innovationFlowTemplateMapper(template, innovationPack.provider?.profile, innovationPack),
              })
            ),
          ]);
        }),
        template => template.displayName?.toLowerCase()
      ),
    [innovationPacks]
  );
};

export default useLibraryTemplateCardProps;
