import { EntityPageLayout, EntityPageLayoutProps } from '../../../journey/common/EntityPageLayout';
import UserPageBanner from './UserPageBanner';
import { PropsWithChildren } from 'react';
import UserTabs from './UserTabs';
import TopLevelPageBreadcrumbs from '../../../../main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import { useUserContext } from '../hooks/useUserContext';
import { AssignmentIndOutlined } from '@mui/icons-material';

interface UserPageLayoutProps
  extends Omit<EntityPageLayoutProps, 'pageBannerComponent' | 'tabsComponent' | 'entityTypeName'> {}

const UserPageLayout = (props: PropsWithChildren<UserPageLayoutProps>) => {
  const { user, loadingMe } = useUserContext();

  return (
    <EntityPageLayout
      breadcrumbs={
        <TopLevelPageBreadcrumbs
          loading={loadingMe}
          avatar={user?.user.profile.visual}
          iconComponent={AssignmentIndOutlined}
        >
          {user?.user.profile.displayName}
        </TopLevelPageBreadcrumbs>
      }
      pageBannerComponent={UserPageBanner}
      tabsComponent={UserTabs}
      {...props}
    />
  );
};

export default UserPageLayout;
