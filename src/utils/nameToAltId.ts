export const nameToAltId = (name: string) => {
  return name && name.toLowerCase().replace(' ', '-');
};
