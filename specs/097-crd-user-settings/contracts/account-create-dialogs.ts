/**
 * Account-tab creation dialogs — view contracts (FR-034 / research Decision #3).
 *
 * The four "Create" affordances on the User Account tab (Story 2) and the Org Account tab
 * (Story 9) open CRD (shadcn) dialogs/wizard that are parity ports of the current-MUI dialogs
 * (`CreateSpace` / `useVirtualContributorWizard` / `CreateInnovationPackDialog` /
 * `CreateInnovationHubDialog`). The presentational components live under
 * `src/crd/components/contributor/settings/create/` (single-step) and
 * `src/crd/components/contributor/settings/createVc/` (the VC wizard shell + step components).
 *
 * These components are pure CRD: zero `@mui/*` / `@emotion/*` imports, plain-TypeScript props,
 * no GraphQL types, all behavior (submit / cancel / step navigation / file pick) received as
 * callback props. The Apollo wiring (the existing create mutation hooks, visual uploads,
 * license-plan resolution, refetches) lives in the shared per-flow integration hooks under
 * `src/main/crdPages/topLevelPages/account/` (`useCrdCreateSpace`,
 * `useCrdCreateVirtualContributorWizard`, `useCrdCreateInnovationPack`, `useCrdCreateInnovationHub`).
 * Both `CrdUserAccountTab` and `CrdOrgAccountTab` mount the same dialogs, passing the actor's
 * `account.id` as the creation target. No new GraphQL types or mutations are introduced.
 *
 * See data-model.md "User Story 2 → Account-tab creation dialogs" for the field-to-mutation-variable
 * mapping and the validation rules.
 */

/* ---------------------------------------------------------------------------------------------- *
 * Shared shapes
 * ---------------------------------------------------------------------------------------------- */

/** Visual-upload constraints, mirrored from the `Visual` GraphQL type (parity with `CreateSubspaceDialog`). */
export type CreateVisualConstraints = {
  maxWidth: number;
  maxHeight: number;
  minWidth: number;
  minHeight: number;
  aspectRatio: number;
  allowedTypes: string[];
};

/** Per-flow submit status surfaced inline in the dialog footer. */
export type CreateDialogStatus =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'error'; message: string };

/** Base props shared by every single-step creation dialog. */
type BaseCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Inline status; on `submitting` the submit button shows `aria-busy` and is disabled. */
  status: CreateDialogStatus;
  /** True only when every required field is valid (live format validators included). */
  canSubmit: boolean;
  onSubmit: () => void;
};

/* ---------------------------------------------------------------------------------------------- *
 * 1. Create Space  →  CrdCreateSpaceDialog   (← MUI CreateSpace / CreateSpaceForm / useSpaceCreation)
 * ---------------------------------------------------------------------------------------------- */

export type CreateSpaceTemplateChoice = {
  /** Only templates with exactly 4 innovation-flow states are offered (parity with MUI). */
  id: string;
  name: string;
};

export type CreateSpaceFormValues = {
  displayName: string;
  /** Auto-generated from `displayName`, editable; alphanumeric + hyphens; unique within the account. */
  nameID: string;
  tagline: string;
  /** Markdown. */
  description: string;
  tags: string[];
  /** UUID of the chosen space template, or '' for none. */
  spaceTemplateId: string;
  addTutorialCallouts: boolean;
  bannerFile: File | null;
  cardBannerFile: File | null;
  /** Must be true to submit; not sent to the server. */
  acceptedTerms: boolean;
};

export type CreateSpaceFieldErrors = Partial<Record<keyof CreateSpaceFormValues, string | undefined>>;

export type CrdCreateSpaceDialogProps = BaseCreateDialogProps & {
  values: CreateSpaceFormValues;
  errors: CreateSpaceFieldErrors;
  templates: CreateSpaceTemplateChoice[];
  templatesLoading: boolean;
  bannerConstraints: CreateVisualConstraints | null;
  cardBannerConstraints: CreateVisualConstraints | null;
  /** href the "accepted terms" checkbox label links to. */
  termsHref: string;
  onChange: (patch: Partial<CreateSpaceFormValues>) => void;
};

/* ---------------------------------------------------------------------------------------------- *
 * 2. Create Virtual Contributor  →  CrdCreateVirtualContributorWizard   (← MUI useVirtualContributorWizard)
 *    Full parity port of the multi-step wizard.
 * ---------------------------------------------------------------------------------------------- */

export type VcWizardStep =
  | 'initial'        // profile + source selector
  | 'addKnowledge'   // posts[] + documents[]
  | 'chooseCommunity'// pick existing space or create one
  | 'existingSpace'  // pick a space/subspace as the body of knowledge
  | 'externalAi'     // engine + apiKey (+ assistantId)
  | 'tryVcInfo';     // success screen

export type VcKnowledgeSource = 'createSpace' | 'existingSpace' | 'external';

/** Engine enum values (mirrors `AiPersonaEngine` — kept as a plain string union in the CRD layer). */
export type VcEngine = 'expert' | 'genericOpenai' | 'openaiAssistant';

/** Body-of-knowledge type (mirrors `VirtualContributorBodyOfKnowledgeType`). */
export type VcBodyOfKnowledgeType = 'alkemioKnowledgeBase' | 'alkemioSpace' | 'none';

export type VcInitialStepValues = {
  name: string;
  tagline: string;
  description: string; // markdown
  avatarFile: File | null;
  engine: VcEngine;
  bodyOfKnowledgeType: VcBodyOfKnowledgeType;
  knowledgeSource: VcKnowledgeSource;
};

export type VcKnowledgePost = { title: string; description: string };
export type VcKnowledgeDocument = { name: string; url: string };

export type VcAddKnowledgeStepValues = {
  posts: VcKnowledgePost[];      // 1–25
  documents: VcKnowledgeDocument[]; // 0..n
};

export type VcChooseCommunityStepValues = {
  /** '' = create a new space for the VC. */
  spaceId: string;
};

export type VcExistingSpaceStepValues = {
  subspaceId: string;
};

export type VcExternalAiStepValues = {
  engine: Extract<VcEngine, 'genericOpenai' | 'openaiAssistant'>;
  apiKey: string;
  /** Required only when `engine === 'openaiAssistant'`. */
  assistantId: string;
};

/** A space/subspace option offered in the choose-community / existing-space steps. */
export type VcSpaceChoice = {
  id: string;
  displayName: string;
  /** Indentation level for hierarchical rendering (0 = L0, 1/2 = subspaces). */
  level: 0 | 1 | 2;
};

export type CrdCreateVirtualContributorWizardProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step: VcWizardStep;
  status: CreateDialogStatus;
  canSubmitCurrentStep: boolean;
  /** Advances the wizard (validates the current step, fires its mutation, transitions). */
  onSubmitStep: () => void;
  /** Goes back one step (where the MUI wizard allows it). */
  onBack: () => void;

  // step values + change handlers (only the active step's slice is read)
  initial: VcInitialStepValues;
  onChangeInitial: (patch: Partial<VcInitialStepValues>) => void;
  addKnowledge: VcAddKnowledgeStepValues;
  onChangeAddKnowledge: (patch: Partial<VcAddKnowledgeStepValues>) => void;
  chooseCommunity: VcChooseCommunityStepValues;
  onChangeChooseCommunity: (patch: Partial<VcChooseCommunityStepValues>) => void;
  existingSpace: VcExistingSpaceStepValues;
  onChangeExistingSpace: (patch: Partial<VcExistingSpaceStepValues>) => void;
  externalAi: VcExternalAiStepValues;
  onChangeExternalAi: (patch: Partial<VcExternalAiStepValues>) => void;

  // data the steps render
  avatarConstraints: CreateVisualConstraints | null;
  /** Spaces the VC can be added to / used as BoK (from the account's spaces + the user's memberships). */
  availableSpaces: VcSpaceChoice[];
  availableSpacesLoading: boolean;

  // try-VC info (step 'tryVcInfo')
  createdVcName: string;
  createdVcUrl?: string;
};

/* ---------------------------------------------------------------------------------------------- *
 * 3. Create Innovation Pack  →  CrdCreateInnovationPackDialog   (← MUI CreateInnovationPackDialog)
 * ---------------------------------------------------------------------------------------------- */

export type CreateInnovationPackFormValues = {
  displayName: string;
  description: string; // markdown
};

export type CreateInnovationPackFieldErrors = Partial<
  Record<keyof CreateInnovationPackFormValues, string | undefined>
>;

export type CrdCreateInnovationPackDialogProps = BaseCreateDialogProps & {
  values: CreateInnovationPackFormValues;
  errors: CreateInnovationPackFieldErrors;
  onChange: (patch: Partial<CreateInnovationPackFormValues>) => void;
};

/* ---------------------------------------------------------------------------------------------- *
 * 4. Create Innovation Hub  →  CrdCreateInnovationHubDialog   (← MUI CreateInnovationHubDialog)
 * ---------------------------------------------------------------------------------------------- */

export type CreateInnovationHubFormValues = {
  /** alphanumeric + hyphens; unique. */
  subdomain: string;
  displayName: string;
  tagline: string;
  description: string; // markdown
};

export type CreateInnovationHubFieldErrors = Partial<
  Record<keyof CreateInnovationHubFormValues, string | undefined>
>;

export type CrdCreateInnovationHubDialogProps = BaseCreateDialogProps & {
  values: CreateInnovationHubFormValues;
  errors: CreateInnovationHubFieldErrors;
  onChange: (patch: Partial<CreateInnovationHubFormValues>) => void;
};
