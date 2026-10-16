import { WhiteboardPreviewMode } from '@/core/apollo/generated/graphql-schema';

/**
 * - `none`: keep the visuals as they are.
 * - `card-from-preview`: only the CARD is missing — derive it from the stored preview image, no scene export.
 * - `full`: export the scene and upload both visuals.
 */
export type PreviewWork = 'none' | 'card-from-preview' | 'full';

type PreviewWorkInput = {
  /** This client wrote to the whiteboard during the session. */
  hadLocalEdits: boolean;
  sceneIsEmpty: boolean;
  mode: WhiteboardPreviewMode;
  hasPreview: boolean;
  hasCard: boolean;
  /** The whiteboard exposes visual ids to upload onto. */
  canUpload: boolean;
};

/**
 * Previews are regenerated on close only when they are missing or this session changed the whiteboard.
 * An empty whiteboard keeps the placeholder; a Fixed preview is only regenerated when it does not exist yet.
 */
export const decidePreviewWork = ({
  hadLocalEdits,
  sceneIsEmpty,
  mode,
  hasPreview,
  hasCard,
  canUpload,
}: PreviewWorkInput): PreviewWork => {
  if (!canUpload || sceneIsEmpty) return 'none';
  if (!hasPreview) return 'full';
  if (hadLocalEdits && mode !== WhiteboardPreviewMode.Fixed) return 'full';
  if (!hasCard) return 'card-from-preview';
  return 'none';
};
