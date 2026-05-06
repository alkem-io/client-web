/**
 * Org Profile tab — view contract.
 * Same per-field-save model as User My Profile (FR-090).
 * See data-model.md "User Story 8" for field-level details.
 */

import type {
  EditableMarkdownFieldProps,
  EditableReferenceRowProps,
  EditableSelectFieldProps,
  EditableTagsFieldProps,
  EditableTextFieldProps,
} from './editable-field';

export type OrgVerifiedBadgeProps = {
  /** Display label resolved from `Organization.verification.status`. */
  status: 'Verified' | 'Pending' | 'NotVerified';
  /** Localized label rendered next to the badge icon. */
  label: string;
};

export type OrgAvatarColumnProps = {
  avatarUrl?: string;
  displayName: string;
  tagline?: string;
  uploading: boolean;
  uploadHelperText: string;
  changeButtonLabel: string;
  onAvatarFilePicked: (file: File) => Promise<void>;
};

export type OrgIdentitySection = {
  displayName: EditableTextFieldProps;
  /** Read-only after creation. */
  nameID: EditableTextFieldProps;
  tagline: EditableTextFieldProps;
};

export type OrgAboutSection = {
  description: EditableMarkdownFieldProps;
  city: EditableTextFieldProps;
  country: EditableSelectFieldProps;
  tags: EditableTagsFieldProps;
};

export type OrgContactLegalSection = {
  contactEmail: EditableTextFieldProps;
  domain: EditableTextFieldProps;
  legalEntityName: EditableTextFieldProps;
  website: EditableTextFieldProps;
};

export type OrgSocialLinksSection = {
  recognized: {
    linkedin: EditableReferenceRowProps;
    bsky: EditableReferenceRowProps;
    github: EditableReferenceRowProps;
  };
  arbitrary: EditableReferenceRowProps[];
  onAddAnotherReference: () => void;
};

export type OrgProfileViewProps = {
  identity: OrgIdentitySection;
  about: OrgAboutSection;
  contactLegal: OrgContactLegalSection;
  socialLinks: OrgSocialLinksSection;
  avatarColumn: OrgAvatarColumnProps;
  /** Read-only verification badge (FR-094). */
  verifiedBadge: OrgVerifiedBadgeProps;
  loading: boolean;
};
