# Research: Subspace Sorting & Pinning

**Branch**: `017-subspace-sorting-pinning` | **Date**: 2026-03-06

## Decision 1: Drag-and-Drop Library

**Decision**: Use `@dnd-kit` (already in the project for the gallery) instead of `@hello-pangea/dnd`.

**Rationale**: `@dnd-kit` is already used in `CalloutFramingMediaGalleryField.tsx` for sortable grid items. It provides `DndContext`, `SortableContext`, `useSortable`, and supports both pointer and keyboard sensors. Using it for the new subspaces sorting aligns with the direction to migrate away from `@hello-pangea/dnd`.

**Alternatives considered**:

- `@hello-pangea/dnd`: Currently used in `SubspacesSortDialog`, `InnovationHubSpacesField`, `CalloutContributionsSortDialog`, and `InnovationFlowDragNDropEditor`. However, the user explicitly chose `@dnd-kit` for new work.

**Existing @dnd-kit pattern** (from `CalloutFramingMediaGalleryField.tsx`):

```typescript
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
```

## Decision 2: Sort Mode Dropdown Placement

**Decision**: Replace the existing "Reorder Subspaces" button in `SpaceAdminSubspacesPage` with a "Sort By" dropdown inline in the subspaces settings list header. The dropdown selects between "Alphabetical" and "Custom".

**Rationale**: The Figma design shows the "Sort By:" label and dropdown alongside the "Subspaces:" label in the settings list header. This replaces the separate sort dialog (`SubspacesSortDialog`) — sorting is now inline rather than in a modal.

**Alternatives considered**:

- Keep the sort dialog and add the dropdown separately. Rejected because the Figma design integrates sorting directly into the settings list, and inline drag-and-drop removes the need for a separate dialog.

## Decision 3: Pin Icon Component

**Decision**: Create a `SubspacePinIndicator` component reusing the same `PushPinOutlinedIcon` pattern from `HomeSpacePinButton.tsx`.

**Rationale**: The existing `HomeSpacePinButton` uses `PushPinOutlinedIcon` with a small `Paper` wrapper. The subspace pin indicator follows the same visual pattern but serves a different purpose (it's a toggle, not a link). For card views, it's passed as the `iconOverlay` prop on `SpaceCard` (same slot used by `HomeSpacePinButton` on recent spaces).

## Decision 4: Sorting Logic Location

**Decision**: Client-side sorting in a domain hook (`useSubspacesSorted`). The server returns `pinned`, `sortOrder`, and `sortMode` — the client applies the sorting logic.

**Rationale**: Per the server spec (FR-012): "The server MUST NOT enforce client-side sorting logic." The server only persists and returns data. The client is responsible for: pinned first (by sortOrder), then non-pinned by sortOrder (Custom) or name (Alphabetical).

## Decision 5: GraphQL Integration

**Decision**: Extend existing GraphQL documents to include the new `pinned` field on subspaces and `sortMode` on space settings. Add new mutation documents for `updateSubspacePinned` and extend `updateSpaceSettings` for `sortMode`.

**Rationale**: Follow the established pattern — `.graphql` files alongside domain features, codegen generates hooks. The server API shape is defined in `server/specs/041-subspace-sorting-pinning/contracts/schema-additions.graphql`.

**New server API surface**:

- `Space.pinned: Boolean!` — new field on Space type
- `SpaceSettings.sortMode: SpaceSortMode!` — new field (enum: ALPHABETICAL, CUSTOM)
- `updateSubspacePinned(pinnedData: UpdateSubspacePinnedInput!): Space!` — new mutation
- `UpdateSpaceSettingsEntityInput.sortMode: SpaceSortMode` — new optional field on existing input

## Decision 6: Settings List vs Sort Dialog

**Decision**: Migrate from `SubspacesSortDialog` (modal with `@hello-pangea/dnd`) to inline drag-and-drop directly in the settings subspaces list using `@dnd-kit`.

**Rationale**: The Figma design shows drag handles directly on the subspace rows in the settings list, not in a separate dialog. This provides a more direct editing experience. The sort mode dropdown controls whether all items or only pinned items are draggable.
