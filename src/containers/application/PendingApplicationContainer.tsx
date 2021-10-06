import React, { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useApplicationByEcoverseLazyQuery,
  useChallengeNameIdQuery,
  useEcoverseNameIdQuery,
  useOpportunityNameIdQuery,
} from '../../hooks/generated/graphql';
import { Question } from '../../models/graphql-schema';
import { buildChallengeUrl, buildEcoverseUrl, buildOpportunityUrl } from '../../utils/urlBuilders';
import getApplicationTypeTranslationKey from '../../utils/application/getApplicationTypeTranslation';
import { ApplicationWithType } from '../../utils/application/getApplicationWithType';

export interface PendingApplicationEntities {
  url: string;
  typeName: string;
  questions: Question[];
}
export interface PendingApplicationActions {
  handleDialogOpen: (application: ApplicationWithType) => void;
  handleDialogClose: () => void;
}
export interface PendingApplicationState {
  loading: boolean;
  loadingDialog: boolean;
}

export interface PendingApplicationContainerProps {
  entities: {
    application: ApplicationWithType;
  };
  children: (
    entities: PendingApplicationEntities,
    actions: PendingApplicationActions,
    state: PendingApplicationState
  ) => React.ReactNode;
}

const PendingApplicationContainer: FC<PendingApplicationContainerProps> = ({ entities, children }) => {
  const { t } = useTranslation();
  const { type, ecoverseID, challengeID = '', opportunityID = '' } = entities.application;

  const [questions, setQuestions] = useState<Question[]>([]);

  let url = '';

  const { data: _opportunityNameId, loading: loadingOpportunity } = useOpportunityNameIdQuery({
    variables: { ecoverseId: ecoverseID, opportunityId: opportunityID },
    skip: !opportunityID,
  });
  if (opportunityID) {
    const ecoverseNameId = _opportunityNameId?.ecoverse.nameID || '';
    const challengeNameId = _opportunityNameId?.ecoverse.opportunity.challenge?.nameID || '';
    const opportunityNameId = _opportunityNameId?.ecoverse.opportunity.nameID || '';
    url = buildOpportunityUrl(ecoverseNameId, challengeNameId, opportunityNameId);
  }

  const { data: _challengeNameId, loading: loadingChallenge } = useChallengeNameIdQuery({
    variables: { ecoverseId: ecoverseID, challengeId: challengeID },
    skip: !challengeID,
  });
  if (challengeID && !opportunityID) {
    const ecoverseNameId = _challengeNameId?.ecoverse.nameID || '';
    const challengeNameId = _challengeNameId?.ecoverse.challenge.nameID || '';
    url = buildChallengeUrl(ecoverseNameId, challengeNameId);
  }

  const { data: _ecoverseNameId, loading: loadingEcoverse } = useEcoverseNameIdQuery({
    variables: { ecoverseId: ecoverseID },
    skip: !!(ecoverseID && (challengeID || opportunityID)),
  });
  if (ecoverseID && !challengeID && !opportunityID) {
    const ecoverseNameId = _ecoverseNameId?.ecoverse.nameID || '';
    url = buildEcoverseUrl(ecoverseNameId);
  }

  const [applicationByEcoverse, { loading: loadingDialog }] = useApplicationByEcoverseLazyQuery({
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    onCompleted: data => setQuestions(data?.ecoverse.application.questions),
  });

  const handleDialogOpen = useCallback(
    (application: ApplicationWithType) => {
      applicationByEcoverse({
        variables: { ecoverseId: application.ecoverseID, appId: application.id },
      });
    },
    [entities.application]
  );

  const handleDialogClose = () => setQuestions([]);

  const typeTranslationKey = getApplicationTypeTranslationKey(type);
  const typeName = t(typeTranslationKey) as string;

  return (
    <>
      {children(
        { url, typeName, questions },
        { handleDialogOpen, handleDialogClose },
        {
          loading: loadingEcoverse || loadingChallenge || loadingOpportunity,
          loadingDialog,
        }
      )}
    </>
  );
};
export default PendingApplicationContainer;
