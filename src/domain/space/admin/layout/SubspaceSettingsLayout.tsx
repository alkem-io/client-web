import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import BackButton from '@/core/ui/actions/BackButton';
import RouterLink from '@/core/ui/link/RouterLink';
import SubspacePageBanner from '@/domain/space/components/SubspacePageBanner/SubspacePageBanner';
import SpaceBreadcrumbs from '@/domain/space/components/spaceBreadcrumbs/SpaceBreadcrumbs';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import EntitySettingsLayout from '@/domain/platform/admin/layout/EntitySettingsLayout/EntitySettingsLayout';
import { TabDefinition } from '@/domain/platform/admin/layout/EntitySettingsLayout/EntitySettingsTabs';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import { FC, PropsWithChildren, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

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

  const spaceBannerElement = <SubspacePageBanner journeyId={spaceId} levelZeroSpaceId={levelZeroSpaceId} />;

  const spaceBackButtonElement = (
    <RouterLink to={entityAttrs.subspace.about.profile.url} sx={{ alignSelf: 'center', marginLeft: 'auto' }}>
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
      {...entityAttrs}
      {...props}
    />
  );
};

export default SubspaceSettingsLayout;
