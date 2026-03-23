import type React from 'react';
import { type FC, useContext, useEffect } from 'react';
import { ApmContext } from '@/core/analytics/apm/context/ApmProvider';

type Props = { path: string; children: React.ReactElement };

export const WithApmTransaction: FC<Props> = ({ path, children }) => {
  const { apm } = useContext(ApmContext);

  useEffect(() => {
    const transaction = apm?.startTransaction(path, 'route-change', { managed: true });
    return () => {
      transaction?.end();
    };
  }, [apm, path]);

  return children;
};
