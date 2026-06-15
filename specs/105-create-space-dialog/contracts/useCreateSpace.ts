// Contract: integration hook `useCreateSpace` + connector `CrdCreateSpaceDialog`
// Location (impl):
//   src/main/crdPages/topLevelPages/createSpace/useCreateSpace.ts
//   src/main/crdPages/topLevelPages/createSpace/CrdCreateSpaceDialog.tsx
//
// The only GraphQL <-> CRD-props seam. Reuses the existing domain hooks
// (useSpaceCreation, useSpacePlans/usePlanAvailability), the shared
// useTemplatePicker, and resizeImageToConstraints. NO @mui/* imports.
// Mirrors useCreateSubspace, plus account scoping, license-plan selection,
// URL-slug derivation, and post-create navigation/cache/log side-effects.
//
// The Description field is kept (research R3): the CONNECTOR supplies the
// MarkdownUploadProps via useMarkdownEditorIntegration({ temporaryLocation: true })
// and wraps the dialog in an account-scoped StorageConfigContextProvider — the
// hook itself just holds `description` in form state.

import type {
  CreateSpaceFieldErrors,
  CreateSpaceFormValues,
  CreateSpaceVisualConstraints,
} from './createSpaceDialog';

/** Minimal shape of the created Space the connector needs. */
export type CreatedSpaceResult = {
  id: string;
  about: { profile: { url: string } };
};

export type UseCreateSpaceOptions = {
  /** Controlled open state — owned by the account tab and passed through the connector. */
  open: boolean;
  /** Target account the Space is created in (user's own, or an organization's). */
  accountId: string | undefined;
  /** Closes the dialog (resets the owner's open state). Called on cancel and on success. */
  onClose: () => void;
  /**
   * Optional override of the success behavior. When omitted, the hook navigates
   * to the new Space's url. When provided, the caller handles the result.
   */
  onSpaceCreated?: (space: CreatedSpaceResult) => void;
};

/** A banner/card image awaiting crop in the ImageCropDialog (research R16). */
export type CreateSpacePendingCrop = {
  key: 'bannerFile' | 'cardBannerFile';
  file: File;
  config: unknown; // impl: ImageCropConfig from @/crd/components/common/ImageCropDialog
};

export type UseCreateSpaceResult = {
  values: CreateSpaceFormValues;
  errors: CreateSpaceFieldErrors;

  // --- Image crop dialog (research R16) ---
  // Non-null while a picked banner/card image is being cropped. The connector
  // renders <ImageCropDialog ... /> off this and feeds back the cropped file +
  // alt text via onCropComplete.
  pendingCrop: CreateSpacePendingCrop | null;
  onCropComplete: (file: File, altText: string) => void;
  onCropCancel: () => void;

  // --- Template picker (consumer renders <TemplatePicker {...picker} />) ---
  // Sources are NOT pre-filtered: the picker's card rows carry no innovation-flow
  // data, so L0 selectability (a complete 4-state flow) is enforced on selection
  // — a non-conforming pick is rejected with a notification and not applied
  // (research R6).
  picker: unknown; // impl: TemplatePickerSelectProps from @/crd/components/templates/types
  onOpenTemplatePicker: () => void;
  onClearTemplate: () => void;
  selectedTemplateName: string | undefined;
  selectedTemplateContent: unknown | undefined; // impl: TemplateContent
  selectedTemplateLoading: boolean;
  // Overwrite-confirm when a template is picked over user-entered content:
  overwriteConfirmOpen: boolean;
  onConfirmOverwriteTemplate: () => void;
  onCancelOverwriteTemplate: () => void;

  // --- Visual constraints ---
  bannerConstraints: CreateSpaceVisualConstraints | null;
  cardBannerConstraints: CreateSpaceVisualConstraints | null;

  // --- Submission ---
  submitting: boolean;
  canSubmit: boolean;
  /** availablePlans.length === 0 once plans have loaded. */
  noPlanAvailable: boolean;

  // --- Handlers ---
  onChange: (patch: Partial<CreateSpaceFormValues>) => void;
  onSubmit: () => Promise<void>;
};

/** The hook. */
export type UseCreateSpace = (options: UseCreateSpaceOptions) => UseCreateSpaceResult;

/**
 * Connector mounted by the account tabs. Owns the dialog + the TemplatePicker +
 * the overwrite-confirm dialog. Wraps everything in an account-scoped
 * `StorageConfigContextProvider` and feeds the dialog the markdown upload props
 * from `useMarkdownEditorIntegration({ temporaryLocation: true })`, the
 * `termsUrl` from platform config (`config.locations.terms`), and the
 * `urlPrefix` from `usePlatformOrigin()` (+ `/`, lowercased). When `accountName`
 * is provided (org tab) it drives the account-aware subtitle (FR-020).
 * Replaces the MUI `<CreateSpace accountId open onClose />` at both entry points.
 */
export type CrdCreateSpaceDialogProps = {
  open: boolean;
  onClose: () => void;
  accountId: string;
  /** Organization account display name — passed from the org tab; omitted on the user's own account. */
  accountName?: string;
  onSpaceCreated?: (space: CreatedSpaceResult) => void;
};
