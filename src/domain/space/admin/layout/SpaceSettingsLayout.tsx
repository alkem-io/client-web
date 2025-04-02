import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsSection } from '../../../platform/admin/layout/EntitySettingsLayout/SettingsSection';
import RouterLink from '@/core/ui/link/RouterLink';
import EntitySettingsLayout from '../../../platform/admin/layout/EntitySettingsLayout/EntitySettingsLayout';
import SpaceTabs from '@/domain/space/layout/tabbedLayout/Tabs/SpaceTabs';
import useInnovationHubJourneyBannerRibbon from '@/domain/innovationHub/InnovationHubJourneyBannerRibbon/useInnovationHubJourneyBannerRibbon';
import SpacePageBanner from '@/domain/space/layout/tabbedLayout/layout/SpacePageBanner';
import SpaceBreadcrumbs from '@/domain/space/components/spaceBreadcrumbs/SpaceBreadcrumbs';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import BackButton from '@/core/ui/actions/BackButton';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { useSpaceAboutDetailsQuery } from '@/core/apollo/generated/apollo-hooks';
import { spaceAdminTabsL0 } from './SpaceAdminTabsL0';

type SpaceSettingsLayoutProps = {
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
};

const SpaceSettingsLayout = (props: PropsWithChildren<SpaceSettingsLayoutProps>) => {
  const { t } = useTranslation();
  const { spaceId, journeyPath, loading: resolvingSpace } = useUrlResolver();
  const { data: spaceData, loading: loadingSpace } = useSpaceAboutDetailsQuery({
    variables: { spaceId: spaceId! },
    skip: !spaceId,
  });
  const profile = spaceData?.lookup.space?.about.profile;
  const ribbon = useInnovationHubJourneyBannerRibbon({
    spaceId,
  });

  const loading = resolvingSpace || loadingSpace;

  const spaceBannerElement = (
    <SpacePageBanner
      title={profile?.displayName}
      tagline={profile?.tagline}
      loading={loading}
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
