import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { GatedAction } from '../GatedAction';

const REASON = 'You do not have permission to change members of this role.';

describe('GatedAction', () => {
  test('renders the child untouched when no reason is given', () => {
    const onClick = vi.fn();
    render(
      <GatedAction>
        <button type="button" onClick={onClick}>
          Add
        </button>
      </GatedAction>
    );

    const button = screen.getByRole('button', { name: 'Add' });
    expect(button).not.toHaveAttribute('aria-disabled');
    expect(screen.queryByText(REASON)).not.toBeInTheDocument();
  });

  test('passes activation through when not gated', async () => {
    const onClick = vi.fn();
    render(
      <GatedAction>
        <button type="button" onClick={onClick}>
          Add
        </button>
      </GatedAction>
    );

    await userEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('marks the control aria-disabled when gated', () => {
    render(
      <GatedAction disabledReason={REASON}>
        <button type="button">Add</button>
      </GatedAction>
    );

    expect(screen.getByRole('button', { name: 'Add' })).toHaveAttribute('aria-disabled', 'true');
  });

  // spec FR-002 vs FR-004 — the native `disabled` attribute would leave the tab order,
  // making a focus tooltip impossible. It must never be applied.
  test('never applies the native disabled attribute', () => {
    render(
      <GatedAction disabledReason={REASON}>
        <button type="button">Add</button>
      </GatedAction>
    );

    const button = screen.getByRole('button', { name: 'Add' });
    expect(button).not.toBeDisabled();
    expect(button).not.toHaveAttribute('disabled');
  });

  test('keeps the gated control keyboard focusable', async () => {
    render(
      <GatedAction disabledReason={REASON}>
        <button type="button">Add</button>
      </GatedAction>
    );

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Add' })).toHaveFocus();
  });

  test('shows the reason on hover', async () => {
    render(
      <GatedAction disabledReason={REASON}>
        <button type="button">Add</button>
      </GatedAction>
    );

    await userEvent.hover(screen.getByRole('button', { name: 'Add' }));
    expect(await screen.findAllByText(REASON)).not.toHaveLength(0);
  });

  test('shows the reason on keyboard focus', async () => {
    render(
      <GatedAction disabledReason={REASON}>
        <button type="button">Add</button>
      </GatedAction>
    );

    await userEvent.tab();
    expect(await screen.findAllByText(REASON)).not.toHaveLength(0);
  });

  // spec SC-007 — a gated control dispatches no mutation
  test('suppresses click activation when gated', async () => {
    const onClick = vi.fn();
    render(
      <GatedAction disabledReason={REASON}>
        <button type="button" onClick={onClick}>
          Add
        </button>
      </GatedAction>
    );

    await userEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  test('suppresses keyboard activation when gated', async () => {
    const onClick = vi.fn();
    render(
      <GatedAction disabledReason={REASON}>
        <button type="button" onClick={onClick}>
          Add
        </button>
      </GatedAction>
    );

    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onClick).not.toHaveBeenCalled();
  });
});
