import React, { useMemo } from 'react';
import LifecycleVisualizer, { LifecycleVisualizerProps } from '../../../../components/core/LifecycleVisualizer';
import { ErrorBoundary } from '../../../../containers/ErrorBoundary';

export const SafeLifecycleVisualizer = ({ definition }: { definition: string }) => {
  const lifecycle = useMemo<LifecycleVisualizerProps['lifecycle']>(() => ({
    machineDef: definition,
  }), [definition]);

  const key = useMemo(() => Date.now(), [definition]);

  return ( //todo better error boundry
    <ErrorBoundary key={key}>
      <LifecycleVisualizer lifecycle={lifecycle} />
    </ErrorBoundary>
  );
};
