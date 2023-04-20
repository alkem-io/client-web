import {
  WhiteboardTemplateFragment,
  InnovationPackWithProviderFragment,
  TemplateProviderProfileFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import { TemplateBase } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';

export interface WhiteboardTemplate extends TemplateBase {
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
}

export interface WhiteboardTemplateWithValue extends WhiteboardTemplate {
  value: string;
}

export const whiteboardTemplateMapper = (
  template: WhiteboardTemplateFragment,
  profile?: TemplateProviderProfileFragment,
  innovationPack?: InnovationPackWithProviderFragment
): WhiteboardTemplate => {
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
  };
};
