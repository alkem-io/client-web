/**
 * @fileoverview Type definitions for whiteboard emoji reactions
 * @spec 003-whiteboard-emoji-reactions
 *
 * These types are derived from contracts/emoji-config.contract.ts.
 * Client-side only: No GraphQL or API types needed.
 */

// ============================================================================
// EMOJI CONFIGURATION TYPES
// ============================================================================

/**
 * Single emoji entry in the picker configuration.
 * Each entry maps an emoji to its accessibility label.
 */
export interface EmojiReactionConfigEntry {
  /** Unicode emoji character (e.g., "👍") */
  readonly emoji: string;

  /** Human-readable label for accessibility (e.g., "Thumbs Up") */
  readonly label: string;

  /**
   * Search keywords for filtering (optional, for future enhancement).
   * Lowercase terms for matching user search input.
   */
  readonly keywords?: readonly string[];

  /**
   * Optional category for grouping (future enhancement).
   */
  readonly category?: string;
}

/**
 * Complete emoji configuration for the whiteboard picker.
 * Bundled at build time as a TypeScript module.
 */
export interface EmojiReactionConfiguration {
  /** Ordered list of available emojis */
  readonly emojis: readonly EmojiReactionConfigEntry[];

  /** Version identifier for cache busting if needed */
  readonly version: string;
}

// ============================================================================
// EXCALIDRAW ELEMENT TYPES
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
export interface CreateEmojiReactionElementOptions {
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
// PICKER STATE TYPES
// ============================================================================

/**
 * Picker visibility states.
 */
export type EmojiReactionPickerState = 'closed' | 'open' | 'placing';

/**
 * State model for the emoji picker component.
 */
export interface EmojiReactionPickerStateModel {
  /** Current visibility state */
  readonly pickerState: EmojiReactionPickerState;

  /** Currently selected emoji (null when closed) */
  readonly selectedEmoji: string | null;
}

/**
 * Actions that can be dispatched to update picker state.
 */
export type EmojiReactionPickerAction =
  | { type: 'OPEN_PICKER' }
  | { type: 'SELECT_EMOJI'; emoji: string }
  | { type: 'PLACE_EMOJI' }
  | { type: 'CANCEL' };

// ============================================================================
// COORDINATE TYPES
// ============================================================================

/**
 * Scene coordinates (Excalidraw canvas space).
 */
export interface SceneCoordinates {
  readonly x: number;
  readonly y: number;
}

/**
 * Information about active emoji placement mode.
 * Used to communicate from picker to parent for canvas click handling.
 */
export interface EmojiReactionPlacementInfo {
  /** Whether placement mode is active */
  readonly isActive: boolean;

  /** The emoji to place when canvas is clicked */
  readonly emoji: string;
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

/**
 * Props for the WhiteboardEmojiReactionPicker component.
 */
export interface WhiteboardEmojiReactionPickerProps {
  /**
   * Callback when an emoji should be added to the canvas.
   * The parent component handles the actual Excalidraw integration.
   */
  readonly onEmojiPlace: (emoji: string, coordinates: SceneCoordinates) => void;

  /**
   * Callback when placement mode changes.
   * Parent uses this to track selected emoji for canvas click handling.
   */
  readonly onPlacementModeChange?: (placementInfo: EmojiReactionPlacementInfo | null) => void;

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
export interface EmojiReactionGridProps {
  /** Emoji configuration to display */
  readonly config: EmojiReactionConfiguration;

  /** Callback when an emoji is clicked */
  readonly onSelect: (emoji: string) => void;

  /** Currently selected emoji for highlighting */
  readonly selectedEmoji?: string | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default font size for emoji elements (in pixels).
 * Large enough to be clearly visible on the canvas.
 */
export const DEFAULT_EMOJI_REACTION_FONT_SIZE = 48;

/**
 * Minimum number of emojis required in configuration.
 */
export const MIN_EMOJI_COUNT = 1;

/**
 * Maximum number of emojis allowed in configuration.
 * Keeps the picker UI manageable.
 */
export const MAX_EMOJI_COUNT = 50;
