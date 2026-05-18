/**
 * Contract: Innovation Pack CRD surfaces — admin view, public profile view, details form, card, create dialog.
 *
 * CRD components:
 *  - `src/crd/components/innovationPack/InnovationPackAdminView.tsx`
 *  - `src/crd/components/innovationPack/InnovationPackProfileView.tsx`
 *  - `src/crd/components/innovationPack/InnovationPackForm.tsx`
 *  - `src/crd/components/innovationPack/InnovationPackCard.tsx`
 *  - `src/crd/components/innovationPack/CreateInnovationPackDialog.tsx`
 *
 * Integration: `src/main/crdPages/innovationPack/{CrdInnovationPackAdminPage,CrdInnovationPackProfilePage}.tsx`
 * Routing: BOTH the pack public profile (`<pack.profile.url>`) and the pack admin (`<pack.profile.url>/settings`) are routed
 *   from `src/domain/InnovationPack/InnovationPackRoute.tsx` (mounted in `TopLevelRoutes.tsx`) — toggle-gate THAT file.
 *   NOT `AdminInnovationPackRoutes.tsx` (that hosts only the platform-admin `/admin/innovation-packs` list, not migrated here).
 * Pack create: from `ContributorAccountView.tsx` (the Account tab) — name + description only, via `useCreateInnovationPackMutation`
 *   (input `CreateInnovationPackOnAccountInput` = `{accountID, profileData:{displayName, description}}`). The rest is edited on the admin screen.
 * Pack delete: from the three-dot menu on each pack card in the Account-tab packs list — NOT from the admin screen.
 * The provider organisation is the owning account's host org, shown read-only — there is no org picker (mirrors the legacy MUI form).
 */

import type { ReferenceRow } from './template-forms';
import type { TemplatesManagerViewProps, TemplateCategorySection } from './templates-manager';

export type InnovationPackCardData = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  /** profile.visual?.uri || undefined ⇒ pickColorFromId gradient */
  bannerUrl?: string;
  /** pickColorFromId(pack.id) */
  color: string;
  /** sum of templatesSet.*Templates.length */
  templateCount: number;
  /** profile.url */
  url: string;
  providerName?: string;
  providerAvatarUrl?: string;
  providerUrl?: string;
};

export type SearchVisibilityValue = 'public' | 'authenticated' | 'account';

/** The pack EDIT form (on the admin screen). Provider is NOT a field — it's shown read-only by the view (see `InnovationPackAdminViewProps.providerName`). */
export type InnovationPackFormValues = {
  /** required, non-empty — = profile.displayName */
  name: string;
  description: string;
  tags: string[];
  avatarFile?: File;
  references: ReferenceRow[];
  listedInStore: boolean;
  searchVisibility: SearchVisibilityValue;
};

export type InnovationPackFormProps = {
  value: InnovationPackFormValues;
  errors: Partial<Record<keyof InnovationPackFormValues | `references.${number}.${'name' | 'uri'}`, string>>;
  onChange: (next: InnovationPackFormValues) => void;
  onSubmit: () => void;
  submitting: boolean;
  /** The provider organisation's display name — rendered read-only (no picker; mirrors the legacy `InnovationPackForm`). */
  providerName: string;
};

/** Pack creation collects ONLY name + description (the legacy `CreateInnovationPackDialog` sends `{accountID, profileData:{displayName, description}}`). */
export type CreateInnovationPackValues = { name: string; description: string };
export type CreateInnovationPackDialogProps = {
  open: boolean;
  onClose: () => void;
  value: CreateInnovationPackValues;
  errors: Partial<Record<keyof CreateInnovationPackValues, string>>;
  onChange: (next: CreateInnovationPackValues) => void;
  onCreate: () => void;
  creating: boolean;
};

export type InnovationPackProfileViewProps = {
  pack: InnovationPackCardData & { references: { id: string; name: string; uri: string; description?: string }[] };
  /** Read-only listing of the pack's templates by type. */
  templates: TemplateCategorySection[];
  templatesLoading?: boolean;
  /** Show the "Manage this pack" entry point. */
  canManage: boolean;
  adminHref?: string;
  /** Only 'preview' is meaningful on the public profile. */
  onTemplatePreview: (templateId: string) => void;
  shareUrl: string;
};

export type InnovationPackAdminViewProps = {
  /** Pack-details EDIT form props (incl. `providerName` read-only). */
  form: InnovationPackFormProps;
  /** The holder-agnostic templates manager — holderKind='innovationPack', canImport(*) === false. */
  templatesManager: TemplatesManagerViewProps;
  // NO delete-pack here — pack deletion is exposed from the three-dot menu on each pack card in the
  // "Account" tab's packs list (FR-042), the same place the legacy app deletes account-owned packs.
};
