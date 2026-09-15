import type { PixelCrop } from 'react-image-crop';
import { describe, expect, it } from 'vitest';
import { centeredAspectCrop, naturalCropSize, reshapeCropToAspect } from './ImageCropDialog';

/** A stand-in for the displayed <img>: the crop geometry only reads width/height. */
const displayedImage = (width: number, height: number) =>
  ({ width, height, naturalWidth: width, naturalHeight: height }) as HTMLImageElement;

const ratioOf = (crop: PixelCrop) => crop.width / crop.height;
const centreOf = (crop: PixelCrop) => ({ x: crop.x + crop.width / 2, y: crop.y + crop.height / 2 });

const fitsInside = (crop: PixelCrop, image: HTMLImageElement) =>
  crop.x >= -1e-9 &&
  crop.y >= -1e-9 &&
  crop.x + crop.width <= image.width + 1e-9 &&
  crop.y + crop.height <= image.height + 1e-9;

describe('centeredAspectCrop', () => {
  // The original regression: a `%` crop measures width against the box width and
  // height against the box height, so `height = width / ratio` in percent space
  // is only correct on a square image. On 800x450 it yielded 3.56 for a
  // requested 2. All geometry is in displayed pixels now, so the trap is gone.
  it.each([
    { label: 'landscape', width: 800, height: 450, ratio: 2 },
    { label: 'portrait', width: 450, height: 800, ratio: 2 },
    { label: 'square', width: 600, height: 600, ratio: 2 },
    { label: 'landscape, taller-than-wide crop', width: 800, height: 450, ratio: 0.5 },
    { label: 'portrait, wide crop', width: 450, height: 800, ratio: 3.5 },
  ])('produces the requested ratio on a $label image', ({ width, height, ratio }) => {
    expect(ratioOf(centeredAspectCrop(displayedImage(width, height), ratio))).toBeCloseTo(ratio, 5);
  });

  it.each([
    { label: 'ratio wider than the image', ratio: 4 },
    { label: 'ratio taller than the image', ratio: 0.25 },
  ])('stays inside the image when the $label', ({ ratio }) => {
    const image = displayedImage(800, 450);
    expect(fitsInside(centeredAspectCrop(image, ratio), image)).toBe(true);
  });

  it('centres the crop and fills the constraining axis', () => {
    const crop = centeredAspectCrop(displayedImage(800, 450), 4);

    // 4:1 is wider than 800x450, so width is the binding constraint.
    expect(crop.width).toBeCloseTo(800, 5);
    expect(crop.x).toBeCloseTo(0, 5);
    expect(crop.y).toBeCloseTo((450 - 200) / 2, 5);
  });
});

describe('reshapeCropToAspect', () => {
  const image = displayedImage(800, 450);
  /** A crop the user has panned off-centre and shrunk — the state worth keeping. */
  const framed: PixelCrop = { unit: 'px', x: 60, y: 30, width: 400, height: 200 };

  it('applies the requested ratio', () => {
    expect(ratioOf(reshapeCropToAspect(image, framed, 3))).toBeCloseTo(3, 5);
  });

  it('keeps the crop the user framed instead of resetting it to full size', () => {
    const reshaped = reshapeCropToAspect(image, framed, 2.5);

    expect(reshaped.width).toBeLessThan(image.width);
    expect(reshaped).not.toEqual(centeredAspectCrop(image, 2.5));
  });

  it('preserves the centre when the reshaped crop still fits', () => {
    const reshaped = reshapeCropToAspect(image, framed, 2.5);

    expect(centreOf(reshaped).x).toBeCloseTo(centreOf(framed).x, 5);
    expect(centreOf(reshaped).y).toBeCloseTo(centreOf(framed).y, 5);
  });

  // The reason size is carried as a fraction of the maximum rather than as
  // absolute pixels: clamping only ever shrinks, so literal widths would ratchet
  // the crop smaller on every out-and-back trip of the slider.
  it('is reversible — sliding the ratio away and back restores the crop', () => {
    // 0.5 is the discriminating step: at 400px wide it would need 800px of
    // height in a 450px image, so a literal-width implementation clamps here and
    // can never grow back.
    let crop = framed;
    for (const ratio of [10, 0.5, 6, 8.5, 1, 9]) crop = reshapeCropToAspect(image, crop, ratio);
    const returned = reshapeCropToAspect(image, crop, ratioOf(framed));

    expect(returned.width).toBeCloseTo(framed.width, 5);
    expect(returned.height).toBeCloseTo(framed.height, 5);
  });

  it('never leaves the image, even when the new shape must be pushed off an edge', () => {
    const atCorner: PixelCrop = { unit: 'px', x: 700, y: 400, width: 100, height: 50 };

    for (const ratio of [0.2, 1, 6, 12]) {
      expect(fitsInside(reshapeCropToAspect(image, atCorner, ratio), image)).toBe(true);
    }
  });

  it('falls back to a centred crop when there is no previous size to preserve', () => {
    const empty: PixelCrop = { unit: 'px', x: 0, y: 0, width: 0, height: 0 };

    expect(reshapeCropToAspect(image, empty, 3)).toEqual(centeredAspectCrop(image, 3));
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
