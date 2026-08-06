import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CalloutCollaboraPreview } from './CalloutCollaboraPreview';

// react-i18next has no i18next instance configured in the unit test environment
// (see src/setupTests.ts — no i18n init), so `t('callout.documentText')` resolves
// to the raw key itself. Assertions below match the key text, matching the
// convention already used by PostCard.test.tsx (`screen.getByText(/contributors/i)`
// against the `callout.contributors` key).

describe('CalloutCollaboraPreview', () => {
  it.each([
    ['text', 'callout.documentText', 'text-blue-600'],
    ['spreadsheet', 'callout.documentSpreadsheet', 'text-green-600'],
    ['presentation', 'callout.documentPresentation', 'text-orange-600'],
  ] as const)('renders the %s badge label and applies %s to both the badge icon and the centered fallback icon', (documentType, labelKey, colorClass) => {
    const { container } = render(<CalloutCollaboraPreview documentType={documentType} onOpen={() => {}} />);

    expect(screen.getByText(labelKey)).toBeInTheDocument();

    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBe(2); // centered fallback + badge
    for (const icon of icons) {
      expect(icon.getAttribute('class')).toContain(colorClass);
    }
  });

  it("does not render an <img> when previewImageUrl is omitted (today's only reachable production state)", () => {
    const { container } = render(<CalloutCollaboraPreview documentType="text" onOpen={() => {}} />);
    expect(container.querySelector('img')).not.toBeInTheDocument();
  });

  it('calls onOpen when the "Open Document" overlay is clicked', () => {
    const onOpen = vi.fn();
    render(<CalloutCollaboraPreview documentType="text" onOpen={onOpen} />);

    fireEvent.click(screen.getByText('callout.openDocument'));

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('hides the "Replace file" action when onReplace is not provided', () => {
    render(<CalloutCollaboraPreview documentType="text" onOpen={() => {}} />);
    expect(screen.queryByText('callout.documentReplace')).not.toBeInTheDocument();
  });

  it('shows the "Replace file" action and calls onReplace when provided', () => {
    const onReplace = vi.fn();
    render(<CalloutCollaboraPreview documentType="text" onOpen={() => {}} onReplace={onReplace} />);

    const replaceButton = screen.getByText('callout.documentReplace');
    fireEvent.click(replaceButton);

    expect(onReplace).toHaveBeenCalledTimes(1);
  });

  it('renders without throwing at size="compact"', () => {
    expect(() =>
      render(<CalloutCollaboraPreview documentType="text" onOpen={() => {}} size="compact" />)
    ).not.toThrow();
  });

  it('renders without throwing at size="default"', () => {
    expect(() =>
      render(<CalloutCollaboraPreview documentType="text" onOpen={() => {}} size="default" />)
    ).not.toThrow();
  });

  describe('previewImageUrl (forward-compatible real-thumbnail seam, workspace story #9872 P3)', () => {
    it('renders the preview image in place of the centered fallback icon when previewImageUrl is present', () => {
      const { container } = render(
        <CalloutCollaboraPreview
          documentType="text"
          onOpen={() => {}}
          previewImageUrl="https://example.com/preview.png"
        />
      );

      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/preview.png');
      // alt text reuses the existing type-label key (no new i18n key, see research.md R4)
      expect(img).toHaveAttribute('alt', 'callout.documentText');

      // Only the badge icon remains — the centered fallback icon is replaced by the image.
      expect(container.querySelectorAll('svg').length).toBe(1);
    });

    it('falls back to the type-icon treatment when the preview image fails to load', () => {
      const { container } = render(
        <CalloutCollaboraPreview
          documentType="spreadsheet"
          onOpen={() => {}}
          previewImageUrl="https://example.com/broken.png"
        />
      );

      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();
      // biome-ignore lint/style/noNonNullAssertion: presence asserted immediately above
      fireEvent.error(img!);

      expect(container.querySelector('img')).not.toBeInTheDocument();
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBe(2);
      for (const icon of icons) {
        expect(icon.getAttribute('class')).toContain('text-green-600');
      }
    });
  });
});
