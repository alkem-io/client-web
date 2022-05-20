const areDepsEqual = (prevDeps: unknown[] | undefined, nextDeps: unknown[] | undefined) =>
  (!prevDeps && !nextDeps) || Boolean(nextDeps?.every((val, i) => Object.is(val, prevDeps?.[i])));

export default areDepsEqual;
