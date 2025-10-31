import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { TemplateBase } from './TemplateBase';
import { WhiteboardPreviewSettings } from '@/domain/collaboration/whiteboard/WhiteboardPreviewSettings/WhiteboardPreviewSettingsModel';

export interface WhiteboardTemplate extends TemplateBase {
  type: TemplateType; // TemplateType.Whiteboard;
  whiteboard?: {
    id: string;
    content?: string;
    previewSettings?: WhiteboardPreviewSettings;
  };
}

export interface WhiteboardTemplateContent {
  whiteboard: {
    content: string;
  };
}
