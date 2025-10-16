import { UiNodeAttributes } from '@ory/kratos-client';

export const KRATOS_INPUT_NAME_CSRF = 'csrf_token';
export const KRATOS_TRAIT_NAME_FIRST_NAME = 'traits.name.first';
export const KRATOS_TRAIT_NAME_LAST_NAME = 'traits.name.last';

export const KRATOS_REQUIRED_FIELDS: readonly string[] = [
  'traits.email',
  'traits.name.first',
  'traits.name.last',
  'traits.accepted_terms',
];

export type KratosRemovedFieldAttributes = Partial<UiNodeAttributes>;

export const KRATOS_REMOVED_FIELDS_DEFAULT: readonly KratosRemovedFieldAttributes[] = [{ name: 'traits.picture' }];

export const KRATOS_VERIFICATION_CONTINUE_LINK_ID = 1070009;
