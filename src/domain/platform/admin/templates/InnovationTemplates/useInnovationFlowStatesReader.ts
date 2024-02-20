import { useEffect, useState } from 'react';
import { LifecycleDataProvider } from '@alkemio/visualization';
import { error as sentryError } from '../../../../../core/logging/sentry/log';
import useLoadingState from '../../../../shared/utils/useLoadingState';

interface useInnovationFlowStatesReaderProps {
  definition: string | undefined;
}

interface useInnovationFlowStatesReaderProvided {
  loading: boolean;
  states: string[];
}

const useInnovationFlowStatesReader = ({
  definition,
}: useInnovationFlowStatesReaderProps): useInnovationFlowStatesReaderProvided => {
  const [states, setStates] = useState<string[]>([]);

  const [loadData, loading] = useLoadingState(async (definition: string) => {
    try {
      const lifecycleData = new LifecycleDataProvider();
      await lifecycleData.loadData(definition);
      setStates(Object.keys(lifecycleData.machine.states));
    } catch (e) {
      const error = new Error(
        `Coulnd't load innovationFlow definition:'${definition}' ${(e as { message?: string }).message}`
      );
      sentryError(error);
    }
  });

  useEffect(() => {
    if (definition) {
      loadData(definition);
    }
  }, [definition]);

  return {
    loading,
    states,
  };
};

export default useInnovationFlowStatesReader;
