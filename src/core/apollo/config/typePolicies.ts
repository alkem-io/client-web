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
  UserGroup: {
    fields: {
      members: {
        merge: false,
      },
    },
  },
  Config: {
    merge: true,
    fields: {
      template: {
        merge: true,
      },
    },
  },
  Metadata: {
    merge: true,
  },
  Community: {
    fields: {
      members: {
        merge: false,
      },
      leadOrganizations: {
        merge: false,
      },
      availableLeadUsers: paginationFieldPolicy(['filter'], 'User'),
      availableMemberUsers: paginationFieldPolicy(['filter'], 'User'),
    },
  },
  Post: {
    fields: {
      references: {
        merge: false,
      },
    },
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
      activityFeed: paginationFieldPolicy(['spaceIds', 'roles', 'myActivity'], 'ActivityLogEntry'),
    },
  },
};
