import { PostTemplateCardFragment } from '../../../../core/apollo/generated/graphql-schema';
import { TemplateBase } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';
import { TemplateCardInnovationPack, TemplateCardProviderProfile } from '../../templates/TemplateCard/Types';

export interface PostTemplate extends TemplateBase {
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
  // Template value:
  defaultDescription: string;
  type: string;
}

// PostTemplate includes the value
export interface PostTemplateWithValue extends PostTemplate {}

export const postTemplateMapper = (
  template: PostTemplateCardFragment,
  providerProfile?: TemplateCardProviderProfile,
  innovationPack?: TemplateCardInnovationPack
): PostTemplate => {
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
    defaultDescription: template.defaultDescription,
    type: template.type,
  };
};
