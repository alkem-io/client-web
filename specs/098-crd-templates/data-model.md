# Phase 1 Data Model — CRD Templates System

This is a **frontend re-skin**: no schema changes, no new persisted entities. The "data model" here is (a) the existing GraphQL entities the CRD surfaces read/write (for reference), and (b) the **plain-TS prop shapes** the CRD components consume — produced by mappers under `src/main/crdPages/`. CRD components never see GraphQL types (`src/crd/CLAUDE.md` Rule 4).

Legend: *GraphQL* = existing generated type (read-only reference); *CRD prop* = new plain-TS type defined in `contracts/`.

---

## A. Existing GraphQL entities (reference only — unchanged)

### Template *(GraphQL)*
- `id`, `type: TemplateType` (`CALLOUT | WHITEBOARD | POST | SPACE | COMMUNITY_GUIDELINES`)
- `profile`: `{ id, displayName, description, tagset, visual (banner/card), url }`
- Type-specific content (fetched lazily, conditionally, via `TemplateContent`):
  - **Callout**: `callout.framing` (`type: CalloutFramingType`, plus `whiteboard` / `memo` / `link` / `mediaGallery` content depending on kind), `callout.settings.contribution` (`allowedTypes`, comment settings), `callout.contributionDefaults` (`postDescription`, `whiteboardContent`)
  - **Whiteboard**: `whiteboard.{ id, content, previewSettings }`
  - **Post**: `postDefaultDescription`
  - **Space**: `contentSpace` → `{ innovationFlow.states[], collaboration.callouts[], subspaces[] (each a nested space-template-like structure), about, settings }`
  - **Community Guidelines**: `profile` (displayName, description) + `profile.references[]` (`{ id, name, uri, description }`) + auth
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

### `TemplateContent` *(CRD prop — discriminated union)*
The fully-loaded, render-ready content shown in the preview dialog / picker preview pane. Produced by `templateContentMapper.ts` from the lazy `TemplateContent` query result.
```
type TemplateContent =
  | { type: 'callout';
      framingKind: 'text' | 'whiteboard' | 'memo' | 'link' | 'mediaGallery';
      framingTitle: string;
      framingDescription: string;          // markdown
      framingWhiteboardContent?: string;   // when framingKind === 'whiteboard'
      framingMemoContent?: string;         // when framingKind === 'memo' (markdown)
      framingLinks?: { name: string; uri: string }[];   // when framingKind === 'link'
      framingMediaImages?: { uri: string; alt?: string }[];  // when framingKind === 'mediaGallery'
      allowedContributionTypes: ('post' | 'whiteboard' | 'link')[];
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
      starterCallouts: { name: string; framingKind: TemplateContent['framingKind'] }[];
      subspaceTemplates: { name: string }[]; }            // nested
  | { type: 'communityGuidelines';
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
      framingKind; framingTitle; framingDescription;
      framingWhiteboardContent?; framingMemoContent?; framingLinks?; framingMediaFiles?;
      allowedContributionTypes; commentsEnabled;
      defaultPostDescription?; defaultWhiteboardContent?; })
  | (TemplateCommonValues & { type: 'whiteboard'; whiteboardContent: string; previewImageFile?: File })
  | (TemplateCommonValues & { type: 'post'; defaultDescription: string })
  | (TemplateCommonValues & { type: 'space'; sourceSpaceId?: string; recursive: boolean })   // authored by copying a space/subspace
  | (TemplateCommonValues & { type: 'communityGuidelines'; guidelinesMarkdown: string; references: { id?: string; name: string; uri: string; description?: string }[] });
```
Validation rules (FR-021): `name` non-empty for every type; reference rows require `name` + `uri`; `space` requires a `sourceSpaceId` to create (on edit it may be re-selected to re-capture). The integration layer maps these to the existing mutation inputs via the legacy `Forms/common/mappings.ts` logic (re-used as a pure-function module — it has no MUI dependency) plus image uploads.

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
type InnovationPackFormValues = {
  name: string;                                 // required
  description: string;
  tags: string[];
  avatarFile?: File;
  references: { id?: string; name: string; uri: string; description?: string }[];
  providerOrganizationId: string;               // chooseable for platform packs; fixed for account packs
  listedInStore: boolean;
  searchVisibility: 'public' | 'authenticated' | 'account';   // mirrors SearchVisibility enum, mapped to a string union
};
type InnovationPackProfileViewProps = {
  pack: InnovationPackCardData & { references: TemplateContent extends never ? never : { id: string; name: string; uri: string; description?: string }[] };
  templates: TemplateCategorySection[];          // read-only listing
  canManage: boolean;                            // shows the "Manage pack" entry point
  adminHref?: string;
  onTemplatePreview(id: string): void;
  // (no create/edit/delete/import callbacks — read-only profile)
};
type InnovationPackAdminViewProps = {
  form: InnovationPackFormValues; onFormChange(v): void; formErrors: ...; onSaveForm(): void; savingForm: boolean;
  onDeletePack(): void;                          // routes through ConfirmationDialog
  organizationOptions: { id: string; name: string }[];   // for the provider select (platform packs)
  providerSelectable: boolean;
  templatesManager: TemplatesManagerViewProps;   // holderKind='innovationPack', canImport(*)=false
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

---

## C. Mapping notes (integration layer — `src/main/crdPages/`)

| From (GraphQL) | To (CRD prop) | Mapper |
|---|---|---|
| `TemplatesSet.{calloutTemplates,...}` | `TemplateCategorySection[]` | `templatesManagerMapper.ts` (uses `templateCardMapper` per template) |
| `Template.profile` (+ `id`, `type`) | `TemplateCardData` | `templateCardMapper.ts` — `bannerUrl = profile.visual?.uri \|\| undefined`; `color = pickColorFromId(id)` |
| `TemplateContent` query result (per type, conditional) | `TemplateContent` union | `templateContentMapper.ts` — ports the shaping logic from the legacy `Previews/*` (pure functions) |
| `TemplateFormValues` | `Create/Update*` mutation inputs | reuse the legacy `Forms/common/mappings.ts` (MUI-free pure module) + image uploads (`useHandlePreviewImages`, `useUploadMediaGalleryVisuals`) |
| `InnovationPack` | `InnovationPackCardData` / `InnovationPackProfileViewProps` | `innovationPackMapper.ts` — `color = pickColorFromId(pack.id)`; `templateCount = sum of templatesSet.*Templates.length` |
| `InnovationPackFormValues` | `UpdateInnovationPack` / `CreateInnovationPackOnAccount` inputs | `innovationPackMapper.ts` |
| `platform.library.{templates,innovationPacks}` | `InnovationLibraryViewProps.{templates,packs}` | `innovationLibraryMapper.ts` — `ownerLabel = libraryResult.innovationPack.profile.displayName` |
| `account.innovationPacks[*].templatesSet.*Templates` | `TemplatePickerSource(key='account')` | `useTemplatePicker` builds it from `useImportTemplateDialogAccountTemplatesQuery` |

---

## D. Client-side state (visual only — lives in CRD components) vs. integration state

| State | Where | Notes |
|---|---|---|
| Section collapse (per type) | CRD `TemplatesManagerView` | `useState` per section; `lucide-react` chevron |
| Inline search box (filters cards within the manager view) | CRD `TemplatesManagerView` | visual filter only — does not refetch |
| Dialog open/close (preview, form, picker, set-default, save-as, create-pack, delete-confirm) | CRD components own the `open` boolean when self-contained; otherwise controlled by the consumer | confirmation dialogs are always `ConfirmationDialog`-driven |
| Picker view = list vs. preview pane | CRD `TemplatePicker` | `useState` |
| Picker `mode` | prop (consumer decides) | discriminated union |
| Form field values + dirty flag | integration layer (`useTemplateForms`) | CRD form is controlled; discard guard via `ConfirmationDialog` |
| Library type-filter | integration layer (`useInnovationLibrary`) — refetches `library.templates(types:)` or filters client-side | mirror legacy (legacy filters client-side over a single fetch) |
| Pending delete / duplicate target + in-flight flag | integration layer (`useTemplatesManager`) | optimistic cache eviction on delete; per-row spinner |
| Active tab / route ↔ template id (legacy `:templateNameId`) | integration layer | for deep-linking a template's preview/edit, parity with the MUI route param |

---

## E. Invariants & lifecycle

- A template's `type` is immutable (no "convert this callout template to a whiteboard template").
- Deleting a template that is referenced by any `TemplateDefault` clears that default as part of the deletion (FR-019) — the confirmation dialog says so; the integration layer issues the `updateTemplateDefault(template: null)` after the delete (or relies on the backend cascade, whichever the existing mutation does — verify in implementation).
- Importing into a Space's set creates a **copy** (new `id`, independent thereafter) — never a live reference to the source.
- Innovation Packs at account level: `provider` is the account's host organisation (fixed); platform-level packs: `provider` is chooseable from an organisation list — `providerSelectable` carries this to the form.
- Template names are not unique within a set — import/duplicate may produce same-named entries (FR edge case); no client-side dedup.
