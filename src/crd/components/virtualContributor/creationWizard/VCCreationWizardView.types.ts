import type { ReactNode } from 'react';

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

export type VcWizardIdentityValues = {
  name: string;
  tagline: string;
  description: string;
};

export type VcWizardPost = {
  /** 3..SMALL_TEXT_LENGTH, required */
  title: string;
  /** markdown */
  description: string;
};

export type VcWizardDocument = {
  /** 3..SMALL_TEXT_LENGTH, required */
  name: string;
  /** file-upload result URL or external URL, required */
  url: string;
};

export type VcWizardSelectableSpace = {
  id: string;
  displayName: string;
  avatarUrl?: string;
  color: string;
  level: 'space' | 'subspace';
  /** Subspaces selectable as a body-of-knowledge target (existing-space path). */
  subspaces?: VcWizardSelectableSpace[];
};

export type VcWizardCreatedVc = {
  id: string;
  name: string;
  profileUrl?: string;
};

/**
 * Props for the full-page CRD VC creation wizard shell. All data + behavior
 * arrive via props; the integration hook (`useVcCreationWizard`) owns the
 * state machine and GraphQL orchestration.
 */
export type VCCreationWizardViewProps = {
  step: VcWizardStep;

  // initial step — identity form (value/onChange controlled by the integration layer)
  identity: VcWizardIdentityValues;
  onChangeIdentity: (patch: Partial<VcWizardIdentityValues>) => void;
  onUploadAvatar: (file: File) => void;
  avatarPreviewUrl?: string;
  identityValid: boolean;
  onSelectPath: (path: VcWizardPath) => void;

  // add-knowledge step
  posts: VcWizardPost[];
  documents: VcWizardDocument[];
  onChangePosts: (posts: VcWizardPost[]) => void;
  onChangeDocuments: (documents: VcWizardDocument[]) => void;
  onSubmitKnowledge: () => void;

  // existing-space step
  availableSpaces: VcWizardSelectableSpace[];
  onSubmitExistingSpace: (spaceId: string) => void;

  // choose-community step
  availableCommunities: VcWizardSelectableSpace[];
  onChooseCommunity: (spaceId: string | undefined) => void;

  // try-vc info (final) step
  createdVc?: VcWizardCreatedVc;

  // navigation / chrome
  onBack: () => void;
  onCancel: () => void;
  loading: boolean;

  // transient sub-dialogs rendered by the integration layer (external-AI, cancel-confirm)
  externalDialogSlot?: ReactNode;
  cancelDialogSlot?: ReactNode;
};
