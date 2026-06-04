/**
 * @vitest-environment jsdom
 *
 * T026 — US2 confirmation UI.
 *
 * - The consolidated itemized write proposal renders (one row per write).
 * - Declining posts exactly one decision and triggers no further write stream.
 * - Approving posts exactly once to the confirmations endpoint.
 * - A re-proposal (`confirmation-request` with a new id) replaces the stale item.
 */
import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@/main/test/testUtils';
import { AssistantProvider, useAssistantContext } from '../AssistantContext';
import { AssistantConversationView } from '../AssistantConversationView';
import type { AssistantStreamEvent } from '../types';
import { encodeSseFrames, mockSseResponse } from './sseTestUtils';

vi.mock('@/domain/platform/config/useConfig', () => ({
  useConfig: () => ({ integration: { iframeAllowedUrls: [] } }),
}));

const CONFIRMATION_EVENT: AssistantStreamEvent = {
  event: 'confirmation-request',
  data: {
    proposedWriteSetId: 'pws-1',
    items: [
      { toolName: 'create_whiteboard', kind: 'write_additive', summary: 'Create a whiteboard “Roadmap”' },
      {
        toolName: 'update_whiteboard_content',
        kind: 'write_destructive',
        summary: 'Replace the contents of “Sprint board”',
        targetRef: { entityId: 'wb-9', updatedDate: '2026-06-01T00:00:00Z' },
      },
    ],
  },
  id: '10',
};

/** Seeds a conversation + an in-flight turn carrying a pending confirmation. */
const ConfirmationDriver = ({ events }: { events: AssistantStreamEvent[] }) => {
  const { dispatch } = useAssistantContext();
  useEffect(() => {
    dispatch({ type: 'set-conversation', conversationId: 'c1' });
    dispatch({ type: 'append-user-message', content: 'rename my whiteboards', id: 'u1' });
    dispatch({ type: 'begin-turn' });
    for (const event of events) {
      dispatch({ type: 'stream-event', event });
    }
  }, [dispatch, events]);
  return <AssistantConversationView />;
};

beforeEach(() => {
  // Default: the decision POST resumes the stream and ends with `done`.
  const payload = encodeSseFrames([{ event: 'done', data: { messageId: 'm-after' }, id: '20' }], { keepalive: false });
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockSseResponse(payload, { chunkSize: 64 }));
});

afterEach(() => vi.restoreAllMocks());

describe('AssistantConfirmation (T026)', () => {
  it('renders the consolidated itemized write proposal', async () => {
    render(
      <AssistantProvider>
        <ConfirmationDriver events={[CONFIRMATION_EVENT]} />
      </AssistantProvider>
    );

    expect(await screen.findByText('Create a whiteboard “Roadmap”')).toBeInTheDocument();
    expect(screen.getByText('Replace the contents of “Sprint board”')).toBeInTheDocument();
    // A single Approve / Decline control covers the whole set (FR-015).
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Decline' })).toBeInTheDocument();
  });

  it('approve posts exactly once to the confirmations endpoint', async () => {
    render(
      <AssistantProvider>
        <ConfirmationDriver events={[CONFIRMATION_EVENT]} />
      </AssistantProvider>
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Approve' }));

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(1));
    const [url, init] = (globalThis.fetch as unknown as { mock: { calls: [string, RequestInit][] } }).mock.calls[0];
    expect(url).toContain('/conversations/c1/confirmations/pws-1');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ decision: 'approve' });
    // Cookie auth only — no Authorization header (FR-007/SC-006).
    expect(init.credentials).toBe('include');
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it('decline posts exactly once with the decline decision and no extra write stream', async () => {
    render(
      <AssistantProvider>
        <ConfirmationDriver events={[CONFIRMATION_EVENT]} />
      </AssistantProvider>
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Decline' }));

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(1));
    const [, init] = (globalThis.fetch as unknown as { mock: { calls: [string, RequestInit][] } }).mock.calls[0];
    expect(JSON.parse(init.body as string)).toEqual({ decision: 'decline' });
    // No second POST — declining ends the turn with no executed writes.
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('a re-proposal replaces the stale confirmation item (only the fresh set shows)', async () => {
    const reProposal: AssistantStreamEvent = {
      event: 'confirmation-request',
      data: {
        proposedWriteSetId: 'pws-2',
        items: [
          {
            toolName: 'update_whiteboard_content',
            kind: 'write_destructive',
            summary: 'Replace the contents of “Sprint board” (updated — please re-confirm)',
          },
        ],
      },
      id: '11',
    };

    render(
      <AssistantProvider>
        <ConfirmationDriver events={[CONFIRMATION_EVENT, reProposal]} />
      </AssistantProvider>
    );

    // The fresh proposal is shown…
    expect(await screen.findByText(/please re-confirm/)).toBeInTheDocument();
    // …and the stale items are gone (replaced, not appended).
    expect(screen.queryByText('Create a whiteboard “Roadmap”')).not.toBeInTheDocument();
    expect(screen.queryByText('Replace the contents of “Sprint board”')).not.toBeInTheDocument();
  });
});
