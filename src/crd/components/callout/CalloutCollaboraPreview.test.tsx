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
});
