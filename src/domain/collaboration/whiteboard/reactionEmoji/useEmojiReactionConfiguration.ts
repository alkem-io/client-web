/**
 * @fileoverview Hook to access emoji reaction configuration
 * @spec 003-whiteboard-emoji-reactions
 *
 * Provides access to the bundled emoji configuration for the whiteboard
 * emoji reaction picker. Returns null if configuration is invalid,
 * which signals the picker should be hidden.
 */

import { useMemo } from 'react';
import { EmojiReactionConfiguration } from './types';
import { defaultEmojiReactionConfig, isValidEmojiReactionConfig } from './emojiReactionConfig';

/**
 * Hook to access the emoji reaction configuration.
 *
 * Returns the validated configuration or null if invalid/empty.
 * When null is returned, the emoji picker should be hidden.
 *
 * @returns EmojiReactionConfiguration or null if invalid
 *
 * @example
 * ```typescript
 * const config = useEmojiReactionConfiguration();
 *
 * if (!config) {
 *   return null; // Hide picker when no valid config
 * }
 *
 * return <EmojiReactionGrid config={config} onSelect={handleSelect} />;
 * ```
 */
export function useEmojiReactionConfiguration(): EmojiReactionConfiguration | null {
  // Configuration is bundled at build time, so we use the default
  // Memoize validation to avoid re-checking on every render
  const validatedConfig = useMemo(() => {
    if (isValidEmojiReactionConfig(defaultEmojiReactionConfig)) {
      return defaultEmojiReactionConfig;
    }
    return null;
  }, []);

  return validatedConfig;
}
