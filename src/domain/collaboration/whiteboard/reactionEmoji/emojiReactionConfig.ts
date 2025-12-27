/**
 * @fileoverview Default emoji reaction configuration for whiteboard
 * @spec 003-whiteboard-emoji-reactions
 *
 * This module provides the default set of 10 emojis for the whiteboard
 * emoji reaction picker. The emojis are selected for safe, constructive
 * collaboration as specified in the feature requirements.
 *
 * To customize the emoji set:
 * 1. Edit this file to add, remove, or reorder emojis
 * 2. Rebuild the application
 * 3. The picker will display the updated emoji set
 *
 * Configuration Requirements:
 * - Each emoji must have a unique `emoji` character
 * - Each emoji must have a `label` for accessibility (screen readers)
 * - The `keywords` array is optional but recommended for future search
 * - The `category` is optional and reserved for future category filtering
 */

import { EmojiReactionConfiguration, EmojiReactionConfigEntry } from './types';

/**
 * Default emoji entries for the whiteboard reaction picker.
 * These 10 emojis are selected for safe, constructive collaboration:
 *
 * - 👍 Thumbs Up: Agreement, approval
 * - ⭐ Star: Highlight, favorite, important
 * - ✅ Check Mark: Complete, approved, done
 * - 💡 Light Bulb: Idea, insight, suggestion
 * - ❓ Question: Needs clarification, unclear
 * - 💬 Speech Bubble: Discussion needed, comment
 * - 🎯 Target: Goal, on-point, focus
 * - 👏 Clapping Hands: Great work, celebration
 * - 📌 Pin: Important, bookmark, remember
 * - 🚀 Rocket: Progress, momentum, launch
 */
const defaultEmojis: readonly EmojiReactionConfigEntry[] = [
  {
    emoji: '👍',
    label: 'Thumbs Up',
    keywords: ['agree', 'yes', 'good', 'like', 'approve'],
    category: 'reactions',
  },
  {
    emoji: '⭐',
    label: 'Star',
    keywords: ['star', 'important', 'favorite', 'highlight'],
    category: 'status',
  },
  {
    emoji: '✅',
    label: 'Check Mark',
    keywords: ['done', 'complete', 'approved', 'check', 'yes'],
    category: 'status',
  },
  {
    emoji: '💡',
    label: 'Light Bulb',
    keywords: ['idea', 'insight', 'suggestion', 'think', 'lightbulb'],
    category: 'feedback',
  },
  {
    emoji: '❓',
    label: 'Question',
    keywords: ['question', 'unclear', 'help', 'ask', 'clarify'],
    category: 'feedback',
  },
  {
    emoji: '💬',
    label: 'Speech Bubble',
    keywords: ['discuss', 'comment', 'talk', 'conversation'],
    category: 'feedback',
  },
  {
    emoji: '🎯',
    label: 'Target',
    keywords: ['goal', 'target', 'focus', 'aim', 'objective'],
    category: 'status',
  },
  {
    emoji: '👏',
    label: 'Clapping Hands',
    keywords: ['applause', 'great', 'celebrate', 'well done', 'bravo'],
    category: 'reactions',
  },
  {
    emoji: '📌',
    label: 'Pin',
    keywords: ['pin', 'important', 'bookmark', 'remember', 'note'],
    category: 'status',
  },
  {
    emoji: '🚀',
    label: 'Rocket',
    keywords: ['rocket', 'progress', 'go', 'launch', 'momentum'],
    category: 'reactions',
  },
];

/**
 * Default emoji reaction configuration.
 * Exported as the primary configuration for the whiteboard emoji picker.
 */
export const defaultEmojiReactionConfig: EmojiReactionConfiguration = {
  version: '1.0.0',
  emojis: defaultEmojis,
};

/**
 * Validates that an emoji configuration is valid and usable.
 *
 * @param config - Configuration to validate
 * @returns true if valid, false otherwise
 */
export function isValidEmojiReactionConfig(
  config: EmojiReactionConfiguration | null | undefined
): config is EmojiReactionConfiguration {
  if (!config) {
    return false;
  }

  if (!config.emojis || !Array.isArray(config.emojis)) {
    return false;
  }

  if (config.emojis.length === 0) {
    return false;
  }

  // Check that all entries have required fields
  return config.emojis.every(
    entry =>
      typeof entry.emoji === 'string' &&
      entry.emoji.length > 0 &&
      typeof entry.label === 'string' &&
      entry.label.length > 0
  );
}
