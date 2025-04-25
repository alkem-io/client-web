import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsSection } from '../../platform/admin/layout/EntitySettingsLayout/SettingsSection';
import RouterLink from '@/core/ui/link/RouterLink';
import EntitySettingsLayout from '../../platform/admin/layout/EntitySettingsLayout/EntitySettingsLayout';
import SpaceTabs from '@/domain/space/layout/tabbedLayout/Tabs/SpaceTabs';
import useInnovationHubBannerRibbon from '@/domain/innovationHub/InnovationHubSpaceBannerRibbon/useInnovationHubSpaceBannerRibbon';
import SpacePageBanner from '@/domain/space/layout/tabbedLayout/layout/SpacePageBanner';
import SpaceBreadcrumbs from '@/domain/space/components/spaceBreadcrumbs/SpaceBreadcrumbs';
import BackButton from '@/core/ui/actions/BackButton';
import { spaceAdminTabsL0 } from './SpaceAdminTabsL0';
import { useSpace } from '../../space/context/useSpace';
import { SpaceHierarchyPath } from '@/main/routing/urlResolver/UrlResolverProvider';

type SpaceSettingsLayoutProps = {
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
};

const SpaceSettingsLayout = (props: PropsWithChildren<SpaceSettingsLayoutProps>) => {
  const { t } = useTranslation();
  const { space } = useSpace();
  const { about } = space;
  const profile = about.profile;

  // TODO: get rid of this SpaceHierarchyPath and bring it into the Space Context
  const spaceHierarchyPath: SpaceHierarchyPath = [space.id];

  const ribbon = useInnovationHubBannerRibbon({
    spaceId: space.id,
  });

  const spaceBannerElement = (
    <SpacePageBanner
      title={profile?.displayName}
      tagline={profile?.tagline}
      bannerUrl={profile?.banner?.uri}
      bannerAltText={profile?.banner?.alternativeText}
      ribbon={ribbon}
    />
  );

  const spaceBackButtonElement = (
    <RouterLink to={profile?.url} sx={{ alignSelf: 'center', marginLeft: 'auto' }}>
      <BackButton variant="outlined" sx={{ textTransform: 'capitalize' }}>
        {t('navigation.admin.settingsMenu.quit')}
      </BackButton>
    </RouterLink>
  );

  const spaceBreadcrumbsElement = <SpaceBreadcrumbs spaceHierarchyPath={spaceHierarchyPath} settings />;

  const tabs = spaceAdminTabsL0;

  return (
    <EntitySettingsLayout
      entityTypeName="space"
      subheaderTabs={tabs}
      pageBanner={spaceBannerElement}
      tabsComponent={SpaceTabs}
      breadcrumbs={spaceBreadcrumbsElement}
      backButton={spaceBackButtonElement}
      {...props}
    />
  );
};

export default SpaceSettingsLayout;
