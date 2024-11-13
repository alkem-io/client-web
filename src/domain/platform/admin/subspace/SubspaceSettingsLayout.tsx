import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsSection } from '../layout/EntitySettingsLayout/constants';
import { TabDefinition } from '../layout/EntitySettingsLayout/EntitySettingsTabs';
import { useSubSpace } from '../../../journey/subspace/hooks/useSubSpace';
import RouterLink from '@core/ui/link/RouterLink';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ListOutlinedIcon from '@mui/icons-material/ListOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import EntitySettingsLayout from '../layout/EntitySettingsLayout/EntitySettingsLayout';
import ChildJourneyPageBanner from '../../../journey/common/childJourneyPageBanner/ChildJourneyPageBanner';
import JourneyBreadcrumbs from '../../../journey/common/journeyBreadcrumbs/JourneyBreadcrumbs';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';
import BackButton from '@core/ui/actions/BackButton';
import { SpaceLevel } from '@core/apollo/generated/graphql-schema';

interface SubspaceSettingsLayoutProps {
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
}

const SubspaceSettingsLayout: FC<SubspaceSettingsLayoutProps> = props => {
  const entityAttrs = useSubSpace();

  const { t } = useTranslation();

  const { journeyId, journeyPath, spaceLevel } = useRouteResolver();

  const tabs = useMemo(() => {
    const tabs: TabDefinition<SettingsSection>[] = [
      {
        section: SettingsSection.Profile,
        route: 'profile',
        icon: PeopleOutlinedIcon,
      },
      {
        section: SettingsSection.Context,
        route: 'context',
        icon: ListOutlinedIcon,
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

    if (spaceLevel === SpaceLevel.Challenge) {
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
      pageBanner={<ChildJourneyPageBanner journeyId={journeyId} />}
      breadcrumbs={<JourneyBreadcrumbs journeyPath={journeyPath} settings />}
      backButton={
        <RouterLink to={entityAttrs.profile.url} sx={{ alignSelf: 'center', marginLeft: 'auto' }}>
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
