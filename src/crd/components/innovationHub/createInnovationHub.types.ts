/**
 * Plain prop types for the CRD Create Innovation Hub dialog
 * (`src/crd/components/innovationHub/CreateInnovationHubDialog.tsx`).
 * No runtime dependencies — types only. Mirrors the Create Innovation Pack contract.
 */

import type { MarkdownUploadProps } from '@/crd/forms/markdown/MarkdownEditor';

/** Hub creation collects subdomain + name + tagline + a required markdown description (strict MUI parity). */
export type CreateInnovationHubValues = {
  subdomain: string;
  name: string;
  tagline: string;
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
  creating: boolean;
  /**
   * Whether the form is valid enough to submit. When provided, it (not the displayed `errors`)
   * drives the Create button's disabled state, so the button can be disabled while no errors are
   * shown yet (errors surface only once fields are touched). Falls back to `errors`-derived blocking
   * when omitted.
   */
  canSubmit?: boolean;
  /** Account display name for the subtitle ("…in {accountName}" / "your account"). Omitted ⇒ user's own account. */
  accountName?: string;
} & MarkdownUploadProps;
