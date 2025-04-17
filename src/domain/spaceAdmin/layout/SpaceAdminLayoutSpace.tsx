import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsSection } from '../../platform/admin/layout/EntitySettingsLayout/SettingsSection';
import RouterLink from '@/core/ui/link/RouterLink';
import EntitySettingsLayout from '../../platform/admin/layout/EntitySettingsLayout/EntitySettingsLayout';
import SpaceTabs from '@/domain/space/layout/tabbedLayout/Tabs/SpaceTabs';
import useInnovationHubJourneyBannerRibbon from '@/domain/innovationHub/InnovationHubJourneyBannerRibbon/useInnovationHubJourneyBannerRibbon';
import SpacePageBanner from '@/domain/space/layout/tabbedLayout/layout/SpacePageBanner';
import SpaceBreadcrumbs from '@/domain/space/components/spaceBreadcrumbs/SpaceBreadcrumbs';
import BackButton from '@/core/ui/actions/BackButton';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { spaceAdminTabsL0 } from './SpaceAdminTabsL0';
import { useSpace } from '../../space/context/useSpace';
import { JourneyPath } from '@/main/routing/urlResolver/UrlResolverProvider';

type SpaceSettingsLayoutProps = {
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
};

const SpaceSettingsLayout = (props: PropsWithChildren<SpaceSettingsLayoutProps>) => {
  const { t } = useTranslation();
  const { space } = useSpace();
  const { about } = space;
  const profile = about.profile;

  // TODO: get rid of this JourneyPath and bring it into the Space Context
  const journeyPath: JourneyPath = [space.id];

  const ribbon = useInnovationHubJourneyBannerRibbon({
    spaceId: space.id,
  });

  const spaceBannerElement = (
    <SpacePageBanner
      tagline={profile?.tagline}
      bannerUrl={profile?.banner?.uri}
      bannerAltText={profile?.banner?.alternativeText}
      ribbon={ribbon}
    />
  );

  const spaceBackButtonElement = (
    <RouterLink to={`${profile?.url}/${EntityPageSection.Dashboard}`} sx={{ alignSelf: 'center', marginLeft: 'auto' }}>
      <BackButton variant="outlined" sx={{ textTransform: 'capitalize' }}>
        {t('navigation.admin.settingsMenu.quit')}
      </BackButton>
    </RouterLink>
  );

  const spaceBreadcrumbsElement = <SpaceBreadcrumbs journeyPath={journeyPath} settings />;

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
