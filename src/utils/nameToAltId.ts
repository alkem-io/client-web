import { replaceAll } from './replaceAll';

export const nameToAltId = (name: string) => {
  return name && replaceAll(' ', '-', name.toLowerCase());
};
