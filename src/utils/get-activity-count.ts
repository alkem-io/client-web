import { Nvp } from '../models/graphql-schema';
import { ActivityType } from '../models/constants';

export type Activity = Pick<Nvp, 'name' | 'value'>;

type ActivityTypeName = ActivityType[keyof ActivityType];

/***
 * Return a value by activity's name or <i>null</i> otherwise
 * @param activityArray
 * @param name
 */
const getActivityCount = (activityArray: Activity[] | undefined, name: ActivityTypeName): number | null => {
  const activity = activityArray?.find(x => x.name === name);

  if (!activity) {
    return null;
  }

  return Number(activity.value);
};

export default getActivityCount;
