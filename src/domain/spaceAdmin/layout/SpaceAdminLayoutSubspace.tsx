import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import BackButton from '@/core/ui/actions/BackButton';
import RouterLink from '@/core/ui/link/RouterLink';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import EntitySettingsLayout from '@/domain/platformAdmin/layout/EntitySettingsLayout/EntitySettingsLayout';
import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
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
  const { subspace } = subspaceContext;
  const { level: spaceLevel, about } = subspace;

  const { t } = useTranslation();

  const tabs = spaceLevel === SpaceLevel.L1 ? spaceAdminTabsL1 : spaceAdminTabsL2;

  const spaceBackButtonElement = (
    <RouterLink to={about.profile.url} sx={{ alignSelf: 'center', marginLeft: 'auto' }}>
      <BackButton variant="outlined" sx={{ textTransform: 'capitalize' }}>
        {t('navigation.admin.settingsMenu.quit')}
      </BackButton>
    </RouterLink>
  );

  return (
    <EntitySettingsLayout
      entityTypeName="subspace"
      subheaderTabs={tabs}
      backButton={spaceBackButtonElement}
      {...subspaceContext}
      {...props}
    />
  );
};

export default SubspaceSettingsLayout;
