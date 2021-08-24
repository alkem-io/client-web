export const typePolicies = {
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
};
