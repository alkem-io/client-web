import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CalloutCollaboraPreview } from './CalloutCollaboraPreview';

// react-i18next has no i18next instance configured in the unit test environment
// (see src/setupTests.ts — no i18n init), so `t('callout.document')` resolves
// to the raw key itself. Assertions below match the key text, matching the
// convention already used by PostCard.test.tsx (`screen.getByText(/contributors/i)`
// against the `callout.contributors` key).

describe('CalloutCollaboraPreview', () => {
  it.each([
    ['text', 'callout.document', 'text-blue-600'],
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

  describe('previewImageUrl', () => {
    it('renders the preview image with native lazy loading and an empty alt, icon still mounted underneath', () => {
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
      expect(img).toHaveAttribute('loading', 'lazy');
      // Empty alt: the badge label already names the type, and the containing
      // card/dialog carries the accessible name — no second image name.
      expect(img).toHaveAttribute('alt', '');

      // The type icon (centered fallback + badge) stays mounted regardless —
      // it is what stays visible until the image's load event fires.
      expect(container.querySelectorAll('svg').length).toBe(2);
    });

    it('keeps the image hidden (icon showing through) until it actually loads, then reveals it', () => {
      const { container } = render(
        <CalloutCollaboraPreview
          documentType="text"
          onOpen={() => {}}
          previewImageUrl="https://example.com/preview.png"
        />
      );

      // biome-ignore lint/style/noNonNullAssertion: presence asserted by the previous test
      const img = container.querySelector('img')!;
      expect(img.className).toContain('invisible');

      fireEvent.load(img);

      expect(img.className).not.toContain('invisible');
    });

    it('falls back to the type-icon treatment (image unmounted) when the preview image fails to load', () => {
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

    it('renders a replacement preview image, hidden again until it loads, after a prior URL failed', () => {
      const { container, rerender } = render(
        <CalloutCollaboraPreview
          documentType="spreadsheet"
          onOpen={() => {}}
          previewImageUrl="https://example.com/broken.png"
        />
      );

      const brokenImg = container.querySelector('img');
      expect(brokenImg).toBeInTheDocument();
      // biome-ignore lint/style/noNonNullAssertion: presence asserted immediately above
      fireEvent.error(brokenImg!);
      expect(container.querySelector('img')).not.toBeInTheDocument();

      rerender(
        <CalloutCollaboraPreview
          documentType="spreadsheet"
          onOpen={() => {}}
          previewImageUrl="https://example.com/replacement.png"
        />
      );

      const replacementImg = container.querySelector('img');
      expect(replacementImg).toBeInTheDocument();
      expect(replacementImg).toHaveAttribute('src', 'https://example.com/replacement.png');
      expect(replacementImg?.className).toContain('invisible');
    });

    it('leaves the "Open Document" interaction usable while a preview image is present', () => {
      const onOpen = vi.fn();
      render(
        <CalloutCollaboraPreview
          documentType="text"
          onOpen={onOpen}
          previewImageUrl="https://example.com/preview.png"
        />
      );

      fireEvent.click(screen.getByText('callout.openDocument'));

      expect(onOpen).toHaveBeenCalledTimes(1);
    });
  });
});
