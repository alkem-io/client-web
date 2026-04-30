import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { AddPostModal } from './AddPostModal';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const baseProps = {
  open: true,
  onOpenChange: vi.fn(),
  mode: 'create' as const,
  title: { value: 'My Callout', onChange: vi.fn() },
  onSubmit: vi.fn(),
};

describe('AddPostModal — FR-73 aria-busy during submission', () => {
  test('Publish button renders aria-busy + disabled while submitting', () => {
    render(<AddPostModal {...baseProps} submitting={true} />);
    const publish = screen.getByRole('button', { name: /forms.publish/i });
    expect(publish).toHaveAttribute('aria-busy', 'true');
    expect(publish).toBeDisabled();
  });

  test('Save Draft button renders aria-busy + disabled while submitting', () => {
    const onSaveDraft = vi.fn();
    render(<AddPostModal {...baseProps} submitting={true} onSaveDraft={onSaveDraft} />);
    const draft = screen.getByRole('button', { name: /forms.saveDraft/i });
    expect(draft).toHaveAttribute('aria-busy', 'true');
    expect(draft).toBeDisabled();
  });

  test('edit-mode Save button renders aria-busy + disabled while submitting', () => {
    render(<AddPostModal {...baseProps} mode="edit" submitting={true} />);
    const save = screen.getByRole('button', { name: /forms.save/i });
    expect(save).toHaveAttribute('aria-busy', 'true');
    expect(save).toBeDisabled();
  });

  test('title input is disabled while submitting', () => {
    render(<AddPostModal {...baseProps} submitting={true} />);
    const input = screen.getByLabelText(/forms.titleLabel/i);
    expect(input).toBeDisabled();
  });

  test('Find Template button is disabled while submitting', () => {
    render(<AddPostModal {...baseProps} submitting={true} onFindTemplate={vi.fn()} />);
    const find = screen.getByRole('button', { name: /forms.findTemplate/i });
    expect(find).toBeDisabled();
  });

  test('buttons are enabled and not aria-busy when not submitting', () => {
    render(<AddPostModal {...baseProps} submitting={false} />);
    const publish = screen.getByRole('button', { name: /forms.publish/i });
    expect(publish).not.toHaveAttribute('aria-busy', 'true');
    expect(publish).not.toBeDisabled();
  });

  test('Publish is disabled while canSubmit is false (empty title)', () => {
    render(<AddPostModal {...baseProps} canSubmit={false} title={{ value: '', onChange: vi.fn() }} />);
    const publish = screen.getByRole('button', { name: /forms.publish/i });
    expect(publish).toBeDisabled();
  });
});

describe('AddPostModal — FR-133 validation error region', () => {
  test('title error message has aria-live="polite"', () => {
    render(<AddPostModal {...baseProps} title={{ value: '', onChange: vi.fn(), error: 'validation.titleRequired' }} />);
    const err = screen.getByText(/validation.titleRequired/i);
    expect(err).toHaveAttribute('aria-live', 'polite');
  });

  test('title input has aria-invalid when an error is present', () => {
    render(<AddPostModal {...baseProps} title={{ value: '', onChange: vi.fn(), error: 'validation.titleRequired' }} />);
    const input = screen.getByLabelText(/forms.titleLabel/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'add-post-title-error');
  });
});

describe('AddPostModal — FR-134 icon-only close button', () => {
  test('header close (X) button has an accessible label', () => {
    render(<AddPostModal {...baseProps} />);
    const close = screen.getByRole('button', { name: /contribution.close/i });
    expect(close).toBeInTheDocument();
  });
});

describe('AddPostModal — FR-72 notify-members slot', () => {
  test('renders the notify switch slot when provided in create mode', () => {
    render(<AddPostModal {...baseProps} notifySwitchSlot={<div data-testid="notify-slot">notify</div>} />);
    expect(screen.getByTestId('notify-slot')).toBeInTheDocument();
  });

  test('does not render notify slot in edit mode (slot is not rendered in the footer)', () => {
    render(<AddPostModal {...baseProps} mode="edit" notifySwitchSlot={<div data-testid="notify-slot">notify</div>} />);
    expect(screen.queryByTestId('notify-slot')).not.toBeInTheDocument();
  });

  test('does not render notify slot when the consumer passes null (empty title in create)', () => {
    render(<AddPostModal {...baseProps} notifySwitchSlot={null} />);
    expect(screen.queryByTestId('notify-slot')).not.toBeInTheDocument();
  });
});
