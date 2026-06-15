/**
 * CONTRACT — Create Innovation Pack (CRD) — strict MUI parity (Clarifications 2026-06-15)
 *
 * Status: MODIFY existing assets + ADD a connector.
 *  - `src/crd/components/innovationPack/CreateInnovationPackDialog.tsx` EXISTS but uses a plain
 *    <Textarea> + name-only validation → change to a MARKDOWN editor + required description +
 *    3–128 name error rendering; the component gains MarkdownUploadProps.
 *  - `src/main/crdPages/innovationPack/useCreateInnovationPack.ts` EXISTS → KEEP its signature
 *    unchanged (still returns `{ id, url }`): the legacy MUI `ContributorAccountView` still
 *    consumes it via `onCreated: ({ url }) => navigate(...)`. The new CRD connector passes an
 *    `onCreated` that ignores `url` and does not navigate (strict parity = no navigation).
 *  - NEW connector `src/main/crdPages/innovationPack/CrdCreateInnovationPackDialog.tsx`:
 *    StorageConfigContextProvider + Suspense + useMarkdownEditorIntegration + validation +
 *    useDialogCloseGuard, mounting the pure dialog.
 *
 * Boundaries: the presentational component is pure (no GraphQL/routing/auth); data + behavior via
 * props. Validation + mutation + storage + markdown-upload live in the connector/hook.
 */

import type { MarkdownUploadProps } from '@/crd/forms/markdown/MarkdownEditor';

// ── Presentational component (src/crd/components/innovationPack) ──────────────

export type CreateInnovationPackValues = {
  /** required → profileData.displayName. Validation: trim, min 3, max 128, not blank. */
  name: string;
  /** required → profileData.description. Markdown, max 8000. */
  description: string;
};

export type CreateInnovationPackErrors = Partial<Record<keyof CreateInnovationPackValues, string>>;

export type CreateInnovationPackDialogProps = {
  open: boolean;
  onClose: () => void;
  value: CreateInnovationPackValues;
  errors: CreateInnovationPackErrors;
  onChange: (next: CreateInnovationPackValues) => void;
  onCreate: () => void;
  /** in-flight: disable inputs/Create, spinner, block close. */
  creating: boolean;
  /** account display name for the subtitle ("…in {accountName}" / "your account"). */
  accountName?: string;
} & MarkdownUploadProps; // onImageUpload / iframeAllowedUrls / onError for the markdown editor

// ── Integration hook (src/main/crdPages/innovationPack) — SIGNATURE UNCHANGED ──
// Kept as-is because the legacy MUI ContributorAccountView still consumes it.

export type CreatedInnovationPack = {
  id: string;
  /** new pack's profile.url (follow-up admin query). The CRD connector ignores this. */
  url: string | undefined;
};

export type UseCreateInnovationPackArgs = {
  /** target account (user's own or org's). Required for the mutation to fire. */
  accountId: string | undefined;
  /** fires after create + url lookup resolve. The CRD connector ignores `url` and does NOT navigate. */
  onCreated?: (created: CreatedInnovationPack) => void;
};

export type UseCreateInnovationPackResult = {
  create: (values: CreateInnovationPackValues) => Promise<CreatedInnovationPack | undefined>;
  creating: boolean;
};
// Mutation: createInnovationPack({ packData: { accountID, profileData: { displayName, description } } })
// refetchQueries: ['AccountInformation','AdminInnovationPacksList','InnovationLibrary']

// ── Connector (src/main/crdPages/innovationPack/CrdCreateInnovationPackDialog.tsx) ──
//
// <StorageConfigContextProvider locationType="account" accountId={accountId} skip={!open}>
//   <Suspense fallback={null}>
//     {/* useMarkdownEditorIntegration({ temporaryLocation: true }) → onImageUpload/iframeAllowedUrls/onError
//        yup-on-submit (displayName min3/maxSmall/required; description non-empty/maxMarkdown) → errors
//        useCreateInnovationPack({ accountId, onCreated: () => { close; reset; successToast } })
//        useDialogCloseGuard({ isDirty, onClose, blockClose: creating }) */}
//     <CreateInnovationPackDialog ...validated props + markdown integration />
//   </Suspense>
// </StorageConfigContextProvider>
//
// Entitlement gate stays upstream in the account tab:
//   tryCreate('innovationPacks', entitled.innovationPacks, () => setCreatePackOpen(true))
