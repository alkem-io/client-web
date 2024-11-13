import { TemplateType } from '@core/apollo/generated/graphql-schema';
import { TemplateBase } from './TemplateBase';

export interface WhiteboardTemplate extends TemplateBase {
  type: TemplateType; // TemplateType.Whiteboard;
  whiteboard?: {
    id: string;
    content?: string;
  };
}

export interface WhiteboardTemplateContent {
  whiteboard: {
    content: string;
  };
}
