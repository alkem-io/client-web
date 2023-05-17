import { WhiteboardTemplateCardFragment } from '../../../../core/apollo/generated/graphql-schema';
import { TemplateBase } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';
import { TemplateCardInnovationPack, TemplateCardProviderProfile } from '../../templates/TemplateCard/Types';

export interface WhiteboardTemplate extends TemplateBase {
  displayName: string;
  description: string | undefined;
  visualUri: string | undefined;
  // TODO display tags
  // tags: string[] | undefined;
  provider: {
    displayName: string | undefined;
    avatarUri: string | undefined;
  };
  innovationPack: {
    id: string | undefined;
    displayName: string | undefined;
  };
}

export interface WhiteboardTemplateWithValue extends WhiteboardTemplate {
  value: string;
}

export const whiteboardTemplateMapper = (
  template: WhiteboardTemplateCardFragment,
  providerProfile?: TemplateCardProviderProfile,
  innovationPack?: TemplateCardInnovationPack
): WhiteboardTemplate => {
  return {
    id: template.id,
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
    visualUri: template.profile.visual?.uri,
  };
};
