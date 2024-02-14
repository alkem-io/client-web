import React, { FC } from 'react';
import { ApplicationButtonProps } from '../applicationButton/OpportunityApplicationButton';

import { useSpace } from '../../../journey/space/SpaceContext/useSpace';
import { useCommunityUserPrivilegesWithParentCommunityQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import { buildChallengeUrl, buildSpaceUrl } from '../../../../main/routing/urlBuilders';
import { CommunityMembershipStatus } from '../../../../core/apollo/generated/graphql-schema';
import { useCommunityContext } from '../../community/CommunityContext';
import { useAuthenticationContext } from '../../../../core/auth/authentication/hooks/useAuthenticationContext';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';

interface ApplicationContainerEntities {
  applicationButtonProps: Omit<ApplicationButtonProps, 'journeyTypeName'>;
}

interface ApplicationContainerActions {}

interface ApplicationContainerState {
  loading: boolean;
}

export interface ApplicationButtonContainerProps
  extends ContainerChildProps<ApplicationContainerEntities, ApplicationContainerActions, ApplicationContainerState> {
  parentJourneyNameId?: string;
  journeyNameId?: string;
  journeyTypeName?: JourneyTypeName;
}

export const ApplicationButtonContainer: FC<ApplicationButtonContainerProps> = ({
  parentJourneyNameId,
  journeyNameId,
  journeyTypeName,
  children,
}) => {
  const { isAuthenticated } = useAuthenticationContext();
  const { myMembershipStatus } = useCommunityContext();
  const { spaceNameId } = useSpace();

  const challengeNameId =
    journeyTypeName === 'challenge'
      ? journeyNameId
      : journeyTypeName === 'opportunity'
      ? parentJourneyNameId
      : undefined;
  const opportunityNameId = journeyTypeName === 'opportunity' ? journeyNameId : undefined;
  const includeSpaceCommunity = journeyTypeName === 'challenge' || journeyTypeName === 'space';
  const includeChallenge = journeyTypeName === 'challenge' || journeyTypeName === 'opportunity';
  const includeOpportunity = journeyTypeName === 'opportunity';

  const { data: _communityPrivileges, loading: communityPrivilegesLoading } =
    useCommunityUserPrivilegesWithParentCommunityQuery({
      variables: {
        spaceNameId,
        challengeNameId,
        opportunityNameId,
        includeSpaceCommunity,
        includeChallenge,
        includeOpportunity,
      },
    });

  const hasCommunityParent = journeyTypeName === 'challenge' || journeyTypeName === 'opportunity';

  const isMember = myMembershipStatus === CommunityMembershipStatus.Member;
  const isParentMember =
    hasCommunityParent &&
    (journeyTypeName === 'challenge'
      ? _communityPrivileges?.space?.community?.myMembershipStatus === CommunityMembershipStatus.Member
      : _communityPrivileges?.space?.challenge?.community?.myMembershipStatus === CommunityMembershipStatus.Member);

  const parentUrl = challengeNameId ? buildChallengeUrl(spaceNameId, challengeNameId) : buildSpaceUrl(spaceNameId);
  const parentCommunityLeadUsers =
    journeyTypeName === 'opportunity'
      ? _communityPrivileges?.space?.challenge?.community?.leadUsers ?? []
      : journeyTypeName === 'challenge'
      ? _communityPrivileges?.space?.community?.leadUsers ?? []
      : [];
  const parentLeadUsers = parentCommunityLeadUsers?.map(user => ({
    id: user.id,
    displayName: user.profile.displayName,
    country: user.profile.location?.country,
    city: user.profile.location?.city,
    avatarUri: user.profile.avatar?.uri,
  }));

  const loading = communityPrivilegesLoading;

  const applicationButtonProps: Omit<ApplicationButtonProps, 'journeyTypeName'> = {
    isAuthenticated,
    isMember,
    isParentMember,
    parentLeadUsers,
    parentUrl,
    loading,
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
