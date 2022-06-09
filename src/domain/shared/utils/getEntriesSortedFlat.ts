import { sortBy } from 'lodash';

/**
 * If you want a hook to be re-run when object property values change, you can pass the flattened array of its sorted entries as deps.
 * Use like that: useEffect(() => {}, [dep1, dep2, ...getEntriesSortedFlat(object)]);
 * @param object
 */
const getEntriesSortedFlat = <Object extends {}>(object: Object): (keyof Object | Object[keyof Object])[] => {
  const entries = Object.entries(object) as [keyof Object, Object[keyof Object]][];
  return sortBy(entries, ([key]) => key).flat();
};

export default getEntriesSortedFlat;
