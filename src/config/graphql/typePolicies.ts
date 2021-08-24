import { TypePolicies } from '@apollo/client';

export const typePolicies: TypePolicies = {
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
  UserMembership: {
    merge: true,
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
