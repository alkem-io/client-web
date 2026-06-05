# CRD Markdown Editor & Image Upload

How the CRD (shadcn/Tailwind) markdown editor is structured, how image/file upload is wired, and the
storage/`temporaryLocation` rules that decide whether an upload succeeds. Read this before adding a
markdown editor to a new CRD page or debugging a "the upload button is missing / errors" report.

---

## 1. Architecture

Two layers, with a strict boundary (per `src/crd/CLAUDE.md`):

### Presentational — `src/crd/forms/markdown/`

Pure UI. Knows nothing about Apollo, storage, or auth. Two editors, both accepting the same upload
contract:

- **`MarkdownEditor.tsx`** — single-user (non-collaborative). Used by most descriptions/forms.
- **`CollaborativeMarkdownEditor.tsx`** — multi-user (Yjs + Hocuspocus). Used by memos.

Supporting pieces:

- **`MarkdownToolbar.tsx`** → **`ToolbarImageDialog.tsx`** (image insert dialog) and
  **`ToolbarEmbedDialog.tsx`** (iframe embed dialog).
- **`sharedExtensions.ts`** — Tiptap extension list + the **paste/drop** image handler.
- **`useMarkdownEditorState.ts`** — editor lifecycle (markdown↔HTML, value sync).

#### The upload contract — `MarkdownUploadProps`

Exported once from `MarkdownEditor.tsx` and reused everywhere:

```ts
type MarkdownUploadProps = {
  onImageUpload?: (file: File) => Promise<string>; // resolves to a public URL
  iframeAllowedUrls?: string[];                     // allowed embed origins
  onError?: (message: string) => void;              // user-facing error
};
```

**Key rule:** the **upload affordance only exists when `onImageUpload` is provided.**
- `ToolbarImageDialog` renders the "Upload file" button only when `onImageUpload` is set
  (`ToolbarImageDialog.tsx` — the URL "add by link" field is **always** present).
- `sharedExtensions.buildCrdMarkdownExtensions` attaches the paste/drop handler only when
  `onImageUpload` is set.

So **omitting `onImageUpload` = "add image by link only, no upload"** (this is deliberate in some
flows — see §4).

#### Closure-capture note (`useMarkdownEditorState.ts`)

The Tiptap editor is created with `useEditor(config, [initialized])` — `editorProps` (including the
paste/drop handler) are **captured once** when the editor mounts and not re-bound. The toolbar button
reads the live prop on every render; paste/drop uses the captured closure. Consumers must therefore
ensure `onImageUpload` is stable/correct by the time the editor mounts (the integration hook reads the
bucket through React state, so this is normally fine once the storage query has resolved).

### Integration — `src/main/crdPages/markdown/`

- **`useMarkdownEditorIntegration(options)`** — the single source of truth. Resolves the storage
  bucket (from the ambient `StorageConfigContext` or an explicit `storageBucketId` override), wires
  the `uploadFileOnStorageBucket` mutation, and returns a ready-to-spread `MarkdownUploadProps`.
  Options: `{ temporaryLocation?: boolean; storageBucketId?: string }`.
- **`MarkdownUploadScope.tsx`** — render-prop wrapper that **mounts** a `StorageConfigContextProvider`
  and calls the hook inside it. For pages that have **no ambient** provider (User/Org/VC settings).

---

## 2. The three wiring patterns

| Pattern | When | How |
|---|---|---|
| **Direct hook** | The page sits under an **ambient** `StorageConfigContextProvider` (e.g. space routes via `CrdSpacePageLayout`). | Call `useMarkdownEditorIntegration()` in the connector/page and spread the result into the CRD editor. |
| **`MarkdownUploadScope`** | The page has **no ambient** provider, or the entity id resolves late. | Wrap the editor: `<MarkdownUploadScope storage={id ? { locationType, id } : undefined}>{md => <View {...md} />}</MarkdownUploadScope>`. `undefined` storage → no upload (graceful). |
| **Prop pass-through** | A CRD presentational component hosts an editor. | Add `& MarkdownUploadProps` to its props and forward `onImageUpload`/`iframeAllowedUrls`/`onError` to `<MarkdownEditor>`. The integration layer supplies them. |

**The hook must be called inside the provider.** If a page mounts the
`StorageConfigContextProvider` in its **own JSX** (not from an ancestor layout), the hook cannot be
called in that page's body — it would resolve no context. Use a small connector component rendered
*inside* the provider (see `CrdInnovationHubSettingsPage.tsx` → `InnovationHubAboutTabConnector`), or
`MarkdownUploadScope`.

---

## 3. Storage & `temporaryLocation` model

This is the part that decides whether an upload **succeeds**.

### Where the bucket comes from

`useMarkdownEditorIntegration` takes the bucket from the nearest `StorageConfigContext`. That context
is produced by `useStorageConfig` (`src/domain/storage/StorageBucket/useStorageConfig.tsx`) keyed by a
`locationType`:

`space` · `user` · `virtualContributor` · `organization` · `callout` · `post` · `template` ·
`innovationPack` · `innovationHub` · `platform` · `account`

Each resolves the entity's own `profile.storageBucket` (queries in
`src/domain/storage/StorageBucket/StorageConfig.graphql`), with a legacy fallback chain:

```
profile?.storageBucket
  ?? account.storageAggregator.directStorageBucket
  ?? platform.storageAggregator.directStorageBucket
```

`canUpload` is derived as `myPrivileges.includes(FileUpload)` on the resolved bucket. `temporaryLocation`
defaults to **`false`** in `useStorageConfig` — consumers set `true` explicitly when needed.

### `temporaryLocation`: create vs edit

| Flow | `temporaryLocation` | Bucket used | Why |
|---|---|---|---|
| **Edit** (entity exists) | `false` | the entity's own `profile.storageBucket` | Permanent home; the editor/owner has `FileUpload` there. |
| **Create** (entity not saved yet) | `true` | an **existing parent** bucket (e.g. the space) | The entity has no bucket yet. The doc is uploaded as *temporary* into a bucket the user can write to; the **server relocates** it to the new entity's bucket when the entity is saved. Mirrors the legacy MUI `temporaryLocation={!callout?.id}` rule (`src/domain/collaboration/callout/CalloutForm/CalloutForm.tsx`). |

### Why an upload fails (debugging checklist)

1. **No ambient provider** → `useMarkdownEditorIntegration`/`useStorageConfigContext` has no bucket
   (or throws "No StorageConfigContext provided"). Fix: add a provider or use `MarkdownUploadScope`.
2. **`onImageUpload` not passed** → no upload button / no paste (this is the Innovation Hub bug that
   §5 fixed; also the *intended* behavior in create flows below).
3. **Member lacks `FileUpload`** on the resolved bucket → server rejects with an auth error
   (`canUpload === false`).
4. **Bucket resolves to the not-yet-created entity's own bucket** in a create flow → there is nothing
   to upload to. Use `temporaryLocation: true` against an existing parent bucket instead.
5. **`temporaryLocation` unset in a create flow** → a non-temporary upload to a parent bucket the
   member can't permanently write to is rejected.

### Intentional omission (not a bug)

`CalloutFormConnector.tsx` passes `onImageUpload: undefined` **on create** so the description editor
offers only "add image by link" — matching legacy MUI, because the callout (and its bucket) doesn't
exist yet during creation. Upload returns on **edit**, scoped to the callout's own bucket via
`CalloutEditConnector` (`locationType="callout"`). Memo image upload targets the memo's own bucket via
an explicit `storageBucketId` override (`CrdMemoDialog.tsx`).

---

## 4. Consumer inventory

Whether each CRD markdown editor wires upload, and how.

| Consumer | Upload? | Pattern | Storage / `locationType` | Notes |
|---|---|---|---|---|
| `post/CrdPostContributionDialog.tsx` | edit only | direct hook | callout (create) / post (edit) | create hides upload (parity) |
| `memo/CrdMemoDialog.tsx` | yes | direct hook (`storageBucketId` override) | memo's own bucket | collaborative; `hideEmbedOption` |
| `space/callout/CalloutFormConnector.tsx` | edit only | direct hook | callout (edit) | create → "add by link" only |
| `space/timeline/CrdCalendarDialogConnector.tsx` | yes | direct hook | space | event description |
| `topLevelPages/spaceSettings/CrdSpaceSettingsPage.tsx` | yes | direct hook (`md` + `mdCreate`) | space | about / updates / guidelines |
| `topLevelPages/forum/ForumDiscussionFormConnector.tsx` | yes | direct hook | forum | |
| `innovationHub/CrdInnovationHubSettingsPage.tsx` | yes | connector inside own provider | innovationHub | fixed — see §5 |
| User / Org / VC profile + VC settings tabs | yes | `MarkdownUploadScope` | user / organization / virtualContributor | no ambient provider |
| `templates/*` (callout / post / CG / pack) | yes | prop pass-through | template / innovationPack | |
| `crd/forms/callout/MemoFramingEditor.tsx` | n/a | prop pass-through | — | text-only during callout create |

---

## 5. Recent fix: Innovation Hub description

`CrdInnovationHubSettingsPage.tsx` already mounts `<StorageConfigContextProvider locationType="innovationHub" …>`
but rendered `InnovationHubAboutTab` with **no** upload props, so the description editor had no upload.
Fixed by:

- `InnovationHubAboutTab` now accepts `& MarkdownUploadProps` and forwards them to `<MarkdownEditor>`.
- The page renders an `InnovationHubAboutTabConnector` **inside** its provider that calls
  `useMarkdownEditorIntegration()` (edit flow → default `temporaryLocation: false`, hub's own bucket).

---

## 6. SOLID / reuse review — backlog (not yet done)

The wiring works but has duplication worth consolidating later. **None of this is implemented yet —
it's a recorded plan.**

1. **~6 near-identical direct-hook call sites** (`CrdPostContributionDialog`, `CrdMemoDialog`,
   `CalloutFormConnector`, `CrdCalendarDialogConnector`, `CrdSpaceSettingsPage`,
   `ForumDiscussionFormConnector`) each call `useMarkdownEditorIntegration()` and re-derive the same
   create/edit `temporaryLocation` decision. **Proposal:** a create/edit-aware helper
   (e.g. `useMarkdownEditorIntegration({ mode })` deriving `temporaryLocation` from `mode`) so the
   rule lives in one place.
2. **Two seams for "call the hook inside a provider"** — `MarkdownUploadScope` (mounts its own
   provider) and the new `InnovationHubAboutTabConnector` (uses an ambient provider). **Proposal:** a
   single seam covering both "ambient" and "mount-my-own" cases, to standardize all consumers on one
   pattern.
3. **Error-notification reuse** — each call site relies on the hook's `onError` → `notify`. Already
   centralized in the hook; keep it there, don't re-implement per consumer.
4. **Closure-capture robustness** — if create-mode upload is ever re-enabled where the storage query
   resolves *after* the editor mounts, revisit the `[initialized]` capture in `useMarkdownEditorState`
   (see §1) so paste/drop reads the latest bucket.

When picking this up, do it as a dedicated refactor PR with the consumer table above as the migration
checklist.

---

## Related

- CRD layering rules: `src/crd/CLAUDE.md`
- Migration guide: `docs/crd/migration-guide.md`
- Storage config implementation: `src/domain/storage/StorageBucket/useStorageConfig.tsx`,
  `StorageConfig.graphql`
