/**
 * Contract: per-type create/edit template forms + the form dialog shell.
 *
 * CRD components:
 *  - `src/crd/components/templates/TemplateFormDialog.tsx` — title + common fields (name/description/tags/banner)
 *    + a slot for the per-type content form + Save/Cancel; discard-guard via ConfirmationDialog.
 *  - `src/crd/components/templates/forms/{Callout,Whiteboard,Post,Space,CommunityGuidelines}TemplateForm.tsx`
 *
 * Forms are CONTROLLED — `value` / `onChange` / `errors` come from the integration layer
 * (`src/main/crdPages/templates/useTemplateForms.ts`). No Formik/RHF inside src/crd/.
 * Reuse existing CRD building blocks: `MarkdownEditor` (post description / guidelines / callout framing memo),
 * `tags-input` (tags), the CRD whiteboard editor (whiteboard content / callout default whiteboard),
 * the CRD references-list editor (callout link framing / guidelines references / pack references).
 */

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

export type CalloutTemplateValues = TemplateCommonValues & {
  type: 'callout';
  framingKind: FramingKind;
  framingTitle: string;
  framingDescription: string;
  framingWhiteboardContent?: string;
  framingMemoContent?: string;
  framingLinks?: { name: string; uri: string }[];
  framingMediaFiles?: File[];
  allowedContributionTypes: ('post' | 'whiteboard' | 'link')[];
  commentsEnabled: boolean;
  defaultPostDescription?: string;
  defaultWhiteboardContent?: string;
};

export type WhiteboardTemplateValues = TemplateCommonValues & {
  type: 'whiteboard';
  whiteboardContent: string;
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
  /** 'create' shows the type fixed (chosen before opening) or a type picker if launched generically; 'edit' loads existing values. */
  intent: 'create' | 'edit';
  type: TemplateType;
  value: TemplateFormValues;
  errors: TemplateFormErrors;
  /** True while the create/update mutation (+ any uploads) is in flight — disables Save, shows aria-busy. */
  submitting: boolean;
  onChange: (next: TemplateFormValues) => void;
  onSubmit: () => void;
  /** Closing with unsaved changes triggers the consumer's DiscardChangesDialog before this fires. */
  onCancel: () => void;
};

/** Each per-type form component receives a narrowed value + onChange + errors. Example: */
export type CalloutTemplateFormProps = {
  value: CalloutTemplateValues;
  errors: TemplateFormErrors;
  onChange: (next: CalloutTemplateValues) => void;
};
