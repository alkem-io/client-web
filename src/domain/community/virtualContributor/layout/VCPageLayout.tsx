import { PropsWithChildren } from 'react';
import TopLevelPageBreadcrumbs from '@/main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import { AssignmentIndOutlined } from '@mui/icons-material';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import { useTranslation } from 'react-i18next';
import VCPageBanner from './VCPageBanner';
import { useVirtualContributorQuery } from '@/core/apollo/generated/apollo-hooks';
import useUrlResolver from '@/main/urlResolver/useUrlResolver';

interface VCPageLayoutProps {}

const VCPageLayout = ({ ...props }: PropsWithChildren<VCPageLayoutProps>) => {
  const { vcId } = useUrlResolver();
  const { data, loading } = useVirtualContributorQuery({
    variables: { id: vcId! },
    skip: !vcId,
  });
  const vc = data?.lookup.virtualContributor;

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
            avatar={vc?.profile.avatar}
            iconComponent={AssignmentIndOutlined}
            uri={vc?.profile.url ?? ''}
          >
            {vc?.profile.displayName}
          </BreadcrumbsItem>
        </TopLevelPageBreadcrumbs>
      }
      header={<VCPageBanner />}
      {...props}
    />
  );
};

export default VCPageLayout;
