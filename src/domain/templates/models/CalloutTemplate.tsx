import { TemplateBase } from './TemplateBase';
import { UpdateTagset } from '@/domain/common/profile/Profile';
import { CalloutType, TemplateType } from '@/core/apollo/generated/graphql-schema';
import { ReferenceModel } from '@/domain/common/reference/ReferenceModel';

export interface CalloutTemplate extends TemplateBase {
  type: TemplateType; // TemplateType.Callout
  callout?: {
    id: string;
    type: CalloutType;
    framing: {
      profile: {
        displayName: string;
        description?: string;
        references?: ReferenceModel[];
        tagsets?: UpdateTagset[];
      };
      whiteboard?: {
        profile: {
          displayName: string;
          description?: string;
        };
        content?: string;
      };
    };
    contributionDefaults?: {
      postDescription?: string;
      whiteboardContent?: string; // For Whiteboard Collection Callout templates
    };
  };
}
