/**
 * User My Profile tab — view contract and per-field state shape.
 * See data-model.md "User Story 1" for field-level details.
 */

import type {
  EditableMarkdownFieldProps,
  EditableReferenceRowProps,
  EditableSelectFieldProps,
  EditableTagsFieldProps,
  EditableTextFieldProps,
} from './editable-field';

export type AvatarColumnProps = {
  avatarUrl?: string;
  displayName: string;
  tagline?: string;
  uploading: boolean;
  uploadHelperText: string; // i18n: "Recommended: 400x400px. JPG, PNG or GIF."
  changeButtonLabel: string;
  /** File-pick commits immediately on file-select (FR-024). */
  onAvatarFilePicked: (file: File) => Promise<void>;
};

export type SocialLinksSection = {
  recognized: {
    linkedin: EditableReferenceRowProps;
    bsky: EditableReferenceRowProps;
    github: EditableReferenceRowProps;
  };
  arbitrary: EditableReferenceRowProps[];
  onAddAnotherReference: () => void;
};

export type IdentitySection = {
  displayName: EditableTextFieldProps;
  firstName: EditableTextFieldProps;
  lastName: EditableTextFieldProps;
  email: EditableTextFieldProps; // readOnly
  phone: EditableTextFieldProps;
};

export type AboutYouSection = {
  tagline: EditableTextFieldProps;
  city: EditableTextFieldProps;
  country: EditableSelectFieldProps;
  bio: EditableMarkdownFieldProps;
  tags: EditableTagsFieldProps;
};

export type UserMyProfileViewProps = {
  identity: IdentitySection;
  aboutYou: AboutYouSection;
  socialLinks: SocialLinksSection;
  avatarColumn: AvatarColumnProps;
  loading: boolean;
};
