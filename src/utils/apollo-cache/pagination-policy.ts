import { FieldPolicy } from '@apollo/client';
import { unionBy } from 'lodash/array';

type KeyArgs = FieldPolicy<any>['keyArgs'];
const pageInfoFieldName = 'pageInfo';

export const paginationFieldPolicy = (keyArgs: KeyArgs = false) => {
  return {
    keyArgs,
    merge(existing, incoming) {
      if (!existing) {
        return incoming;
      }

      const dataKey = Object.keys(incoming).filter(x => x !== pageInfoFieldName && x !== '__typename');

      if (dataKey.length > 1) {
        return incoming;
      }

      const [dataFieldName] = dataKey;
      const [incomingData] = incoming[dataFieldName];

      const existingData = existing[dataFieldName];

      const newData = incomingData ? unionBy([...existingData, incomingData], '__ref') : existingData;

      return {
        [dataFieldName]: newData,
        [pageInfoFieldName]: incoming[pageInfoFieldName],
      };
    },
  };
};
