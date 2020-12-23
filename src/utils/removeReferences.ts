export const removeReferences = async (refIds: string[], handler) => {
  if (refIds.length > 0) {
    for (const ref of refIds) {
      await handler({ variables: { ID: Number(ref) } });
    }
  }
};
