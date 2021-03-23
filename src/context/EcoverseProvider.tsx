import React, { FC } from 'react';
import { EcoverseInfoQuery, useEcoverseInfoQuery } from '../generated/graphql';

interface EcoverseContextProps {
  ecoverse?: EcoverseInfoQuery;
  loading: boolean;
}

const EcoverseContext = React.createContext<EcoverseContextProps>({
  loading: true,
});

const EcoverseProvider: FC<{}> = ({ children }) => {
  const { data: ecoverse, loading: ecoverseLoading } = useEcoverseInfoQuery({ errorPolicy: 'all' });
  const loading = ecoverseLoading;

  return (
    <EcoverseContext.Provider
      value={{
        ecoverse,
        loading,
      }}
    >
      {children}
    </EcoverseContext.Provider>
  );
};

export { EcoverseProvider, EcoverseContext };
