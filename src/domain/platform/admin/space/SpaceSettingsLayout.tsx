import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsSection } from '../layout/EntitySettingsLayout/SettingsSection';
import { TabDefinition } from '../layout/EntitySettingsLayout/EntitySettingsTabs';
import RouterLink from '@/core/ui/link/RouterLink';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import WbIncandescentOutlinedIcon from '@mui/icons-material/WbIncandescentOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import EntitySettingsLayout from '../layout/EntitySettingsLayout/EntitySettingsLayout';
import SpaceTabs from '@/domain/space/layout/TabbedSpaceL0/Tabs/SpaceTabs';
import useInnovationHubJourneyBannerRibbon from '@/domain/innovationHub/InnovationHubJourneyBannerRibbon/useInnovationHubJourneyBannerRibbon';
import SpacePageBanner from '@/domain/journey/space/layout/SpacePageBanner';
import JourneyBreadcrumbs from '@/domain/journey/common/journeyBreadcrumbs/JourneyBreadcrumbs';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import BackButton from '@/core/ui/actions/BackButton';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { useSpaceAboutDetailsQuery } from '@/core/apollo/generated/apollo-hooks';

type SpaceSettingsLayoutProps = {
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
};

const tabs: TabDefinition<SettingsSection>[] = [
  {
    section: SettingsSection.About,
    route: 'about',
    icon: AssignmentIndOutlinedIcon,
  },
  {
    section: SettingsSection.Layout,
    route: 'layout',
    icon: DashboardOutlinedIcon,
  },
  {
    section: SettingsSection.Community,
    route: 'community',
    icon: PeopleOutlinedIcon,
  },
  {
    section: SettingsSection.Communications,
    route: 'communications',
    icon: ForumOutlinedIcon,
  },
  {
    section: SettingsSection.Subspaces,
    route: 'challenges',
    icon: FlagOutlinedIcon,
  },
  {
    section: SettingsSection.Templates,
    route: 'templates',
    icon: WbIncandescentOutlinedIcon,
  },
  {
    section: SettingsSection.Storage,
    route: 'storage',
    icon: Inventory2OutlinedIcon,
  },
  {
    section: SettingsSection.SpaceSettings,
    route: 'settings',
    icon: GppGoodOutlinedIcon,
  },
  {
    section: SettingsSection.Account,
    route: 'account',
    icon: LocalOfferOutlinedIcon,
  },
];

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

  return (
    <EntitySettingsLayout
      entityTypeName="space"
      subheaderTabs={tabs}
      pageBanner={
        <SpacePageBanner
          title={profile?.displayName}
          tagline={profile?.tagline}
          loading={loading}
          bannerUrl={profile?.banner?.uri}
          bannerAltText={profile?.banner?.alternativeText}
          ribbon={ribbon}
        />
      }
      tabsComponent={SpaceTabs}
      breadcrumbs={<JourneyBreadcrumbs journeyPath={journeyPath} settings />}
      backButton={
        <RouterLink
          to={`${profile?.url}/${EntityPageSection.Dashboard}`}
          sx={{ alignSelf: 'center', marginLeft: 'auto' }}
        >
          <BackButton variant="outlined" sx={{ textTransform: 'capitalize' }}>
            {t('navigation.admin.settingsMenu.quit')}
          </BackButton>
        </RouterLink>
      }
      {...props}
    />
  );
};

export default SpaceSettingsLayout;
