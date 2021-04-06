import { useContext, useMemo } from 'react';
import { configContext } from '../context/ConfigProvider';

export const useConfig = () => {
  const context = useContext(configContext);

  return useMemo(
    () => ({
      authentication: context.config.authentication,
      loading: context.loading,
    }),
    [context]
  );
};
