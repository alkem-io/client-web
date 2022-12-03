import { useMemo } from 'react';
import { MetricType } from '../../../platform/metrics/MetricType';
import { Nvp } from '../../../../core/apollo/generated/graphql-schema';

const getCanvasesCount = (activity: Nvp[] | undefined) => {
  const value = activity?.find(activity => activity.name === MetricType.Canvas)?.value;
  return typeof value === 'undefined' ? value : Number(value);
};

export const useCanvasesCount = (activity: Nvp[] | undefined) => useMemo(() => getCanvasesCount(activity), [activity]);
