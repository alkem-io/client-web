# Implementation Plan: Whiteboard Emoji Content

**Branch**: `003-whiteboard-emoji-reactions` | **Date**: 2025-12-27 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-whiteboard-emoji-reactions/spec.md`

## Summary

Enable users to place emoji content on whiteboard canvases. Users click an emoji picker control outside the canvas, select from a configurable palette of 10 default constructive emojis, then click on the canvas to place the emoji as standard whiteboard content. Placed emojis support existing whiteboard element behaviors (select, move, resize, delete, real-time sync). The emoji configuration is bundled as a TypeScript module imported at build time.

**Technical Approach**: Integrate an emoji picker React component into the whiteboard toolbar. When an emoji is selected and placed, generate Excalidraw-compatible JSON and paste it into the canvas as if the user had pasted content from an external application. This is a purely client-side operation with no GraphQL or API calls—the existing whiteboard collaborative sync handles persistence automatically.

## Technical Context

**Language/Version**: TypeScript 5.7, React 19
**Primary Dependencies**: `@alkemio/excalidraw`, `emoji-picker-react@4.4.7`, MUI
**Storage**: N/A - Emojis are pasted as standard Excalidraw elements; existing collaborative sync handles persistence
**Testing**: Vitest for unit tests, integration tests for picker interaction flows
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Web application (React SPA)
**Constraints**: Configuration bundled at build time; no API calls for emoji placement
**Scale/Scope**: Multi-user collaborative whiteboards, 10 default emojis (configurable via source)

## Constitution Check

_GATE: ✅ Pass - no violations identified_

### Domain Alignment (Principle I)

- **Affected Domain Context**: `src/domain/collaboration/whiteboard`
- **New Façade**: `src/domain/collaboration/whiteboard/emoji/` exposing:
  - `useEmojiConfiguration()` - loads bundled emoji config
  - `createEmojiElement()` - generates Excalidraw JSON for emoji text element
  - `emojiConfig.ts` - bundled TypeScript module with default emojis
- **Component Orchestration**: UI components (emoji picker button, picker popover) consume domain hooks only. The emoji element JSON generation lives in the domain façade; canvas integration uses Excalidraw's paste/clipboard APIs.

### React 19 Concurrency (Principle II)

- **Pure Rendering**: All new components are function-based, side-effect free except for dedicated effect hooks
- **No Legacy Patterns**: No class components, no deprecated lifecycles
- **Minimal State**: Picker open/closed state is local component state; no complex transitions needed

### GraphQL Contract (Principle III)

- **No GraphQL Changes**: This feature is entirely client-side
- **No API Calls**: Emoji placement uses Excalidraw's internal element creation/paste mechanism
- **Existing Sync**: Once emojis are added to the canvas, existing collaborative sync handles persistence automatically

### State & Effects (Principle IV)

- **State Sources**:
  - Emoji configuration: Static TypeScript module import (no runtime state)
  - Picker visibility: Local React component state
  - Placed emojis: Excalidraw scene state → handled by existing collaborative sync
- **Side Effect Isolation**: No side effects; emoji JSON is generated synchronously and passed to Excalidraw

### Experience Safeguards (Principle V)

- **Accessibility**:
  - Emoji picker keyboard navigable (Tab, Arrow keys, Enter/Space)
  - ARIA labels from emoji configuration `name` field
  - Focus management on picker open/close
  - Screen reader announcements for mode changes
- **Testing Evidence Required**:
  - Unit tests for `useEmojiConfiguration`, `createEmojiElement` functions
  - Integration tests for picker interaction flow
  - Manual accessibility testing (keyboard navigation, screen reader)

## Project Structure

### Documentation (this feature)

\`\`\`text
specs/003-whiteboard-emoji-reactions/
├── plan.md # This file
├── research.md # Phase 0: Library research, Excalidraw integration patterns
├── data-model.md # Phase 1: Emoji configuration schema, element structure
├── quickstart.md # Phase 1: Developer setup guide
├── contracts/ # Phase 1: Interface contracts
│ └── emoji-config.contract.ts
└── tasks.md # Phase 2 output (created by /speckit.tasks)
\`\`\`

### Source Code (repository root)

\`\`\`text
src/
├── domain/
│ └── collaboration/
│ └── whiteboard/
│ └── emoji/ # NEW: Domain façade
│ ├── emojiConfig.ts # Bundled default emoji configuration
│ ├── useEmojiConfiguration.ts # Hook to access emoji config
│ ├── createEmojiElement.ts # Generate Excalidraw JSON for emoji
│ └── types.ts # TypeScript interfaces
├── core/
│ └── ui/
│ └── forms/
│ └── emoji/
│ └── EmojiSelector.tsx # EXISTING: Reference for patterns
└── main/
└── [whiteboard routes] # Existing routing, no changes needed

# Whiteboard Component Integration Points

src/domain/common/whiteboard/excalidraw/
├── CollaborativeExcalidrawWrapper.tsx # MODIFY: Expose emoji controls via render prop; handle emoji cursor display
└── ExcalidrawWrapper.tsx # READ-ONLY: No changes (non-collaborative mode)

src/domain/collaboration/whiteboard/
├── WhiteboardDialog/
│ └── WhiteboardDialog.tsx # MODIFY: Forward emoji controls to CollaborativeExcalidrawWrapper via render props
├── WhiteboardsManagement/
│ └── WhiteboardView.tsx # READ-ONLY: No changes needed (emoji picker now in dialog content)
└── components/ # NEW: Whiteboard-specific components
└── WhiteboardEmojiReactionPicker.tsx # Emoji picker button + popover (floating in dialog content)

src/main/public/whiteboard/
└── PublicWhiteboardPage.tsx # READ-ONLY: No changes needed (emoji picker now in dialog content)
\`\`\`

**Structure Decision**: This feature follows the existing domain-driven structure:

- Domain logic in `src/domain/collaboration/whiteboard/emoji/` (new directory)
- Simple emoji picker component (no complex state management needed)
- Integrates with Excalidraw via paste/element creation APIs
- No new routes or main surfaces required

## Complexity Tracking

> No Constitution violations. Feature uses existing patterns and infrastructure.

| Area                 | Approach                                   | Rationale                                           |
| -------------------- | ------------------------------------------ | --------------------------------------------------- |
| Emoji Picker Library | Reuse existing `emoji-picker-react`        | Already installed, working integration exists       |
| Canvas Integration   | Generate Excalidraw JSON, paste as content | Simulates user paste; no direct API manipulation    |
| Configuration        | Bundled TypeScript module                  | Build-time inclusion, type-safe, no runtime loading |
| State Management     | Local component state only                 | Minimal complexity; no context providers needed     |

## Implementation Phases

### Phase 0: Research (Complete via research.md)

- Excalidraw element JSON structure for text elements
- Excalidraw paste/clipboard API integration
- Existing `EmojiSelector` patterns for reference
- Canvas coordinate mapping for placement position

### Phase 1: Foundation (Complete via data-model.md, contracts/)

- Define `EmojiConfigEntry` TypeScript interface
- Define default emoji set (10 emojis per spec)
- Define `createEmojiElement()` function signature
- Document Excalidraw JSON format for text elements

### Phase 2: Implementation (Complete via tasks.md)

1. Create emoji configuration module with types
2. Implement `useEmojiConfiguration` hook
3. Implement `createEmojiElement()` JSON generator
4. Create `WhiteboardEmojiPicker` component
5. Integrate picker with whiteboard toolbar
6. Handle canvas click for placement (paste emoji JSON)
7. Add keyboard accessibility
8. Write unit tests
9. Add i18n strings

### Phase 2.1: Bug Fixes (Complete)

1. **Coordinate Calculation Fix**: Replaced manual formula `(canvasX - scrollX) / zoom.value` with Excalidraw's `viewportCoordsToSceneCoords()` utility function - fixes emoji placement at all zoom levels (10%-400%)
2. **Picker State Reset Fix**: Added `emojiPlacementInfo` prop to `WhiteboardEmojiReactionPicker` with effect that resets internal state when parent signals placement complete

### Phase 2.2: UI Repositioning (Complete - 2026-01-05)

1. **Floating Button Layout**: Moved emoji picker from header toolbar to floating button in dialog content, positioned top-right below header
2. **Responsive Positioning**: Added mobile-responsive positioning using `useMediaQuery` - mobile: `top: 0, right: -16px`, desktop: `top: 16px, right: 0`
3. **Icon Color Standardization**: Changed icon color from `inherit` to `theme.palette.action.active` to match other toolbar icons
4. **Integration Point Change**: Moved emoji picker rendering from `WhiteboardView`/`PublicWhiteboardPage` to `CollaborativeExcalidrawWrapper` for centralized placement

## Exit Criteria

- [x] Emoji picker accessible as floating button in top-right of dialog content, below header (FR-001)
- [x] Emoji picker responsive: desktop (top: 16px, right: 0), mobile (top: 0, right: -16px)
- [x] Icon color matches other toolbar icons (theme.palette.action.active)
- [x] Placement mode with emoji character cursor following mouse position (FR-011)
- [x] Emojis placed as standard whiteboard content (FR-003, FR-004)
- [x] Configuration loads from bundled module (FR-006)
- [ ] Keyboard navigation functional (Accessibility)
- [x] Unit test coverage for configuration and element generation
- [ ] Integration test for placement flow
