import { convertToPixelCrop } from 'react-image-crop';
import { describe, expect, it } from 'vitest';
import { centeredAspectCrop, naturalCropSize } from './ImageCropDialog';

/** A stand-in for the displayed <img>: the crop geometry only reads width/height. */
const displayedImage = (width: number, height: number) =>
  ({ width, height, naturalWidth: width, naturalHeight: height }) as HTMLImageElement;

/** The crop as react-image-crop will resolve it against the displayed box. */
const pixels = (image: HTMLImageElement, ratio: number) =>
  convertToPixelCrop(centeredAspectCrop(image, ratio), image.width, image.height);

describe('centeredAspectCrop', () => {
  // The regression: a `%` crop measures width against the box width and height
  // against the box height, so `height = width / ratio` in percent space is only
  // correct on a square image. On 800x450 it used to yield 3.56 for a requested 2.
  it.each([
    { label: 'landscape', width: 800, height: 450, ratio: 2 },
    { label: 'portrait', width: 450, height: 800, ratio: 2 },
    { label: 'square', width: 600, height: 600, ratio: 2 },
    { label: 'landscape, taller-than-wide crop', width: 800, height: 450, ratio: 0.5 },
    { label: 'portrait, wide crop', width: 450, height: 800, ratio: 3.5 },
  ])('produces the requested ratio on a $label image', ({ width, height, ratio }) => {
    const crop = pixels(displayedImage(width, height), ratio);
    expect(crop.width / crop.height).toBeCloseTo(ratio, 5);
  });

  it.each([
    { label: 'ratio wider than the image', width: 800, height: 450, ratio: 4 },
    { label: 'ratio taller than the image', width: 800, height: 450, ratio: 0.25 },
  ])('stays inside the image when the $label', ({ width, height, ratio }) => {
    const image = displayedImage(width, height);
    const crop = pixels(image, ratio);

    expect(crop.x).toBeGreaterThanOrEqual(0);
    expect(crop.y).toBeGreaterThanOrEqual(0);
    expect(crop.x + crop.width).toBeLessThanOrEqual(width + 1e-9);
    expect(crop.y + crop.height).toBeLessThanOrEqual(height + 1e-9);
  });

  it('centres the crop and fills the constraining axis', () => {
    const image = displayedImage(800, 450);
    const crop = pixels(image, 4);

    // 4:1 is wider than 800x450, so width is the binding constraint.
    expect(crop.width).toBeCloseTo(800, 5);
    expect(crop.x).toBeCloseTo(0, 5);
    expect(crop.y).toBeCloseTo((450 - 200) / 2, 5);
  });

  // Anti-ratchet: the crop is always the maximum the ratio allows, so dragging
  // the slider around and back restores exactly the crop you started from
  // rather than leaving it progressively shrunken.
  it.each([0.25, 0.5, 1, 1.5, 2, 3.5, 4])('always fills the constraining axis at ratio %s', ratio => {
    const image = displayedImage(800, 450);
    const crop = pixels(image, ratio);

    const fillsWidth = Math.abs(crop.width - 800) < 1e-9;
    const fillsHeight = Math.abs(crop.height - 450) < 1e-9;
    expect(fillsWidth || fillsHeight).toBe(true);
  });
});

describe('naturalCropSize', () => {
  it('scales the displayed crop back up to natural pixels', () => {
    const image = { width: 400, height: 225, naturalWidth: 1600, naturalHeight: 900 } as HTMLImageElement;

    expect(naturalCropSize(image, { unit: 'px', x: 0, y: 0, width: 200, height: 100 })).toEqual({
      width: 800,
      height: 400,
    });
  });

  it('returns undefined before an image or crop exists', () => {
    expect(naturalCropSize(null, { unit: 'px', x: 0, y: 0, width: 10, height: 10 })).toBeUndefined();
    expect(naturalCropSize(displayedImage(100, 100), undefined)).toBeUndefined();
  });
});
