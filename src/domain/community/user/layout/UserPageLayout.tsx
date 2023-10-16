import { EntityPageLayout, EntityPageLayoutProps } from '../../../journey/common/EntityPageLayout';
import React, { PropsWithChildren } from 'react';
import UserTabs from './UserTabs';
import TopLevelPageBreadcrumbs from '../../../../main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import { useUserContext } from '../hooks/useUserContext';
import { AssignmentIndOutlined } from '@mui/icons-material';
import { Visual } from '../../../common/visual/Visual';
import PageBanner from '../../../../core/ui/layout/pageBanner/PageBanner';
import PageBannerCardWithVisual from '../../../journey/common/PageBanner/JourneyPageBannerCard/PageBannerCardWithVisual';
import SizeableAvatar from '../../../../core/ui/avatar/SizeableAvatar';

const banner: Visual = {
  uri: '/alkemio-banner/global-banner.jpg',
};

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
      pageBanner={
        <PageBanner
          banner={banner}
          cardComponent={PageBannerCardWithVisual}
          visual={<SizeableAvatar src={user?.user.profile.visual?.uri} />}
          title={user?.user.profile.displayName}
          subtitle={user?.user.profile.tagline}
          tags={user?.user.profile.tagset?.tags}
        />
      }
      tabsComponent={UserTabs}
      {...props}
    />
  );
};

export default UserPageLayout;
