import { TypedTypePolicies } from '../generated/apollo-helpers';
import { paginationFieldPolicy } from './paginationPolicy';

export const typePolicies: TypedTypePolicies = {
  LookupQueryResults: {
    merge: true,
  },
  Platform: {
    merge: true,
  },
  MeQueryResults: {
    merge: true,
  },
  Account: {
    fields: {
      activeSubscription: {
        merge: true,
      },
    },
  },
  UserGroup: {
    fields: {
      members: {
        merge: false,
      },
    },
  },
  Config: {
    merge: true,
  },
  Metadata: {
    merge: true,
  },
  Community: {
    fields: {
      availableLeadUsers: paginationFieldPolicy(['filter'], 'User'),
      availableMemberUsers: paginationFieldPolicy(['filter'], 'User'),
    },
  },
  Post: {
    fields: {},
  },
  Message: {
    fields: {
      reactions: {
        merge: false,
      },
    },
  },
  Query: {
    fields: {
      usersPaginated: paginationFieldPolicy(['filter'], 'User'),
      organizationsPaginated: paginationFieldPolicy(['filter'], 'Organization'),
      spacesPaginated: paginationFieldPolicy(['filter'], 'Space'),
      activityFeed: paginationFieldPolicy(['args'], 'ActivityLogEntry'),
    },
  },
};
