/**
 * @vitest-environment jsdom
 *
 * "New conversation" action (FR-011 — single rolling thread, no switcher).
 *
 * Scope: this is a CLIENT-unit test. It proves the panel (a) creates a fresh
 * conversation, (b) cancels any in-flight turn, and (c) targets the freshly
 * created id (c2) on the next send while bypassing resolveRollingConversation
 * (which would otherwise return the old newest, c1). The end-to-end routing
 * guarantee — that the server resolves the user's rolling conversation as the
 * newest-by-lastActiveAt and so lands the turn in the just-created one — is a
 * backend property (get_or_create_rolling), exercised server-side, not here.
 *
 * - Clicking New conversation creates a fresh conversation and sets its id active.
 * - Any in-flight turn is cancelled first.
 * - The next message targets the NEW id (POST /conversations/c2/...), not c1.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@/main/test/testUtils';

vi.mock('@/domain/platform/config/useConfig', () => ({
  useConfig: () => ({ integration: { iframeAllowedUrls: [] } }),
}));

// assistantApi: a fresh conversation is c2; the existing newest rolling one is c1.
const mockCreate = vi.fn();
const mockResolveRolling = vi.fn();
vi.mock('../assistantApi', () => ({
  createConversation: () => mockCreate(),
  resolveRollingConversation: () => mockResolveRolling(),
}));

// Stream: capture the request passed to start so we can assert which conversation
// the next turn targets; cancel is a spy so we can assert the in-flight abort.
const mockStart = vi.fn().mockResolvedValue(undefined);
const mockCancel = vi.fn();
vi.mock('../useAssistantStream', () => ({
  useAssistantStream: () => ({ start: mockStart, cancel: mockCancel }),
}));

import { AssistantProvider } from '../AssistantContext';
import { useAssistantConversation } from '../useAssistantConversation';

beforeEach(() => {
  mockCreate.mockReset().mockResolvedValue({ id: 'c2', createdAt: '2026-06-04T00:00:00Z' });
  mockResolveRolling.mockReset().mockResolvedValue('c1');
  mockStart.mockClear();
  mockCancel.mockClear();
});

afterEach(() => vi.restoreAllMocks());

/** Exposes the New-conversation + send actions as buttons, like the real panel. */
const Harness = () => {
  const { startNewConversation, sendMessage } = useAssistantConversation();
  return (
    <>
      <button type="button" onClick={() => void startNewConversation()}>
        new
      </button>
      <button type="button" onClick={() => void sendMessage('hello again')}>
        send
      </button>
    </>
  );
};

const startRequestPath = (call: number): string => (mockStart.mock.calls[call][0] as { path: string }).path;

describe('startNewConversation', () => {
  it('creates a new conversation, cancels any in-flight turn, and routes the next turn to the NEW id', async () => {
    render(
      <AssistantProvider>
        <Harness />
      </AssistantProvider>
    );

    fireEvent.click(screen.getByText('new'));

    // A fresh conversation was created exactly once; the old rolling one was NOT
    // re-resolved.
    await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1));
    expect(mockResolveRolling).not.toHaveBeenCalled();
    // Any in-flight stream is aborted on switch.
    expect(mockCancel).toHaveBeenCalled();

    // The next message targets the NEW conversation (c2), not the old rolling one
    // (c1) — i.e. set-conversation stuck and resolveRollingConversation was bypassed.
    fireEvent.click(screen.getByText('send'));
    await waitFor(() => expect(mockStart).toHaveBeenCalled());
    expect(startRequestPath(0)).toBe('/conversations/c2/messages');
    expect(mockResolveRolling).not.toHaveBeenCalled();
  });
});
