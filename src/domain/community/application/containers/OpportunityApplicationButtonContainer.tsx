import React, { FC } from 'react';
import { OpportunityApplicationButtonProps } from '../applicationButton/OpportunityApplicationButton';
import { useCommunityUserPrivilegesWithParentCommunityQuery } from '../../../../core/apollo/generated/apollo-hooks';
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
  challengeId: string | undefined;
  opportunityId: string | undefined;
}

export const OpportunityApplicationButtonContainer: FC<OpportunityApplicationButtonContainerProps> = ({
  challengeId,
  opportunityId,
  children,
}) => {
  const { isAuthenticated } = useAuthenticationContext();
  const { myMembershipStatus } = useCommunityContext();

  const { data: _communityPrivileges, loading: communityPrivilegesLoading } =
    useCommunityUserPrivilegesWithParentCommunityQuery({
      variables: {
        challengeId,
        opportunityId,
        includeChallenge: true,
        includeOpportunity: true,
      },
      skip: !challengeId || !opportunityId,
    });

  const isMember = myMembershipStatus === CommunityMembershipStatus.Member;
  const isParentMember =
    _communityPrivileges?.lookup.subspace?.community?.myMembershipStatus === CommunityMembershipStatus.Member;

  const parentUrl = _communityPrivileges?.lookup.subspace?.profile.url;
  const communityLeadUsers = _communityPrivileges?.lookup.subsubspace?.community?.leadUsers ?? [];
  const leadUsers = communityLeadUsers.map(user => ({
    id: user.id,
    displayName: user.profile.displayName,
    country: user.profile.location?.country,
    city: user.profile.location?.city,
    avatarUri: user.profile.avatar?.uri,
  }));
  const communityId = _communityPrivileges?.lookup.subsubspace?.community?.id;
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
