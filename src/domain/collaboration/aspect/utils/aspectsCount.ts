import { useMemo } from 'react';
import { MetricType } from '../../../platform/metrics/MetricType';
import { Nvp } from '../../../../core/apollo/generated/graphql-schema';

const getAspectsCount = (activity: Nvp[] | undefined) => {
  const value = activity?.find(activity => activity.name === MetricType.Aspect)?.value;
  return typeof value === 'undefined' ? value : Number(value);
};

export const useAspectsCount = (activity: Nvp[] | undefined) => useMemo(() => getAspectsCount(activity), [activity]);
