# Suspense-teardown-destroys-state audit

**Date:** 2026-05-26
**Scope:** Whole `client-web` repo, static analysis only. **No code was modified.**
**Trigger:** The CRD public-whiteboard "blank canvas until a remote edit" bug
(`WhiteboardTemplatePickerButton` suspending late and tearing down the live Excalidraw).
This audit hunts for *other* instances of the same anti-pattern.

---

## TL;DR

After tracing every fragile-widget render site up to its nearest `<Suspense>` boundary and
checking each for a late-suspending sibling, **I found no additional unfixed High- or
Medium-confidence instances of the teardown bug.** The codebase is consistently defended by
three habits (see [Why the codebase is mostly safe](#why-the-codebase-is-mostly-safe)).

Two items are recorded as **Low / latent** — they are not live bugs today but are the cracks
through which this bug class would re-enter:

1. `CrdSingleUserWhiteboardDialog` has **no internal Suspense** around its top-level
   `useTranslation('crd-whiteboard')` — it relies on *every caller* wrapping it. All 3 current
   callers comply; a future caller that forgets is a latent regression.
2. The general structural caveat that a **self-bounded editor is not protected from a sibling
   that suspends to a shared *parent* boundary** (see [Structural caveat](#structural-caveat-low--informational)).

The canonical case and the markdown editors are already fixed; they are documented below as the
reference pattern.

---

## Suspense facts established

Source: `src/core/i18n/config.ts`.

- **react-i18next suspense mode is ON.** `i18n.init({...})` does **not** set
  `react.useSuspense`, so it defaults to `true`. Every `useTranslation(ns)` on a not-yet-loaded
  namespace **suspends** on first render.
- **Eager (never suspend):**
  - the default `translation` namespace for **English** (bundled into `resources.en`, `config.ts:260`);
  - `crd-layout` for **English** (eagerly imported + cached, `config.ts:6,204,261-264`).
- **Lazy (suspend on first use):** every namespace key in the `crdNamespaceImports` registry
  (`config.ts:53-198`), i.e. `crd-common`, `crd-exploreSpaces`, `crd-notifications`,
  `crd-dashboard`, `crd-space`, `crd-markdown`, `crd-search`, `crd-error`, `crd-spaceSettings`,
  `crd-community`, `crd-subspace`, `crd-whiteboard`, `crd-forum`, `crd-documentation`,
  `crd-profilePages`, `crd-templates`, `crd-contributorSettings` — plus `translation`/`crd-layout`
  for any **non-English** language. Once loaded for the active language, a namespace is cached
  (`translationCache`, `config.ts:201`) and never suspends again.
- **Other suspense sources:**
  - `useSuspenseQuery` / `React.use(promise)`: **no call sites in application code.** All
    `Apollo.useSuspenseQuery` hits are *definitions* inside the generated
    `src/core/apollo/generated/apollo-hooks.ts`; none are invoked anywhere in `src/`.
  - `React.lazy` / `lazyWithGlobalErrorHandler` rendered on the React render path: the
    Excalidraw component (`ExcalidrawWrapper.tsx:44`, `CollaborativeExcalidrawWrapper.tsx:37`) and
    the MediaGallery image viewer (`src/core/ui/gallery/MediaGallery.tsx:14`). Both wrap
    themselves in their own internal `<Suspense>`. The `lazyImportWithErrorHandler(() => import(...))`
    calls in `CrdSingleUserWhiteboardDialog.tsx:162,187`, `collab/Collab.ts:130`,
    `collab/Portal.ts:162` are awaited **inside async callbacks**, not on the render path — they
    do **not** trigger React Suspense.

### Inventory of fragile widgets (A)

| Widget | Where | State lost on unmount? |
|---|---|---|
| Excalidraw (`CollaborativeExcalidrawWrapper`, `ExcalidrawWrapper`) | `src/domain/common/whiteboard/excalidraw/` | **Yes — full** (`componentWillUnmount` resets the scene; collab-loaded elements gone). The canonical bug. |
| Collaborative tiptap (`CollaborativeMarkdownEditor`) | `src/crd/forms/markdown/` (memo) | **No** — content lives in the Yjs doc; remount re-syncs (the file says "a rebuild is non-lossy"). |
| Non-collab tiptap (`MarkdownEditor`) | `src/crd/forms/markdown/` (everywhere else) | **Soft** — content is mirrored to the parent form `value`; remount re-inits from it. Cursor/scroll/unflushed keystrokes can be lost, but typed text persists in `value`. |
| Collabora doc editor (`CollaboraDocumentEditor`, WOPI iframe) | rendered by `CollaboraFramingEditorOverlay.tsx` | **Yes** — iframe reloads, in-frame editing session restarts. |
| Media viewer (`react-image-gallery`) | `src/core/ui/gallery/MediaGallery.tsx` | Minor (viewer position). |

Excalidraw and the Collabora iframe are the only **hard-fragile** widgets. The two tiptap
variants externalize their state, so a teardown is at worst a flicker.

---

## The reference (already-fixed) case — study this

This is the shape every finding below is compared against.

- **Fragile widget:** `CollaborativeExcalidrawWrapper` rendered in
  `src/main/crdPages/whiteboard/CrdWhiteboardDialog.tsx:274` (the canvas, live once collab
  applies the room's elements).
- **Late suspender:** `WhiteboardTemplatePickerButton`, rendered as `titleExtra` gated on
  `editModeEnabled && mode === 'write'` (`CrdWhiteboardDialog.tsx:386`). `mode` flips to
  `'write'` **after** collab connects — i.e. after the canvas is already live.
- **Suspense source:** `TemplatePicker` → `useTranslation('crd-templates')` (lazy namespace not
  otherwise loaded on the public-whiteboard route, which only loads `crd-whiteboard`).
- **Shared boundary (before fix):** the page-level `<Suspense>` at
  `CrdPublicWhiteboardPage.tsx:199` (and `CrdWhiteboardView.tsx:72` for the in-space route).
- **Fix:** `WhiteboardTemplatePickerButton.tsx:52` wraps the picker in its **own**
  `<Suspense fallback={<Skeleton/>}>`, so the `crd-templates` fetch shows a local 8×28 skeleton
  instead of bubbling up and unmounting the canvas.
- **Sibling fix of the same class:** `MarkdownEditor.tsx:43` and
  `CollaborativeMarkdownEditor.tsx:32` each wrap their `crd-markdown` load in a local
  `<Suspense>` (comment at `CollaborativeMarkdownEditor.tsx:27-29` explicitly cites the
  "bubbles up to the page-level Suspense in CrdSpacePageLayout, hides the entire page" failure).

---

## Findings

### No additional High/Medium-confidence bugs

Ranked by where I looked hardest. Each row is a place that *looked* like it could match the
pattern, with why it does **not**.

| # | Location | Fragile widget | Candidate late suspender | Verdict | Why |
|---|---|---|---|---|---|
| 1 | `CrdWhiteboardView.tsx:97-121` headerActions → `ShareButton` | Excalidraw (in `CrdWhiteboardDialog`) under shared boundary `CrdWhiteboardView.tsx:72` | `ShareButton`/`ShareDialog` → `useTranslation('crd-common')` (lazy) | **Safe** | `ShareButton` is part of the **initial** chrome (not gated on a post-commit flip). It renders in the same pass as the canvas, so if `crd-common` is missing it suspends **before** the canvas commits → benign. The share-dialog body (`CrdWhiteboardGuestAccessControls`, `CrdCollaborationSettings`) opens late but uses the **eager** `translation` namespace (`CrdWhiteboardGuestAccessControls.tsx:28`, `CrdCollaborationSettings.tsx:34`). |
| 2 | `CrdPublicWhiteboardPage.tsx:220-226` headerActions → `ShareButton` | Excalidraw under `CrdPublicWhiteboardPage.tsx:199` | `crd-common` via `ShareButton` | **Safe** | Same as #1. `crd-whiteboard` is loaded at page top (`:29`); `crd-common` co-mounts with the initial chrome (suspends before canvas commit). The only *post-commit* late suspender on this page was the now-fixed `WhiteboardTemplatePickerButton`. |
| 3 | `CrdWhiteboardView.tsx:117` `collabState.mode === 'write' && <WhiteboardPreviewSettingsButton>` | Excalidraw under `:72` | `WhiteboardPreviewSettingsButton` | **Safe** | Genuinely a post-commit `mode==='write'` flip — but the button uses the **eager** `translation` namespace (`WhiteboardPreviewSettingsButton.tsx`), so it never suspends. |
| 4 | `FramingEditorConnector.tsx:224` `whiteboardEditorOpen && <CrdWhiteboardView>` (edit mode) | callout edit-form fields under the page boundary | `CrdWhiteboardView` mounted late with **no wrapping `<Suspense>`** here | **Safe** | Deliberate asymmetry with the create-mode branch (`:265`, which *does* wrap). `CrdWhiteboardView` is **self-contained**: its whole body is its own `<Suspense>` (`:72`) and it calls no suspending hook above it. Mounting it late bubbles nothing to the callout form. |
| 5 | `LazyCalloutItem.tsx:296-322` late dialogs (`CollaboraFramingEditorOverlay`, `CrdMemoDialog`, `CrdWhiteboardView`) | unsaved comment-input text in the feed `PostCard`s, under `CrdSpaceTabbedPages.tsx:20` / `CrdSpacePageLayout.tsx:153` | each dialog's top-level `useTranslation` | **Safe** | Every late dialog's top-level namespace is `crd-space` (`CollaboraFramingEditorOverlay.tsx:42`, `CrdMemoDialog.tsx:34`) — already loaded by `CrdSpacePageLayout.tsx:53` / `LazyCalloutItem.tsx:99` long before any dialog opens. The embedded editors (`CollaborativeMarkdownEditor`, `CrdWhiteboardDialog`) are each behind their own boundary. So nothing suspends to the feed boundary on open. |
| 6 | `CalloutShareOnAlkemioForm.tsx:41` (`crd-common`) as the Share-on-Alkemio slot | feed under page boundary | `crd-common` mounting on "Share on Alkemio" click (late flip) | **Safe** | The slot lives **inside** the CRD `ShareDialog` (`ShareDialog.tsx:43` calls `useTranslation('crd-common')`), which has therefore already loaded `crd-common` by the time the slot can be revealed. |
| 7 | `ResponseDefaultsConnector.tsx` (whiteboard slot + `TemplatePicker`) | Excalidraw via `CrdSingleUserWhiteboardDialog` | `TemplatePicker` (`crd-templates`) | **Safe** | `TemplatePicker` is mounted **unconditionally** (`:239`) from the connector's first render, so `crd-templates` loads early; the whiteboard dialog is wrapped in its own `<Suspense>` (`:189`). |
| 8 | `WhiteboardTemplateFormConnector.tsx` | Excalidraw via `CrdSingleUserWhiteboardDialog` | `crd-templates` (top, `:45`) + `crd-whiteboard` (dialog) | **Safe** | `crd-templates` at top; dialog wrapped in `<Suspense>` (`:65`); inner `WhiteboardTemplatePickerButton` self-bounded. |
| 9 | MUI `WhiteboardDialog.tsx` / `SingleUserWhiteboardDialog.tsx` | MUI Excalidraw | `WhiteboardDialogTemplatesLibrary` | **Safe** | Statically imported (not `React.lazy`), **always mounted** (the `mode==='write'` only flips a prop at `WhiteboardDialog.tsx:345`), and uses the **eager** `translation` namespace. Confirms the original "MUI was immune" claim. |
| 10 | Read-only previews `TemplateContentWhiteboardPreview.tsx:31`, `FormikWhiteboardPreview.tsx:133` | Excalidraw (view mode) | n/a | **Safe** | Not fragile — view-mode canvas re-initialises from `initialData` props on every mount, so a teardown loses nothing. |
| 11 | User / Org / VC settings, Forum, Timeline EventForm, Template forms, Space settings | `MarkdownEditor` (self-bounded) | `crd-templates` pickers / tab content | **Safe** (Explore sweep) | Each page loads its primary namespace at the top (`crd-contributorSettings` / `crd-spaceSettings` / `crd-forum` / `crd-space`); editors self-bound `crd-markdown`; the `crd-templates` pickers in space-settings render **unconditionally** so they load before any editor is live; tab routes have their own route-level `<Suspense>`. |

---

## Low / latent items (not live bugs)

### L1 — `CrdSingleUserWhiteboardDialog` relies on callers for its Suspense boundary

`src/main/crdPages/whiteboard/CrdSingleUserWhiteboardDialog.tsx:103` calls
`useTranslation('crd-whiteboard')` at the top level with **no internal `<Suspense>`** wrapping
itself (unlike `CrdWhiteboardView`, which wraps its body at `:72`). It therefore suspends to
**whatever boundary the caller provides**.

All three current callers correctly wrap it:

- `WhiteboardTemplateFormConnector.tsx:65`
- `FramingEditorConnector.tsx:265`
- `ResponseDefaultsConnector.tsx:189`

…and in each the dialog is rendered *unconditionally* (only `options.show` toggles), so
`crd-whiteboard` is loaded at form-mount and the local `<Suspense>` only ever flashes while the
dialog is closed. **No live bug.**

- **Risk:** a future caller that renders `CrdSingleUserWhiteboardDialog` **without** a wrapping
  `<Suspense>`, in a context where `crd-whiteboard` is not already loaded and a fragile widget is
  live under the nearest ancestor boundary, reintroduces the exact teardown bug.
- **Confidence:** Low (latent). **Impact:** High if it happens.
- **Recommended hardening (optional, for review):** give the dialog its own internal boundary so
  it is safe by construction, the way `CrdWhiteboardView` already is:

  ```tsx
  // CrdSingleUserWhiteboardDialog.tsx — wrap the render body
  return (
    <Suspense fallback={<Loading text={tWb('editor.loadingWhiteboard')} />}>
      {/* existing <Formik>…</Formik> + dialogs */}
    </Suspense>
  );
  ```

  Then the three call-site `<Suspense>` wrappers become redundant (can stay or be removed). This
  mirrors the asymmetry already in `FramingEditorConnector` (edit-mode `CrdWhiteboardView` needs
  no wrapper; create-mode `CrdSingleUserWhiteboardDialog` does) and removes the unwritten contract.

### Structural caveat (Low / informational)

A component wrapping its own suspending content in a local `<Suspense>` (as the editors do) is
protected from **its own** load and from **descendants inside** that boundary. It is **not**
protected from a **sibling outside** its boundary that suspends to a shared **parent** boundary —
that parent's fallback still unmounts the editor.

Today nothing triggers this, because the lazy namespaces in editor-hosting pages are always
loaded *early* (page-top `useTranslation`, or an unconditionally-mounted `TemplatePicker`). The
rule that keeps the app safe is therefore:

> **When you add a component that uses a lazy `crd-<feature>` namespace as a sibling of a live
> fragile widget, either (a) ensure that namespace is already loaded at the hosting page's top,
> or (b) wrap the new component in its own `<Suspense fallback={…}>` — mirror
> `WhiteboardTemplatePickerButton.tsx`.**

Worth adding to `src/crd/CLAUDE.md` so the next contributor doesn't reopen this hole.

---

## Why the codebase is mostly safe

Three consistent habits prevent the pattern almost everywhere:

1. **Primary namespace loaded at page top.** Page shells call `useTranslation('crd-<feature>')`
   at the top (`CrdSpacePageLayout.tsx:53` → `crd-space`/`crd-spaceSettings`, settings pages →
   `crd-contributorSettings`, etc.), so the namespace is resolved before any inner widget commits.
2. **Editors carry their own `<Suspense>`.** `MarkdownEditor`, `CollaborativeMarkdownEditor`, and
   `CrdWhiteboardView` each isolate their lazy load locally.
3. **Cross-namespace pickers mount unconditionally.** Where a different namespace is needed near a
   widget (`crd-templates` via `TemplatePicker`), it is mounted from the first render rather than
   on a state flip, so it loads before anything is live.

The one route where all three failed at once was the public whiteboard page — minimal route,
`crd-whiteboard` loaded but `crd-templates` not, and `TemplatePicker` mounted on the `mode==='write'`
flip — which is exactly the bug that prompted this audit, now fixed.

---

## What was checked (for reproducibility)

- `rg "useTranslation\('crd-"` across `src` → mapped every lazy-namespace call site (135 ×
  `crd-space`, 34 × `crd-templates`, 32 × `crd-spaceSettings`, … 1 × `crd-community`).
- `rg "useSuspenseQuery|\buse\("` → confirmed **no** suspense-query/`use(promise)` call sites in
  app code.
- `rg "<Suspense"` → enumerated every boundary; classified as routing / layout / editor-local /
  connector / misc.
- Enumerated **every** Excalidraw render site (`CrdWhiteboardDialog`, `CrdSingleUserWhiteboardDialog`,
  MUI `WhiteboardDialog`/`SingleUserWhiteboardDialog`, `TemplateContentWhiteboardPreview`,
  `FormikWhiteboardPreview`) and walked each up to its nearest boundary.
- Enumerated every `TemplatePicker` render site and every `useTranslation('crd-templates')`
  consumer (the namespace from the original bug) and checked for late mounts near fragile widgets.
- Read the full whiteboard cluster, the markdown-editor cluster, the space/callout cluster
  (`LazyCalloutItem`, `FramingEditorConnector`, `ResponseDefaultsConnector`,
  `CollaboraFramingEditorOverlay`, `CrdMemoDialog`), and verified the three
  `CrdSingleUserWhiteboardDialog` callers all provide a `<Suspense>`.
- Swept user/org/VC settings, forum, timeline, template forms, and space-settings pages for the
  pattern (no matches).
