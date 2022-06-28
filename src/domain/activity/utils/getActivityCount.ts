import { ActivityType } from '../ActivityType';

export interface Activity {
  name: string;
  value: string;
}

type ActivityTypeName = ActivityType[keyof ActivityType];

/***
 * Return a value by activity's name
 * @param activityArray
 * @param name
 */
const getActivityCount = (activityArray: Activity[] | undefined, name: ActivityTypeName): number => {
  const activity = activityArray?.find(x => x.name === name);

  return activity ? Number(activity.value) : 0;
};

export default getActivityCount;
