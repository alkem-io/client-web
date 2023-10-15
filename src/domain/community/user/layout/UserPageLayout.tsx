import { EntityPageLayout, EntityPageLayoutProps } from '../../../journey/common/EntityPageLayout';
import UserPageBanner from './UserPageBanner';
import { PropsWithChildren } from 'react';
import UserTabs from './UserTabs';

interface UserPageLayoutProps
  extends Omit<EntityPageLayoutProps, 'pageBannerComponent' | 'tabsComponent' | 'entityTypeName'> {}

const UserPageLayout = (props: PropsWithChildren<UserPageLayoutProps>) => {
  return (
    <EntityPageLayout {...props} pageBannerComponent={UserPageBanner} tabsComponent={UserTabs}>
      {props.children}
    </EntityPageLayout>
  );
};

export default UserPageLayout;
