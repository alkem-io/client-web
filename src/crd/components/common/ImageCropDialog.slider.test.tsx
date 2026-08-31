import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { type ImageCropConfig, ImageCropDialog } from './ImageCropDialog';

// Stub i18n so `t(key, { ratio })` yields `key:ratio`, letting the tests assert
// the ratio the control announces without depending on the real copy.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { ratio?: string }) => (options?.ratio === undefined ? key : `${key}:${options.ratio}`),
  }),
}));

const bounds = { min: 6, max: 10 };

function renderDialog(config: Partial<ImageCropConfig> = {}) {
  const onAspectRatioChange = vi.fn();
  // No file: the preview needs `URL.createObjectURL`, which jsdom lacks, and
  // the slider renders independently of it.
  render(
    <ImageCropDialog
      open={true}
      file={undefined}
      config={{ aspectRatioBounds: bounds, onAspectRatioChange, ...config }}
      onSave={vi.fn()}
      onCancel={vi.fn()}
      saveLabel="Save"
      savingLabel="Saving"
      cancelLabel="Cancel"
      altTextLabel="Alt text"
      altTextPlaceholder=""
      title="Crop"
      description="Frame the image"
    />
  );
  const slider = screen.getByRole('slider') as HTMLInputElement;
  return { slider, onAspectRatioChange };
}

describe('ImageCropDialog aspect-ratio slider', () => {
  // The contract behind the `dir="rtl"` choice: the element's real value (and
  // therefore its implicit aria-valuenow) is the real ratio, and the announced
  // text agrees with it. A mirrored numeric value would expose the inverse ratio
  // to assistive technology.
  it('opens on the bounds’ max with the DOM value, aria-valuetext and label all agreeing', () => {
    const { slider } = renderDialog();
    expect(slider.value).toBe('10');
    expect(slider.min).toBe('6');
    expect(slider.max).toBe('10');
    expect(slider).toHaveAttribute('aria-valuetext', 'imageCrop.aspectRatio.ariaLabel:10.0');
    expect(screen.getByText('imageCrop.aspectRatio.label:10.0')).toBeInTheDocument();
  });

  it('reverses only the track direction, keeping min < max', () => {
    const { slider } = renderDialog();
    expect(slider).toHaveAttribute('dir', 'rtl');
    expect(Number(slider.min)).toBeLessThan(Number(slider.max));
  });

  // Browsers fill a range from `min`, which with the reversed track would be
  // the right edge; the fill is drawn from the left instead and follows the
  // thumb — no fill at max (thumb at the left edge), full fill at min.
  it('fills from the left edge up to the thumb', () => {
    const { slider } = renderDialog();
    expect(slider.style.getPropertyValue('--crd-range-fill')).toBe('0%');
    fireEvent.change(slider, { target: { value: '7.5' } });
    expect(slider.style.getPropertyValue('--crd-range-fill')).toBe('62.5%');
    fireEvent.change(slider, { target: { value: '6' } });
    expect(slider.style.getPropertyValue('--crd-range-fill')).toBe('100%');
  });

  it('emits the un-mirrored ratio and re-announces it on change', () => {
    const { slider, onAspectRatioChange } = renderDialog();
    fireEvent.change(slider, { target: { value: '7.5' } });
    expect(onAspectRatioChange).toHaveBeenCalledWith(7.5);
    expect(slider.value).toBe('7.5');
    expect(slider).toHaveAttribute('aria-valuetext', 'imageCrop.aspectRatio.ariaLabel:7.5');
  });

  it('opens on a stored ratio when one is configured', () => {
    const { slider } = renderDialog({ aspectRatio: 8 });
    expect(slider.value).toBe('8');
  });

  it('clamps a configured ratio into the bounds', () => {
    expect(renderDialog({ aspectRatio: 12 }).slider.value).toBe('10');
  });

  it('renders no slider without bounds', () => {
    render(
      <ImageCropDialog
        open={true}
        file={undefined}
        config={{ aspectRatio: 1 }}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        saveLabel="Save"
        savingLabel="Saving"
        cancelLabel="Cancel"
        altTextLabel="Alt text"
        altTextPlaceholder=""
        title="Crop"
        description="Frame the image"
      />
    );
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
  });
});
