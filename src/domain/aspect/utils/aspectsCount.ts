import { useMemo } from 'react';
import { ActivityType } from '../../../models/constants';
import { Nvp } from '../../../models/graphql-schema';

const getAspectsCount = (activity: Nvp[] | undefined) => {
  const value = activity?.find(activity => activity.name === ActivityType.Aspect)?.value;
  return typeof value === 'undefined' ? value : Number(value);
};

export const useAspectsCount = (activity: Nvp[] | undefined) => useMemo(() => getAspectsCount(activity), [activity]);
