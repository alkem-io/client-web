import { TypedTypePolicies } from '../../models/apollo-helpers';

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
      leadOrganisations: {
        merge: false,
      },
    },
  },
  Metadata: {
    merge: true,
  },
  Query: {
    fields: {
      usersWithAuthorizationCredential: {
        merge: false,
      },
    },
  },
};
