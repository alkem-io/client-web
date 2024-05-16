import { Reference } from '../../../common/profile/Profile';
import { TemplateBase } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';

export interface CommunityGuidelinesTemplateWithContent extends TemplateBase {
  guidelines?: {
    profile: {
      displayName: string;
      description?: string;
      references?: Reference[];
    };
  };
}
