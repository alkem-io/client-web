import { FieldPolicy } from '@apollo/client';
import { unionBy } from 'lodash/array';

type KeyArgs = FieldPolicy<unknown>['keyArgs'];
const pageInfoFieldName = 'pageInfo';

export const paginationFieldPolicy = (keyArgs: KeyArgs = false) => {
  return {
    keyArgs,
    merge(existing, incoming) {
      if (!existing) {
        return incoming;
      }

      const dataKey = Object.keys(incoming).filter(x => x !== pageInfoFieldName && x !== '__typename');
      // we expect 'incoming' to be { __typename: string, pageInfo: {}, items: [] };
      // items is a placeholder field - it's calculated on the server based on what entity you have requested, e.g. 'users'
      // if after filtering out the two other fields, we still have more fields, override the old data;
      // throwing an exception or a warning maybe also be required
      if (dataKey.length > 1) {
        return incoming;
      }

      const [dataFieldName] = dataKey;
      const incomingData = incoming[dataFieldName];

      const existingData = existing[dataFieldName];

      const newData = incomingData ? unionBy(existingData, incomingData, '__ref') : existingData;

      return {
        [dataFieldName]: newData,
        [pageInfoFieldName]: incoming[pageInfoFieldName],
      };
    },
  };
};
