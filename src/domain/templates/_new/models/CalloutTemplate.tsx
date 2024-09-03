import { NewTemplateBase } from './TemplateBase';
import { Reference, UpdateTagset } from '../../../common/profile/Profile';
import { CalloutType, TemplateType } from '../../../../core/apollo/generated/graphql-schema';

export interface CalloutTemplate extends NewTemplateBase {
  type: TemplateType; // TemplateType.Callout
  callout?: {
    id: string;
    type: CalloutType;
    framing: {
      profile: {
        displayName: string;
        description?: string;
        references?: Reference[];
        tagsets?: UpdateTagset[];
      }
      whiteboard?: {
        nameID?: string;
        profileData: {
          displayName: string;
          description?: string;
        }
        content?: string;
      };
    }
    contributionDefaults?: {
      postDescription?: string;
      whiteboardContent?: string;
    };
  };
}
