/** @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { act, fireEvent } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import i18n from '@/core/i18n/config';
import { render, screen } from '@/main/test/testUtils';
import { MemoCollabFooter } from './MemoCollabFooter';

beforeAll(async () => {
  await i18n.changeLanguage('en');
  await i18n.loadNamespaces('crd-space');
});

afterEach(() => vi.useRealTimers());

describe('MemoCollabFooter inactivity recovery', () => {
  it('shows the inactivity reason and an explicit resume action', () => {
    vi.useFakeTimers();
    const onResumeEditing = vi.fn();
    render(
      <MemoCollabFooter
        connectionStatus="connected"
        memberCount={1}
        readonlyReason="inactivity"
        onResumeEditing={onResumeEditing}
      />
    );

    act(() => vi.advanceTimersByTime(500));

    expect(screen.getByText(/paused because you were inactive/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Resume editing' }));
    expect(onResumeEditing).toHaveBeenCalledOnce();
  });

  it('shows non-blocking recovery with one retry action', () => {
    const onRetry = vi.fn();
    render(
      <MemoCollabFooter
        connectionStatus="disconnected"
        memberCount={1}
        readonlyReason={null}
        recovering={true}
        onRetry={onRetry}
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent(/reconnecting/i);
    fireEvent.click(screen.getByRole('button', { name: /retry now/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('preserves an unconfirmed read-only edit and offers Copy', () => {
    const onCopy = vi.fn();
    render(
      <MemoCollabFooter
        connectionStatus="connected"
        memberCount={1}
        readonlyReason="noMembership"
        hasUnconfirmedChanges={true}
        onCopy={onCopy}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(/could not be confirmed/i);
    fireEvent.click(screen.getByRole('button', { name: /copy changes/i }));
    expect(onCopy).toHaveBeenCalledOnce();
  });

  it('does not offer resume for an authorization read-only reason', () => {
    vi.useFakeTimers();
    render(<MemoCollabFooter connectionStatus="connected" memberCount={1} readonlyReason="noMembership" />);

    act(() => vi.advanceTimersByTime(500));

    expect(screen.queryByRole('button', { name: 'Resume editing' })).not.toBeInTheDocument();
  });

  it('offers a fresh-generation resume for a manual size-limit end, but not a terminal end', () => {
    vi.useFakeTimers();
    const onResumeEditing = vi.fn();
    const { rerender } = render(
      <MemoCollabFooter
        connectionStatus="disconnected"
        memberCount={1}
        readonlyReason="sizeLimitExceeded"
        onResumeEditing={onResumeEditing}
      />
    );
    act(() => vi.advanceTimersByTime(500));
    fireEvent.click(screen.getByRole('button', { name: 'Resume editing' }));
    expect(onResumeEditing).toHaveBeenCalledOnce();

    rerender(
      <MemoCollabFooter
        connectionStatus="disconnected"
        memberCount={1}
        readonlyReason="sessionEnded"
        onResumeEditing={onResumeEditing}
      />
    );
    act(() => vi.advanceTimersByTime(500));
    expect(screen.queryByRole('button', { name: 'Resume editing' })).not.toBeInTheDocument();
  });
});
