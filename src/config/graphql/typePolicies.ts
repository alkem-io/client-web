import { TypedTypePolicies } from '../../models/apollo-helpers';
import { paginationFieldPolicy } from '../../utils/apollo-cache/pagination-policy';

export const typePolicies: TypedTypePolicies = {
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
        merge: false,
      },
    },
  },
  Aspect: {
    fields: {
      references: {
        merge: false,
      },
    },
  },
  Query: {
    fields: {
      usersPaginated: paginationFieldPolicy(),
    },
  },
};
