/**
 * Contract: GraphQL → CRD-prop mappers and the integration hooks (the ONLY place GraphQL types meet CRD props).
 *
 * These live under `src/main/crdPages/templates/`, `src/main/crdPages/innovationPack/`,
 * `src/main/crdPages/innovationLibrary/`, and the existing `src/main/crdPages/topLevelPages/spaceSettings/templates/`.
 * Signatures below use `unknown` for GraphQL inputs deliberately — the real implementations import the
 * generated types from `@/core/apollo/generated/*`; this contract only fixes the OUTPUT shapes.
 */

import type {
  TemplateCardData,
  TemplateCategorySection,
  TemplateAction,
  TemplateType,
} from './templates-manager';
import type { TemplateContent } from './template-preview';
import type { TemplateFormValues } from './template-forms';
import type { TemplatePickerSource } from './template-picker';
import type {
  InnovationPackCardData,
  InnovationPackFormValues,
  InnovationPackProfileViewProps,
} from './innovation-pack';
import type { CommunityGuidelinesEditorProps, CommunityGuidelinesEditorValue } from './community-guidelines-editor';

// ---------- pure mappers ----------

/** GraphQL `Template` (profile + id + type) → card data. `bannerUrl` left undefined when no real visual; `color = pickColorFromId(id)`. */
export type MapTemplateToCardData = (gqlTemplate: unknown) => TemplateCardData;

/** GraphQL `TemplatesSet` → ordered category sections. */
export type MapTemplatesSetToCategories = (gqlTemplatesSet: unknown) => TemplateCategorySection[];

/** Lazy `TemplateContent` query result (conditional by type) → render-ready discriminated union. Ports the legacy `Previews/*` shaping logic as pure functions. */
export type MapTemplateContent = (gqlTemplateContent: unknown, type: TemplateType) => TemplateContent;

/** CRD form values → the appropriate Create/Update mutation input. Reuses the MUI-free `Forms/common/mappings.ts`. Image uploads happen separately in the hook. */
export type MapFormValuesToMutationInput = (
  values: TemplateFormValues,
  intent: 'create' | 'edit',
  templatesSetId: string,
  templateId?: string
) => unknown;

/** GraphQL `InnovationPack` → card data. */
export type MapInnovationPackToCardData = (gqlPack: unknown) => InnovationPackCardData;

/** GraphQL `InnovationPack` (+ templates set) → profile view props (read-only listing). */
export type MapInnovationPackToProfileViewProps = (gqlPack: unknown, canManage: boolean) => InnovationPackProfileViewProps;

/** GraphQL `InnovationPack` → editable form values. */
export type MapInnovationPackToFormValues = (gqlPack: unknown) => InnovationPackFormValues;

/** GraphQL `CommunityGuidelines` (`profile.{displayName, description, references}`) → the CRD editor value (FR-038). */
export type MapCommunityGuidelinesToEditorValue = (gqlCommunityGuidelines: unknown) => CommunityGuidelinesEditorValue;

// ---------- integration hooks (shapes) ----------

/**
 * Holder-agnostic templates manager. Builds `TemplatesManagerViewProps` minus the `holderKind`/permission props
 * (those come from the consumer). Owns: list query, delete confirmation + optimistic eviction, duplicate, and
 * the create/edit form lifecycle (delegating to `useTemplateForms`).
 */
export type UseTemplatesManager = (args: {
  templatesSetId: string | undefined;
  holderKind: 'space' | 'innovationPack';
  /** account id — used only when holderKind === 'space' to populate the picker's Account source. */
  accountId?: string;
}) => {
  categories: TemplateCategorySection[];
  loading: boolean;
  duplicatingId: string | null;
  deletingId: string | null;
  onCreate: (type: TemplateType) => void;
  onImport: (type: TemplateType) => void;       // no-op / unused when holderKind === 'innovationPack'
  onTemplateAction: (id: string, action: TemplateAction) => void;
  // dialog state surfaced for the page to render the CRD dialogs:
  preview: { open: boolean; header?: TemplateCardData; content?: TemplateContent; contentLoading: boolean; canEdit: boolean; onClose: () => void; onEdit: () => void };
  // `form` exposes the common-fields state + `submitting`/`onSubmit`/`onCancel`; the per-type form is rendered by
  // `useTemplateForms` into `perTypeFormSlot` (pure src/crd/.../forms/* for whiteboard/post/guidelines/space,
  // crdPages/templates/CalloutTemplateForm for callout) — see contracts/template-forms.ts `TemplateFormDialogProps`.
  form: { open: boolean; intent: 'create' | 'edit'; type: TemplateType; commonValue: unknown; commonErrors: Record<string, string>; perTypeFormSlot: unknown /* ReactNode */; submitting: boolean; onCommonChange: (v: unknown) => void; onSubmit: () => void; onCancel: () => void };
  picker: { open: boolean; sources: TemplatePickerSource[]; alreadyInSet: ReadonlySet<string>; search: string; onSearchChange: (s: string) => void; loading: boolean; onClose: () => void; onImport: (id: string) => void; onRemoveFromSet: (id: string) => void; onPreview: (id: string) => void; previewContent?: TemplateContent; previewLoading: boolean };
  pendingDelete: { id: string; name: string; isUsedAsDefault: boolean } | null;
  confirmDelete: () => Promise<void>;
  cancelDelete: () => void;
};

/**
 * The reusable template picker hook used by ALL consumption flows (callout creation, whiteboard, space/subspace,
 * community guidelines, innovation-flow phase default, post default). Loads Space/Account/Platform sources
 * filtered to `allowedTypes`, lazy-loads content for preview, and exposes `mode: 'select'` picker props.
 */
export type UseTemplatePicker = (args: {
  allowedTypes: TemplateType[];
  /** the current space's templates set, if in a space context (for the Space source section) */
  spaceTemplatesSetId?: string;
  accountId?: string;
}) => {
  openPicker: () => void;
  pickerProps: import('./template-picker').TemplatePickerSelectProps;
  selectedTemplateId: string | null;
  /** the lazily-loaded content of the selected template (so the consumer can pre-fill its form) */
  selectedTemplateContent: TemplateContent | null;
  clearSelection: () => void;
};

/**
 * The CRD community-guidelines editor host integration hook (FR-038). Loads the live `CommunityGuidelines`, maps it to
 * `CommunityGuidelinesEditorValue`, saves via `useUpdateCommunityGuidelinesMutation` (in `useTransition`), and wires
 * the apply-template (`useTemplatePicker({allowedTypes:['communityGuidelines']})`, replacement behind a ConfirmationDialog
 * when there is content) and save-as-template (`useSaveAsTemplate({sourceKind:'communityGuidelines'})`, save-or-discard
 * prompt when there are unsaved edits) sub-flows. Returns the props the CRD `CommunityGuidelinesEditor` component needs.
 */
export type UseCommunityGuidelinesEditor = (args: { communityGuidelinesId: string | undefined }) => CommunityGuidelinesEditorProps & { loading: boolean };
