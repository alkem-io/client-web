import React, { FC } from 'react';
import { ApplicationButtonProps } from '../../components/composite/common/ApplicationButton/ApplicationButton';
import { useAuthenticationContext, useUserContext } from '../../hooks';
import { useUserApplicationsQuery } from '../../hooks/generated/graphql';
import { ContainerProps } from '../../models/container';
import { buildChallengeApplyUrl, buildEcoverseApplyUrl } from '../../utils/urlBuilders';

interface ApplicationContainerEntities {
  applicationButtonProps: ApplicationButtonProps;
}
interface ApplicationContainerActions {}
interface ApplicationContainerState {
  loading: boolean;
}

interface ApplicationContainerProps
  extends ContainerProps<ApplicationContainerEntities, ApplicationContainerActions, ApplicationContainerState> {
  entities: {
    hubId: string;
    hubNameId: string;
    hubName: string;
    challengeId?: string;
    challengeNameId?: string;
    challengeName?: string;
  };
}

export const ApplicationButtonContainer: FC<ApplicationContainerProps> = ({ entities, children }) => {
  const { isAuthenticated } = useAuthenticationContext();
  const { user } = useUserContext();
  // challengeId = null, because the query returns null rather than undefined
  const { hubNameId, hubId, challengeId = null, challengeNameId, hubName, challengeName } = entities;
  const { data: memberShip, loading } = useUserApplicationsQuery({
    variables: { input: { userID: user?.user?.id || '' } },
  });

  // todo: refactor logic or use entity privileges
  const userApplication = memberShip?.membershipUser.applications?.find(
    x => x.hubID === hubId && x.challengeID === challengeId && !x.opportunityID
  );

  // find an application which does not have a challengeID, meaning it's on hub level,
  // but you are at least at challenge level to have a parent application
  const parentApplication = memberShip?.membershipUser.applications?.find(
    x => x.hubID === hubId && !x.challengeID && !x.opportunityID && challengeId
  );

  const isMember = (challengeId && challengeNameId ? user?.ofChallenge(challengeId) : user?.ofEcoverse(hubId)) || false;
  const applyUrl =
    challengeId && challengeNameId
      ? buildChallengeApplyUrl(hubNameId, challengeNameId)
      : buildEcoverseApplyUrl(hubNameId);

  const applicationButtonProps: ApplicationButtonProps = {
    isAuthenticated,
    isMember,
    isNotParentMember: Boolean(challengeId) && !user?.ofEcoverse(hubId),
    applyUrl,
    parentApplyUrl: buildEcoverseApplyUrl(hubNameId),
    applicationState: userApplication?.state,
    parentApplicationState: parentApplication?.state,
    hubName,
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
