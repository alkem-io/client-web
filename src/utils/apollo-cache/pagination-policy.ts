import { FieldPolicy } from '@apollo/client';

type KeyArgs = FieldPolicy<unknown>['keyArgs'];
const pageInfoFieldName = 'pageInfo';

type TRelayPageInfo = {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  startCursor: string;
  endCursor: string;
};
// https://github.com/apollographql/apollo-client/blob/main/src/utilities/policies/pagination.ts#L91
export const paginationFieldPolicy = (keyArgs: KeyArgs = false) => {
  return {
    keyArgs,
    merge(existing, incoming, { args }) {
      if (!existing) {
        return incoming;
      }

      if (!incoming) {
        return existing;
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

      let prefix = existing[dataFieldName];
      let suffix: typeof prefix = [];

      if (args && args.after) {
        const index = prefix.findIndex(item => item.id === args.after);
        if (index >= 0) {
          prefix = prefix.slice(0, index + 1);
        }
      } else if (args && args.before) {
        const index = prefix.findIndex(item => item.id === args.before);
        suffix = index < 0 ? prefix : prefix.slice(index);
        prefix = [];
      } else if (incomingData) {
        // If we have neither args.after nor args.before, the incoming
        // edges cannot be spliced into the existing edges, so they must
        // replace the existing edges.
        prefix = [];
      }

      const edges = [...prefix, ...incomingData, ...suffix];

      const pageInfo: TRelayPageInfo = {
        // The ordering of these two ...spreads may be surprising, but it
        // makes sense because we want to combine PageInfo properties with a
        // preference for existing values, *unless* the existing values are
        // overridden by the logic below, which is permitted only when the
        // incoming page falls at the beginning or end of the data.
        ...incoming[pageInfoFieldName],
        ...existing[pageInfoFieldName],
      };

      if (incoming[pageInfoFieldName]) {
        const { hasPreviousPage, hasNextPage, startCursor, endCursor } = incoming[pageInfoFieldName];

        // Keep existing.pageInfo.has{Previous,Next}Page unless the
        // placement of the incoming edges means incoming.hasPreviousPage
        // or incoming.hasNextPage should become the new values for those
        // properties in existing.pageInfo. Note that these updates are
        // only permitted when the beginning or end of the incoming page
        // coincides with the beginning or end of the existing data, as
        // determined using prefix.length and suffix.length.
        if (!prefix.length) {
          if (void 0 !== hasPreviousPage) pageInfo.hasPreviousPage = hasPreviousPage;
          if (void 0 !== startCursor) pageInfo.startCursor = startCursor;
        }
        if (!suffix.length) {
          if (void 0 !== hasNextPage) pageInfo.hasNextPage = hasNextPage;
          if (void 0 !== endCursor) pageInfo.endCursor = endCursor;
        }
      }

      return {
        [dataFieldName]: edges,
        [pageInfoFieldName]: pageInfo,
      };
    },
  };
};
