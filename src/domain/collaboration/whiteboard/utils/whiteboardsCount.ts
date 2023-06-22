import { useMemo } from 'react';
import { MetricType } from '../../../platform/metrics/MetricType';
import { Nvp } from '../../../../core/apollo/generated/graphql-schema';

const getWhiteboardsCount = (activity: Nvp[] | undefined) => {
  const value = activity?.find(activity => activity.name === MetricType.Whiteboard)?.value;
  return typeof value === 'undefined' ? value : Number(value);
};

export const useWhiteboardsCount = (activity: Nvp[] | undefined) =>
  useMemo(() => getWhiteboardsCount(activity), [activity]);
