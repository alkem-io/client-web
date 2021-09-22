import { TypedTypePolicies } from '../../models/apollo-helpers';

export const typePolicies: TypedTypePolicies = {
  UserGroup: {
    fields: {
      members: {
        merge(existing = [], incoming: any[]) {
          return [...existing, ...incoming];
        },
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
  Challenge: {
    fields: {
      leadOrganizations: {
        merge: false,
      },
    },
  },
  Metadata: {
    merge: true,
  },
  Community: {
    fields: {
      members: {
        merge(existing = [], incoming: any[]) {
          return [...existing, ...incoming];
        },
      },
    },
  },
  Query: {
    fields: {},
  },
};
