import {
  CanvasTemplateFragment,
  CanvasTemplateProviderProfileFragment,
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
  provider?: CanvasTemplateProviderProfileFragment,
  innovationPack?: { id: string; displayName: string }
): CanvasTemplate => {
  return {
    id: template.id,
    displayName: template.info.title,
    description: template.info.description,
    tags: template.info.tagset?.tags,
    provider: {
      displayName: provider?.displayName,
      avatarUri: provider?.visual?.uri,
    },
    innovationPack: {
      id: innovationPack?.id,
      displayName: innovationPack?.displayName,
    },
    visualUri: template.info.visual?.uri,
  };
};
