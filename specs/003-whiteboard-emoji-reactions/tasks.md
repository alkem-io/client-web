# Tasks: Whiteboard Emoji Reactions

**Input**: Design documents from `/specs/003-whiteboard-emoji-reactions/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: Unit tests are included per Constitution Principle V (Experience Safeguards).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Tags: `Domain` | `React19` | `Quality`

---

## Phase 1: Setup (Shared Infrastructure) ✅

**Purpose**: Create directory structure and foundational types for emoji reaction feature

- [x] T001 Create emojiReaction domain directory structure at `src/domain/collaboration/whiteboard/reactionEmoji/`
- [x] T002 [P] Create TypeScript types from contracts in `src/domain/collaboration/whiteboard/reactionEmoji/types.ts` `Domain`
- [x] T003 [P] Create default emojiReaction configuration in `src/domain/collaboration/whiteboard/reactionEmoji/emojiReactionConfig.ts` `Domain`

---

## Phase 2: Foundational (Blocking Prerequisites) ✅

**Purpose**: Core domain logic that MUST be complete before ANY user story UI can be implemented

**⚠️ CRITICAL**: No user story UI work can begin until this phase is complete

- [x] T004 Implement `createEmojiReactionElement()` function in `src/domain/collaboration/whiteboard/reactionEmoji/createEmojiReactionElement.ts` `Domain`
- [x] T005 [P] Implement `useEmojiReactionConfiguration()` hook in `src/domain/collaboration/whiteboard/reactionEmoji/useEmojiReactionConfiguration.ts` `Domain`
- [x] T006 [P] Unit test for `createEmojiReactionElement()` in `src/domain/collaboration/whiteboard/reactionEmoji/createEmojiReactionElement.test.ts` `Quality`
- [x] T007 [P] Unit test for `useEmojiReactionConfiguration()` in `src/domain/collaboration/whiteboard/reactionEmoji/useEmojiReactionConfiguration.test.ts` `Quality`
- [x] T008 [P] Unit test for emojiReaction configuration validation in `src/domain/collaboration/whiteboard/reactionEmoji/emojiReactionConfig.test.ts` `Quality`

**Checkpoint**: Domain façade ready - UI implementation can now begin ✅

---

## Phase 3: User Story 1 - Add Emoji to Whiteboard (Priority: P1) 🎯 MVP

**Goal**: Enable users to select an emoji from a picker and place it on the whiteboard canvas

**Independent Test**: Open any whiteboard with edit permissions → click emoji selector button → select emoji → click on canvas → verify emoji appears at click location

### Implementation for User Story 1

- [x] T009 [US1] Create `WhiteboardEmojiReactionPicker` component in `src/domain/collaboration/whiteboard/components/WhiteboardEmojiReactionPicker.tsx` `React19` `Domain`
- [x] T010 [US1] Create `EmojiReactionGrid` subcomponent for emoji button layout in `src/domain/collaboration/whiteboard/components/EmojiReactionGrid.tsx` `React19`
- [x] T011 [US1] Create `useEmojiReactionPickerState` hook for picker open/close/placement state in `src/domain/collaboration/whiteboard/reactionEmoji/useEmojiReactionPickerState.ts` `Domain`
- [x] T012 [US1] Integrate `WhiteboardEmojiReactionPicker` into `CollaborativeExcalidrawWrapper.tsx` - add toolbar button and picker popover `React19`
- [x] T013 [US1] Implement canvas click handler for emojiReaction placement - convert screen to scene coordinates and call `createEmojiReactionElement()` in `CollaborativeExcalidrawWrapper.tsx` `Domain`
- [x] T014 [US1] Add visual feedback for placement mode (cursor change, selected emoji indicator) in `CollaborativeExcalidrawWrapper.tsx` `Quality`
- [x] T015 [US1] Handle outside-canvas click to cancel placement mode in `CollaborativeExcalidrawWrapper.tsx`
- [x] T016 [US1] Disable emojiReaction picker button for read-only whiteboards in `CollaborativeExcalidrawWrapper.tsx` `Quality`
- [x] T017 [P] [US1] Add i18n strings for emojiReaction picker UI in `src/core/i18n/en/translation.en.json` `Quality`

**Checkpoint**: User Story 1 complete - users can select and place emojis on whiteboards ✅

---

## Phase 4: User Story 2 - Manipulate Emoji Content (Priority: P2)

**Goal**: Emojis behave like standard whiteboard elements (select, move, resize, delete)

**Independent Test**: Place an emoji → click on it → verify selection handles appear → drag to move → use resize handles → press delete key → verify emoji is removed

### Implementation for User Story 2

- [ ] T018 [US2] Verify emoji text elements support Excalidraw selection (no code changes expected - validation task)
- [ ] T019 [US2] Verify emoji text elements support move/drag operations (no code changes expected - validation task)
- [ ] T020 [US2] Verify emoji text elements support resize via handles (no code changes expected - validation task)
- [ ] T021 [US2] Verify emoji text elements support delete via keyboard and UI (no code changes expected - validation task)
- [ ] T022 [US2] Document any Excalidraw element behavior limitations in `specs/003-whiteboard-emoji-reactions/research.md` if found

**Checkpoint**: User Story 2 complete - emojis behave as first-class whiteboard content

---

## Phase 5: User Story 3 - Configurable Emoji Set (Priority: P3)

**Goal**: Developers can customize the emoji palette by editing the source configuration

**Independent Test**: Modify `emojiReactionConfig.ts` → rebuild → verify picker displays updated emoji set → verify empty config hides picker

### Implementation for User Story 3

- [ ] T023 [US3] Add validation in `useEmojiReactionConfiguration()` to return null for empty/invalid config in `src/domain/collaboration/whiteboard/reactionEmoji/useEmojiReactionConfiguration.ts` `Domain`
- [ ] T024 [US3] Update `WhiteboardEmojiReactionPicker` to conditionally render based on valid config (hide when null) in `src/domain/collaboration/whiteboard/components/WhiteboardEmojiReactionPicker.tsx` `React19`
- [ ] T025 [US3] Add inline documentation comments explaining configuration customization in `src/domain/collaboration/whiteboard/reactionEmoji/emojiReactionConfig.ts`
- [ ] T026 [P] [US3] Unit test for empty configuration handling in `src/domain/collaboration/whiteboard/reactionEmoji/useEmojiReactionConfiguration.test.ts` `Quality`

**Checkpoint**: User Story 3 complete - emoji set is developer-configurable

---

## Phase 6: User Story 4 - Emoji Picker Search and Categories (Priority: P4)

**Goal**: Users can search emojis and navigate by category

**Independent Test**: Open picker → type in search field → verify filtered results → click category tabs → verify category filtering

### Implementation for User Story 4

- [ ] T027 [US4] Add search input to `WhiteboardEmojiReactionPicker` component in `src/domain/collaboration/whiteboard/components/WhiteboardEmojiReactionPicker.tsx` `React19`
- [ ] T028 [US4] Implement emojiReaction filtering logic using keywords from configuration in `src/domain/collaboration/whiteboard/reactionEmoji/useEmojiReactionSearch.ts` `Domain`
- [ ] T029 [US4] Add category tabs to picker UI (group by category field) in `src/domain/collaboration/whiteboard/components/WhiteboardEmojiReactionPicker.tsx` `React19`
- [ ] T030 [US4] Display "no results" message when search yields no matches in `src/domain/collaboration/whiteboard/components/EmojiReactionGrid.tsx` `Quality`
- [ ] T031 [P] [US4] Add i18n strings for search placeholder and no results message in `src/core/i18n/en/translation.en.json` `Quality`
- [ ] T032 [P] [US4] Unit test for search/filter logic in `src/domain/collaboration/whiteboard/reactionEmoji/useEmojiReactionSearch.test.ts` `Quality`

**Checkpoint**: User Story 4 complete - emoji picker has search and category navigation

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, documentation, and final quality checks

- [ ] T033 [P] Add keyboard navigation to emojiReaction picker (Arrow keys, Enter, Escape) in `src/domain/collaboration/whiteboard/components/WhiteboardEmojiReactionPicker.tsx` `Quality`
- [ ] T034 [P] Add ARIA labels to all emoji buttons using name from config in `src/domain/collaboration/whiteboard/components/EmojiReactionGrid.tsx` `Quality`
- [ ] T035 [P] Add focus management - focus first emoji on open, return focus on close in `src/domain/collaboration/whiteboard/components/WhiteboardEmojiReactionPicker.tsx` `Quality`
- [ ] T036 [P] Add screen reader announcements for placement mode changes in `src/domain/collaboration/whiteboard/components/WhiteboardEmojiReactionPicker.tsx` `Quality`
- [ ] T037 [P] Integration test for emojiReaction placement flow in `src/domain/collaboration/whiteboard/reactionEmoji/WhiteboardEmojiReactionPicker.test.tsx` `Quality`
- [ ] T038 [P] Update quickstart.md testing checklist with actual test results in `specs/003-whiteboard-emoji-reactions/quickstart.md`
- [ ] T039 Run manual accessibility testing (keyboard navigation, screen reader) and document results `Quality`

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← BLOCKS all UI work
    ↓
Phase 3 (US1: Add Emoji) → MVP Complete! 🎯
    ↓
Phase 4 (US2: Manipulate) → Validation only
    ↓
Phase 5 (US3: Configurable) → Enhancement
    ↓
Phase 6 (US4: Search/Categories) → Enhancement
    ↓
Phase 7 (Polish) → Accessibility & final quality
```

### User Story Dependencies

| Story | Depends On | Can Start After |
|-------|------------|-----------------|
| US1 (Add Emoji) | Phase 2 complete | T008 |
| US2 (Manipulate) | US1 complete | T017 |
| US3 (Configurable) | Phase 2 complete | T008 (parallel with US1) |
| US4 (Search/Categories) | US1 complete | T017 |

### Within Each User Story

1. Domain hooks/functions before components
2. Core functionality before enhancements
3. UI implementation before accessibility polish
4. Tests can run in parallel with implementation

### Parallel Opportunities

**Phase 1 (all [P] tasks):**
```
T002 (types.ts) ↔ T003 (emojiReactionConfig.ts)
```

**Phase 2 (after T004):**
```
T005 (useEmojiReactionConfiguration) ↔ T006 (test createEmojiReactionElement) ↔ T007 (test hook) ↔ T008 (test config)
```

**Phase 3 (models before UI):**
```
T011 (useEmojiReactionPickerState) then T009, T010, T012-T016
T017 (i18n) ↔ any task
```

**Phase 7 (all [P] tasks):**
```
T033 ↔ T034 ↔ T035 ↔ T036 ↔ T037 ↔ T038
```

---

## Parallel Example: Phase 2

```bash
# After T004 (createEmojiReactionElement) completes, launch all in parallel:
T005: "Implement useEmojiReactionConfiguration hook"
T006: "Unit test for createEmojiReactionElement"
T007: "Unit test for useEmojiReactionConfiguration"
T008: "Unit test for emojiReaction configuration validation"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test emoji placement end-to-end
5. Deploy/demo - users can add emojis to whiteboards!

### Incremental Delivery

| Increment | Stories | Value Delivered |
|-----------|---------|-----------------|
| MVP | US1 | Users can place emojis on whiteboards |
| +US2 | US1+US2 | Emojis behave like native whiteboard content |
| +US3 | US1-US3 | Developers can customize emoji set |
| +US4 | US1-US4 | Full-featured picker with search/categories |
| +Polish | All | Accessible, keyboard-navigable, documented |

### Suggested MVP Scope

**MVP = Phase 1 + Phase 2 + Phase 3 (T001-T017)**

This delivers core value: users can select and place emojis on whiteboards. US2 validation confirms emojis work as expected with existing Excalidraw behaviors. US3/US4 are enhancements.

---

## Notes

- Client-side only - no GraphQL or API changes needed
- Emojis are standard Excalidraw text elements - leverage existing manipulation
- Existing collaborative sync handles persistence automatically
- Verify all tasks against Constitution principles before marking complete
- i18n: Only modify English translation file directly
