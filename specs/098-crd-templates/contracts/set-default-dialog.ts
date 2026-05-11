/**
 * Contract: "set a template as a default" and "save something as a template" dialogs.
 *
 * CRD components (generalised from the spec-045 dialogs):
 *  - `src/crd/components/templates/SetDefaultTemplateDialog.tsx`  (← ChangeDefaultSubspaceTemplateDialog)
 *  - `src/crd/components/templates/SaveAsTemplateDialog.tsx`      (= `TemplateFormDialog` in create mode, pre-filled — ← SaveSubspaceAsTemplateDialog)
 *
 * `SetDefaultTemplateDialog` covers two purposes with DIFFERENT source scopes (matching the legacy app):
 *  - `purpose: 'defaultSubspaceTemplate'` — the Space's default Space/content template used when creating a subspace
 *    (`updateTemplateDefault`). Candidates are the holder's OWN Space templates only (the default must reference a
 *    template that is in the set — the legacy `SelectDefaultSpaceTemplateDialog` is a plain dropdown of those). CRD
 *    adds a candidate preview (an enhancement), but does NOT host the 3-source `TemplatePicker` here.
 *  - `purpose: 'flowStateDefaultCalloutTemplate'` — an innovation-flow STATE/phase's default callout template
 *    (`setDefaultCalloutTemplateOnInnovationFlowState` / `removeDefaultCalloutTemplateOnInnovationFlowState`). Candidates
 *    are Space / Account / Platform — this purpose hosts `TemplatePicker` in `mode: 'select'`. The CRD label is
 *    "Default callout template", correcting the legacy "Default post template" mislabel.
 *
 * `SaveAsTemplateDialog` IS `TemplateFormDialog` opened in `intent: 'create'` with `value` pre-filled from a source entity:
 *  - a callout → a Callout template form (no-regression — replaces the CRD→MUI bridge in `CalloutSettingsConnector`; `useCreateCalloutTemplate`)
 *  - the current community guidelines → a Community Guidelines template form (a deliberate NEW flow — the legacy editor only *applies* a guidelines template; `createTemplate` with `communityGuidelinesData`)
 *  - a subspace → a Space template form with `sourceSpaceId` = the subspace (no-regression — `createTemplateFromSpace` / `createTemplateFromContentSpace`)
 * If the source entity has unsaved changes, a `ConfirmationDialog` ("save or discard first") gates it. So this contract
 * doesn't introduce new props beyond `TemplateFormDialog`'s — `useSaveAsTemplate` builds the pre-filled `value` and routes the submit.
 */

import type { TemplateCardData } from './templates-manager';
import type { TemplateContent } from './template-preview';
import type { TemplatePickerSource } from './template-picker';

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

// SaveAsTemplateDialogProps — see `template-forms.ts` (`TemplateFormDialogProps`): this is `TemplateFormDialog` in
// `intent: 'create'` with a pre-filled `value`. No separate prop type is needed; `useSaveAsTemplate` supplies the value.
