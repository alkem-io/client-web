import React, { FC } from 'react';
import { useOpportunityCommunityMessagesQuery } from '../../generated/graphql';
import CommunitySection, { CommunitySectionProps } from '../Community/CommunitySection';
import Loading from '../core/Loading';

interface OpportunityCommunitySectionProps extends CommunitySectionProps {
  ecoverseId: string;
  opportunityId: string;
}

export const OpportunityCommunitySection: FC<OpportunityCommunitySectionProps> = ({
  updates: _updates,
  discussions: _discussions,
  ecoverseId,
  opportunityId,
  ...rest
}) => {
  const { data, loading } = useOpportunityCommunityMessagesQuery({
    variables: {
      ecoverseId: ecoverseId,
      opportunityId: opportunityId,
    },
  });

  if (loading) return <Loading text={'Loading updates'} />;

  return (
    <CommunitySection
      updates={data?.ecoverse.opportunity.community?.updatesRoom.messages}
      discussions={data?.ecoverse.opportunity.community?.discussionRoom.messages}
      {...rest}
    />
  );
};
export default OpportunityCommunitySection;
