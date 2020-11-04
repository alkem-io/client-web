export const functor = <T extends Array<any>, U>(fn: any) => {
  return (...args: T): U => (typeof fn === 'function' && fn(...args)) || fn;
};

export const agnosticFunctor = (fn: any) => {
  return (...args: any) => (typeof fn === 'function' && fn(...args)) || fn;
};
