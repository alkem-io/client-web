import { WhiteboardPreviewCoordinates, WhiteboardPreviewMode } from '@/core/apollo/generated/graphql-schema';

export interface WhiteboardPreviewSettings {
  mode: WhiteboardPreviewMode;
  coordinates?: {
    x: WhiteboardPreviewCoordinates['x'];
    y: WhiteboardPreviewCoordinates['y'];
    width: WhiteboardPreviewCoordinates['width'];
    height: WhiteboardPreviewCoordinates['height'];
  };
}

export const DefaultWhiteboardPreviewSettings: WhiteboardPreviewSettings = {
  mode: WhiteboardPreviewMode.Auto,
  coordinates: undefined,
} as const;
