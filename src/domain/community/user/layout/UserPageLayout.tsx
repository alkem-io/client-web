import React, { PropsWithChildren } from 'react';
import TopLevelPageBreadcrumbs from '../../../../main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import { AssignmentIndOutlined } from '@mui/icons-material';
import UserPageBanner from './UserPageBanner';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { useUserMetadata } from '../hooks/useUserMetadata';
import { buildUserProfileUrl } from '../../../../main/routing/urlBuilders';
import TopLevelDesktopLayout from '../../../../main/ui/layout/TopLevelDesktopLayout';

interface UserPageLayoutProps {}

const UserPageLayout = (props: PropsWithChildren<UserPageLayoutProps>) => {
  const { userNameId } = useUrlParams();

  if (!userNameId) {
    throw new Error('User nameID not present');
  }

  const { user, loading } = useUserMetadata(userNameId);

  return (
    <TopLevelDesktopLayout
      breadcrumbs={
        <TopLevelPageBreadcrumbs
          loading={loading}
          avatar={user?.user.profile.visual}
          iconComponent={AssignmentIndOutlined}
          uri={buildUserProfileUrl(userNameId)}
        >
          {user?.user.profile.displayName}
        </TopLevelPageBreadcrumbs>
      }
      header={<UserPageBanner />}
      {...props}
    />
  );
};

export default UserPageLayout;
