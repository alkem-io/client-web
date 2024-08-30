import { TemplateType } from '../../../../core/apollo/generated/graphql-schema';
import { NewTemplateBase } from './TemplateBase';

export interface WhiteboardTemplate extends NewTemplateBase {
  type: TemplateType.Whiteboard;
  whiteboard?: {
    id: string;
  };
}
