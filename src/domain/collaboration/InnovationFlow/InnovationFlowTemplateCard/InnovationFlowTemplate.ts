import { TemplateBase } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';
import { InnovationFlowTemplateCardFragment } from '../../../../core/apollo/generated/graphql-schema';
import { TemplateCardInnovationPack, TemplateCardProviderProfile } from '../../templates/TemplateCard/Types';

export interface InnovationFlowTemplate extends TemplateBase {
  displayName: string;
  type: string;
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

export interface InnovationFlowTemplateWithDefinition extends InnovationFlowTemplate {
  definition: string | undefined;
}

export const innovationFlowTemplateMapper = (
  template: InnovationFlowTemplateCardFragment,
  providerProfile?: TemplateCardProviderProfile,
  innovationPack?: TemplateCardInnovationPack
): InnovationFlowTemplate => {
  return {
    id: template.id,
    type: template.type,
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
