import { Nvp } from '../models/graphql-schema';

/***
 * Return a value by activity's name or <i>null</i> otherwise
 * @param activityArray
 * @param name
 */
const getActivityCount = (activityArray: (Pick<Nvp, 'name' | 'value'> | Nvp)[], name: string): number | null => {
  if (!Array.isArray(activityArray)) {
    return null;
  }

  const activity = activityArray.find(x => x.name === name);

  if (!activity) {
    return null;
  }

  return activity.value != null ? +activity.value : null;
};
export default getActivityCount;
