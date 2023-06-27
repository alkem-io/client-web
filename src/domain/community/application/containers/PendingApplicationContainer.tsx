import React, { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useApplicationBySpaceLazyQuery,
  useChallengeNameIdQuery,
  useSpaceNameIdQuery,
  useOpportunityNameIdQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { Application } from '../../../../core/apollo/generated/graphql-schema';
import { buildChallengeUrl, buildSpaceUrl, buildOpportunityUrl } from '../../../../common/utils/urlBuilders';
import getApplicationTypeTranslationKey from '../../../../common/utils/application/getApplicationTypeTranslation';
import { ApplicationWithType } from '../../../../common/utils/application/getApplicationWithType';

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
  const { type, spaceID, challengeID = '', opportunityID = '' } = entities.application;

  const [applicationDetails, setApplicationDetails] = useState<ApplicationDialogDetails>();
  const [isDialogOpened, setIsDialogOpened] = useState(false);

  let url = '';

  const { data: _opportunityNameId, loading: loadingOpportunity } = useOpportunityNameIdQuery({
    variables: { spaceId: spaceID, opportunityId: opportunityID },
    skip: !opportunityID,
  });
  if (opportunityID) {
    const spaceNameId = _opportunityNameId?.space.nameID || '';
    const challengeNameId = _opportunityNameId?.space.opportunity.parentNameID || '';
    const opportunityNameId = _opportunityNameId?.space.opportunity.nameID || '';
    url = buildOpportunityUrl(spaceNameId, challengeNameId, opportunityNameId);
  }

  const { data: _challengeNameId, loading: loadingChallenge } = useChallengeNameIdQuery({
    variables: { spaceId: spaceID, challengeId: challengeID },
    skip: !challengeID,
  });
  if (challengeID && !opportunityID) {
    const spaceNameId = _challengeNameId?.space.nameID || '';
    const challengeNameId = _challengeNameId?.space.challenge.nameID || '';
    url = buildChallengeUrl(spaceNameId, challengeNameId);
  }

  const { data: _spaceNameId, loading: loadingSpace } = useSpaceNameIdQuery({
    variables: { spaceId: spaceID },
    skip: !!(spaceID && (challengeID || opportunityID)),
  });
  if (spaceID && !challengeID && !opportunityID) {
    const spaceNameId = _spaceNameId?.space.nameID || '';
    url = buildSpaceUrl(spaceNameId);
  }

  const [applicationBySpace, { loading: loadingDialog }] = useApplicationBySpaceLazyQuery({
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    onCompleted: ({ space }) =>
      setApplicationDetails({
        questions: space.application.questions,
        createdDate: space.application.createdDate,
        updatedDate: space.application.updatedDate,
      }),
  });

  const handleDialogOpen = useCallback(
    (application: ApplicationWithType) => {
      applicationBySpace({
        variables: { spaceId: application.spaceID, appId: application.id },
      });
      setIsDialogOpened(true);
    },
    [applicationBySpace]
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
          loading: loadingSpace || loadingChallenge || loadingOpportunity,
          loadingDialog,
          isDialogOpened,
        }
      )}
    </>
  );
};

export default PendingApplicationContainer;
