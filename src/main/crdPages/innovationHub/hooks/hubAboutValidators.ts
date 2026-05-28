import { MARKDOWN_TEXT_LENGTH, MID_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';

/**
 * Plain-TypeScript validators ported from the legacy MUI form's yup schemas
 * (`subdomainValidator`, `displayNameValidator`, `MarkdownValidator`,
 * `textLengthValidator`). Each validator returns an i18n key (relative to the
 * `crd-innovationHub` namespace) for an inline error message, or `undefined`
 * when valid. Consumers resolve the key via `t(...)` at render time.
 *
 * No Formik, no yup — the integration hook (`useHubAboutTabData`) invokes these
 * on `onSaveSection` and bails out before firing the mutation when invalid.
 */

export const SUBDOMAIN_MIN_LENGTH = 3;
export const SUBDOMAIN_MAX_LENGTH = 25;
const SUBDOMAIN_PATTERN = /^[a-z0-9-]*$/;

const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = SMALL_TEXT_LENGTH;

export const validateSubdomain = (value: string): string | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return 'settings.about.subdomain.errors.required';
  if (trimmed.length < SUBDOMAIN_MIN_LENGTH || trimmed.length > SUBDOMAIN_MAX_LENGTH) {
    return 'settings.about.subdomain.errors.tooLong';
  }
  if (!SUBDOMAIN_PATTERN.test(trimmed)) {
    return 'settings.about.subdomain.errors.invalidFormat';
  }
  return undefined;
};

export const validateDisplayName = (value: string): string | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return 'settings.about.name.errors.required';
  if (trimmed.length < NAME_MIN_LENGTH || trimmed.length > NAME_MAX_LENGTH) {
    return 'settings.about.name.errors.tooLong';
  }
  return undefined;
};

export const validateDescription = (value: string): string | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return 'settings.about.description.errors.required';
  if (trimmed.length > MARKDOWN_TEXT_LENGTH) {
    return 'settings.about.description.errors.tooLong';
  }
  return undefined;
};

export const validateTagline = (value: string): string | undefined => {
  if (value.length > MID_TEXT_LENGTH) {
    return 'settings.about.tagline.errors.tooLong';
  }
  return undefined;
};

export const validateTags = (_values: string[]): string | undefined => {
  // Legacy `tagsetsSegmentSchema` is permissive — pass-through.
  // Per-tag minLength is enforced inside the TagsInput primitive when configured.
  return undefined;
};
