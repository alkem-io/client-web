import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { CalloutSelectionField } from './CalloutSelectionField';

// The field is pure-CRD and props-driven: the consumer supplies the (contextual)
// label + descriptions, so the tests assert on the passed copy directly.
const copy = {
  label: 'Manual selection',
  autoDescription: 'auto-copy',
  customDescription: 'custom-copy',
};

describe('CalloutSelectionField', () => {
  test('renders in auto mode by default with auto description copy', () => {
    render(<CalloutSelectionField mode="auto" onModeChange={vi.fn()} {...copy} />);

    expect(screen.getByLabelText('Manual selection')).not.toBeChecked();
    expect(screen.getByText('auto-copy')).toBeInTheDocument();
    expect(screen.queryByText('custom-copy')).not.toBeInTheDocument();
  });

  test('shows custom description copy when mode is custom', () => {
    render(<CalloutSelectionField mode="custom" onModeChange={vi.fn()} {...copy} />);

    expect(screen.getByLabelText('Manual selection')).toBeChecked();
    expect(screen.getByText('custom-copy')).toBeInTheDocument();
    expect(screen.queryByText('auto-copy')).not.toBeInTheDocument();
  });

  test('calls onModeChange with "custom" when switch is toggled on', async () => {
    const onModeChange = vi.fn();
    render(<CalloutSelectionField mode="auto" onModeChange={onModeChange} {...copy} />);

    await userEvent.click(screen.getByRole('switch'));
    expect(onModeChange).toHaveBeenCalledWith('custom');
  });

  test('calls onModeChange with "auto" when switch is toggled off', async () => {
    const onModeChange = vi.fn();
    render(<CalloutSelectionField mode="custom" onModeChange={onModeChange} {...copy} />);

    await userEvent.click(screen.getByRole('switch'));
    expect(onModeChange).toHaveBeenCalledWith('auto');
  });

  test('pickerSlot is rendered only when mode is custom', () => {
    const { rerender } = render(
      <CalloutSelectionField mode="auto" onModeChange={vi.fn()} {...copy} pickerSlot={<div>picker-content</div>} />
    );

    // auto mode: picker hidden
    expect(screen.queryByText('picker-content')).not.toBeInTheDocument();

    rerender(
      <CalloutSelectionField mode="custom" onModeChange={vi.fn()} {...copy} pickerSlot={<div>picker-content</div>} />
    );

    // custom mode: picker visible
    expect(screen.getByText('picker-content')).toBeInTheDocument();
  });

  test('switch is disabled when disabled=true', () => {
    render(<CalloutSelectionField mode="auto" onModeChange={vi.fn()} {...copy} disabled={true} />);
    expect(screen.getByRole('switch')).toBeDisabled();
  });
});
