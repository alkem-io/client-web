import { createContext, PropsWithChildren, useEffect, useState } from 'react';
import { ApmBase } from '@elastic/apm-rum';
import { useApmInit } from '../useApmInit';

export interface ApmContextProps {
  apm?: ApmBase;
}

export const ApmContext = createContext<ApmContextProps>({
  apm: undefined,
});

interface Props extends PropsWithChildren<{}> {}

export const ApmProvider = ({ children }: Props) => {
  const [apm, setApm] = useState<ApmBase | undefined>();

  const initFn = useApmInit();

  useEffect(() => setApm(initFn));

  return <ApmContext.Provider value={{ apm }}>{children}</ApmContext.Provider>;
};
