import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsSection } from '../../platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import RouterLink from '@/core/ui/link/RouterLink';
import EntitySettingsLayout from '../../platformAdmin/layout/EntitySettingsLayout/EntitySettingsLayout';
import BackButton from '@/core/ui/actions/BackButton';
import { spaceAdminTabsL0 } from './SpaceAdminTabsL0';
import { useSpace } from '../../space/context/useSpace';

type SpaceSettingsLayoutProps = {
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
};

const SpaceSettingsLayout = (props: PropsWithChildren<SpaceSettingsLayoutProps>) => {
  const { t } = useTranslation();
  const { space } = useSpace();
  const { about } = space;
  const profile = about.profile;

  const spaceBackButtonElement = (
    <RouterLink to={profile?.url} sx={{ alignSelf: 'center', marginLeft: 'auto' }}>
      <BackButton variant="outlined" sx={{ textTransform: 'capitalize' }}>
        {t('navigation.admin.settingsMenu.quit')}
      </BackButton>
    </RouterLink>
  );

  return (
    <EntitySettingsLayout
      entityTypeName="space"
      subheaderTabs={spaceAdminTabsL0}
      backButton={spaceBackButtonElement}
      {...props}
    />
  );
};

export default SpaceSettingsLayout;
