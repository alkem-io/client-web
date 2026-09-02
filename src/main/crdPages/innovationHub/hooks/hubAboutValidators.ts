import { MARKDOWN_TEXT_LENGTH, MID_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';

/**
 * Plain-TypeScript validators ported from the legacy MUI form's yup schemas
 * (`subdomainValidator`, `displayNameValidator`, `MarkdownValidator`,
 * `textLengthValidator`). Each validator returns one of a fixed set of i18n
 * keys (relative to the `crd-innovationHub` namespace) for an inline error
 * message, or `undefined` when valid.
 *
 * The literal-union return type lets `t()` accept the result without a cast —
 * the typed-key i18n overload sees a known key, not a dynamic string.
 *
 * No Formik, no yup — the integration hook (`useHubAboutTabData`) invokes
 * these on `onSaveSection` and bails out before firing the mutation when
 * invalid.
 */

export type HubAboutErrorKey =
  | 'settings.about.subdomain.errors.required'
  | 'settings.about.subdomain.errors.tooLong'
  | 'settings.about.subdomain.errors.invalidFormat'
  | 'settings.about.name.errors.required'
  | 'settings.about.name.errors.tooLong'
  | 'settings.about.description.errors.required'
  | 'settings.about.description.errors.tooLong'
  | 'settings.about.tagline.errors.tooLong';

export const SUBDOMAIN_MIN_LENGTH = 3;
export const SUBDOMAIN_MAX_LENGTH = 25;
const SUBDOMAIN_PATTERN = /^[a-z0-9-]*$/;

const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = SMALL_TEXT_LENGTH;

export const validateSubdomain = (value: string): HubAboutErrorKey | undefined => {
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

export const validateDisplayName = (value: string): HubAboutErrorKey | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return 'settings.about.name.errors.required';
  if (trimmed.length < NAME_MIN_LENGTH || trimmed.length > NAME_MAX_LENGTH) {
    return 'settings.about.name.errors.tooLong';
  }
  return undefined;
};

export const validateDescription = (value: string): HubAboutErrorKey | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return 'settings.about.description.errors.required';
  if (trimmed.length > MARKDOWN_TEXT_LENGTH) {
    return 'settings.about.description.errors.tooLong';
  }
  return undefined;
};

export const validateTagline = (value: string): HubAboutErrorKey | undefined => {
  if (value.length > MID_TEXT_LENGTH) {
    return 'settings.about.tagline.errors.tooLong';
  }
  return undefined;
};

export const validateTags = (_values: string[]): HubAboutErrorKey | undefined => {
  // Legacy `tagsetsSegmentSchema` is permissive — pass-through.
  // Per-tag minLength is enforced inside the TagsInput primitive when configured.
  return undefined;
};
