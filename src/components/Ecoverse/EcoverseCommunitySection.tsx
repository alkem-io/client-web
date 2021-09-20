import React, { FC } from 'react';
import { useEcoversCommunityMessagesQuery, useEcoverseUserIdsQuery } from '../../hooks/generated/graphql';
import { useEcoverse } from '../../hooks';
import { User } from '../../models/graphql-schema';
import CommunitySection, { CommunitySectionPropsExt } from '../Community/CommunitySection';
import { Loading } from '../core';

interface EcoverseCommunitySectionProps extends CommunitySectionPropsExt {}

export const EcoverseCommunitySection: FC<EcoverseCommunitySectionProps> = ({ ...rest }) => {
  const { ecoverseNameId } = useEcoverse();
  const { data: usersQuery, loading: usersLoading } = useEcoverseUserIdsQuery({
    variables: {
      ecoverseId: ecoverseNameId,
    },
    errorPolicy: 'all',
  });
  const { data, loading } = useEcoversCommunityMessagesQuery({
    variables: {
      ecoverseId: ecoverseNameId,
    },
  });

  if (usersLoading || loading) return <Loading text={'Loading community data'} />;

  return (
    <CommunitySection
      updates={data?.ecoverse.community?.updatesRoom?.messages}
      discussions={data?.ecoverse.community?.discussionRoom?.messages}
      users={(usersQuery?.ecoverse.community?.members as User[]) || []}
      {...rest}
    />
  );
};
export default EcoverseCommunitySection;
