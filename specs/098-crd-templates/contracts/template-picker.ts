/**
 * Contract: the reusable template picker dialog.
 *
 * CRD component: `src/crd/components/templates/TemplatePicker.tsx` (+ `TemplatePickerCard.tsx`)
 *
 * Two modes (discriminated union):
 *  - `mode: 'import'`  — persistent library manager. Used ONLY by the Space Settings → Templates tab
 *                        (a Space holder importing into its set). Dialog stays open after each import;
 *                        templates already in the set are marked and removable from within the dialog.
 *  - `mode: 'select'`  — single-pick-then-apply. Used by every CONSUMPTION flow (callout creation,
 *                        whiteboard creation, space/subspace creation, community guidelines, innovation-flow
 *                        phase default, callout contribution-defaults post template) and internally by
 *                        SetDefaultTemplateDialog / SaveAsTemplateDialog. Selecting closes the dialog;
 *                        a persistent "no template / start blank" affordance clears the selection.
 *
 * Sources are always grouped Space / Account / Platform; an empty source section is omitted; if every
 * source is empty the picker shows a "no templates available" message (not an empty dialog).
 */

import type { TemplateCardData, TemplateType } from './templates-manager';
import type { TemplateContent } from './template-preview';

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
  sources: TemplatePickerSource[];
  /** Overall loading (e.g. resolving the destination templates set id). */
  loading?: boolean;
  /** Ask the consumer to lazy-load the full content of `templateId` for the preview pane. */
  onPreview: (templateId: string) => void;
  /** The lazily-loaded preview content; `undefined` while loading. */
  previewContent?: TemplateContent;
  previewLoading: boolean;
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
