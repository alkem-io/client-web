import { useMemo } from 'react';
import { ActivityType } from '../../activity/ActivityType';
import { Nvp } from '../../../models/graphql-schema';

const getCanvasesCount = (activity: Nvp[] | undefined) => {
  //!! PENDING
  const value = activity?.find(activity => activity.name === ActivityType.Aspect)?.value;
  return typeof value === 'undefined' ? value : Number(value);
};

export const useCanvasesCount = (activity: Nvp[] | undefined) => useMemo(() => getCanvasesCount(activity), [activity]);
