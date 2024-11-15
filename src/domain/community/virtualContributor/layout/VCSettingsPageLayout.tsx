import React, { PropsWithChildren } from 'react';
import TopLevelPageBreadcrumbs from '../../../../main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import { AssignmentIndOutlined } from '@mui/icons-material';
import { useUrlParams } from '@/core/routing/useUrlParams';
import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import { useTranslation } from 'react-i18next';
import VCPageBanner from './VCPageBanner';
import { useVirtualContributorQuery } from '@/core/apollo/generated/apollo-hooks';
import { SettingsSection, VCProfileTabs } from '../../../platform/admin/layout/EntitySettingsLayout/constants';
import EntitySettingsLayout from '../../../platform/admin/layout/EntitySettingsLayout/EntitySettingsLayout';
import useRestrictedRedirect from '@/core/routing/useRestrictedRedirect';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

interface VCPageLayoutProps {
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
}

const tabs = [SettingsSection.MyProfile, SettingsSection.Membership, SettingsSection.Settings].map(section => {
  return VCProfileTabs.find(tab => tab.section === section)!;
});

const VCSettingsPageLayout = ({ ...props }: PropsWithChildren<VCPageLayoutProps>) => {
  const { vcNameId = '' } = useUrlParams();

  const { data, loading, error } = useVirtualContributorQuery({
    variables: {
      id: vcNameId,
    },
  });

  const { t } = useTranslation();

  const entityAttrs = {
    displayName: data?.virtualContributor.profile.displayName || '',
    userNameId: data?.virtualContributor.nameID || '',
  };

  useRestrictedRedirect({ data, error }, data => data.virtualContributor.authorization?.myPrivileges, {
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
            avatar={data?.virtualContributor.profile.avatar}
            iconComponent={AssignmentIndOutlined}
            uri={data?.virtualContributor.profile.url ?? ''}
          >
            {data?.virtualContributor.profile.displayName}
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
