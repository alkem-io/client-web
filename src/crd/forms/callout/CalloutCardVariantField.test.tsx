import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { CalloutCardVariantField } from './CalloutCardVariantField';

const copy = {
  label: 'Expanded card',
  description: "Shows the full card with the subspace's What, Why and Who - more context, more height.",
};

describe('CalloutCardVariantField', () => {
  test('off by default when expanded=false', () => {
    render(<CalloutCardVariantField expanded={false} onExpandedChange={vi.fn()} {...copy} />);
    expect(screen.getByLabelText('Expanded card')).not.toBeChecked();
    expect(screen.getByText(copy.description)).toBeInTheDocument();
  });

  test('reflects expanded=true', () => {
    render(<CalloutCardVariantField expanded={true} onExpandedChange={vi.fn()} {...copy} />);
    expect(screen.getByLabelText('Expanded card')).toBeChecked();
  });

  test('the description stays the same fixed text regardless of state', () => {
    const { rerender } = render(<CalloutCardVariantField expanded={false} onExpandedChange={vi.fn()} {...copy} />);
    expect(screen.getByText(copy.description)).toBeInTheDocument();
    rerender(<CalloutCardVariantField expanded={true} onExpandedChange={vi.fn()} {...copy} />);
    expect(screen.getByText(copy.description)).toBeInTheDocument();
  });

  test('toggling calls onExpandedChange', async () => {
    const onExpandedChange = vi.fn();
    render(<CalloutCardVariantField expanded={false} onExpandedChange={onExpandedChange} {...copy} />);
    await userEvent.click(screen.getByRole('switch'));
    expect(onExpandedChange).toHaveBeenCalledWith(true);
  });

  test('the label is associated with the switch', () => {
    render(<CalloutCardVariantField expanded={false} onExpandedChange={vi.fn()} {...copy} />);
    expect(screen.getByLabelText('Expanded card')).toHaveAttribute('role', 'switch');
  });

  test('disabled blocks the callback', async () => {
    const onExpandedChange = vi.fn();
    render(<CalloutCardVariantField expanded={false} onExpandedChange={onExpandedChange} {...copy} disabled={true} />);
    const switchEl = screen.getByRole('switch');
    expect(switchEl).toBeDisabled();
    await userEvent.click(switchEl);
    expect(onExpandedChange).not.toHaveBeenCalled();
  });
});
