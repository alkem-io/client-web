import type { VisualType } from '@/core/apollo/generated/graphql-schema';
import type { WhiteboardPreviewSettings } from '../WhiteboardPreviewSettings/WhiteboardPreviewSettingsModel';

export interface WhiteboardFieldSubmittedValues {
  content: string;
  /**
   * #29 — seed the new whiteboard from an existing whiteboard's stored content on the SERVER
   * (`CreateWhiteboardInput.sourceWhiteboardID`). A live whiteboard's content is WS-only since
   * 006-collab-content-unification, so the "Save as Template" / Duplicate flows can no longer read
   * the source scene on the client and copy it into `content`; instead they pass the source
   * whiteboard's id and the server copies its snapshot. Mutually exclusive with `content`
   * server-side — a create carrying both is rejected — so an emitter that sets this MUST drop
   * `content` (including the empty placeholder).
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
