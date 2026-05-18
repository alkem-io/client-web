# Phase 1 Data Model — CRD Templates System

This is a **frontend re-skin**: no new persisted entities, no new GraphQL *documents*. The only data-layer changes are additive `.graphql` *fragment* edits (+ `pnpm codegen` + committed schema diffs) — V1 Collabora-document framing and V2 poll framing on `CalloutTemplateContent`, V5 the `title` field on `CommunityGuidelinesTemplateContent`, conditionally V3 the delete-cascade data — verified server-side first (see plan.md "Open verifications"). The "data model" here is (a) the existing GraphQL entities the CRD surfaces read/write (for reference), and (b) the **plain-TS prop shapes** the CRD components consume — produced by mappers under `src/main/crdPages/`. CRD components never see GraphQL types (`src/crd/CLAUDE.md` Rule 4).

Legend: *GraphQL* = existing generated type (read-only reference); *CRD prop* = new plain-TS type defined in `contracts/`.

---

## A. Existing GraphQL entities (reference only — unchanged)

### Template *(GraphQL)*
- `id`, `type: TemplateType` (`CALLOUT | WHITEBOARD | POST | SPACE | COMMUNITY_GUIDELINES`)
- `profile`: `{ id, displayName, description, tagset, visual (banner/card), url }`
- Type-specific content (fetched lazily, conditionally, via `TemplateContent`):
  - **Callout**: `callout.framing` (`type: CalloutFramingType`, plus `whiteboard` / `memo` / `link` / `mediaGallery` content depending on kind — and **collabora-document** / **poll** content, added to the `CalloutTemplateContent` fragment in-PR per V1/V2), `callout.settings.contribution` (`allowedTypes`, comment settings), `callout.contributionDefaults` (`postDescription`, `whiteboardContent`)
  - **Whiteboard**: `whiteboard.{ id, content, previewSettings }`
  - **Post**: `postDefaultDescription`
  - **Space**: `contentSpace` → `{ innovationFlow.states[], collaboration.callouts[], subspaces[] (each a nested space-template-like structure), about, settings }`
  - **Community Guidelines**: `profile.displayName` (the guidelines **title**), `profile.description` (the guidelines body markdown), `profile.references[]` (`{ id, name, uri, description }`), + auth — i.e. a community-guidelines content carries a distinct *title* in addition to the body and the references (the CRD content/form shapes below reflect this)
- Belongs to exactly one **TemplatesSet**.

### TemplatesSet *(GraphQL)*
- `id`
- `calloutTemplates[]`, `whiteboardTemplates[]`, `postTemplates[]`, `spaceTemplates[]`, `communityGuidelinesTemplates[]`
- Owned by a holder (a Space's TemplatesManager, or an InnovationPack).

### TemplatesManager *(GraphQL)* — a Space's wrapper
- `id`, `templatesSet: TemplatesSet`, `templateDefaults: TemplateDefault[]`

### TemplateDefault *(GraphQL)*
- `id`, `type` (which default this is — e.g. the default subspace/content template), `allowedTemplateType: TemplateType`, `template?: Template`

### InnovationPack *(GraphQL)*
- `id`, `nameID`
- `profile`: `{ id, displayName, description, tagline?, avatar?/visual?, tagset, url, references[] }`
- `provider`: an Organization (`{ id, nameID, profile.{ displayName, avatar, url } }`)
- `listedInStore: boolean`, `searchVisibility: SearchVisibility`
- `templatesSet: TemplatesSet`
- `account?` — for account-owned packs (the Account that owns it)

### Platform → Library *(GraphQL)*
- `library.templates(filter: { types: [TemplateType!] })`: `[ { template: Template, innovationPack: InnovationPack } ]`
- `library.innovationPacks`: `[InnovationPack]` (store-listed)

### Account *(GraphQL)*
- `id`, `innovationPacks[]` — the source of the picker's "Account templates" section (union of `account.innovationPacks[*].templatesSet.*Templates`)

---

## B. CRD prop shapes (new — `contracts/`)

### `TemplateType` *(CRD prop — string union, not the GraphQL enum)*
```
type TemplateType = 'space' | 'callout' | 'whiteboard' | 'post' | 'communityGuidelines';
```
> Mapper: GraphQL `TemplateType.Callout` → `'callout'`, etc. The CRD UI label for `'callout'` in a *holder* context is "Collaboration tool"; the label is an i18n concern in the CRD component, the value stays `'callout'`.

### `TemplateCardData` *(CRD prop)*
The minimal shape every template card needs (holder list, picker, library gallery, preview header):
```
type TemplateCardData = {
  id: string;
  type: TemplateType;
  name: string;            // profile.displayName
  description: string;     // profile.description ?? ''
  tags: string[];          // profile.tagset?.tags ?? []
  bannerUrl?: string;      // profile.visual?.uri || undefined  — undefined → component renders pickColorFromId gradient
  color: string;           // pickColorFromId(template.id) — banner/avatar fallback
  url?: string;            // profile.url — for "open detail" links in the library/profile contexts
  ownerLabel?: string;     // e.g. owning pack name ("by Design Systems Pack") — only set in library/account contexts
};
```
Validation: `name` non-empty; `type` is one of the five values. Produced by `templateCardMapper.ts`.

### `TemplateCategorySection` *(CRD prop)*
```
type TemplateCategorySection = {
  type: TemplateType;
  templates: TemplateCardData[];
};
```
Order is fixed in the CRD component (Space → Callout → Whiteboard → Post → CommunityGuidelines). Produced by `templatesManagerMapper.ts` from a `TemplatesSet`.

### `FramingKind` *(CRD prop — reuse the existing CRD callout-layer union, do not invent a parallel one)*
The Callout template form reuses the existing CRD callout-authoring connectors, whose framing-kind type is `FramingChip` (defined in `src/crd/forms/callout/types.ts`):
```
type FramingKind = 'none' | 'whiteboard' | 'memo' | 'document' | 'cta' | 'image' | 'poll';
//  'none'     ⇄ CalloutFramingType.None              (plain-text framing)
//  'document' ⇄ CalloutFramingType.CollaboraDocument (the Collabora-document kind, FR-020/FR-030 — V1: extend the fragment)
//  'cta'      ⇄ CalloutFramingType.Link
//  'image'    ⇄ CalloutFramingType.MediaGallery
//  'poll'     ⇄ CalloutFramingType.Poll              (in scope, FR-020/FR-030 — V2: extend the `CalloutTemplateContent` fragment in-PR to carry poll framing content; previewed read-only)
```
`TemplateContent` and `TemplateFormValues` (below) use this `FramingKind`, not a hand-rolled one — `types.ts` (T003) re-exports it from `src/crd/forms/callout/types.ts` rather than redefining it.

### `TemplateContent` *(CRD prop — discriminated union)*
The fully-loaded, render-ready content shown in the preview dialog / picker preview pane. Produced by `templateContentMapper.ts` from the lazy `TemplateContent` query result.
```
type TemplateContent =
  | { type: 'callout';
      framingKind: FramingKind;
      framingTitle: string;
      framingDescription: string;          // markdown
      framingWhiteboardContent?: string;   // when framingKind === 'whiteboard'
      framingMemoContent?: string;         // when framingKind === 'memo' (markdown)
      framingCollaboraDoc?: { displayName: string; documentType?: string };  // when framingKind === 'document' (read-only title/placeholder; the live service is not embedded in a preview)
      framingLinks?: { name: string; uri: string }[];   // when framingKind === 'cta'
      framingMediaImages?: { uri: string; alt?: string }[];  // when framingKind === 'image'
      framingPoll?: { question: string; options?: string[] };  // when framingKind === 'poll' — in scope (FR-020/FR-030); rendered read-only in the preview
      framingWhiteboardPreviewImageUrl?: string;  // when framingKind === 'whiteboard' — the server-rendered preview Visual (`framing.whiteboard.profile.preview.uri`); the Callout-framing preview surface (and any form using the inline framing preview) renders it as an `<img>` instead of the literal "Whiteboard" placeholder. D16, 2026-05-18. Mirrors the existing field on the `type: 'whiteboard'` branch (`previewImageUrl`).
      allowedContributionTypes: ('post' | 'whiteboard' | 'link')[];  // mirrors GraphQL `settings.contribution.allowedTypes`. **Drives the response-type chip selection on its own** (D14, 2026-05-18) — never AND-gated on `enabled` or `canAddContributions` in any mapper / renderer.
      commentsEnabled: boolean;
      defaultPostDescription?: string;     // markdown
      defaultWhiteboardContent?: string; }
  | { type: 'whiteboard';
      whiteboardContent: string;           // Excalidraw JSON
      previewImageUrl?: string; }
  | { type: 'post';
      defaultDescription: string; }        // markdown
  | { type: 'space';
      phases: { name: string; description?: string }[];   // innovation-flow states
      starterCallouts: { name: string; framingKind: FramingKind }[];
      subspaceTemplates: { name: string }[]; }            // nested
  | { type: 'communityGuidelines';
      title: string;                       // the guidelines' displayName (a distinct field — see §A; V5)
      guidelinesMarkdown: string;
      references: { id: string; name: string; uri: string; description?: string }[]; };
```
> Any markdown string in this union MUST be rendered via `MarkdownContent`/`InlineMarkdown`, never as plain text (`src/crd/CLAUDE.md` Rule 10).

### `TemplateFormValues` *(CRD prop — discriminated union; create & edit)*
The editable shape the per-type create/edit forms own (form state lives in the integration layer; the CRD form component is controlled via `value`/`onChange`/`errors`). Shares the **common** part:
```
type TemplateCommonValues = {
  name: string;            // required
  description: string;
  tags: string[];
  bannerFile?: File;       // optional new banner upload
};
type TemplateFormValues =
  | (TemplateCommonValues & { type: 'callout';
      // mirrors the existing CRD callout-authoring connectors' value shape (FramingChip + per-kind content),
      // not a bespoke set of fields — the Callout template form reuses those connectors. Covers every
      // framing kind incl. 'document' (Collabora) and 'poll'.
      //
      // NOTE — **two distinct tag sets in a Callout template** (FR-020):
      //   (a) the *template's* tags — live on `TemplateCommonValues.tags` (above), rendered by the
      //       dialog shell (`TemplateFormDialog`). These are the tags users see when browsing the
      //       template gallery.
      //   (b) the *captured callout's* tags — live on `useCrdCalloutForm.values.tags`, rendered
      //       inside the Callout-template *body slot* (`CalloutTemplateForm` Zone 3). These are the
      //       tags applied to every callout created from this template. Both are persisted; the
      //       integration layer (`useTemplateForms`/`calloutFormMapper`) maps them to the right
      //       fields (template profile tagset vs. callout framing tagset).
      //   Only Callout templates carry (b); Whiteboard / Post / Space / Community Guidelines
      //   templates have only the template-level tag set (a).
      framingKind: FramingKind; framingTitle; framingDescription;
      framingWhiteboardContent?; framingMemoContent?; framingCollaboraDoc?; framingLinks?; framingMediaFiles?; framingPoll?;
      // Server-rendered whiteboard preview image (`framing.whiteboard.profile.preview.uri`), set on
      // edit-prefill when framingKind === 'whiteboard'. Display-only — never sent back to the server;
      // the inline whiteboard preview shows it as the read-time fallback when no fresh in-form blob
      // exists (D16, 2026-05-18). Fresh `whiteboardPreviewImages` blobs (generated when the user
      // re-opens the inline editor and saves) override this URL.
      framingWhiteboardPreviewServerUrl?: string;
      allowedContributionTypes; commentsEnabled;
      defaultPostDescription?; defaultWhiteboardContent?; })
  | (TemplateCommonValues & { type: 'whiteboard'; whiteboardContent: string;
      // full preview-settings, not just an image: the crop/region the live whiteboard editor's PreviewSettingsDialog/PreviewCropDialog produce
      previewSettings?: WhiteboardPreviewSettings; previewImageFile?: File })
  | (TemplateCommonValues & { type: 'post'; defaultDescription: string })
  | (TemplateCommonValues & { type: 'space'; sourceSpaceId?: string; recursive: boolean })   // authored by copying a space/subspace
  | (TemplateCommonValues & { type: 'communityGuidelines'; title: string; guidelinesMarkdown: string; references: { id?: string; name: string; uri: string; description?: string }[] });
```
Validation rules (FR-021): `name` non-empty for every type; reference rows require `name` + `uri`; `space` requires a `sourceSpaceId` to create (on edit it may be re-selected to re-capture); `communityGuidelines` requires a non-empty `title`. The integration layer maps these to the existing mutation inputs via the legacy `Forms/common/mappings.ts` logic (re-used as a pure-function module — it has no MUI dependency) plus image uploads.

### `TemplatePickerSource` & picker props *(CRD prop)*
```
type TemplatePickerSource = {
  key: 'space' | 'account' | 'platform';
  label: string;                          // i18n'd by the CRD component? no — label key is in crd-templates ns
  templates: TemplateCardData[];          // already filtered to the allowed type(s)
};
type TemplatePickerProps =
  | { mode: 'import';
      open: boolean; onClose(): void;
      sources: TemplatePickerSource[];
      alreadyInSet: Set<string>;          // template ids already present in the destination set
      onImport(templateId: string): void; // adds a copy; dialog stays open
      onRemoveFromSet(templateId: string): void;
      onPreview(templateId: string): void;
      previewContent?: TemplateContent | undefined;  // undefined while loading
      previewLoading: boolean;
      loading: boolean; }
  | { mode: 'select';
      open: boolean; onClose(): void;
      sources: TemplatePickerSource[];
      allowedTypes: TemplateType[];
      selectedId?: string;
      onSelect(templateId: string | null): void;     // null = clear / "no template"
      onPreview(templateId: string): void;
      previewContent?: TemplateContent | undefined;
      previewLoading: boolean;
      loading: boolean; };
```

### `TemplatesManagerViewProps` *(CRD prop)*
```
type TemplateAction = 'preview' | 'edit' | 'duplicate' | 'delete';
type TemplatesManagerViewProps = {
  holderKind: 'space' | 'innovationPack';
  categories: TemplateCategorySection[];
  loading?: boolean;
  duplicatingId?: string | null;          // per-row "Creating…" spinner
  deletingId?: string | null;             // per-row "Deleting…" spinner
  canCreate(type: TemplateType): boolean;
  canEdit(type: TemplateType): boolean;
  canDelete(type: TemplateType): boolean;
  canImport(type: TemplateType): boolean; // consumer wires `false` for innovationPack
  onCreate(type: TemplateType): void;
  onImport(type: TemplateType): void;
  onTemplateAction(id: string, action: TemplateAction): void;
  className?: string;
};
```
Section visibility (FR-015): a `type`'s section renders when `categories[type].templates.length > 0 || canCreate(type) || canImport(type)`; otherwise it's omitted. Empty-but-addable sections render an empty state with the add affordance(s).

### Innovation Pack CRD props
```
type InnovationPackCardData = {
  id: string; name: string; description: string; tags: string[];
  bannerUrl?: string; color: string;            // pickColorFromId(pack.id)
  templateCount: number; url: string;
  providerName?: string; providerAvatarUrl?: string;
};
// Edit form (on the pack admin screen). Provider is NOT here — it's the account's host org, shown read-only by the view.
// Creation collects only { name, description } (mirroring the legacy CreateInnovationPackDialog).
type InnovationPackFormValues = {
  name: string;                                 // required (= profile.displayName)
  description: string;
  tags: string[];
  avatarFile?: File;
  references: { id?: string; name: string; uri: string; description?: string }[];
  listedInStore: boolean;
  searchVisibility: 'public' | 'authenticated' | 'account';   // mirrors SearchVisibility enum, mapped to a string union
};
type InnovationPackProfileViewProps = {
  pack: InnovationPackCardData & { references: { id: string; name: string; uri: string; description?: string }[] };
  templates: TemplateCategorySection[];          // read-only listing
  canManage: boolean;                            // shows the "Manage pack" entry point
  adminHref?: string;
  onTemplatePreview(id: string): void;
  // (no create/edit/delete/import callbacks — read-only profile)
};
type InnovationPackAdminViewProps = {
  form: InnovationPackFormValues; onFormChange(v): void; formErrors: ...; onSaveForm(): void; savingForm: boolean;
  providerName: string;                          // displayed read-only (the owning account's host org); no picker — matches the legacy InnovationPackForm
  templatesManager: TemplatesManagerViewProps;   // holderKind='innovationPack', canImport(*)=false
  // NO onDeletePack — pack deletion lives in the Account-tab pack-card three-dot menu (FR-042), not here.
};
```

### Innovation Library CRD props
```
type InnovationLibraryViewProps = {
  packs: InnovationPackCardData[];
  templates: TemplateCardData[];                 // all platform templates (union across listed packs)
  activeTypeFilter: TemplateType[] | 'all';
  onChangeTypeFilter(f: TemplateType[] | 'all'): void;
  onTemplatePreview(id: string): void;
  previewContent?: TemplateContent | undefined;
  previewLoading: boolean;
  loading?: boolean;
  // pack cards link via href; template cards open the preview (and may link to a detail url)
};
```

### Community-guidelines editor (FR-038) — host shape *(CRD prop)*
The CRD community-guidelines editor this feature delivers (the host for FR-034's apply / save-as flows; supersedes `045`'s markdown-only stub). Presentational; data + mutation in the integration layer (`useUpdateCommunityGuidelines`).
```
type CommunityGuidelinesEditorValue = {
  title: string;                         // the guidelines' displayName
  bodyMarkdown: string;                  // the guidelines text
  references: { id?: string; name: string; uri: string; description?: string }[];
};
type CommunityGuidelinesEditorProps = {
  value: CommunityGuidelinesEditorValue;
  onChange(v: CommunityGuidelinesEditorValue): void;
  errors?: { title?: string; references?: (string | undefined)[] };
  onSave(): void; saving: boolean;
  // affordances wired by the consumer (the integration hook):
  onApplyTemplate(): void;               // opens TemplatePicker(mode:'select', allowedTypes:['communityGuidelines'])
  onSaveAsTemplate(): void;              // opens SaveAsTemplateDialog(sourceKind:'communityGuidelines')
  canEdit: boolean; canApplyTemplate: boolean; canSaveAsTemplate: boolean;
};
```
> Applying a template replaces `{ title, bodyMarkdown, references }` with the template's — behind a `ConfirmationDialog` when there is existing content (FR-034a). Saving as a template pre-fills the CG `TemplateFormValues` from the current `{ title, bodyMarkdown, references }` (FR-034b / FR-032). If the editor has unsaved edits, the save-as flow prompts to save/discard first.

---

## C. Mapping notes (integration layer — `src/main/crdPages/`)

| From (GraphQL) | To (CRD prop) | Mapper |
|---|---|---|
| `TemplatesSet.{calloutTemplates,...}` | `TemplateCategorySection[]` | `templatesManagerMapper.ts` (uses `templateCardMapper` per template) |
| `Template.profile` (+ `id`, `type`) | `TemplateCardData` | `templateCardMapper.ts` — `bannerUrl = profile.visual?.uri \|\| undefined`; `color = pickColorFromId(id)` |
| `TemplateContent` query result (per type, conditional) | `TemplateContent` union | `templateContentMapper.ts` — ports the shaping logic from the legacy `Previews/*` (pure functions) |
| `CalloutTemplateContent` (loaded for Edit/Duplicate) | `Partial<CalloutFormValues>` (callout-form pre-fill) | `calloutTemplateMapper.ts → calloutTemplateContentToFormValues` — the **`responseType` chip is derived from `settings.contribution.allowedTypes[0]` ALONE** (D14, 2026-05-18; mirrors the live-callout mapper `mapCalloutDetailsToFormValues.ts`). `enabled` and `canAddContributions` are **orthogonal** — they map to the actor switches via `allowedActorsFromServer(settings.contribution.canAddContributions)`, and they MUST NOT gate the chip. AND-ing them would round-trip-lose the response type whenever both actor toggles were off. **Whiteboard preview image (D16, 2026-05-18)**: `framing.whiteboard?.profile?.preview?.uri` → `whiteboardPreviewServerUrl` (a new display-only field on `CalloutFormValues`); shown by `InlineWhiteboardPreview` as the read-time fallback when no fresh blob URL exists. |
| `framing.whiteboard.profile.preview` (Visual) | `TemplateContent.callout.framingWhiteboardPreviewImageUrl` | `templateContentMapper.ts → mapCalloutContent` — `framingKind === 'whiteboard' ? framing.whiteboard?.profile?.preview?.uri : undefined` (D16, 2026-05-18). The Callout-framing preview renders an `<img>` when this is set; falls back to the placeholder text otherwise. Mirrors what `mapWhiteboardContent` already does for `type: 'whiteboard'` templates. |
| `whiteboardPreviewServerUrl` (prefilled on `CalloutFormValues`) | `whiteboardPreviewImages: [{ visualType: WhiteboardPreview, imageData: Blob }]` | `TemplateImportConnector` (live-callout-from-template — D18, 2026-05-18) — when the prefill carries a server preview URL, the integration layer fetches that URL as a `Blob` and seeds the form's preview-image array, so the existing `CalloutFormConnector` post-create `useUploadWhiteboardVisuals` step carries the image through to the new callout's preview Visual. A failed fetch is non-fatal — the seed is silently skipped; the form's display-only `whiteboardPreviewServerUrl` fallback (D16) still shows the image. Edits via `CrdSingleUserWhiteboardDialog` replace the seeded blob with fresh ones. |
| `TemplateFormValues` | `Create/Update*` mutation inputs | reuse the legacy `Forms/common/mappings.ts` (MUI-free pure module) + image uploads (`useHandlePreviewImages`, `useUploadMediaGalleryVisuals`). **Whiteboard-framing preview upload (D17, 2026-05-18)**: for Callout templates with whiteboard framing, after `createTemplate` (`type: CALLOUT`) / `updateCalloutTemplate` resolves, the integration layer reads `callout.framing.whiteboard.profile.previewVisual.id` from the mutation response and calls `useUploadWhiteboardVisuals(values.whiteboardPreviewImages, { previewVisualId })` to persist the blob — mirrors `CalloutFormConnector`'s live-callout post-save step. |
| `InnovationPack` | `InnovationPackCardData` / `InnovationPackProfileViewProps` | `innovationPackMapper.ts` — `color = pickColorFromId(pack.id)`; `templateCount = sum of templatesSet.*Templates.length` |
| `InnovationPackFormValues` | `UpdateInnovationPack` input (edit); the `createInnovationPack` mutation input `CreateInnovationPackOnAccountInput` = `{accountID, profileData:{displayName, description}}` (create — name + description only) | `innovationPackMapper.ts` |
| `platform.library.{templates,innovationPacks}` | `InnovationLibraryViewProps.{templates,packs}` | `innovationLibraryMapper.ts` — `ownerLabel = libraryResult.innovationPack.profile.displayName` |
| `account.innovationPacks[*].templatesSet.*Templates` | `TemplatePickerSource(key='account')` | `useTemplatePicker` builds it from `useImportTemplateDialogAccountTemplatesQuery` |
| `CommunityGuidelines` (a Space's live guidelines: `profile.{displayName, description, references}`) | `CommunityGuidelinesEditorValue` | the `crdPages/.../community/` integration hook — `{ title: profile.displayName, bodyMarkdown: profile.description, references: profile.references }`; save via `useUpdateCommunityGuidelinesMutation` (FR-038) |

---

## D. Client-side state (visual only — lives in CRD components) vs. integration state

| State | Where | Notes |
|---|---|---|
| Section collapse (per type) | CRD `TemplatesManagerView` | `useState` per section; `lucide-react` chevron |
| Inline search box (filters cards within the manager view) | CRD `TemplatesManagerView` | visual filter only — does not refetch |
| Dialog open/close (preview, form, picker, set-default, save-as, create-pack, delete-confirm) | CRD components own the `open` boolean when self-contained; otherwise controlled by the consumer | confirmation dialogs are always `ConfirmationDialog`-driven |
| Picker view = list vs. preview pane | CRD `TemplatePicker` | `useState` |
| Picker `mode` | prop (consumer decides) | discriminated union |
| Form field values + dirty flag | integration layer (`useTemplateForms`) | The dialog (`TemplateFormDialog`) is a pure `src/crd/` shell with a `perTypeFormSlot: ReactNode`; the per-type forms are controlled; the **Callout** per-type form lives in the integration layer (`src/main/crdPages/templates/CalloutTemplateForm.tsx`) because it composes the Apollo/`@/domain/*`-bound callout-authoring connectors; the rest are pure `src/crd/.../forms/*`. Discard guard via `ConfirmationDialog`. |
| Library type-filter | integration layer (`useInnovationLibrary`) — refetches `library.templates(types:)` or filters client-side | mirror legacy (legacy filters client-side over a single fetch) |
| Pending delete / duplicate target + in-flight flag | integration layer (`useTemplatesManager`) | optimistic cache eviction on delete; per-row spinner |
| Active tab / route ↔ template id (legacy `:templateNameId`) | integration layer | for deep-linking a template's preview/edit, parity with the MUI route param |

---

## E. Invariants & lifecycle

- A template's `type` is immutable (no "convert this callout template to a whiteboard template").
- **Whiteboard preview image — read-time fallback** (D16, 2026-05-18). A whiteboard's server-rendered preview image (`framing.whiteboard.profile.preview.uri` on a Callout template with whiteboard framing; `whiteboard.profile.preview.uri` on a Whiteboard template) is the read-time placeholder for any UI that needs to show "what the whiteboard looks like" without bundling Excalidraw. In the **form**, fresh in-form preview blobs (generated when the user re-opens the inline editor and saves) take precedence — the URL is the fallback for "loaded but not re-edited yet", not a competitor; the form value is display-only and never round-trips back to the server. In the **template Preview dialog** and any read-only preview surface, the URL drives an `<img>`; the placeholder text is reserved for the genuinely-no-visual case.
- **Whiteboard preview image — carry-through on create-from-template** (D18, 2026-05-18). When a live callout is created via the template picker, the integration layer (`TemplateImportConnector`) fetches the template's `whiteboardPreviewServerUrl` and seeds `whiteboardPreviewImages` with the resulting `Blob` so the existing post-create upload step copies the image to the new callout's preview Visual. The precedence rule from D16 still holds in the UI (fresh blob > server URL > placeholder); D18 closes the loop on the *upload* side so the precedence rule's outcome — the image the user sees in the form — also lands on the server. Fetch failures are non-fatal: the seed is skipped, the form's display fallback (server URL) keeps working, and the new callout simply ends up without a preview image (the pre-fix behaviour — never worse).
- **Callout contribution-settings orthogonality** (D14, 2026-05-18). The three fields under `settings.contribution` are semantically independent and the form binds each to a separate control: `allowedTypes` → the response-type chip strip (`LINKS`/`POSTS`/`MEMOS`/`WHITEBOARDS`); `canAddContributions` → the two actor switches; `enabled` → a derived write-side flag (`canAddContributions !== NONE`). No read-side mapper may AND-gate one on another (in particular, the chip MUST NOT depend on `enabled`). `commentsEnabled` is independent again. The `UpdateCalloutTemplate` mutation MUST return the full `CalloutSettingsFull` fragment on `settings` so the post-mutation cache covers all four fields (V6, D15, 2026-05-18) — partial returns silently leave stale data in cache for fields the mutation did update.
- Deleting a template that is referenced by any `TemplateDefault` clears that default as part of the deletion (FR-019) — the confirmation dialog says so; the integration layer issues the `updateTemplateDefault(template: null)` after the delete (or relies on the backend cascade, whichever the existing mutation does — verify in implementation).
- Importing into a Space's set creates a **copy** (new `id`, independent thereafter) — never a live reference to the source.
- Within a *management* context every template in the set is editable/duplicable/deletable (the legacy `TemplatesAdmin` has no per-template gate); a *read-only* context (pack public profile) offers only Preview. The CRD `can*` predicates therefore resolve uniformly per context — no per-type privilege check.
- An Innovation Pack's `provider` is the owning account's host organisation; it is shown read-only and is **not** chosen or changed in this feature (reassigning a pack's provider is the platform-admin "Transfer Innovation Pack" operation, out of scope). Pack **creation** collects only `{ displayName, description }`; the rest of the details are edited on the pack admin screen. Pack **deletion** is exposed from the three-dot menu on each pack card in the "Account" tab of a user's/org's profile (`useAccountEntityDeletion.ts` / `useDeleteInnovationPackMutation`), not from the pack admin screen.
- Template names are not unique within a set — import/duplicate may produce same-named entries (FR edge case); no client-side dedup.
