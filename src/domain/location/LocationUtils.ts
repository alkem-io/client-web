import { Maybe, Location as GraphQLLocation } from '../../models/graphql-schema';
import { Location as LocationModel } from '../../domain/location/Location';
import { COUNTRIES } from '../../models/constants';

/**
 * getLocationModel turns a Location coming from a GraphQL query into a Location usable by the UI.
 * In the database we are storing only the country code, a 2 chars string, we need to turn that into
 * a CountryType object { name: string, code: string }
 *
 * Handles well empty objects, null/undefined/(countries not found by code) will be returned as { name: '', code: '' }
 *
 * @param data Location from a GraphQL query
 * @returns A Location from ../../domain/location/Location that contains the full CountryType object,
 */
const getLocationModel = function (data: Maybe<GraphQLLocation>): LocationModel | null {
  if (!data) return null;

  const location: LocationModel = {
    city: data?.city || '',
    country: COUNTRIES.find(x => x.code === data?.country) || { name: '', code: '' },
  };

  return location;
};

export { getLocationModel };
