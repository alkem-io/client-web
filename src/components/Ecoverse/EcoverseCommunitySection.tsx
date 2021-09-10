import React, { FC } from 'react';
import { useEcoversCommunityMessagesQuery, useEcoverseUserIdsQuery } from '../../hooks/generated/graphql';
import { useEcoverse } from '../../hooks';
import { User } from '../../models/graphql-schema';
import CommunitySection, { CommunitySectionPropsExt } from '../Community/CommunitySection';
import { Loading } from '../core';
import { useCommunityUpdateSubscriptionSelector } from '../../containers/community-updates/CommunityUpdates';

interface EcoverseCommunitySectionProps extends CommunitySectionPropsExt {}

export const EcoverseCommunitySection: FC<EcoverseCommunitySectionProps> = ({ ...rest }) => {
  const { ecoverseId } = useEcoverse();
  const { data: usersQuery, loading: usersLoading } = useEcoverseUserIdsQuery({
    variables: {
      ecoverseId: ecoverseId,
    },
    errorPolicy: 'all',
  });
  const { data, loading } = useEcoversCommunityMessagesQuery({
    variables: {
      ecoverseId: ecoverseId,
    },
  });

  const updateMessages = useCommunityUpdateSubscriptionSelector(data?.ecoverse.community);

  if (usersLoading || loading) return <Loading text={'Loading community data'} />;

  return (
    <CommunitySection
      updates={updateMessages}
      discussions={data?.ecoverse.community?.discussionRoom?.messages}
      users={(usersQuery?.ecoverse.community?.members as User[]) || []}
      {...rest}
    />
  );
};
export default EcoverseCommunitySection;
