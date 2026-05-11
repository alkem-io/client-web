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
 * Routing: pack public profile route in `TopLevelRoutes.tsx`; pack admin via the admin route trees — both toggle-gated.
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

export type InnovationPackFormValues = {
  /** required, non-empty */
  name: string;
  description: string;
  tags: string[];
  avatarFile?: File;
  references: ReferenceRow[];
  /** Chooseable for platform packs; fixed (account host org) for account-owned packs. */
  providerOrganizationId: string;
  listedInStore: boolean;
  searchVisibility: SearchVisibilityValue;
};

export type InnovationPackFormProps = {
  value: InnovationPackFormValues;
  errors: Partial<Record<keyof InnovationPackFormValues | `references.${number}.${'name' | 'uri'}`, string>>;
  onChange: (next: InnovationPackFormValues) => void;
  onSubmit: () => void;
  submitting: boolean;
  /** Organisation options for the provider select; ignored when `providerSelectable` is false. */
  organizationOptions: { id: string; name: string; avatarUrl?: string }[];
  providerSelectable: boolean;
};

export type CreateInnovationPackDialogProps = {
  open: boolean;
  onClose: () => void;
  value: InnovationPackFormValues;
  errors: InnovationPackFormProps['errors'];
  onChange: (next: InnovationPackFormValues) => void;
  onCreate: () => void;
  creating: boolean;
  organizationOptions: { id: string; name: string; avatarUrl?: string }[];
  providerSelectable: boolean;
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
  /** Pack-details form props. */
  form: InnovationPackFormProps;
  /** Delete the pack — the consumer routes this through ConfirmationDialog (variant="destructive"). */
  onRequestDeletePack: () => void;
  canDeletePack: boolean;
  /** The holder-agnostic templates manager — holderKind='innovationPack', canImport(*) === false. */
  templatesManager: TemplatesManagerViewProps;
};
