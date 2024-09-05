import { TemplateType } from '../../../../core/apollo/generated/graphql-schema';
import { Identifiable } from '../../../../core/utils/Identifiable';
import { CalloutTemplate } from './CalloutTemplate';
import { CommunityGuidelinesTemplate } from './CommunityGuidelinesTemplate';
import { InnovationFlowTemplate } from './InnovationFlowTemplate';
import { PostTemplate } from './PostTemplate';
import { WhiteboardTemplate } from './WhiteboardTemplate';

export type AnyTemplate =
  | CalloutTemplate
  | CommunityGuidelinesTemplate
  | InnovationFlowTemplate
  | PostTemplate
  | WhiteboardTemplate;

export interface AnyTemplateWithInnovationPack {
  template: AnyTemplate;
  innovationPack?: NewTemplateInnovationPack;
}

export interface NewTemplateBase extends Identifiable {
  type: TemplateType;
  profile: {
    displayName: string;
    description?: string;
    defaultTagset?: { tags: string[] };
    visual?: {
      id: string;
      uri: string;
    };
  };
}

/**
 * The Innovation Pack holder of a template
 */
export interface NewTemplateInnovationPack extends Identifiable {
  profile: {
    displayName: string;
  };
  provider?: {
    profile: {
      displayName: string;
      avatar?: {
        id: string;
        uri: string;
      };
      url?: string;
    };
  };
}
