import { RestrictedSpaceNames } from '@/core/apollo/generated/graphql-schema';
import { nameIdValidator } from '@/core/ui/forms/validator/nameIdValidator';

export const restrictedSpaceNamesValues = Object.values(RestrictedSpaceNames).map(name =>
  name.toLowerCase().replace(/_/g, '-')
);

const nonReservedSpaceNameIdValidator = nameIdValidator.test({
  name: 'nonReservedNameIdValidator',
  message: 'forms.validations.reservedTopLevelRoute',
  test: value => !value || !restrictedSpaceNamesValues.includes(value.toLowerCase()),
});

export default nonReservedSpaceNameIdValidator;
