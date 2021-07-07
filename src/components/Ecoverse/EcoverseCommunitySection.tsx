import React, { FC } from 'react';
import { useEcoversCommunityMessagesQuery } from '../../generated/graphql';
import { useEcoverse } from '../../hooks/useEcoverse';
import CommunitySection, { CommunitySectionProps } from '../Community/CommunitySection';
import Loading from '../core/Loading';

interface EcoverseCommunitySectionProps extends CommunitySectionProps {}

export const EcoverseCommunitySection: FC<EcoverseCommunitySectionProps> = ({
  updates: _updates,
  discussions: _discussions,
  ...rest
}) => {
  const { ecoverseId } = useEcoverse();
  const { data, loading } = useEcoversCommunityMessagesQuery({
    variables: {
      ecoverseId: ecoverseId,
    },
  });

  if (loading) return <Loading text={'Loading updates'} />;

  return (
    <CommunitySection
      updates={data?.ecoverse.community?.updatesRoom.messages}
      discussions={data?.ecoverse.community?.discussionRoom.messages}
      {...rest}
    />
  );
};
export default EcoverseCommunitySection;
