import React, { FC } from 'react';
import { OpportunityApplicationButtonProps } from '../applicationButton/OpportunityApplicationButton';

import { useSpace } from '../../../journey/space/SpaceContext/useSpace';
import { useCommunityUserPrivilegesWithParentCommunityQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { buildChallengeUrl, buildSpaceUrl } from '../../../../main/routing/urlBuilders';
import { CommunityMembershipStatus } from '../../../../core/apollo/generated/graphql-schema';
import { useCommunityContext } from '../../community/CommunityContext';
import { useAuthenticationContext } from '../../../../core/auth/authentication/hooks/useAuthenticationContext';
import { SimpleContainerProps } from '../../../../core/container/SimpleContainer';
import useSendMessageToCommunityLeads from '../../CommunityLeads/useSendMessageToCommunityLeads';

interface ApplicationContainerState {
  loading: boolean;
}

export interface OpportunityApplicationButtonContainerProps
  extends SimpleContainerProps<{
    applicationButtonProps: OpportunityApplicationButtonProps;
    state: ApplicationContainerState;
  }> {
  challengeNameId?: string;
  opportunityNameId?: string;
}

export const OpportunityApplicationButtonContainer: FC<OpportunityApplicationButtonContainerProps> = ({
  challengeNameId,
  opportunityNameId,
  children,
}) => {
  const { isAuthenticated } = useAuthenticationContext();
  const { myMembershipStatus } = useCommunityContext();
  const { spaceNameId } = useSpace();

  const { data: _communityPrivileges, loading: communityPrivilegesLoading } =
    useCommunityUserPrivilegesWithParentCommunityQuery({
      variables: {
        spaceNameId,
        challengeNameId,
        opportunityNameId,
        includeChallenge: true,
        includeOpportunity: true,
      },
    });

  const isMember = myMembershipStatus === CommunityMembershipStatus.Member;
  const isParentMember =
    _communityPrivileges?.space?.challenge?.community?.myMembershipStatus === CommunityMembershipStatus.Member;

  const parentUrl = challengeNameId ? buildChallengeUrl(spaceNameId, challengeNameId) : buildSpaceUrl(spaceNameId);
  const communityLeadUsers = _communityPrivileges?.space?.opportunity?.community?.leadUsers ?? [];
  const leadUsers = communityLeadUsers.map(user => ({
    id: user.id,
    displayName: user.profile.displayName,
    country: user.profile.location?.country,
    city: user.profile.location?.city,
    avatarUri: user.profile.avatar?.uri,
  }));
  const communityId = _communityPrivileges?.space.opportunity?.community?.id;
  const sendMessageToCommunityLeads = useSendMessageToCommunityLeads(communityId);

  const loading = communityPrivilegesLoading;

  const applicationButtonProps: OpportunityApplicationButtonProps = {
    isAuthenticated,
    isMember,
    isParentMember,
    sendMessageToCommunityLeads,
    leadUsers,
    parentUrl,
    loading,
  };

  return (
    <>
      {children({
        applicationButtonProps,
        state: { loading },
      })}
    </>
  );
};

export default OpportunityApplicationButtonContainer;
