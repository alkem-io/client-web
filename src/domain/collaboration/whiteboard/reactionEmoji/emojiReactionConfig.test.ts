import { describe, it, expect } from 'vitest';
import { defaultEmojiReactionConfig, isValidEmojiReactionConfig } from './emojiReactionConfig';
import { EmojiReactionConfiguration } from './types';

describe('defaultEmojiReactionConfig', () => {
  it('contains exactly 10 emojis', () => {
    expect(defaultEmojiReactionConfig.emojis).toHaveLength(10);
  });

  it('has unique emoji characters', () => {
    const emojis = defaultEmojiReactionConfig.emojis.map(e => e.emoji);
    const uniqueEmojis = new Set(emojis);
    expect(uniqueEmojis.size).toBe(emojis.length);
  });

  it('has labels for all emojis', () => {
    defaultEmojiReactionConfig.emojis.forEach(entry => {
      expect(entry.label).toBeDefined();
      expect(typeof entry.label).toBe('string');
      expect(entry.label.length).toBeGreaterThan(0);
    });
  });

  it('has a version string', () => {
    expect(defaultEmojiReactionConfig.version).toBeDefined();
    expect(typeof defaultEmojiReactionConfig.version).toBe('string');
  });

  it('contains the expected default emojis in order', () => {
    const expectedEmojis = ['👍', '⭐', '✅', '💡', '❓', '💬', '🎯', '👏', '📌', '🚀'];
    const actualEmojis = defaultEmojiReactionConfig.emojis.map(e => e.emoji);
    expect(actualEmojis).toEqual(expectedEmojis);
  });

  it('all emojis have keywords defined', () => {
    defaultEmojiReactionConfig.emojis.forEach(entry => {
      expect(entry.keywords).toBeDefined();
      expect(Array.isArray(entry.keywords)).toBe(true);
      expect(entry.keywords!.length).toBeGreaterThan(0);
    });
  });

  it('all emojis have categories defined', () => {
    defaultEmojiReactionConfig.emojis.forEach(entry => {
      expect(entry.category).toBeDefined();
      expect(typeof entry.category).toBe('string');
    });
  });
});

describe('isValidEmojiReactionConfig', () => {
  it('returns true for valid configuration', () => {
    expect(isValidEmojiReactionConfig(defaultEmojiReactionConfig)).toBe(true);
  });

  it('returns false for null', () => {
    expect(isValidEmojiReactionConfig(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isValidEmojiReactionConfig(undefined)).toBe(false);
  });

  it('returns false for empty emojis array', () => {
    const emptyConfig: EmojiReactionConfiguration = {
      version: '1.0.0',
      emojis: [],
    };
    expect(isValidEmojiReactionConfig(emptyConfig)).toBe(false);
  });

  it('returns false for missing emoji character', () => {
    const invalidConfig = {
      version: '1.0.0',
      emojis: [{ emoji: '', label: 'Empty' }],
    } as EmojiReactionConfiguration;
    expect(isValidEmojiReactionConfig(invalidConfig)).toBe(false);
  });

  it('returns false for missing label', () => {
    const invalidConfig = {
      version: '1.0.0',
      emojis: [{ emoji: '👍', label: '' }],
    } as EmojiReactionConfiguration;
    expect(isValidEmojiReactionConfig(invalidConfig)).toBe(false);
  });

  it('returns true for minimal valid config', () => {
    const minimalConfig: EmojiReactionConfiguration = {
      version: '1.0.0',
      emojis: [{ emoji: '👍', label: 'Thumbs Up' }],
    };
    expect(isValidEmojiReactionConfig(minimalConfig)).toBe(true);
  });

  it('returns false when emojis is not an array', () => {
    const invalidConfig = {
      version: '1.0.0',
      emojis: 'not an array',
    } as unknown as EmojiReactionConfiguration;
    expect(isValidEmojiReactionConfig(invalidConfig)).toBe(false);
  });
});
