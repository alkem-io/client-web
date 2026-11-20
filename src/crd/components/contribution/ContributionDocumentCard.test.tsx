import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ContributionDocumentCard } from './ContributionDocumentCard';

describe('ContributionDocumentCard', () => {
  it.each([
    ['text', 'text-blue-600'],
    ['spreadsheet', 'text-green-600'],
    ['presentation', 'text-orange-600'],
  ] as const)('applies %s to the type icon', (documentType, colorClass) => {
    const { container } = render(<ContributionDocumentCard title="Doc" documentType={documentType} />);

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon?.getAttribute('class')).toContain(colorClass);
  });

  it('renders the title and author', () => {
    render(<ContributionDocumentCard title="Test Alkemio2" documentType="text" author="admin alkemio" />);
    expect(screen.getByText('Test Alkemio2')).toBeInTheDocument();
    expect(screen.getByText('admin alkemio')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<ContributionDocumentCard title="Doc" documentType="text" onClick={onClick} />);

    fireEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not render an <img> when previewUrl is omitted', () => {
    const { container } = render(<ContributionDocumentCard title="Doc" documentType="text" />);
    expect(container.querySelector('img')).not.toBeInTheDocument();
  });

  describe('previewUrl', () => {
    it('renders a lazily-loaded, empty-alt image while keeping the type icon mounted', () => {
      const { container } = render(
        <ContributionDocumentCard title="Doc" documentType="text" previewUrl="https://example.com/preview.png" />
      );

      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/preview.png');
      expect(img).toHaveAttribute('loading', 'lazy');
      expect(img).toHaveAttribute('alt', '');
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('keeps the image hidden until it loads, then reveals it', () => {
      const { container } = render(
        <ContributionDocumentCard title="Doc" documentType="text" previewUrl="https://example.com/preview.png" />
      );

      // biome-ignore lint/style/noNonNullAssertion: presence asserted by the previous test
      const img = container.querySelector('img')!;
      expect(img.className).toContain('invisible');

      fireEvent.load(img);

      expect(img.className).not.toContain('invisible');
    });

    it('falls back to the type icon (image unmounted) when the preview image fails to load', () => {
      const { container } = render(
        <ContributionDocumentCard title="Doc" documentType="text" previewUrl="https://example.com/broken.png" />
      );

      const img = container.querySelector('img');
      // biome-ignore lint/style/noNonNullAssertion: presence asserted immediately above
      fireEvent.error(img!);

      expect(container.querySelector('img')).not.toBeInTheDocument();
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('leaves the click interaction usable while a preview image is present', () => {
      const onClick = vi.fn();
      render(
        <ContributionDocumentCard
          title="Doc"
          documentType="text"
          previewUrl="https://example.com/preview.png"
          onClick={onClick}
        />
      );

      fireEvent.click(screen.getByRole('button'));

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});
