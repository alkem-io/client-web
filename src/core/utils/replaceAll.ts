/* eslint-disable no-useless-escape */
export const replaceAll = function (replaceThis: string, withThis: string, inThis: string) {
  withThis = withThis.replace(/\$/g, '$$$$');
  return inThis.replace(
    new RegExp(replaceThis.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|<>\-\&])/g, '\\$&'), 'g'),
    withThis
  );
};
