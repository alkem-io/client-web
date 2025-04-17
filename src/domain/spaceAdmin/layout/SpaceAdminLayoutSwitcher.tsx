import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import SpaceSettingsLayout from './SpaceAdminLayoutSpace';
import SubspaceSettingsLayout from './SpaceAdminLayoutSubspace';

export type SpaceAdminLayoutSwitcherProps = {
  useL0Layout: boolean;
  children: React.ReactNode;
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
};

const LayoutSwitcher: React.FC<SpaceAdminLayoutSwitcherProps> = ({
  useL0Layout,
  children,
  tabRoutePrefix,
  currentTab,
}) => {
  if (useL0Layout) {
    return (
      <SpaceSettingsLayout currentTab={currentTab} tabRoutePrefix={tabRoutePrefix}>
        {children}
      </SpaceSettingsLayout>
    );
  }
  return (
    <SubspaceSettingsLayout currentTab={currentTab} tabRoutePrefix={tabRoutePrefix}>
      {children}
    </SubspaceSettingsLayout>
  );
};

export default LayoutSwitcher;
