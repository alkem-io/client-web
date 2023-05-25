import { InnovationPackCardFragment } from '../../../../core/apollo/generated/graphql-schema';
import { useMemo } from 'react';
import { Identifiable } from '../../../shared/types/Identifiable';
import { LibraryTemplateCardProps } from './LibraryTemplateCard';
import { compact, sortBy } from 'lodash';
import { TemplateType } from '../InnovationPackProfilePage/InnovationPackProfilePage';

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
                id: template.id,
                description: template.profile.description,
                displayName: template.profile.displayName,
                visualUri: template.profile.visual?.uri,
                tags: template.profile.tagset?.tags,
                provider: {
                  displayName: innovationPack.provider?.profile.displayName,
                  avatarUri: innovationPack.provider?.profile.visual?.uri,
                },
                innovationPack: {
                  id: innovationPack.id,
                  displayName: innovationPack.profile.displayName,
                },
                defaultDescription: template.defaultDescription,
              })
            ),
            ...(innovationPack.templates?.whiteboardTemplates ?? []).map<Identifiable & LibraryTemplateCardProps>(
              template => ({
                templateType: TemplateType.WhiteboardTemplate,
                id: template.id,
                description: template.profile.description,
                displayName: template.profile.displayName,
                visualUri: template.profile.visual?.uri,
                tags: template.profile.tagset?.tags,
                provider: {
                  displayName: innovationPack.provider?.profile.displayName,
                  avatarUri: innovationPack.provider?.profile.visual?.uri,
                },
                innovationPack: {
                  id: innovationPack.id,
                  displayName: innovationPack.profile.displayName,
                },
              })
            ),
            ...(innovationPack.templates?.innovationFlowTemplates ?? []).map<Identifiable & LibraryTemplateCardProps>(
              template => ({
                templateType: TemplateType.InnovationFlowTemplate,
                id: template.id,
                description: template.profile.description,
                displayName: template.profile.displayName,
                visualUri: template.profile.visual?.uri,
                tags: template.profile.tagset?.tags,
                provider: {
                  displayName: innovationPack.provider?.profile.displayName,
                  avatarUri: innovationPack.provider?.profile.visual?.uri,
                },
                innovationPack: {
                  id: innovationPack.id,
                  displayName: innovationPack.profile.displayName,
                },
                definition: template.definition,
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
