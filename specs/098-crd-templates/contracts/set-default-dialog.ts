/**
 * Contract: "set a template as a default" and "save something as a template" dialogs.
 *
 * CRD components (generalised from the spec-045 dialogs):
 *  - `src/crd/components/templates/SetDefaultTemplateDialog.tsx`  (← ChangeDefaultSubspaceTemplateDialog)
 *  - `src/crd/components/templates/SaveAsTemplateDialog.tsx`      (← SaveSubspaceAsTemplateDialog)
 *
 * Both reuse `TemplatePicker` in `mode: 'select'` internally for the pick step.
 *
 * `SetDefaultTemplateDialog` is used for:
 *  - the Space's default Space/content template (used when creating a subspace) — `updateTemplateDefault`
 *  - an innovation-flow PHASE's default callout template — the existing flow-settings path
 * `SaveAsTemplateDialog` captures a source (a space/subspace today; structured for callout-as-template later)
 * as a new template in a chosen destination templates set — `createTemplateFromSpace` / `createTemplateFromContentSpace`.
 */

import type { TemplateCardData, TemplateType } from './templates-manager';
import type { TemplateContent } from './template-preview';
import type { TemplatePickerSource } from './template-picker';

export type SetDefaultTemplateDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Which default is being set — drives the title/copy only. */
  purpose: 'defaultSubspaceTemplate' | 'phaseDefaultCalloutTemplate';
  /** Restrict to this template type ('space' for default subspace template; 'callout' for phase default). */
  allowedType: TemplateType;
  /** Currently-set default, if any (shown as selected; offer to clear). */
  currentTemplate?: TemplateCardData;
  sources: TemplatePickerSource[];
  onPreview: (templateId: string) => void;
  previewContent?: TemplateContent;
  previewLoading: boolean;
  /** Commit a new default (or `null` to clear it). */
  onConfirm: (templateId: string | null) => void;
  confirming: boolean;
};

export type SaveAsTemplateDialogProps = {
  open: boolean;
  onClose: () => void;
  /** What is being captured — drives copy; 'space' covers both spaces and subspaces. */
  sourceKind: 'space';
  /** Human label of the source (e.g. the subspace name) for the dialog copy. */
  sourceName: string;
  /** Initial name for the new template (usually prefilled from the source). */
  initialName: string;
  /** Offer the "include nested subspaces" toggle. */
  allowRecursive: boolean;
  /** Where the new template will be created — usually the current space's templates set. */
  destinationTemplatesSetLabel: string;
  onConfirm: (input: { name: string; description?: string; recursive: boolean }) => void;
  confirming: boolean;
};
