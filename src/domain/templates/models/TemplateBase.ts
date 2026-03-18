import type { TemplateType } from '@/core/apollo/generated/graphql-schema';
import type { Identifiable } from '@/core/utils/Identifiable';
import type { CalloutTemplate } from './CalloutTemplate';
import type { CommunityGuidelinesTemplate } from './CommunityGuidelinesTemplate';
import type { PostTemplate } from './PostTemplate';
import type { SpaceTemplate } from './SpaceTemplate';
import type { WhiteboardTemplate } from './WhiteboardTemplate';

export type AnyTemplate =
  | CalloutTemplate
  | SpaceTemplate
  | CommunityGuidelinesTemplate
  | PostTemplate
  | WhiteboardTemplate;

export interface AnyTemplateWithInnovationPack {
  template: AnyTemplate;
  innovationPack?: TemplateInnovationPack;
}

export interface TemplateBase extends Identifiable {
  type: TemplateType;
  profile: {
    displayName: string;
    description?: string;
    defaultTagset?: { tags: string[] };
    visual?: {
      id: string;
      uri: string;
    };
    url?: string;
  };
}

/**
 * The Innovation Pack holder of a template
 */
export interface TemplateInnovationPack extends Identifiable {
  profile: {
    displayName: string;
  };
  provider?: {
    profile?: {
      displayName: string;
      avatar?: {
        id: string;
        uri: string;
      };
      url?: string;
    };
  };
}
