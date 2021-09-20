import React, { FC } from 'react';
import { useParams } from 'react-router-dom';
import { useOpportunityInfoQuery } from '../hooks/generated/graphql';
import { OpportunityInfoFragment } from '../models/graphql-schema';
import { useChallenge } from '../hooks';

interface OpportunityContextProps {
  opportunity?: OpportunityInfoFragment;
  opportunityId: string;
  opportunityNameId: string;
  challengeId: string;
  challengeNameId: string;
  ecoverseId: string;
  ecoverseNameId: string;
  loading: boolean;
}

const OpportunityContext = React.createContext<OpportunityContextProps>({
  loading: true,
  opportunityId: '',
  opportunityNameId: '',
  challengeId: '',
  challengeNameId: '',
  ecoverseId: '',
  ecoverseNameId: '',
});

interface UrlParams {
  ecoverseId: string;
  opportunityId: string;
  challengeId: string;
}

interface OpportunityProviderProps {}

const OpportunityProvider: FC<OpportunityProviderProps> = ({ children }) => {
  const {
    ecoverseId: ecoverseNameId,
    challengeId: challengeNameId,
    opportunityId: opportunityNameId,
  } = useParams<UrlParams>();
  const { data, loading } = useOpportunityInfoQuery({
    variables: { ecoverseId: ecoverseNameId, opportunityId: opportunityNameId },
    errorPolicy: 'all',
  });
  const ecoverseId = data?.ecoverse?.id || '';
  const opportunity = data?.ecoverse?.opportunity;
  const opportunityId = opportunity?.id || '';
  // using the challenge provider
  const { challengeId } = useChallenge();

  return (
    <OpportunityContext.Provider
      value={{
        opportunity,
        ecoverseId,
        ecoverseNameId,
        challengeId,
        challengeNameId,
        opportunityId,
        opportunityNameId,
        loading,
      }}
    >
      {children}
    </OpportunityContext.Provider>
  );
};

export { OpportunityProvider, OpportunityContext };
