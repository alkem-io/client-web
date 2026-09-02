/**
 * Contract: the reusable template picker dialog.
 *
 * CRD component: `src/crd/components/templates/TemplatePicker.tsx` (+ `TemplatePickerCard.tsx`)
 *
 * Two modes (discriminated union):
 *  - `mode: 'import'`  — persistent library manager. Used ONLY by the Space Settings → Templates tab
 *                        (a Space holder importing into its set). Dialog stays open after each import;
 *                        templates already in the set are marked and removable from within the dialog.
 *                        **Sources here are Account + Platform ONLY** — the Space's own set is not a source
 *                        for importing into itself (matches the legacy `disableSpaceTemplates: true`). This
 *                        is a deliberate consolidation of the two legacy import surfaces (the Space-templates
 *                        import dialog, which closed after each import, + the default-template selector,
 *                        which had the mark/remove behaviour) — not a 1:1 re-implementation of either.
 *  - `mode: 'select'`  — single-pick-then-apply. Used by every CONSUMPTION flow (callout creation,
 *                        whiteboard creation, space/subspace creation, community guidelines, innovation-flow
 *                        phase default, callout contribution-defaults post template) and internally by
 *                        SetDefaultTemplateDialog (`flowStateDefaultCalloutTemplate` only) / SaveAsTemplateDialog.
 *                        Selecting closes the dialog; a persistent "no template / start blank" affordance clears it.
 *                        Sources: Account + Platform always, **Space when there is a Space context** (it's a valid
 *                        source for, e.g., callout creation).
 *
 * Both modes: an empty source section is omitted; if every source is empty the picker shows a "no templates
 * available" message (not an empty dialog); a **free-text search filter** over name/description/tags is shown
 * when any source is non-empty (mirrors the legacy `ImportTemplatesDialogGallery` search box).
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
