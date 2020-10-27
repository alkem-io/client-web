export const nameToAltId = (name: string) => {
  return name && name.toLowerCase().replaceAll(' ', '-');
};
