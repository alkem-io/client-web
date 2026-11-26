import { relayStylePagination } from '@apollo/client/utilities';
import type { StrictTypedTypePolicies } from '@/core/apollo/generated-v2/apollo-helpers';

// Id-less value objects embedded in one parent (Space.about, Space.can, Query.config …):
// queries selecting different fields of the same embed merge instead of replacing each other.
// A new singular id-less embed in the schema must be added here (Apollo warns in dev when it would replace one).
const V2_MERGED_VALUE_TYPES = [
  'About',
  'Config',
  'FileRef',
  'HostedResources',
  'Membership',
  'PostCan',
  'SpaceCan',
  'StorageLimits',
  'RoomCan',
] as const satisfies ReadonlyArray<keyof StrictTypedTypePolicies>;

// A connection is one cached list per filter AND page size: a first page replaces the stored list, so a
// small probe (e.g. 2 memberships for the home redirect) must not truncate a paged list of the same filter.
// Paged consumers keep `first` constant across fetchMore.
const CONNECTION_KEY_ARGS = ['filter', 'first'];

export const v2TypePolicies: StrictTypedTypePolicies = {
  ...Object.fromEntries(V2_MERGED_VALUE_TYPES.map(typeName => [typeName, { merge: true }])),
  Query: {
    fields: {
      spaces: relayStylePagination(CONNECTION_KEY_ARGS),
      library: relayStylePagination(CONNECTION_KEY_ARGS),
      actors: relayStylePagination(CONNECTION_KEY_ARGS),
      members: relayStylePagination(['resource', 'role', 'actorType', 'terms', 'first']),
      activity: relayStylePagination(['space', 'mine', 'roles', 'types', 'excludeTypes', 'first']),
      spacePosts: relayStylePagination([
        'space',
        'stage',
        'kinds',
        'responseKinds',
        'tags',
        'labels',
        'order',
        'first',
      ]),
      spaceActivity: relayStylePagination(['space', 'types', 'first']),
    },
  },
};
