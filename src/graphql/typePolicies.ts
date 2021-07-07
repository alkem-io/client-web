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
        merge(existing, incoming) {
          // Better, but not quite correct.
          return { ...existing, ...incoming };
        },
      },
    },
  },
};
