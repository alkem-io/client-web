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
 * Page width: the public-profile page (`CrdInnovationPackProfilePage`) renders its view inside the shared CRD
 *   profile-page content width — `container mx-auto px-4 md:px-8` — to sit at the SAME width as the User /
 *   Organization / VC public profiles (`UserPublicProfileView` etc.). It must NOT use the narrower `max-w-6xl`
 *   admin/library wrapper, which would make the pack profile narrower than its peer profile pages. (The pack
 *   ADMIN page keeps `max-w-6xl` — it is a management surface, grouped with the Library, not a public profile.)
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

/**
 * The pack public-profile view follows the prototype's `TemplatePackDetail` layout, NOT a banner/avatar hero:
 *  - Compact header: a small 64px rounded thumbnail (the pack avatar, or a `pickColorFromId` gradient + Package
 *    icon fallback) + display name (`text-page-title`) + description (markdown) + a single meta row
 *    (`{N} templates` badge · `by {provider}` link · tag chips). Actions on the right: `ShareButton` + the manage
 *    cogwheel. NO full-width top banner, NO overlapping avatar, NO sidebar.
 *  - Body: the holder-agnostic `TemplatesManagerView` rendered FULL-WIDTH and read-only (`readOnly`, all `can*()`
 *    false) — the accordion section headers ARE the body's only headings (no separate "Templates" h2).
 *  - References are NOT shown on the public profile (the prototype has none). The template count is computed from
 *    `templates` (the per-section card lists), not from `pack.templateCount`.
 */
export type InnovationPackProfileViewProps = {
  pack: InnovationPackCardData;
  /** Read-only listing of the pack's templates by type. Also the source of the header's total-count badge. */
  templates: TemplateCategorySection[];
  templatesLoading?: boolean;
  /**
   * Show the manage entry point. Rendered as the SAME settings cogwheel used by the User / Org / VC
   * profile heroes: an icon-only `Button variant="secondary" size="icon"` linking to `adminHref`, with a
   * `Settings` (cogwheel) lucide icon, `title` + `aria-label` from `packProfile.manage` — NOT a labelled
   * outline button. Keeps the pack profile's action row visually consistent with its peer profile pages.
   */
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
