/**
 * Plain-TypeScript prop types for the CRD templates kit (098-crd-templates).
 *
 * Everything here is design-system-layer only: no GraphQL generated types, no MUI, no Apollo.
 * The integration layer under `src/main/crdPages/templates/` maps GraphQL shapes onto these.
 *
 * `FramingKind` is re-exported from the existing CRD callout-layer `FramingChip` union — there is
 * no parallel framing-kind enum (the Callout template form reuses the callout-authoring connectors).
 */

import type { ReactNode } from 'react';
import type { FramingChip } from '@/crd/forms/callout/types';

// ---------------------------------------------------------------------------
// Template type union + ordering
// ---------------------------------------------------------------------------

/** String-union template type used everywhere in CRD (NOT the GraphQL `TemplateType` enum). */
export type TemplateType = 'space' | 'callout' | 'whiteboard' | 'post' | 'communityGuidelines';

/** Order in which sections render in the manager view (fixed). */
export const TEMPLATE_TYPE_ORDER: readonly TemplateType[] = [
  'space',
  'callout',
  'whiteboard',
  'post',
  'communityGuidelines',
] as const;

/**
 * Framing kind — re-exports the existing CRD callout-layer `FramingChip` union
 * (`src/crd/forms/callout/types.ts`). Mapping to the server enum `CalloutFramingType`:
 *   'none' ⇄ None (plain text) · 'whiteboard' ⇄ Whiteboard · 'memo' ⇄ Memo ·
 *   'document' ⇄ CollaboraDocument · 'cta' ⇄ Link · 'image' ⇄ MediaGallery · 'poll' ⇄ Poll
 */
export type FramingKind = FramingChip;

// ---------------------------------------------------------------------------
// Card / section / action data
// ---------------------------------------------------------------------------

/** Minimal shape every template card needs (manager list, picker, library gallery, preview header). */
export type TemplateCardData = {
  id: string;
  type: TemplateType;
  /** profile.displayName — required, non-empty. */
  name: string;
  /** profile.description ?? '' */
  description: string;
  /** profile.tagset?.tags ?? [] */
  tags: string[];
  /** profile.visual?.uri || undefined — undefined ⇒ component renders the pickColorFromId gradient. */
  bannerUrl?: string;
  /** pickColorFromId(template.id) — banner/avatar deterministic fallback colour. */
  color: string;
  /** profile.url — for "open detail" links (library / pack-profile contexts). */
  url?: string;
  /** Owning pack name etc. — only set in library / account-source contexts. */
  ownerLabel?: string;
};

export type TemplateCategorySection = {
  type: TemplateType;
  templates: TemplateCardData[];
};

export type TemplateAction = 'preview' | 'edit' | 'duplicate' | 'delete';

// ---------------------------------------------------------------------------
// Manager view props
// ---------------------------------------------------------------------------

export type TemplatesManagerViewProps = {
  holderKind: 'space' | 'innovationPack';
  categories: TemplateCategorySection[];
  loading?: boolean;
  /** Id of the template currently mid-duplicate — shows a "Creating…" spinner on that row/section. */
  duplicatingId?: string | null;
  /** Id of the template currently mid-delete — shows a "Deleting…" spinner and hides the row optimistically. */
  deletingId?: string | null;
  // No per-type authorization — the gate is page access. In a management context the consumer wires
  // these as `() => true`; in a read-only context (pack public profile) as `() => false`. No `isCustom` gate.
  canCreate: (type: TemplateType) => boolean;
  canEdit: (type: TemplateType) => boolean;
  canDelete: (type: TemplateType) => boolean;
  /** `() => true` only for a Space holder in a management context (Import is Space-only). */
  canImport: (type: TemplateType) => boolean;
  onCreate: (type: TemplateType) => void;
  onImport: (type: TemplateType) => void;
  onTemplateAction: (id: string, action: TemplateAction) => void;
  className?: string;
};

// ---------------------------------------------------------------------------
// Preview content (read-only, fully-loaded shape produced by templateContentMapper)
// ---------------------------------------------------------------------------

export type TemplateContent =
  | {
      type: 'callout';
      framingKind: FramingKind;
      framingTitle: string;
      /** markdown */
      framingDescription: string;
      /** Excalidraw JSON — when framingKind === 'whiteboard' */
      framingWhiteboardContent?: string;
      /** markdown — when framingKind === 'memo' */
      framingMemoContent?: string;
      /** when framingKind === 'document' — read-only title/placeholder (the live Collabora service is not embedded in a preview) */
      framingCollaboraDoc?: { displayName: string; documentType?: string };
      /** when framingKind === 'cta' (link) */
      framingLinks?: { name: string; uri: string }[];
      /** when framingKind === 'image' (media-gallery) */
      framingMediaImages?: { uri: string; alt?: string }[];
      /** when framingKind === 'poll' — rendered read-only in the preview */
      framingPoll?: { question: string; options?: string[] };
      allowedContributionTypes: ('post' | 'whiteboard' | 'link')[];
      commentsEnabled: boolean;
      /** markdown */
      defaultPostDescription?: string;
      /** Excalidraw JSON */
      defaultWhiteboardContent?: string;
    }
  | {
      type: 'whiteboard';
      /** Excalidraw JSON */
      whiteboardContent: string;
      previewImageUrl?: string;
    }
  | {
      type: 'post';
      /** markdown */
      defaultDescription: string;
    }
  | {
      type: 'space';
      /** innovation-flow states */
      phases: { name: string; description?: string }[];
      starterCallouts: { name: string; framingKind: FramingKind }[];
      subspaceTemplates: { name: string }[];
    }
  | {
      type: 'communityGuidelines';
      /** the guidelines' displayName — a distinct field (V5) */
      title: string;
      /** markdown */
      guidelinesMarkdown: string;
      references: ReferenceRow[];
    };

export type TemplateContentPreviewProps = {
  content: TemplateContent;
  /** Loading skeleton while the lazy content query resolves (role="status" + aria-label). */
  loading?: boolean;
  className?: string;
};

export type TemplatePreviewDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Header info (name, type, banner) — available before the heavy content loads. */
  header: TemplateCardData;
  content?: TemplateContent;
  contentLoading: boolean;
  /** Shown only when the viewer may edit this template. */
  onEdit?: () => void;
};

// ---------------------------------------------------------------------------
// Reference rows
// ---------------------------------------------------------------------------

/** A reference link row in the CG template / pack / guidelines editors. */
export type ReferenceRow = { id?: string; name: string; uri: string; description?: string };

// ---------------------------------------------------------------------------
// Form values (controlled by `src/main/crdPages/templates/useTemplateForms.ts`)
// ---------------------------------------------------------------------------

export type TemplateCommonValues = {
  /** required, non-empty */
  name: string;
  description: string;
  tags: string[];
  /** optional new banner/visual upload (the integration layer performs the upload on save) */
  bannerFile?: File;
};

export type CalloutTemplateValues = TemplateCommonValues & {
  type: 'callout';
  framingKind: FramingKind;
  framingTitle: string;
  framingDescription: string;
  framingWhiteboardContent?: string;
  framingMemoContent?: string;
  framingCollaboraDoc?: { displayName?: string; documentType?: string; uploadFile?: File };
  framingLinks?: { name: string; uri: string }[];
  framingMediaFiles?: File[];
  framingPoll?: { question?: string; options?: string[] };
  allowedContributionTypes: ('post' | 'whiteboard' | 'link')[];
  commentsEnabled: boolean;
  defaultPostDescription?: string;
  defaultWhiteboardContent?: string;
};

/** Mirrors the live whiteboard editor's preview-settings shape — opaque at the CRD layer. */
export type WhiteboardPreviewSettings = Record<string, unknown>;

export type WhiteboardTemplateValues = TemplateCommonValues & {
  type: 'whiteboard';
  whiteboardContent: string;
  previewSettings?: WhiteboardPreviewSettings;
  previewImageFile?: File;
};

export type PostTemplateValues = TemplateCommonValues & {
  type: 'post';
  defaultDescription: string;
};

export type SpaceTemplateValues = TemplateCommonValues & {
  type: 'space';
  /** id of the space/subspace whose structure to copy. Required to CREATE; on EDIT it may be re-selected to re-capture. */
  sourceSpaceId?: string;
  /** include nested subspaces in the captured structure */
  recursive: boolean;
};

export type CommunityGuidelinesTemplateValues = TemplateCommonValues & {
  type: 'communityGuidelines';
  /** the guidelines' displayName — a distinct field, required — separate from `name` (the template's own name) */
  title: string;
  guidelinesMarkdown: string;
  references: ReferenceRow[];
};

export type TemplateFormValues =
  | CalloutTemplateValues
  | WhiteboardTemplateValues
  | PostTemplateValues
  | SpaceTemplateValues
  | CommunityGuidelinesTemplateValues;

/** Per-field validation errors (any subset of the form's keys, plus indexed keys for list rows). */
export type TemplateFormErrors = Partial<Record<string, string>>;

export type TemplateFormDialogProps = {
  open: boolean;
  /** 'create' shows the type fixed (chosen before opening); 'edit' loads existing values. */
  intent: 'create' | 'edit';
  /** Drives the title only — the body is `perTypeFormSlot`. */
  type: TemplateType;
  /** Common-fields value (name/description/tags/bannerFile). The per-type values live in the slot's own controlled state. */
  commonValue: TemplateCommonValues;
  commonErrors: TemplateFormErrors;
  onCommonChange: (next: TemplateCommonValues) => void;
  /** The per-type form, assembled by the integration layer (`useTemplateForms`). The dialog renders it as-is. */
  perTypeFormSlot: ReactNode;
  /** True while the create/update mutation (+ any uploads) is in flight — disables Save, shows aria-busy. */
  submitting: boolean;
  onSubmit: () => void;
  /** Closing with unsaved changes triggers an internal DiscardChangesDialog when `isDirty` is true. */
  onCancel: () => void;
  /** When true and the user requests close, show a discard-changes confirmation first. */
  isDirty?: boolean;
};

// Each per-type form receives a narrowed value + onChange + errors.
export type CalloutTemplateFormProps = {
  value: CalloutTemplateValues;
  errors: TemplateFormErrors;
  onChange: (next: CalloutTemplateValues) => void;
};
export type WhiteboardTemplateFormProps = {
  value: WhiteboardTemplateValues;
  errors: TemplateFormErrors;
  onChange: (next: WhiteboardTemplateValues) => void;
};
export type PostTemplateFormProps = {
  value: PostTemplateValues;
  errors: TemplateFormErrors;
  onChange: (next: PostTemplateValues) => void;
};
export type CommunityGuidelinesTemplateFormProps = {
  value: CommunityGuidelinesTemplateValues;
  errors: TemplateFormErrors;
  onChange: (next: CommunityGuidelinesTemplateValues) => void;
};
export type SpaceTemplateFormProps = {
  value: SpaceTemplateValues;
  errors: TemplateFormErrors;
  onChange: (next: SpaceTemplateValues) => void;
  /** Search results for the "pick a space/subspace to copy" picker — supplied by the integration layer. */
  searchResults: { id: string; name: string; avatarUrl?: string }[];
  searchValue: string;
  onSearchChange: (next: string) => void;
  searchLoading?: boolean;
  /** Read-only preview of the captured structure once content has been fetched (optional). */
  capturedStructure?: Extract<TemplateContent, { type: 'space' }>;
};

// ---------------------------------------------------------------------------
// Picker
// ---------------------------------------------------------------------------

export type TemplatePickerSourceKey = 'space' | 'account' | 'platform';

export type TemplatePickerSource = {
  key: TemplatePickerSourceKey;
  /** Cards already filtered to the allowed type(s) for this picker instance. */
  templates: TemplateCardData[];
  /** True while this source's query is still loading (renders a skeleton row). */
  loading?: boolean;
};

type TemplatePickerCommon = {
  open: boolean;
  onClose: () => void;
  /** Source sections in render order. In 'import' mode this never includes a 'space' source. */
  sources: TemplatePickerSource[];
  /** Free-text filter value over name/description/tags (controlled). */
  search: string;
  onSearchChange: (next: string) => void;
  /** Overall loading (e.g. resolving the destination templates set id). */
  loading?: boolean;
  /** Ask the consumer to lazy-load the full content of `templateId` for the preview pane. */
  onPreview: (templateId: string) => void;
  /** The lazily-loaded preview content; `undefined` while loading. */
  previewContent?: TemplateContent;
  previewLoading: boolean;
  className?: string;
};

export type TemplatePickerImportProps = TemplatePickerCommon & {
  mode: 'import';
  /** Template ids already present in the destination set — rendered as "in this set" + removable. */
  alreadyInSet: ReadonlySet<string>;
  /** Add a copy of `templateId` to the destination set. Dialog stays open. */
  onImport: (templateId: string) => void;
  /** Remove a template from the destination set (goes through ConfirmationDialog at the consumer). */
  onRemoveFromSet: (templateId: string) => void;
};

export type TemplatePickerSelectProps = TemplatePickerCommon & {
  mode: 'select';
  /** Restrict the picker to these template type(s) — usually a single type. */
  allowedTypes: TemplateType[];
  /** Currently-selected template id, if any. */
  selectedId?: string;
  /** Choose a template (or `null` to clear / "no template / start blank"). Selecting a template closes the dialog. */
  onSelect: (templateId: string | null) => void;
};

export type TemplatePickerProps = TemplatePickerImportProps | TemplatePickerSelectProps;

// ---------------------------------------------------------------------------
// Set-default dialog
// ---------------------------------------------------------------------------

export type SetDefaultTemplateDialogProps =
  | {
      open: boolean;
      onClose: () => void;
      purpose: 'defaultSubspaceTemplate';
      /** The holder's own Space templates (the only valid candidates for this default). */
      candidates: TemplateCardData[];
      candidatesLoading?: boolean;
      /** Currently-set default, if any (shown selected; offer to clear). */
      currentTemplateId?: string;
      /** Lazy-load a candidate's content for the preview pane. */
      onPreview: (templateId: string) => void;
      previewContent?: TemplateContent;
      previewLoading: boolean;
      /** Commit a new default (or `null` to clear it). */
      onConfirm: (templateId: string | null) => void;
      confirming: boolean;
    }
  | {
      open: boolean;
      onClose: () => void;
      purpose: 'flowStateDefaultCalloutTemplate';
      /** Source sections Space / Account / Platform (hosts `TemplatePicker` in `mode: 'select'`, `allowedTypes: ['callout']`). */
      sources: TemplatePickerSource[];
      search: string;
      onSearchChange: (next: string) => void;
      currentTemplateId?: string;
      onPreview: (templateId: string) => void;
      previewContent?: TemplateContent;
      previewLoading: boolean;
      onConfirm: (templateId: string | null) => void;
      confirming: boolean;
    };

// ---------------------------------------------------------------------------
// Community Guidelines editor (FR-038) — host for apply / save-as-template
// ---------------------------------------------------------------------------

export type CommunityGuidelinesEditorValue = {
  /** the guidelines' displayName (the "title") */
  title: string;
  /** the guidelines text (markdown) */
  bodyMarkdown: string;
  references: ReferenceRow[];
};

export type CommunityGuidelinesEditorErrors = {
  title?: string;
  references?: (string | undefined)[];
};

export type CommunityGuidelinesEditorProps = {
  value: CommunityGuidelinesEditorValue;
  errors?: CommunityGuidelinesEditorErrors;
  onChange: (next: CommunityGuidelinesEditorValue) => void;
  onSave: () => void;
  /** True while the update mutation is in flight — disables Save, shows aria-busy. */
  saving: boolean;
  /** Opens the template picker (consumption mode, communityGuidelines) — replacement guarded by a ConfirmationDialog when there is content. */
  onApplyTemplate: () => void;
  /** Opens TemplateFormDialog (create, communityGuidelines) pre-filled from the current value. */
  onSaveAsTemplate: () => void;
  canEdit: boolean;
  canApplyTemplate: boolean;
  canSaveAsTemplate: boolean;
  className?: string;
};
