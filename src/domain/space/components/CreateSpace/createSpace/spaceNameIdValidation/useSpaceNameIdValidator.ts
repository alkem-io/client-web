import { useRestrictedSpaceNamesQuery } from '@/core/apollo/generated/apollo-hooks';
import { nameIdValidator } from '@/core/ui/forms/validator/nameIdValidator';

export const useSpaceNameIdValidator = () => {
  const { data, loading } = useRestrictedSpaceNamesQuery();
  const restrictedSpaceNamesValues = data?.restrictedSpaceNames ?? [];

  const nonReservedSpaceNameIdValidator = nameIdValidator.test({
    name: 'nonReservedSpaceNameIdValidator',
    message: 'forms.validations.reservedTopLevelRoute',
    test: value => !value || !restrictedSpaceNamesValues.includes(value.toLowerCase()),
  });
  return {
    nonReservedSpaceNameIdValidator,
    loading,
  };
};
