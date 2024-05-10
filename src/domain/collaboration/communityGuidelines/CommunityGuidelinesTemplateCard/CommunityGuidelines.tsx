import { TemplateBase } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';

export interface CommunityGuidelinesTemplate extends TemplateBase {
  defaultDescription: string;
  type: string;
}

export interface CommunityGuidelinesTemplateWithValue extends CommunityGuidelinesTemplate {}
