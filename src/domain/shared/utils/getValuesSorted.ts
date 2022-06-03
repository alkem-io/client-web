import { sortBy } from 'lodash';

const getValuesSorted = <Object extends {}>(object: Object): Object[keyof Object][] => {
  const entries = Object.entries(object) as [keyof Object, Object[keyof Object]][];
  return sortBy(entries, ([key]) => key).map(([_key, value]) => value);
};

export default getValuesSorted;
