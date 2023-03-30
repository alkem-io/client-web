import { UiNodeAttributes } from '@ory/kratos-client';

export const KRATOS_INPUT_NAME_CSRF = 'csrf_token';
export const KRATOS_TRAIT_NAME_FIRST_NAME = 'traits.name.first';
export const KRATOS_TRAIT_NAME_ACCEPTED_TERMS = 'traits.accepted_terms';

export const KRATOS_REQUIRED_FIELDS: readonly string[] = [
  'traits.email',
  'traits.name.first',
  'traits.name.last',
  'traits.accepted_terms',
];

export type KratosRemovedFieldAttributes = Partial<UiNodeAttributes>;

export const KRATOS_REMOVED_FIELDS_DEFAULT: readonly KratosRemovedFieldAttributes[] = [{ name: 'traits.picture' }];

export const KRATOS_RETURN_TO_PLATFORM_LINK_ID = 1070009;
