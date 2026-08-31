import type { VisualType } from '@/core/apollo/generated/graphql-schema';
import type { WhiteboardPreviewSettings } from '../WhiteboardPreviewSettings/WhiteboardPreviewSettingsModel';

export interface WhiteboardFieldSubmittedValues {
  /** ID of the server-owned live draft Whiteboard consumed as the final source. */
  draftWhiteboardID?: string;
  /**
   * Seed the new whiteboard from an existing whiteboard on the server. A live whiteboard's
   * content is WS-only; ordinary GraphQL carries ids and metadata, never Yjs snapshots.
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
