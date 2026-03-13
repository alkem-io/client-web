import type { PropsWithChildren } from 'react';
import { useVirtualContributorQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import useRestrictedRedirect from '@/core/routing/useRestrictedRedirect';
import EntitySettingsLayout from '@/domain/platformAdmin/layout/EntitySettingsLayout/EntitySettingsLayout';
import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { VCProfileTabs } from '../VcAdminTabs';

type VCPageLayoutProps = {
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
};

const tabs = [SettingsSection.MyProfile, SettingsSection.Membership, SettingsSection.Settings].map(
  section => VCProfileTabs.find(tab => tab.section === section)!
);

const VCSettingsPageLayout = ({ ...props }: PropsWithChildren<VCPageLayoutProps>) => {
  const { vcId, loading: urlResolverLoading } = useUrlResolver();

  const { data, loading, error } = useVirtualContributorQuery({
    variables: { id: vcId! },
    skip: !vcId,
  });

  useRestrictedRedirect(
    { data, error, skip: urlResolverLoading || loading },
    data => data.lookup.virtualContributor?.authorization?.myPrivileges,
    {
      requiredPrivilege: AuthorizationPrivilege.Update,
    }
  );

  return <EntitySettingsLayout entityTypeName="user" subheaderTabs={tabs} {...props} />;
};

export default VCSettingsPageLayout;
