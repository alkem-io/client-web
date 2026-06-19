import type { MarkdownUploadProps } from '@/crd/forms/markdown/MarkdownEditor';

export type VcWizardStep =
  | 'initial'
  | 'loadingStep'
  | 'addKnowledge'
  | 'existingKnowledge'
  | 'externalProvider'
  | 'chooseCommunity'
  | 'tryVcInfo';

/** Body-of-knowledge path chosen on the initial step. */
export type VcWizardPath = 'writtenKnowledge' | 'existingSpace' | 'external';

export type VcWizardEngine = 'expert' | 'genericOpenai' | 'openaiAssistant';

export type VcWizardIdentityValues = {
  name: string;
  tagline: string;
  description: string;
};

export type VcWizardPost = {
  title: string;
  description: string;
};

export type VcWizardDocument = {
  name: string;
  url: string;
};

export type VcWizardSelectableSpace = {
  id: string;
  displayName: string;
  avatarUrl?: string;
  color: string;
  level: 'space' | 'subspace';
  subspaces?: VcWizardSelectableSpace[];
};

export type VcWizardCreatedVc = {
  id: string;
  name: string;
  profileUrl?: string;
};

export type VcWizardExternalConfig = {
  engine: VcWizardEngine;
  apiKey: string;
  assistantId: string;
};

/**
 * Props for the CRD VC creation wizard dialog. All data + behavior arrive via
 * props; the integration hook (`useVcCreationWizard`) owns the state machine and
 * GraphQL orchestration. The view renders every step inside a single dialog
 * (sticky header/footer, scrollable middle) and owns only the transient image-
 * crop sub-dialog (local open state).
 */
export type VCCreationWizardViewProps = {
  /** Controls the dialog visibility (owned by the launch point). */
  open: boolean;
  /** Close the dialog (X button, Esc, overlay click, or the final step's Done). */
  onClose: () => void;
  step: VcWizardStep;
  loading: boolean;

  // ── initial step — identity form ──
  identity: VcWizardIdentityValues;
  onChangeIdentity: (patch: Partial<VcWizardIdentityValues>) => void;
  onUploadAvatar: (file: File) => void;
  avatarPreviewUrl?: string;
  identityValid: boolean;
  selectedPath?: VcWizardPath;
  onSelectPath: (path: VcWizardPath) => void;
  /** Commit the initial step and advance along the selected path. */
  onSubmitInitial: () => void;

  // ── add-knowledge step ──
  posts: VcWizardPost[];
  documents: VcWizardDocument[];
  onChangePosts: (posts: VcWizardPost[]) => void;
  onChangeDocuments: (documents: VcWizardDocument[]) => void;
  onSubmitKnowledge: () => void;
  /**
   * Upload a document file directly from a document row (the paperclip). Resolves
   * to the uploaded file URL (written into the row), or `null` on failure. Absent
   * when the viewer lacks upload privilege on the account bucket — the row then
   * stays link-only. The connector targets the owning account's storage bucket as
   * a temporary file; the server relocates it to the VC on creation.
   */
  onDocumentUpload?: (file: File) => Promise<string | null>;
  /** `accept` attribute for the document file picker (extension list). */
  documentUploadAccept?: string;

  // ── existing-space step ──
  availableSpaces: VcWizardSelectableSpace[];
  onSubmitExistingSpace: (spaceId: string) => void;

  // ── external-provider step ──
  externalConfig: VcWizardExternalConfig;
  onChangeExternalConfig: (patch: Partial<VcWizardExternalConfig>) => void;
  externalValid: boolean;
  onSubmitExternal: () => void;
  /** Slot for the "request another AI provider" coming-soon form. */
  comingSoonSlot?: import('react').ReactNode;

  // ── choose-community step ──
  availableCommunities: VcWizardSelectableSpace[];
  onChooseCommunity: (spaceId: string | undefined) => void;

  // ── try-vc info (final) step ──
  createdVc?: VcWizardCreatedVc;

  // ── chrome ──
  onBack: () => void;
} & MarkdownUploadProps;
