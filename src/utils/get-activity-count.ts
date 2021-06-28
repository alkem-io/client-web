/***
 * Return a value by activity's name or -1 otherwise
 * @param activityArray
 * @param name
 */
const getActivityCount = (activityArray: { name: string; value: string }[], name: string): number => {
  if (!Array.isArray(activityArray)) {
    return -1;
  }
  const activity = activityArray.find(x => x.name === name);

  if (!activity) {
    return -1;
  }

  return activity.value != null ? +activity.value : 0;
};
export default getActivityCount;
