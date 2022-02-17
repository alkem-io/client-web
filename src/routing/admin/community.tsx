import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { CommunityCredentials } from '../../components/Admin/Authorization/EditCommunityMembers';
import CommunityPage from '../../components/Admin/Community/CommunityPage';
import { WithCommunity } from '../../components/Admin/Community/CommunityTypes';
import { CreateCommunityGroup } from '../../components/Admin/Community/CreateCommunityGroup';
import LeadingOrganizationPage from '../../components/Admin/Community/LeadingOrganizationPage';
import { Error404, PageProps } from '../../pages';
import CommunityGroupListPage from '../../pages/Admin/Community/CommunityListPage';
import CommunityUpdatesPage from '../../pages/Admin/Community/CommunityUpdatesPage';
import { nameOfUrl } from '../url-params';
import { ChallengeApplicationRoute } from './challenge/ChallengeApplicationRoute';
import { HubApplicationRoute } from './hub/HubApplicationRoute';
import { HubGroupRoute } from './hub/HubGroupRoute';

type AccessedFrom = 'hub' | 'challenge' | 'opportunity';

interface CommunityRouteProps extends PageProps, WithCommunity {
  credential: CommunityCredentials;
  resourceId: string;
  accessedFrom: AccessedFrom;
}

export const CommunityRoute: FC<CommunityRouteProps> = ({
  paths,
  communityId,
  parentCommunityId,
  credential,
  resourceId,
  accessedFrom,
}) => {
  return (
    <Routes>
      <Route
        path={'members'}
        element={
          <CommunityPage
            paths={paths}
            credential={credential}
            resourceId={resourceId}
            communityId={communityId}
            parentCommunityId={parentCommunityId}
          />
        }
      />
      <Route
        path={'groups/*'}
        element={<CommunityGroupsRoute paths={paths} communityId={communityId} parentCommunityId={parentCommunityId} />}
      />
      <Route
        path={'applications/*'}
        element={
          <>
            {accessedFrom === 'hub' && <HubApplicationRoute paths={paths} />}
            {accessedFrom === 'challenge' && <ChallengeApplicationRoute paths={paths} />}
          </>
        }
      />
      <Route path={'updates'} element={<CommunityUpdatesPage paths={paths} communityId={communityId} />} />
      <Route path={'lead'} element={<LeadingOrganizationPage paths={paths} />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};

interface CommunityGroupsRouteProps extends PageProps, WithCommunity {}

export const CommunityGroupsRoute: FC<CommunityGroupsRouteProps> = ({ paths, communityId, parentCommunityId }) => {
  const { pathname: url } = useResolvedPath('.');
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'groups', real: true }], [paths, url]);

  return (
    <Routes>
      <Route path={'/'} element={<CommunityGroupListPage communityId={communityId || ''} paths={currentPaths} />} />
      <Route path={'new'} element={<CreateCommunityGroup paths={currentPaths} communityId={communityId} />} />
      <Route
        path={`:${nameOfUrl.groupId}/*`}
        element={<HubGroupRoute paths={currentPaths} parentCommunityId={parentCommunityId} />}
      />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
