import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import BackButton from '@/core/ui/actions/BackButton';
import RouterLink from '@/core/ui/link/RouterLink';
import SubspacePageBanner from '@/domain/space/components/SubspacePageBanner/SubspacePageBanner';
import SpaceBreadcrumbs from '@/domain/space/components/spaceBreadcrumbs/SpaceBreadcrumbs';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import EntitySettingsLayout from '@/domain/platform/admin/layout/EntitySettingsLayout/EntitySettingsLayout';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { FC, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { spaceAdminTabsL1 } from './SpaceAdminTabsL1';
import { spaceAdminTabsL2 } from './SpaceAdminTabsL2';

interface SubspaceSettingsLayoutProps extends PropsWithChildren {
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
}

const SubspaceSettingsLayout: FC<SubspaceSettingsLayoutProps> = props => {
  const subspaceContext = useSubSpace();
  const { about } = subspaceContext.subspace;

  const { t } = useTranslation();
  const { spaceId, spaceLevel, journeyPath, levelZeroSpaceId } = useUrlResolver();

  const tabs = spaceLevel === SpaceLevel.L1 ? spaceAdminTabsL1 : spaceAdminTabsL2;

  const spaceBannerElement = <SubspacePageBanner journeyId={spaceId} levelZeroSpaceId={levelZeroSpaceId} />;

  const spaceBackButtonElement = (
    <RouterLink to={about.profile.url} sx={{ alignSelf: 'center', marginLeft: 'auto' }}>
      <BackButton variant="outlined" sx={{ textTransform: 'capitalize' }}>
        {t('navigation.admin.settingsMenu.quit')}
      </BackButton>
    </RouterLink>
  );

  const spaceBreadcrumbsElement = <SpaceBreadcrumbs journeyPath={journeyPath} settings />;

  return (
    <EntitySettingsLayout
      entityTypeName="subspace"
      subheaderTabs={tabs}
      pageBanner={spaceBannerElement}
      breadcrumbs={spaceBreadcrumbsElement}
      backButton={spaceBackButtonElement}
      {...subspaceContext}
      {...props}
    />
  );
};

export default SubspaceSettingsLayout;
