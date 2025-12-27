# Quickstart: Whiteboard Emoji Reactions

> **Spec ID**: 003-whiteboard-emoji-reactions
> **Phase**: Foundation
> **Purpose**: Get developers implementing this feature up to speed quickly

---

## 1. Feature Overview

This feature adds an emoji picker to the whiteboard that allows users to select and place emoji content on the canvas. Key points:

- **Client-side only** – No GraphQL or API calls
- **Paste-as-content** – Emojis are added as Excalidraw text elements (simulates user paste)
- **Existing sync handles persistence** – Once on canvas, collaborative sync takes over

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
| [src/domain/common/whiteboard/excalidraw/CollaborativeExcalidrawWrapper.tsx](../../src/domain/common/whiteboard/excalidraw/CollaborativeExcalidrawWrapper.tsx) | Main whiteboard component – **integration point** |
| [src/domain/collaboration/whiteboard/WhiteboardDialog/WhiteboardDialog.tsx](../../src/domain/collaboration/whiteboard/WhiteboardDialog/WhiteboardDialog.tsx) | Dialog wrapper for whiteboards |

### New Files to Create

| Path | Purpose |
|------|---------|
| `src/domain/collaboration/whiteboard/emoji/types.ts` | TypeScript interfaces (copy from contracts/) |
| `src/domain/collaboration/whiteboard/emoji/emojiConfig.ts` | Default emoji configuration |
| `src/domain/collaboration/whiteboard/emoji/createEmojiElement.ts` | Generate Excalidraw text element JSON |
| `src/domain/collaboration/whiteboard/emoji/useEmojiConfiguration.ts` | Hook to access emoji config |
| `src/domain/collaboration/whiteboard/components/WhiteboardEmojiPicker.tsx` | React component for picker UI |

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

Screen clicks must be converted to scene coordinates:

```typescript
const { x, y } = excalidrawAPI.screenToScene(screenX, screenY);
```

## 5. Implementation Workflow

### Phase 1: Foundation (current)
- [x] Spec complete
- [x] Plan complete
- [x] Research complete
- [x] Data model complete
- [x] Contracts complete
- [x] Quickstart complete

### Phase 2: Core Logic
1. Create `types.ts` – Copy interfaces from `contracts/emoji-config.contract.ts`
2. Create `emojiConfig.ts` – Default 10-emoji configuration
3. Create `createEmojiElement.ts` – Element generation function
4. Create `useEmojiConfiguration.ts` – Simple hook returning config

### Phase 3: UI Components
1. Create `WhiteboardEmojiPicker.tsx` – Grid of emoji buttons
2. Integrate into `CollaborativeExcalidrawWrapper.tsx`
3. Wire canvas click handling for placement

### Phase 4: Polish
1. Add keyboard navigation (Arrow keys, Enter, Escape)
2. Add i18n strings
3. Add unit tests

## 6. Testing

### Manual Testing Checklist

1. [ ] Open a whiteboard in edit mode
2. [ ] Verify emoji picker button is visible
3. [ ] Click emoji picker – grid appears
4. [ ] Select an emoji – cursor changes or indicator shows
5. [ ] Click on canvas – emoji appears at click location
6. [ ] Verify emoji can be selected/moved like any other element
7. [ ] Refresh page – emoji persists (collaborative sync)
8. [ ] Open in another browser – emoji visible (real-time sync)

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
| Emoji appears at wrong position | Ensure you're using `screenToScene()` for coordinate conversion |
| Emoji doesn't persist after refresh | Check that `updateScene()` was called correctly |
| Picker doesn't close after placement | Add `onCanvasClick` handler to close picker state |
| TypeScript errors with Excalidraw types | Import from `@alkemio/excalidraw` (the fork), not `excalidraw` |

## 8. Reference Links

- **Spec**: [spec.md](./spec.md)
- **Plan**: [plan.md](./plan.md)
- **Research**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Contracts**: [contracts/emoji-config.contract.ts](./contracts/emoji-config.contract.ts)

---

**Questions?** Check the research.md for detailed Excalidraw API documentation, or refer to the existing EmojiSelector component for patterns.
