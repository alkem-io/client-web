import type { TemplateType } from '@/core/apollo/generated/graphql-schema';
import type { WhiteboardPreviewSettings } from '@/domain/collaboration/whiteboard/WhiteboardPreviewSettings/WhiteboardPreviewSettingsModel';
import type { TemplateBase } from './TemplateBase';

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
