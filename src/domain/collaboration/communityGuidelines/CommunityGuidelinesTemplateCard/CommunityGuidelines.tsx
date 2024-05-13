import { TemplateBase } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';

export interface CommunityGuidelinesTemplate extends TemplateBase {
  guidelines: {
    profile: {
      displayName: string;
      description: string;
    };
  };
}

export interface CommunityGuidelinesTemplateWithValue extends CommunityGuidelinesTemplate {}
