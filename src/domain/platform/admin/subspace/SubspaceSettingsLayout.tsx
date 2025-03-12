import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import BackButton from '@/core/ui/actions/BackButton';
import RouterLink from '@/core/ui/link/RouterLink';
import ChildJourneyPageBanner from '@/domain/journey/common/childJourneyPageBanner/ChildJourneyPageBanner';
import JourneyBreadcrumbs from '@/domain/journey/common/journeyBreadcrumbs/JourneyBreadcrumbs';
import { useSubSpace } from '@/domain/journey/subspace/hooks/useSubSpace';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import { FC, PropsWithChildren, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import EntitySettingsLayout from '../layout/EntitySettingsLayout/EntitySettingsLayout';
import { TabDefinition } from '../layout/EntitySettingsLayout/EntitySettingsTabs';
import { SettingsSection } from '../layout/EntitySettingsLayout/SettingsSection';

interface SubspaceSettingsLayoutProps extends PropsWithChildren {
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
}

const SubspaceSettingsLayout: FC<SubspaceSettingsLayoutProps> = props => {
  const entityAttrs = useSubSpace();

  const { t } = useTranslation();
  const { spaceId, spaceLevel, journeyPath, levelZeroSpaceId } = useUrlResolver();

  const tabs = useMemo(() => {
    const tabs: TabDefinition<SettingsSection>[] = [
      {
        section: SettingsSection.About,
        route: 'about',
        icon: PeopleOutlinedIcon,
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
    ];

    if (spaceLevel === SpaceLevel.L1) {
      tabs.push({
        section: SettingsSection.Subsubspaces,
        route: 'opportunities',
        icon: FlagOutlinedIcon,
      });
    }

    tabs.push({
      section: SettingsSection.SpaceSettings,
      route: 'settings',
      icon: GppGoodOutlinedIcon,
    });

    return tabs;
  }, [spaceLevel]);

  return (
    <EntitySettingsLayout
      entityTypeName="subspace"
      subheaderTabs={tabs}
      pageBanner={<ChildJourneyPageBanner journeyId={spaceId} levelZeroSpaceId={levelZeroSpaceId} />}
      breadcrumbs={<JourneyBreadcrumbs journeyPath={journeyPath} settings />}
      backButton={
        <RouterLink to={entityAttrs.about.profile.url} sx={{ alignSelf: 'center', marginLeft: 'auto' }}>
          <BackButton variant="outlined" sx={{ textTransform: 'capitalize' }}>
            {t('navigation.admin.settingsMenu.quit')}
          </BackButton>
        </RouterLink>
      }
      {...entityAttrs}
      {...props}
    />
  );
};

export default SubspaceSettingsLayout;
