/**
 * @fileoverview State management hook for emoji reaction picker
 * @spec 003-whiteboard-emoji-reactions
 *
 * Manages the picker's open/closed state and the currently selected emoji
 * for placement mode.
 */

import { useReducer, useCallback } from 'react';
import { EmojiReactionPickerState, EmojiReactionPickerStateModel, EmojiReactionPickerAction } from './types';

/**
 * Initial state for the emoji picker.
 */
const initialState: EmojiReactionPickerStateModel = {
  pickerState: 'closed',
  selectedEmoji: null,
};

/**
 * Reducer for emoji picker state management.
 */
function emojiPickerReducer(
  state: EmojiReactionPickerStateModel,
  action: EmojiReactionPickerAction
): EmojiReactionPickerStateModel {
  switch (action.type) {
    case 'OPEN_PICKER':
      return {
        ...state,
        pickerState: 'open',
      };

    case 'SELECT_EMOJI':
      return {
        pickerState: 'placing',
        selectedEmoji: action.emoji,
      };

    case 'PLACE_EMOJI':
      return {
        pickerState: 'closed',
        selectedEmoji: null,
      };

    case 'CANCEL':
      return initialState;

    default:
      return state;
  }
}

/**
 * Return type for useEmojiReactionPickerState hook.
 */
export interface UseEmojiReactionPickerStateResult {
  /** Current picker state */
  pickerState: EmojiReactionPickerState;

  /** Currently selected emoji (null when not in placing mode) */
  selectedEmoji: string | null;

  /** Whether the picker popover is open */
  isOpen: boolean;

  /** Whether we're in placement mode (emoji selected, waiting for canvas click) */
  isPlacing: boolean;

  /** Open the picker popover */
  openPicker: () => void;

  /** Select an emoji and enter placement mode */
  selectEmoji: (emoji: string) => void;

  /** Complete placement (after canvas click) */
  placeEmoji: () => void;

  /** Cancel current operation and close picker */
  cancel: () => void;
}

/**
 * Hook to manage emoji reaction picker state.
 *
 * Provides state and actions for controlling the picker:
 * - Opening/closing the picker popover
 * - Selecting an emoji for placement
 * - Completing or cancelling placement
 *
 * @returns State and action handlers for the picker
 *
 * @example
 * ```typescript
 * const {
 *   isOpen,
 *   isPlacing,
 *   selectedEmoji,
 *   openPicker,
 *   selectEmoji,
 *   placeEmoji,
 *   cancel,
 * } = useEmojiReactionPickerState();
 *
 * // In picker button
 * <IconButton onClick={openPicker}>...</IconButton>
 *
 * // In emoji grid
 * <button onClick={() => selectEmoji('👍')}>👍</button>
 *
 * // In canvas click handler
 * if (isPlacing && selectedEmoji) {
 *   addEmojiToCanvas(selectedEmoji, x, y);
 *   placeEmoji();
 * }
 * ```
 */
export function useEmojiReactionPickerState(): UseEmojiReactionPickerStateResult {
  const [state, dispatch] = useReducer(emojiPickerReducer, initialState);

  const openPicker = useCallback(() => {
    dispatch({ type: 'OPEN_PICKER' });
  }, []);

  const selectEmoji = useCallback((emoji: string) => {
    dispatch({ type: 'SELECT_EMOJI', emoji });
  }, []);

  const placeEmoji = useCallback(() => {
    dispatch({ type: 'PLACE_EMOJI' });
  }, []);

  const cancel = useCallback(() => {
    dispatch({ type: 'CANCEL' });
  }, []);

  return {
    pickerState: state.pickerState,
    selectedEmoji: state.selectedEmoji,
    isOpen: state.pickerState === 'open',
    isPlacing: state.pickerState === 'placing',
    openPicker,
    selectEmoji,
    placeEmoji,
    cancel,
  };
}
