import {
  CanvasTemplateFragment,
  InnovationPackWithProviderFragment,
  TemplateProviderProfileFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import { Identifiable } from '../../../shared/types/Identifiable';

export interface CanvasTemplate extends Identifiable {
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

export interface CanvasTemplateWithValue extends CanvasTemplate {
  value: string;
}

export const CanvasTemplateMapper = (
  template: CanvasTemplateFragment,
  profile?: TemplateProviderProfileFragment,
  innovationPack?: InnovationPackWithProviderFragment
): CanvasTemplate => {
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
