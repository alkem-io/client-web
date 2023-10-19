import { TemplateBase } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';
import { InnovationFlowTemplateFragment } from '../../../../core/apollo/generated/graphql-schema';
import { TemplateCardInnovationPack, TemplateCardProviderProfile } from '../../templates/TemplateCard/Types';

export interface InnovationFlowTemplate extends TemplateBase {
  displayName: string;
  type: string;
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

// InnovationFlowTemplateTemplate includes the Definition
export interface InnovationFlowTemplateWithDefinition extends InnovationFlowTemplate {}

export const innovationFlowTemplateMapper = (
  template: InnovationFlowTemplateFragment,
  providerProfile?: TemplateCardProviderProfile,
  innovationPack?: TemplateCardInnovationPack
): InnovationFlowTemplate => {
  return {
    id: template.id,
    type: template.type,
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
