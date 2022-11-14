import React, { useMemo } from 'react';
import { buildAdminOrganizationUrl, buildOrganizationUrl } from '../../../../../common/utils/urlBuilders';
import { useOrganization } from '../../../../../hooks';
import OrganizationPageContainer from '../../../../../containers/organization/OrganizationPageContainer';
import { EntityTabsProps } from '../../../../shared/layout/PageLayout';
import ProfileTabs from '../../../../shared/layout/ProfileTabs';
import { EntityPageSection } from '../../../../shared/layout/EntityPageSection';
import { BadgeOutlined } from '@mui/icons-material';

const OrganizationTabs = (props: EntityTabsProps) => {
  const { organizationNameId } = useOrganization();

  const routes = useMemo(
    () => ({
      [EntityPageSection.Profile]: buildOrganizationUrl(organizationNameId),
      [EntityPageSection.Settings]: buildAdminOrganizationUrl(organizationNameId),
    }),
    [organizationNameId]
  );

  return (
    <OrganizationPageContainer>
      {({ permissions }) => (
        <ProfileTabs
          showSettings={permissions.canEdit}
          profileIconComponent={BadgeOutlined}
          routes={routes}
          {...props}
        />
      )}
    </OrganizationPageContainer>
  );
};

export default OrganizationTabs;
