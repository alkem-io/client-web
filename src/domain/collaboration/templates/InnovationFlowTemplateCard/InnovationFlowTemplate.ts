import { TemplateBase } from '../CollaborationTemplatesLibrary/TemplateBase';
import { InnovationFlowTemplateFragment } from '../../../../core/apollo/generated/graphql-schema';
import { TemplateCardInnovationPack, TemplateCardProviderProfile } from '../TemplateCard/Types';

export interface InnovationFlowTemplate extends TemplateBase {
  displayName: string;
  definition: string | undefined;
  tags: string[] | undefined;
  provider: {
    displayName: string | undefined;
    avatarUri: string | undefined;
  };
  innovationPack: {
    id: string | undefined;
    displayName: string | undefined;
  };
}

export const innovationFlowTemplateMapper = (
  template: InnovationFlowTemplateFragment,
  providerProfile?: TemplateCardProviderProfile,
  innovationPack?: TemplateCardInnovationPack
): InnovationFlowTemplate => {
  return {
    id: template.id,
    definition: template.definition,
    displayName: template.profile.displayName,
    description: template.profile.description,
    tags: template.profile.tagset?.tags,
    provider: {
      displayName: providerProfile?.displayName,
      avatarUri: providerProfile?.visual?.uri,
    },
    innovationPack: {
      id: innovationPack?.id,
      displayName: innovationPack?.profile?.displayName,
    },
  };
};
