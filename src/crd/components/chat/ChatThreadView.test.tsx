import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { ChatMessage, ChatThreadHeader } from './types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/crd/primitives/avatar');

const { ChatThreadView } = await import('./ChatThreadView');

const NOW = new Date(2026, 9, 14, 15, 0);
const at = (day: number, hours: number, minutes: number) => new Date(2026, 9, day, hours, minutes).getTime();

const alice = { id: 'alice', name: 'Alice Smith' };
const bob = { id: 'bob', name: 'Bob Jones' };

let seq = 0;
const msg = (timestampMs: number, overrides: Partial<ChatMessage> = {}): ChatMessage => {
  seq += 1;
  return {
    id: `m${seq}`,
    author: alice,
    content: `message ${seq}`,
    timestampMs,
    reactions: [],
    isOwn: false,
    ...overrides,
  };
};

const group: ChatThreadHeader = { id: 'c1', displayName: 'Group', isGroup: true, isGuidance: false };
const direct: ChatThreadHeader = { id: 'c2', displayName: 'Alice', isGroup: false, isGuidance: false };

const renderThread = (messages: ChatMessage[], conversation: ChatThreadHeader = direct) =>
  render(
    <ChatThreadView
      conversation={conversation}
      messages={messages}
      messagesLoading={false}
      locale="en-GB"
      canReact={true}
      onAddReaction={vi.fn()}
    />
  );

// Visible text of an element, leaving out screen-reader-only and aria-hidden parts.
const rowFor = (content: string) => screen.getByText(content).closest('[data-chat-message]') as HTMLElement;

// jsdom has no PointerEvent, so `pointerType` would never reach the handler.
class TestPointerEvent extends MouseEvent {
  pointerType: string;
  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerType = init.pointerType ?? '';
  }
}

beforeEach(() => {
  vi.stubGlobal('PointerEvent', TestPointerEvent);
  seq = 0;
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('ChatThreadView — date separators and times', () => {
  test('each day opens with a separator carrying the time its conversation started', () => {
    renderThread([msg(at(13, 16, 5)), msg(at(13, 16, 7)), msg(at(14, 9, 12)), msg(at(14, 9, 14))]);
    const separators = screen.getAllByTestId('chat-day-separator').map(el => el.textContent);
    expect(separators).toEqual(['Yesterday 16:05', 'Today 09:12']);
  });

  test('older days carry the date, and the year only outside the current year', () => {
    renderThread([msg(new Date(2025, 9, 6, 10, 0).getTime()), msg(at(5, 10, 0))]);
    const separators = screen.getAllByTestId('chat-day-separator').map(el => el.textContent);
    expect(separators).toEqual(['Monday, 6 October 2025 10:00', 'Monday 5 October 10:00']);
  });

  test('after an hour without messages a small time marks where the conversation continues', () => {
    renderThread([msg(at(14, 9, 0)), msg(at(14, 9, 30)), msg(at(14, 10, 45))]);
    expect(screen.getAllByTestId('chat-pause-time').map(el => el.textContent)).toEqual(['10:45']);
  });

  test('no time is shown under individual messages', () => {
    renderThread([msg(at(14, 9, 0)), msg(at(14, 9, 1), { isOwn: true, author: undefined })]);
    // The only visible times are the day separator; everything else is screen-reader text.
    const visibleTimes = screen
      .queryAllByText(/\d\d:\d\d/)
      .filter(el => !el.classList.contains('sr-only') && el.getAttribute('aria-hidden') !== 'true');
    expect(visibleTimes.map(el => el.textContent)).toEqual(['Today 09:00']);
  });

  test('every message keeps its exact time for screen readers', () => {
    renderThread([msg(at(14, 9, 12)), msg(at(14, 9, 13))]);
    expect(within(rowFor('message 1')).getByText('Today, 09:12')).toHaveClass('sr-only');
    expect(within(rowFor('message 2')).getByText('Today, 09:13')).toHaveClass('sr-only');
  });

  test('a message without a time (Guidance intro) gets no separator and no time', () => {
    renderThread([msg(0, { content: 'intro' }), msg(at(14, 9, 0))]);
    expect(within(rowFor('intro')).queryByText(/\d\d:\d\d/)).not.toBeInTheDocument();
    expect(screen.getAllByTestId('chat-day-separator').map(el => el.textContent)).toEqual(['Today 09:00']);
  });
});

describe('ChatThreadView — exact time on demand', () => {
  test('keyboard focus on a message shows its exact time in a tooltip', async () => {
    renderThread([msg(at(14, 9, 12))]);
    const row = rowFor('message 1');
    expect(row).toHaveAttribute('tabIndex', '0');
    await act(async () => {
      row.focus();
    });
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Today, 09:12');
  });

  test('tapping a message opens its time underneath and shows the reaction trigger; tapping again closes', () => {
    renderThread([msg(at(14, 9, 12))]);
    const row = rowFor('message 1');
    const trigger = () => within(row).getByRole('button', { name: 'thread.addReaction' });
    const revealedTime = () => row.querySelector('[data-testid="chat-revealed-time"]');

    expect(revealedTime()).toBeNull();
    expect(trigger()).toHaveClass('[@media(hover:none)]:hidden');

    fireEvent.pointerUp(row, { pointerType: 'touch' });
    expect(revealedTime()).toHaveTextContent('Today, 09:12');
    expect(trigger()).not.toHaveClass('[@media(hover:none)]:hidden');

    fireEvent.pointerUp(row, { pointerType: 'touch' });
    expect(revealedTime()).toBeNull();
  });

  test('a mouse click does not toggle the time (hover covers it)', () => {
    renderThread([msg(at(14, 9, 12))]);
    const row = rowFor('message 1');
    fireEvent.pointerUp(row, { pointerType: 'mouse' });
    expect(row.querySelector('[data-testid="chat-revealed-time"]')).toBeNull();
  });

  test('a tap inside the emoji picker, which is portalled out of the message, keeps the message revealed', () => {
    renderThread([msg(at(14, 9, 12))]);
    const row = rowFor('message 1');
    fireEvent.pointerUp(row, { pointerType: 'touch' });
    fireEvent.click(within(row).getByRole('button', { name: 'thread.addReaction' }));
    const picker = screen.getByRole('dialog');
    expect(row).not.toContainElement(picker);

    fireEvent.pointerUp(picker, { pointerType: 'touch' });
    expect(row.querySelector('[data-testid="chat-revealed-time"]')).toHaveTextContent('Today, 09:12');
  });

  test("a tap on the message's own buttons does not toggle the time", () => {
    renderThread([msg(at(14, 9, 12), { reactions: [{ emoji: '👍', count: 1, hasReacted: false }] })]);
    const row = rowFor('message 1');
    fireEvent.pointerUp(within(row).getByRole('button', { name: /^👍/ }), { pointerType: 'touch' });
    expect(row.querySelector('[data-testid="chat-revealed-time"]')).toBeNull();
  });
});

describe('ChatThreadView — grouping', () => {
  test('in a group chat the name shows once per group, again after a gap over 5 minutes', () => {
    renderThread(
      [msg(at(14, 9, 0)), msg(at(14, 9, 3)), msg(at(14, 9, 10)), msg(at(14, 9, 11), { author: bob })],
      group
    );
    const visibleNames = screen
      .queryAllByText(/Alice Smith|Bob Jones/)
      .filter(el => !el.classList.contains('sr-only'))
      .map(el => el.textContent);
    expect(visibleNames).toEqual(['Alice Smith', 'Alice Smith', 'Bob Jones']);
  });

  test('1:1 chats show no names', () => {
    renderThread([msg(at(14, 9, 0)), msg(at(14, 9, 30))], direct);
    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
  });

  test('bubbles of one group get the group position corners', () => {
    renderThread([msg(at(14, 9, 0)), msg(at(14, 9, 1)), msg(at(14, 9, 2))]);
    const bubble = (content: string) => rowFor(content).querySelector('.rounded-2xl');
    expect(bubble('message 2')).toHaveClass('rounded-tl-sm', 'rounded-bl-sm');
    expect(bubble('message 3')).toHaveClass('rounded-tl-sm');
    expect(bubble('message 3')).not.toHaveClass('rounded-bl-sm');
  });
});
