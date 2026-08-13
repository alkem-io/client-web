import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { ConversationDraftsProvider, useConversationDrafts } from './ConversationDraftsContext';
import { MESSAGING_DRAFTS_STORAGE_KEY, readMessagingDrafts } from './messagingDrafts';

vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: { id: 'user-1' } }),
}));

vi.mock('@/core/analytics/apm/context/useApm', () => ({
  useApm: () => undefined,
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <ConversationDraftsProvider>{children}</ConversationDraftsProvider>
);

const renderDrafts = () => renderHook(() => useConversationDrafts(), { wrapper });

describe('ConversationDraftsProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('hydrates the current user’s drafts and ignores everyone else’s', () => {
    localStorage.setItem(
      MESSAGING_DRAFTS_STORAGE_KEY,
      JSON.stringify({ 'user-1': { 'conv-1': 'restored' }, 'user-2': { 'conv-1': 'not mine' } })
    );

    const { result } = renderDrafts();

    expect(result.current.getDraft('conv-1')).toBe('restored');
    expect(result.current.drafts).toEqual({ 'conv-1': 'restored' });
  });

  test('persists typing after the debounce, not before', () => {
    const { result } = renderDrafts();

    act(() => result.current.setDraft('conv-1', 'half a thought'));
    expect(result.current.getDraft('conv-1')).toBe('half a thought');
    expect(localStorage.getItem(MESSAGING_DRAFTS_STORAGE_KEY)).toBeNull();

    act(() => vi.advanceTimersByTime(500));
    expect(readMessagingDrafts()).toEqual({ 'user-1': { 'conv-1': 'half a thought' } });
  });

  test('keeps drafts separate per conversation', () => {
    const { result } = renderDrafts();

    act(() => result.current.setDraft('conv-1', 'for Ada'));
    act(() => result.current.setDraft('conv-2', 'for Grace'));
    act(() => vi.advanceTimersByTime(500));

    expect(result.current.getDraft('conv-1')).toBe('for Ada');
    expect(result.current.getDraft('conv-2')).toBe('for Grace');
    expect(readMessagingDrafts()).toEqual({ 'user-1': { 'conv-1': 'for Ada', 'conv-2': 'for Grace' } });
  });

  test('a whitespace-only composer drops the draft', () => {
    const { result } = renderDrafts();

    act(() => result.current.setDraft('conv-1', 'typed'));
    act(() => vi.advanceTimersByTime(500));
    act(() => result.current.setDraft('conv-1', '   '));
    act(() => vi.advanceTimersByTime(500));

    expect(result.current.getDraft('conv-1')).toBe('');
    expect(readMessagingDrafts()).toEqual({});
  });

  test('clearDraft persists immediately so a pending keystroke cannot resurrect it', () => {
    const { result } = renderDrafts();

    act(() => result.current.setDraft('conv-1', 'sent text'));
    act(() => result.current.clearDraft('conv-1'));

    expect(result.current.getDraft('conv-1')).toBe('');
    expect(readMessagingDrafts()).toEqual({});

    act(() => vi.advanceTimersByTime(500));
    expect(readMessagingDrafts()).toEqual({});
  });

  test('another user’s drafts survive a write', () => {
    localStorage.setItem(MESSAGING_DRAFTS_STORAGE_KEY, JSON.stringify({ 'user-2': { 'conv-9': 'theirs' } }));

    const { result } = renderDrafts();
    act(() => result.current.setDraft('conv-1', 'mine'));
    act(() => vi.advanceTimersByTime(500));

    expect(readMessagingDrafts()).toEqual({ 'user-1': { 'conv-1': 'mine' }, 'user-2': { 'conv-9': 'theirs' } });
  });

  test('flushes a pending draft when the page is hidden', () => {
    const { result } = renderDrafts();

    act(() => result.current.setDraft('conv-1', 'about to navigate away'));
    act(() => {
      window.dispatchEvent(new Event('pagehide'));
    });

    expect(readMessagingDrafts()).toEqual({ 'user-1': { 'conv-1': 'about to navigate away' } });
  });
});
