import { TemplateBase } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';

export interface PostTemplate extends TemplateBase {
  // Template value:
  defaultDescription: string;
  type: string;
}

// PostTemplate includes the value
export interface PostTemplateWithValue extends PostTemplate {}
