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
  (contentWidth: number, contentHeight: number): Dimensions => {
    if (!params) {
      return {
        width: contentWidth,
        height: contentHeight,
      };
    }

    const { minScale = 0 } = params;

    // deriving dimensions from visual, but not bigger than the canvas content
    let height = Math.min(params.maxHeight, contentHeight);
    let width = Math.min(params.maxWidth, contentWidth);

    // ensuring the whole content fits
    const scaleV = height / contentHeight;
    const scaleH = width / contentWidth;
    const scale = Math.max(Math.min(scaleV, scaleH), minScale);

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

export default getCanvasBannerCardDimensions;
