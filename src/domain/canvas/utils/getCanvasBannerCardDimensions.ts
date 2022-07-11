interface BannerCardParams {
  maxWidth: number;
  maxHeight: number;
  minWidth: number;
  minHeight: number;
  minScale?: number;
}

interface Dimensions {
  width: number;
  height: number;
  scale?: number;
}

const getCanvasBannerCardDimensions =
  (params: BannerCardParams | undefined) =>
  (canvasWidth: number, canvasHeight: number): Dimensions => {
    if (!params) {
      return {
        width: canvasWidth,
        height: canvasHeight,
      };
    }

    const { minScale = 0 } = params;

    // deriving dimensions from visual, but not bigger than the canvas content
    let height = Math.min(params.maxHeight, canvasHeight);
    let width = Math.min(params.maxWidth, canvasWidth);

    // ensuring the whole content fits
    const scaleV = height / canvasHeight;
    const scaleH = width / canvasWidth;
    const scale = Math.max(Math.min(scaleV, scaleH), minScale);

    // removing blank paddings
    if (scaleH > scale) {
      width = height * (canvasWidth / canvasHeight);
    }
    if (scaleV > scale) {
      height = width * (canvasHeight / canvasWidth);
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

export default getCanvasBannerCardDimensions;
