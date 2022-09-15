import { v4 } from 'uuid';

export const createUserNameID = (firstName: string, lastName: string) => {
  const nameID = `${firstName}-${lastName}-${v4()}`.replaceAll(/\s/g, '').slice(0, 25);
  const replaceSpecialCharacters = require('replace-special-characters');
  return replaceSpecialCharacters(nameID);
};
