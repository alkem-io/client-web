import { WhiteboardPreviewCoordinates, WhiteboardPreviewMode } from '@/core/apollo/generated/graphql-schema';

export interface WhiteboardPreviewSettings {
  mode: WhiteboardPreviewMode;
  coords?: {
    x: WhiteboardPreviewCoordinates['x'];
    y: WhiteboardPreviewCoordinates['y'];
    width: WhiteboardPreviewCoordinates['width'];
    height: WhiteboardPreviewCoordinates['height'];
  };
}