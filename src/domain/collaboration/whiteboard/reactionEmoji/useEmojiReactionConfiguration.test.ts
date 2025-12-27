import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEmojiReactionConfiguration } from './useEmojiReactionConfiguration';
import { defaultEmojiReactionConfig } from './emojiReactionConfig';

describe('useEmojiReactionConfiguration', () => {
  it('returns the default emoji configuration', () => {
    const { result } = renderHook(() => useEmojiReactionConfiguration());

    expect(result.current).not.toBeNull();
    expect(result.current).toBe(defaultEmojiReactionConfig);
  });

  it('returns configuration with correct version', () => {
    const { result } = renderHook(() => useEmojiReactionConfiguration());

    expect(result.current?.version).toBe('1.0.0');
  });

  it('returns configuration with 10 emojis', () => {
    const { result } = renderHook(() => useEmojiReactionConfiguration());

    expect(result.current?.emojis).toHaveLength(10);
  });

  it('returns stable reference across rerenders', () => {
    const { result, rerender } = renderHook(() => useEmojiReactionConfiguration());

    const firstResult = result.current;
    rerender();
    const secondResult = result.current;

    expect(firstResult).toBe(secondResult);
  });

  it('contains all expected default emojis', () => {
    const { result } = renderHook(() => useEmojiReactionConfiguration());

    const expectedEmojis = ['👍', '⭐', '✅', '💡', '❓', '💬', '🎯', '👏', '📌', '🚀'];
    const actualEmojis = result.current?.emojis.map(e => e.emoji) ?? [];

    expect(actualEmojis).toEqual(expectedEmojis);
  });

  it('each emoji has a label for accessibility', () => {
    const { result } = renderHook(() => useEmojiReactionConfiguration());

    result.current?.emojis.forEach(entry => {
      expect(entry.label).toBeDefined();
      expect(typeof entry.label).toBe('string');
      expect(entry.label.length).toBeGreaterThan(0);
    });
  });
});
