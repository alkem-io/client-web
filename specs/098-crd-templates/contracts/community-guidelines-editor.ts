/**
 * Contract: the CRD community-guidelines editor (Space Settings → Community) — FR-038.
 *
 * This feature DELIVERS this editor to legacy parity (guidelines title + reference links + markdown body, working),
 * superseding spec 045's markdown-only stub. It is the host for the FR-034 "apply a Community Guidelines template" and
 * the FR-034(b)/US9 "save the current guidelines as a template" flows.
 *
 * CRD component: `src/crd/components/space/settings/CommunityGuidelinesEditor.tsx` — presentational, controlled.
 *   No MUI / Apollo / `@/domain/*` / router / formik. Reuses `MarkdownEditor`, the shared
 *   `@/crd/forms/references/ReferencesEditor` (canonical `{ id?, name, uri, description? }` rows, per-row paperclip
 *   file-attach, delete via its own `ConfirmationDialog` — the same editor the Space About references and the Innovation
 *   Pack form use, per D24), and the guidelines-title field sub-component (shared with `CommunityGuidelinesTemplateForm`
 *   — see template-forms.ts).
 *
 * Integration layer: `src/main/crdPages/topLevelPages/spaceSettings/community/` — loads the live `CommunityGuidelines`
 *   (`profile.{displayName, description, references}` ⇄ `CommunityGuidelinesEditorValue`), saves via
 *   `useUpdateCommunityGuidelinesMutation` (in `useTransition`), wires the references paperclip via
 *   `useReferenceFileUpload(useStorageConfigContext())` (the space's own bucket, `temporaryLocation: true`), and wires
 *   `onApplyTemplate` → `useTemplatePicker(mode:'select', allowedTypes:['communityGuidelines'])`
 *   (replace `{title, bodyMarkdown, references}` behind a `ConfirmationDialog` when there is existing content) and
 *   `onSaveAsTemplate` → `useSaveAsTemplate(sourceKind:'communityGuidelines')` (open `TemplateFormDialog` pre-filled;
 *   if the editor has unsaved edits, prompt to save/discard first).
 *
 * NOTE: `bodyMarkdown` MUST be rendered through `MarkdownContent` in any read-only view (src/crd/CLAUDE.md Rule 10).
 */

import type { ReferenceRow } from './template-forms';

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
  /**
   * Per-row paperclip file-attach for the references editor (D24). Uploads a file and resolves the
   * stored URL, written into the row's `uri`. Wired by the integration hook via
   * `useReferenceFileUpload(useStorageConfigContext())`; omit to hide the paperclip.
   */
  onReferenceFileUpload?: (file: File) => Promise<string | null>;
  /** `accept` attribute for the references file picker. */
  referenceUploadAccept?: string;
  className?: string;
};
