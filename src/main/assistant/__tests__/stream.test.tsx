import { useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@/main/test/testUtils';
import { AssistantProvider, useAssistantContext } from '../AssistantContext';
import { AssistantConversationView } from '../AssistantConversationView';
import type { AssistantStreamEvent } from '../types';
import { streamAssistant } from '../useAssistantStream';
import { encodeSseFrames, mockSseResponse } from './sseTestUtils';

vi.mock('@/domain/platform/config/useConfig', () => ({
  useConfig: () => ({ integration: { iframeAllowedUrls: [] } }),
}));

const STREAM: AssistantStreamEvent[] = [
  {
    event: 'tool-activity',
    data: { toolActionId: 'a1', toolName: 'search_content', label: 'Searching whiteboards…', status: 'started' },
    id: '1',
  },
  { event: 'token', data: { text: 'Hello' }, id: '2' },
  { event: 'token', data: { text: ', world' }, id: '3' },
  {
    event: 'tool-activity',
    data: { toolActionId: 'a1', toolName: 'search_content', label: 'Searching whiteboards…', status: 'finished' },
    id: '4',
  },
  { event: 'done', data: { messageId: 'm1' }, id: '5' },
];

afterEach(() => {
  vi.restoreAllMocks();
});

describe('assistant SSE transport', () => {
  it('parses token + tool-activity frames across chunk boundaries, tolerating :keepalive comments', async () => {
    const payload = encodeSseFrames(STREAM, { keepalive: true });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockSseResponse(payload, { chunkSize: 5 }));

    const received: AssistantStreamEvent[] = [];
    await streamAssistant(
      { path: '/conversations/c1/messages', body: { content: 'hi' }, signal: new AbortController().signal },
      { onEvent: event => received.push(event) }
    );

    expect(received.map(e => e.event)).toEqual(['tool-activity', 'token', 'token', 'tool-activity', 'done']);
    const tokens = received.filter(e => e.event === 'token');
    expect(tokens).toHaveLength(2);
    expect(received[received.length - 1].id).toBe('5');
  });
});

/** Drives the reducer from a mocked stream, then renders the conversation view. */
const StreamDriver = ({ events }: { events: AssistantStreamEvent[] }) => {
  const { dispatch } = useAssistantContext();
  useEffect(() => {
    dispatch({ type: 'append-user-message', content: 'find whiteboards', id: 'u1' });
    dispatch({ type: 'begin-turn' });
    for (const event of events) {
      dispatch({ type: 'stream-event', event });
    }
  }, [dispatch, events]);
  return (
    <MemoryRouter>
      <AssistantConversationView />
    </MemoryRouter>
  );
};

describe('assistant streamed rendering (T015)', () => {
  it('renders streamed tokens as text and a human-readable tool-activity indication', async () => {
    render(
      <AssistantProvider>
        <StreamDriver events={STREAM} />
      </AssistantProvider>
    );

    // Streamed tokens accumulate into a single text part rendered as markdown.
    await waitFor(() => expect(screen.getByText('Hello, world')).toBeInTheDocument());

    // The tool-activity indication is visible (FR-004).
    expect(screen.getByText('Searching whiteboards…')).toBeInTheDocument();
  });
});
