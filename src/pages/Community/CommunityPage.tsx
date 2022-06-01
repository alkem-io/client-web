import React, { FC, useMemo } from 'react';
import { PageProps } from '../common';
import { useUpdateNavigation } from '../../hooks';
import CommunityPageView from '../../views/community/CommunityPageView';
import { Scalars } from '../../models/graphql-schema';
import { useResolvedPath } from 'react-router-dom';
import { CommunityUpdatesContainer } from '../../containers/community-updates/CommunityUpdatesContainer';
import { AvatarsProvider } from '../../context/AvatarsProvider';
import PageLayout from '../../domain/shared/layout/PageLayout';
import { EntityPageSection } from '../../domain/shared/layout/EntityPageSection';
import { EntityTypeName } from '../../domain/shared/layout/PageLayout/PageLayout';

export interface CommunityPageV2Props extends PageProps {
  hubId?: Scalars['UUID_NAMEID'];
  communityId?: Scalars['UUID'];
  entityTypeName: EntityTypeName;
}

const CommunityPage: FC<CommunityPageV2Props> = ({ entityTypeName, paths, hubId, communityId, children }) => {
  const { pathname: url } = useResolvedPath('.');
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'community', real: true }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <PageLayout currentSection={EntityPageSection.Community} entityTypeName={entityTypeName}>
      <CommunityUpdatesContainer entities={{ hubId, communityId }}>
        {({ messages, senders }, actions, loading) => (
          <AvatarsProvider users={senders}>
            {populatedUsers => (
              <CommunityPageView
                messages={messages}
                messagesLoading={loading.retrievingUpdateMessages}
                authors={populatedUsers}
              >
                {children}
              </CommunityPageView>
            )}
          </AvatarsProvider>
        )}
      </CommunityUpdatesContainer>
    </PageLayout>
  );
};

export default CommunityPage;
