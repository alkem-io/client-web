import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import SubspaceSettingsLayout from '@/domain/platform/admin/subspace/SubspaceSettingsLayout';
import SubspaceProfileView from '@/domain/journey/subspace/pages/SubspaceProfile/SubspaceProfileView';
import { useRouteResolver } from '@/main/routing/resolvers/RouteResolver';

const OpportunityProfilePage = ({ routePrefix = '../' }: SettingsPageProps) => {
  const { journeyPath } = useRouteResolver();
  const subspaceId = journeyPath[journeyPath.length - 1];
  return (
    <SubspaceSettingsLayout currentTab={SettingsSection.Profile} tabRoutePrefix={routePrefix}>
      <SubspaceProfileView subspaceId={subspaceId} />
    </SubspaceSettingsLayout>
  );
};

export default OpportunityProfilePage;
