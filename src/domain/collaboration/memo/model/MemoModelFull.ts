import type { AuthorizationPrivilege, ContentUpdatePolicy } from '@/core/apollo/generated/graphql-schema';
import type { Identifiable } from '@/core/utils/Identifiable';
import type { PreviewImageDimensions } from '../../whiteboard/WhiteboardVisuals/WhiteboardPreviewImagesModels';

export interface MemoModelFull {
  id: string;
  markdown?: string;
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
    profile?: {
      displayName: string;
      url: string;
      avatar?: { id: string; uri: string };
    };
  };
}
