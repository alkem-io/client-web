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
});
