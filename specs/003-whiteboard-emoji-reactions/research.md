# Research: Whiteboard Emoji Content

**Phase**: 0 - Research | **Date**: 2025-12-27 | **Spec**: [spec.md](spec.md)

## Executive Summary

This research documents the technical feasibility and integration approach for adding emoji content placement to Alkemio whiteboards. Key findings:

1. **Excalidraw API** provides `convertToExcalidrawElements` and `updateScene` APIs for programmatic element creation
2. **Existing infrastructure** includes `emoji-picker-react` library and `EmojiSelector` component
3. **Integration approach**: Use Excalidraw text elements with emoji characters - no custom element types needed
4. **Coordinate mapping**: Canvas click events provide screen coordinates; Excalidraw API converts to scene coordinates

## 1. Excalidraw Element Creation APIs

### 1.1 convertToExcalidrawElements

The primary API for creating elements programmatically. Takes an `ExcalidrawElementSkeleton` array and returns fully formed `ExcalidrawElement` objects.

```typescript
import { convertToExcalidrawElements } from '@excalidraw/excalidraw';

// Create text element (emoji is just a text element with emoji character)
const elements = convertToExcalidrawElements([
  {
    type: 'text',
    x: 100,
    y: 100,
    text: '👍', // Emoji character
    fontSize: 48, // Large for visibility
  },
]);
```

**Key Properties for Text Elements**:

- `type: "text"` - Required
- `x`, `y` - Position coordinates (required)
- `text` - The emoji character string (required)
- `fontSize` - Size in pixels (default: 20, recommend: 36-48 for emojis)
- `strokeColor` - Text color (optional)
- `id` - Optional, auto-generated if not provided

### 1.2 updateScene API

Used to add elements to an existing Excalidraw canvas:

```typescript
const addEmojiToCanvas = (excalidrawAPI: ExcalidrawImperativeAPI, emoji: string, x: number, y: number) => {
  const currentElements = excalidrawAPI.getSceneElements();

  const newElements = convertToExcalidrawElements([
    {
      type: 'text',
      x,
      y,
      text: emoji,
      fontSize: 48,
    },
  ]);

  excalidrawAPI.updateScene({
    elements: [...currentElements, ...newElements],
  });
};
```

### 1.3 Coordinate Conversion

Excalidraw operates in scene coordinates, not screen coordinates. When user clicks on canvas:

```typescript
// Get scene coordinates from screen click
const getSceneCoordinates = (excalidrawAPI: ExcalidrawImperativeAPI, clientX: number, clientY: number) => {
  const appState = excalidrawAPI.getAppState();
  const { scrollX, scrollY, zoom } = appState;

  // Convert client coordinates to scene coordinates
  const sceneX = (clientX - scrollX) / zoom.value;
  const sceneY = (clientY - scrollY) / zoom.value;

  return { x: sceneX, y: sceneY };
};
```

**Alternative**: Use Excalidraw's built-in pointer event handling via `onPointerDown` prop if available.

## 2. Existing EmojiSelector Component

Located at `src/core/ui/forms/emoji/EmojiSelector.tsx`:

```typescript
import EmojiPicker, { EmojiStyle, SkinTonePickerLocation } from 'emoji-picker-react';

type EmojiSelectorProps = {
  anchorElement: PopperProps['anchorEl'];
  open: boolean;
  onClose: () => void;
  onEmojiClick: (emoji: string, event: MouseEvent) => void;
};
```

### 2.1 Reuse Assessment

**Can Reuse**:

- Popper positioning logic
- Click-away listener pattern
- emoji-picker-react integration

**Need to Modify/Extend**:

- Filter emojis to configured subset (custom emoji data)
- Styling to match whiteboard toolbar
- Keyboard navigation enhancements

### 2.2 emoji-picker-react Customization

The library supports custom emoji sets via `customEmojis` prop:

```typescript
import EmojiPicker, { EmojiStyle, Theme } from 'emoji-picker-react';

// For a limited custom set, use categories filter
<EmojiPicker
  emojiStyle={EmojiStyle.NATIVE}
  categories={['suggested']} // Show only suggested category
  suggestedEmojisMode="recent"
  // Or use searchDisabled + limited categories
/>
```

**Better Approach for 10-emoji set**: Create a simple custom picker component with MUI rather than filtering emoji-picker-react (overkill for 10 emojis).

## 3. Integration with CollaborativeExcalidrawWrapper

### 3.1 Current Architecture

```
WhiteboardDialog
  └── CollaborativeExcalidrawWrapper
        └── Excalidraw (from @alkemio/excalidraw)
```

Key integration points in `CollaborativeExcalidrawWrapper.tsx`:

1. **excalidrawAPI ref** - Available for programmatic control
2. **onChange handler** - Called on every scene change, handles collaborative sync
3. **UIOptions** - Can customize toolbar via `renderTopRightUI` prop

### 3.2 Proposed Integration

```
WhiteboardDialog
  └── EmojiPlacementProvider (NEW)
        └── CollaborativeExcalidrawWrapper
              ├── Excalidraw
              └── WhiteboardEmojiPicker (NEW - positioned outside canvas)
```

**WhiteboardEmojiPicker** renders:

1. Toolbar button to open emoji picker
2. Emoji picker popover (10 configured emojis)
3. Placement mode cursor indicator

### 3.3 Handling Placement Mode

```typescript
// In EmojiPlacementContext
interface EmojiPlacementState {
  isPlacementMode: boolean;
  selectedEmoji: string | null;
}

// Custom hook for placement
const useEmojiPlacement = () => {
  const [state, setState] = useState<EmojiPlacementState>({
    isPlacementMode: false,
    selectedEmoji: null,
  });

  const selectEmoji = (emoji: string) => {
    setState({ isPlacementMode: true, selectedEmoji: emoji });
  };

  const cancelPlacement = () => {
    setState({ isPlacementMode: false, selectedEmoji: null });
  };

  const completePlacement = () => {
    setState({ isPlacementMode: false, selectedEmoji: null });
  };

  return { ...state, selectEmoji, cancelPlacement, completePlacement };
};
```

## 4. Canvas Click Handling for Placement

### 4.1 Approach Options

**Option A: Overlay Click Handler**

- Place invisible overlay when in placement mode
- Capture click coordinates, convert to scene coordinates
- Add element via updateScene

**Option B: Excalidraw onPointerDown** (Preferred)

- Use Excalidraw's pointer event handling
- Events include converted scene coordinates
- Cleaner integration with existing event flow

### 4.2 Implementation Sketch (Option B)

```typescript
// In CollaborativeExcalidrawWrapper
const { isPlacementMode, selectedEmoji, completePlacement } = useEmojiPlacement();

const handlePointerDown = useCallback(
  (activeTool: AppState['activeTool'], state: AppState, event: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPlacementMode && selectedEmoji && excalidrawApi) {
      // Calculate scene coordinates
      const { scrollX, scrollY, zoom } = state;
      const x = (event.clientX - scrollX) / zoom.value;
      const y = (event.clientY - scrollY) / zoom.value;

      // Add emoji element
      addEmojiToCanvas(excalidrawApi, selectedEmoji, x, y);
      completePlacement();

      // Prevent default Excalidraw action
      return true;
    }
    return false;
  },
  [isPlacementMode, selectedEmoji, excalidrawApi, completePlacement]
);
```

**Note**: The exact event handling mechanism will need to be verified against `@alkemio/excalidraw` API. The Alkemio fork may have additional props/hooks.

## 5. Emoji Configuration Schema

### 5.1 TypeScript Interface

```typescript
// src/domain/collaboration/whiteboard/emoji/types.ts
export interface EmojiConfigEntry {
  /** The emoji character (e.g., "👍") */
  emoji: string;
  /** Display name for accessibility (e.g., "Thumbs Up") */
  name: string;
  /** Search keywords for filtering */
  keywords: string[];
  /** Optional category for grouping */
  category?: string;
}

export interface EmojiConfiguration {
  /** Version for future migrations */
  version: number;
  /** Array of available emojis */
  emojis: EmojiConfigEntry[];
}
```

### 5.2 Default Configuration (from spec)

```typescript
// src/domain/collaboration/whiteboard/emoji/emojiConfig.ts
import { EmojiConfiguration } from './types';

export const defaultEmojiConfig: EmojiConfiguration = {
  version: 1,
  emojis: [
    { emoji: '👍', name: 'Thumbs Up', keywords: ['agree', 'yes', 'good', 'like', 'approve'] },
    { emoji: '⭐', name: 'Star', keywords: ['star', 'important', 'favorite', 'highlight'] },
    { emoji: '✅', name: 'Check Mark', keywords: ['done', 'complete', 'approved', 'check', 'yes'] },
    { emoji: '💡', name: 'Light Bulb', keywords: ['idea', 'insight', 'suggestion', 'think', 'lightbulb'] },
    { emoji: '❓', name: 'Question', keywords: ['question', 'unclear', 'help', 'ask', 'clarify'] },
    { emoji: '💬', name: 'Speech Bubble', keywords: ['discuss', 'comment', 'talk', 'conversation'] },
    { emoji: '🎯', name: 'Target', keywords: ['goal', 'target', 'focus', 'aim', 'objective'] },
    { emoji: '👏', name: 'Clapping Hands', keywords: ['applause', 'great', 'celebrate', 'well done', 'bravo'] },
    { emoji: '📌', name: 'Pin', keywords: ['pin', 'important', 'bookmark', 'remember', 'note'] },
    { emoji: '🚀', name: 'Rocket', keywords: ['rocket', 'progress', 'go', 'launch', 'momentum'] },
  ],
};
```

## 6. Accessibility Considerations

### 6.1 Keyboard Navigation

The emoji picker must support:

- Tab to focus picker button
- Enter/Space to open picker
- Arrow keys to navigate emojis (grid layout)
- Enter to select emoji
- Escape to cancel

### 6.2 Screen Reader Support

```typescript
// Button with proper ARIA
<IconButton
  aria-label={t('whiteboard.emojiPicker.openButton')}
  aria-expanded={isOpen}
  aria-haspopup="dialog"
  onClick={handleOpen}
>
  <EmojiEmotionsIcon />
</IconButton>

// Emoji button with name
<button
  aria-label={emoji.name}
  onClick={() => selectEmoji(emoji.emoji)}
>
  {emoji.emoji}
</button>
```

### 6.3 Focus Management

- Focus moves to first emoji when picker opens
- Focus returns to trigger button on close
- Announce placement mode to screen readers

## 7. Performance Considerations

### 7.1 Lazy Loading

Emoji picker component should be lazy-loaded:

```typescript
const WhiteboardEmojiPicker = lazyWithGlobalErrorHandler(() => import('./WhiteboardEmojiPicker'));
```

### 7.2 Canvas Performance

- Emojis are native Excalidraw text elements
- No additional rendering overhead beyond standard text
- Real-time sync uses existing collaborative infrastructure
- Target: 60fps maintained with 100+ emoji elements

## 8. Risks and Mitigations

| Risk                                               | Likelihood | Impact | Mitigation                                            |
| -------------------------------------------------- | ---------- | ------ | ----------------------------------------------------- |
| Excalidraw API changes in @alkemio/excalidraw fork | Medium     | High   | Pin version, review changes before upgrade            |
| Coordinate conversion edge cases (zoom/scroll)     | Medium     | Medium | Comprehensive testing at various zoom levels          |
| Mobile touch events differ from pointer events     | Low        | Medium | Test on mobile, use pointer events polyfill if needed |
| Emoji rendering inconsistency across browsers      | Low        | Low    | Use native emoji style, test on target browsers       |

## 9. Open Questions (Resolved)

All open questions from spec have been resolved in clarification phase:

- ✅ Configuration location: Bundled TypeScript module
- ✅ Outside canvas click: Cancels placement
- ✅ Permissions handling: Silently fail placement
- ✅ Emoji set: 10 constructive emojis specified

## 10. References

- [Excalidraw Element Skeleton API](https://github.com/excalidraw/excalidraw/blob/master/dev-docs/docs/@excalidraw/excalidraw/api/excalidraw-element-skeleton.mdx)
- [emoji-picker-react documentation](https://www.npmjs.com/package/emoji-picker-react)
- Existing `EmojiSelector`: `src/core/ui/forms/emoji/EmojiSelector.tsx`
- Whiteboard wrapper: `src/domain/common/whiteboard/excalidraw/CollaborativeExcalidrawWrapper.tsx`
