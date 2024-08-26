import { TemplateBase } from '../../library/CollaborationTemplatesLibrary/TemplateBase';

export interface PostTemplate extends TemplateBase {
  // Template value:
  postDefaultDescription: string;
}

// PostTemplate includes the value
export interface PostTemplateWithValue extends PostTemplate {}
