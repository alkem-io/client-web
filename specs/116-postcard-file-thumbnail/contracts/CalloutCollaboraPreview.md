# Contract: `CalloutCollaboraPreview` (presentational)

**Location**: `src/crd/components/callout/CalloutCollaboraPreview.tsx`
**Layer**: CRD presentational (props-only). No MUI, no business logic, no GraphQL types, no router imports.
**Consumers**: `PostCard` (`size="compact"`, feed card), `CollaboraFramingConnector` (`size="default"`, post/callout detail dialog).

## Props

```ts
export type CollaboraDocumentPreviewType = 'text' | 'spreadsheet' | 'presentation'; // unchanged

type CalloutCollaboraPreviewProps = {
  documentType: CollaboraDocumentPreviewType;
  onOpen: () => void;
  onReplace?: () => void;
  /**
   * Real rendered preview image, when the backend eventually supplies one (no source
   * exists yet — always undefined in production, workspace story #9872 P3). When
   * present and loadable, replaces the type-icon treatment.
   */
  previewImageUrl?: string; // NEW
  size?: 'default' | 'compact';
  className?: string;
};
```

## Rendering contract

- Outer container: unchanged — `rounded-lg overflow-hidden border border-border
  bg-muted/30 relative`, `compact ? 'h-28' : 'aspect-video'`, `className` merged via
  `cn()`.
- Inner content area (`w-full h-full flex items-center justify-center bg-muted`):
  - **NEW** — when `previewImageUrl` is present and has not errored: `<img
    src={previewImageUrl} alt={typeLabel} className="w-full h-full object-cover"
    onError={() => setImageErrored(true)} />`.
  - Otherwise (today's only reachable production state): the type icon, **now colored**
    via `colorByType[documentType]` (`text-blue-600` / `text-green-600` /
    `text-orange-600`) instead of the previous flat `text-muted-foreground/50`; size
    unchanged (`compact ? 'w-8 h-8' : 'w-12 h-12'`); `aria-hidden="true"` unchanged
    (decorative — the badge below carries the accessible label).
- Top-right badge (`absolute top-3 right-3`): unchanged structure/position; the badge's
  `Icon` **now also** receives `colorByType[documentType]` (previously uncolored,
  inheriting `text-foreground`); badge background/border/text (`bg-background`,
  `border-border`, `text-foreground` for the label) are **unchanged** — only the icon
  color changes, per spec Clarifications (badge stays visually "quiet," only the icon
  glyph gets the accent).
- Hover overlay (`absolute inset-0 ... bg-primary/10 hover:bg-primary/20`), "Open
  Document" / "Replace file" buttons: **completely unchanged**.

## Behavioural guarantees

- BG-1: For each of the three `documentType` values, the centered fallback icon and the
  badge icon render with the same `colorByType` class as each other (never diverging).
- BG-2: When `previewImageUrl` is omitted (all production data today), the component
  renders identically to before this change except for the icon color (BG-1) — same DOM
  structure, same classes elsewhere, same behaviors.
- BG-3: When `previewImageUrl` is present and loads successfully, an `<img>` with
  non-empty `alt` text replaces the centered icon; the badge is unaffected.
- BG-4: When `previewImageUrl` is present but the `<img>` fires `onError`, the component
  falls back to the type-icon treatment (BG-1/BG-2) rather than a broken-image glyph.
- BG-5: `onReplace` presence/absence continues to gate the "Replace file" button exactly
  as before (no regression).
- BG-6: No network, navigation, logging, or localStorage access happens inside this
  component (all via props / handled by the integration layer) — `imageErrored` is the
  only local state, and it is purely visual.
- BG-7: `DRAWING`-derived documents (which map to `documentType: 'text'` upstream) render
  identically to `WORDPROCESSING`-derived documents — same icon, same blue color — by
  construction (both are the same `'text'` value at this component's boundary; no special
  case exists or is needed here).

## Test contract (`CalloutCollaboraPreview.test.tsx`)

1. Renders `documentType="text"` → badge text "Word Document" present; centered icon has
   `text-blue-600` in its class list; badge icon also has `text-blue-600`.
2. Renders `documentType="spreadsheet"` → badge text "Spreadsheet"; both icons
   `text-green-600`.
3. Renders `documentType="presentation"` → badge text "Presentation"; both icons
   `text-orange-600`.
4. Renders with `previewImageUrl="https://example.com/preview.png"` → an `<img>` with
   that `src` and non-empty `alt` is present; the centered fallback icon is absent.
5. Renders with `previewImageUrl` set, then fires the `<img>`'s `onError` → the `<img>`
   is removed and the type-icon fallback (per test 1–3) appears.
6. Renders without `previewImageUrl` → no `<img>` in the document; type-icon fallback
   present (regression: today's actual production state).
7. `onReplace` omitted → no "Replace file" button; `onReplace` provided → button present
   and calls the handler on click (regression, unchanged behavior).
8. `size="compact"` and `size="default"` both render without throwing, with their
   respective existing height/aspect classes (regression).
