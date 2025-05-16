import { LocationModel as LocationModel } from './LocationModel';
import { COUNTRIES } from './countries.constants';
import { LocationModelMapped } from './LocationModelMapped';

/**
 * formatLocation turns a Location coming from a GraphQL query into a Location usable by the UI.
 * In the database we are storing only the country code, a 2 chars string, we need to turn that into
 * a CountryType object { name: string, code: string }
 *
 * @param data Location from a GraphQL query
 * @returns A Location that contains the full CountryType object
 */
export const formatLocation = (data: LocationModel | undefined): LocationModelMapped | undefined => {
  if (!data) {
    return undefined;
  }

  return {
    id: data.id ?? '',
    city: data.city ?? '',
    country: data.country ? COUNTRIES.find(x => x.code === data.country) : COUNTRIES.find(x => x.code === ''),
  };
};

export const formatDatabaseLocation = (
  data: LocationModelMapped | undefined
): LocationModel | undefined => {
  if (!data) {
    return undefined;
  }

  return {
    city: data.city!,
    country: data.country?.code || '',
  };
};
