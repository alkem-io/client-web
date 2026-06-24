import type { VisualType } from '@/core/apollo/generated/graphql-schema';
import type { WhiteboardPreviewSettings } from '../WhiteboardPreviewSettings/WhiteboardPreviewSettingsModel';
import type { WhiteboardPreviewImage } from '../WhiteboardVisuals/WhiteboardPreviewImagesModels';

export interface WhiteboardFieldSubmittedValues {
  content: string;
  /**
   * #29 — seed the new whiteboard from an existing whiteboard's stored content on the SERVER
   * (`CreateWhiteboardInput.sourceWhiteboardID`). A live whiteboard's content is WS-only since
   * 006-collab-content-unification, so the "Save as Template" / Duplicate flows can no longer read
   * the source scene on the client and copy it into `content`; instead they pass the source
   * whiteboard's id and the server copies its snapshot. Takes precedence over `content` server-side.
   */
  sourceWhiteboardID?: string;
  profile: {
    displayName: string;
    visuals?: {
      // Used if we use a template coming with the whiteboards visuals
      name: VisualType;
      uri: string;
    }[];
  };
  previewSettings: WhiteboardPreviewSettings | undefined; // used if we edit the whiteboard and produces it's own visuals
}

export interface WhiteboardFieldSubmittedValuesWithPreviewImages extends WhiteboardFieldSubmittedValues {
  // Whiteboard Preview Images are sent as visuals in a different call to the server after the callout is saved (See useCalloutCreationWithPreviewImages.ts)
  previewImages: WhiteboardPreviewImage[] | undefined;
}
