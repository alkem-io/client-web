import { PropsWithChildren } from 'react';
import TopLevelPageBreadcrumbs from '@/main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import { AssignmentIndOutlined } from '@mui/icons-material';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import { useTranslation } from 'react-i18next';
import VCPageBanner from './VCPageBanner';
import { useVirtualContributorQuery } from '@/core/apollo/generated/apollo-hooks';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { Settings } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { usePageTitle } from '@/core/routing/usePageTitle';

interface VCPageLayoutProps {}

const VCPageLayout = ({ ...props }: PropsWithChildren<VCPageLayoutProps>) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { vcId, loading: urlResolverLoading } = useUrlResolver();
  const { data, loading } = useVirtualContributorQuery({
    variables: { id: vcId! },
    skip: !vcId,
  });
  const vc = data?.lookup.virtualContributor;

  // Set browser tab title to "[VC Name] | Alkemio"
  usePageTitle(vc?.profile.displayName);

  const settings = pathname.split('/').includes('settings');

  return (
    <TopLevelLayout
      breadcrumbs={
        <TopLevelPageBreadcrumbs>
          <BreadcrumbsItem uri="/contributors" iconComponent={GroupOutlinedIcon}>
            {t('pages.contributors.shortName')}
          </BreadcrumbsItem>
          <BreadcrumbsItem
            loading={urlResolverLoading || loading}
            avatar={vc?.profile.avatar}
            iconComponent={AssignmentIndOutlined}
            uri={vc?.profile.url ?? ''}
          >
            {vc?.profile.displayName}
          </BreadcrumbsItem>
          {settings && (
            <BreadcrumbsItem iconComponent={Settings} aria-label={t('common.settings')}>
              {t('common.settings')}
            </BreadcrumbsItem>
          )}
        </TopLevelPageBreadcrumbs>
      }
      header={<VCPageBanner />}
      {...props}
    />
  );
};

export default VCPageLayout;
