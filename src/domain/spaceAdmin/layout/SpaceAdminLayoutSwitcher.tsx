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
  const Layout = useL0Layout ? SpaceSettingsLayout : SubspaceSettingsLayout;
  return (
    <Layout currentTab={currentTab} tabRoutePrefix={tabRoutePrefix}>
      {children}
    </Layout>
  );
};

export default LayoutSwitcher;
