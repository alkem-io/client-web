import React, { FC } from 'react';
import { ApplicationButtonProps } from '../../components/composite/common/ApplicationButton/ApplicationButton';
import { useAuthenticationContext, useUserContext } from '../../hooks';
import { useUserApplicationsQuery } from '../../hooks/generated/graphql';
import { Container } from '../../models/container';
import { buildChallengeApplyUrl, buildEcoverseApplyUrl } from '../../utils/urlBuilders';

interface ApplicationContainerEntities {
  applicationButtonProps: ApplicationButtonProps;
}
interface ApplicationContainerActions {}
interface ApplicationContainerState {
  loading: boolean;
}

interface ApplicationContainerProps
  extends Container<ApplicationContainerEntities, ApplicationContainerActions, ApplicationContainerState> {
  entities: {
    ecoverseId: string;
    ecoverseNameId: string;
    ecoverseName: string;
    challengeId?: string;
    challengeNameId?: string;
    challengeName?: string;
  };
}

export const ApplicationButtonContainer: FC<ApplicationContainerProps> = ({ entities, children }) => {
  const { isAuthenticated } = useAuthenticationContext();
  const { user } = useUserContext();
  const { ecoverseNameId, ecoverseId, challengeId, challengeNameId, ecoverseName, challengeName } = entities;
  const { data: memberShip, loading } = useUserApplicationsQuery({
    variables: { input: { userID: user?.user?.id || '' } },
  });

  const userApplication = memberShip?.membershipUser.applications?.find(
    x => x.ecoverseID === ecoverseId && x.challengeID === challengeId && !x.opportunityID
  );

  const parentApplication = memberShip?.membershipUser.applications?.find(
    x => x.ecoverseID === ecoverseId && !x.challengeID && !x.opportunityID
  );

  const isMember =
    (challengeId && challengeNameId ? user?.ofChallenge(ecoverseId) : user?.ofEcoverse(ecoverseId)) || false;
  const applyUrl =
    challengeId && challengeNameId
      ? buildChallengeApplyUrl(ecoverseNameId, challengeNameId)
      : buildEcoverseApplyUrl(ecoverseId);

  const applicationButtonProps: ApplicationButtonProps = {
    isAuthenticated,
    isMember,
    isNotParentMember: Boolean(challengeId) && !user?.ofEcoverse(ecoverseId),
    applyUrl,
    parentApplyUrl: buildEcoverseApplyUrl(ecoverseNameId),
    applicationState: userApplication?.state,
    parentApplicationState: parentApplication?.state,
    ecoverseName,
    challengeName,
  };

  return (
    <>
      {children(
        {
          applicationButtonProps,
        },
        { loading },
        {}
      )}
    </>
  );
};
export default ApplicationButtonContainer;
