# Quickstart: Whiteboard Emoji Reactions

> **Spec ID**: 003-whiteboard-emoji-reactions
> **Phase**: Foundation
> **Purpose**: Get developers implementing this feature up to speed quickly

---

## 1. Feature Overview

This feature adds an emoji picker to the whiteboard header toolbar (beside the preview settings button) that allows users to select and place emoji content on the canvas. Key points:

- **Client-side only** – No GraphQL or API calls
- **Paste-as-content** – Emojis are added as Excalidraw text elements
- **Existing sync handles persistence** – Once on canvas, collaborative sync takes over
- **Header toolbar location** – Emoji picker is in the dialog header, accessed via `headerActions` prop
- **Emoji cursor** – During placement mode, the selected emoji follows the mouse cursor

## 2. Prerequisites

```bash
# Ensure you're on the correct branch
git checkout 003-whiteboard-emoji-reactions

# Install dependencies (emoji-picker-react@4.4.7 is already in package.json)
pnpm install

# Start dev server (requires backend at localhost:3000)
pnpm start
```

## 3. Key Files to Understand

### Existing Files (read these first)

| File | Purpose |
|------|---------|
| [src/core/ui/forms/emoji/EmojiSelector.tsx](../../src/core/ui/forms/emoji/EmojiSelector.tsx) | Reference implementation of emoji picker patterns |
| [src/domain/common/whiteboard/excalidraw/CollaborativeExcalidrawWrapper.tsx](../../src/domain/common/whiteboard/excalidraw/CollaborativeExcalidrawWrapper.tsx) | Main whiteboard component – exposes emoji controls via render prop |
| [src/domain/collaboration/whiteboard/WhiteboardDialog/WhiteboardDialog.tsx](../../src/domain/collaboration/whiteboard/WhiteboardDialog/WhiteboardDialog.tsx) | Dialog wrapper – forwards emoji controls to headerActions |
| [src/domain/collaboration/whiteboard/WhiteboardsManagement/WhiteboardView.tsx](../../src/domain/collaboration/whiteboard/WhiteboardsManagement/WhiteboardView.tsx) | View component – renders emoji picker in headerActions |

### Files Created/Modified

| Path | Purpose |
|------|---------|
| `src/domain/collaboration/whiteboard/reactionEmoji/types.ts` | TypeScript interfaces |
| `src/domain/collaboration/whiteboard/reactionEmoji/emojiReactionConfig.ts` | Default emoji configuration (10 emojis) |
| `src/domain/collaboration/whiteboard/reactionEmoji/createEmojiReactionElement.ts` | Generate Excalidraw text element JSON |
| `src/domain/collaboration/whiteboard/reactionEmoji/useEmojiReactionConfiguration.ts` | Hook to access emoji config |
| `src/domain/collaboration/whiteboard/components/WhiteboardEmojiReactionPicker.tsx` | React component for picker UI |
| `src/domain/collaboration/whiteboard/components/EmojiReactionGrid.tsx` | Grid layout for emoji buttons |

## 4. Core Concepts

### 4.1 Emoji as Text Element

Emojis are standard Excalidraw text elements. The `createEmojiElement()` function generates the element skeleton:

```typescript
import { convertToExcalidrawElements } from '@alkemio/excalidraw';

const skeleton = {
  type: 'text',
  text: '👍',
  x: 100,
  y: 200,
  fontSize: 48,
};

const [element] = convertToExcalidrawElements([skeleton]);
```

### 4.2 Adding to Canvas

Use Excalidraw's `updateScene()` API to add the element:

```typescript
const excalidrawAPI = // ... from ref

excalidrawAPI.updateScene({
  elements: [...excalidrawAPI.getSceneElements(), element],
});
```

### 4.3 Coordinate Conversion

Screen clicks must be converted to scene coordinates. **Important**: Use Excalidraw's `viewportCoordsToSceneCoords()` utility function instead of manual calculation, as it correctly handles all zoom levels, scroll positions, and canvas offsets:

```typescript
import { viewportCoordsToSceneCoords } from '@alkemio/excalidraw';

// CORRECT: Use Excalidraw's utility function
const sceneCoords = viewportCoordsToSceneCoords(
  { clientX: event.clientX, clientY: event.clientY },
  appState
);

// WRONG: Manual calculation fails at different zoom levels
// const x = (canvasX - scrollX) / zoom.value; // DON'T DO THIS
```

## 5. Implementation Workflow

### Phase 1: Foundation (current)
- [x] Spec complete
- [x] Plan complete
- [x] Research complete
- [x] Data model complete
- [x] Contracts complete
- [x] Quickstart complete

### Phase 2: Core Logic ✅
1. ✅ Created `types.ts` – TypeScript interfaces
2. ✅ Created `emojiReactionConfig.ts` – Default 10-emoji configuration
3. ✅ Created `createEmojiReactionElement.ts` – Element generation function
4. ✅ Created `useEmojiReactionConfiguration.ts` – Hook returning config

### Phase 3: UI Components ✅ (MVP Complete)
1. ✅ Created `WhiteboardEmojiReactionPicker.tsx` – Popover with emoji grid
2. ✅ Created `EmojiReactionGrid.tsx` – Grid layout for emoji buttons
3. ✅ Integrated into header toolbar via `headerActions` prop
4. ✅ Canvas click handling for placement in `CollaborativeExcalidrawWrapper.tsx`
5. ✅ Emoji cursor – selected emoji follows mouse during placement mode

### Phase 4: Polish (Remaining)
1. [ ] Add keyboard navigation (Arrow keys, Enter, Escape)
2. ✅ Added i18n strings
3. ✅ Added unit tests (459 tests passing)

## 6. Testing

### Manual Testing Checklist

1. [x] Open a whiteboard in edit mode
2. [x] Verify emoji picker button is visible in header toolbar (beside preview settings)
3. [x] Click emoji picker – popover with emoji grid appears
4. [x] Select an emoji – popover closes, selected emoji follows mouse cursor
5. [x] Click on canvas – emoji appears at click location, cursor returns to normal
6. [x] Verify emoji can be selected/moved like any other element
7. [ ] Refresh page – emoji persists (collaborative sync)
8. [ ] Open in another browser – emoji visible (real-time sync)
9. [x] Click outside canvas during placement mode – placement is cancelled

### Unit Tests to Write

```typescript
// createEmojiElement.test.ts
describe('createEmojiElement', () => {
  it('generates valid text element skeleton');
  it('uses default font size when not specified');
  it('applies custom font size when provided');
});

// emojiConfig.test.ts
describe('defaultEmojiConfig', () => {
  it('contains exactly 10 emojis');
  it('has unique emoji characters');
  it('has labels for all emojis');
});
```

## 7. Common Gotchas

| Issue | Solution |
|-------|----------|
| Emoji appears at wrong position at various zoom levels | **Must use** `viewportCoordsToSceneCoords()` from `@alkemio/excalidraw` - manual coordinate calculation fails at different zoom levels |
| Emoji doesn't appear at extreme zoom (e.g., 10%) | Same as above - the `viewportCoordsToSceneCoords()` function handles all zoom/scroll/offset calculations correctly |
| Picker doesn't reset after placement | Pass `emojiPlacementInfo` prop to picker component so it can detect when placement completes and reset internal state |
| Emoji doesn't persist after refresh | Check that `updateScene()` was called correctly |
| Picker doesn't appear | Verify `headerActions` prop is correctly wired in WhiteboardDialog |
| TypeScript errors with Excalidraw types | Import from `@alkemio/excalidraw` (the fork), not `excalidraw` |
| Emoji cursor not showing | Check that `emojiPlacementInfo` is passed through `WhiteboardHeaderState` |
| Picker not available for guests | Ensure `PublicWhiteboardPage` includes picker in `headerActions` |

## 8. Reference Links

- **Spec**: [spec.md](./spec.md)
- **Plan**: [plan.md](./plan.md)
- **Research**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Contracts**: [contracts/emoji-config.contract.ts](./contracts/emoji-config.contract.ts)

---

**Questions?** Check the research.md for detailed Excalidraw API documentation, or refer to the existing EmojiSelector component for patterns.
