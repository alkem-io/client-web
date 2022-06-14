import { sortBy } from 'lodash';

/**
 * If you want a hook to be re-run when object property values change, you can pass the flattened array of its sorted entries as deps.
 * Use like that: useEffect(() => {}, [dep1, dep2, getDepsValueFromObject(object)]);
 * @param object
 */
const getDepsValueFromObject = <Object extends {}>(object: Object | undefined | null): string => {
  if (typeof object === 'undefined' || object === null) {
    return '';
  }
  const entries = Object.entries(object) as [keyof Object, Object[keyof Object]][];
  const sortedEntries = sortBy(entries, ([key]) => key).flat();
  return JSON.stringify(sortedEntries);
};

export default getDepsValueFromObject;
