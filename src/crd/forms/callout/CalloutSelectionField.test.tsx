import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { CalloutSelectionField } from './CalloutSelectionField';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('CalloutSelectionField', () => {
  test('renders in auto mode by default with auto description copy', () => {
    render(<CalloutSelectionField mode="auto" onModeChange={vi.fn()} />);

    expect(screen.getByLabelText('forms.selection.label')).not.toBeChecked();
    expect(screen.getByText('forms.selection.autoDescription')).toBeInTheDocument();
    expect(screen.queryByText('forms.selection.customDescription')).not.toBeInTheDocument();
  });

  test('shows custom description copy when mode is custom', () => {
    render(<CalloutSelectionField mode="custom" onModeChange={vi.fn()} />);

    expect(screen.getByLabelText('forms.selection.label')).toBeChecked();
    expect(screen.getByText('forms.selection.customDescription')).toBeInTheDocument();
    expect(screen.queryByText('forms.selection.autoDescription')).not.toBeInTheDocument();
  });

  test('calls onModeChange with "custom" when switch is toggled on', async () => {
    const onModeChange = vi.fn();
    render(<CalloutSelectionField mode="auto" onModeChange={onModeChange} />);

    await userEvent.click(screen.getByRole('switch'));
    expect(onModeChange).toHaveBeenCalledWith('custom');
  });

  test('calls onModeChange with "auto" when switch is toggled off', async () => {
    const onModeChange = vi.fn();
    render(<CalloutSelectionField mode="custom" onModeChange={onModeChange} />);

    await userEvent.click(screen.getByRole('switch'));
    expect(onModeChange).toHaveBeenCalledWith('auto');
  });

  test('pickerSlot is rendered only when mode is custom', () => {
    const { rerender } = render(
      <CalloutSelectionField mode="auto" onModeChange={vi.fn()} pickerSlot={<div>picker-content</div>} />
    );

    // auto mode: picker hidden
    expect(screen.queryByText('picker-content')).not.toBeInTheDocument();

    rerender(<CalloutSelectionField mode="custom" onModeChange={vi.fn()} pickerSlot={<div>picker-content</div>} />);

    // custom mode: picker visible
    expect(screen.getByText('picker-content')).toBeInTheDocument();
  });

  test('switch is disabled when disabled=true', () => {
    render(<CalloutSelectionField mode="auto" onModeChange={vi.fn()} disabled={true} />);
    expect(screen.getByRole('switch')).toBeDisabled();
  });
});
