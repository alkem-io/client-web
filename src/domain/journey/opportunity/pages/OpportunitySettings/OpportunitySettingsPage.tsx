import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import SubspaceSettingsLayout from '@/domain/platform/admin/subspace/SubspaceSettingsLayout';
import OpportunitySettingsView from './OpportunitySettingsView';

const OpportunitySettingsPage = ({ routePrefix = '../' }: SettingsPageProps) => (
  <SubspaceSettingsLayout currentTab={SettingsSection.SpaceSettings} tabRoutePrefix={routePrefix}>
    <OpportunitySettingsView />
  </SubspaceSettingsLayout>
);

export default OpportunitySettingsPage;
