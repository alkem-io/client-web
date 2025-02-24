import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import SubspaceSettingsLayout from '@/domain/platform/admin/subspace/SubspaceSettingsLayout';
import SubspaceProfileView from '@/domain/journey/subspace/pages/SubspaceProfile/SubspaceProfileView';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import OpportunityContextView from '@/domain/platform/admin/opportunity/pages/OpportunityContext/OpportunityContextView';

const OpportunityProfilePage = ({ routePrefix = '../' }: SettingsPageProps) => {
  const { spaceId } = useUrlResolver();
  return (
    <SubspaceSettingsLayout currentTab={SettingsSection.About} tabRoutePrefix={routePrefix}>
      <SubspaceProfileView subspaceId={spaceId} />
      <OpportunityContextView />
    </SubspaceSettingsLayout>
  );
};

export default OpportunityProfilePage;
