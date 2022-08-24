import { useMemo } from 'react';
import { ActivityType } from '../../activity/ActivityType';
import { Nvp } from '../../../models/graphql-schema';

const getCanvasesCount = (activity: Nvp[] | undefined) => {
  const value = activity?.find(activity => activity.name === ActivityType.Canvas)?.value;
  return typeof value === 'undefined' ? value : Number(value);
};

export const useCanvasesCount = (activity: Nvp[] | undefined) => useMemo(() => getCanvasesCount(activity), [activity]);
