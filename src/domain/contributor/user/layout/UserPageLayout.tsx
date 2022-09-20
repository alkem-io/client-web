import { EntityPageLayout, EntityPageLayoutProps } from '../../../shared/layout/PageLayout';
import UserPageBanner from './UserPageBanner';
import { PropsWithChildren } from 'react';
import UserTabs from './UserTabs';

interface UserPageLayoutProps
  extends Omit<EntityPageLayoutProps, 'pageBannerComponent' | 'tabsComponent' | 'entityTypeName'> {}

const UserPageLayout = (props: PropsWithChildren<UserPageLayoutProps>) => {
  return (
    <EntityPageLayout {...props} pageBannerComponent={UserPageBanner} tabsComponent={UserTabs} entityTypeName="user">
      {props.children}
    </EntityPageLayout>
  );
};

export default UserPageLayout;
