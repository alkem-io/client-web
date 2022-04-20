import React, { FC, useState } from 'react';

export interface Path {
  value?: string;
  name: string;
  real: boolean;
}

interface NavigationContextProps {
  paths: Path[];
  set: (paths: Path[]) => void;
}

const NavigationContext = React.createContext<NavigationContextProps>({
  paths: [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  set: () => {},
});

const NavigationProvider: FC = ({ children }) => {
  const [paths, setPaths] = useState<Path[]>([]);

  return (
    <NavigationContext.Provider
      value={{
        paths,
        set: p => setPaths(p),
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export { NavigationProvider, NavigationContext };
