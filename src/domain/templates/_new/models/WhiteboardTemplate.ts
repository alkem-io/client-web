import { TemplateType } from '../../../../core/apollo/generated/graphql-schema';
import { NewTemplateBase } from './TemplateBase';

export interface WhiteboardTemplate extends NewTemplateBase {
  type: TemplateType; // TemplateType.Whiteboard;
  whiteboard?: {
    id: string;
  };
}

export interface WhiteboardTemplateContent {
  whiteboard: {
    content: string;
  };
}
