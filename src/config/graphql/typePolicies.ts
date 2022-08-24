import { TypedTypePolicies } from '../../models/apollo-helpers';
import { paginationFieldPolicy } from '../../domain/shared/utils/apollo-cache/pagination-policy';

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
  Aspect: {
    fields: {
      references: {
        merge: false,
      },
    },
  },
  Query: {
    fields: {
      usersPaginated: paginationFieldPolicy(['filter'], 'User'),
      organizationsPaginated: paginationFieldPolicy(['filter'], 'Organization'),
    },
  },
};
