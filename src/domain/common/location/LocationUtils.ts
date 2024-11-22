import { Maybe, Location as GraphQLLocation } from '@/core/apollo/generated/graphql-schema';
import { Location as LocationModel } from './Location';
import { COUNTRIES } from './countries.constants';

/**
 * formatLocation turns a Location coming from a GraphQL query into a Location usable by the UI.
 * In the database we are storing only the country code, a 2 chars string, we need to turn that into
 * a CountryType object { name: string, code: string }
 *
 * @param data Location from a GraphQL query
 * @returns A Location that contains the full CountryType object
 */
export const formatLocation = (data: Maybe<GraphQLLocation>): Partial<LocationModel> | undefined => {
  if (!data) {
    return undefined;
  }

  return {
    city: data?.city,
    country: COUNTRIES.find(x => x.code === data?.country),
  };
};

export const formatDatabaseLocation = (
  data: Partial<LocationModel> | undefined
): { __typename?: 'Location'; city: string; country: string } | undefined => {
  if (!data) {
    return undefined;
  }

  return {
    city: data.city!,
    country: data.country?.code || '',
  };
};
