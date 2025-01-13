import { PropsWithChildren } from 'react';
import TopLevelPageBreadcrumbs from '@/main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import { AssignmentIndOutlined } from '@mui/icons-material';
import { useUrlParams } from '@/core/routing/useUrlParams';
import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import { useTranslation } from 'react-i18next';
import VCPageBanner from '../../virtualContributor/layout/VCPageBanner';
import { useVirtualContributorQuery } from '@/core/apollo/generated/apollo-hooks';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import EntitySettingsLayout from '@/domain/platform/admin/layout/EntitySettingsLayout/EntitySettingsLayout';
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
  const { vcNameId = '' } = useUrlParams();

  const { data, loading, error } = useVirtualContributorQuery({ variables: { id: vcNameId } });

  const { t } = useTranslation();

  const entityAttrs = {
    displayName: data?.lookup.virtualContributor?.profile.displayName ?? '',
    userNameId: data?.lookup.virtualContributor?.nameID ?? '',
  };

  useRestrictedRedirect({ data, error }, data => data.lookup.virtualContributor?.authorization?.myPrivileges, {
    requiredPrivilege: AuthorizationPrivilege.Update,
  });

  return (
    <EntitySettingsLayout
      breadcrumbs={
        <TopLevelPageBreadcrumbs>
          <BreadcrumbsItem uri="/contributors" iconComponent={GroupOutlinedIcon}>
            {t('pages.contributors.shortName')}
          </BreadcrumbsItem>
          <BreadcrumbsItem
            loading={loading}
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
      pageBannerComponent={VCPageBanner}
      {...entityAttrs}
      {...props}
    />
  );
};

export default VCSettingsPageLayout;
