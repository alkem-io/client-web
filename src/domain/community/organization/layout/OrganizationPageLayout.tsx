import OrganizationPageBanner from '@/domain/community/contributor/organization/OrganizationPageBanner';
import React, { PropsWithChildren } from 'react';
import TopLevelPageBreadcrumbs from '@/main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import { Diversity3Outlined } from '@mui/icons-material';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import OrganizationPageContainer from '../../contributor/organization/OrganizationPageContainer/OrganizationPageContainer';
import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';
import { useTranslation } from 'react-i18next';

interface OrganizationPageLayoutProps {}

const OrganizationPageLayout = (props: PropsWithChildren<OrganizationPageLayoutProps>) => {
  const { t } = useTranslation();

  return (
    <OrganizationPageContainer>
      {({ organization, permissions, handleSendMessage }, { loading }) => (
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
      )}
    </OrganizationPageContainer>
  );
};

export default OrganizationPageLayout;
