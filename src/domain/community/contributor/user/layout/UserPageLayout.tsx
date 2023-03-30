import { JourneyPageLayout, EntityPageLayoutProps } from '../../../../challenge/common/JourneyPageLayout';
import UserPageBanner from './UserPageBanner';
import { PropsWithChildren } from 'react';
import UserTabs from './UserTabs';

interface UserPageLayoutProps
  extends Omit<EntityPageLayoutProps, 'pageBannerComponent' | 'tabsComponent' | 'entityTypeName'> {}

const UserPageLayout = (props: PropsWithChildren<UserPageLayoutProps>) => {
  return (
    <JourneyPageLayout {...props} pageBannerComponent={UserPageBanner} tabsComponent={UserTabs} entityTypeName="user">
      {props.children}
    </JourneyPageLayout>
  );
};

export default UserPageLayout;
