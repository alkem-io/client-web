import type { AuthorizationPrivilege, ContentUpdatePolicy } from '@/core/apollo/generated/graphql-schema';
import type { Identifiable } from '@/core/utils/Identifiable';
import type { WhiteboardPreviewSettings } from '../WhiteboardPreviewSettings/WhiteboardPreviewSettingsModel';
import type { PreviewImageDimensions } from '../WhiteboardVisuals/WhiteboardPreviewImagesModels';

export interface WhiteboardDetails {
  id: string;
  nameID: string; // NameID is used to name screenshots uploaded as visuals (banner, card...)
  guestContributionsAllowed?: boolean;
  contentUpdatePolicy?: ContentUpdatePolicy;
  authorization?: {
    myPrivileges?: AuthorizationPrivilege[];
    credentialRules?: Array<{
      name?: string | null;
      grantedPrivileges: AuthorizationPrivilege[];
    }>;
  };
  profile: {
    id: string;
    displayName: string;
    storageBucket: {
      id: string;
      allowedMimeTypes: string[];
      maxFileSize: number;
    };
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
  previewSettings: WhiteboardPreviewSettings;
}
