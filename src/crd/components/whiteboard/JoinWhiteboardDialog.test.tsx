import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { handleAppBack } from '@/core/appMode/appBack';
import { JoinWhiteboardDialog } from './JoinWhiteboardDialog';

const renderGate = () =>
  render(
    <JoinWhiteboardDialog
      open={true}
      value=""
      onChange={() => {}}
      onBlur={() => {}}
      onSubmit={() => {}}
      onSignIn={() => {}}
    />
  );

describe('JoinWhiteboardDialog as a no-exit gate', () => {
  it('marks itself as a pass-through gate for the app Back button', () => {
    renderGate();
    expect(document.querySelector('[data-app-back="pass"]')).toBe(screen.getByRole('dialog'));
  });

  it('lets the app Back button pass through to history and stays open', () => {
    renderGate();
    let consumed = true;
    act(() => {
      consumed = handleAppBack();
    });
    expect(consumed).toBe(false);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('still refuses a real Escape', () => {
    renderGate();
    act(() => {
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
