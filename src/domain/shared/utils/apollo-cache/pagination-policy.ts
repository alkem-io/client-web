import { FieldPolicy } from '@apollo/client';
import { Identifiable } from '../../types/Identifiable';

type KeyArgs = FieldPolicy<unknown>['keyArgs'];
const pageInfoFieldName = 'pageInfo';

type TRelayPageInfo = {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  startCursor: string;
  endCursor: string;
};
// https://github.com/apollographql/apollo-client/blob/main/src/utilities/policies/pagination.ts#L91

interface PaginationParamsHolder {
  args?: {
    before?: string;
    after?: string;
  };
}

type PaginatedResponse<Item, FieldName extends string> = {
  [pageInfoFieldName]: TRelayPageInfo;
} & Record<FieldName, Item[]>;

export const paginationFieldPolicy = (keyArgs: KeyArgs = false) => {
  return {
    keyArgs,
    merge<Item extends Identifiable, FieldName extends string>(
      existing: PaginatedResponse<Item, FieldName>,
      incoming: PaginatedResponse<Item, FieldName>,
      { args }: PaginationParamsHolder
    ): PaginatedResponse<Item, FieldName> {
      if (!existing) {
        return incoming;
      }

      if (!incoming) {
        return existing;
      }

      const dataFieldName = Object.keys(incoming).find(x => x !== pageInfoFieldName && x !== '__typename') as
        | FieldName
        | undefined;
      // we expect 'incoming' to be { __typename: string, pageInfo: {}, items: [] };
      // items is a placeholder field - it's calculated on the server based on what entity you have requested, e.g. 'users'
      // if after filtering out the two other fields, we still have more fields, override the old data;
      // throwing an exception or a warning maybe also be required
      if (!dataFieldName) {
        return incoming;
      }

      const incomingData = incoming[dataFieldName] as Item[];

      let prefix = existing[dataFieldName] as Item[];
      let suffix: Item[] = [];

      if (args?.after) {
        const index = prefix.findIndex(item => item.id === args.after);
        if (index >= 0) {
          prefix = prefix.slice(0, index + 1);
        }
      } else if (args?.before) {
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
          if (hasPreviousPage !== undefined) pageInfo.hasPreviousPage = hasPreviousPage;
          if (startCursor !== undefined) pageInfo.startCursor = startCursor;
        }
        if (!suffix.length) {
          if (hasNextPage !== undefined) pageInfo.hasNextPage = hasNextPage;
          if (endCursor !== undefined) pageInfo.endCursor = endCursor;
        }
      }

      return {
        [dataFieldName]: edges,
        [pageInfoFieldName]: pageInfo,
      } as PaginatedResponse<Item, FieldName>;
    },
  } as FieldPolicy;
};
