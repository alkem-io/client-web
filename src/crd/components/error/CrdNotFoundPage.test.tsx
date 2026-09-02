import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { CrdNotFoundPage } from './CrdNotFoundPage';

const baseProps = {
  title: 'Page not found',
  description: 'The page does not exist.',
  goHomeLabel: 'Go to Home',
  goBackLabel: 'Go back',
  onGoHome: vi.fn(),
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('CrdNotFoundPage', () => {
  test('renders the title and description', () => {
    render(<CrdNotFoundPage {...baseProps} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Page not found');
    expect(screen.getByText('The page does not exist.')).toBeInTheDocument();
  });

  test('renders the "go home" button and calls onGoHome on click', () => {
    const onGoHome = vi.fn();
    render(<CrdNotFoundPage {...baseProps} onGoHome={onGoHome} />);

    const goHome = screen.getByRole('button', { name: 'Go to Home' });
    goHome.click();

    expect(onGoHome).toHaveBeenCalledTimes(1);
  });

  test('hides "go back" when showGoBack is falsy', () => {
    render(<CrdNotFoundPage {...baseProps} onGoBack={vi.fn()} showGoBack={false} />);

    expect(screen.queryByRole('button', { name: 'Go back' })).not.toBeInTheDocument();
  });

  test('hides "go back" when onGoBack is undefined even if showGoBack is true', () => {
    render(<CrdNotFoundPage {...baseProps} showGoBack={true} />);

    expect(screen.queryByRole('button', { name: 'Go back' })).not.toBeInTheDocument();
  });

  test('shows "go back" and calls onGoBack when showGoBack is true and onGoBack provided', () => {
    const onGoBack = vi.fn();
    render(<CrdNotFoundPage {...baseProps} onGoBack={onGoBack} showGoBack={true} />);

    const goBack = screen.getByRole('button', { name: 'Go back' });
    goBack.click();

    expect(onGoBack).toHaveBeenCalledTimes(1);
  });

  test('renders the optional search slot when provided', () => {
    render(<CrdNotFoundPage {...baseProps} search={<div data-testid="search-slot">search</div>} />);

    expect(screen.getByTestId('search-slot')).toBeInTheDocument();
  });

  test('omits the search slot when not provided', () => {
    render(<CrdNotFoundPage {...baseProps} />);

    expect(screen.queryByTestId('search-slot')).not.toBeInTheDocument();
  });
});
