import { describe, it, expect } from 'vitest';
import { createEmojiReactionElement, createEmojiReactionElements } from './createEmojiReactionElement';
import { DEFAULT_EMOJI_REACTION_FONT_SIZE } from './types';

describe('createEmojiReactionElement', () => {
  it('generates valid text element skeleton with required properties', () => {
    const result = createEmojiReactionElement({
      emoji: '👍',
      x: 100,
      y: 200,
    });

    expect(result).toEqual({
      type: 'text',
      text: '👍',
      x: 100,
      y: 200,
      fontSize: DEFAULT_EMOJI_REACTION_FONT_SIZE,
    });
  });

  it('uses default font size when not specified', () => {
    const result = createEmojiReactionElement({
      emoji: '⭐',
      x: 50,
      y: 75,
    });

    expect(result.fontSize).toBe(DEFAULT_EMOJI_REACTION_FONT_SIZE);
    expect(result.fontSize).toBe(48);
  });

  it('applies custom font size when provided', () => {
    const result = createEmojiReactionElement({
      emoji: '🎯',
      x: 0,
      y: 0,
      fontSize: 72,
    });

    expect(result.fontSize).toBe(72);
  });

  it('handles negative coordinates', () => {
    const result = createEmojiReactionElement({
      emoji: '🚀',
      x: -100,
      y: -50,
    });

    expect(result.x).toBe(-100);
    expect(result.y).toBe(-50);
  });

  it('handles decimal coordinates', () => {
    const result = createEmojiReactionElement({
      emoji: '💡',
      x: 123.456,
      y: 789.012,
    });

    expect(result.x).toBe(123.456);
    expect(result.y).toBe(789.012);
  });

  it('preserves emoji character exactly', () => {
    const emojis = ['👍', '⭐', '✅', '💡', '❓', '💬', '🎯', '👏', '📌', '🚀'];

    emojis.forEach(emoji => {
      const result = createEmojiReactionElement({ emoji, x: 0, y: 0 });
      expect(result.text).toBe(emoji);
    });
  });

  it('always sets type to text', () => {
    const result = createEmojiReactionElement({
      emoji: '✅',
      x: 0,
      y: 0,
    });

    expect(result.type).toBe('text');
  });
});

describe('createEmojiReactionElements', () => {
  it('creates multiple elements from options array', () => {
    const options = [
      { emoji: '👍', x: 0, y: 0 },
      { emoji: '⭐', x: 100, y: 100 },
      { emoji: '🎯', x: 200, y: 200 },
    ];

    const results = createEmojiReactionElements(options);

    expect(results).toHaveLength(3);
    expect(results[0].text).toBe('👍');
    expect(results[1].text).toBe('⭐');
    expect(results[2].text).toBe('🎯');
  });

  it('returns empty array for empty input', () => {
    const results = createEmojiReactionElements([]);
    expect(results).toEqual([]);
  });

  it('applies individual font sizes correctly', () => {
    const options = [
      { emoji: '👍', x: 0, y: 0, fontSize: 24 },
      { emoji: '⭐', x: 100, y: 100 }, // Should use default
      { emoji: '🎯', x: 200, y: 200, fontSize: 96 },
    ];

    const results = createEmojiReactionElements(options);

    expect(results[0].fontSize).toBe(24);
    expect(results[1].fontSize).toBe(DEFAULT_EMOJI_REACTION_FONT_SIZE);
    expect(results[2].fontSize).toBe(96);
  });
});
