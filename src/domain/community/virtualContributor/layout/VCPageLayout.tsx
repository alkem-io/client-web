import React, { PropsWithChildren } from 'react';
import TopLevelPageBreadcrumbs from '../../../../main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import { AssignmentIndOutlined } from '@mui/icons-material';
import { useUrlParams } from '@/core/routing/useUrlParams';
import TopLevelLayout from '../../../../main/ui/layout/TopLevelLayout';
import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import { useTranslation } from 'react-i18next';
import VCPageBanner from './VCPageBanner';
import { useVirtualContributorQuery } from '@/core/apollo/generated/apollo-hooks';

interface VCPageLayoutProps {}

const VCPageLayout = ({ ...props }: PropsWithChildren<VCPageLayoutProps>) => {
  const { vcNameId = '' } = useUrlParams();

  const { data, loading } = useVirtualContributorQuery({
    variables: {
      id: vcNameId,
    },
  });

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
            avatar={data?.virtualContributor.profile.avatar}
            iconComponent={AssignmentIndOutlined}
            uri={data?.virtualContributor.profile.url ?? ''}
          >
            {data?.virtualContributor.profile.displayName}
          </BreadcrumbsItem>
        </TopLevelPageBreadcrumbs>
      }
      header={<VCPageBanner />}
      {...props}
    />
  );
};

export default VCPageLayout;
