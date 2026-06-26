import type { CreateLocationInput, UpdateLocationInput } from '@/core/apollo/generated/graphql-schema';
import type { LocationModelMapped } from './LocationModelMapped';

export const formatLocationInput = (
  data: LocationModelMapped | undefined
): UpdateLocationInput | CreateLocationInput | undefined => {
  if (!data) {
    return undefined;
  }

  return {
    city: data.city,
    country: data.country?.code || '',
  };
};
