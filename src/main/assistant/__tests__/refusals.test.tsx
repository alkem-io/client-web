/**
 * @vitest-environment jsdom
 *
 * T046 — the two refusals MUST read distinctly, never collapsed into one generic
 * error (assistant-access-and-budget.md §6 / §7 + Edge cases):
 *
 * - `permission_denied` → no-access / eligibility framing (the in-flight fallback
 *   for a session that lost ACCESS_VIRTUAL_ASSISTANT; entry points are already
 *   hidden by useAssistantEnabled, D2).
 * - `usage_limit_reached` → monthly-allowance framing with the reset wording.
 */
import { useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/main/test/testUtils';
import { AssistantProvider, useAssistantContext } from '../AssistantContext';
import { AssistantConversationView } from '../AssistantConversationView';
import type { AssistantErrorCode } from '../types';

vi.mock('@/domain/platform/config/useConfig', () => ({
  useConfig: () => ({ integration: { iframeAllowedUrls: [] } }),
}));

/** Seeds a turn that ends in an `error` event with the given code (empty server message → client copy). */
const RefusalDriver = ({ code }: { code: AssistantErrorCode }) => {
  const { dispatch } = useAssistantContext();
  useEffect(() => {
    dispatch({ type: 'set-conversation', conversationId: 'c1' });
    dispatch({ type: 'append-user-message', content: 'do the thing', id: 'u1' });
    dispatch({ type: 'begin-turn' });
    dispatch({ type: 'stream-event', event: { event: 'error', data: { code, message: '' } } });
  }, [dispatch, code]);
  return (
    <MemoryRouter>
      <AssistantConversationView />
    </MemoryRouter>
  );
};

afterEach(() => vi.restoreAllMocks());

describe('assistant refusal copy (T046)', () => {
  it('permission_denied reads as a no-access / eligibility refusal', async () => {
    render(
      <AssistantProvider>
        <RefusalDriver code="permission_denied" />
      </AssistantProvider>
    );
    expect(await screen.findByText(/don't have access to the assistant/i)).toBeInTheDocument();
  });

  it('usage_limit_reached reads as a monthly-allowance refusal with reset wording', async () => {
    render(
      <AssistantProvider>
        <RefusalDriver code="usage_limit_reached" />
      </AssistantProvider>
    );
    const text = await screen.findByText(/monthly assistant usage limit/i);
    expect(text).toBeInTheDocument();
    expect(text.textContent).toMatch(/resets on the 1st/i);
  });

  it('the two refusals do not share copy (not collapsed into one generic error)', () => {
    const { unmount } = render(
      <AssistantProvider>
        <RefusalDriver code="permission_denied" />
      </AssistantProvider>
    );
    const permissionCopy = screen.getAllByRole('alert')[0].textContent;
    unmount();

    render(
      <AssistantProvider>
        <RefusalDriver code="usage_limit_reached" />
      </AssistantProvider>
    );
    const usageCopy = screen.getAllByRole('alert')[0].textContent;

    expect(permissionCopy).not.toEqual(usageCopy);
  });
});
