import { FieldFunctionOptions, FieldPolicy } from '@apollo/client';

type KeyArgs = FieldPolicy<unknown>['keyArgs'];
const pageInfoFieldName = 'pageInfo';

type TRelayPageInfo = {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
};
// https://github.com/apollographql/apollo-client/blob/main/src/utilities/policies/pagination.ts#L91

interface PaginationParams {
  before?: string;
  after?: string;
}

type PaginatedResponse<Item, FieldName extends string> = {
  [pageInfoFieldName]: TRelayPageInfo;
  __typename: string;
} & Record<FieldName, Item[]>;

export const paginationFieldPolicy = (keyArgs: KeyArgs = false, typeName: string) => {
  return {
    keyArgs,
    merge<Item extends { __ref?: string; id?: string }, FieldName extends string>(
      existing: PaginatedResponse<Item, FieldName>,
      incoming: PaginatedResponse<Item, FieldName>,
      { args, isReference }: FieldFunctionOptions<PaginationParams>
    ): PaginatedResponse<Item, FieldName> {
      if (!existing || !(args?.after || args?.before)) {
        return incoming;
      }

      if (!incoming) {
        // never seem to happen
        return existing;
      }

      const nonMetaFields = Object.keys(incoming).filter(x => x !== pageInfoFieldName && x !== '__typename');
      // we expect 'incoming' to be { __typename: string, pageInfo: {}, items: [] };
      // items is a placeholder field - it's calculated on the server based on what entity you have requested, e.g. 'users'
      // if after filtering out the two other fields, we still have more fields, throw an exception.
      if (nonMetaFields.length === 0) {
        throw new Error('Missing data field');
      }
      if (nonMetaFields.length > 1) {
        throw new Error('More than 1 data field');
      }

      const [dataFieldName] = nonMetaFields;

      let incomingData = incoming[dataFieldName] as Item[];

      let prefix = existing[dataFieldName] as Item[];
      let suffix: Item[] = [];

      const createRecordFinder = (itemId: string) => (item: Item) =>
        isReference(item) ? item.__ref === `${typeName}:${itemId}` : item.id === itemId;

      /**
       * Fix for client-4586, server can send a response that contains an item with id = args.after.
       * Remove hasNextPageOverride and fixDuplicates when addressed properly.
       */
      let hasNextPageOverride;
      const fixDuplicates = (after: string) => {
        const afterItemIndex = incomingData.findIndex(createRecordFinder(after));
        incomingData = incomingData.slice(afterItemIndex + 1);
        if (incomingData.length === 0) {
          hasNextPageOverride = false;
        }
      };

      if (args?.after) {
        const index = prefix.findIndex(createRecordFinder(args.after));

        fixDuplicates(args.after);

        if (index >= 0) {
          prefix = prefix.slice(0, index + 1);
          console.log(prefix);
        }
      } else if (args?.before) {
        const index = prefix.findIndex(createRecordFinder(args.before));
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
          if (startCursor !== undefined && startCursor !== null) pageInfo.startCursor = startCursor;
        }
        if (!suffix.length) {
          if (hasNextPage !== undefined) pageInfo.hasNextPage = hasNextPage;
          if (endCursor !== undefined || endCursor !== null) pageInfo.endCursor = endCursor;
        }
      }

      if (typeof hasNextPageOverride !== 'undefined') {
        pageInfo.hasNextPage = hasNextPageOverride;
      }

      return {
        [dataFieldName]: edges,
        [pageInfoFieldName]: pageInfo,
        __typename: (incoming ?? existing).__typename,
      } as PaginatedResponse<Item, FieldName>;
    },
  } as FieldPolicy;
};
