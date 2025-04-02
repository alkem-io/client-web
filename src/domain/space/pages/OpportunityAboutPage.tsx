import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import Loading from '@/core/ui/loading/Loading';
import SpaceAboutEdit from '@/domain/space/admin/SpaceAboutSettings/SpaceAboutEdit';
import SubspaceSettingsLayout from '@/domain/space/admin/layout/SubspaceSettingsLayout';

const OpportunityAboutPage = ({ routePrefix = '../' }: SettingsPageProps) => {
  const { spaceId, loading } = useUrlResolver();

  return (
    <SubspaceSettingsLayout currentTab={SettingsSection.About} tabRoutePrefix={routePrefix}>
      {loading ? <Loading /> : <SpaceAboutEdit spaceId={spaceId} />}
    </SubspaceSettingsLayout>
  );
};

export default OpportunityAboutPage;
