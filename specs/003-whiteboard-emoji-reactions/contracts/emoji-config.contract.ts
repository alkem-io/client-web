/**
 * @fileoverview Contract definitions for whiteboard emoji configuration
 * @spec 003-whiteboard-emoji-reactions
 * @phase Foundation
 *
 * This file defines the TypeScript interfaces that govern the emoji picker
 * feature. These contracts are AUTHORITATIVE - implementation must conform.
 *
 * Client-side only: No GraphQL or API contracts needed.
 */

// ============================================================================
// EMOJI CONFIGURATION CONTRACTS
// ============================================================================

/**
 * Single emoji entry in the picker configuration.
 * Each entry maps an emoji to its accessibility label.
 */
export interface EmojiConfigEntry {
  /** Unicode emoji character (e.g., "👍") */
  readonly emoji: string;

  /** Human-readable label for accessibility (e.g., "Thumbs Up") */
  readonly label: string;
}

/**
 * Complete emoji configuration for the whiteboard picker.
 * Bundled at build time as a TypeScript module.
 */
export interface EmojiConfiguration {
  /** Ordered list of available emojis */
  readonly emojis: readonly EmojiConfigEntry[];

  /** Version identifier for cache busting if needed */
  readonly version: string;
}

// ============================================================================
// EXCALIDRAW ELEMENT CONTRACTS
// ============================================================================

/**
 * Minimal structure for creating an Excalidraw text element.
 * This is the input to convertToExcalidrawElements().
 *
 * @see https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/excalidraw-element-skeleton
 */
export interface ExcalidrawTextElementSkeleton {
  readonly type: 'text';
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly fontSize: number;
}

/**
 * Options for creating an emoji element on the canvas.
 */
export interface CreateEmojiElementOptions {
  /** The emoji character to place */
  readonly emoji: string;

  /** X coordinate in scene space */
  readonly x: number;

  /** Y coordinate in scene space */
  readonly y: number;

  /** Font size in pixels (default: 48) */
  readonly fontSize?: number;
}

// ============================================================================
// PICKER STATE CONTRACTS
// ============================================================================

/**
 * Picker visibility states.
 */
export type PickerState = 'closed' | 'open' | 'placing';

/**
 * State model for the emoji picker component.
 */
export interface EmojiPickerState {
  /** Current visibility state */
  readonly pickerState: PickerState;

  /** Currently selected emoji (null when closed) */
  readonly selectedEmoji: string | null;
}

/**
 * Actions that can be dispatched to update picker state.
 */
export type EmojiPickerAction =
  | { type: 'OPEN_PICKER' }
  | { type: 'SELECT_EMOJI'; emoji: string }
  | { type: 'PLACE_EMOJI' }
  | { type: 'CANCEL' };

// ============================================================================
// COORDINATE CONVERSION CONTRACTS
// ============================================================================

/**
 * Screen coordinates (DOM/viewport space).
 */
export interface ScreenCoordinates {
  readonly screenX: number;
  readonly screenY: number;
}

/**
 * Scene coordinates (Excalidraw canvas space).
 */
export interface SceneCoordinates {
  readonly x: number;
  readonly y: number;
}

/**
 * Function signature for converting screen to scene coordinates.
 * Provided by Excalidraw's excalidrawAPI.
 */
export type ScreenToSceneConverter = (
  screenX: number,
  screenY: number
) => SceneCoordinates;

// ============================================================================
// COMPONENT PROP CONTRACTS
// ============================================================================

/**
 * Props for the WhiteboardEmojiPicker component.
 */
export interface WhiteboardEmojiPickerProps {
  /**
   * Callback when an emoji should be added to the canvas.
   * The parent component handles the actual Excalidraw integration.
   */
  readonly onEmojiSelect: (emoji: string) => void;

  /**
   * Whether the picker is disabled (e.g., read-only mode).
   */
  readonly disabled?: boolean;

  /**
   * Optional className for positioning/styling.
   */
  readonly className?: string;
}

/**
 * Props for the internal emoji button grid.
 */
export interface EmojiGridProps {
  /** Emoji configuration to display */
  readonly config: EmojiConfiguration;

  /** Callback when an emoji is clicked */
  readonly onSelect: (emoji: string) => void;

  /** Currently selected emoji for highlighting */
  readonly selectedEmoji?: string | null;
}

// ============================================================================
// VALIDATION CONTRACTS
// ============================================================================

/**
 * Validation result for emoji configuration.
 */
export interface EmojiConfigValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
}

/**
 * Validates that an emoji configuration meets requirements.
 *
 * @param config - Configuration to validate
 * @returns Validation result with any errors
 */
export type ValidateEmojiConfig = (
  config: EmojiConfiguration
) => EmojiConfigValidationResult;

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/**
 * Default font size for emoji elements (in pixels).
 * Large enough to be clearly visible on the canvas.
 */
export const DEFAULT_EMOJI_FONT_SIZE = 48;

/**
 * Minimum number of emojis required in configuration.
 */
export const MIN_EMOJI_COUNT = 1;

/**
 * Maximum number of emojis allowed in configuration.
 * Keeps the picker UI manageable.
 */
export const MAX_EMOJI_COUNT = 50;
