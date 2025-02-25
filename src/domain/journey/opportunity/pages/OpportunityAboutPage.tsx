import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import SubspaceSettingsLayout from '@/domain/platform/admin/subspace/SubspaceSettingsLayout';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import Loading from '@/core/ui/loading/Loading';
import SpaceAbout from '@/domain/journey/space/pages/SpaceAbout/SpaceAbout';

const OpportunityAboutPage = ({ routePrefix = '../' }: SettingsPageProps) => {
  const { spaceId, loading } = useUrlResolver();

  return (
    <SubspaceSettingsLayout currentTab={SettingsSection.About} tabRoutePrefix={routePrefix}>
      {loading ? <Loading /> : <SpaceAbout spaceId={spaceId} />}
    </SubspaceSettingsLayout>
  );
};

export default OpportunityAboutPage;
