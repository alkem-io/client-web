import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CalloutMemoPreview } from './CalloutMemoPreview';
import { CalloutWhiteboardPreview } from './CalloutWhiteboardPreview';

// react-i18next has no i18next instance configured in the unit test environment
// (see src/setupTests.ts), so `t('callout.openMemo')` resolves to the raw key —
// the same convention CalloutCollaboraPreview.test.tsx uses.

describe('CalloutMemoPreview', () => {
  // Inside the callout detail dialog the memo framing preview used to be the only
  // content-driven framing: the whiteboard and the document previews there are
  // both 16:9. A memo now gets the same box, with its markdown flexing to fill
  // the room above the footer bar.
  it('sizes the preview like the whiteboard preview in the same dialog', () => {
    const { container } = render(<CalloutMemoPreview content="body" onOpen={() => {}} />);
    const { container: whiteboardContainer } = render(<CalloutWhiteboardPreview onOpen={() => {}} />);

    const box = container.firstElementChild;
    expect(whiteboardContainer.firstElementChild).toHaveClass('aspect-video');
    expect(box).toHaveClass('aspect-video');
    // Column flow is what lets the markdown body take the leftover height above
    // the footer instead of the box growing past 16:9.
    expect(box).toHaveClass('flex', 'flex-col');
  });

  it('lets the markdown body fill the box height instead of capping it at a fixed height', () => {
    const { container } = render(<CalloutMemoPreview content="body" onOpen={() => {}} />);

    // CroppedMarkdown renders its own div, carrying the crop height as an inline
    // style and the bottom mask that fades the clipped text.
    const cropped = container.querySelector<HTMLElement>('[style*="mask-image"]');
    expect(cropped).not.toBeNull();
    expect(cropped?.style.maxHeight).toBe('100%');
    // biome-ignore lint/style/noNonNullAssertion: presence asserted immediately above
    expect(cropped!.parentElement).toHaveClass('flex-1', 'min-h-0');
  });

  it('keeps the footer-bar open affordance (not an overlay) and calls onOpen', () => {
    const onOpen = vi.fn();
    const { container } = render(<CalloutMemoPreview content="body" onOpen={onOpen} />);

    const label = screen.getByText('callout.openMemo');
    // The label sits in the bordered footer bar, as it does today — not in an
    // absolutely-positioned overlay over the content.
    expect(label.parentElement).toHaveClass('border-t');
    expect(container.querySelector('.absolute')).toBeNull();

    fireEvent.click(label);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
