import type { TemplateType } from '@/core/apollo/generated/graphql-schema';
import type { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import type { TemplateBase } from './TemplateBase';

export interface CommunityGuidelinesTemplate extends TemplateBase {
  type: TemplateType; // TemplateType.CommunityGuidelines;
  communityGuidelines?: {
    id: string;
    profile: {
      id?: string; // it is set if editing a template. Is not sent to the server on update. It is used to update the References
      displayName: string;
      description?: string;
      references?: ReferenceModel[];
    };
  };
}
