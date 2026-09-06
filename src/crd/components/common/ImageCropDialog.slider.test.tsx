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
  // The DOM value is deliberately the mirror image of the ratio (see
  // `mirrorAspectRatio`): the input stays ascending/LTR so the browser keeps
  // its native left-anchored fill, so the announced 10 sits at DOM value 6.
  // `aria-valuetext` — which assistive tech announces in preference to the
  // numeric value — carries the real ratio.
  it('opens announcing the 10:1 default, mirrored to the DOM minimum', () => {
    const { slider } = renderDialog();
    expect(slider.value).toBe('6');
    expect(slider.min).toBe('6');
    expect(slider.max).toBe('10');
    expect(slider).toHaveAttribute('aria-valuetext', 'imageCrop.aspectRatio.ariaLabel:10.0');
    expect(screen.getByText('imageCrop.aspectRatio.label:10.0')).toBeInTheDocument();
  });

  it('stays a native ascending input — no dir reversal, no custom fill class', () => {
    const { slider } = renderDialog();
    expect(slider).not.toHaveAttribute('dir');
    expect(slider.className).toContain('accent-primary');
    expect(Number(slider.min)).toBeLessThan(Number(slider.max));
  });

  it('emits the un-mirrored ratio and re-announces it on change', () => {
    const { slider, onAspectRatioChange } = renderDialog();
    fireEvent.change(slider, { target: { value: '8.5' } });
    expect(onAspectRatioChange).toHaveBeenCalledWith(7.5);
    expect(slider.value).toBe('8.5');
    expect(slider).toHaveAttribute('aria-valuetext', 'imageCrop.aspectRatio.ariaLabel:7.5');
  });

  it('opens on a stored ratio when one is configured, mirrored into the DOM', () => {
    const { slider } = renderDialog({ aspectRatio: 7 });
    expect(slider.value).toBe('9');
    expect(slider).toHaveAttribute('aria-valuetext', 'imageCrop.aspectRatio.ariaLabel:7.0');
  });

  it('clamps a configured ratio into the bounds', () => {
    expect(renderDialog({ aspectRatio: 12 }).slider.value).toBe('6');
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
