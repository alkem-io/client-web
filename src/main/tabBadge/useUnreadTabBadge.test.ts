import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockCount = vi.fn<() => number>();
vi.mock('@/main/userMessaging/useUnreadConversationsCount', () => ({
  useUnreadConversationsCount: () => mockCount(),
}));

import { setBaseTitle, setTitlePrefix } from '@/core/routing/documentTitle';
import { useUnreadTabBadge } from './useUnreadTabBadge';

describe('useUnreadTabBadge', () => {
  beforeEach(() => {
    setTitlePrefix('');
    setBaseTitle('Alkemio');
    document.head.innerHTML = '<link rel="icon" sizes="32x32" type="image/png" href="/favicon-32x32.png" />';
    mockCount.mockReturnValue(0);
  });

  afterEach(() => {
    setTitlePrefix('');
    vi.clearAllMocks();
  });

  it('sets the (N) title prefix when there are unread conversations', () => {
    mockCount.mockReturnValue(3);
    renderHook(() => useUnreadTabBadge());
    expect(document.title).toBe('(3) Alkemio');
  });

  it('shows no prefix at zero unread', () => {
    mockCount.mockReturnValue(0);
    renderHook(() => useUnreadTabBadge());
    expect(document.title).toBe('Alkemio');
  });

  it('clears the prefix and restores the original favicon href when the count returns to 0', () => {
    mockCount.mockReturnValue(2);
    const { rerender } = renderHook(() => useUnreadTabBadge());
    expect(document.title).toBe('(2) Alkemio');

    mockCount.mockReturnValue(0);
    rerender();
    expect(document.title).toBe('Alkemio');

    const link = document.querySelector('link[rel="icon"][sizes="32x32"]');
    expect(link?.getAttribute('href')).toBe('/favicon-32x32.png');
  });
});
