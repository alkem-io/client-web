import OrganizationPageBanner from '@/domain/community/organization/OrganizationPageBanner';
import React, { PropsWithChildren } from 'react';
import TopLevelPageBreadcrumbs from '@/main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import { Diversity3Outlined } from '@mui/icons-material';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';
import { useTranslation } from 'react-i18next';
import useOrganizationProvider from '../useOrganization/useOrganization';
import { usePageTitle } from '@/core/routing/usePageTitle';

interface OrganizationPageLayoutProps {}

const OrganizationPageLayout = (props: PropsWithChildren<OrganizationPageLayoutProps>) => {
  const { t } = useTranslation();

  const { loading, organization, permissions, handleSendMessage } = useOrganizationProvider();

  // Set browser tab title to "[Organization Name] | Alkemio"
  usePageTitle(organization?.profile.displayName);

  return (
    <TopLevelLayout
      breadcrumbs={
        <TopLevelPageBreadcrumbs>
          <BreadcrumbsItem iconComponent={Diversity3Outlined}>{t('common.organizations')}</BreadcrumbsItem>
          <BreadcrumbsItem
            loading={loading}
            avatar={organization?.profile.avatar}
            iconComponent={Diversity3Outlined}
            uri={organization?.profile.url}
          >
            {organization?.profile.displayName}
          </BreadcrumbsItem>
        </TopLevelPageBreadcrumbs>
      }
      header={
        <OrganizationPageBanner
          organization={organization}
          canEdit={permissions.canEdit}
          onSendMessage={handleSendMessage}
          loading={loading}
        />
      }
      {...props}
    />
  );
};

export default OrganizationPageLayout;
