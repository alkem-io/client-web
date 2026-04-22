# CRD Call to Action (Link) Framing Migration

## Problem

Call to Action is one of Alkemio's five callout framing types (whiteboard, memo, poll, media gallery, call to action). It is the simplest of the five:

- Backed by a **single `Link`** object (not a list) — the GraphQL enum value is `CalloutFramingType.Link` (`'LINK'`), the field on `CalloutFraming` is `link?: { uri, profile: { displayName } }`, and the UI exposes it as "Call to Action".
- **Framing-only, no contribution type.** Members cannot "contribute" a CTA. The link is owned by the callout editor(s).
- Visually, it is just **one button**: displayName as label, URI as target, tooltip showing the full URL, external-link icon + `target="_blank"` when the origin differs from the current one.

Today the CTA is fully MUI on the read path and **partially migrated, incorrectly wired** on the CRD write path:

- **Read path (CRD)** — nothing. `CalloutFramingType.Link` falls through to `'text'` in `mapFramingTypeToPostType`; `PostCard` has no CTA branch; `CalloutDetailDialog` has no `callToActionFramingSlot`. The minimal `src/crd/components/callout/CalloutLinkAction.tsx` stub exists but is not imported anywhere.
- **Write path (CRD)** — the CRD callout form already exposes the CTA fields (`FramingEditorConnector` `case 'cta'` → `LinkFramingFields`, backed by `values.linkUrl` + `values.linkDisplayName` in `useCrdCalloutForm`), and `CalloutFormConnector`'s `ATTACHMENT_TO_FRAMING_TYPE` already maps `cta → CalloutFramingType.Link`. **But the submit branch writes the data to the wrong place**: `callout.framing.profile.referencesData = [...]` instead of `callout.framing.link = { uri, profile: { displayName } }`. MUI writes to `framing.link` via Formik `setFieldValue('framing.link.uri' | 'framing.link.profile.displayName', …)` and the read path in both MUI (`CalloutFramingLink`) and in the server's `CalloutFraming.link` field confirms that as the canonical shape. Callouts created through the CRD form today therefore save with an empty `framing.link` on the server.

This sub-spec migrates the full read path of Call to Action framing into CRD and fixes the write-path bug. Scope is intentionally narrow — CTA has no carousel, no lightbox, no upload, no reorder, no contribution flow. Mirrors the structure used for memo/media-gallery migrations at a much smaller surface area.

## Current MUI Implementation (reference)

| Concern | File | Role |
|---|---|---|
| Framing renderer | `src/domain/collaboration/callout/CalloutFramings/CalloutFramingLink.tsx` | Reads `callout.framing.link`, validates URI (`http`/`https` only), detects external vs internal by comparing `URL.origin` to `window.location.origin`, renders a full-width `<Button variant="contained">` with `OpenInNewIcon` when external, wraps in a `<Tooltip>` that shows the URI (and `externalLinkDisclaimer` for external), disabled-error fallback when the URI is invalid |
| Form field | `src/domain/collaboration/callout/CalloutForm/CalloutFormFramingSettings.tsx:272-291` | Two side-by-side inputs — `framing.link.profile.displayName` (70% width) + `framing.link.uri` (30% width). Both required. `handleLinkChange` (lines 160-166) calls `setFieldValue` on those exact paths; no custom URL validation beyond the Formik schema. Tooltip/label keys: `components.callout-creation.framing.link.{name,url,title,tooltip}` |
| Data model | `src/domain/collaboration/callout/models/CalloutDetailsModel.ts:32` — `link?: LinkDetails` | `LinkDetails = { id?: string; uri: string; profile: { displayName: string } }` |
| Framing-type enum | `src/core/apollo/generated/graphql-schema.ts:1181` | `CalloutFramingType.Link = 'LINK'` |
| Icon (MUI) | `src/domain/collaboration/callout/icons/calloutIcons.ts` | `[CalloutFramingType.Link]: CtaIcon` — `CampaignIcon` in the form-type option |

Key facts verified in the MUI layer:
- The button is **full-width** inside the framing slot's gutter.
- **External detection** is done at render time by comparing `new URL(uri).origin !== window.location.origin`. The tooltip shows `externalLinkDisclaimer` + the URI when external, just the URI when internal.
- URL validation accepts **only `http:` and `https:`**. Invalid URIs render a disabled `variant="outlined"` error button with `t('forms.validations.invalidUrl')`.
- The button **navigates programmatically** in the MUI version (`navigate(uri)` for internal, `window.open(uri, '_blank', 'noopener,noreferrer')` for external). The CRD port must instead render an `<a href>` and let the browser handle navigation — no `useNavigate`, no `window.open` from inside `src/crd/`.

## Solution

### Scope

- **Framing-only.** No contribution flow, no "+N more" grid, no lightbox, no editor dialog, no upload plumbing. One button, one tooltip, one URL.
- **Full read path** in CRD: `PostCard` feed preview renders the button inline; `CalloutDetailDialog` renders the button inside a new `callToActionFramingSlot`.
- **Write-path bug fix**: `CalloutFormConnector` must write to `callout.framing.link = { uri, profile: { displayName } }` instead of `callout.framing.profile.referencesData`. Verified against the MUI path and the GraphQL `CalloutFramingCreateInput.link` shape.
- **No schema / backend changes.**

The form field UI itself is already correct (`LinkFramingFields` + `FramingEditorConnector` `case 'cta'`) and stays as-is. The migration closes the read-path gap and fixes the write-path destination.

### Visual treatments

**Feed-level preview on `PostCard`** (new branch alongside whiteboard/memo/mediaGallery):
- When `post.type === 'callToAction'`, render a single `CalloutLinkAction` button below the description snippet, inside the same space the whiteboard thumbnail / memo preview / media gallery occupies. The button is the **full available width** of the framing slot, styled as a **primary-filled** button (matches MUI `variant="contained" color="primary"`) so it stands out as a clear action.
- The button is an `<a href={uri}>` — no programmatic navigation. `target="_blank"` + `rel="noopener noreferrer"` when `isExternal` is true. A `lucide-react` `ExternalLink` icon renders at the end of the label when external; no icon when internal.
- A tooltip (using the existing CRD `Tooltip` primitive — port from prototype if not yet present) wraps the button and shows the URI (and an `externalLinkDisclaimer` string for external links).
- Invalid URI (non-`http`/`https`) → render a disabled `variant="outline"` button with an error label `t('callToAction.validation.invalidUrl')` and no link target. Matches MUI parity.
- **Click target** is the link itself — clicking the CTA button **navigates directly to the URL** (new tab if external), it does **not** open the callout detail dialog. This matches MUI. The rest of the card (title, body) still opens the detail dialog on click.
- `PostCard` stays pure: `framingCallToAction: { uri: string; displayName: string; isExternal: boolean; isValid: boolean } | undefined` is mapped in from `callout.framing.link` by `mapCalloutDetailsToPostCard`. `PostCard` does not call `new URL()` or touch `window.location` — validation and external detection live in the mapper.

**Detail-level presentation inside `CalloutDetailDialog`** (new `callToActionFramingSlot`):
- Same `CalloutLinkAction` component, same full-width primary button, same tooltip and external-link treatment. Rendered inside its own framing slot alongside `whiteboardFramingSlot` / `memoFramingSlot` / `mediaGalleryFramingSlot`.
- No empty state. A CTA framing always has a link (the form requires it). If for some reason `callout.framing.link` is absent, the slot is `undefined` and no UI renders.
- No edit affordance inside the slot — editing the CTA is done via the existing callout edit form (the same path used for every other framing type).

### Integration layer

New file under `src/main/crdPages/space/callout/`:

- `CallToActionFramingConnector.tsx` — thin connector. Reads `callout.framing.link`, maps to `CalloutLinkAction` props via the mapper (below), renders `<CalloutLinkAction …>`. No Apollo queries — the data is already on the details model.

New mapper in `src/main/crdPages/space/dataMappers/`:

- `callToActionDataMapper.ts` — pure function `mapLinkToCallToActionProps(link: LinkDetails | undefined): CallToActionProps | undefined`:
  - Returns `undefined` when the link is missing / the uri is empty.
  - Validates `new URL(uri).protocol` — on throw or non-`http(s)`, returns `{ uri, displayName, isExternal: false, isValid: false }`.
  - Determines `isExternal` by comparing the parsed `origin` to `window.location.origin`.
  - Returns `{ uri, displayName, isExternal, isValid: true }` on success.

Updates to existing integration:

- `src/main/crdPages/space/dataMappers/calloutDataMapper.ts`:
  - `mapFramingTypeToPostType` adds `CalloutFramingType.Link → 'callToAction'`.
  - `mapCalloutDetailsToPostCard` populates `framingCallToAction` from `callout.framing.link` via the new mapper when the framing type is `Link`.
  - `mapCalloutLightToPostCard` **does not** populate `framingCallToAction` (the light query does not include `framing.link`). Confirm during implementation; if the light query already pulls the link (cheap), populate it there too.
- `src/main/crdPages/space/callout/CalloutDetailDialogConnector.tsx`:
  - Adds `const hasCallToAction = callout.framing.type === CalloutFramingType.Link && !!callout.framing.link;`
  - Adds `const callToActionFramingSlot = hasCallToAction ? <CallToActionFramingConnector callout={callout} /> : undefined;`
  - Passes the slot into both `<CalloutDetailDialog>` renders (with-comments and empty-comments branches).
- `src/main/crdPages/space/callout/CalloutFormConnector.tsx` (**bug fix**):
  - Replace the current `framing.profile.referencesData = [...]` write with:
    ```ts
    if (framingType === CalloutFramingType.Link && values.linkUrl) {
      callout.framing.link = {
        uri: values.linkUrl.trim(),
        profile: { displayName: values.linkDisplayName.trim() || values.linkUrl.trim() },
      };
    }
    ```
  - Verify the exact field name on `CalloutFramingCreateInput` matches (`link`) and adjust if codegen disagrees.

Updates to existing CRD:

- `src/crd/components/callout/CalloutLinkAction.tsx`:
  - Current stub uses `variant="outline"`. Change to a **primary-filled** variant (`variant="default"`, or whatever the project's primary button variant is — check `button.tsx`) and `w-full` so it matches MUI `variant="contained" color="primary" fullWidth`.
  - Wrap the button in a `Tooltip` (using `@/crd/primitives/tooltip`; port from prototype if not present). Tooltip content: the URI, plus `t('callToAction.externalLinkDisclaimer')` when external.
  - Add `aria-label` on the underlying `<a>` describing both the action and the destination (e.g. `t('callToAction.linkAriaLabel', { displayName, uri })`) — needed because the tooltip is pointer-only and screen readers need the URL context.
  - The invalid-URL fallback (disabled button) should use `variant="outline"` with a destructive border/text and render `t('callToAction.validation.invalidUrl')` — not just the raw displayName.
  - Props align with the mapper output: `{ url, displayName, isExternal, isValid, className? }`. Rename the current `isExternal: boolean` + `url: string` to the same shape the mapper emits so the connector is a straight prop forward.
- `src/crd/components/space/PostCard.tsx`:
  - `PostType` gains `'callToAction'`.
  - `typeIcons['callToAction'] = Megaphone` (or `Link` if `Megaphone` looks heavy — pick during implementation; note that MUI uses `CampaignIcon` which is a megaphone shape).
  - `typeLabels['callToAction'] = 'callout.callToAction'` (CRD namespace key).
  - `PostCardData` gains `framingCallToAction?: { uri: string; displayName: string; isExternal: boolean; isValid: boolean }`.
  - Add a branch `post.type === 'callToAction' && post.framingCallToAction` rendering `<CalloutLinkAction … />` in the framing area (same position as the whiteboard thumbnail / memo preview / media-gallery grid).
- `src/crd/components/callout/CalloutDetailDialog.tsx`:
  - Add `callToActionFramingSlot?: ReactNode` prop next to the other framing slots.
  - Render it in the same region as the others: `{callToActionFramingSlot && <div className="pt-2">{callToActionFramingSlot}</div>}`.

### Form field

**No new form field work.** `LinkFramingFields` + `FramingEditorConnector` `case 'cta'` + `useCrdCalloutForm`'s `linkUrl`/`linkDisplayName` state + validation is already in place. The only form-side change is the **write-path bug fix** in `CalloutFormConnector` described above.

Out of scope:
- **Multiple CTAs per framing.** The backend model is `link?: Link` (single). If/when the backend adds `callToActions: Link[]`, we revisit.
- **Custom CTA styles (color, icon picker).** MUI has none — CRD mirrors.
- **Inline / edit CTA from the detail dialog.** Editing goes through the callout edit form like every other framing.
- **Analytics / click tracking.** Could be layered later via a consumer wrapper; not part of this spec.
- **Internal-link smart routing.** MUI's `navigate(uri)` works because it runs inside a `<Router>`; CRD uses a plain `<a href>` for every link including internal ones (matches the "no programmatic navigation" rule). Internal navigation produces a full page load for a CTA — acceptable since the URI may escape the current router scope anyway.

## Open questions

Resolved during planning — see `plan.md`:

- **Tooltip primitive**: port shadcn's `tooltip` into `src/crd/primitives/tooltip.tsx` if not already present; otherwise reuse. Resolved in plan §CTA1.
- **Internal-link behavior**: always `<a href>`, no `useNavigate`. The CRD layer does not import routing. Resolved in plan §CTA2.
- **i18n namespace**: reuse `crd-space` (follows memo / media-gallery precedent). Resolved in plan §CTA3.
- **Icon choice**: `Megaphone` from `lucide-react` for the feed-level type indicator (matches MUI's `CampaignIcon`). External-link indicator next to the label stays `ExternalLink` (already in the stub). Resolved in plan §CTA4.
- **Write-path fix**: confirmed by cross-referencing MUI Formik paths + the CRD read side + the server `CalloutFraming.link` field. Resolved in plan §CTA5.

## Acceptance

- Toggle CRD on → open a Space containing a callout with `framing.type === Link` and a valid external URI (e.g. `https://example.com`) → `PostCard` renders a full-width primary button labelled with the link's displayName, an `ExternalLink` icon at the end, and tooltip on hover showing the external-link disclaimer + the URI. Clicking the button opens the URL in a new tab with `rel="noopener noreferrer"`. Clicking the rest of the card still opens the callout detail dialog.
- Same callout in the detail dialog → the same button renders inside the framing slot. The callout body / comments / contributions below still render normally.
- Internal URI (same origin as the current page) → no external-link icon, no disclaimer in the tooltip, the `<a>` has no `target="_blank"`. Clicking follows the link.
- Invalid URI (not `http`/`https`, or malformed) → a disabled outline button renders with `t('callToAction.validation.invalidUrl')` and no `href`. No tooltip disclaimer. Screen readers announce the disabled state.
- Create a new callout through the CRD form with attachment type `CTA`, fill displayName + URL, submit → the server receives `framing.link = { uri, profile: { displayName } }` (verified in the network tab against the GraphQL mutation), **not** `framing.profile.referencesData`. Reopening the callout shows the saved CTA.
- Keyboard path: focus the CTA button → `Enter` activates the link (new tab if external). `focus-visible:ring` indicator is visible. `aria-label` describes the action and the destination.
- Zero `@mui/*`, `@emotion/*` imports anywhere under `src/crd/`. No new imports of `react-router-dom`, `window.location`, `useNavigate`, or programmatic `window.open` inside `src/crd/`.
