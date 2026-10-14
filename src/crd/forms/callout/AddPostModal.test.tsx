import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  test('Publish stays operable (not aria-disabled) but describes the blocked reason while blocked by a missing title (empty title)', () => {
    render(<AddPostModal {...baseProps} blockedReason="titleRequired" title={{ value: '', onChange: vi.fn() }} />);
    const publish = screen.getByRole('button', { name: /forms.publish/i });
    // The button is only visually dimmed — it must NOT announce as disabled to
    // assistive tech, because clicking still runs the consumer's validation.
    expect(publish).not.toHaveAttribute('aria-disabled');
    expect(publish).not.toBeDisabled();
    // Instead, the reason is exposed non-destructively via aria-describedby.
    const describedBy = publish.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy as string)).toHaveTextContent('forms.titleRequiredHint');
  });

  test('Publish still calls onSubmit while blocked by a missing title, so the consumer can surface the title error', async () => {
    const onSubmit = vi.fn();
    render(
      <AddPostModal
        {...baseProps}
        onSubmit={onSubmit}
        blockedReason="titleRequired"
        title={{ value: '', onChange: vi.fn() }}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: /forms.publish/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  test('Save Draft still calls onSaveDraft while blocked by a missing title', async () => {
    const onSaveDraft = vi.fn();
    render(
      <AddPostModal
        {...baseProps}
        onSaveDraft={onSaveDraft}
        blockedReason="titleRequired"
        title={{ value: '', onChange: vi.fn() }}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: /forms.saveDraft/i }));
    expect(onSaveDraft).toHaveBeenCalledTimes(1);
  });
});

describe('AddPostModal — blocked by an over-long description', () => {
  test('every footer action describes the description-too-long reason', () => {
    render(<AddPostModal {...baseProps} onSaveDraft={vi.fn()} blockedReason="descriptionTooLong" />);
    for (const name of [/forms.publish/i, /forms.saveDraft/i]) {
      const button = screen.getByRole('button', { name });
      expect(button).not.toHaveAttribute('aria-disabled');
      const describedBy = button.getAttribute('aria-describedby');
      expect(document.getElementById(describedBy as string)).toHaveTextContent('forms.descriptionTooLongHint');
    }
  });

  test('edit-mode Save describes the description-too-long reason', () => {
    render(<AddPostModal {...baseProps} mode="edit" blockedReason="descriptionTooLong" />);
    const save = screen.getByRole('button', { name: /^forms.save$/i });
    const describedBy = save.getAttribute('aria-describedby');
    expect(document.getElementById(describedBy as string)).toHaveTextContent('forms.descriptionTooLongHint');
  });

  test('hovering the blocked Publish button shows the reason in a tooltip', async () => {
    render(<AddPostModal {...baseProps} blockedReason="descriptionTooLong" />);
    await userEvent.hover(screen.getByRole('button', { name: /forms.publish/i }));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('forms.descriptionTooLongHint');
  });

  test('clicking still runs the consumer action so its validation can surface the error', async () => {
    const onSubmit = vi.fn();
    render(<AddPostModal {...baseProps} onSubmit={onSubmit} blockedReason="descriptionTooLong" />);
    await userEvent.click(screen.getByRole('button', { name: /forms.publish/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  test('no blocked hint is rendered when nothing blocks the form', () => {
    render(<AddPostModal {...baseProps} />);
    expect(screen.getByRole('button', { name: /forms.publish/i })).not.toHaveAttribute('aria-describedby');
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

describe('AddPostModal — title character counter', () => {
  const titleProps = (value: string) => ({
    value,
    onChange: vi.fn(),
    maxLength: 128,
    counterThreshold: 120,
  });

  test('counter is hidden below the threshold', () => {
    render(<AddPostModal {...baseProps} title={titleProps('a'.repeat(119))} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  test('counter appears at the threshold and reports the current length', () => {
    render(<AddPostModal {...baseProps} title={titleProps('a'.repeat(120))} />);
    expect(screen.getByRole('status')).toHaveTextContent('forms.titleCharacterCount');
  });

  test('counter is not rendered when maxLength is omitted', () => {
    render(<AddPostModal {...baseProps} title={{ value: 'a'.repeat(200), onChange: vi.fn() }} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  test('exceeding maxLength marks the input invalid without a submit', () => {
    render(<AddPostModal {...baseProps} title={titleProps('a'.repeat(129))} />);
    expect(screen.getByLabelText(/forms.titleLabel/i)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText(/validation.maxSmall/i)).toBeInTheDocument();
  });

  test('at exactly maxLength the input is still valid', () => {
    render(<AddPostModal {...baseProps} title={titleProps('a'.repeat(128))} />);
    expect(screen.getByLabelText(/forms.titleLabel/i)).toHaveAttribute('aria-invalid', 'false');
  });

  test('a consumer submit-time error wins over the live length message', () => {
    render(<AddPostModal {...baseProps} title={{ ...titleProps('a'.repeat(129)), error: 'validation.required' }} />);
    expect(screen.getByText(/validation.required/i)).toBeInTheDocument();
    expect(screen.queryByText(/validation.maxSmall/i)).not.toBeInTheDocument();
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
