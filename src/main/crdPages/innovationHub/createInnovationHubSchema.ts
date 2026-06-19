import { MARKDOWN_TEXT_LENGTH, MID_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import type { CreateInnovationHubValues } from '@/crd/components/innovationHub/createInnovationHub.types';

/**
 * Validation for the CRD Create Innovation Hub dialog — strict MUI parity with the
 * legacy `InnovationHubForm` create mode (subdomain `^[a-z0-9-]*$` 3–25; name 3–128;
 * tagline ≤512; required markdown description ≤8000).
 *
 * Returns one message **code** per invalid field (first failure by priority); the
 * connector maps codes → `t('createHub.validation.<code>')`. Kept i18n-free so it is
 * directly unit-testable and mirrors the create-flow validation idiom used by
 * `useCreateSubspace` without the per-field yup ceremony for this small field set.
 */
export type CreateInnovationHubErrorCode =
  | 'required'
  | 'min3'
  | 'maxSmall'
  | 'maxMid'
  | 'maxMarkdown'
  | 'subdomainRequired'
  | 'subdomainFormat'
  | 'subdomainMin'
  | 'subdomainMax';

export type CreateInnovationHubErrorCodes = Partial<
  Record<keyof CreateInnovationHubValues, CreateInnovationHubErrorCode>
>;

export const SUBDOMAIN_PATTERN = /^[a-z0-9-]*$/;
export const SUBDOMAIN_MIN_LENGTH = 3;
export const SUBDOMAIN_MAX_LENGTH = 25;
export const NAME_MIN_LENGTH = 3;

export function validateCreateInnovationHub(values: CreateInnovationHubValues): CreateInnovationHubErrorCodes {
  const errors: CreateInnovationHubErrorCodes = {};

  const subdomain = values.subdomain.trim();
  if (!subdomain) {
    errors.subdomain = 'subdomainRequired';
  } else if (!SUBDOMAIN_PATTERN.test(subdomain)) {
    errors.subdomain = 'subdomainFormat';
  } else if (subdomain.length < SUBDOMAIN_MIN_LENGTH) {
    errors.subdomain = 'subdomainMin';
  } else if (subdomain.length > SUBDOMAIN_MAX_LENGTH) {
    errors.subdomain = 'subdomainMax';
  }

  const name = values.name.trim();
  if (!name) {
    errors.name = 'required';
  } else if (name.length < NAME_MIN_LENGTH) {
    errors.name = 'min3';
  } else if (name.length > SMALL_TEXT_LENGTH) {
    errors.name = 'maxSmall';
  }

  if (values.tagline.length > MID_TEXT_LENGTH) {
    errors.tagline = 'maxMid';
  }

  if (!values.description.trim()) {
    errors.description = 'required';
  } else if (values.description.length > MARKDOWN_TEXT_LENGTH) {
    errors.description = 'maxMarkdown';
  }

  return errors;
}
