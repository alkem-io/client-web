/**
 * CONTRACT — Create Innovation Hub (CRD) — strict MUI parity (Clarifications 2026-06-15)
 *
 * Status: NEW. Build mirroring the Create Subspace / Create Innovation Pack pattern:
 *  - pure dialog        src/crd/components/innovationHub/CreateInnovationHubDialog.tsx
 *  - types              src/crd/components/innovationHub/createInnovationHub.types.ts
 *  - connector          src/main/crdPages/innovationHub/CrdCreateInnovationHubDialog.tsx
 *  - hook               src/main/crdPages/innovationHub/useCreateInnovationHub.ts
 *  - validation schema  src/main/crdPages/innovationHub/createInnovationHubSchema.ts
 *
 * No schema change — reuses generated useCreateInnovationHubMutation / CreateInnovationHubOnAccountInput.
 * Boundaries: pure component (no GraphQL/routing/auth); data + behavior via props. Validation +
 * mutation + storage + markdown-upload in the connector/hook.
 */

import type { MarkdownUploadProps } from '@/crd/forms/markdown/MarkdownEditor';

// ── Presentational component (src/crd/components/innovationHub) ───────────────

export type CreateInnovationHubValues = {
  /** required → hubData.subdomain. Format ^[a-z0-9-]*$, length 3–25. Uniqueness server-checked. */
  subdomain: string;
  /** required → profileData.displayName. trim, min 3, max 128, not blank. */
  name: string;
  /** optional → profileData.tagline. max 512. */
  tagline: string;
  /** required → profileData.description. Markdown, max 8000. */
  description: string;
};

export type CreateInnovationHubErrors = Partial<Record<keyof CreateInnovationHubValues, string>>;

export type CreateInnovationHubDialogProps = {
  open: boolean;
  onClose: () => void;
  value: CreateInnovationHubValues;
  errors: CreateInnovationHubErrors;
  onChange: (next: CreateInnovationHubValues) => void;
  onCreate: () => void;
  /** in-flight: disable inputs/Create, spinner, block close. */
  creating: boolean;
  /** account display name for the subtitle. */
  accountName?: string;
} & MarkdownUploadProps; // markdown editor wiring for the description

// ── Integration hook (src/main/crdPages/innovationHub) ────────────────────────

export type UseCreateInnovationHubArgs = {
  accountId: string | undefined;
  /** fires after create resolves. NO navigation. */
  onCreated?: (id: string) => void;
};

export type UseCreateInnovationHubResult = {
  create: (values: CreateInnovationHubValues) => Promise<string | undefined>;
  creating: boolean;
};
//
// Mutation variables (verified against the MUI dialog):
//   hubData: {
//     accountID,
//     subdomain: values.subdomain,
//     profileData: { displayName: values.name, tagline: values.tagline, description: values.description },
//     type: InnovationHubType.List,   // fixed
//     spaceListFilter: [],            // empty
//   }
//   refetchQueries: ['AdminInnovationHubsList','AccountInformation']
//
// Client validation (createInnovationHubSchema, yup-on-submit, t('validation.*') mapping):
//   subdomain: matches ^[a-z0-9-]*$ + min 3 + max 25 + required
//   name:      trim + min 3 + max 128 (SMALL_TEXT_LENGTH) + required   ← same shared rule as pack
//   tagline:   max 512 (MID_TEXT_LENGTH) + notRequired
//   description: non-empty + max 8000 (MARKDOWN_TEXT_LENGTH)
// Server rejects duplicate subdomain → connector toasts, keeps input, stays open.
//
// Connector mirrors CrdCreateInnovationPackDialog: StorageConfigContextProvider (account) + Suspense
// + useMarkdownEditorIntegration({ temporaryLocation: true }) + useDialogCloseGuard + close+refetch+toast.
