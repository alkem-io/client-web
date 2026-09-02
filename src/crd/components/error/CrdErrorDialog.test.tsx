import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { CrdErrorDialog } from './CrdErrorDialog';

const baseProps = {
  open: true,
  onOpenChange: vi.fn(),
  title: 'Something went wrong',
  message: 'Network error occurred.',
  reloadLabel: 'Reload',
  onReload: vi.fn(),
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('CrdErrorDialog', () => {
  test('renders the title and message when open', () => {
    render(<CrdErrorDialog {...baseProps} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Network error occurred.')).toBeInTheDocument();
  });

  test('renders the reload button and calls onReload on click', () => {
    const onReload = vi.fn();
    render(<CrdErrorDialog {...baseProps} onReload={onReload} />);

    screen.getByRole('button', { name: 'Reload' }).click();

    expect(onReload).toHaveBeenCalledTimes(1);
  });

  test('renders nothing when closed', () => {
    render(<CrdErrorDialog {...baseProps} open={false} />);

    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });
});
