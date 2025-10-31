import { AuthorizationPrivilege, ContentUpdatePolicy } from '@/core/apollo/generated/graphql-schema';
import { PreviewImageDimensions } from '../../whiteboard/WhiteboardVisuals/WhiteboardPreviewImagesModels';
import { Identifiable } from '@/core/utils/Identifiable';

export interface MemoModelFull {
  id: string;
  contentUpdatePolicy?: ContentUpdatePolicy;
  authorization?: {
    myPrivileges?: AuthorizationPrivilege[];
  };
  profile: {
    id: string;
    displayName: string;
    storageBucket: { id: string };
    visual?: Identifiable & PreviewImageDimensions;
    preview?: Identifiable & PreviewImageDimensions;
    url?: string;
  };
  createdBy?: {
    id: string;
    profile: {
      displayName: string;
      url: string;
      avatar?: { id: string; uri: string };
    };
  };
}
