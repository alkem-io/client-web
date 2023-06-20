import { useMemo } from 'react';
import { MetricType } from '../../../platform/metrics/MetricType';
import { Nvp } from '../../../../core/apollo/generated/graphql-schema';

const getPostsCount = (activity: Nvp[] | undefined) => {
  const value = activity?.find(activity => activity.name === MetricType.Post)?.value;
  return typeof value === 'undefined' ? value : Number(value);
};

export const usePostsCount = (activity: Nvp[] | undefined) => useMemo(() => getPostsCount(activity), [activity]);
