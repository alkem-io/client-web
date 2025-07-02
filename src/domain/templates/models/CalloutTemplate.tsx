import { TemplateBase } from './TemplateBase';
import { CalloutFramingType, CalloutType, TemplateType, VisualType } from '@/core/apollo/generated/graphql-schema';
import { CalloutSettingsModelFull } from '@/domain/collaboration/callout/models/CalloutSettingsModel';
import { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import { TagsetModel } from '@/domain/common/tagset/TagsetModel';

export interface CalloutTemplate extends TemplateBase {
  type: TemplateType; // TemplateType.Callout
  callout?: {
    id: string;
    /**
     * @deprecated
     */
    calloutTypeDeprecated?: CalloutType;
    framing: {
      profile: {
        displayName: string;
        description?: string;
        references?: ReferenceModel[];
        tagsets?: TagsetModel[];
      };
      type: CalloutFramingType;
      whiteboard?: {
        profile: {
          displayName: string;
          description?: string;
          preview?: {
            name: VisualType.Banner;
            uri: string;
          };
        };
        content?: string;
      };
    };
    contributionDefaults?: {
      defaultDisplayName?: string;
      postDescription?: string;
      whiteboardContent?: string; // For Whiteboard Collection Callout templates
    };
    settings: CalloutSettingsModelFull;
  };
}
