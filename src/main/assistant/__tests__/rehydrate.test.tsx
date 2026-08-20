/**
 * @vitest-environment jsdom
 *
 * T030 — US3 history & continuity.
 *
 * - Rehydration from a mocked `GET /conversations/{id}/messages` renders the
 *   prior turns in order, including a pending `confirmation` part.
 * - Scroll-back preserves the order of turns.
 * - The pure helpers (`findPendingConfirmationId` / `isTurnInFlight`) classify
 *   the rehydrated history correctly.
 */
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@/main/test/testUtils';
import type { AssistantConversation, AssistantMessage } from '../types';

vi.mock('@/domain/platform/config/useConfig', () => ({
  useConfig: () => ({ integration: { iframeAllowedUrls: [] } }),
}));

// ── assistantApi mocks (the rehydration data source) ───────────────────────

const ROLLING_CONVERSATION: AssistantConversation = {
  id: 'c1',
  state: 'awaiting_confirmation',
  lastActiveAt: '2026-06-03T10:00:00Z',
};

const HISTORY: AssistantMessage[] = [
  { id: 'm1', role: 'user', parts: [{ type: 'text', text: 'What whiteboards do I have?' }], sequence: 1 },
  {
    id: 'm2',
    role: 'assistant',
    parts: [{ type: 'text', text: 'You have **Roadmap** and **Sprint board**.' }],
    sequence: 2,
  },
  { id: 'm3', role: 'user', parts: [{ type: 'text', text: 'Rename Sprint board to Backlog' }], sequence: 3 },
  {
    id: 'm4',
    role: 'assistant',
    parts: [
      { type: 'text', text: 'I can rename it. Please confirm:' },
      {
        type: 'confirmation',
        proposedWriteSetId: 'pws-7',
        items: [
          {
            toolName: 'update_whiteboard_content',
            kind: 'write_destructive',
            summary: 'Rename “Sprint board” → “Backlog”',
          },
        ],
      },
    ],
    sequence: 4,
  },
];

const mockResolveExisting = vi.fn();
const mockGetMessages = vi.fn();

vi.mock('../assistantApi', () => ({
  resolveExistingRollingConversation: () => mockResolveExisting(),
  getConversationMessages: (id: string) => mockGetMessages(id),
  resolveRollingConversation: () => Promise.resolve('c1'),
}));

// No turn is in flight in this fixture (awaiting_confirmation), so the stream is
// never re-opened — spy on the stream to assert that.
const mockStart = vi.fn().mockResolvedValue(undefined);
vi.mock('../useAssistantStream', () => ({
  useAssistantStream: () => ({ start: mockStart, cancel: vi.fn() }),
}));

import { AssistantProvider, useAssistantContext } from '../AssistantContext';
import { AssistantConversationView } from '../AssistantConversationView';
import { findPendingConfirmationId, isTurnInFlight, useAssistantRehydrate } from '../useAssistantRehydrate';

beforeEach(() => {
  mockResolveExisting.mockReset().mockResolvedValue(ROLLING_CONVERSATION);
  mockGetMessages.mockReset().mockResolvedValue({ conversationId: 'c1', messages: HISTORY });
  mockStart.mockClear();
});

afterEach(() => vi.restoreAllMocks());

/** Opens the panel (so rehydration runs) and renders the conversation. */
const RehydrateHarness = () => {
  const { setIsOpen } = useAssistantContext();
  useAssistantRehydrate();
  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        open
      </button>
      <MemoryRouter>
        <AssistantConversationView />
      </MemoryRouter>
    </>
  );
};

describe('useAssistantRehydrate (T030)', () => {
  it('rehydrates prior turns in order, including a pending confirmation', async () => {
    const { getByText } = render(
      <AssistantProvider>
        <RehydrateHarness />
      </AssistantProvider>
    );

    // Trigger open → rehydration runs.
    fireEvent.click(getByText('open'));

    // Prior turns render.
    await waitFor(() => expect(screen.getByText('What whiteboards do I have?')).toBeInTheDocument());
    expect(screen.getByText(/Roadmap/)).toBeInTheDocument();
    expect(screen.getByText('Rename Sprint board to Backlog')).toBeInTheDocument();

    // The pending confirmation rehydrates with its Approve/Decline control.
    expect(screen.getByText('Rename “Sprint board” → “Backlog”')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Decline' })).toBeInTheDocument();

    // awaiting_confirmation is NOT in-flight → no stream re-opened.
    expect(mockStart).not.toHaveBeenCalled();
  });

  it('preserves turn order on scroll-back', async () => {
    const { getByText, container } = render(
      <AssistantProvider>
        <RehydrateHarness />
      </AssistantProvider>
    );
    fireEvent.click(getByText('open'));

    await waitFor(() => expect(screen.getByText('What whiteboards do I have?')).toBeInTheDocument());

    const region = within(container);
    const firstUser = region.getByText('What whiteboards do I have?');
    const secondUser = region.getByText('Rename Sprint board to Backlog');
    // The first user message precedes the later one in document order.
    expect(firstUser.compareDocumentPosition(secondUser) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

describe('rehydrate helpers', () => {
  it('findPendingConfirmationId returns the proposed-write-set id from the last confirmation part', () => {
    expect(findPendingConfirmationId(HISTORY)).toBe('pws-7');
    expect(findPendingConfirmationId([HISTORY[0], HISTORY[1]])).toBeNull();
  });

  it('isTurnInFlight is false when awaiting_confirmation, true when the last message is the user’s', () => {
    expect(isTurnInFlight(HISTORY, 'awaiting_confirmation')).toBe(false);
    const userTrailing: AssistantMessage[] = [HISTORY[0], HISTORY[1], HISTORY[2]];
    expect(isTurnInFlight(userTrailing, 'active')).toBe(true);
    expect(isTurnInFlight([HISTORY[0], HISTORY[1]], 'active')).toBe(false);
  });
});
