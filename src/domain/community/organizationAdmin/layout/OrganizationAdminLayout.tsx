import type { FC, PropsWithChildren } from 'react';
import { useOrganizationContext } from '@/domain/community/organization/hooks/useOrganizationContext';
import EntitySettingsLayout from '../../../platformAdmin/layout/EntitySettingsLayout/EntitySettingsLayout';
import type { SettingsSection } from '../../../platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import { organizationAdminTabs } from '../OrganizationAdminTabs';

interface OrganizationAdminLayoutProps extends PropsWithChildren {
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
}

const OrganizationAdminLayout: FC<OrganizationAdminLayoutProps> = props => {
  const entityAttrs = useOrganizationContext();

  return (
    <EntitySettingsLayout
      entityTypeName="organization"
      subheaderTabs={organizationAdminTabs}
      {...entityAttrs}
      {...props}
    />
  );
};

export default OrganizationAdminLayout;
