import OrganizationPageBanner from '../../../organization/layout/OrganizationPageBanner';
import React, { PropsWithChildren } from 'react';
import TopLevelPageBreadcrumbs from '../../../../../main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import { Diversity3Outlined } from '@mui/icons-material';
import { buildOrganizationUrl } from '../../../../../main/routing/urlBuilders';
import TopLevelDesktopLayout from '../../../../../main/ui/layout/TopLevelDesktopLayout';
import OrganizationPageContainer from '../OrganizationPageContainer/OrganizationPageContainer';

interface OrganizationPageLayoutProps {}

const OrganizationPageLayout = (props: PropsWithChildren<OrganizationPageLayoutProps>) => {
  return (
    <OrganizationPageContainer>
      {({ organization, permissions, handleSendMessage }, { loading }) => (
        <TopLevelDesktopLayout
          breadcrumbs={
            <TopLevelPageBreadcrumbs
              loading={loading}
              avatar={organization?.profile.avatar}
              iconComponent={Diversity3Outlined}
              uri={organization?.nameID ? buildOrganizationUrl(organization?.nameID) : ''}
            >
              {organization?.profile.displayName}
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
