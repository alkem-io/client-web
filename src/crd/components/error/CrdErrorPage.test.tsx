import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { CrdErrorPage } from './CrdErrorPage';

const baseProps = {
  title: 'Oops!',
  description: 'Something went wrong.',
  reloadLabel: 'Reload',
  onReload: vi.fn(),
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('CrdErrorPage', () => {
  test('renders the title and description', () => {
    render(<CrdErrorPage {...baseProps} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Oops!');
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
  });

  test('renders the reload button and calls onReload on click', () => {
    const onReload = vi.fn();
    render(<CrdErrorPage {...baseProps} onReload={onReload} />);

    screen.getByRole('button', { name: 'Reload' }).click();

    expect(onReload).toHaveBeenCalledTimes(1);
  });

  test('renders the optional code line when provided', () => {
    render(<CrdErrorPage {...baseProps} code="Error code: 500" />);

    expect(screen.getByText('Error code: 500')).toBeInTheDocument();
  });

  test('renders the optional contact slot when provided', () => {
    render(<CrdErrorPage {...baseProps} contactSlot={<a href="mailto:support">contact support</a>} />);

    expect(screen.getByRole('link', { name: 'contact support' })).toBeInTheDocument();
  });

  test('renders details (stack) when provided', () => {
    render(<CrdErrorPage {...baseProps} details="at foo (bar.ts:1:1)" />);

    expect(screen.getByText('at foo (bar.ts:1:1)')).toBeInTheDocument();
  });

  test('omits code, contact slot and details when not provided', () => {
    render(<CrdErrorPage {...baseProps} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    // Only the reload button is present.
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});
