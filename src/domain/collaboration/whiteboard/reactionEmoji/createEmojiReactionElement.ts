/**
 * @fileoverview Creates Excalidraw text elements for emoji reactions
 * @spec 003-whiteboard-emoji-reactions
 *
 * This module generates Excalidraw-compatible element skeletons for emoji
 * placement on the whiteboard canvas. The generated elements are passed to
 * Excalidraw's convertToExcalidrawElements() API.
 */

import {
  CreateEmojiReactionElementOptions,
  ExcalidrawTextElementSkeleton,
  DEFAULT_EMOJI_REACTION_FONT_SIZE,
} from './types';

/**
 * Creates an Excalidraw text element skeleton for an emoji reaction.
 *
 * The skeleton is a minimal representation that Excalidraw's
 * convertToExcalidrawElements() will expand into a full element with
 * generated id, version, and other required properties.
 *
 * @param options - Options for creating the emoji element
 * @returns ExcalidrawTextElementSkeleton ready for convertToExcalidrawElements()
 *
 * @example
 * ```typescript
 * import { convertToExcalidrawElements } from '@alkemio/excalidraw';
 *
 * const skeleton = createEmojiReactionElement({
 *   emoji: '👍',
 *   x: 100,
 *   y: 200,
 * });
 *
 * const [element] = convertToExcalidrawElements([skeleton]);
 * excalidrawAPI.updateScene({
 *   elements: [...excalidrawAPI.getSceneElements(), element],
 * });
 * ```
 */
export function createEmojiReactionElement(
  options: CreateEmojiReactionElementOptions
): ExcalidrawTextElementSkeleton {
  const { emoji, x, y, fontSize = DEFAULT_EMOJI_REACTION_FONT_SIZE } = options;

  return {
    type: 'text',
    text: emoji,
    x,
    y,
    fontSize,
  };
}

/**
 * Creates multiple emoji reaction elements at once.
 *
 * Useful for batch operations or restoring saved emoji positions.
 *
 * @param optionsArray - Array of options for creating emoji elements
 * @returns Array of ExcalidrawTextElementSkeleton objects
 */
export function createEmojiReactionElements(
  optionsArray: readonly CreateEmojiReactionElementOptions[]
): ExcalidrawTextElementSkeleton[] {
  return optionsArray.map(options => createEmojiReactionElement(options));
}
