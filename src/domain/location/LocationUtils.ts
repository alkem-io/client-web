import { Maybe, Location } from '../../models/graphql-schema';
import { Location as LocationModel } from '../../models/Location';
import { COUNTRIES } from '../../models/constants';

/**
 * getLocationModel turns a Location coming from a GraphQL query into a Location usable by the UI.
 * In the database we are storing only the country code, a 2 chars string, we need to turn that into
 * a CountryType object { name: string, code: string }
 *
 * Handles well empty objects, null/undefined/ countries not found will be returned as { name: '', code: '' }
 *
 * @param data Location from a GraphQL query
 * @returns A Location from ../../models/Location that contains the full CountryType object,
 */
const getLocationModel = function (data: Maybe<Location>): LocationModel {
  const l: LocationModel = {
    city: data?.city || '',
    country: { code: '', name: '' },
  };

  const c = COUNTRIES.find(x => x.code === data?.country);
  if (c) {
    l.country = { code: data?.country || '', name: c?.name || '' };
  }
  return l;
};

export { getLocationModel };
