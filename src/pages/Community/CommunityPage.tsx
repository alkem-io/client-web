import React, { FC, useMemo } from 'react';
import { PageProps } from '../common';
import { useUpdateNavigation } from '../../hooks';
import CommunityPageView from '../../views/community/CommunityPageView';
import { Scalars } from '../../models/graphql-schema';
import { useResolvedPath } from 'react-router-dom';
import { CommunityUpdatesContainer } from '../../containers/community-updates/CommunityUpdatesContainer';

export interface CommunityPageV2Props extends PageProps {
  hubId?: Scalars['UUID_NAMEID'];
  communityId?: Scalars['UUID'];
}

// TODO use for Community Dialog
const CommunityPage: FC<CommunityPageV2Props> = ({ paths, hubId, communityId, children }) => {
  const { pathname: url } = useResolvedPath('.');
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'community', real: true }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <CommunityUpdatesContainer entities={{ hubId, communityId }}>
      {({ messages, authors }, actions, loading) => (
        <CommunityPageView messages={messages} messagesLoading={loading.retrievingUpdateMessages} authors={authors}>
          {children}
        </CommunityPageView>
      )}
    </CommunityUpdatesContainer>
  );
};

export default CommunityPage;
