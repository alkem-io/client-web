// Contract: VC Creation Wizard (US1) — CRD presentational props (plain TS, no GraphQL types)
// Layer 3 component: src/crd/components/virtualContributor/creationWizard/VCCreationWizardView.tsx
// These are DESIGN CONTRACTS for /speckit.tasks — refine names during implementation.

export type VcWizardStep =
  | 'initial'
  | 'loadingStep'
  | 'addKnowledge'
  | 'existingKnowledge'
  | 'externalProvider'
  | 'chooseCommunity'
  | 'tryVcInfo';

// Body-of-knowledge path chosen on the initial step.
export type VcWizardPath = 'writtenKnowledge' | 'existingSpace' | 'external';

export type VcWizardEngine = 'expert' | 'genericOpenai' | 'openaiAssistant';

export type VcWizardPost = {
  /** 3..SMALL_TEXT_LENGTH, required */
  title: string;
  /** markdown, up to LONG_MARKDOWN_TEXT_LENGTH */
  description: string;
};

export type VcWizardDocument = {
  /** 3..SMALL_TEXT_LENGTH, required */
  name: string;
  /** file-upload result URL or external URL, required */
  url: string;
};

export type VcWizardExternalConfig = {
  apiKey: string; // required for external path; never echoed from server
  assistantId?: string; // required when engine === 'openaiAssistant'
};

export type VcWizardAvatar = {
  previewUrl?: string;
  uploading: boolean;
};

export type VcCreationWizardValues = {
  name: string;
  tagline: string;
  description: string;
  path?: VcWizardPath;
  engine: VcWizardEngine;
  externalConfig?: VcWizardExternalConfig;
  avatar?: VcWizardAvatar;
  posts: VcWizardPost[];
  documents: VcWizardDocument[];
  /** existing-space path: chosen space/subspace to use as Body of Knowledge */
  selectedSpaceId?: string;
  /** chooseCommunity step: space to add the created VC into */
  selectedCommunitySpaceId?: string;
};

export type VcWizardSelectableSpace = {
  id: string;
  displayName: string;
  avatarUrl?: string;
  color: string; // pickColorFromId
  level: 'space' | 'subspace';
};

export type VcWizardCreatedVc = {
  id: string;
  profileUrl?: string;
  avatarId?: string;
};

export type VcCreationWizardErrors = Partial<Record<keyof VcCreationWizardValues, string>>;

export type VCCreationWizardViewProps = {
  step: VcWizardStep;
  values: VcCreationWizardValues;
  errorsByField: VcCreationWizardErrors;

  onChange: (patch: Partial<VcCreationWizardValues>) => void;
  onSelectPath: (path: VcWizardPath) => void;

  onNext: () => void;
  onBack: () => void;
  onCancel: () => void; // used by the final info step's "Done" button (no close/cancel button on the page)
  onSubmit: () => void; // triggers create mutation

  // data for the branch steps
  availableSpaces: VcWizardSelectableSpace[]; // existing-space + add-content paths
  availableCommunities: VcWizardSelectableSpace[]; // chooseCommunity step
  createdVc?: VcWizardCreatedVc;

  loading: boolean; // query loading (spaces, etc.)
  creating: boolean; // create mutation in flight (loadingStep)

  // upload
  onUploadAvatar: (file: File) => void;

  // post/document list management
  onAddPost: () => void;
  onRemovePost: (index: number) => void;
  onAddDocument: () => void;
  onRemoveDocument: (index: number) => void;
};

// Sub-dialogs (remain CRD dialogs; sticky header/footer rule applies)
//
// NOT BUILT — the cancel-confirm dialog was dropped during implementation: the wizard is a full
// page nested under user settings (no close/cancel button), so the user exits via the breadcrumb
// trail and in-progress input is discarded on navigation. Kept here for historical reference only.
export type VCWizardCancelDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export type VCExternalAIDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: VcWizardExternalConfig & { engine: VcWizardEngine };
  onChange: (patch: Partial<VcWizardExternalConfig & { engine: VcWizardEngine }>) => void;
  onCreate: () => void;
  comingSoonSlot?: import('react').ReactNode; // nested "request a provider" form
};

// OUT OF SCOPE for US1 / this spec (kept for reference only).
// The interactive "try the VC" demo dialog (`TryVirtualContributorDialog`) is launched from the
// space dashboard (`SpaceDashboardView`), NOT the creation wizard. The wizard's final step is an
// info/confirmation step (`TryVcInfoStep`). Do not build this as part of US1.
export type VCTryContributorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vcId: string;
  ready: boolean; // from useSubscribeOnVirtualContributorEvents
  calloutSlot?: import('react').ReactNode;
};
