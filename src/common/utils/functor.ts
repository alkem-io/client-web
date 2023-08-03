/* eslint-disable @typescript-eslint/no-explicit-any */

/**
  @deprecated Not Used
*/
export const functor = <T extends Array<any>, U>(fn: any) => {
  return (...args: T): U => (typeof fn === 'function' && fn(...args)) || fn;
};

/**
  @deprecated What is this for?
*/
export const agnosticFunctor = (fn: any) => {
  return (...args: any) => (typeof fn === 'function' && fn(...args)) || fn;
};
