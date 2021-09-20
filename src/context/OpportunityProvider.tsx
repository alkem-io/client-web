import React, { FC } from 'react';
import { useOpportunityInfoQuery } from '../hooks/generated/graphql';
import { OpportunityInfoFragment } from '../models/graphql-schema';
import { useUrlParams } from '../hooks';

interface OpportunityContextProps {
  opportunity?: OpportunityInfoFragment;
  opportunityId: string;
  challengeId: string;
  ecoverseId: string;
  loading: boolean;
}

const OpportunityContext = React.createContext<OpportunityContextProps>({
  loading: true,
  opportunityId: '',
  challengeId: '',
  ecoverseId: '',
});

interface OpportunityProviderProps {}

const OpportunityProvider: FC<OpportunityProviderProps> = ({ children }) => {
  const { ecoverseId, challengeId, opportunityId } = useUrlParams();
  const { data, loading } = useOpportunityInfoQuery({
    variables: { ecoverseId, opportunityId },
    errorPolicy: 'all',
  });
  const opportunity = data?.ecoverse?.opportunity;

  return (
    <OpportunityContext.Provider
      value={{
        opportunity,
        ecoverseId,
        challengeId,
        opportunityId,
        loading,
      }}
    >
      {children}
    </OpportunityContext.Provider>
  );
};

export { OpportunityProvider, OpportunityContext };
