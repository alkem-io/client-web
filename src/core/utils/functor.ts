type Fn<Args extends Array<unknown>, Result> = (...args: Args) => Result;

/**
 * Returns a function that has 2 behaviors depending on the provided value:
 * If the provided value is a function, the returned function calls it and returns the result of the original one.
 * Otherwise, just returns the given value.
 * @param fn
 */
export const functor = <Args extends Array<unknown>, Result>(fn: Fn<Args, Result> | Result): Fn<Args, Result> => {
  return (...args: Args): Result => {
    if (typeof fn === 'function') {
      return (fn as Function)(...args);
    }
    return fn;
  };
};
