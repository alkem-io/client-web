import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import SubspaceSettingsLayout from '@/domain/platform/admin/subspace/SubspaceSettingsLayout';
import SubspaceProfileView from '@/domain/journey/subspace/pages/SubspaceProfile/SubspaceProfileView';
import useUrlResolver from '@/main/urlResolver/useUrlResolver';

const OpportunityProfilePage = ({ routePrefix = '../' }: SettingsPageProps) => {
  const { spaceId } = useUrlResolver();
  return (
    <SubspaceSettingsLayout currentTab={SettingsSection.Profile} tabRoutePrefix={routePrefix}>
      <SubspaceProfileView subspaceId={spaceId} />
    </SubspaceSettingsLayout>
  );
};

export default OpportunityProfilePage;
