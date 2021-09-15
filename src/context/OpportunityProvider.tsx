import React, { FC } from 'react';
import { useParams } from 'react-router-dom';
import { useOpportunityInfoQuery } from '../hooks/generated/graphql';
import { OpportunityInfoFragment } from '../models/graphql-schema';

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

interface UrlParams {
  ecoverseId: string;
  opportunityId: string;
  challengeId: string;
}

interface OpportunityProviderProps {}

const OpportunityProvider: FC<OpportunityProviderProps> = ({ children }) => {
  const { ecoverseId, challengeId, opportunityId } = useParams<UrlParams>();
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
