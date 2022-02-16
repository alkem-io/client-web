import React, { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useApplicationByEcoverseLazyQuery,
  useChallengeNameIdQuery,
  useEcoverseNameIdQuery,
  useOpportunityNameIdQuery,
} from '../../hooks/generated/graphql';
import { Application } from '../../models/graphql-schema';
import { buildChallengeUrl, buildEcoverseUrl, buildOpportunityUrl } from '../../utils/urlBuilders';
import getApplicationTypeTranslationKey from '../../utils/application/getApplicationTypeTranslation';
import { ApplicationWithType } from '../../utils/application/getApplicationWithType';

export type ApplicationDialogDetails = Pick<Application, 'questions' | 'createdDate' | 'updatedDate'>;

export interface PendingApplicationEntities {
  url: string;
  typeName: string;
  applicationDetails?: ApplicationDialogDetails;
}
export interface PendingApplicationActions {
  handleDialogOpen: (application: ApplicationWithType) => void;
  handleDialogClose: () => void;
}
export interface PendingApplicationState {
  loading: boolean;
  loadingDialog: boolean;
  isDialogOpened: boolean;
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
  const { type, hubID, challengeID = '', opportunityID = '' } = entities.application;

  const [applicationDetails, setApplicationDetails] = useState<ApplicationDialogDetails>();
  const [isDialogOpened, setIsDialogOpened] = useState(false);

  let url = '';

  const { data: _opportunityNameId, loading: loadingOpportunity } = useOpportunityNameIdQuery({
    variables: { hubId: hubID, opportunityId: opportunityID },
    skip: !opportunityID,
  });
  if (opportunityID) {
    const hubNameId = _opportunityNameId?.hub.nameID || '';
    const challengeNameId = _opportunityNameId?.hub.opportunity.challenge?.nameID || '';
    const opportunityNameId = _opportunityNameId?.hub.opportunity.nameID || '';
    url = buildOpportunityUrl(hubNameId, challengeNameId, opportunityNameId);
  }

  const { data: _challengeNameId, loading: loadingChallenge } = useChallengeNameIdQuery({
    variables: { hubId: hubID, challengeId: challengeID },
    skip: !challengeID,
  });
  if (challengeID && !opportunityID) {
    const hubNameId = _challengeNameId?.hub.nameID || '';
    const challengeNameId = _challengeNameId?.hub.challenge.nameID || '';
    url = buildChallengeUrl(hubNameId, challengeNameId);
  }

  const { data: _hubNameId, loading: loadingEcoverse } = useEcoverseNameIdQuery({
    variables: { hubId: hubID },
    skip: !!(hubID && (challengeID || opportunityID)),
  });
  if (hubID && !challengeID && !opportunityID) {
    const hubNameId = _hubNameId?.hub.nameID || '';
    url = buildEcoverseUrl(hubNameId);
  }

  const [applicationByEcoverse, { loading: loadingDialog }] = useApplicationByEcoverseLazyQuery({
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    onCompleted: ({ hub }) =>
      setApplicationDetails({
        questions: hub.application.questions,
        createdDate: hub.application.createdDate,
        updatedDate: hub.application.updatedDate,
      }),
  });

  const handleDialogOpen = useCallback(
    (application: ApplicationWithType) => {
      applicationByEcoverse({
        variables: { hubId: application.hubID, appId: application.id },
      });
      setIsDialogOpened(true);
    },
    [entities.application]
  );

  const handleDialogClose = () => {
    setApplicationDetails(undefined);
    setIsDialogOpened(false);
  };

  const typeTranslationKey = getApplicationTypeTranslationKey(type);
  const typeName = t(typeTranslationKey) as string;

  return (
    <>
      {children(
        { url, typeName, applicationDetails: applicationDetails },
        { handleDialogOpen, handleDialogClose },
        {
          loading: loadingEcoverse || loadingChallenge || loadingOpportunity,
          loadingDialog,
          isDialogOpened,
        }
      )}
    </>
  );
};
export default PendingApplicationContainer;
