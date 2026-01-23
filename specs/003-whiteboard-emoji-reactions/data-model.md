# Data Model: Whiteboard Emoji Content

**Phase**: 1 - Foundation | **Date**: 2025-12-27 | **Spec**: [spec.md](spec.md)

## Overview

This document defines the data structures for the whiteboard emoji feature. Since emojis are added as standard Excalidraw text elements (client-side paste), there are no database schema changes—only TypeScript interfaces for configuration and element generation.

## 1. Emoji Configuration Model

### 1.1 EmojiConfigEntry

Represents a single emoji available in the picker.

```typescript
/**
 * Configuration for a single emoji in the whiteboard emoji picker.
 */
export interface EmojiConfigEntry {
  /**
   * The emoji character (e.g., "👍").
   * Must be a valid Unicode emoji.
   */
  emoji: string;

  /**
   * Human-readable name for accessibility and tooltips.
   * Used as ARIA label for screen readers.
   * @example "Thumbs Up"
   */
  name: string;

  /**
   * Search keywords for filtering (future enhancement).
   * Lowercase, space-separated terms.
   * @example ["agree", "yes", "good", "like", "approve"]
   */
  keywords: string[];

  /**
   * Optional category for grouping (future enhancement).
   * @example "reactions" | "status" | "feedback"
   */
  category?: string;
}
```

### 1.2 EmojiConfiguration

Root configuration object containing the emoji set.

```typescript
/**
 * Root configuration for the whiteboard emoji picker.
 * Bundled at build time as a TypeScript module.
 */
export interface EmojiConfiguration {
  /**
   * Schema version for future migrations.
   * Increment when breaking changes occur.
   */
  version: number;

  /**
   * Array of available emojis.
   * Order determines display order in picker.
   */
  emojis: EmojiConfigEntry[];
}
```

## 2. Default Emoji Set

The 10 default emojis as defined in the specification:

```typescript
export const defaultEmojiConfig: EmojiConfiguration = {
  version: 1,
  emojis: [
    {
      emoji: '👍',
      name: 'Thumbs Up',
      keywords: ['agree', 'yes', 'good', 'like', 'approve'],
      category: 'reactions',
    },
    {
      emoji: '⭐',
      name: 'Star',
      keywords: ['star', 'important', 'favorite', 'highlight'],
      category: 'status',
    },
    {
      emoji: '✅',
      name: 'Check Mark',
      keywords: ['done', 'complete', 'approved', 'check', 'yes'],
      category: 'status',
    },
    {
      emoji: '💡',
      name: 'Light Bulb',
      keywords: ['idea', 'insight', 'suggestion', 'think', 'lightbulb'],
      category: 'feedback',
    },
    {
      emoji: '❓',
      name: 'Question',
      keywords: ['question', 'unclear', 'help', 'ask', 'clarify'],
      category: 'feedback',
    },
    {
      emoji: '💬',
      name: 'Speech Bubble',
      keywords: ['discuss', 'comment', 'talk', 'conversation'],
      category: 'feedback',
    },
    {
      emoji: '🎯',
      name: 'Target',
      keywords: ['goal', 'target', 'focus', 'aim', 'objective'],
      category: 'status',
    },
    {
      emoji: '👏',
      name: 'Clapping Hands',
      keywords: ['applause', 'great', 'celebrate', 'well done', 'bravo'],
      category: 'reactions',
    },
    {
      emoji: '📌',
      name: 'Pin',
      keywords: ['pin', 'important', 'bookmark', 'remember', 'note'],
      category: 'status',
    },
    {
      emoji: '🚀',
      name: 'Rocket',
      keywords: ['rocket', 'progress', 'go', 'launch', 'momentum'],
      category: 'reactions',
    },
  ],
};
```

## 3. Excalidraw Element Structure

### 3.1 Text Element JSON

When an emoji is placed, it becomes an Excalidraw text element. The minimal structure:

```typescript
/**
 * Excalidraw text element structure for emoji placement.
 * This is the JSON structure passed to convertToExcalidrawElements().
 */
interface ExcalidrawTextElementSkeleton {
  /** Element type - always "text" for emojis */
  type: 'text';

  /** X coordinate in scene space */
  x: number;

  /** Y coordinate in scene space */
  y: number;

  /** The emoji character(s) */
  text: string;

  /** Font size in pixels - larger for emoji visibility */
  fontSize: number;

  /** Optional: unique identifier (auto-generated if omitted) */
  id?: string;

  /** Optional: stroke/text color */
  strokeColor?: string;

  /** Optional: font family (default: 1 = Virgil hand-drawn) */
  fontFamily?: number;
}
```

### 3.2 createEmojiElement Function

Function signature for generating emoji elements:

```typescript
/**
 * Creates an Excalidraw-compatible text element skeleton for an emoji.
 *
 * @param emoji - The emoji character to place
 * @param x - X coordinate in Excalidraw scene space
 * @param y - Y coordinate in Excalidraw scene space
 * @param options - Optional configuration overrides
 * @returns ExcalidrawElementSkeleton ready for convertToExcalidrawElements()
 */
export function createEmojiElement(
  emoji: string,
  x: number,
  y: number,
  options?: {
    fontSize?: number;
    id?: string;
  }
): ExcalidrawTextElementSkeleton;
```

**Default Values**:

- `fontSize`: 48 (visible at standard zoom)
- `id`: Auto-generated UUID
- `fontFamily`: 1 (Virgil - matches Excalidraw default)

### 3.3 Example Generated Element

```json
{
  "type": "text",
  "x": 250,
  "y": 150,
  "text": "👍",
  "fontSize": 48,
  "id": "emoji_1703683200000_abc123",
  "fontFamily": 1
}
```

## 4. Placement Coordinates

### 4.1 Screen to Scene Coordinate Conversion

Excalidraw uses scene coordinates that differ from screen coordinates based on zoom and scroll:

```typescript
/**
 * Converts screen (client) coordinates to Excalidraw scene coordinates.
 *
 * @param clientX - Mouse X position relative to viewport
 * @param clientY - Mouse Y position relative to viewport
 * @param appState - Current Excalidraw app state containing zoom/scroll
 * @returns Scene coordinates for element placement
 */
function screenToSceneCoordinates(
  clientX: number,
  clientY: number,
  appState: { scrollX: number; scrollY: number; zoom: { value: number } }
): { x: number; y: number } {
  return {
    x: (clientX - appState.scrollX) / appState.zoom.value,
    y: (clientY - appState.scrollY) / appState.zoom.value,
  };
}
```

### 4.2 Zoom-Appropriate Sizing

Per FR-012, emoji size should be appropriate to zoom level:

```typescript
/**
 * Calculates emoji font size based on current zoom level.
 * Ensures emoji remains visible and proportional at any zoom.
 *
 * @param baseSize - Default font size at 100% zoom (48px)
 * @param zoomLevel - Current Excalidraw zoom value (e.g., 0.5 = 50%, 2.0 = 200%)
 * @returns Adjusted font size
 */
function getZoomAdjustedFontSize(baseSize: number, zoomLevel: number): number {
  // Keep emoji visually consistent regardless of zoom
  // At low zoom, increase size; at high zoom, decrease
  return Math.round(baseSize / zoomLevel);
}
```

## 5. State Model

### 5.1 Picker Component State

Local state for the emoji picker component (no global state needed):

```typescript
interface EmojiPickerState {
  /** Whether the picker popover is open */
  isOpen: boolean;

  /** Currently selected emoji (null if none) */
  selectedEmoji: string | null;

  /** Whether user is in placement mode (click to place) */
  isPlacementMode: boolean;
}

// Initial state
const initialState: EmojiPickerState = {
  isOpen: false,
  selectedEmoji: null,
  isPlacementMode: false,
};
```

### 5.2 State Transitions

```
[Closed] ---(click picker button)---> [Open]
[Open] ---(click emoji)---> [Placement Mode]
[Placement Mode] ---(click canvas)---> [Closed] + emoji placed
[Placement Mode] ---(click outside canvas)---> [Closed]
[Placement Mode] ---(press Escape)---> [Closed]
[Open] ---(click away)---> [Closed]
```

## 6. Validation Rules

### 6.1 Emoji Configuration Validation

```typescript
function validateEmojiConfig(config: EmojiConfiguration): ValidationResult {
  const errors: string[] = [];

  if (config.version < 1) {
    errors.push('Version must be >= 1');
  }

  if (!config.emojis || config.emojis.length === 0) {
    errors.push('At least one emoji must be configured');
  }

  config.emojis.forEach((entry, index) => {
    if (!entry.emoji || entry.emoji.trim() === '') {
      errors.push(`Emoji at index ${index} is empty`);
    }
    if (!entry.name || entry.name.trim() === '') {
      errors.push(`Name at index ${index} is empty`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
```

### 6.2 Placement Validation

- Coordinates must be within canvas bounds (placement fails silently if outside)
- User must have edit permissions (picker disabled for read-only users)
- Emoji configuration must be valid (picker hidden if invalid)

## 7. Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                    EmojiConfiguration                        │
│  - version: number                                          │
│  - emojis: EmojiConfigEntry[]                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ contains
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    EmojiConfigEntry                          │
│  - emoji: string                                            │
│  - name: string                                             │
│  - keywords: string[]                                       │
│  - category?: string                                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ used by
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                createEmojiElement()                          │
│  - Generates Excalidraw text element JSON                   │
│  - Input: emoji, x, y, options                              │
│  - Output: ExcalidrawTextElementSkeleton                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ produces
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Excalidraw Text Element                         │
│  - Standard Excalidraw element in canvas                    │
│  - Synced via existing collaborative infrastructure         │
└─────────────────────────────────────────────────────────────┘
```
