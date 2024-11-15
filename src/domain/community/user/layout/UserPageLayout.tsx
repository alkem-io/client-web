import React, { PropsWithChildren } from 'react';
import TopLevelPageBreadcrumbs from '../../../../main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import { AssignmentIndOutlined } from '@mui/icons-material';
import UserPageBanner from './UserPageBanner';
import { useUrlParams } from '@/core/routing/useUrlParams';
import { useUserMetadata } from '../hooks/useUserMetadata';
import { buildUserProfileUrl } from '../../../../main/routing/urlBuilders';
import TopLevelLayout from '../../../../main/ui/layout/TopLevelLayout';
import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import { useTranslation } from 'react-i18next';

interface UserPageLayoutProps {}

const UserPageLayout = ({ ...props }: PropsWithChildren<UserPageLayoutProps>) => {
  const { userNameId } = useUrlParams();

  if (!userNameId) {
    throw new Error('User nameID not present');
  }

  const { user, loading } = useUserMetadata(userNameId);

  const { t } = useTranslation();

  return (
    <TopLevelLayout
      breadcrumbs={
        <TopLevelPageBreadcrumbs>
          <BreadcrumbsItem uri="/contributors" iconComponent={GroupOutlinedIcon}>
            {t('pages.contributors.shortName')}
          </BreadcrumbsItem>
          <BreadcrumbsItem
            loading={loading}
            avatar={user?.user.profile.avatar}
            iconComponent={AssignmentIndOutlined}
            uri={buildUserProfileUrl(userNameId)}
          >
            {user?.user.profile.displayName}
          </BreadcrumbsItem>
        </TopLevelPageBreadcrumbs>
      }
      header={<UserPageBanner />}
      {...props}
    />
  );
};

export default UserPageLayout;
