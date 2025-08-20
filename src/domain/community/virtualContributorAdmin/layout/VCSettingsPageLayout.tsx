import { PropsWithChildren } from 'react';
import TopLevelPageBreadcrumbs from '@/main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import { AssignmentIndOutlined } from '@mui/icons-material';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import { useTranslation } from 'react-i18next';
import { useVirtualContributorQuery } from '@/core/apollo/generated/apollo-hooks';
import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import EntitySettingsLayout from '@/domain/platformAdmin/layout/EntitySettingsLayout/EntitySettingsLayout';
import useRestrictedRedirect from '@/core/routing/useRestrictedRedirect';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
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

  const { t } = useTranslation();

  useRestrictedRedirect(
    { data, error, skip: urlResolverLoading || loading },
    data => data.lookup.virtualContributor?.authorization?.myPrivileges,
    {
      requiredPrivilege: AuthorizationPrivilege.Update,
    }
  );

  return (
    <EntitySettingsLayout
      breadcrumbs={
        <TopLevelPageBreadcrumbs>
          <BreadcrumbsItem uri="/contributors" iconComponent={GroupOutlinedIcon}>
            {t('pages.contributors.shortName')}
          </BreadcrumbsItem>
          <BreadcrumbsItem
            loading={urlResolverLoading || loading}
            avatar={data?.lookup.virtualContributor?.profile.avatar}
            iconComponent={AssignmentIndOutlined}
            uri={data?.lookup.virtualContributor?.profile.url ?? ''}
          >
            {data?.lookup.virtualContributor?.profile.displayName}
          </BreadcrumbsItem>
        </TopLevelPageBreadcrumbs>
      }
      entityTypeName="user"
      subheaderTabs={tabs}
      {...props}
    />
  );
};

export default VCSettingsPageLayout;
