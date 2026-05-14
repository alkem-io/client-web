/**
 * Contract: per-type create/edit template forms + the form dialog shell.
 *
 * Components / placement:
 *  - `src/crd/components/templates/TemplateFormDialog.tsx` — a PURE `src/crd/` shell: title + common fields
 *    (name/description/tags/banner) + a `perTypeFormSlot: ReactNode` the consumer fills (the ShareDialog
 *    `shareOnAlkemioSlot` pattern) + Save/Cancel; discard-guard via ConfirmationDialog. It does NOT import any
 *    per-type form (so it never transitively imports Apollo/`@/domain/*`/MUI).
 *  - `src/crd/components/templates/forms/{Whiteboard,Post,CommunityGuidelines}TemplateForm.tsx` + the
 *    presentational `SpaceTemplateForm.tsx` — pure CRD-layer (reuse `MarkdownEditor`, `tags-input`,
 *    `WhiteboardEditorShell`, the CRD references-list editor). Mounted by the integration layer into `perTypeFormSlot`.
 *    `WhiteboardTemplateForm` renders the shared `WhiteboardConfigCard` (`src/crd/components/whiteboard/`) for the
 *    "configure / edit drawing" row — the same component the callout whiteboard-framing editor (`FramingEditorConnector`)
 *    uses — and the integration-layer connector (`WhiteboardTemplateFormConnector`) wires it to the live editor dialog.
 *  - **`src/main/crdPages/templates/CalloutTemplateForm.tsx`** — the callout per-type form is in the INTEGRATION
 *    layer, not `src/crd/`, because it composes the callout-authoring connectors (Apollo/`@/domain/*`-bound).
 *    It's mounted into `perTypeFormSlot` for `type: 'callout'`. The Apollo URL-resolver + space-content +
 *    Update-privilege plumbing for the Space form's URL-paste source picker (mirroring the legacy MUI
 *    `SpaceContentFromSpaceUrlForm`: paste URL → "Use this space" → load innovation-flow + callouts)
 *    likewise lives in the integration layer (folded into `useTemplateForms`).
 *
 * Forms are CONTROLLED — `value` / `onChange` / `errors` come from the integration layer
 * (`src/main/crdPages/templates/useTemplateForms.ts`, which also assembles the slot per type). No Formik/RHF inside src/crd/.
 */

import type { ReactNode } from 'react';
import type { FramingKind } from './template-preview';
import type { TemplateType } from './templates-manager';

export type TemplateCommonValues = {
  /** required, non-empty (FR-021) */
  name: string;
  description: string;
  tags: string[];
  /** optional new banner/visual upload (the integration layer performs the upload on save) */
  bannerFile?: File;
};

export type ReferenceRow = { id?: string; name: string; uri: string; description?: string };

// NOTE: the Callout template form is a thin shell over the EXISTING CRD callout-authoring connectors
// (`FramingEditorConnector` + the per-kind framing connectors + the callout-settings *controls* + `ResponseDefaultsConnector`,
// + `calloutFormMapper.ts`). So `CalloutTemplateValues` mirrors that layer's value shape; `framingKind` is the existing
// `FramingChip` union (`src/crd/forms/callout/types.ts`, re-exported here as `FramingKind`), covering 'none'/'whiteboard'/'memo'/'document'(Collabora)/'cta'(link)/'image'(media-gallery)/'poll'.
// The form covers EVERY framing kind incl. Collabora-document (V1) and poll (V2 — poll content persists).
// Per-kind content fields below are illustrative — defer to the actual connectors' value shape during implementation.
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

export type WhiteboardTemplateValues = TemplateCommonValues & {
  type: 'whiteboard';
  whiteboardContent: string;
  /** full preview-settings (the crop/region the live whiteboard editor's PreviewSettingsDialog/PreviewCropDialog produce) — FR-020; not just an image */
  previewSettings?: WhiteboardPreviewSettings;
  previewImageFile?: File;
};

/** Mirrors the live whiteboard editor's preview-settings shape — defer to `src/crd/components/whiteboard/PreviewSettingsDialog`/`PreviewCropDialog` during implementation. */
export type WhiteboardPreviewSettings = Record<string, unknown>;

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
  /** the guidelines' displayName — a distinct field, required (V5 / FR-020 / FR-038) — separate from `name` (the template's own name) */
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

/** Per-field validation errors (any subset of the form's keys). */
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
  /** The per-type form, assembled by the integration layer (`useTemplateForms`): pure `src/crd/.../forms/*` for
   *  whiteboard/post/guidelines/space, `crdPages/templates/CalloutTemplateForm` for callout. The dialog renders it as-is. */
  perTypeFormSlot: ReactNode;
  /** True while the create/update mutation (+ any uploads) is in flight — disables Save, shows aria-busy. */
  submitting: boolean;
  onSubmit: () => void;
  /** Closing with unsaved changes triggers the consumer's DiscardChangesDialog before this fires. */
  onCancel: () => void;
};

/** Each per-type form component receives a narrowed value + onChange + errors. Example (callout — lives in `crdPages/templates/`, not `src/crd/`): */
export type CalloutTemplateFormProps = {
  value: CalloutTemplateValues;
  errors: TemplateFormErrors;
  onChange: (next: CalloutTemplateValues) => void;
};
