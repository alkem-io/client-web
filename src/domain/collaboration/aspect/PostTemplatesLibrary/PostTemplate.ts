import {
  PostTemplateFragment,
  InnovationPackWithProviderFragment,
  TemplateProviderProfileFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import { TemplateBase } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';

export interface PostTemplate extends TemplateBase {
  displayName: string;
  description: string;
  visualUri: string | undefined;
  tags: string[] | undefined;
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
  template: PostTemplateFragment,
  profile?: TemplateProviderProfileFragment,
  innovationPack?: InnovationPackWithProviderFragment
): PostTemplate => {
  return {
    id: template.id,
    displayName: template.profile.displayName,
    description: template.profile.description ?? '',
    tags: template.profile.tagset?.tags,
    provider: {
      displayName: profile?.displayName,
      avatarUri: profile?.visual?.uri,
    },
    innovationPack: {
      id: innovationPack?.id,
      displayName: innovationPack?.provider?.profile.displayName,
    },
    visualUri: template.profile.visual?.uri,
    defaultDescription: template.defaultDescription,
    type: template.type,
  };
};
