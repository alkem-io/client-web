import { describe, expect, it } from 'vitest';
import { displayCropToNatural, isCropWithinImage, naturalCropToDisplay } from './cropCoordinates';

// 1200x675 source rendered at 600x337.5 (half size) inside the crop dialog.
const img = { width: 600, height: 337.5, naturalWidth: 1200, naturalHeight: 675 };
const aspectRatio = 16 / 9;

describe('cropCoordinates', () => {
  it('scales a display crop up to natural pixels at scale=1', () => {
    const display = { x: 100, y: 50, width: 320, height: 180 };
    expect(displayCropToNatural(display, img, 1, { x: 0, y: 0 })).toEqual({
      x: 200,
      y: 100,
      width: 640,
      height: 360,
    });
  });

  it('round-trips display -> natural -> display at scale=1', () => {
    const display = { x: 100, y: 50, width: 320, height: 180 };
    const natural = displayCropToNatural(display, img, 1, { x: 0, y: 0 });
    expect(naturalCropToDisplay(natural, img, 1, { x: 0, y: 0 })).toEqual(display);
  });

  it('round-trips with zoom and pan applied', () => {
    const display = { x: 120, y: 40, width: 240, height: 135 };
    const scale = 2;
    const pan = { x: 30, y: -20 };
    const natural = displayCropToNatural(display, img, scale, pan);
    const back = naturalCropToDisplay(natural, img, scale, pan);
    expect(back.x).toBeCloseTo(display.x, 6);
    expect(back.y).toBeCloseTo(display.y, 6);
    expect(back.width).toBeCloseTo(display.width, 6);
    expect(back.height).toBeCloseTo(display.height, 6);
  });

  it('validates bounds and aspect ratio', () => {
    expect(isCropWithinImage({ x: 0, y: 0, width: 600, height: 337.5 }, aspectRatio, img)).toBe(true);
    // Out of bounds
    expect(isCropWithinImage({ x: 500, y: 0, width: 200, height: 112.5 }, aspectRatio, img)).toBe(false);
    // Wrong aspect ratio
    expect(isCropWithinImage({ x: 0, y: 0, width: 300, height: 300 }, aspectRatio, img)).toBe(false);
    expect(isCropWithinImage(undefined, aspectRatio, img)).toBe(false);
  });

  it('accepts edge-aligned crops with sub-pixel float drift', () => {
    // A full-frame crop that round-trips through scale/pan math can come back fractionally outside
    // the bounds — these must still validate rather than reset to the default crop on reopen.
    expect(isCropWithinImage({ x: -1e-10, y: -1e-10, width: 600, height: 337.5 }, aspectRatio, img)).toBe(true);
    expect(isCropWithinImage({ x: 0, y: 0, width: 600 + 1e-9, height: 337.5 + 1e-9 }, aspectRatio, img)).toBe(true);
  });
});
