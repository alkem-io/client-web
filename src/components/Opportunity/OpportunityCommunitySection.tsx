import React, { FC } from 'react';
import { useOpportunityCommunityMessagesQuery, useOpportunityUserIdsQuery } from '../generated/graphql';
import { User } from '../../models/graphql-schema';
import CommunitySection, { CommunitySectionPropsExt } from '../Community/CommunitySection';
import Loading from '../core/Loading';

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

  if (loading || usersLoading) return <Loading text={'Loading community data'} />;

  return (
    <CommunitySection
      users={(usersQuery?.ecoverse.opportunity.community?.members as User[]) || []}
      updates={data?.ecoverse.opportunity.community?.updatesRoom.messages}
      discussions={data?.ecoverse.opportunity.community?.discussionRoom.messages}
      {...rest}
    />
  );
};
export default OpportunityCommunitySection;
