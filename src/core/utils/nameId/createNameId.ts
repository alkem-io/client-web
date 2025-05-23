import diacritics from './diacritics';
/**
 * Taken from src/services/infrastructure/naming/naming.service.ts from server repo
 */

export const NAMEID_LENGTH = 25;

const createNameId = (base: string): string => {
  const nameIDExcludedCharacters = /[^a-zA-Z0-9-]/g;

  const baseMaxLength = base.slice(0, NAMEID_LENGTH);
  // replace spaces + trim to NAMEID_LENGTH characters
  const nameID = `${baseMaxLength}`.replace(/\s/g, '');
  // replace characters with umlouts etc to normal characters
  const nameIDNoSpecialCharacters: string = replaceSpecialCharacters(nameID);
  // Remove any characters that are not allowed
  return nameIDNoSpecialCharacters.replace(nameIDExcludedCharacters, '').toLowerCase().slice(0, NAMEID_LENGTH);
};

export default createNameId;

function replaceSpecialCharacters(text: string): string {
  const diacriticsMap = {};
  for (let i = 0; i < diacritics.length; i++) {
    const letters = diacritics[i].letters;
    for (let j = 0; j < letters.length; j++) {
      diacriticsMap[letters[j]] = diacritics[i].base;
    }
  }

  function replace(refinedText: string): string {
    if (refinedText) {
      return refinedText.replace(/[^\u0000-\u007E]/g, function (a) {
        return diacriticsMap[a] || a;
      });
    }

    return refinedText;
  }

  return replace(text);
}
