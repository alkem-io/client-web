import React, { FC } from 'react';
import { useCommunityUpdateSubscriptionSelector } from '../../containers/community-updates/CommunityUpdates';
import { useOpportunityCommunityMessagesQuery, useOpportunityUserIdsQuery } from '../../hooks/generated/graphql';
import { User } from '../../models/graphql-schema';
import CommunitySection, { CommunitySectionPropsExt } from '../Community/CommunitySection';
import { Loading } from '../core';

interface OpportunityCommunitySectionProps extends CommunitySectionPropsExt {
  ecoverseId: string;
  opportunityId: string;
}

export const OpportunityCommunitySection: FC<OpportunityCommunitySectionProps> = ({
  ecoverseId,
  opportunityId,
  ...rest
}) => {
  const { data: usersQuery, loading: usersLoading } = useOpportunityUserIdsQuery({
    variables: {
      ecoverseId,
      opportunityId,
    },
    errorPolicy: 'all',
  });
  const { data, loading } = useOpportunityCommunityMessagesQuery({
    variables: {
      ecoverseId: ecoverseId,
      opportunityId: opportunityId,
    },
  });

  const updateMessages = useCommunityUpdateSubscriptionSelector(data?.ecoverse.opportunity?.community);

  if (loading || usersLoading) return <Loading text={'Loading community data'} />;

  return (
    <CommunitySection
      users={(usersQuery?.ecoverse.opportunity.community?.members as User[]) || []}
      updates={updateMessages}
      discussions={data?.ecoverse.opportunity.community?.discussionRoom?.messages}
      {...rest}
    />
  );
};
export default OpportunityCommunitySection;
