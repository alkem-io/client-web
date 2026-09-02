// Contract: CRD presentational component `CreateSpaceDialog`
// Location (impl): src/crd/components/space/CreateSpaceDialog.tsx
//
// Pure presentational — plain TypeScript props only (no GraphQL/MUI types).
// The parent (CrdCreateSpaceDialog connector via useCreateSpace) owns ALL
// state, validation, plan selection, image resize, and the submit mutation.
//
// CLONE of src/crd/components/space/settings/CreateSubspaceDialog.tsx, with:
//   • Avatar visual → Page Banner (VisualType.Banner); Card Banner unchanged.
//     The two banner uploaders render SIDE BY SIDE on wide screens (FR-004).
//   • + URL slug field with the platform-origin prefix (`urlPrefix`) (L0 needs a nameID).
//   • + "Add Tutorials" checkbox (in the body) and a required "Accept terms"
//     checkbox in the FOOTER next to Cancel/Create (FR-007), its link opens a terms dialog.
//   • + a no-available-plan message.
//   • Account-aware subtitle via `accountName` (FR-020).
// The markdown Description field is KEPT (matches the Subspace dialog — research R3).

/** Editable form state. Same as the Subspace dialog's, plus nameId / banner / tutorials / terms. */
export type CreateSpaceFormValues = {
  displayName: string;
  /** URL slug (`nameID`). Auto-derived from displayName until the user edits it. */
  nameId: string;
  tagline: string;
  /** Markdown. Inline images upload to a temporary account bucket (connector wiring). */
  description: string;
  tags: string[];
  /** '' = create a blank Space (no template). */
  spaceTemplateId: string;
  /** Page Banner (VisualType.Banner). Uploaded to the new Space after creation. */
  bannerFile: File | null;
  /** Card Banner (VisualType.Card). Uploaded to the new Space after creation. */
  cardBannerFile: File | null;
  addTutorialCallouts: boolean;
  /** Must be true to enable submit. */
  acceptedTerms: boolean;
};

export type CreateSpaceFieldErrors = Partial<Record<keyof CreateSpaceFormValues, string | undefined>>;

export type CreateSpaceVisualConstraints = {
  maxWidth: number;
  maxHeight: number;
  minWidth: number;
  minHeight: number;
  aspectRatio: number;
  /** MIME types for the file <input accept> (used verbatim, e.g. "image/png"). */
  allowedTypes: string[];
};

/** Markdown editor image-upload wiring (same shape the Subspace dialog receives). */
export type MarkdownUploadProps = {
  onImageUpload: (file: File) => Promise<string>;
  iframeAllowedUrls?: string[];
  onError?: (message: string) => void;
};

export type CreateSpaceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  values: CreateSpaceFormValues;
  errors: CreateSpaceFieldErrors;

  // --- Template selector (shared TemplatePicker rendered by the consumer) ---
  selectedTemplateName?: string;
  selectedTemplateContent?: unknown; // impl: TemplateContent from @/crd/components/templates/types
  selectedTemplateLoading?: boolean;
  onOpenTemplatePicker: () => void;
  /** Clears the selected template — the Space is then created blank. */
  onClearTemplate: () => void;

  // --- Visual constraints (drive the resolution hint + accept attr) ---
  bannerConstraints: CreateSpaceVisualConstraints | null;
  cardBannerConstraints: CreateSpaceVisualConstraints | null;

  // --- Terms ---
  /** External "read more" Terms & Conditions URL (from platform config, passed in). */
  termsUrl?: string;

  // --- Presentation (resolved by the connector) ---
  /** Origin shown as the slug prefix, e.g. "https://alkem.io/" (lowercased). */
  urlPrefix?: string;
  /** Organization account name for the subtitle; omitted for the user's own account (FR-020). */
  accountName?: string;

  // --- Submission ---
  submitting: boolean;
  canSubmit: boolean;
  /** True when the account has no available Space plan — shows the no-plan message and blocks submit. */
  noPlanAvailable: boolean;

  // --- Handlers (behavior lives in the consumer) ---
  /** Patch form state. The hook auto-derives nameId from displayName until the user edits the slug. */
  onChange: (patch: Partial<CreateSpaceFormValues>) => void;
  onSubmit: () => void;
} & MarkdownUploadProps;
