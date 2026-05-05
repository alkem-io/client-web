# Implementation Plan: CRD Call to Action (Link) Framing Migration

**Branch**: `042-crd-space-page-<next>` | **Parent**: [../plan.md](../plan.md) | **Spec**: [./spec.md](./spec.md)

## Summary

Close the CTA read-path gap and fix the CTA write-path bug:

- **Feed-level preview** in `PostCard`: new `'callToAction'` `PostType` branch rendering a full-width primary-filled link button (MUI parity = `variant="contained" color="primary" fullWidth`) via the existing (to be hardened) `CalloutLinkAction` component. External links open in a new tab; a tooltip shows the URL and the external-link disclaimer. Invalid URIs render a disabled outline button.
- **Detail-dialog slot**: new `callToActionFramingSlot` on `CalloutDetailDialog`, wired through `CalloutDetailDialogConnector` via a new `CallToActionFramingConnector`.
- **Write-path fix**: `CalloutFormConnector` currently writes `framing.profile.referencesData` for `case Link`. Replace with `framing.link = { uri, profile: { displayName } }` — the field MUI uses and the CRD read path expects.

The scope is deliberately narrow. CTA is the smallest of the five framing types — one button, one URL, no contribution flow, no upload, no reorder, no lightbox. Most of the work is wiring plumbing that already exists for the other four.

## Component Inventory

### New in `src/crd/`

| Path | Role | Notes |
|---|---|---|
| `primitives/tooltip.tsx` | shadcn `tooltip` primitive | **Only if not already present.** Exports `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`. Port from the prototype recipe; swap `cn()` import to `@/crd/lib/utils`. Zero MUI. |

### Refinements to existing CRD files

- `components/callout/CalloutLinkAction.tsx` — harden the current stub for visual parity with MUI:
  - Primary-filled full-width button instead of `variant="outline"`.
  - Wrap in `Tooltip`; content = URI + external-link disclaimer when external.
  - `aria-label` on the `<a>` includes destination URL.
  - Invalid-URL branch renders a disabled outline button with an error label string — not just the plain displayName.
  - Props aligned to the mapper output: `{ url, displayName, isExternal, isValid, className? }`.
- `components/space/PostCard.tsx`:
  - `PostType` union gains `'callToAction'`.
  - `typeIcons['callToAction'] = Megaphone` (lucide-react).
  - `typeLabels['callToAction'] = 'callout.callToAction'`.
  - `PostCardData` gains `framingCallToAction?: { uri: string; displayName: string; isExternal: boolean; isValid: boolean }`.
  - New branch renders `<CalloutLinkAction …>` when `post.type === 'callToAction' && post.framingCallToAction`.
- `components/callout/CalloutDetailDialog.tsx`:
  - New prop `callToActionFramingSlot?: ReactNode`; rendered next to the other framing slots.

### New in `src/main/crdPages/space/callout/`

| Path | Role |
|---|---|
| `CallToActionFramingConnector.tsx` | Reads `callout.framing.link`, maps via `mapLinkToCallToActionProps`, renders `<CalloutLinkAction …>`. No Apollo queries, no state, no routing |
| `../dataMappers/callToActionDataMapper.ts` | Pure: `mapLinkToCallToActionProps(link) → { url, displayName, isExternal, isValid } \| undefined`. Wraps the `new URL(uri)` / `window.location.origin` logic so `CalloutLinkAction` stays host-agnostic |

### Refinements to existing integration

- `dataMappers/calloutDataMapper.ts`:
  - `mapFramingTypeToPostType` adds `CalloutFramingType.Link → 'callToAction'`.
  - `mapCalloutDetailsToPostCard` populates `framingCallToAction` via `mapLinkToCallToActionProps(callout.framing.link)` when the framing type is `Link`.
  - `mapCalloutLightToPostCard` **stays untouched** unless the light query already pulls `framing.link`; confirm during implementation. If not pulled, leave `framingCallToAction` undefined in the light branch — the PostCard will fall back to the title-only feed preview until the detail query loads.
- `callout/CalloutDetailDialogConnector.tsx`:
  - Add `hasCallToAction` + `callToActionFramingSlot`; pass into both `<CalloutDetailDialog>` render sites (with-comments + empty-comments branches).
- `callout/CalloutFormConnector.tsx` (**bug fix**):
  - Replace the `referencesData` branch with a `framing.link = { uri, profile: { displayName } }` assignment. Confirm `CalloutFramingCreateInput.link` matches via the codegen types; if the mutation input requires a different shape (e.g. id fields), adjust and re-verify against the MUI submit payload.

## Design Decisions

### CTA1: Reuse shadcn's `tooltip` primitive; port on first use
The CRD layer has no tooltip primitive yet (grep returns only MUI usages outside `src/crd/`). Port `tooltip.tsx` into `src/crd/primitives/` mirroring the prototype's recipe on first consumer — CTA is that consumer. Future uses (anywhere a hint-on-hover is wanted) reuse the same primitive.

### CTA2: Always render an `<a href>`; never navigate programmatically
MUI's `CalloutFramingLink` uses `navigate(uri)` for internal links so the SPA router handles them without a full reload. That behavior **cannot be replicated inside `src/crd/`** — the CRD rules forbid `react-router-dom` and `window.*` inside components. The pragmatic answer: always render `<a href={uri}>`. Internal links produce a full-page navigation rather than a router transition. Acceptable, because (a) CTAs by definition point to destinations that may leave the current page anyway, (b) the MUI form doesn't offer a "stay-in-router" hint, and (c) the user's intent when clicking a CTA is to *go somewhere*, not to swap a sub-view.

External-link detection (`isExternal`) still happens in the mapper — it drives `target="_blank"` + `rel="noopener noreferrer"` on the `<a>` and the `ExternalLink` icon in the label.

### CTA3: i18n namespace = `crd-space`
Follow the memo / media-gallery precedent. Keys live under `callToAction.*` in `src/crd/i18n/space/space.en.json`: `callToAction.externalLinkDisclaimer`, `callToAction.linkAriaLabel`, `callToAction.validation.invalidUrl`, plus a `callout.callToAction` label key that matches the `typeLabels` lookup. Add translations for all 6 supported languages (`en`, `nl`, `es`, `bg`, `de`, `fr`).

### CTA4: Icon = `Megaphone` for type indicator, `ExternalLink` for external badge
MUI uses `CampaignIcon` (megaphone-shaped) as the form-type icon and in the type metadata. The nearest lucide-react equivalent is `Megaphone`. Use it in `PostCard`'s `typeIcons['callToAction']`. The inline external-link indicator inside the button stays `ExternalLink` (already in the current stub). No need for a custom icon asset.

### CTA5: Write path fix is canonical — verify against codegen
The current CRD write path (`framing.profile.referencesData = [...]`) is wrong for two reasons:
1. `referencesData` on `Profile` is for Profile References (a separate feature entirely), not the CalloutFraming link.
2. The server's `CalloutFraming.link` field + the MUI Formik path (`framing.link.uri`, `framing.link.profile.displayName`) + the read side in CRD all agree that `framing.link` is the correct target.

The fix is a ~7-line change in `CalloutFormConnector`. Before landing, confirm the `CalloutFramingCreateInput.link` type by reading `src/core/apollo/generated/graphql-schema.ts` (search `CalloutFramingCreateInput`) and running the callout-create mutation via the network tab against a local backend. If the input type requires a `displayName` string vs a nested `profile.displayName` object, mirror whatever MUI's Formik payload emits.

### CTA6: Mapper owns validation + external detection; component is purely visual
`CalloutLinkAction` never calls `new URL()` or reads `window.location`. The mapper returns an `isValid` boolean and an `isExternal` boolean; the component just renders differently based on the flags. This keeps the CRD component layer free of any host-awareness — if someone later mounts `CalloutLinkAction` in a non-browser context (Storybook SSR, unit test), it still works.

### CTA7: No detail-dialog edit affordance
MUI does not offer inline CTA editing in the callout detail view. Editing is done via the callout edit form. Mirror that — no "Edit CTA" button inside the detail-dialog slot. Keeps the surface area minimal and parity with MUI exact.

### CTA8: Feed preview button navigates; card surface still opens detail dialog
The CTA button inside the feed card is a real `<a href>`. Clicking *the button* should go to the destination (new tab when external). Clicking *the rest of the card* should open the callout detail dialog. Implementation: the button stops propagation on its click (standard pattern — same trick `StackedAvatars` in `SpaceCard` uses for the parent-link inside a card-as-link). Tested to ensure keyboard `Enter` on the button triggers navigation, not the card click handler.

## Phased Implementation

| Phase | What ships | Effort |
|---|---|---|
| P0 | `primitives/tooltip.tsx` port (if not present) + data mapper + `PostType` / `PostCardData` / `typeIcons` / `typeLabels` additions | S |
| P1 | `CalloutLinkAction` hardening (primary-fill, tooltip, aria-label, invalid branch) + `PostCard` feed branch | S |
| P2 | `CallToActionFramingConnector` + `callToActionFramingSlot` in `CalloutDetailDialog` + `CalloutDetailDialogConnector` wiring | S |
| P3 | Write-path bug fix in `CalloutFormConnector` (replace `referencesData` with `framing.link`) + manual create-CTA smoke test against live backend | S |
| P4 | i18n keys (all 6 languages) + a11y pass (keyboard path, screen-reader labels, focus ring, disabled-invalid announcement) | S |
| P5 | Forbidden-import sweep, stub cleanup, parity QA side-by-side with MUI toggle OFF/ON | S |

Total: one focused session. No "M"-sized phases because there is no carousel / upload / reorder work.

## Complexity Tracking

| Risk | Mitigation |
|---|---|
| Tooltip primitive port introduces Radix dependency if not already present | `@radix-ui/react-tooltip` is the standard shadcn dep; verify it's already in `package.json` (it ships with several other shadcn primitives already in the codebase). If missing, add it. |
| Write-path fix might hit a codegen shape mismatch | Read `CalloutFramingCreateInput` in the generated schema before coding; reproduce the MUI create flow once with devtools network tab to capture the exact payload shape. |
| Light-query PostCard misses `framingCallToAction` | If the light query does not pull `framing.link`, the feed shows the title-only fallback until the details query loads. Acceptable for P2 parity — MUI has the same behavior (framing renderer needs the details query). Document explicitly in `mapCalloutLightToPostCard`. |
| Internal-link SPA routing regresses (CRD `<a href>` does full reload vs MUI `navigate()`) | Document as a known difference. Most CTAs point to external destinations; if UX asks for in-app router transitions later, revisit with a consumer-layer callback that the CRD button calls on same-origin URIs. |
| Tooltip conflicts with focus-visible ring on the button | Test keyboard path — `Tab` to focus the button, tooltip should render on focus too (shadcn default), focus ring stays visible. Adjust `TooltipContent`'s z-index only if it occludes the ring. |

## Open Items (resolved during implementation)

- **Exact button variant name**: confirm whether `src/crd/primitives/button.tsx` exposes `variant="default"` or another name for the primary-filled style. Update `CalloutLinkAction` accordingly.
- **`CalloutFramingCreateInput.link` shape**: confirm the expected nesting (`{ uri, profile: { displayName } }` vs `{ uri, displayName }`) via codegen before shipping the write-path fix.
- **Megaphone weight**: if `Megaphone` from lucide looks too heavy next to the other `typeIcons` (Presentation / StickyNote / Images / FileText), fall back to `Link` — the point is consistent iconography, not pedantic MUI parity.
