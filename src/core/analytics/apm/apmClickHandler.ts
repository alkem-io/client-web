import { useCallback } from 'react';
import { useApm } from './context/useApm';

export type ClickHandlerLabels = {
  name: string;
  url?: string;
} & { [key: string]: LabelValue };

export const useApmClickHandler = () => {
  const apm = useApm();

  return useCallback(
    (labels: ClickHandlerLabels) => {
      if (!apm) {
        return undefined;
      }
      const transaction = apm.startTransaction('custom-click', 'user-interaction-click');
      transaction?.addLabels(labels);

      setTimeout(() => transaction?.end(), 100);
    },
    [apm]
  );
};
