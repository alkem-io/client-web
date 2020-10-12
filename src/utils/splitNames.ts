export const splitNames = (fullName?: string) => {
  if (!fullName) return { firstName: '', lastName: '' };
  return {
    firstName: fullName.split(' ')[0],
    lastName: fullName.split(' ')[1],
  };
};
