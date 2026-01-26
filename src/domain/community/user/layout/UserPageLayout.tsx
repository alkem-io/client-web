import { PropsWithChildren } from 'react';
import TopLevelPageBreadcrumbs from '@/main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import { AssignmentIndOutlined } from '@mui/icons-material';
import UserPageBanner from './UserPageBanner';
import { useUserProvider } from '../hooks/useUserProvider';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Settings } from '@mui/icons-material';
import useUserRouteContext from '../routing/useUserRouteContext';

interface UserPageLayoutProps {}

const UserPageLayout = ({ ...props }: PropsWithChildren<UserPageLayoutProps>) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { userId, loading: routeLoading, getProfileUrl } = useUserRouteContext();
  const { userModel: user, loading } = useUserProvider(userId);

  const settings = pathname.split('/').includes('settings');

  return (
    <TopLevelLayout
      breadcrumbs={
        <TopLevelPageBreadcrumbs>
          <BreadcrumbsItem uri="/contributors" iconComponent={GroupOutlinedIcon}>
            {t('pages.contributors.shortName')}
          </BreadcrumbsItem>
          <BreadcrumbsItem
            loading={routeLoading || loading || !user}
            avatar={user?.profile.avatar}
            iconComponent={AssignmentIndOutlined}
            uri={getProfileUrl(user?.profile.url)}
          >
            {user?.profile.displayName}
          </BreadcrumbsItem>
          {settings && (
            <BreadcrumbsItem iconComponent={Settings} aria-label={t('common.settings')}>
              {t('common.settings')}
            </BreadcrumbsItem>
          )}
        </TopLevelPageBreadcrumbs>
      }
      header={<UserPageBanner />}
      {...props}
    />
  );
};

export default UserPageLayout;
