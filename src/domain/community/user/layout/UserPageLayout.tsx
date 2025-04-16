import { PropsWithChildren } from 'react';
import TopLevelPageBreadcrumbs from '@/main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import { AssignmentIndOutlined } from '@mui/icons-material';
import UserPageBanner from './UserPageBanner';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { useUserMetadata } from '../../../../_deprecated/useUserMetadata';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import { useTranslation } from 'react-i18next';

interface UserPageLayoutProps {}

const UserPageLayout = ({ ...props }: PropsWithChildren<UserPageLayoutProps>) => {
  const { userId, loading: urlResolverLoading } = useUrlResolver();
  const { user, loading } = useUserMetadata(userId);

  const { t } = useTranslation();

  return (
    <TopLevelLayout
      breadcrumbs={
        <TopLevelPageBreadcrumbs>
          <BreadcrumbsItem uri="/contributors" iconComponent={GroupOutlinedIcon}>
            {t('pages.contributors.shortName')}
          </BreadcrumbsItem>
          <BreadcrumbsItem
            loading={urlResolverLoading || loading || !user}
            avatar={user?.profile.avatar}
            iconComponent={AssignmentIndOutlined}
            uri={user?.profile.url}
          >
            {user?.profile.displayName}
          </BreadcrumbsItem>
        </TopLevelPageBreadcrumbs>
      }
      header={<UserPageBanner />}
      {...props}
    />
  );
};

export default UserPageLayout;
