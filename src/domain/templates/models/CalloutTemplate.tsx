import { TemplateBase } from './TemplateBase';
import { CalloutFramingType, TemplateType, VisualType } from '@/core/apollo/generated/graphql-schema';
import { CalloutSettingsModelFull } from '@/domain/collaboration/callout/models/CalloutSettingsModel';
import { WhiteboardPreviewSettings } from '@/domain/collaboration/whiteboard/WhiteboardPreviewSettings/WhiteboardPreviewSettingsModel';
import { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import { TagsetModel } from '@/domain/common/tagset/TagsetModel';

export interface CalloutTemplate extends TemplateBase {
  type: TemplateType; // TemplateType.Callout
  callout?: {
    id: string;
    framing: {
      profile: {
        id?: string;
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
            name: VisualType.WhiteboardPreview;
            uri: string;
          };
        };
        content?: string;
        previewSettings?: WhiteboardPreviewSettings;
      };
      memo?: {
        profile: {
          displayName: string;
          description?: string;
        };
        markdown?: string;
      };
      link?: {
        id?: string;
        uri: string;
        profile: {
          displayName: string;
        };
      };
      mediaGallery?: {
        id?: string;
        visuals?: {
          id?: string;
          uri: string;
          sortOrder?: number;
        }[];
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
