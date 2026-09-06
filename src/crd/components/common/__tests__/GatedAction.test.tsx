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

  // spec FR-002 — the control must read as unavailable, not merely be announced as such
  test('applies the native disabled attribute so the control looks and behaves disabled', () => {
    render(
      <GatedAction disabledReason={REASON}>
        <button type="button">Add</button>
      </GatedAction>
    );

    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
  });

  // spec FR-004 — a disabled control leaves the tab order, so the focusable wrapper is what
  // keeps the explanation reachable by keyboard.
  test('keeps the explanation keyboard reachable via the wrapper', async () => {
    render(
      <GatedAction disabledReason={REASON}>
        <button type="button">Add</button>
      </GatedAction>
    );

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Add' })).not.toHaveFocus();
    expect(document.activeElement).toHaveAttribute('tabindex', '0');
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
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
  });
});
