import { InnovationPackDataFragment } from '../../../../core/apollo/generated/graphql-schema';
import { useMemo } from 'react';
import { Identifiable } from '../../../../core/utils/Identifiable';
import { LibraryTemplateCardProps } from './LibraryTemplateCard';
import { sortBy } from 'lodash';
import { TemplateWithInnovationPack } from '../../../platform/admin/templates/InnovationPacks/ImportTemplatesDialogGalleryStep';
import { TemplateBase } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';
import { TemplateType } from '../InnovationPackProfilePage/InnovationPackProfilePage';

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
              templateInnovationPackHydrator(innovationPack, TemplateType.CalloutTemplate)
            ),
            ...(innovationPack.templates?.whiteboardTemplates ?? []).map(
              templateInnovationPackHydrator(innovationPack, TemplateType.WhiteboardTemplate)
            ),
            ...(innovationPack.templates?.communityGuidelinesTemplates ?? []).map(
              templateInnovationPackHydrator(innovationPack, TemplateType.CommunityGuidelinesTemplate)
            ),
            ...(innovationPack.templates?.postTemplates ?? []).map(
              templateInnovationPackHydrator(innovationPack, TemplateType.PostTemplate)
            ),
            ...(innovationPack.templates?.innovationFlowTemplates ?? []).map(
              templateInnovationPackHydrator(innovationPack, TemplateType.InnovationFlowTemplate)
            ),
          ] as LibraryTemplateCardProps[];
        }),
        template => template.profile.displayName?.toLowerCase()
      ),
    [innovationPacks]
  );
};

export default useLibraryTemplateCardProps;
