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

  it('renders type icon when no previewUrl is provided', () => {
    const { container } = render(<ContributionDocumentCard title="Doc" documentType="text" />);

    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders an image when previewUrl is provided', () => {
    render(<ContributionDocumentCard title="Doc" documentType="text" previewUrl="https://example.com/preview.png" />);

    const img = screen.getByRole('img', { name: 'Doc' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/preview.png');
  });

  it('falls back to the type icon when the preview image fails to load', () => {
    const { container } = render(
      <ContributionDocumentCard title="Doc" documentType="spreadsheet" previewUrl="https://example.com/broken.png" />
    );

    // Image is rendered initially
    const img = screen.getByRole('img', { name: 'Doc' });
    expect(img).toBeInTheDocument();

    // Simulate image load error
    fireEvent.error(img);

    // After error, the icon should render and the image should be gone
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
