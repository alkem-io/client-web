import { InnovationPackDataFragment, TemplateType } from '../../../core/apollo/generated/graphql-schema';
import { useMemo } from 'react';
import { Identifiable } from '../../../core/utils/Identifiable';
import { LibraryTemplateCardProps } from './LibraryTemplateCard';
import { sortBy } from 'lodash';
import { TemplateWithInnovationPack } from '../../platform/admin/InnovationPacks/ImportTemplatesDialogGalleryStep';
import { TemplateBase } from '../../templates/library/CollaborationTemplatesLibrary/TemplateBase';

const templateInnovationPackHydrator =
  (innovationPack: TemplateWithInnovationPack<TemplateBase>['innovationPack'], templateType: TemplateType) =>
  <T extends TemplateBase>(template: T): TemplateWithInnovationPack<T> & { templateType: TemplateType } => ({
    ...template,
    innovationPack,
    templateType,
  });

const useLibraryTemplateCardProps = (
  innovationPacks: InnovationPackDataFragment[] | undefined
): (Identifiable & LibraryTemplateCardProps)[] | undefined => {
  return useMemo<LibraryTemplateCardProps[] | undefined>(
    () =>
      sortBy(
        innovationPacks?.flatMap(innovationPack => {
          return [
            ...(innovationPack.templates?.calloutTemplates ?? []).map(
              templateInnovationPackHydrator(innovationPack, TemplateType.Callout)
            ),
            ...(innovationPack.templates?.whiteboardTemplates ?? []).map(
              templateInnovationPackHydrator(innovationPack, TemplateType.Whiteboard)
            ),
            ...(innovationPack.templates?.communityGuidelinesTemplates ?? []).map(
              templateInnovationPackHydrator(innovationPack, TemplateType.CommunityGuidelines)
            ),
            ...(innovationPack.templates?.postTemplates ?? []).map(
              templateInnovationPackHydrator(innovationPack, TemplateType.Post)
            ),
            ...(innovationPack.templates?.innovationFlowTemplates ?? []).map(
              templateInnovationPackHydrator(innovationPack, TemplateType.InnovationFlow)
            ),
          ] as LibraryTemplateCardProps[];
        }),
        template => template.profile.displayName?.toLowerCase()
      ),
    [innovationPacks]
  );
};

export default useLibraryTemplateCardProps;
