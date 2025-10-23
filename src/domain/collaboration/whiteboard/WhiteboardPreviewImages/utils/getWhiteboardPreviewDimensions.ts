import { PreviewImageDimensions } from '../WhiteboardPreviewImages';

type ExcalidrawDimensions = {
  width: number;
  height: number;
  scale?: number;
};

/**
 * @deprecated ? //!!
 * @param params The Alkemio Visual expected dimensions
 * @returns Returns a function that will be called by Excalidraw API when
 * exporting a Whiteboard to an image
 */
const getWhiteboardPreviewDimensions =
  (params: PreviewImageDimensions | undefined) =>
  (contentWidth: number, contentHeight: number): ExcalidrawDimensions => {
    if (!params) {
      return {
        width: contentWidth,
        height: contentHeight,
      };
    }

    // deriving dimensions from visual, but not bigger than the whiteboard content
    let height = Math.min(params.maxHeight, contentHeight);
    let width = Math.min(params.maxWidth, contentWidth);

    // ensuring the whole content fits
    const scaleV = height / contentHeight;
    const scaleH = width / contentWidth;
    const scale = Math.max(scaleV, scaleH);

    // removing blank paddings
    if (scaleH > scale) {
      width = height * (contentWidth / contentHeight);
    }
    if (scaleV > scale) {
      height = width * (contentHeight / contentWidth);
    }

    // ensuring at least minWidth, minHeight
    height = Math.max(height, params.minHeight);
    width = Math.max(width, params.minWidth);

    return {
      height,
      width,
      scale,
    };
  };

export default getWhiteboardPreviewDimensions;
