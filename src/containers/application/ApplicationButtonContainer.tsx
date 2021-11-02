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
  // challengeId = null, because the query returns null rather than undefined
  const { ecoverseNameId, ecoverseId, challengeId = null, challengeNameId, ecoverseName, challengeName } = entities;
  const { data: memberShip, loading } = useUserApplicationsQuery({
    variables: { input: { userID: user?.user?.id || '' } },
  });

  // todo: refactor logic or use entity privileges
  const userApplication = memberShip?.membershipUser.applications?.find(
    x => x.ecoverseID === ecoverseId && x.challengeID === challengeId && !x.opportunityID
  );

  // find an application which does not have a challengeID, meaning it's on ecoverse level,
  // but you are at least at challenge level to have a parent application
  const parentApplication = memberShip?.membershipUser.applications?.find(
    x => x.ecoverseID === ecoverseId && !x.challengeID && !x.opportunityID && challengeId
  );

  const isMember =
    (challengeId && challengeNameId ? user?.ofChallenge(challengeId) : user?.ofEcoverse(ecoverseId)) || false;
  const applyUrl =
    challengeId && challengeNameId
      ? buildChallengeApplyUrl(ecoverseNameId, challengeNameId)
      : buildEcoverseApplyUrl(ecoverseNameId);

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
