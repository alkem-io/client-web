import { useEffect, useState } from 'react';
import { LifecycleDataProvider } from '@alkemio/visualization';
import { error as sentryError } from '../../../../../core/logging/sentry/log';

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
  const [isLoading, setLoading] = useState(true);
  const [states, setStates] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      if (definition) {
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
      }
      setLoading(false);
    }
    loadData();
  }, [definition]);

  return {
    loading: isLoading,
    states,
  };
};

export default useInnovationFlowStatesReader;
